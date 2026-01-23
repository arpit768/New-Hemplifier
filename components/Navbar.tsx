/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { BRAND_NAME } from '../constants';
import { Product } from '../types';
import { SettingsContext } from '../App';

interface NavbarProps {
  onNavClick: (e: React.MouseEvent<HTMLElement>, targetId: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onSearch: (query: string) => void;
  products: Product[];
  onProductSelect: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavClick, cartCount, onOpenCart, onSearch, products, onProductSelect }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const { language, setLanguage, theme, setTheme, currency, setCurrency, t, formatPrice, getProductPrice, currentUser } = useContext(SettingsContext);

  // Calculate suggestions based on query
  const suggestions = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const q = searchQuery.toLowerCase();
      return products.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.category.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
      ).slice(0, 4); // Limit to top 4
  }, [searchQuery, products]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // Trigger earlier
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    setMobileMenuOpen(false);
    onNavClick(e, targetId);
  };

  const handleCartClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      onOpenCart();
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
          onSearch(searchQuery);
          setMobileMenuOpen(false);
          setSearchOpen(false);
          setSearchQuery('');
      }
  };

  const handleSuggestionClick = (product: Product) => {
      onProductSelect(product);
      setMobileMenuOpen(false);
      setSearchOpen(false);
      setSearchQuery('');
  }

  const textColorClass = theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]';
  
  // Navbar should be transparent initially, then glass effect
  const navBackground = scrolled 
    ? (theme === 'dark' ? 'bg-[#051009]/80 backdrop-blur-xl border-b border-[#2C4A3B]/30' : 'bg-[#F5F2EB]/80 backdrop-blur-xl border-b border-[#1A4D2E]/5') 
    : 'bg-transparent';

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${navBackground} ${scrolled ? 'py-4' : 'py-8'}`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => handleLinkClick(e, 'home')}
            className={`text-2xl md:text-3xl font-serif font-bold tracking-tight z-50 relative transition-colors duration-500 ${textColorClass} flex items-center gap-2`}
          >
            {BRAND_NAME}
          </a>
          
          {/* Center Links - Desktop */}
          <div className={`hidden md:flex items-center gap-12 text-sm font-medium tracking-widest uppercase transition-colors duration-500 ${textColorClass}`}>
            <a href="#shop" onClick={(e) => handleLinkClick(e, 'shop')} className="hover:opacity-60 transition-opacity relative group">
                {t('shop')}
                <span className={`absolute -bottom-1 left-0 w-0 h-px ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:opacity-60 transition-opacity relative group">
                {t('about')}
                <span className={`absolute -bottom-1 left-0 w-0 h-px ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:opacity-60 transition-opacity relative group">
                {t('journal')}
                <span className={`absolute -bottom-1 left-0 w-0 h-px ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'} transition-all duration-300 group-hover:w-full`}></span>
            </a>
          </div>

          {/* Right Actions */}
          <div className={`flex items-center gap-6 z-50 relative transition-colors duration-500 ${textColorClass}`}>
            
             {/* Switches */}
             <div className="hidden md:flex items-center gap-4 mr-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                        {language === 'en' ? 'EN' : 'NP'}
                    </button>
                    <div className="h-3 w-px bg-current opacity-30"></div>
                    <button 
                        onClick={() => setCurrency(currency === 'NPR' ? 'USD' : 'NPR')}
                        className="text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100"
                    >
                        {currency}
                    </button>
                </div>
                
                {/* Theme Toggle Switch */}
                <button 
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none flex items-center ${theme === 'dark' ? 'bg-[#2C4A3B] border border-[#1A4D2E]' : 'bg-[#D6D1C7] border border-[#A8A29E]'}`}
                    title="Toggle Theme"
                    aria-label="Toggle Theme"
                >
                    <div className={`absolute left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}>
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 text-[#1A4D2E]">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5 text-[#EAB308]">
                                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                </button>
             </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center relative">
                <form 
                    onSubmit={handleSearchSubmit} 
                    className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${searchOpen ? `w-64 border-b ${theme === 'dark' ? 'border-[#EBE7DE]' : 'border-[#1A4D2E]'}` : 'w-0 border-transparent'}`}
                >
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        // Delay blur to allow suggestion click
                        onBlur={() => setTimeout(() => !searchQuery && setSearchOpen(false), 200)}
                        placeholder={t('search_placeholder')}
                        className={`w-full bg-transparent border-none outline-none text-sm ${theme === 'dark' ? 'placeholder-[#EBE7DE]/50 text-[#EBE7DE]' : 'placeholder-[#1A4D2E]/50 text-[#1A4D2E]'} pb-1`}
                    />
                </form>
                <button 
                    onClick={() => {
                        setSearchOpen(!searchOpen);
                        if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
                    }}
                    className="hover:opacity-60 transition-opacity ml-2"
                    aria-label="Search"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>

                {/* Suggestions Dropdown */}
                {searchOpen && suggestions.length > 0 && (
                    <div className={`absolute top-full right-0 mt-4 w-80 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-[#F5F2EB] border-[#D6D1C7]'} border shadow-xl z-50 animate-fade-in-up rounded-2xl overflow-hidden`}>
                        {suggestions.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => handleSuggestionClick(product)} 
                                className={`flex items-center gap-4 p-4 ${theme === 'dark' ? 'hover:bg-[#153e25] border-[#2C4A3B]' : 'hover:bg-[#EBE7DE] border-[#D6D1C7]'} cursor-pointer transition-colors border-b last:border-0 group`}
                            >
                                <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} shrink-0 overflow-hidden rounded-md`}>
                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div>
                                    <h4 className={`font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} text-sm leading-tight group-hover:underline underline-offset-2`}>{product.name}</h4>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{formatPrice(getProductPrice(product))}</span>
                                </div>
                            </div>
                        ))}
                        <button 
                            onClick={(e) => {
                                // prevent form submit from taking over if this is clicked
                                e.preventDefault(); 
                                handleSearchSubmit(e);
                            }}
                            className={`w-full p-3 text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E] hover:bg-[#153e25] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:bg-[#EBE7DE] hover:text-[#1A4D2E]'} transition-colors text-left font-medium`}
                        >
                            {t('view_all')}
                        </button>
                    </div>
                )}
            </div>

            <button 
                onClick={(e) => handleLinkClick(e, currentUser ? 'profile' : 'login')}
                className="text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity hidden sm:block"
            >
                {currentUser ? t('my_profile') : t('login')}
            </button>

            <button 
              onClick={handleCartClick}
              className="text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity hidden sm:block"
            >
              {t('cart')} ({cartCount})
            </button>
            
            {/* Mobile Menu Toggle */}
            <button 
              className={`block md:hidden focus:outline-none transition-colors duration-500 ${textColorClass}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
               {mobileMenuOpen ? (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                 </svg>
               )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} z-40 flex flex-col justify-center items-center transition-all duration-500 ease-in-out ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-10 pointer-events-none'
      }`}>
          <div className={`flex flex-col items-center space-y-8 text-2xl font-serif font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} w-full px-12 relative`}>
            
             <div className="flex flex-wrap gap-4 mb-8 justify-center items-center">
                <button
                    onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                    className="text-sm font-bold uppercase tracking-wide border border-current px-4 py-2 rounded-full"
                >
                    {language === 'en' ? 'English' : 'Nepali'}
                </button>
                 <button 
                    onClick={() => setCurrency(currency === 'NPR' ? 'USD' : 'NPR')}
                    className="text-sm font-bold uppercase tracking-wide border border-current px-4 py-2 rounded-full"
                >
                    {currency}
                </button>
                <div className="flex items-center gap-2 border border-current px-4 py-2 rounded-full">
                    <span className="text-sm font-bold uppercase tracking-wide">{theme === 'light' ? 'Light' : 'Dark'}</span>
                    <button 
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none flex items-center ${theme === 'dark' ? 'bg-[#2C4A3B] border border-[#1A4D2E]' : 'bg-[#D6D1C7] border border-[#A8A29E]'}`}
                    >
                        <div className={`absolute left-0.5 w-3.5 h-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-300 flex items-center justify-center ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                </div>
             </div>

            {/* Mobile Search */}
            <div className="w-full max-w-sm relative">
                <form onSubmit={handleSearchSubmit} className={`w-full border-b ${theme === 'dark' ? 'border-[#EBE7DE]' : 'border-[#1A4D2E]'} flex items-center mb-8 relative z-10`}>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('search_placeholder')}
                        className={`w-full bg-transparent border-none outline-none text-lg ${theme === 'dark' ? 'placeholder-[#EBE7DE]/50 text-[#EBE7DE]' : 'placeholder-[#1A4D2E]/50 text-[#1A4D2E]'} py-2 text-center`}
                    />
                    <button type="submit" className="p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </button>
                </form>

                 {/* Mobile Suggestions */}
                {suggestions.length > 0 && (
                    <div className={`absolute top-14 left-0 right-0 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-xl z-20 max-h-60 overflow-y-auto rounded-xl`}>
                         {suggestions.map(product => (
                            <div 
                                key={product.id} 
                                onClick={() => handleSuggestionClick(product)} 
                                className={`flex items-center gap-4 p-4 ${theme === 'dark' ? 'border-[#2C4A3B] hover:bg-[#153e25]' : 'border-[#EBE7DE] hover:bg-[#F5F2EB]'} border-b last:border-0 active:bg-opacity-80`}
                            >
                                <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} shrink-0 rounded`}>
                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-left">
                                    <h4 className={`font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} text-sm`}>{product.name}</h4>
                                    <span className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{formatPrice(getProductPrice(product))}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <a href="#shop" onClick={(e) => handleLinkClick(e, 'shop')} className="hover:opacity-60 transition-opacity">{t('shop')}</a>
            <a href="#about" onClick={(e) => handleLinkClick(e, 'about')} className="hover:opacity-60 transition-opacity">{t('about')}</a>
            <a href="#journal" onClick={(e) => handleLinkClick(e, 'journal')} className="hover:opacity-60 transition-opacity">{t('journal')}</a>
            <a 
                href="#" 
                onClick={(e) => handleLinkClick(e, currentUser ? 'profile' : 'login')} 
                className="hover:opacity-60 transition-opacity"
            >
                {currentUser ? t('my_profile') : t('login')}
            </a>
            <button 
                onClick={handleCartClick} 
                className="hover:opacity-60 transition-opacity text-base uppercase tracking-widest font-sans mt-8"
            >
                {t('cart')} ({cartCount})
            </button>
          </div>
      </div>
    </>
  );
};

export default Navbar;