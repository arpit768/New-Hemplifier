/**
 * Supabase Client Configuration
 *
 * This module provides a configured Supabase client for database operations
 * and authentication.
 */

// @ts-nocheck
// Note: TypeScript strict checking is disabled due to Supabase type generation issues

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not configured. Running in demo mode with localStorage.'
  );
}

// Create Supabase client (or null if not configured)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// Auth helpers
export const auth = {
  /**
   * Sign up a new user
   */
  signUp: async (email: string, password: string, metadata?: { name?: string }) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    if (!supabase) {
      return null;
    }

    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  /**
   * Get the current user
   */
  getUser: async () => {
    if (!supabase) {
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  /**
   * Get all products
   */
  getProducts: async () => {
    if (!supabase) {
      return null; // Fall back to localStorage
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get a single product by ID
   */
  getProduct: async (id: string) => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create an order
   */
  createOrder: async (orderData: {
    user_id: string;
    items: unknown[];
    total: number;
    shipping_address: unknown;
  }) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get user orders
   */
  getUserOrders: async (userId: string) => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Get all journal articles
   */
  getArticles: async () => {
    if (!supabase) {
      return null;
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*, comments(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Add a comment to an article
   */
  addComment: async (articleId: number, comment: { author: string; text: string }) => {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id: articleId,
        ...comment,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default supabase;
