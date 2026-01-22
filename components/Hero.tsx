/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext, useEffect, useRef } from 'react';
import { SettingsContext } from '../App';

interface HeroProps {
    onShopNow: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  const { theme, t } = useContext(SettingsContext);
  
  // Use refs for direct DOM manipulation to improve performance
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!blob1Ref.current || !blob2Ref.current) return;

        // Dampen the movement for a smoother feel without causing re-renders
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;

        blob1Ref.current.style.transform = `translate(${x * 15}px, ${y * 15}px)`;
        blob2Ref.current.style.transform = `translate(${x * -20}px, ${y * -20}px)`;
        
        // Also subtle parallax on the image if it exists
        if (imageContainerRef.current) {
             const image = imageContainerRef.current.querySelector('img');
             if (image) {
                 image.style.transform = `scale(${1.05 + Math.abs(x) * 0.02})`;
             }
        }
    };

    const handleScroll = () => {
        if (!imageContainerRef.current) return;
        const scrollY = window.scrollY;
        // Apply parallax transform directly
        imageContainerRef.current.style.transform = `translateY(${scrollY * -0.1}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section className={`relative w-full min-h-screen flex items-center justify-center overflow-hidden ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'}`}>
      
      {/* Background Gradients - Softened */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-30' : 'opacity-50'}`}>
         <div 
            ref={blob1Ref}
            className={`absolute top-[-10%] right-[-5%] w-[70vw] h-[70vw] rounded-full mix-blend-multiply filter blur-[100px] animate-blob ${theme === 'dark' ? 'bg-[#1a3826]' : 'bg-[#E3E0D6]'}`}
            style={{ transition: 'transform 0.1s linear' }}
         ></div>
         <div 
            ref={blob2Ref}
            className={`absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-multiply filter blur-[80px] animate-blob animation-delay-400 ${theme === 'dark' ? 'bg-[#0F2E1B]' : 'bg-[#DCD8CD]'}`}
            style={{ transition: 'transform 0.1s linear' }}
         ></div>
      </div>

      {/* NEW: Organic Texture Overlay (Stone/Paper Grain) */}
      <div 
        className={`absolute inset-0 z-[1] pointer-events-none opacity-[0.15] ${theme === 'dark' ? 'mix-blend-soft-light' : 'mix-blend-multiply'}`}
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* NEW: Subtle flowing lines background */}
      <svg className={`absolute top-0 left-0 w-full h-full z-[0] pointer-events-none opacity-30 ${theme === 'dark' ? 'text-[#1A4D2E]' : 'text-[#D6D1C7]'}`} viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path d="M-100 600 C 200 400, 600 800, 1600 200" stroke="currentColor" strokeWidth="1" fill="none" className="motion-safe:animate-pulse" style={{ animationDuration: '8s' }} />
          <path d="M-100 800 C 300 600, 700 900, 1600 400" stroke="currentColor" strokeWidth="1" fill="none" className="motion-safe:animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          <path d="M-100 300 C 300 100, 800 500, 1600 100" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
      </svg>

      <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 relative z-20 pt-20 lg:pt-0">
             <div className="overflow-hidden mb-8">
                <div className={`flex items-center gap-4 animate-fade-in-up`}>
                    <span className={`h-px w-12 ${theme === 'dark' ? 'bg-[#A8A29E]' : 'bg-[#1A4D2E]'}`}></span>
                    <span className={`text-xs font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#1A4D2E]'}`}>
                        Mindful Living
                    </span>
                </div>
             </div>
             
             <h1 className={`text-[14vw] lg:text-[11rem] font-serif leading-[0.8] tracking-tighter mb-10 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} transition-colors duration-500`}>
                 <span className="block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Quiet</span>
                 <span className="block animate-fade-in-up ml-4 lg:ml-24 relative" style={{ animationDelay: '0.2s' }}>
                    <span className="italic font-light">Living</span>
                    <svg className={`absolute -bottom-2 left-0 w-full h-3 md:h-6 ${theme === 'dark' ? 'text-[#2C4A3B]' : 'text-[#D6D1C7]'} -z-10`} viewBox="0 0 100 10" preserveAspectRatio="none">
                         <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                 </span>
             </h1>
             
             <div className="lg:max-w-xl ml-2 lg:ml-28 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <p className={`text-lg md:text-2xl font-light leading-relaxed mb-12 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                    Objects designed to respect your attention. <br className="hidden md:block"/>
                    Crafted from earth, built for the mind, and engineered for silence.
                </p>
                
                <div className="flex items-center gap-8">
                    <a 
                        href="#shop" 
                        onClick={onShopNow}
                        className={`group relative px-10 py-5 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-white' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-xs font-bold transition-all duration-300 rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1`}
                    >
                        {t('explore_shop')}
                    </a>
                    <a href="#about" className={`text-xs font-bold uppercase tracking-widest underline underline-offset-8 ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'} transition-colors`}>
                        Read Our Story
                    </a>
                </div>
             </div>
        </div>

        {/* Right Visual */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-12 lg:mt-0" style={{ perspective: '1000px' }}>
             <div 
                ref={imageContainerRef}
                className="relative w-full max-w-[500px] aspect-[4/5] transition-transform duration-300 ease-out will-change-transform"
             >
                {/* Main Image Mask - Arch Shape */}
                <div 
                    className={`w-full h-full overflow-hidden shadow-2xl transition-all duration-700 relative z-10 ${theme === 'dark' ? 'shadow-[#EBE7DE]/5' : 'shadow-[#1A4D2E]/20'}`} 
                    style={{ borderRadius: '300px 300px 20px 20px' }}
                >
                     <img 
                        src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200" 
                        alt="Minimalist Serene Interior" 
                        className="w-full h-full object-cover will-change-transform relative z-0"
                        style={{ transform: 'scale(1.05)', transition: 'transform 0.1s linear' }}
                     />
                     
                     {/* NEW: Canvas Texture Overlay for Image */}
                     <div 
                        className="absolute inset-0 z-10 pointer-events-none opacity-20 mix-blend-multiply"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }}
                     />
                     <div className={`absolute inset-0 mix-blend-overlay opacity-10 ${theme === 'dark' ? 'bg-[#000]' : 'bg-[#fff]'} z-20`}></div>
                </div>

                {/* Decorative Elements */}
                {/* Dashed Circle */}
                <div className={`absolute -top-12 -right-12 w-64 h-64 border-[1.5px] border-dashed rounded-full -z-0 animate-spin-slow opacity-30 ${theme === 'dark' ? 'border-[#EBE7DE]' : 'border-[#1A4D2E]'}`}></div>

                {/* Rotating Badge */}
                 <div 
                    className={`absolute -bottom-12 -left-8 md:-left-16 w-40 h-40 rounded-full ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-[#F5F2EB] text-[#1A4D2E]'} flex items-center justify-center shadow-2xl animate-fade-in-up z-20 border border-current`}
                    style={{ 
                        animationDelay: '0.6s'
                    }}
                >
                    <div className="w-full h-full animate-spin-slow relative">
                        <svg viewBox="0 0 100 100" className="w-full h-full p-2">
                            <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                            <text className="text-[10px] uppercase tracking-[0.25em] font-bold fill-current">
                                <textPath xlinkHref="#curve">
                                    Organic Design • Serenity •
                                </textPath>
                            </text>
                        </svg>
                    </div>
                    <div className={`absolute inset-0 m-auto w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'}`}></div>
                </div>
             </div>
        </div>

      </div>

      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 animate-pulse ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
         <span className="text-[10px] uppercase tracking-widest">Scroll</span>
         <div className={`w-[1px] h-12 ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'}`}></div>
      </div>
    </section>
  );
};

export default Hero;