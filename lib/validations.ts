/**
 * Form Validation Schemas using Zod
 *
 * Centralized validation rules for all forms in the application.
 */

import { z } from 'zod';

// ============================================
// User Authentication Schemas
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ============================================
// Checkout/Shipping Schemas
// ============================================

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  address1: z.string().min(5, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[+]?[\d\s-]+$/, 'Please enter a valid phone number'),
});

export const checkoutSchema = z.object({
  email: emailSchema,
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsBilling: z.boolean().default(true),
  paymentMethod: z.enum(['card', 'esewa', 'khalti', 'cod']),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// ============================================
// Product Schemas (Admin)
// ============================================

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required').max(200),
  tagline: z.string().min(5, 'Tagline is required').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  longDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  priceUsd: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  salePriceUsd: z.number().positive().optional(),
  category: z.enum(['Audio', 'Wearable', 'Mobile', 'Home', 'Wellness']),
  imageUrl: z.string().url('Please enter a valid image URL'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).optional(),
  features: z.array(z.string().min(1)).min(1, 'At least one feature is required'),
  stock: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

// ============================================
// Article/Journal Schemas (Admin)
// ============================================

export const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters').max(500),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  image: z.string().url('Please enter a valid image URL'),
  video: z.string().url().optional().or(z.literal('')),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

export const commentSchema = z.object({
  author: z.string().min(2, 'Name must be at least 2 characters').max(100),
  text: z.string().min(5, 'Comment must be at least 5 characters').max(2000),
});

// ============================================
// Contact Form Schema
// ============================================

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema,
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters').max(5000),
});

// ============================================
// Type Exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ArticleInput = z.infer<typeof articleSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ContactInput = z.infer<typeof contactSchema>;

// ============================================
// Validation Helper
// ============================================

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = err.message;
    }
  });

  return { success: false, errors };
}
