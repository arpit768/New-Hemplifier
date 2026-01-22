/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useContext } from 'react';
import { SettingsContext } from '../App';

interface OrderSuccessProps {
  onContinue: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ onContinue }) => {
  const { theme, t } = useContext(SettingsContext);
  
  return (
    <div className={`min-h-screen pt-32 flex flex-col items-center text-center px-6 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
        <div className="w-20 h-20 bg-[#1A4D2E] rounded-full flex items-center justify-center mb-8 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#F5F2EB" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
        </div>
        <h1 className={`text-4xl md:text-5xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>{t('order_confirmed')}</h1>
        <p className={`text-lg ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} max-w-md mb-12 font-light`}>
            {t('thank_you')} <br/>
            {t('confirmation_email')}
        </p>
        <button 
            onClick={onContinue}
            className={`px-12 py-4 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-sm font-medium transition-colors shadow-lg`}
        >
            {t('continue_shopping')}
        </button>
    </div>
  );
};

export default OrderSuccess;