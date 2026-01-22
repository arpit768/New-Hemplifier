/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext } from 'react';
import { SettingsContext } from '../App';

const About: React.FC = () => {
  const { theme } = useContext(SettingsContext);

  return (
    <section id="about" className={`${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#EBE7DE]'} transition-colors duration-300`}>
      
      {/* Introduction / Story */}
      <div className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-32">
        <div className="md:w-1/3">
          <span className={`block text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'} mb-6`}>Our Philosophy</span>
          <h2 className={`text-4xl md:text-6xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} leading-tight`}>
            Born from the earth, <br/> built for the mind.
          </h2>
        </div>
        <div className="md:w-2/3 max-w-2xl">
          <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light leading-relaxed mb-8`}>
            Hemplifier was founded on a simple but radical premise: technology should not feel like technology. It should feel like a stone smoothed by a river, or a page turned in a book.
          </p>
          <p className={`text-lg md:text-xl ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light leading-relaxed mb-8`}>
            In an age of infinite distraction, we design objects that respect your silence. We use materials that age gracefully—sandstone, untreated aluminum, and organic cotton—creating a tactile bridge between the digital world and your physical home.
          </p>
          <img 
            src="https://images.pexels.com/photos/6583355/pexels-photo-6583355.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
            alt="Hemplifier Design Studio" 
            className="w-full h-[500px] object-cover grayscale contrast-[0.9] brightness-110 mt-12 opacity-90 hover:opacity-100 transition-opacity"
          />
          <p className={`text-sm font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'} mt-4`}>
            The Hemplifier Studio, Kyoto
          </p>
        </div>
      </div>

      {/* Philosophy Blocks (Formerly Features) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group">
           <img 
             src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200" 
             alt="Natural Stone Texture" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
           />
        </div>
        <div className={`order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#D6D1C7]'} transition-colors duration-300`}>
           <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mb-6`}>Materiality</span>
           <h3 className={`text-4xl md:text-5xl font-serif mb-8 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} leading-tight`}>
             Materials that age <br/> with grace.
           </h3>
           <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light leading-relaxed mb-12 max-w-md`}>
             We reject the disposable. Every Hemplifier product is crafted from sandstone, unpolished aluminum, and organic fabrics that develop a unique patina over time, telling the story of your use.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className={`flex flex-col justify-center p-12 lg:p-24 ${theme === 'dark' ? 'bg-[#0a1f12]' : 'bg-[#1A4D2E]'} text-[#F5F2EB] transition-colors duration-300`}>
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6">The Ecosystem</span>
           <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#F5F2EB] leading-tight">
             Silence by default.
           </h3>
           <p className="text-lg text-[#A8A29E] font-light leading-relaxed mb-12 max-w-md">
             Our devices respect your attention. No blinking lights, no intrusive notifications. Just calm utility when you need it, and a beautiful object when you don't.
           </p>
        </div>
        <div className="relative h-[500px] lg:h-auto overflow-hidden group">
           <img 
             src="https://images.pexels.com/photos/6801917/pexels-photo-6801917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
             alt="Woman sitting on wooden floor reading" 
             className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 brightness-90"
           />
        </div>
      </div>
    </section>
  );
};

export default About;