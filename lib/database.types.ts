/**
 * Supabase Database Types
 *
 * This file defines the TypeScript types for the Supabase database schema.
 * Generate this file using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          tagline: string;
          description: string;
          long_description: string | null;
          price: number;
          price_usd: number | null;
          sale_price: number | null;
          sale_price_usd: number | null;
          category: 'Audio' | 'Wearable' | 'Mobile' | 'Home' | 'Wellness';
          image_url: string;
          video_url: string | null;
          gallery: string[] | null;
          features: string[];
          seo: Json | null;
          variants: Json | null;
          stock: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tagline: string;
          description: string;
          long_description?: string | null;
          price: number;
          price_usd?: number | null;
          sale_price?: number | null;
          sale_price_usd?: number | null;
          category: 'Audio' | 'Wearable' | 'Mobile' | 'Home' | 'Wellness';
          image_url: string;
          video_url?: string | null;
          gallery?: string[] | null;
          features: string[];
          seo?: Json | null;
          variants?: Json | null;
          stock?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tagline?: string;
          description?: string;
          long_description?: string | null;
          price?: number;
          price_usd?: number | null;
          sale_price?: number | null;
          sale_price_usd?: number | null;
          category?: 'Audio' | 'Wearable' | 'Mobile' | 'Home' | 'Wellness';
          image_url?: string;
          video_url?: string | null;
          gallery?: string[] | null;
          features?: string[];
          seo?: Json | null;
          variants?: Json | null;
          stock?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_name: string | null;
          customer_email: string | null;
          items: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          currency: 'NPR' | 'USD';
          status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_address: Json;
          billing_address: Json | null;
          payment_method: string | null;
          payment_id: string | null;
          tracking_number: string | null;
          estimated_delivery: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_name?: string | null;
          customer_email?: string | null;
          items: Json;
          subtotal: number;
          shipping?: number;
          tax?: number;
          total: number;
          currency?: 'NPR' | 'USD';
          status?: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          shipping_address: Json;
          billing_address?: Json | null;
          payment_method?: string | null;
          payment_id?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_id?: string | null;
          tracking_number?: string | null;
          estimated_delivery?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_timeline: {
        Row: {
          id: string;
          order_id: string;
          status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          description: string;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          description: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          description?: string;
          location?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          default_address: Json | null;
          preferences: Json | null;
          is_admin: boolean;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          default_address?: Json | null;
          preferences?: Json | null;
          is_admin?: boolean;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          default_address?: Json | null;
          preferences?: Json | null;
          is_admin?: boolean;
          role?: string;
          updated_at?: string;
        };
      };
      articles: {
        Row: {
          id: number;
          title: string;
          date: string;
          excerpt: string;
          image: string;
          video: string | null;
          content: string;
          author: string | null;
          tags: string[] | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title: string;
          date?: string;
          excerpt: string;
          image: string;
          video?: string | null;
          content: string;
          author?: string | null;
          tags?: string[] | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          date?: string;
          excerpt?: string;
          image?: string;
          video?: string | null;
          content?: string;
          author?: string | null;
          tags?: string[] | null;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          article_id: number;
          user_id: string | null;
          author: string;
          text: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: number;
          user_id?: string | null;
          author: string;
          text: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          is_approved?: boolean;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      update_order_status: {
        Args: {
          p_order_id: string;
          p_status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
          p_description: string;
          p_location?: string | null;
        };
        Returns: void;
      };
      get_order_with_timeline: {
        Args: {
          p_order_id: string;
        };
        Returns: {
          order_data: Json;
          timeline: Json;
        }[];
      };
    };
    Enums: {
      product_category: 'Audio' | 'Wearable' | 'Mobile' | 'Home' | 'Wellness';
      order_status: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
      currency_type: 'NPR' | 'USD';
    };
  };
}
