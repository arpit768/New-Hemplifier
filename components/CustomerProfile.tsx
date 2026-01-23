/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useContext, useState } from 'react';
import { Customer, Order, Product } from '../types';
import { SettingsContext } from '../App';

interface CustomerProfileProps {
  customer: Customer;
  orders: Order[];
  onLogout: () => void;
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

type TabType = 'orders' | 'wishlist' | 'account' | 'insights';

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, orders, onLogout, products, wishlist, onToggleWishlist, onAddToCart, onProductClick }) => {
  const { theme, t, formatPrice, convertPrice, getProductPrice } = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderRatings, setOrderRatings] = useState<Record<string, number>>({});

  const getStatusStep = (status: string) => {
    switch(status) {
        case 'Placed': return 0;
        case 'Confirmed': return 1;
        case 'Processing': return 1;
        case 'Shipped': return 2;
        case 'Out for Delivery': return 2;
        case 'Delivered': return 3;
        case 'Cancelled': return -1;
        default: return 0;
    }
  };

  const steps = [
      { label: 'Placed', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
      { label: 'Processing', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
      { label: 'Shipped', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V15.75M8.25 21.75H16.5m-9-3H3.375m1.125-9.75h14.25M6 12a1.5 1.5 0 001.5-1.5m0 0a1.5 1.5 0 00-3 0m3 0A1.5 1.5 0 006 13.5m-3-1.5h.75m11.25 1.5a1.5 1.5 0 001.5-1.5m0 0a1.5 1.5 0 00-3 0m3 0A1.5 1.5 0 0016.5 13.5m-3-1.5H18" /></svg> },
      { label: 'Delivered', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> }
  ];

  // Filter orders based on selected filter
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'active') return !['Delivered', 'Cancelled', 'Returned'].includes(order.status);
    if (orderFilter === 'delivered') return order.status === 'Delivered';
    return true;
  });

  // Order stats
  const activeOrders = orders.filter(o => !['Delivered', 'Cancelled', 'Returned'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  // Loyalty Points Calculation (Rs. 10 = 1 point)
  const totalSpent = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const loyaltyPoints = Math.floor(totalSpent / 10);
  const pointsToNextTier = 1000 - (loyaltyPoints % 1000);
  const currentTier = loyaltyPoints < 1000 ? 'Bronze' : loyaltyPoints < 5000 ? 'Silver' : 'Gold';
  const tierProgress = ((loyaltyPoints % 1000) / 1000) * 100;

  // Get wishlist products
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  // Product Recommendations based on order history
  const getRecommendations = () => {
    // Get categories from past orders
    const purchasedCategories = new Set(
      orders.flatMap(o => o.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product?.category;
      })).filter(Boolean)
    );

    // Get products not yet purchased in those categories
    const purchasedProductIds = new Set(orders.flatMap(o => o.items.map(i => i.productId)));

    const recommendations = products.filter(p =>
      purchasedCategories.has(p.category) &&
      !purchasedProductIds.has(p.id) &&
      !wishlist.includes(p.id)
    ).slice(0, 4);

    // If not enough recommendations, add best sellers
    if (recommendations.length < 4) {
      const remaining = products
        .filter(p => !purchasedProductIds.has(p.id) && !recommendations.includes(p))
        .slice(0, 4 - recommendations.length);
      recommendations.push(...remaining);
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  // Spending Insights
  const getMonthlySpending = () => {
    const monthlyData: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + order.total;
      }
    });
    return Object.entries(monthlyData).slice(-6); // Last 6 months
  };

  const getCategoryBreakdown = () => {
    const categoryData: Record<string, number> = {};
    orders.forEach(order => {
      if (order.status !== 'Cancelled') {
        order.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            categoryData[product.category] = (categoryData[product.category] || 0) + item.price * item.quantity;
          }
        });
      }
    });
    return Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
  };

  const monthlySpending = getMonthlySpending();
  const categoryBreakdown = getCategoryBreakdown();
  const maxMonthlySpend = Math.max(...monthlySpending.map(([, amount]) => amount), 1);
  const averageOrderValue = orders.length > 0 ? Math.round(totalSpent / orders.filter(o => o.status !== 'Cancelled').length) : 0;

  // Rating handlers
  const handleRateOrder = (orderId: string, rating: number) => {
    setOrderRatings(prev => ({ ...prev, [orderId]: rating }));
    // TODO: Save rating to backend
    alert(`Thank you for rating this order ${rating} stars!`);
  };

  // Invoice generation
  const generateInvoice = (order: Order) => {
    // Create simple text-based invoice
    const invoiceText = `
HEMPLIFIER - INVOICE
=====================================
Order #: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Customer: ${order.customerName}
Email: ${order.customerEmail}

ITEMS:
${order.items.map(item => `- ${item.name} ${item.variant ? `(${item.variant})` : ''}\n  Qty: ${item.quantity} × ${formatPrice(convertPrice(item.price))} = ${formatPrice(convertPrice(item.price * item.quantity))}`).join('\n')}

SUMMARY:
Subtotal: ${formatPrice(convertPrice(order.subtotal))}
Shipping: ${formatPrice(convertPrice(order.shippingCost))}
Tax: ${formatPrice(convertPrice(order.tax))}
=====================================
TOTAL: ${formatPrice(convertPrice(order.total))}
=====================================

Payment Method: ${order.paymentMethod}
Status: ${order.status}

Thank you for shopping with Hemplifier!
`;

    // Create and download as text file
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReorder = (order: Order) => {
    // Add all items from the order back to cart
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        // Create a product copy with selected variant if applicable
        const productToAdd = item.variant
          ? { ...product, selectedVariant: product.variants?.find(v => v.name === item.variant) }
          : product;
        onAddToCart(productToAdd);
      }
    });
    alert(`${order.items.length} item(s) added to cart!`);
  };

  const handleTrackOrder = (order: Order) => {
    console.log('Track order:', order.id);
    // TODO: Navigate to tracking page
    alert(`Tracking: ${order.trackingNumber || order.orderNumber}`);
  };

  const handleDownloadInvoice = (order: Order) => {
    generateInvoice(order);
  };

  const handleContactSupport = (order: Order) => {
    console.log('Contact support for order:', order.id);
    // TODO: Open support dialog
    alert('Support contact form coming soon');
  };

  return (
    <div className={`min-h-screen pt-32 pb-24 px-6 md:px-12 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-8 border-b border-[#D6D1C7] dark:border-[#2C4A3B]">
            <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">{t('my_profile')}</span>
                <h1 className={`text-4xl md:text-6xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Hello, {customer.name}</h1>
                <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{customer.email}</p>
            </div>
            <button
                onClick={onLogout}
                className={`mt-6 md:mt-0 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#EBE7DE] border-[#EBE7DE] hover:bg-[#EBE7DE] hover:text-[#051009]' : 'text-[#1A4D2E] border-[#1A4D2E] hover:bg-[#1A4D2E] hover:text-[#F5F2EB]'} border px-6 py-2 transition-all duration-300`}
            >
                {t('logout')}
            </button>
        </div>

        {/* Loyalty Points Banner */}
        <div className={`p-6 mb-8 ${theme === 'dark' ? 'bg-gradient-to-r from-[#1A4D2E] to-[#153e25] border-[#2C4A3B]' : 'bg-gradient-to-r from-[#1A4D2E] to-[#2C4A3B] border-[#1A4D2E]'} border rounded-lg shadow-lg`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#EBE7DE]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#EBE7DE]/70 mb-1">Loyalty Rewards</p>
                  <p className="text-3xl font-serif text-[#EBE7DE]">{loyaltyPoints.toLocaleString()} Points</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#EBE7DE]/80">{currentTier} Tier</span>
                  <span className="text-sm text-[#EBE7DE]/80">{pointsToNextTier} points to {currentTier === 'Bronze' ? 'Silver' : 'Gold'}</span>
                </div>
                <div className="w-full h-2 bg-[#EBE7DE]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EBE7DE] rounded-full transition-all duration-500"
                    style={{ width: `${tierProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className={`px-6 py-3 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-white text-[#1A4D2E]'} rounded-lg text-center`}>
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Tier Benefits</p>
              <p className="text-lg font-serif font-bold">{currentTier === 'Gold' ? '15%' : currentTier === 'Silver' ? '10%' : '5%'} Off</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-2`}>Total Orders</p>
                <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{orders.length}</p>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-2`}>Active Orders</p>
                <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{activeOrders}</p>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V15.75M8.25 21.75H16.5m-9-3H3.375m1.125-9.75h14.25" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-2`}>Delivered</p>
                <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{deliveredOrders}</p>
              </div>
              <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className={`border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} mb-8`}>
          <nav className="flex gap-8" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'orders'}
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-all duration-300 ${
                activeTab === 'orders'
                  ? `${theme === 'dark' ? 'border-[#EBE7DE] text-[#EBE7DE]' : 'border-[#1A4D2E] text-[#1A4D2E]'}`
                  : `border-transparent ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`
              }`}
            >
              Orders
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'wishlist'}
              onClick={() => setActiveTab('wishlist')}
              className={`pb-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-all duration-300 ${
                activeTab === 'wishlist'
                  ? `${theme === 'dark' ? 'border-[#EBE7DE] text-[#EBE7DE]' : 'border-[#1A4D2E] text-[#1A4D2E]'}`
                  : `border-transparent ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`
              }`}
            >
              Wishlist
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'account'}
              onClick={() => setActiveTab('account')}
              className={`pb-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-all duration-300 ${
                activeTab === 'account'
                  ? `${theme === 'dark' ? 'border-[#EBE7DE] text-[#EBE7DE]' : 'border-[#1A4D2E] text-[#1A4D2E]'}`
                  : `border-transparent ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`
              }`}
            >
              Account
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'insights'}
              onClick={() => setActiveTab('insights')}
              className={`pb-4 text-sm uppercase tracking-widest font-medium border-b-2 transition-all duration-300 ${
                activeTab === 'insights'
                  ? `${theme === 'dark' ? 'border-[#EBE7DE] text-[#EBE7DE]' : 'border-[#1A4D2E] text-[#1A4D2E]'}`
                  : `border-transparent ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`
              }`}
            >
              Insights
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div role="tabpanel">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in-up">
              {/* Order Filters */}
              {orders.length > 0 && (
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                      orderFilter === 'all'
                        ? `${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-white'}`
                        : `${theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] hover:bg-[#2C4A3B]' : 'bg-white text-[#5D5A53] hover:bg-[#F5F2EB]'} border ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`
                    }`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                      orderFilter === 'active'
                        ? `${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-white'}`
                        : `${theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] hover:bg-[#2C4A3B]' : 'bg-white text-[#5D5A53] hover:bg-[#F5F2EB]'} border ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`
                    }`}
                  >
                    Active ({activeOrders})
                  </button>
                  <button
                    onClick={() => setOrderFilter('delivered')}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                      orderFilter === 'delivered'
                        ? `${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-white'}`
                        : `${theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] hover:bg-[#2C4A3B]' : 'bg-white text-[#5D5A53] hover:bg-[#F5F2EB]'} border ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`
                    }`}
                  >
                    Delivered ({deliveredOrders})
                  </button>
                </div>
              )}

              {/* Order Cards */}
              <div className="space-y-6">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const currentStep = getStatusStep(order.status);
                    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });

                    return (
                      <div key={order.id} className={`p-6 md:p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm transition-all hover:shadow-lg group`}>
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-dashed border-[#A8A29E]/30">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`font-serif text-lg ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                                Order #{order.orderNumber}
                              </span>
                              <span className={`px-3 py-1 text-xs uppercase tracking-wider rounded-full font-medium ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                order.status === 'Shipped' || order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Placed on {orderDate}</p>
                            {order.trackingNumber && (
                              <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mt-1`}>
                                Tracking: <span className="font-mono">{order.trackingNumber}</span>
                              </p>
                            )}
                          </div>
                          <div className="text-left md:text-right">
                            <p className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                              {formatPrice(convertPrice(order.total))}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mt-1`}>
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {/* Expandable Timeline Details */}
                        {order.timeline && order.timeline.length > 0 && (
                          <div className="mb-6">
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'} transition-colors`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                              </svg>
                              View Detailed Timeline ({order.timeline.length} updates)
                            </button>
                            {expandedOrder === order.id && (
                              <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-[#F5F2EB] border-[#D6D1C7]'} border rounded-lg`}>
                                <div className="space-y-4">
                                  {order.timeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-4">
                                      <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'}`}></div>
                                        {idx < order.timeline.length - 1 && (
                                          <div className={`w-0.5 flex-1 mt-2 ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#D6D1C7]'}`} style={{ minHeight: '20px' }}></div>
                                        )}
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <p className={`font-medium mb-1 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                                          {event.description}
                                        </p>
                                        <div className="flex items-center gap-4">
                                          <span className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                                            {new Date(event.timestamp).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: 'numeric',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                          {event.location && (
                                            <span className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                                              📍 {event.location}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timeline */}
                        {order.status !== 'Cancelled' ? (
                          <div className="relative flex justify-between items-center w-full mb-6">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2"></div>
                            <div
                              className="absolute top-1/2 left-0 h-0.5 bg-[#1A4D2E] dark:bg-[#EBE7DE] -z-10 -translate-y-1/2 transition-all duration-500"
                              style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
                            ></div>

                            {steps.map((step, idx) => {
                              const isActive = idx <= currentStep;
                              const isCurrent = idx === currentStep;

                              return (
                                <div key={idx} className="flex flex-col items-center gap-2 bg-inherit">
                                  <div
                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                      isActive
                                        ? (theme === 'dark' ? 'bg-[#EBE7DE] border-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] border-[#1A4D2E] text-white')
                                        : (theme === 'dark' ? 'bg-[#051009] border-[#A8A29E] text-[#A8A29E]' : 'bg-[#F5F2EB] border-[#D6D1C7] text-[#A8A29E]')
                                    } ${isCurrent ? 'scale-110 shadow-lg' : ''}`}
                                  >
                                    {step.icon}
                                  </div>
                                  <span className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${
                                    isActive
                                      ? (theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]')
                                      : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]')
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm text-center font-medium mb-6">
                            This order has been cancelled.
                          </div>
                        )}

                        {/* Order Items */}
                        <div className={`pt-6 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} mb-6`}>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-4`}>Items:</p>
                          <ul className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} space-y-3`}>
                            {order.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-4">
                                {item.imageUrl && (
                                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                )}
                                <div className="flex-1">
                                  <span className={`block ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} font-medium`}>
                                    {item.name} {item.variant && `(${item.variant})`}
                                  </span>
                                  <span className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                                    Qty: {item.quantity} × {formatPrice(convertPrice(item.price))}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Rating System for Delivered Orders */}
                        {order.status === 'Delivered' && (
                          <div className={`mb-6 p-4 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-[#F5F2EB] border-[#D6D1C7]'} border rounded-lg`}>
                            <p className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                              {orderRatings[order.id] ? 'Your Rating' : 'Rate Your Experience'}
                            </p>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  key={star}
                                  onClick={() => handleRateOrder(order.id, star)}
                                  className="focus:outline-none transition-transform hover:scale-110"
                                  aria-label={`Rate ${star} stars`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill={(orderRatings[order.id] || 0) >= star ? 'currentColor' : 'none'}
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className={`w-8 h-8 ${
                                      (orderRatings[order.id] || 0) >= star
                                        ? 'text-yellow-500'
                                        : theme === 'dark'
                                        ? 'text-[#A8A29E]'
                                        : 'text-[#D6D1C7]'
                                    }`}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                                  </svg>
                                </button>
                              ))}
                              {orderRatings[order.id] && (
                                <span className={`ml-3 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                                  {orderRatings[order.id]} / 5 stars
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => handleReorder(order)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                              theme === 'dark'
                                ? 'border-[#EBE7DE] text-[#EBE7DE] hover:bg-[#EBE7DE] hover:text-[#051009]'
                                : 'border-[#1A4D2E] text-[#1A4D2E] hover:bg-[#1A4D2E] hover:text-white'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            Reorder
                          </button>

                          {order.trackingNumber && order.status !== 'Delivered' && (
                            <button
                              onClick={() => handleTrackOrder(order)}
                              className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                                theme === 'dark'
                                  ? 'border-[#2C4A3B] text-[#A8A29E] hover:bg-[#2C4A3B] hover:text-[#EBE7DE]'
                                  : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#F5F2EB] hover:text-[#1A4D2E]'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              Track Order
                            </button>
                          )}

                          <button
                            onClick={() => handleDownloadInvoice(order)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                              theme === 'dark'
                                ? 'border-[#2C4A3B] text-[#A8A29E] hover:bg-[#2C4A3B] hover:text-[#EBE7DE]'
                                : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#F5F2EB] hover:text-[#1A4D2E]'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                            Invoice
                          </button>

                          <button
                            onClick={() => handleContactSupport(order)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                              theme === 'dark'
                                ? 'border-[#2C4A3B] text-[#A8A29E] hover:bg-[#2C4A3B] hover:text-[#EBE7DE]'
                                : 'border-[#D6D1C7] text-[#5D5A53] hover:bg-[#F5F2EB] hover:text-[#1A4D2E]'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                            Support
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  /* Empty State - No Orders */
                  <div className={`p-16 text-center ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border-2 border-dashed`}>
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'} flex items-center justify-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                    <h3 className={`text-2xl font-serif mb-3 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                      {orderFilter === 'all' ? 'No orders yet' : `No ${orderFilter} orders`}
                    </h3>
                    <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-md mx-auto`}>
                      {orderFilter === 'all'
                        ? 'Start exploring our collection of mindful products designed for quiet living.'
                        : `You don't have any ${orderFilter} orders at the moment.`
                      }
                    </p>
                    {orderFilter === 'all' && (
                      <a
                        href="#shop"
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.hash = 'shop';
                        }}
                        className={`inline-block px-8 py-3 text-sm uppercase tracking-widest font-medium transition-all duration-300 ${
                          theme === 'dark'
                            ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#D6D1C7]'
                            : 'bg-[#1A4D2E] text-white hover:bg-[#153e25]'
                        }`}
                      >
                        Explore Products
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WISHLIST TAB */}
          {activeTab === 'wishlist' && (
            <div className="animate-fade-in-up">
              {wishlistProducts.length > 0 ? (
                <div>
                  <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                    {wishlistProducts.length} item{wishlistProducts.length !== 1 ? 's' : ''} saved
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map(product => (
                      <div key={product.id} className={`group ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm transition-all hover:shadow-lg rounded-sm overflow-hidden`}>
                        {/* Product Image */}
                        <div
                          className="relative w-full cursor-pointer overflow-hidden"
                          style={{ aspectRatio: '4/5' }}
                          onClick={() => onProductClick(product)}
                        >
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>

                          {/* Sale Badge */}
                          {product.salePrice && (
                            <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-[#F5F2EB]'}`}>
                              Sale
                            </div>
                          )}

                          {/* Remove from Wishlist */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(product.id);
                            }}
                            className="absolute top-4 right-4 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                            aria-label="Remove from wishlist"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-4">
                          <h3
                            className={`text-lg font-serif mb-1 cursor-pointer hover:underline ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}
                            onClick={() => onProductClick(product)}
                          >
                            {product.name}
                          </h3>
                          <p className={`text-xs uppercase tracking-wider mb-3 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                            {product.category}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                                {formatPrice(getProductPrice(product))}
                              </span>
                              {product.salePrice && (
                                <span className={`text-sm line-through ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]/70'}`}>
                                  {formatPrice(product.price)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => onAddToCart(product)}
                              className={`px-4 py-2 text-xs uppercase tracking-wider font-medium transition-all duration-300 ${
                                theme === 'dark'
                                  ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#D6D1C7]'
                                  : 'bg-[#1A4D2E] text-white hover:bg-[#153e25]'
                              }`}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty State - Wishlist */
                <div className={`p-16 text-center ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border-2 border-dashed`}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'} flex items-center justify-center`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-10 h-10 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <h3 className={`text-2xl font-serif mb-3 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    Your wishlist is empty
                  </h3>
                  <p className={`text-sm mb-8 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-md mx-auto`}>
                    Save your favorite products to your wishlist and never lose track of them.
                  </p>
                  <a
                    href="#shop"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.hash = 'shop';
                    }}
                    className={`inline-block px-8 py-3 text-sm uppercase tracking-widest font-medium transition-all duration-300 ${
                      theme === 'dark'
                        ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#D6D1C7]'
                        : 'bg-[#1A4D2E] text-white hover:bg-[#153e25]'
                    }`}
                  >
                    Discover Products
                  </a>
                </div>
              )}

              {/* Product Recommendations */}
              {recommendations.length > 0 && (
                <div className="mt-12 pt-12 border-t border-[#D6D1C7] dark:border-[#2C4A3B]">
                  <div className="mb-8">
                    <h3 className={`text-2xl font-serif mb-2 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                      You Might Also Like
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                      Based on your purchase history
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recommendations.map(product => (
                      <div
                        key={product.id}
                        className={`group cursor-pointer ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm transition-all hover:shadow-lg rounded-sm overflow-hidden`}
                        onClick={() => onProductClick(product)}
                      >
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/5' }}>
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {product.salePrice && (
                            <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-[#F5F2EB]'}`}>
                              Sale
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className={`text-base font-serif mb-1 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                            {product.name}
                          </h4>
                          <p className={`text-xs uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                            {product.category}
                          </p>
                          <p className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                            {formatPrice(getProductPrice(product))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACCOUNT TAB */}
          {activeTab === 'account' && (
            <div className="animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Account Information */}
                <div className={`p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Account Information</h3>
                    <button className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`}>
                      Edit
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-1`}>Full Name</p>
                      <p className={`text-lg ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{customer.name}</p>
                    </div>

                    <div>
                      <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-1`}>Email</p>
                      <p className={`text-lg ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className={`p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Default Shipping Address</h3>
                    <button className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`}>
                      Edit
                    </button>
                  </div>

                  <div className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    <p>Kathmandu, Nepal</p>
                    <p>44600</p>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="mt-8">
                <div className={`p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <h3 className={`text-xl font-serif mb-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Notification Preferences</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Email Notifications</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Receive order updates via email</p>
                      </div>
                      <button
                        onClick={() => setEmailNotifications(!emailNotifications)}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          emailNotifications
                            ? theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'
                            : theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#D6D1C7]'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          emailNotifications ? 'translate-x-7' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>SMS Notifications</p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Receive order updates via SMS</p>
                      </div>
                      <button
                        onClick={() => setSmsNotifications(!smsNotifications)}
                        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                          smsNotifications
                            ? theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'
                            : theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#D6D1C7]'
                        }`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                          smsNotifications ? 'translate-x-7' : 'translate-x-0'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === 'insights' && (
            <div className="animate-fade-in-up">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <p className={`text-sm uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Total Spent</p>
                  <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    {formatPrice(convertPrice(totalSpent))}
                  </p>
                </div>

                <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <p className={`text-sm uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Avg Order Value</p>
                  <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    {formatPrice(convertPrice(averageOrderValue))}
                  </p>
                </div>

                <div className={`p-6 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                  <p className={`text-sm uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Member Since</p>
                  <p className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    {orders.length > 0 && orders[orders.length - 1]?.createdAt ? new Date(orders[orders.length - 1]!.createdAt).getFullYear() : new Date().getFullYear()}
                  </p>
                </div>
              </div>

              {/* Monthly Spending Chart */}
              <div className={`p-8 mb-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                <h3 className={`text-xl font-serif mb-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Monthly Spending</h3>
                {monthlySpending.length > 0 ? (
                  <div className="space-y-4">
                    {monthlySpending.map(([month, amount]) => (
                      <div key={month}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{month}</span>
                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                            {formatPrice(convertPrice(amount))}
                          </span>
                        </div>
                        <div className={`w-full h-3 ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#F5F2EB]'} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'} rounded-full transition-all duration-500`}
                            style={{ width: `${(amount / maxMonthlySpend) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>No spending data available yet.</p>
                )}
              </div>

              {/* Category Breakdown */}
              <div className={`p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm`}>
                <h3 className={`text-xl font-serif mb-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Spending by Category</h3>
                {categoryBreakdown.length > 0 ? (
                  <div className="space-y-4">
                    {categoryBreakdown.map(([category, amount]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{category}</span>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                          {formatPrice(convertPrice(amount))} ({Math.round((amount / totalSpent) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>No category data available yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
