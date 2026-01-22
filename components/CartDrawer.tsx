/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext } from 'react';
import { Product } from '../types';
import { SettingsContext } from '../App';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemoveItem, onCheckout }) => {
  const { formatPrice, getProductPrice, convertPrice, theme, t } = useContext(SettingsContext);
  
  // Calculate dynamic price based on current currency
  const getItemPrice = (item: Product) => {
      const basePrice = getProductPrice(item);
      const adjustment = item.selectedVariant ? convertPrice(item.selectedVariant.priceAdjustment) : 0;
      return basePrice + adjustment;
  };

  const total = items.reduce((sum, item) => sum + getItemPrice(item), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#1A4D2E]/30 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[450px] ${theme === 'dark' ? 'bg-[#051009] border-[#2C4A3B]' : 'bg-[#F5F2EB] border-[#D6D1C7]'} z-[70] shadow-2xl transform transition-transform duration-500 ease-in-out border-l flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
          <h2 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{t('cart')} ({items.length})</h2>
          <button 
            onClick={onClose} 
            className={`text-[#A8A29E] ${theme === 'dark' ? 'hover:text-[#EBE7DE]' : 'hover:text-[#1A4D2E]'} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-[#A8A29E]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <p className={`font-light ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex gap-4 animate-fade-in-up">
                <div className={`w-20 h-24 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} flex-shrink-0`}>
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                        <h3 className={`font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{item.name}</h3>
                        <span className={`text-sm font-light ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(getItemPrice(item))}</span>
                    </div>
                    <p className="text-xs text-[#A8A29E] uppercase tracking-widest mt-1">{item.category}</p>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(idx)}
                    className={`text-xs text-[#A8A29E] ${theme === 'dark' ? 'hover:text-[#EBE7DE]' : 'hover:text-[#1A4D2E]'} self-start underline underline-offset-4 transition-colors`}
                  >
                    {t('remove')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#0a1f12]' : 'border-[#D6D1C7] bg-[#EBE7DE]/30'}`}>
          <div className="flex justify-between items-center mb-6">
            <span className={`text-sm font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{t('subtotal')}</span>
            <span className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-[#A8A29E] mb-6 text-center">Shipping and taxes calculated at checkout.</p>
          <button 
            onClick={onCheckout}
            disabled={items.length === 0}
            className={`w-full py-4 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {t('checkout')}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;