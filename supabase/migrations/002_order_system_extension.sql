-- Hemplifier Database Schema Extension
-- Order Management System Enhancement
-- Run this after 001_initial_schema.sql

-- ============================================
-- DROP AND RECREATE ORDER STATUS ENUM
-- ============================================

-- First, create new enum with full lifecycle
CREATE TYPE order_status_v2 AS ENUM (
    'placed',
    'confirmed',
    'processing',
    'shipped',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'returned'
);

-- Migrate existing orders to new status
ALTER TABLE orders
    ALTER COLUMN status TYPE order_status_v2
    USING CASE
        WHEN status::text = 'pending' THEN 'placed'::order_status_v2
        WHEN status::text = 'processing' THEN 'processing'::order_status_v2
        WHEN status::text = 'shipped' THEN 'shipped'::order_status_v2
        WHEN status::text = 'delivered' THEN 'delivered'::order_status_v2
        WHEN status::text = 'cancelled' THEN 'cancelled'::order_status_v2
        ELSE 'placed'::order_status_v2
    END;

-- Drop old enum and rename new one
DROP TYPE order_status;
ALTER TYPE order_status_v2 RENAME TO order_status;

-- ============================================
-- PAYMENT STATUS ENUM
-- ============================================

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

-- Add payment_status column to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending';

-- ============================================
-- ORDER TIMELINE TABLE
-- ============================================

CREATE TABLE order_timeline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for order_timeline
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order timeline"
    ON order_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_timeline.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- Index for faster lookups
CREATE INDEX idx_order_timeline_order_id ON order_timeline(order_id);
CREATE INDEX idx_order_timeline_created_at ON order_timeline(created_at);

-- ============================================
-- EXTEND ORDERS TABLE
-- ============================================

-- Add order number for customer-facing reference
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add tracking number
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add estimated delivery date
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- Add customer name and email (for guest checkout or denormalization)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'HMP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_order_number();

-- ============================================
-- ADMIN ROLES
-- ============================================

-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Create admin-specific policies
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
        OR auth.uid() = user_id
    );

CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
    );

CREATE POLICY "Admins can view all products"
    ON products FOR SELECT
    USING (TRUE);

CREATE POLICY "Admins can manage products"
    ON products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
    );

CREATE POLICY "Admins can manage articles"
    ON articles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
    );

CREATE POLICY "Admins can view all order timelines"
    ON order_timeline FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
        OR EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_timeline.order_id
            AND orders.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert order timeline"
    ON order_timeline FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND (profiles.is_admin = TRUE OR profiles.role = 'admin')
        )
    );

-- ============================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================

-- Enable real-time for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_timeline;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update order status with timeline entry
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status order_status,
    p_description TEXT,
    p_location TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update order status
    UPDATE orders
    SET status = p_status, updated_at = NOW()
    WHERE id = p_order_id;

    -- Insert timeline entry
    INSERT INTO order_timeline (order_id, status, description, location)
    VALUES (p_order_id, p_status, p_description, p_location);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order with full timeline
CREATE OR REPLACE FUNCTION get_order_with_timeline(p_order_id UUID)
RETURNS TABLE (
    order_data JSONB,
    timeline JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        to_jsonb(o.*) as order_data,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'status', t.status,
                    'description', t.description,
                    'location', t.location,
                    'timestamp', t.created_at
                ) ORDER BY t.created_at ASC
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::jsonb
        ) as timeline
    FROM orders o
    LEFT JOIN order_timeline t ON o.id = t.order_id
    WHERE o.id = p_order_id
    GROUP BY o.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA FOR ORDERS (Development Only)
-- ============================================

-- Insert sample orders with timelines (only if not in production)
DO $$
DECLARE
    v_order_id UUID;
BEGIN
    -- Sample Order 1: Shipped
    INSERT INTO orders (
        order_number, user_id, items, subtotal, shipping, tax, total,
        status, payment_status, payment_method, shipping_address,
        customer_name, customer_email, tracking_number, estimated_delivery
    ) VALUES (
        'HMP-2025-001234',
        NULL, -- Guest order for demo
        '[{"productId": "p1", "name": "Hemplifier Harmony", "quantity": 1, "price": 65000, "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200"}]'::jsonb,
        65000, 0, 8450, 73450,
        'shipped', 'paid', 'Khalti',
        '{"fullName": "Ram Sharma", "phone": "+977 9841234567", "address": "Thamel Marg, Ward 26", "city": "Kathmandu", "state": "Bagmati", "postalCode": "44600", "country": "Nepal"}'::jsonb,
        'Ram Sharma', 'ram.sharma@email.com', 'NPL123456789', '2025-01-25'
    ) RETURNING id INTO v_order_id;

    INSERT INTO order_timeline (order_id, status, description, created_at) VALUES
        (v_order_id, 'placed', 'Order placed successfully', NOW() - INTERVAL '4 days'),
        (v_order_id, 'confirmed', 'Order confirmed by seller', NOW() - INTERVAL '4 days' + INTERVAL '30 minutes'),
        (v_order_id, 'processing', 'Order is being prepared', NOW() - INTERVAL '3 days'),
        (v_order_id, 'shipped', 'Package handed to courier', NOW() - INTERVAL '2 days');

    -- Sample Order 2: Processing
    INSERT INTO orders (
        order_number, user_id, items, subtotal, shipping, tax, total,
        status, payment_status, payment_method, shipping_address,
        customer_name, customer_email, estimated_delivery
    ) VALUES (
        'HMP-2025-001235',
        NULL,
        '[{"productId": "p3", "name": "Sindhu Face Cream", "quantity": 2, "price": 5800, "imageUrl": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=200"}]'::jsonb,
        11600, 150, 1508, 13258,
        'processing', 'paid', 'eSewa',
        '{"fullName": "Sita Gurung", "phone": "+977 9812345678", "address": "Lakeside Road", "city": "Pokhara", "state": "Gandaki", "postalCode": "33700", "country": "Nepal"}'::jsonb,
        'Sita Gurung', 'sita.gurung@email.com', '2025-01-28'
    ) RETURNING id INTO v_order_id;

    INSERT INTO order_timeline (order_id, status, description, created_at) VALUES
        (v_order_id, 'placed', 'Order placed successfully', NOW() - INTERVAL '1 day'),
        (v_order_id, 'confirmed', 'Order confirmed by seller', NOW() - INTERVAL '1 day' + INTERVAL '45 minutes'),
        (v_order_id, 'processing', 'Order is being prepared', NOW() - INTERVAL '12 hours');

    -- Sample Order 3: Delivered
    INSERT INTO orders (
        order_number, user_id, items, subtotal, shipping, tax, total,
        status, payment_status, payment_method, shipping_address,
        customer_name, customer_email, tracking_number, estimated_delivery
    ) VALUES (
        'HMP-2025-001236',
        NULL,
        '[{"productId": "p2", "name": "Hemplifier Epoch", "quantity": 1, "price": 45000, "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}]'::jsonb,
        45000, 0, 5850, 50850,
        'delivered', 'paid', 'Cash on Delivery',
        '{"fullName": "Binod Thapa", "phone": "+977 9856789012", "address": "Itahari Road, Ward 4", "city": "Itahari", "state": "Province 1", "postalCode": "56705", "country": "Nepal"}'::jsonb,
        'Binod Thapa', 'binod.thapa@email.com', 'NPL987654321', '2025-01-15'
    ) RETURNING id INTO v_order_id;

    INSERT INTO order_timeline (order_id, status, description, location, created_at) VALUES
        (v_order_id, 'placed', 'Order placed successfully', NULL, NOW() - INTERVAL '12 days'),
        (v_order_id, 'confirmed', 'Order confirmed by seller', NULL, NOW() - INTERVAL '12 days' + INTERVAL '1 hour'),
        (v_order_id, 'processing', 'Order is being prepared', NULL, NOW() - INTERVAL '11 days'),
        (v_order_id, 'shipped', 'Package handed to courier', 'Kathmandu Hub', NOW() - INTERVAL '10 days'),
        (v_order_id, 'out_for_delivery', 'Out for delivery', 'Itahari', NOW() - INTERVAL '8 days'),
        (v_order_id, 'delivered', 'Delivered successfully', 'Itahari', NOW() - INTERVAL '8 days' + INTERVAL '8 hours');

    -- Sample Order 4: Placed (New)
    INSERT INTO orders (
        order_number, user_id, items, subtotal, shipping, tax, total,
        status, payment_status, payment_method, shipping_address,
        customer_name, customer_email, estimated_delivery
    ) VALUES (
        'HMP-2025-001237',
        NULL,
        '[{"productId": "p1", "name": "Hemplifier Harmony", "quantity": 1, "price": 55000, "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200"}]'::jsonb,
        55000, 0, 7150, 62150,
        'placed', 'pending', 'Bank Transfer',
        '{"fullName": "Anita Rai", "phone": "+977 9867890123", "address": "New Road, Ward 12", "city": "Biratnagar", "state": "Province 1", "postalCode": "56613", "country": "Nepal"}'::jsonb,
        'Anita Rai', 'anita.rai@email.com', '2025-01-30'
    ) RETURNING id INTO v_order_id;

    INSERT INTO order_timeline (order_id, status, description, created_at) VALUES
        (v_order_id, 'placed', 'Order placed successfully', NOW() - INTERVAL '2 hours');

END $$;
