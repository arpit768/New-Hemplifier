/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState } from 'react';

interface FooterProps {
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onLinkClick }) => {
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [email, setEmail] = useState('');

  const handleSubscribe = () => {
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 1500);
  };

  return (
    <footer className="bg-[#EBE7DE] pt-24 pb-12 px-6 text-[#5D5A53]">
      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        
        <div className="md:col-span-4">
          <h4 className="text-2xl font-serif text-[#1A4D2E] mb-6">Hemplifier</h4>
          <p className="max-w-xs font-light leading-relaxed">
            Designing technology that feels as natural as the world around it.
            Born from the earth, built for the mind.
          </p>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-bold text-[#1A4D2E] mb-6 tracking-wide text-sm uppercase">Shop</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#shop" onClick={(e) => onLinkClick(e, 'shop')} className="hover:text-[#1A4D2E] transition-colors underline-offset-4 hover:underline">The Collection</a></li>
            <li><a href="#shop" onClick={(e) => onLinkClick(e, 'shop')} className="hover:text-[#1A4D2E] transition-colors underline-offset-4 hover:underline">New Arrivals</a></li>
          </ul>
        </div>
        
        <div className="md:col-span-2">
          <h4 className="font-bold text-[#1A4D2E] mb-6 tracking-wide text-sm uppercase">Company</h4>
          <ul className="space-y-4 font-light">
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#1A4D2E] transition-colors underline-offset-4 hover:underline">Our Story</a></li>
            <li><a href="#about" onClick={(e) => onLinkClick(e, 'about')} className="hover:text-[#1A4D2E] transition-colors underline-offset-4 hover:underline">Sustainability</a></li>
            <li><a href="#journal" onClick={(e) => onLinkClick(e, 'journal')} className="hover:text-[#1A4D2E] transition-colors underline-offset-4 hover:underline">Journal</a></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="font-bold text-[#1A4D2E] mb-6 tracking-wide text-sm uppercase">Newsletter</h4>
          <div className="flex flex-col gap-4">
            <input 
              type="email" 
              placeholder="email@address.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              className="bg-transparent border-b border-[#A8A29E] py-2 text-lg outline-none focus:border-[#1A4D2E] transition-colors placeholder-[#A8A29E]/70 text-[#1A4D2E] disabled:opacity-50" 
            />
            <button 
              onClick={handleSubscribe}
              disabled={subscribeStatus !== 'idle' || !email}
              className="self-start text-sm font-medium uppercase tracking-widest mt-2 hover:text-[#1A4D2E] disabled:cursor-default disabled:hover:text-[#5D5A53] disabled:opacity-50 transition-opacity"
            >
              {subscribeStatus === 'idle' && 'Subscribe'}
              {subscribeStatus === 'loading' && 'Subscribing...'}
              {subscribeStatus === 'success' && 'Subscribed'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto mt-20 pt-8 border-t border-[#D6D1C7] flex justify-center items-center text-xs uppercase tracking-widest opacity-60">
        <p>© {new Date().getFullYear()} Hemplifier. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;