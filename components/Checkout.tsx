/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext, useState } from 'react';
import { Product } from '../types';
import { SettingsContext } from '../App';

interface CheckoutProps {
  items: Product[];
  onBack: () => void;
  onCheckoutComplete: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ items, onBack, onCheckoutComplete }) => {
  const { formatPrice, getProductPrice, convertPrice, theme, t, currency } = useContext(SettingsContext);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Calculate dynamic price based on current currency
  const getItemPrice = (item: Product) => {
      const basePrice = getProductPrice(item);
      const adjustment = item.selectedVariant ? convertPrice(item.selectedVariant.priceAdjustment) : 0;
      return basePrice + adjustment;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing delay for demo
    setTimeout(() => {
        setIsProcessing(false);
        onCheckoutComplete();
    }, 2000);
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
            
            <div className="space-y-12">
              {/* Section 1: Contact */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('contact_info')}</h2>
                <div className="space-y-4">
                   <input type="email" placeholder="Email address" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   <div className="flex items-center gap-2">
                     <input type="checkbox" id="newsletter" className="accent-[#1A4D2E]" />
                     <label htmlFor="newsletter" className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Email me with news and offers</label>
                   </div>
                </div>
              </div>

              {/* Section 2: Shipping */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('shipping_address')}</h2>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                      <input type="text" placeholder="Last name" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   </div>
                   <input type="text" placeholder="Address" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   <input type="text" placeholder="Apartment, suite, etc. (optional)" className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                      <input type="text" placeholder="Postal code" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   </div>
                </div>
              </div>

               {/* Section 3: Payment */}
              <div>
                <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('payment')}</h2>
                <div className={`p-6 border ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#0a1f12]' : 'border-[#D6D1C7] bg-white/50'} space-y-4`}>
                   <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-2`}>All transactions are secure and encrypted.</p>
                   <input type="text" placeholder="Card number" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Expiration (MM/YY)" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
                      <input type="text" placeholder="Security code" required className={`w-full bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} py-3 outline-none focus:border-current transition-colors`} />
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