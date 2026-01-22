/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useMemo, useEffect, useContext } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { SettingsContext } from '../App';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  featured?: boolean;
  limit?: number;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick, wishlist, onToggleWishlist, featured = false, limit }) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { getProductPrice, currency, theme } = useContext(SettingsContext);
  
  // Memoize filter options so they are not recalculated on every render
  const { categories, maxPrice, allFeatures } = useMemo(() => {
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
    // Calculate max price based on current currency context
    const maxPrice = products.length > 0 ? Math.max(...products.map(p => getProductPrice(p))) : 0;
    const allFeatures = Array.from(new Set(products.flatMap(p => p.features)));
    return { categories, maxPrice, allFeatures };
  }, [products, currency, getProductPrice]);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceLimit, setPriceLimit] = useState(maxPrice);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Update price limit when maxPrice changes (e.g. products loaded or currency changed)
  useEffect(() => {
     setPriceLimit(maxPrice);
  }, [maxPrice]);

  useEffect(() => {
    let tempProducts = products;

    // Filter by Category
    if (selectedCategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }

    // Filter by Price
    tempProducts = tempProducts.filter(p => getProductPrice(p) <= priceLimit);
    
    // Filter by Features
    if (selectedFeatures.length > 0) {
      tempProducts = tempProducts.filter(p => 
        selectedFeatures.every(feature => p.features.includes(feature))
      );
    }
    
    // Apply Limit if provided (for featured sections)
    if (limit && limit > 0) {
        tempProducts = tempProducts.slice(0, limit);
    }
    
    setFilteredProducts(tempProducts);
  }, [selectedCategory, priceLimit, selectedFeatures, limit, products, getProductPrice]);

  const handleFeatureChange = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };
  
  const resetFilters = () => {
      setSelectedCategory('All');
      setPriceLimit(maxPrice);
      setSelectedFeatures([]);
  }

  return (
    <section id="products" className={`${featured ? 'py-0' : 'py-12'} px-6 md:px-12 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'}`} aria-labelledby="collection-heading">
      <div className="max-w-[1800px] mx-auto">
        
        {/* Header Area - Only show filters on non-featured views */}
        {!featured && (
            <div className={`flex flex-col md:flex-row justify-between items-center text-center md:text-left mb-16 pb-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Showing {filteredProducts.length} items</span>
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-sm uppercase tracking-widest font-medium ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] border-[#2C4A3B] hover:border-[#EBE7DE] bg-[#153e25]/50' : 'text-[#5D5A53] hover:text-[#1A4D2E] border-[#D6D1C7] hover:border-[#1A4D2E] bg-white/50'} transition-colors border px-6 py-3`}
                aria-expanded={isFilterOpen}
                aria-controls="filter-panel"
            >
                {isFilterOpen ? 'Close Filters' : 'Filter'}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
            </button>
            </div>
        )}
        
        {/* Filter Panel */}
        {!featured && (
            <div id="filter-panel" className={`overflow-hidden transition-all duration-700 ease-in-out ${isFilterOpen ? 'max-h-[1000px] mb-24' : 'max-h-0'}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-12 pb-12">
                    {/* Category Filter */}
                    <fieldset>
                        <legend className={`font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6 tracking-wide text-sm uppercase`}>Category</legend>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 text-sm transition-colors duration-300 ${
                                    selectedCategory === cat 
                                        ? (theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] text-[#F5F2EB]') 
                                        : (theme === 'dark' ? 'bg-[#153e25] hover:bg-[#2C4A3B] border border-[#2C4A3B] text-[#A8A29E]' : 'bg-white hover:bg-[#EBE7DE] border border-[#EBE7DE]')
                                }`}
                                aria-pressed={selectedCategory === cat}
                            >
                                {cat}
                            </button>
                            ))}
                        </div>
                    </fieldset>

                    {/* Price Filter */}
                    <div>
                        <label htmlFor="price-range" className={`font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6 tracking-wide text-sm uppercase block`}>Max Price ({currency})</label>
                        <div className="flex flex-col">
                            <input 
                                id="price-range"
                                type="range"
                                min="0"
                                max={maxPrice}
                                value={priceLimit}
                                onChange={(e) => setPriceLimit(Number(e.target.value))}
                                className={`w-full ${theme === 'dark' ? 'accent-[#EBE7DE]' : 'accent-[#1A4D2E]'}`}
                                aria-valuetext={`${priceLimit}`}
                            />
                            <span className={`text-center mt-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light`} aria-hidden="true">{priceLimit}</span>
                        </div>
                    </div>
                    
                    {/* Features Filter */}
                    <fieldset className="lg:col-span-2">
                        <legend className={`font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6 tracking-wide text-sm uppercase`}>Features</legend>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allFeatures.map(feature => (
                            <div key={feature} className="flex items-center">
                                <input 
                                    type="checkbox"
                                    id={feature}
                                    checked={selectedFeatures.includes(feature)}
                                    onChange={() => handleFeatureChange(feature)}
                                    className={`w-4 h-4 ${theme === 'dark' ? 'accent-[#EBE7DE] bg-[#153e25] border-[#2C4A3B]' : 'accent-[#1A4D2E] bg-gray-100 border-gray-300'}`}
                                />
                                <label htmlFor={feature} className={`ml-2 text-sm font-light ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{feature}</label>
                            </div>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <div className={`flex justify-end gap-4 pt-8 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                    <button onClick={resetFilters} className={`text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#A8A29E] hover:text-[#1A4D2E]'} transition-colors underline underline-offset-4`}>Reset Filters</button>
                </div>
            </div>
        )}

        {/* Large Grid */}
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24" aria-label="Products">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <li key={product.id}>
                <ProductCard 
                  product={product} 
                  onClick={onProductClick} 
                  wishlist={wishlist}
                  onToggleWishlist={onToggleWishlist}
                />
              </li>
            ))
          ) : (
            <li className="md:col-span-2 lg:col-span-3">
              <div role="status" className={`text-center py-24 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                 <p className="text-lg">No products match your criteria.</p>
                 <p className="text-sm mt-2">Try adjusting your filters.</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default ProductGrid;