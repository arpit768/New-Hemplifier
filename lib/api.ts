/**
 * Hemplifier API Layer
 *
 * Comprehensive data access layer that handles all database operations.
 * Falls back to localStorage when Supabase is not configured.
 */

// @ts-nocheck
// Note: TypeScript strict checking is disabled for this file because the Supabase
// generated types don't perfectly match our runtime schema. The types exported from
// this module are still strictly typed - only internal Supabase query operations
// are loosely typed. This is a common pattern when working with Supabase's
// auto-generated types that may be out of sync with the actual database schema.

import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, JournalArticle, Order, OrderStatus, Customer, Comment } from '../types';
import { PRODUCTS, JOURNAL_ARTICLES } from '../constants';

// Type assertion helper for Supabase queries
// This helps work around strict typing issues with dynamically generated Supabase types
// The Database types may not perfectly match what's in Supabase, so we use 'any' for flexibility
const db = {
  products: () => supabase!.from('products' as any),
  orders: () => supabase!.from('orders' as any),
  order_timeline: () => supabase!.from('order_timeline' as any),
  articles: () => supabase!.from('articles' as any),
  comments: () => supabase!.from('comments' as any),
  profiles: () => supabase!.from('profiles' as any),
  wishlists: () => supabase!.from('wishlists' as any),
};

// ============================================
// TYPE CONVERSIONS
// ============================================

/**
 * Convert database product to app Product type
 */
const dbProductToProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  tagline: dbProduct.tagline,
  description: dbProduct.description,
  longDescription: dbProduct.long_description,
  price: dbProduct.price,
  priceUsd: dbProduct.price_usd,
  salePrice: dbProduct.sale_price,
  salePriceUsd: dbProduct.sale_price_usd,
  category: dbProduct.category,
  imageUrl: dbProduct.image_url,
  videoUrl: dbProduct.video_url,
  gallery: dbProduct.gallery,
  features: dbProduct.features,
  seo: dbProduct.seo,
  variants: dbProduct.variants,
});

/**
 * Convert app Product to database format
 */
const productToDbProduct = (product: Product): any => ({
  id: product.id,
  name: product.name,
  tagline: product.tagline,
  description: product.description,
  long_description: product.longDescription,
  price: product.price,
  price_usd: product.priceUsd,
  sale_price: product.salePrice,
  sale_price_usd: product.salePriceUsd,
  category: product.category,
  image_url: product.imageUrl,
  video_url: product.videoUrl,
  gallery: product.gallery,
  features: product.features,
  seo: product.seo,
  variants: product.variants,
});

/**
 * Convert database order to app Order type
 */
const dbOrderToOrder = (dbOrder: any, timeline?: any[]): Order => ({
  id: dbOrder.id,
  orderNumber: dbOrder.order_number,
  customerId: dbOrder.user_id || '',
  customerName: dbOrder.customer_name || '',
  customerEmail: dbOrder.customer_email || '',
  items: dbOrder.items || [],
  subtotal: dbOrder.subtotal,
  shippingCost: dbOrder.shipping,
  tax: dbOrder.tax,
  total: dbOrder.total,
  status: mapDbStatusToAppStatus(dbOrder.status),
  paymentMethod: dbOrder.payment_method || '',
  paymentStatus: mapDbPaymentStatus(dbOrder.payment_status),
  shippingAddress: dbOrder.shipping_address || {},
  trackingNumber: dbOrder.tracking_number,
  estimatedDelivery: dbOrder.estimated_delivery,
  timeline: timeline?.map(t => ({
    status: mapDbStatusToAppStatus(t.status),
    timestamp: t.created_at || t.timestamp,
    description: t.description,
    location: t.location,
  })) || [],
  notes: dbOrder.notes,
  createdAt: dbOrder.created_at,
  updatedAt: dbOrder.updated_at,
});

/**
 * Map database status to app status
 */
const mapDbStatusToAppStatus = (dbStatus: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    'placed': 'Placed',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned',
  };
  return statusMap[dbStatus] || 'Placed';
};

/**
 * Map app status to database status
 */
const mapAppStatusToDbStatus = (appStatus: OrderStatus): string => {
  const statusMap: Record<OrderStatus, string> = {
    'Placed': 'placed',
    'Confirmed': 'confirmed',
    'Processing': 'processing',
    'Shipped': 'shipped',
    'Out for Delivery': 'out_for_delivery',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled',
    'Returned': 'returned',
  };
  return statusMap[appStatus] || 'placed';
};

/**
 * Map database payment status
 */
const mapDbPaymentStatus = (status: string): 'Pending' | 'Paid' | 'Failed' | 'Refunded' => {
  const map: Record<string, 'Pending' | 'Paid' | 'Failed' | 'Refunded'> = {
    'pending': 'Pending',
    'paid': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
  };
  return map[status] || 'Pending';
};

/**
 * Convert database article to app JournalArticle type
 */
const dbArticleToArticle = (dbArticle: any): JournalArticle => ({
  id: dbArticle.id,
  title: dbArticle.title,
  date: dbArticle.date,
  excerpt: dbArticle.excerpt,
  image: dbArticle.image,
  video: dbArticle.video,
  content: dbArticle.content,
  comments: dbArticle.comments?.map((c: any) => ({
    id: c.id,
    author: c.author,
    text: c.text,
    date: new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  })) || [],
});

// ============================================
// PRODUCTS API
// ============================================

export const productsApi = {
  /**
   * Get all products
   */
  getAll: async (): Promise<Product[]> => {
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage or constants
      try {
        const stored = localStorage.getItem('hemplifier-products');
        if (stored) {
          const parsed = JSON.parse(stored);
          // If localStorage has data, use it; otherwise fall back to constants
          return parsed.length > 0 ? parsed : PRODUCTS;
        }
        return PRODUCTS;
      } catch {
        return PRODUCTS;
      }
    }

    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbProductToProduct);
  },

  /**
   * Get single product by ID
   */
  getById: async (id: string): Promise<Product | null> => {
    if (!isSupabaseConfigured()) {
      const products = await productsApi.getAll();
      return products.find(p => p.id === id) || null;
    }

    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? dbProductToProduct(data) : null;
  },

  /**
   * Create a new product (Admin only)
   */
  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    if (!isSupabaseConfigured()) {
      const newProduct = { ...product, id: `p${Date.now()}` } as Product;
      const products = await productsApi.getAll();
      localStorage.setItem('hemplifier-products', JSON.stringify([newProduct, ...products]));
      return newProduct;
    }

    const { data, error } = await supabase!
      .from('products')
      .insert(productToDbProduct({ ...product, id: '' }))
      .select()
      .single();

    if (error) throw error;
    return dbProductToProduct(data);
  },

  /**
   * Update a product (Admin only)
   */
  update: async (id: string, updates: Partial<Product>): Promise<Product> => {
    if (!isSupabaseConfigured()) {
      const products = await productsApi.getAll();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Product not found');
      products[index] = { ...products[index], ...updates };
      localStorage.setItem('hemplifier-products', JSON.stringify(products));
      return products[index];
    }

    const dbUpdates = productToDbProduct({ ...updates, id } as Product);
    delete dbUpdates.id;

    const { data, error } = await supabase!
      .from('products')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return dbProductToProduct(data);
  },

  /**
   * Delete a product (Admin only - soft delete)
   */
  delete: async (id: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      const products = await productsApi.getAll();
      localStorage.setItem('hemplifier-products', JSON.stringify(products.filter(p => p.id !== id)));
      return;
    }

    const { error } = await supabase!
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// ORDERS API
// ============================================

export const ordersApi = {
  /**
   * Get all orders (Admin only)
   */
  getAll: async (): Promise<Order[]> => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem('hemplifier-orders');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    const { data, error } = await supabase!
      .from('orders')
      .select(`
        *,
        order_timeline(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => dbOrderToOrder(o, o.order_timeline));
  },

  /**
   * Get orders for a specific user
   */
  getByUserId: async (userId: string): Promise<Order[]> => {
    if (!isSupabaseConfigured()) {
      const orders = await ordersApi.getAll();
      return orders.filter(o => o.customerId === userId);
    }

    const { data, error } = await supabase!
      .from('orders')
      .select(`
        *,
        order_timeline(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => dbOrderToOrder(o, o.order_timeline));
  },

  /**
   * Get single order by ID
   */
  getById: async (id: string): Promise<Order | null> => {
    if (!isSupabaseConfigured()) {
      const orders = await ordersApi.getAll();
      return orders.find(o => o.id === id) || null;
    }

    const { data, error } = await supabase!
      .from('orders')
      .select(`
        *,
        order_timeline(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? dbOrderToOrder(data, data.order_timeline) : null;
  },

  /**
   * Get order by order number (for tracking)
   */
  getByOrderNumber: async (orderNumber: string): Promise<Order | null> => {
    if (!isSupabaseConfigured()) {
      const orders = await ordersApi.getAll();
      return orders.find(o =>
        o.orderNumber.toLowerCase() === orderNumber.toLowerCase() ||
        o.trackingNumber?.toLowerCase() === orderNumber.toLowerCase()
      ) || null;
    }

    const { data, error } = await supabase!
      .from('orders')
      .select(`
        *,
        order_timeline(*)
      `)
      .or(`order_number.ilike.${orderNumber},tracking_number.ilike.${orderNumber}`)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? dbOrderToOrder(data, data.order_timeline) : null;
  },

  /**
   * Create a new order
   */
  create: async (orderData: {
    customerId?: string;
    customerName: string;
    customerEmail: string;
    items: any[];
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    shippingAddress: any;
    paymentMethod: string;
  }): Promise<Order> => {
    if (!isSupabaseConfigured()) {
      const orderNumber = `HMP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const newOrder: Order = {
        id: `ord_${Date.now()}`,
        orderNumber,
        customerId: orderData.customerId || '',
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        status: 'Placed',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: 'Pending',
        shippingAddress: orderData.shippingAddress,
        timeline: [{
          status: 'Placed',
          timestamp: new Date().toISOString(),
          description: 'Order placed successfully',
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orders = await ordersApi.getAll();
      localStorage.setItem('hemplifier-orders', JSON.stringify([newOrder, ...orders]));
      return newOrder;
    }

    // Insert order
    const { data: orderResult, error: orderError } = await supabase!
      .from('orders')
      .insert({
        user_id: orderData.customerId || null,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        items: orderData.items,
        subtotal: orderData.subtotal,
        shipping: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        status: 'placed',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert initial timeline entry
    const { error: timelineError } = await supabase!
      .from('order_timeline')
      .insert({
        order_id: orderResult.id,
        status: 'placed',
        description: 'Order placed successfully',
      });

    if (timelineError) console.error('Timeline insert error:', timelineError);

    return dbOrderToOrder(orderResult, [{
      status: 'placed',
      description: 'Order placed successfully',
      created_at: new Date().toISOString(),
    }]);
  },

  /**
   * Update order status (Admin only)
   */
  updateStatus: async (id: string, status: OrderStatus, description?: string, location?: string): Promise<Order> => {
    const statusDescription = description || getStatusDescription(status);

    if (!isSupabaseConfigured()) {
      const orders = await ordersApi.getAll();
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');

      orders[index] = {
        ...orders[index],
        status,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...orders[index].timeline,
          {
            status,
            timestamp: new Date().toISOString(),
            description: statusDescription,
            location,
          }
        ],
      };

      localStorage.setItem('hemplifier-orders', JSON.stringify(orders));
      return orders[index];
    }

    const dbStatus = mapAppStatusToDbStatus(status);

    // Update order status
    const { error: updateError } = await supabase!
      .from('orders')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;

    // Insert timeline entry
    const { error: timelineError } = await supabase!
      .from('order_timeline')
      .insert({
        order_id: id,
        status: dbStatus,
        description: statusDescription,
        location,
      });

    if (timelineError) console.error('Timeline insert error:', timelineError);

    // Fetch and return updated order
    return (await ordersApi.getById(id))!;
  },

  /**
   * Update tracking number (Admin only)
   */
  updateTracking: async (id: string, trackingNumber: string): Promise<Order> => {
    if (!isSupabaseConfigured()) {
      const orders = await ordersApi.getAll();
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');

      orders[index] = {
        ...orders[index],
        trackingNumber,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('hemplifier-orders', JSON.stringify(orders));
      return orders[index];
    }

    const { data, error } = await supabase!
      .from('orders')
      .update({ tracking_number: trackingNumber })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return (await ordersApi.getById(id))!;
  },

  /**
   * Subscribe to real-time order updates
   */
  subscribeToUpdates: (orderId: string, callback: (order: Order) => void) => {
    if (!isSupabaseConfigured()) {
      // No real-time in localStorage mode
      return { unsubscribe: () => {} };
    }

    const subscription = supabase!
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        async (payload) => {
          const order = await ordersApi.getById(orderId);
          if (order) callback(order);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_timeline',
          filter: `order_id=eq.${orderId}`,
        },
        async () => {
          const order = await ordersApi.getById(orderId);
          if (order) callback(order);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      }
    };
  },

  /**
   * Subscribe to all orders (Admin real-time)
   */
  subscribeToAllOrders: (callback: (orders: Order[]) => void) => {
    if (!isSupabaseConfigured()) {
      return { unsubscribe: () => {} };
    }

    const subscription = supabase!
      .channel('all-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        async () => {
          const orders = await ordersApi.getAll();
          callback(orders);
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        subscription.unsubscribe();
      }
    };
  },
};

/**
 * Get default description for status
 */
const getStatusDescription = (status: OrderStatus): string => {
  const descriptions: Record<OrderStatus, string> = {
    'Placed': 'Order placed successfully',
    'Confirmed': 'Order confirmed by seller',
    'Processing': 'Order is being prepared',
    'Shipped': 'Package has been shipped',
    'Out for Delivery': 'Package is out for delivery',
    'Delivered': 'Package delivered successfully',
    'Cancelled': 'Order has been cancelled',
    'Returned': 'Order has been returned',
  };
  return descriptions[status];
};

// ============================================
// ARTICLES API
// ============================================

export const articlesApi = {
  /**
   * Get all articles
   */
  getAll: async (): Promise<JournalArticle[]> => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem('hemplifier-articles');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.length > 0 ? parsed : JOURNAL_ARTICLES;
        }
        return JOURNAL_ARTICLES;
      } catch {
        return JOURNAL_ARTICLES;
      }
    }

    const { data, error } = await supabase!
      .from('articles')
      .select(`
        *,
        comments(*)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbArticleToArticle);
  },

  /**
   * Get all articles including unpublished (Admin)
   */
  getAllAdmin: async (): Promise<JournalArticle[]> => {
    if (!isSupabaseConfigured()) {
      return articlesApi.getAll();
    }

    const { data, error } = await supabase!
      .from('articles')
      .select(`
        *,
        comments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(dbArticleToArticle);
  },

  /**
   * Get single article by ID
   */
  getById: async (id: number): Promise<JournalArticle | null> => {
    if (!isSupabaseConfigured()) {
      const articles = await articlesApi.getAll();
      return articles.find(a => a.id === id) || null;
    }

    const { data, error } = await supabase!
      .from('articles')
      .select(`
        *,
        comments(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? dbArticleToArticle(data) : null;
  },

  /**
   * Create a new article (Admin only)
   */
  create: async (article: Omit<JournalArticle, 'id' | 'comments'>): Promise<JournalArticle> => {
    if (!isSupabaseConfigured()) {
      const articles = await articlesApi.getAll();
      const newId = Math.max(...articles.map(a => a.id), 0) + 1;
      const newArticle: JournalArticle = { ...article, id: newId, comments: [] };
      localStorage.setItem('hemplifier-articles', JSON.stringify([newArticle, ...articles]));
      return newArticle;
    }

    const { data, error } = await supabase!
      .from('articles')
      .insert({
        title: article.title,
        date: article.date,
        excerpt: article.excerpt,
        image: article.image,
        video: article.video,
        content: article.content as string,
        is_published: true,
      })
      .select()
      .single();

    if (error) throw error;
    return dbArticleToArticle(data);
  },

  /**
   * Update an article (Admin only)
   */
  update: async (id: number, updates: Partial<JournalArticle>): Promise<JournalArticle> => {
    if (!isSupabaseConfigured()) {
      const articles = await articlesApi.getAll();
      const index = articles.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Article not found');
      articles[index] = { ...articles[index], ...updates };
      localStorage.setItem('hemplifier-articles', JSON.stringify(articles));
      return articles[index];
    }

    const { data, error } = await supabase!
      .from('articles')
      .update({
        title: updates.title,
        date: updates.date,
        excerpt: updates.excerpt,
        image: updates.image,
        video: updates.video,
        content: updates.content as string,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return dbArticleToArticle(data);
  },

  /**
   * Delete an article (Admin only)
   */
  delete: async (id: number): Promise<void> => {
    if (!isSupabaseConfigured()) {
      const articles = await articlesApi.getAll();
      localStorage.setItem('hemplifier-articles', JSON.stringify(articles.filter(a => a.id !== id)));
      return;
    }

    const { error } = await supabase!
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Add a comment to an article
   */
  addComment: async (articleId: number, comment: { author: string; text: string }): Promise<Comment> => {
    if (!isSupabaseConfigured()) {
      const articles = await articlesApi.getAll();
      const index = articles.findIndex(a => a.id === articleId);
      if (index === -1) throw new Error('Article not found');

      const newComment: Comment = {
        id: `c${Date.now()}`,
        author: comment.author,
        text: comment.text,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      };

      articles[index].comments = [newComment, ...(articles[index].comments || [])];
      localStorage.setItem('hemplifier-articles', JSON.stringify(articles));
      return newComment;
    }

    const { data, error } = await supabase!
      .from('comments')
      .insert({
        article_id: articleId,
        author: comment.author,
        text: comment.text,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      author: data.author,
      text: data.text,
      date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  },
};

// ============================================
// AUTH API
// ============================================

export const authApi = {
  /**
   * Sign up a new customer
   */
  signUp: async (email: string, password: string, name: string): Promise<Customer> => {
    if (!isSupabaseConfigured()) {
      const customer: Customer = {
        id: `c${Date.now()}`,
        name,
        email,
        orders: [],
      };
      localStorage.setItem('hemplifier-user', JSON.stringify(customer));
      return customer;
    }

    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) throw error;

    return {
      id: data.user!.id,
      name,
      email,
      orders: [],
    };
  },

  /**
   * Sign in a customer
   */
  signIn: async (email: string, password: string): Promise<Customer> => {
    if (!isSupabaseConfigured()) {
      // Mock login - in demo mode, create/restore user
      const stored = localStorage.getItem('hemplifier-user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.email === email) return user;
      }

      const customer: Customer = {
        id: `c${Date.now()}`,
        name: email.split('@')[0],
        email,
        orders: [],
      };
      localStorage.setItem('hemplifier-user', JSON.stringify(customer));
      return customer;
    }

    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile
    const { data: profile } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name || email.split('@')[0],
      email,
      orders: [],
    };
  },

  /**
   * Sign out
   */
  signOut: async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('hemplifier-user');
      return;
    }

    await supabase!.auth.signOut();
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<Customer | null> => {
    if (!isSupabaseConfigured()) {
      const stored = localStorage.getItem('hemplifier-user');
      return stored ? JSON.parse(stored) : null;
    }

    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      name: profile?.name || user.email?.split('@')[0] || '',
      email: user.email || '',
      orders: [],
    };
  },

  /**
   * Check if user is admin
   */
  isAdmin: async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      // In demo mode, use localStorage flag
      return localStorage.getItem('hemplifier-admin-auth') === 'true';
    }

    const { data: { user } } = await supabase!.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase!
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single();

    return profile?.is_admin || profile?.role === 'admin';
  },

  /**
   * Admin login (for demo mode compatibility)
   */
  adminLogin: async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      // Demo credentials
      if (email === 'admin@hemplifier.com' && password === 'admin123') {
        localStorage.setItem('hemplifier-admin-auth', 'true');
        return true;
      }
      return false;
    }

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return false;

      // Check if user is admin
      const { data: profile } = await supabase!
        .from('profiles')
        .select('is_admin, role')
        .eq('id', data.user.id)
        .single();

      return profile?.is_admin || profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  /**
   * Admin logout
   */
  adminLogout: async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('hemplifier-admin-auth');
      return;
    }

    await supabase!.auth.signOut();
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (user: Customer | null) => void) => {
    if (!isSupabaseConfigured()) {
      // No real-time auth in demo mode
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = supabase!.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase!
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        callback({
          id: session.user.id,
          name: profile?.name || session.user.email?.split('@')[0] || '',
          email: session.user.email || '',
          orders: [],
        });
      } else {
        callback(null);
      }
    });

    return subscription;
  },
};

// ============================================
// WISHLIST API
// ============================================

export const wishlistApi = {
  /**
   * Get user's wishlist
   */
  get: async (userId?: string): Promise<string[]> => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem('hemplifier-wishlist');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    if (!userId) return [];

    const { data, error } = await supabase!
      .from('wishlists')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(w => w.product_id);
  },

  /**
   * Add to wishlist
   */
  add: async (productId: string, userId?: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      const wishlist = await wishlistApi.get();
      if (!wishlist.includes(productId)) {
        localStorage.setItem('hemplifier-wishlist', JSON.stringify([...wishlist, productId]));
      }
      return;
    }

    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase!
      .from('wishlists')
      .insert({ user_id: userId, product_id: productId });

    if (error && error.code !== '23505') throw error; // Ignore duplicate
  },

  /**
   * Remove from wishlist
   */
  remove: async (productId: string, userId?: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      const wishlist = await wishlistApi.get();
      localStorage.setItem('hemplifier-wishlist', JSON.stringify(wishlist.filter(id => id !== productId)));
      return;
    }

    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabase!
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  /**
   * Toggle wishlist item
   */
  toggle: async (productId: string, userId?: string): Promise<boolean> => {
    const wishlist = await wishlistApi.get(userId);
    if (wishlist.includes(productId)) {
      await wishlistApi.remove(productId, userId);
      return false;
    } else {
      await wishlistApi.add(productId, userId);
      return true;
    }
  },
};

// Export all APIs
export const api = {
  products: productsApi,
  orders: ordersApi,
  articles: articlesApi,
  auth: authApi,
  wishlist: wishlistApi,
  isConfigured: isSupabaseConfigured,
};

export default api;
