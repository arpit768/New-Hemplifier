/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useContext } from 'react';
import { SettingsContext } from '../App';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const { theme } = useContext(SettingsContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await Promise.resolve(onLogin(email, password));

      if (!success) {
        setError('Invalid admin credentials. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-24 flex items-center justify-center px-6 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'}`}>
      <div className={`w-full max-w-md p-8 rounded-lg ${theme === 'dark' ? 'bg-[#0a1f14]' : 'bg-white'} shadow-xl`}>
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${theme === 'dark' ? 'bg-[#1A4D2E]' : 'bg-[#1A4D2E]/10'}`}>
            <svg className={`w-8 h-8 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`}>
            Admin Access
          </h1>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`}>
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-[#051009] border-[#1A4D2E] text-[#F5F2EB] placeholder-[#5D5A53] focus:border-[#F5F2EB]'
                  : 'bg-white border-[#D6D1C7] text-[#1A4D2E] placeholder-[#A8A29E] focus:border-[#1A4D2E]'
              } outline-none`}
              placeholder="admin@hemplifier.com"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-[#F5F2EB]' : 'text-[#1A4D2E]'}`}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                theme === 'dark'
                  ? 'bg-[#051009] border-[#1A4D2E] text-[#F5F2EB] placeholder-[#5D5A53] focus:border-[#F5F2EB]'
                  : 'bg-white border-[#D6D1C7] text-[#1A4D2E] placeholder-[#A8A29E] focus:border-[#1A4D2E]'
              } outline-none`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-lg font-medium uppercase tracking-widest text-sm transition-all duration-300 ${
              isLoading
                ? 'bg-[#A8A29E] cursor-not-allowed'
                : 'bg-[#1A4D2E] hover:bg-[#0d2617]'
            } text-white`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#F5F2EB]' : 'text-[#5D5A53] hover:text-[#1A4D2E]'} transition-colors inline-flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Demo Credentials Info */}
        <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-[#1A4D2E]/20' : 'bg-[#1A4D2E]/5'}`}>
          <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
            <strong>Demo Credentials:</strong><br />
            Email: admin@hemplifier.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
