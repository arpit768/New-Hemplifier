/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React,  { useState, useEffect, createContext } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import About from './components/About';
import Journal from './components/Journal';
import Assistant from './components/Assistant';
import Footer from './components/Footer';
import { ProductDetail } from './components/ProductDetail';
import JournalDetail from './components/JournalDetail';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Admin from './components/Admin'; 
import Login from './components/Login';
import Register from './components/Register';
import CustomerProfile from './components/CustomerProfile';
import OrderSuccess from './components/OrderSuccess';
import { PRODUCTS, JOURNAL_ARTICLES, TRANSLATIONS } from './constants';
import { Product, JournalArticle, ViewState, Language, Customer, Currency } from './types';

// Create Global Context for Settings
export const SettingsContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
  formatPrice: (price: number) => string;
  getProductPrice: (product: Product) => number;
  convertPrice: (nprAmount: number) => number;
  currentUser: Customer | null;
}>({
  language: 'en',
  setLanguage: () => {},
  currency: 'NPR',
  setCurrency: () => {},
  theme: 'light',
  setTheme: () => {},
  t: (key) => key,
  formatPrice: (p) => `Rs. ${p}`,
  getProductPrice: (p) => p.price,
  convertPrice: (p) => p,
  currentUser: null
});

function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  
  // Settings State - Initialize theme lazily to prevent flash
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('NPR');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('hemplifier-theme');
      if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });
  
  const [currentUser, setCurrentUser] = useState<Customer | null>(null);

  // Data State - Initialize from Local Storage if available
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = localStorage.getItem('hemplifier-products');
      return storedProducts ? JSON.parse(storedProducts) : PRODUCTS;
    } catch (error) {
      console.error("Failed to load products from local storage", error);
      return PRODUCTS;
    }
  });

  const [articles, setArticles] = useState<JournalArticle[]>(() => {
    try {
      const storedArticles = localStorage.getItem('hemplifier-articles');
      return storedArticles ? JSON.parse(storedArticles) : JOURNAL_ARTICLES;
    } catch (error) {
      console.error("Failed to load articles from local storage", error);
      return JOURNAL_ARTICLES;
    }
  });

  // Load other settings from local storage
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('hemplifier-wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      
      const storedUser = localStorage.getItem('hemplifier-user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
      
      // Auto-detect currency based on timezone if not manually overridden later
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timeZone && !timeZone.includes('Kathmandu') && !timeZone.includes('Nepal')) {
          setCurrency('USD');
      } else {
          setCurrency('NPR');
      }

    } catch (error) {
      console.error("Failed to parse local storage", error);
    }
  }, []);

  // Sync settings and data to local storage
  useEffect(() => {
    localStorage.setItem('hemplifier-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('hemplifier-products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('hemplifier-articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('hemplifier-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Authentication
  const handleCustomerLogin = (email: string) => {
      // Mock login logic
      const mockUser: Customer = {
          id: 'c1',
          name: email.split('@')[0], // Extract name from email for demo
          email: email,
          orders: [
              { id: '1023', date: 'April 10, 2025', total: 105000, status: 'Delivered', items: ['Hemplifier Harmony', 'Hemplifier Epoch'] },
              { id: '1024', date: 'May 2, 2025', total: 5800, status: 'Processing', items: ['Sindhu Face Cream'] }
          ]
      };
      // Check if user exists in local storage to persist orders across reloads for demo
      const storedUserStr = localStorage.getItem('hemplifier-user');
      if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser.email === email) {
              setCurrentUser(storedUser);
          } else {
               setCurrentUser(mockUser);
               localStorage.setItem('hemplifier-user', JSON.stringify(mockUser));
          }
      } else {
          setCurrentUser(mockUser);
          localStorage.setItem('hemplifier-user', JSON.stringify(mockUser));
      }
      
      if (pendingCheckout) {
          setPendingCheckout(false);
          setView({ type: 'checkout' });
      } else {
          setView({ type: 'profile' });
      }
  };

  const handleCustomerRegister = (name: string, email: string) => {
      const newUser: Customer = {
          id: `c${Date.now()}`,
          name,
          email,
          orders: []
      };
      setCurrentUser(newUser);
      localStorage.setItem('hemplifier-user', JSON.stringify(newUser));
      
      if (pendingCheckout) {
          setPendingCheckout(false);
          setView({ type: 'checkout' });
      } else {
          setView({ type: 'profile' });
      }
  };

  const handleCustomerLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('hemplifier-user');
      setView({ type: 'home' });
  };

  // Checkout Logic
  const handleCheckoutComplete = () => {
      if (currentUser) {
          const newOrder = {
              id: Math.floor(100000 + Math.random() * 900000).toString(),
              date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              total: cartItems.reduce((sum, item) => {
                  // Always calc in NPR for storage consistency
                  const price = item.salePrice ?? item.price;
                  const adj = item.selectedVariant ? item.selectedVariant.priceAdjustment : 0;
                  return sum + price + adj;
              }, 0),
              status: 'Placed' as const,
              items: cartItems.map(i => i.selectedVariant ? `${i.name} (${i.selectedVariant.name})` : i.name)
          };
          
          const updatedUser = { 
              ...currentUser, 
              orders: [newOrder, ...(currentUser.orders || [])] 
          };
          
          setCurrentUser(updatedUser);
          localStorage.setItem('hemplifier-user', JSON.stringify(updatedUser));
      }

      setCartItems([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setView({ type: 'order-success' });
  };

  const handleAddComment = (articleId: number, comment: { author: string, text: string }) => {
    const newComment = {
        id: `c${Date.now()}`,
        author: comment.author,
        text: comment.text,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    };
    
    const updatedArticles = articles.map(a => 
        a.id === articleId 
        ? { ...a, comments: [newComment, ...(a.comments || [])] }
        : a
    );
    setArticles(updatedArticles);

    // If currently viewing this article, update the view state too so UI reflects immediately
    if (view.type === 'journal-detail' && view.article.id === articleId) {
         const updatedArticle = updatedArticles.find(a => a.id === articleId);
         if (updatedArticle) setView({ ...view, article: updatedArticle });
    }
  };

  // Helper functions exposed via Context
  const t = (key: keyof typeof TRANSLATIONS.en) => {
    return TRANSLATIONS[language][key] || key;
  };

  // Helper: Returns the correct price (NPR or USD) based on current context
  const getProductPrice = (product: Product): number => {
    if (currency === 'USD') {
        if (product.salePriceUsd) return product.salePriceUsd;
        // If there is a salePrice (NPR) but no salePriceUsd, we should convert salePrice
        if (product.salePrice) return product.salePrice / 135;
        
        if (product.priceUsd) return product.priceUsd;
        return product.price / 135; 
    }
    // NPR
    return product.salePrice ?? product.price;
  };

  // Helper: Converts a raw NPR amount to the current currency value (for Order History etc)
  const convertPrice = (nprAmount: number): number => {
      if (currency === 'USD') {
          return nprAmount / 135;
      }
      return nprAmount;
  }

  // Helper: Formats a number into the current currency string
  const formatPrice = (price: number) => {
    if (currency === 'USD') {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    }
    // Nepali currency formatting
    return `Rs. ${price.toLocaleString('en-IN')}`;
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Handle navigation
  const handleNavClick = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPendingCheckout(false); // Reset pending checkout on navigation
    
    switch (targetId) {
        case 'home':
            setView({ type: 'home' });
            break;
        case 'products': // maps to shop
        case 'shop':
            setView({ type: 'shop' });
            break;
        case 'about':
            setView({ type: 'about' });
            break;
        case 'journal':
            setView({ type: 'journal' });
            break;
        case 'admin':
            setView({ type: 'admin' });
            break;
        case 'login':
            setView({ type: 'login' });
            break;
        case 'profile':
            setView({ type: 'profile' });
            break;
        default:
            setView({ type: 'home' });
    }
  };

  const handleSearch = (query: string) => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setView({ type: 'search', query });
  };

  const addToCart = (product: Product) => {
    setCartItems([...cartItems, product]);
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    const newItems = [...cartItems];
    newItems.splice(index, 1);
    setCartItems(newItems);
  };

  const getSearchResults = (query: string) => {
    const q = query.toLowerCase();
    return products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
    );
  };

  const contextValue = {
    language,
    setLanguage,
    currency,
    setCurrency,
    theme,
    setTheme,
    t,
    formatPrice,
    getProductPrice,
    convertPrice,
    currentUser
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#051009] text-[#EBE7DE]' : 'bg-[#F5F2EB] text-[#1A4D2E]'} selection:bg-[#D6D1C7] selection:text-[#1A4D2E]`}>
        {/* Admin View is handled separately to allow full screen take over if needed, 
            but wrapped in context to support theming inside Admin too */}
        {view.type === 'admin' ? (
             <Admin 
                products={products} 
                setProducts={setProducts}
                articles={articles}
                setArticles={setArticles}
                onExit={() => setView({ type: 'home' })}
            />
        ) : (
          <>
            <Navbar 
                onNavClick={handleNavClick} 
                cartCount={cartItems.length}
                onOpenCart={() => setIsCartOpen(true)}
                onSearch={handleSearch}
                products={products}
                onProductSelect={(product) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setView({ type: 'product', product });
                }}
            />
            
            <main>
              {view.type === 'home' && (
                <>
                  <Hero onShopNow={(e) => handleNavClick(e, 'shop')} />
                  
                  {/* Featured Products Teaser */}
                  <div className="py-24 border-b border-[#D6D1C7] dark:border-[#1A4D2E]/30">
                      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-end mb-12">
                          <div>
                              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">{t('curated')}</span>
                              <h3 className={`text-3xl md:text-5xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`}>{t('latest_arrivals')}</h3>
                          </div>
                          <a href="#shop" onClick={(e) => handleNavClick(e, 'shop')} className={`hidden md:inline-block text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB] border-[#F5F2EB]' : 'text-[#1A4D2E] border-[#1A4D2E]'} border-b pb-1 hover:opacity-70 transition-opacity`}>{t('view_all')}</a>
                      </div>
                      <ProductGrid 
                          products={products}
                          onProductClick={(p) => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setView({ type: 'product', product: p });
                          }}
                          wishlist={wishlist}
                          onToggleWishlist={handleToggleWishlist}
                          featured={true}
                          limit={3}
                      />
                      <div className="md:hidden px-6 mt-8 text-center">
                          <a href="#shop" onClick={(e) => handleNavClick(e, 'shop')} className={`inline-block text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB] border-[#F5F2EB]' : 'text-[#1A4D2E] border-[#1A4D2E]'} border-b pb-1`}>{t('view_all')}</a>
                      </div>
                  </div>

                  {/* About Teaser */}
                  <section className="bg-[#1A4D2E] py-32 px-6 md:px-12 text-[#F5F2EB] relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                      <div className="max-w-4xl mx-auto text-center relative z-10">
                          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Born from the earth, <br/> built for the mind.</h2>
                          <p className="text-lg md:text-xl text-[#F5F2EB]/80 font-light leading-relaxed mb-12">
                              Hemplifier designs technology that feels as natural as a stone smoothed by a river. 
                              We reject the distraction of the modern world in favor of silence, texture, and calm.
                          </p>
                          <a href="#about" onClick={(e) => handleNavClick(e, 'about')} className="inline-block px-10 py-4 border border-[#F5F2EB] text-[#F5F2EB] uppercase tracking-widest text-sm hover:bg-[#F5F2EB] hover:text-[#1A4D2E] transition-all duration-500">
                              {t('about')}
                          </a>
                      </div>
                  </section>

                  {/* Journal Teaser */}
                  <div className="py-24">
                      <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-end mb-4">
                          <div>
                              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">Editorial</span>
                              <h3 className={`text-3xl md:text-5xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`}>From the Journal</h3>
                          </div>
                          <a href="#journal" onClick={(e) => handleNavClick(e, 'journal')} className={`hidden md:inline-block text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB] border-[#F5F2EB]' : 'text-[#1A4D2E] border-[#1A4D2E]'} border-b pb-1 hover:opacity-70 transition-opacity`}>{t('read_more')}</a>
                      </div>
                      <Journal 
                          articles={articles}
                          onArticleClick={(a) => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setView({ type: 'journal-detail', article: a });
                          }} 
                          featured={true}
                          limit={2}
                      />
                      <div className="md:hidden px-6 text-center">
                          <a href="#journal" onClick={(e) => handleNavClick(e, 'journal')} className={`inline-block text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#F5F2EB] border-[#F5F2EB]' : 'text-[#1A4D2E] border-[#1A4D2E]'} border-b pb-1`}>{t('read_more')}</a>
                      </div>
                  </div>
                </>
              )}

              {view.type === 'shop' && (
                  <div className="pt-32 min-h-screen animate-fade-in-up">
                      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-12">
                          <h1 className={`text-5xl md:text-7xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'} mb-6`}>The Collection</h1>
                          <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-2xl font-light`}>Mindful objects crafted for a quieter life. Explore our range of audio, wearable, and home technology.</p>
                      </div>
                      <ProductGrid 
                          products={products}
                          onProductClick={(p) => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setView({ type: 'product', product: p });
                          }}
                          wishlist={wishlist}
                          onToggleWishlist={handleToggleWishlist}
                      />
                  </div>
              )}

              {view.type === 'search' && (
                  <div className="pt-32 min-h-screen animate-fade-in-up">
                      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-12">
                          <h1 className={`text-3xl md:text-5xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'} mb-6`}>Search Results</h1>
                          <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-2xl font-light`}>
                              Found {getSearchResults(view.query).length} results for "{view.query}"
                          </p>
                      </div>
                      <ProductGrid 
                          products={getSearchResults(view.query)}
                          onProductClick={(p) => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setView({ type: 'product', product: p });
                          }}
                          wishlist={wishlist}
                          onToggleWishlist={handleToggleWishlist}
                      />
                  </div>
              )}

              {view.type === 'about' && (
                  <div className="pt-24 min-h-screen animate-fade-in-up">
                      <About />
                  </div>
              )}

              {view.type === 'journal' && (
                  <div className="pt-32 min-h-screen animate-fade-in-up">
                      <div className="max-w-[1800px] mx-auto px-6 md:px-12 mb-12">
                          <h1 className={`text-5xl md:text-7xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'} mb-6`}>The Journal</h1>
                          <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-2xl font-light`}>Thoughts on design, nature, and the art of slowing down.</p>
                      </div>
                      <Journal 
                          articles={articles}
                          onArticleClick={(a) => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setView({ type: 'journal-detail', article: a });
                          }} 
                      />
                  </div>
              )}

              {view.type === 'product' && (
                <ProductDetail 
                  product={view.product} 
                  allProducts={products}
                  onProductClick={(p) => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setView({ type: 'product', product: p });
                  }}
                  onBack={() => {
                    setView({ type: 'shop' });
                  }}
                  onAddToCart={addToCart}
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                />
              )}

              {view.type === 'journal-detail' && (
                <JournalDetail 
                  article={view.article} 
                  onBack={() => setView({ type: 'journal' })}
                  onAddComment={handleAddComment}
                  currentUser={currentUser}
                  onLogin={() => setView({ type: 'login' })}
                />
              )}

              {view.type === 'checkout' && (
                  <Checkout 
                      items={cartItems}
                      onBack={() => setView({ type: 'home' })}
                      onCheckoutComplete={handleCheckoutComplete}
                  />
              )}

              {view.type === 'order-success' && (
                  <OrderSuccess 
                      onContinue={() => {
                          setView({ type: 'shop' });
                      }}
                  />
              )}

              {view.type === 'login' && (
                  <Login 
                      onLogin={handleCustomerLogin}
                      onNavigateToRegister={() => setView({ type: 'register' })}
                      message={pendingCheckout ? "Please sign in to complete your purchase." : undefined}
                  />
              )}

              {view.type === 'register' && (
                  <Register 
                      onRegister={handleCustomerRegister}
                      onNavigateToLogin={() => setView({ type: 'login' })}
                      message={pendingCheckout ? "Create an account to checkout." : undefined}
                  />
              )}

              {view.type === 'profile' && currentUser && (
                  <CustomerProfile 
                      customer={currentUser}
                      onLogout={handleCustomerLogout}
                  />
              )}
            </main>

            {view.type !== 'checkout' && <Footer onLinkClick={handleNavClick} />}
            
            <Assistant products={products} />
            
            <CartDrawer 
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              onRemoveItem={removeFromCart}
              onCheckout={() => {
                  setIsCartOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  if (currentUser) {
                      setView({ type: 'checkout' });
                  } else {
                      setPendingCheckout(true);
                      setView({ type: 'login' });
                  }
              }}
            />
          </>
        )}
      </div>
    </SettingsContext.Provider>
  );
}

export default App;