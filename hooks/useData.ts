/**
 * Custom React Hooks for Data Fetching
 *
 * These hooks provide a clean interface for fetching and managing data
 * from the API layer with proper loading states and error handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api, productsApi, ordersApi, articlesApi, authApi, wishlistApi } from '../lib/api';
import type { Product, JournalArticle, Order, OrderStatus, Customer } from '../types';

// ============================================
// GENERIC DATA HOOK
// ============================================

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data with loading and error states
 */
export function useData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): UseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn]);

  useEffect(() => {
    mountedRef.current = true;
    fetch();
    return () => {
      mountedRef.current = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: fetch };
}

// ============================================
// PRODUCTS HOOKS
// ============================================

/**
 * Hook for fetching all products
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const newProduct = await productsApi.create(product);
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const updated = await productsApi.update(id, updates);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  return {
    products,
    setProducts,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

/**
 * Hook for fetching a single product
 */
export function useProduct(id: string | null) {
  return useData(
    useCallback(() => id ? productsApi.getById(id) : Promise.resolve(null), [id]),
    [id]
  );
}

// ============================================
// ORDERS HOOKS
// ============================================

/**
 * Hook for fetching all orders (Admin)
 */
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const subscription = ordersApi.subscribeToAllOrders((updatedOrders) => {
      setOrders(updatedOrders);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (
    id: string,
    status: OrderStatus,
    description?: string,
    location?: string
  ) => {
    const updated = await ordersApi.updateStatus(id, status, description, location);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  }, []);

  const updateTracking = useCallback(async (id: string, trackingNumber: string) => {
    const updated = await ordersApi.updateTracking(id, trackingNumber);
    setOrders(prev => prev.map(o => o.id === id ? updated : o));
    return updated;
  }, []);

  return {
    orders,
    setOrders,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    updateTracking,
  };
}

/**
 * Hook for fetching orders for a specific user
 */
export function useUserOrders(userId: string | null) {
  return useData(
    useCallback(() => userId ? ordersApi.getByUserId(userId) : Promise.resolve([]), [userId]),
    [userId]
  );
}

/**
 * Hook for tracking a single order with real-time updates
 */
export function useOrderTracking(orderIdOrNumber: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchOrder = useCallback(async (query: string) => {
    if (!query.trim()) {
      setOrder(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try by order number first
      let found = await ordersApi.getByOrderNumber(query);

      // If not found, try by ID
      if (!found) {
        found = await ordersApi.getById(query);
      }

      setOrder(found);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to find order'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if initial value provided
  useEffect(() => {
    if (orderIdOrNumber) {
      searchOrder(orderIdOrNumber);
    }
  }, [orderIdOrNumber, searchOrder]);

  // Subscribe to real-time updates when order is found
  useEffect(() => {
    if (!order?.id) return;

    const subscription = ordersApi.subscribeToUpdates(order.id, (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [order?.id]);

  return {
    order,
    loading,
    error,
    searchOrder,
  };
}

// ============================================
// ARTICLES HOOKS
// ============================================

/**
 * Hook for fetching all articles
 */
export function useArticles(adminMode = false) {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = adminMode
        ? await articlesApi.getAllAdmin()
        : await articlesApi.getAll();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch articles'));
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const createArticle = useCallback(async (article: Omit<JournalArticle, 'id' | 'comments'>) => {
    const newArticle = await articlesApi.create(article);
    setArticles(prev => [newArticle, ...prev]);
    return newArticle;
  }, []);

  const updateArticle = useCallback(async (id: number, updates: Partial<JournalArticle>) => {
    const updated = await articlesApi.update(id, updates);
    setArticles(prev => prev.map(a => a.id === id ? updated : a));
    return updated;
  }, []);

  const deleteArticle = useCallback(async (id: number) => {
    await articlesApi.delete(id);
    setArticles(prev => prev.filter(a => a.id !== id));
  }, []);

  const addComment = useCallback(async (articleId: number, comment: { author: string; text: string }) => {
    const newComment = await articlesApi.addComment(articleId, comment);
    setArticles(prev => prev.map(a =>
      a.id === articleId
        ? { ...a, comments: [newComment, ...(a.comments || [])] }
        : a
    ));
    return newComment;
  }, []);

  return {
    articles,
    setArticles,
    loading,
    error,
    refetch: fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    addComment,
  };
}

/**
 * Hook for fetching a single article
 */
export function useArticle(id: number | null) {
  return useData(
    useCallback(() => id ? articlesApi.getById(id) : Promise.resolve(null), [id]),
    [id]
  );
}

// ============================================
// AUTH HOOKS
// ============================================

/**
 * Hook for authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial user
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
          const adminStatus = await authApi.isAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const subscription = authApi.onAuthStateChange(async (newUser) => {
      setUser(newUser);
      if (newUser) {
        const adminStatus = await authApi.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const customer = await authApi.signIn(email, password);
    setUser(customer);
    return customer;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const customer = await authApi.signUp(email, password, name);
    setUser(customer);
    return customer;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
    setIsAdmin(false);
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    const success = await authApi.adminLogin(email, password);
    if (success) {
      setIsAdmin(true);
    }
    return success;
  }, []);

  const adminLogout = useCallback(async () => {
    await authApi.adminLogout();
    setIsAdmin(false);
  }, []);

  return {
    user,
    setUser,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    adminLogin,
    adminLogout,
  };
}

// ============================================
// WISHLIST HOOKS
// ============================================

/**
 * Hook for managing wishlist
 */
export function useWishlist(userId?: string) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const items = await wishlistApi.get(userId);
        setWishlist(items);
      } catch (err) {
        console.error('Wishlist fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  const toggleItem = useCallback(async (productId: string) => {
    const isInWishlist = wishlist.includes(productId);

    // Optimistic update
    setWishlist(prev =>
      isInWishlist
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      await wishlistApi.toggle(productId, userId);
    } catch (err) {
      // Revert on error
      setWishlist(prev =>
        isInWishlist
          ? [...prev, productId]
          : prev.filter(id => id !== productId)
      );
      throw err;
    }
  }, [wishlist, userId]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  return {
    wishlist,
    setWishlist,
    loading,
    toggleItem,
    isInWishlist,
  };
}

// ============================================
// CHECKOUT HOOK
// ============================================

interface CheckoutData {
  customerName: string;
  customerEmail: string;
  items: any[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: any;
  paymentMethod: string;
}

/**
 * Hook for checkout process
 */
export function useCheckout() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  const createOrder = useCallback(async (data: CheckoutData, customerId?: string) => {
    setProcessing(true);
    setError(null);

    try {
      const newOrder = await ordersApi.create({
        customerId,
        ...data,
      });
      setOrder(newOrder);
      return newOrder;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create order');
      setError(error);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    processing,
    error,
    order,
    createOrder,
  };
}

// Export API for direct access if needed
export { api };
