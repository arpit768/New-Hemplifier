/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext, useState } from 'react';
import { Product, ShippingAddress } from '../types';
import { SettingsContext } from '../App';

interface CheckoutProps {
  items: Product[];
  onBack: () => void;
  onCheckoutComplete: (shippingAddress: ShippingAddress, paymentMethod: string) => void | Promise<void>;
  customerEmail?: string;
  customerName?: string;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onBack, onCheckoutComplete, customerEmail = '', customerName = '' }) => {
  const { formatPrice, getProductPrice, convertPrice, theme, t, currency } = useContext(SettingsContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for shipping address
  const [formData, setFormData] = useState({
    email: customerEmail,
    firstName: customerName.split(' ')[0] || '',
    lastName: customerName.split(' ').slice(1).join(' ') || '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'Nepal',
    phone: '',
    newsletter: false,
  });

  // Payment method state - only COD available
  const [paymentMethod] = useState('cod');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate dynamic price based on current currency
  const getItemPrice = (item: Product) => {
      const basePrice = getProductPrice(item);
      const adjustment = item.selectedVariant ? convertPrice(item.selectedVariant.priceAdjustment) : 0;
      return basePrice + adjustment;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Build shipping address object
      const shippingAddress: ShippingAddress = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      };

      // Call the checkout complete handler with collected data
      await Promise.resolve(onCheckoutComplete(shippingAddress, paymentMethod));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-24 px-6 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onBack}
          className={`group flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[#A8A29E] ${theme === 'dark' ? 'hover:text-[#EBE7DE]' : 'hover:text-[#1A4D2E]'} transition-colors mb-12`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t('back_to_shop')}
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Form */}
          <div>
            <h1 className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-12`}>{t('checkout')}</h1>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-12">
              {/* Section 1: Contact */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('contact_info')}</h2>
                <div className="space-y-4">
                   <input
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleInputChange}
                     placeholder="Email address"
                     required
                     className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                   />
                   <input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleInputChange}
                     placeholder="Phone number"
                     className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                   />
                   <div className="flex items-center gap-2">
                     <input
                       type="checkbox"
                       id="newsletter"
                       name="newsletter"
                       checked={formData.newsletter}
                       onChange={handleInputChange}
                       className="accent-[#1A4D2E]"
                     />
                     <label htmlFor="newsletter" className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Email me with news and offers</label>
                   </div>
                </div>
              </div>

              {/* Section 2: Shipping */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('shipping_address')}</h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First name"
                        required
                        className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last name"
                        required
                        className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                      />
                   </div>
                   <input
                     type="text"
                     name="address"
                     value={formData.address}
                     onChange={handleInputChange}
                     placeholder="Address"
                     required
                     className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                   />
                   <input
                     type="text"
                     name="apartment"
                     value={formData.apartment}
                     onChange={handleInputChange}
                     placeholder="Apartment, suite, etc. (optional)"
                     className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                   />
                   <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                        className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                      />
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="Postal code"
                        required
                        className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`}
                      />
                   </div>
                </div>
              </div>

               {/* Section 3: Payment */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('payment')}</h2>

                {/* Payment Method - Cash on Delivery Only */}
                <div className={`p-6 border ${theme === 'dark' ? 'border-[#EBE7DE] bg-[#1A4D2E]/20' : 'border-[#1A4D2E] bg-[#1A4D2E]/5'} rounded-lg`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'} flex items-center justify-center`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-6 h-6 ${theme === 'dark' ? 'text-[#051009]' : 'text-white'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-2`}>
                        Cash on Delivery
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} leading-relaxed`}>
                        Pay with cash when your order is delivered to your doorstep. Please have the exact amount ready for the delivery person.
                      </p>
                    </div>
                  </div>

                  <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#1A4D2E]/20'}`}>
                    <div className="flex items-center gap-2 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                        Safe and convenient payment method
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button 
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-5 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-wait`}
                >
                    {isProcessing ? t('processing') : `${t('pay_now')} — ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Summary */}
          <div className={`lg:pl-12 lg:border-l ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
            <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-8`}>{t('order_summary')}</h2>
            
            <div className="space-y-6 mb-8">
               {items.map((item, idx) => (
                 <div key={idx} className="flex gap-4">
                    <div className={`w-16 h-16 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} relative`}>
                       <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                       <span className={`absolute -top-2 -right-2 w-5 h-5 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-white'} text-[10px] flex items-center justify-center rounded-full`}>1</span>
                    </div>
                    <div className="flex-1">
                       <h3 className={`font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} text-base`}>{item.name}</h3>
                       <p className="text-xs text-[#A8A29E]">{item.category}</p>
                    </div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#5D5A53]'}`}>{formatPrice(getItemPrice(item))}</span>
                 </div>
               ))}
            </div>

            <div className={`border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} pt-6 space-y-2`}>
              <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                 <span>{t('subtotal')}</span>
                 <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={`flex justify-between text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                 <span>{t('shipping')}</span>
                 <span>{t('free')}</span>
              </div>
            </div>
            
            <div className={`border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} mt-6 pt-6`}>
               <div className="flex justify-between items-center">
                 <span className={`font-serif text-xl ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{t('total')}</span>
                 <div className="flex items-end gap-2">
                   <span className="text-xs text-[#A8A29E] mb-1">{currency}</span>
                   <span className={`font-serif text-2xl ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(total)}</span>
                 </div>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;