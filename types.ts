/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export type Language = 'en' | 'ne';
export type Currency = 'NPR' | 'USD';

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  priceAdjustment: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription?: string;
  price: number;
  priceUsd?: number; // Price for USD currency
  salePrice?: number; // Sale price in NPR
  salePriceUsd?: number; // Sale price in USD
  category: 'Audio' | 'Wearable' | 'Mobile' | 'Home' | 'Wellness';
  imageUrl: string;
  videoUrl?: string;
  gallery?: string[];
  features: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface JournalArticle {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  video?: string;
  content: React.ReactNode | string; // Updated to allow string for editable content
  comments?: Comment[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders?: {
    id: string;
    date: string;
    total: number;
    status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    items: string[];
  }[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export type ViewState =
  | { type: 'home' }
  | { type: 'shop' }
  | { type: 'about' }
  | { type: 'journal' }
  | { type: 'product', product: Product }
  | { type: 'journal-detail', article: JournalArticle }
  | { type: 'checkout' }
  | { type: 'admin' }
  | { type: 'admin-login' }
  | { type: 'search', query: string }
  | { type: 'login' }
  | { type: 'register' }
  | { type: 'profile' }
  | { type: 'order-success' }
  | { type: 'order-tracking', orderId?: string };

export interface AdminUser {
  email: string;
  isAuthenticated: boolean;
}

// Comprehensive Order System Types
export type OrderStatus = 'Placed' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned';

export interface OrderItem {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  fullName?: string;  // Computed from firstName + lastName if not provided
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: string;
  description: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  shippingAddress: ShippingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline: OrderTimeline[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}