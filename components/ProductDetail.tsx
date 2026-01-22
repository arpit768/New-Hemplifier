/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useRef, useMemo, useEffect, useContext } from 'react';
import { Product, ProductVariant } from '../types';
import ProductGrid from './ProductGrid';
import { SettingsContext } from '../App';

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onProductClick: (product: Product) => void;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, allProducts, onProductClick, onBack, onAddToCart, wishlist, onToggleWishlist }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [shareText, setShareText] = useState('Share');
  
  const { formatPrice, getProductPrice, theme, t, convertPrice } = useContext(SettingsContext);

  // Refs for Zoom Performance
  const imageRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const [isZooming, setIsZooming] = useState(false);
  
  // State for image loading fade-in
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    // Reset selection on product change, or select first variant
    if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0] ?? null);
    } else {
        setSelectedVariant(null);
    }
  }, [product]);
  
  const LENS_SIZE = 180;
  const ZOOM_LEVEL = 2.5;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !lensRef.current) return;
    
    const { top, left, width, height } = imageRef.current.getBoundingClientRect();
    
    // Cursor position relative to the image
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Center lens on cursor visually, but clamp it within the image container
    let lensX = x - LENS_SIZE / 2;
    let lensY = y - LENS_SIZE / 2;

    // Clamp the visual lens position so it doesn't go outside the image
    const clampedLensX = Math.max(0, Math.min(lensX, width - LENS_SIZE));
    const clampedLensY = Math.max(0, Math.min(lensY, height - LENS_SIZE));
    
    // Update lens position directly via ref (no re-render)
    lensRef.current.style.top = `${clampedLensY}px`;
    lensRef.current.style.left = `${clampedLensX}px`;

    // Calculate background position.
    const centerX = clampedLensX + LENS_SIZE / 2;
    const centerY = clampedLensY + LENS_SIZE / 2;
    
    const bgX = (LENS_SIZE / 2) - (centerX * ZOOM_LEVEL);
    const bgY = (LENS_SIZE / 2) - (centerY * ZOOM_LEVEL);

    lensRef.current.style.backgroundPosition = `${bgX}px ${bgY}px`;
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: product.description,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User probably cancelled the share action, do nothing.
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        setShareText('Copied!');
        setTimeout(() => setShareText('Share'), 2000);
      });
    }
  };

  const isWishlisted = wishlist.includes(product.id);

  // Recommendation Logic
  const relatedProducts = useMemo(() => {
    // Filter out current product
    const others = allProducts.filter(p => p.id !== product.id);
    // Prioritize same category
    const sameCategory = others.filter(p => p.category === product.category);
    const differentCategory = others.filter(p => p.category !== product.category);
    
    // Combine, prioritizing same category, take top 3
    return [...sameCategory, ...differentCategory].slice(0, 3);
  }, [product, allProducts]);

  const basePrice = getProductPrice(product);
  // Calculate price adjustment dynamically based on selected variant and currency conversion
  const variantAdjustment = selectedVariant ? convertPrice(selectedVariant.priceAdjustment) : 0;
  const currentPrice = basePrice + variantAdjustment;
  
  // Check stock availability
  const isOutOfStock = selectedVariant ? selectedVariant.stock <= 0 : false;

  const handleAddToCart = () => {
      if (isOutOfStock) return;
      
      // We pass the product object WITHOUT overwriting price, but WITH selectedVariant.
      // This allows the Cart to recalculate the price dynamically based on current currency settings.
      const productToAdd = selectedVariant 
        ? { ...product, name: `${product.name} - ${selectedVariant.name}`, selectedVariant } 
        : { ...product };
        
      onAddToCart(productToAdd);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtu.be')) {
      const id = url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('youtube.com')) {
      const params = new URLSearchParams(new URL(url).search);
      const id = params.get('v');
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  };

  return (
    <div className={`pt-24 min-h-screen ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pb-24">
        
        {/* Breadcrumb / Back */}
        <button 
          onClick={onBack}
          className={`group flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#F5F2EB]' : 'text-[#A8A29E] hover:text-[#1A4D2E]'} transition-colors mb-8`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          {t('back_to_shop')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* Left: Main Image with Zoom */}
          <div className="flex flex-col gap-4 relative z-10">
            <div 
              ref={imageRef}
              className={`relative w-full overflow-hidden cursor-crosshair shadow-sm ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'}`}
              style={{ aspectRatio: '4/5' }}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
            >
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                onLoad={() => setIsLoaded(true)}
                className="w-full h-full object-cover transition-opacity duration-700 ease-out"
                style={{ opacity: isLoaded ? (isZooming ? 0.8 : 1) : 0 }}
              />
              
              {/* Zoom Lens */}
              <div 
                  ref={lensRef}
                  className={`absolute pointer-events-none border ${theme === 'dark' ? 'border-[#EBE7DE]/20 bg-black' : 'border-[#1A4D2E]/20 bg-white'} shadow-2xl rounded-full bg-no-repeat z-20`}
                  style={{
                      width: LENS_SIZE,
                      height: LENS_SIZE,
                      opacity: isZooming ? 1 : 0, // Toggle visibility with opacity instead of unmounting
                      backgroundImage: `url(${product.imageUrl})`,
                      // Background size needs to be updated if image resizes, but for fixed aspect ratio it's okay-ish to approximate or update on hover enter. 
                      // For simplicity, we assume 100% width container.
                      backgroundSize: `${(imageRef.current?.offsetWidth || 0) * ZOOM_LEVEL}px ${(imageRef.current?.offsetHeight || 0) * ZOOM_LEVEL}px`,
                  }}
              />

              {/* Wishlist Button - Absolute Top Right */}
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(product.id); }}
                className={`absolute top-6 right-6 p-3 ${theme === 'dark' ? 'bg-black/60 text-[#EBE7DE] hover:bg-black' : 'bg-white/60 text-[#1A4D2E] hover:bg-white'} backdrop-blur-sm rounded-full transition-all z-30 shadow-sm`}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-6 h-6 transition-all ${isWishlisted ? (theme === 'dark' ? 'fill-[#EBE7DE] scale-110' : 'fill-[#1A4D2E] scale-110') : `fill-transparent ${theme === 'dark' ? 'stroke-[#EBE7DE]' : 'stroke-[#1A4D2E]'} stroke-2`}`}>
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.344-.688 15.247 15.247 0 01-1.344-.688c-.058-.033-.115-.067-.172-.101l-1.17-1.17a15.247 15.247 0 01-1.344-.688c-.058-.033-.115-.067-.172-.101l-1.17-1.17a15.247 15.247 0 01-1.344-.688c-.058-.033-.115-.067-.172-.101l-1.17-1.17ZM12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z" />
           </svg>
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col h-full">
            <div className="flex-1">
                <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'} mb-4 block`}>{product.category}</span>
                <h1 className={`text-4xl md:text-6xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{product.name}</h1>
                <p className={`text-2xl font-light ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-8`}>{formatPrice(currentPrice)}</p>
                
                {/* Updated to support rich text */}
                <div 
                    className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light leading-relaxed mb-8 text-lg 
                    [&>p]:mb-4 
                    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 
                    [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4
                    [&>h1]:text-3xl [&>h1]:font-serif ${theme === 'dark' ? '[&>h1]:text-[#EBE7DE]' : '[&>h1]:text-[#1A4D2E]'} [&>h1]:mb-4 [&>h1]:mt-8
                    [&>h2]:text-2xl [&>h2]:font-serif ${theme === 'dark' ? '[&>h2]:text-[#EBE7DE]' : '[&>h2]:text-[#1A4D2E]'} [&>h2]:mb-3 [&>h2]:mt-6
                    [&>h3]:text-xl [&>h3]:font-serif ${theme === 'dark' ? '[&>h3]:text-[#EBE7DE]' : '[&>h3]:text-[#1A4D2E]'} [&>h3]:mb-2 [&>h3]:mt-4
                    [&>a]:text-[#1A4D2E] [&>a]:underline [&>a]:underline-offset-4 ${theme === 'dark' ? '[&>a]:text-[#EBE7DE] [&>a]:hover:text-[#A8A29E]' : '[&>a]:hover:text-[#2e5c41]'} [&>a]:decoration-1`}
                    dangerouslySetInnerHTML={{ __html: product.longDescription || product.description }}
                />

                <div className="space-y-6 mb-12">
                    {product.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="w-1.5 h-1.5 bg-[#A8A29E] rounded-full"></span>
                            <span className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light`}>{feature}</span>
                        </div>
                    ))}
                </div>

                {product.variants && product.variants.length > 0 && (
                    <div className="mb-12">
                        <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-4 block`}>Select Option</span>
                        <div className="flex gap-4 flex-wrap">
                            {product.variants.map(variant => {
                                const isVariantOutOfStock = variant.stock <= 0;
                                return (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`px-6 py-4 flex flex-col items-center justify-center border transition-all min-w-[5rem] relative rounded-lg ${
                                        selectedVariant?.id === variant.id 
                                            ? (theme === 'dark' ? 'border-[#EBE7DE] bg-[#EBE7DE] text-[#051009]' : 'border-[#1A4D2E] bg-[#1A4D2E] text-[#F5F2EB]')
                                            : (theme === 'dark' ? 'border-[#2C4A3B] text-[#A8A29E] hover:border-[#EBE7DE]' : 'border-[#D6D1C7] text-[#5D5A53] hover:border-[#1A4D2E]')
                                    } ${isVariantOutOfStock ? 'opacity-60' : 'cursor-pointer'}`}
                                >
                                    <span className="font-medium text-sm">{variant.name}</span>
                                    {isVariantOutOfStock && (
                                        <span className={`text-[9px] font-bold uppercase tracking-wider absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full whitespace-nowrap border shadow-sm ${theme === 'dark' ? 'bg-[#051009] border-[#2C4A3B] text-[#A8A29E]' : 'bg-[#F5F2EB] border-[#D6D1C7] text-[#5D5A53]'}`}>
                                            Sold Out
                                        </span>
                                    )}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className={`border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} pt-8 flex gap-4`}>
                <button 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 ${
                        isOutOfStock 
                            ? (theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] cursor-not-allowed opacity-60' : 'bg-[#D6D1C7] text-[#5D5A53] cursor-not-allowed opacity-60')
                            : (theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]')
                    } py-4 px-8 uppercase tracking-widest text-sm font-medium transition-colors`}
                >
                    {isOutOfStock ? 'Out of Stock' : t('add_to_cart')}
                </button>
                <button 
                    onClick={handleShare}
                    className={`px-6 border ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] hover:border-[#EBE7DE]' : 'border-[#D6D1C7] text-[#1A4D2E] hover:border-[#1A4D2E]'} uppercase tracking-widest text-sm font-medium transition-colors min-w-[120px]`}
                >
                    {shareText}
                </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {product.gallery && product.gallery.length > 0 && (
            <div className="mt-32">
                <h3 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-12`}>Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {product.gallery.map((img, idx) => (
                        <div key={idx} className={`aspect-[4/3] overflow-hidden ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'}`}>
                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Video Section */}
        {product.videoUrl && (
            <div className={`mt-32 pt-16 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                <h3 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-12`}>Product Experience</h3>
                <div className="w-full aspect-video overflow-hidden bg-black">
                     {getEmbedUrl(product.videoUrl) ? (
                        <iframe 
                          src={getEmbedUrl(product.videoUrl)!} 
                          className="w-full h-full" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                     ) : (
                        <video 
                           src={product.videoUrl} 
                           className="w-full h-full object-cover" 
                           controls 
                        >
                           Your browser does not support the video tag.
                        </video>
                     )}
                </div>
            </div>
        )}

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
            <div className={`mt-32 pt-16 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                <h3 className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-12`}>You Might Also Like</h3>
                <ProductGrid 
                    products={relatedProducts}
                    onProductClick={onProductClick}
                    wishlist={wishlist}
                    onToggleWishlist={onToggleWishlist}
                    featured={true}
                />
            </div>
        )}
      </div>
    </div>
  );
};