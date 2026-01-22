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
  | { type: 'search', query: string }
  | { type: 'login' }
  | { type: 'register' }
  | { type: 'profile' }
  | { type: 'order-success' };