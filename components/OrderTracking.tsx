/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useContext, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types';
import { SettingsContext } from '../App';
import { ordersApi } from '../lib/api';

interface OrderTrackingProps {
  orders: Order[];
  customerId?: string;
  initialOrderId?: string;
  onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orders, customerId, initialOrderId, onBack }) => {
  const { theme, formatPrice } = useContext(SettingsContext);
  const [searchQuery, setSearchQuery] = useState(initialOrderId || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize with initial order if provided
  useEffect(() => {
    if (initialOrderId) {
      const found = orders.find(o => o.orderNumber === initialOrderId || o.id === initialOrderId);
      if (found) {
        setSelectedOrder(found);
      } else {
        // Try to fetch from API if not found in local state
        handleSearchOrder(initialOrderId);
      }
    }
  }, [initialOrderId, orders]);

  // Subscribe to real-time updates for the selected order
  useEffect(() => {
    if (!selectedOrder?.id) return;

    const subscription = ordersApi.subscribeToUpdates(selectedOrder.id, (updatedOrder) => {
      setSelectedOrder(updatedOrder);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedOrder?.id]);

  const customerOrders = customerId ? orders.filter(o => o.customerId === customerId) : [];

  const handleSearchOrder = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSelectedOrder(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // First check local orders
      const localFound = orders.find(o =>
        o.orderNumber.toLowerCase() === query.toLowerCase() ||
        o.id === query ||
        o.trackingNumber?.toLowerCase() === query.toLowerCase()
      );

      if (localFound) {
        setSelectedOrder(localFound);
      } else {
        // Try to find via API
        let found = await ordersApi.getByOrderNumber(query);
        if (!found) {
          found = await ordersApi.getById(query);
        }
        setSelectedOrder(found);
        if (!found) {
          setSearchError('Order not found');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Failed to search for order');
      setSelectedOrder(null);
    } finally {
      setIsSearching(false);
    }
  }, [orders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchOrder(searchQuery);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
      case 'Confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
      case 'Returned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const statusSteps: OrderStatus[] = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled' || status === 'Returned') return -1;
    return statusSteps.indexOf(status);
  };

  const StatusIcon = ({ status, active }: { status: OrderStatus; active: boolean }) => {
    const iconClass = `w-5 h-5 ${active ? '' : 'opacity-50'}`;
    switch (status) {
      case 'Placed':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'Confirmed':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      case 'Processing':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
      case 'Shipped':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
      case 'Out for Delivery':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>;
      case 'Delivered':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      default:
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
  };

  return (
    <div className={`min-h-screen pt-32 pb-24 px-6 md:px-12 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className={`mb-6 text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'} transition-colors`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className={`text-4xl md:text-5xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-4`}>
            Track Your Order
          </h1>
          <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
            Enter your order number or tracking ID to see the current status
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter order number or tracking ID..."
              className={`flex-1 px-6 py-4 rounded-xl border ${
                theme === 'dark'
                  ? 'bg-[#0a1f14] border-[#2C4A3B] text-[#EBE7DE] placeholder-[#5D5A53]'
                  : 'bg-white border-[#D6D1C7] text-[#1A4D2E] placeholder-[#A8A29E]'
              } focus:border-[#1A4D2E] focus:ring-2 focus:ring-[#1A4D2E]/10 outline-none transition-all text-lg`}
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-4 bg-[#1A4D2E] text-white rounded-xl font-medium hover:bg-[#153e25] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
            >
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : 'Track'}
            </button>
          </div>
        </form>

        {/* Customer's Orders List */}
        {customerId && customerOrders.length > 0 && !selectedOrder && (
          <div className="mb-12">
            <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>
              Your Recent Orders
            </h2>
            <div className="space-y-4">
              {customerOrders.slice(0, 5).map(order => (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full p-6 rounded-xl border text-left transition-all ${
                    theme === 'dark'
                      ? 'bg-[#0a1f14] border-[#2C4A3B] hover:border-[#1A4D2E]'
                      : 'bg-white border-[#D6D1C7] hover:border-[#1A4D2E] hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                        Order #{order.orderNumber}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatPrice(order.total)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected Order Details */}
        {selectedOrder ? (
          <div className={`rounded-2xl border overflow-hidden ${
            theme === 'dark' ? 'bg-[#0a1f14] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'
          }`}>
            {/* Order Header */}
            <div className={`p-6 md:p-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                      Order #{selectedOrder.orderNumber}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'}`}
                >
                  Close
                </button>
              </div>
              {selectedOrder.trackingNumber && (
                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#F5F2EB]'}`}>
                  <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-1`}>
                    Tracking Number
                  </p>
                  <p className={`font-mono font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                    {selectedOrder.trackingNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Progress Timeline */}
            <div className={`p-6 md:p-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>
                Order Progress
              </h3>

              {selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Returned' ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
                  This order has been {selectedOrder.status.toLowerCase()}.
                </div>
              ) : (
                <div className="relative">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-[#1A4D2E] transition-all duration-500"
                      style={{ width: `${(getStepIndex(selectedOrder.status) / (statusSteps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="flex flex-col md:flex-row md:justify-between gap-4 md:gap-0">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(selectedOrder.status);
                      const isActive = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className={`flex md:flex-col items-center gap-3 md:gap-2 ${idx > 0 ? 'md:flex-1' : ''}`}>
                          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? 'bg-[#1A4D2E] border-[#1A4D2E] text-white'
                              : theme === 'dark'
                                ? 'bg-[#051009] border-[#2C4A3B] text-[#5D5A53]'
                                : 'bg-white border-[#D6D1C7] text-[#A8A29E]'
                          } ${isCurrent ? 'ring-4 ring-[#1A4D2E]/20 scale-110' : ''}`}>
                            <StatusIcon status={step} active={isActive} />
                          </div>
                          <span className={`text-xs font-medium ${
                            isActive
                              ? theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'
                              : theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedOrder.estimatedDelivery && selectedOrder.status !== 'Delivered' && (
                <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-green-50'}`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-green-800'}`}>
                    <span className="font-medium">Estimated Delivery:</span> {selectedOrder.estimatedDelivery}
                  </p>
                </div>
              )}
            </div>

            {/* Timeline History */}
            <div className={`p-6 md:p-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>
                Tracking History
              </h3>
              <div className="space-y-0">
                {selectedOrder.timeline.slice().reverse().map((event, idx) => (
                  <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
                    {idx !== selectedOrder.timeline.length - 1 && (
                      <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#D6D1C7]'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                      idx === 0 ? 'bg-[#1A4D2E]' : theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-[#D6D1C7]'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : theme === 'dark' ? 'bg-[#5D5A53]' : 'bg-white'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                        {event.status}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                        {event.description}
                      </p>
                      {event.location && (
                        <p className={`text-xs ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'}`}>
                          {event.location}
                        </p>
                      )}
                      <p className={`text-xs ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'} mt-1`}>
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className={`p-6 md:p-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>
                Order Items
              </h3>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#F5F2EB]'}`}>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                        {item.name}
                      </p>
                      {item.variant && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                          {item.variant}
                        </p>
                      )}
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
              {/* Shipping Address */}
              <div>
                <h3 className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-3`}>
                  Shipping Address
                </h3>
                <div className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.fullName || `${selectedOrder.shippingAddress.firstName} ${selectedOrder.shippingAddress.lastName}`}
                  </p>
                  <p className="text-sm">{selectedOrder.shippingAddress.address}</p>
                  {selectedOrder.shippingAddress.apartment && (
                    <p className="text-sm">{selectedOrder.shippingAddress.apartment}</p>
                  )}
                  <p className="text-sm">
                    {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.state ? `, ${selectedOrder.shippingAddress.state}` : ''} {selectedOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-sm">{selectedOrder.shippingAddress.country}</p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-sm mt-2">{selectedOrder.shippingAddress.phone}</p>
                  )}
                  {selectedOrder.shippingAddress.email && (
                    <p className="text-sm">{selectedOrder.shippingAddress.email}</p>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div>
                <h3 className={`text-sm font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-3`}>
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Subtotal</span>
                    <span className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Shipping</span>
                    <span className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(selectedOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Tax</span>
                    <span className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(selectedOrder.tax)}</span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                    <span className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Total</span>
                    <span className={`font-medium text-lg ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (searchQuery && !selectedOrder && !isSearching) || searchError ? (
          <div className={`text-center py-16 rounded-2xl border ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
            <svg className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-[#A8A29E]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`text-xl font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-2`}>
              {searchError || 'Order Not Found'}
            </h3>
            <p className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
              Please check your order number and try again.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderTracking;
