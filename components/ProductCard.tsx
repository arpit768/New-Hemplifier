/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useContext } from 'react';
import { Product } from '../types';
import { SettingsContext } from '../App';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, wishlist, onToggleWishlist }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { formatPrice, getProductPrice, theme, t, currency } = useContext(SettingsContext);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Trigger click on Enter or Space key press for keyboard accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(product);
    }
  };

  const isWishlisted = wishlist.includes(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onToggleWishlist(product.id);
  };
  
  const headingId = `product-heading-${product.id}`;

  const currentPrice = getProductPrice(product);

  const originalPrice = currency === 'USD' 
    ? (product.priceUsd || product.price / 135) 
    : product.price;

  const isOnSale = currentPrice < originalPrice;

  return (
    <article 
      className="group flex flex-col gap-4 cursor-pointer focus:outline-none" 
      onClick={() => onClick(product)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-labelledby={headingId}
    >
      <div 
        className={`relative w-full overflow-hidden ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} rounded-sm`}
        style={{ aspectRatio: '4/5' }}
      >
        <img 
          src={product.imageUrl} 
          alt="" 
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        
        {/* Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>

        {/* Sale Badge */}
        {isOnSale && (
            <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-20 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-[#F5F2EB]'}`}>
                Sale
            </div>
        )}
      
        {/* Wishlist Button */}
        <button 
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 p-2 rounded-full ${theme === 'dark' ? 'text-[#EBE7DE] hover:bg-black/50' : 'text-[#1A4D2E] hover:bg-white/80'} transition-all z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all ${isWishlisted ? (theme === 'dark' ? 'fill-[#EBE7DE]' : 'fill-[#1A4D2E]') : `fill-transparent ${theme === 'dark' ? 'stroke-[#EBE7DE]' : 'stroke-[#1A4D2E]'} stroke-2`}`}>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
           </svg>
        </button>

        {/* Quick View / Add Button overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button className={`w-full ${theme === 'dark' ? 'bg-[#153e25]/90 text-[#EBE7DE] hover:bg-[#EBE7DE] hover:text-[#1A4D2E]' : 'bg-white/90 text-[#1A4D2E] hover:bg-[#1A4D2E] hover:text-white'} backdrop-blur-sm py-3 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg`}>
                {t('quick_view')}
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 items-start">
        <h3 id={headingId} className={`text-lg font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} group-hover:underline underline-offset-4 decoration-1`}>{product.name}</h3>
        <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-medium uppercase tracking-wider opacity-70`}>{product.category}</p>
        <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
              {formatPrice(currentPrice)}
            </span>
            {isOnSale && (
                <span className={`text-xs line-through ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]/70'}`}>
                    {formatPrice(originalPrice)}
                </span>
            )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;