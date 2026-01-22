/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useContext } from 'react';
import { SettingsContext } from '../App';

interface LoginProps {
  onLogin: (email: string) => void;
  onNavigateToRegister: () => void;
  message?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, message }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { theme, t } = useContext(SettingsContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 flex items-center justify-center px-6 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
      <div className={`w-full max-w-md p-8 md:p-12 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-xl`}>
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-2`}>{t('welcome_back')}</h2>
          <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{message || "Enter your details to access your account."}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#5D5A53]'}`}>{t('email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} outline-none focus:border-current transition-colors`}
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#5D5A53]'}`}>{t('password')}</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-3 bg-transparent border-b ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} outline-none focus:border-current transition-colors`}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`w-full py-4 mt-4 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-sm font-medium transition-colors`}
          >
            {t('sign_in')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
            {t('no_account')} <button onClick={onNavigateToRegister} className={`underline underline-offset-4 ${theme === 'dark' ? 'text-[#EBE7DE] hover:text-white' : 'text-[#1A4D2E] hover:text-black'} transition-colors`}>{t('create_account')}</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;