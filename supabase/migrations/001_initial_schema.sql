-- Hemplifier Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE product_category AS ENUM ('Audio', 'Wearable', 'Mobile', 'Home', 'Wellness');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE currency_type AS ENUM ('NPR', 'USD');

-- ============================================
-- PROFILES TABLE (extends Supabase Auth)
-- ============================================

CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    avatar_url TEXT,
    default_address JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    price INTEGER NOT NULL, -- Price in NPR (paisa not used, just whole numbers)
    price_usd INTEGER, -- Price in USD cents
    sale_price INTEGER,
    sale_price_usd INTEGER,
    category product_category NOT NULL,
    image_url TEXT NOT NULL,
    video_url TEXT,
    gallery TEXT[] DEFAULT '{}',
    features TEXT[] NOT NULL DEFAULT '{}',
    seo JSONB,
    variants JSONB,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Everyone can read active products
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = TRUE);

-- Only admins can modify products (handled via service role key)

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    subtotal INTEGER NOT NULL,
    shipping INTEGER DEFAULT 0,
    tax INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    currency currency_type DEFAULT 'NPR',
    status order_status DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    payment_method TEXT,
    payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- ARTICLES TABLE (Journal/Blog)
-- ============================================

CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    excerpt TEXT NOT NULL,
    image TEXT NOT NULL,
    video TEXT,
    content TEXT NOT NULL,
    author TEXT,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
    ON articles FOR SELECT
    USING (is_published = TRUE);

-- ============================================
-- COMMENTS TABLE
-- ============================================

CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments"
    ON comments FOR SELECT
    USING (is_approved = TRUE);

CREATE POLICY "Authenticated users can create comments"
    ON comments FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL OR author IS NOT NULL);

-- ============================================
-- WISHLIST TABLE
-- ============================================

CREATE TABLE wishlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- RLS Policies for wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
    ON wishlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist"
    ON wishlists FOR ALL
    USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_articles_is_published ON articles(is_published);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- ============================================
-- SEED DATA (Optional - Remove in production)
-- ============================================

-- Insert sample products
INSERT INTO products (name, tagline, description, price, price_usd, sale_price, sale_price_usd, category, image_url, features) VALUES
('Hemplifier Harmony', 'Listen naturally.', 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.', 55000, 850, 49500, 765, 'Audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000', ARRAY['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage']),
('Hemplifier Epoch', 'Moments, not minutes.', 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.', 45000, 650, NULL, NULL, 'Wearable', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000', ARRAY['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery']),
('Sindhu Face Cream', 'Moisturize naturally.', 'A rich, organic face cream crafted with Shea and Chiuri butters. Made in Nepal.', 5800, 85, 4640, 68, 'Wellness', 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&q=80&w=1000', ARRAY['Hemp Seed Oil', 'Shea & Chiuri Butter', 'Lavender & Tea Tree EO']);

-- Insert sample articles
INSERT INTO articles (title, excerpt, content, image, is_published) VALUES
('The Psychology of Texture', 'Why our fingertips crave natural surfaces in a world of glass and plastic.', '<p>We live in a frictionless world...</p>', 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?auto=format&fit=crop&q=80&w=1000', TRUE),
('Living with Less', 'A conversation with architect Hiroshi Nakamura on the art of empty space.', '<p>Emptiness is not nothing...</p>', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000', TRUE);
