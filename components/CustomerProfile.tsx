/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useContext } from 'react';
import { Customer } from '../types';
import { SettingsContext } from '../App';

interface CustomerProfileProps {
  customer: Customer;
  onLogout: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onLogout }) => {
  const { theme, t, formatPrice, convertPrice } = useContext(SettingsContext);

  const getStatusStep = (status: string) => {
    switch(status) {
        case 'Placed': return 0;
        case 'Processing': return 1;
        case 'Shipped': return 2;
        case 'Delivered': return 3;
        case 'Cancelled': return -1;
        default: return 0;
    }
  };

  const steps = [
      { label: 'Placed', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
      { label: 'Processing', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg> },
      { label: 'Shipped', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.126-.504 1.126-1.125V15.75M8.25 21.75H16.5m-9-3H3.375m1.125-9.75h14.25M6 12a1.5 1.5 0 001.5-1.5m0 0a1.5 1.5 0 00-3 0m3 0A1.5 1.5 0 006 13.5m-3-1.5h.75m11.25 1.5a1.5 1.5 0 001.5-1.5m0 0a1.5 1.5 0 00-3 0m3 0A1.5 1.5 0 0016.5 13.5m-3-1.5H18" /></svg> },
      { label: 'Delivered', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> }
  ];

  return (
    <div className={`min-h-screen pt-32 pb-24 px-6 md:px-12 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 pb-8 border-b border-[#D6D1C7] dark:border-[#2C4A3B]">
            <div>
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-4">{t('my_profile')}</span>
                <h1 className={`text-4xl md:text-6xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Hello, {customer.name}</h1>
            </div>
            <button 
                onClick={onLogout}
                className={`mt-6 md:mt-0 text-sm uppercase tracking-widest ${theme === 'dark' ? 'text-[#EBE7DE] border-[#EBE7DE] hover:bg-[#EBE7DE] hover:text-[#051009]' : 'text-[#1A4D2E] border-[#1A4D2E] hover:bg-[#1A4D2E] hover:text-[#F5F2EB]'} border px-6 py-2 transition-all`}
            >
                {t('logout')}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
            {/* Account Details */}
            <div>
                <h3 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-8`}>{t('account_details')}</h3>
                <div className={`p-8 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-white'} border ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} shadow-sm`}>
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{t('full_name')}</p>
                    <p className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{customer.name}</p>
                    
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{t('email')}</p>
                    <p className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{customer.email}</p>
                    
                    <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>{t('shipping_address')}</p>
                    <p className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>
                        Kathmandu, Nepal<br/>
                        44600
                    </p>
                </div>
            </div>

            {/* Order History */}
            <div className="lg:col-span-2">
                <h3 className={`text-xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-8`}>{t('order_history')}</h3>
                <div className="space-y-8">
                    {customer.orders && customer.orders.length > 0 ? (
                        customer.orders.map((order) => {
                            const currentStep = getStatusStep(order.status);
                            
                            return (
                                <div key={order.id} className={`p-6 md:p-8 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border shadow-sm transition-shadow hover:shadow-md`}>
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-dashed border-[#A8A29E]/30 pb-6">
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={`font-serif text-lg ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Order #{order.id}</span>
                                            </div>
                                            <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Placed on {order.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{formatPrice(convertPrice(order.total))}</p>
                                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} mt-1`}>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    {order.status !== 'Cancelled' ? (
                                        <div className="relative flex justify-between items-center w-full mt-4">
                                            {/* Background Line */}
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 -translate-y-1/2"></div>
                                            
                                            {/* Active Line Progress */}
                                            <div 
                                                className="absolute top-1/2 left-0 h-0.5 bg-[#1A4D2E] dark:bg-[#EBE7DE] -z-10 -translate-y-1/2 transition-all duration-500"
                                                style={{ width: `${(Math.max(0, currentStep) / (steps.length - 1)) * 100}%` }}
                                            ></div>

                                            {steps.map((step, idx) => {
                                                const isActive = idx <= currentStep;
                                                const isCurrent = idx === currentStep;
                                                
                                                return (
                                                    <div key={idx} className="flex flex-col items-center gap-2 bg-inherit">
                                                        <div 
                                                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                                isActive 
                                                                    ? (theme === 'dark' ? 'bg-[#EBE7DE] border-[#EBE7DE] text-[#051009]' : 'bg-[#1A4D2E] border-[#1A4D2E] text-white')
                                                                    : (theme === 'dark' ? 'bg-[#051009] border-[#A8A29E] text-[#A8A29E]' : 'bg-[#F5F2EB] border-[#D6D1C7] text-[#A8A29E]')
                                                            } ${isCurrent ? 'scale-110 shadow-lg' : ''}`}
                                                        >
                                                            {step.icon}
                                                        </div>
                                                        <span className={`text-[10px] md:text-xs font-medium uppercase tracking-wider ${
                                                            isActive 
                                                                ? (theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]')
                                                                : (theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]')
                                                        }`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg text-sm text-center font-medium">
                                            This order has been cancelled.
                                        </div>
                                    )}

                                    <div className={`mt-8 pt-6 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                                         <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-2`}>Items:</p>
                                         <ul className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} space-y-1 list-disc pl-5`}>
                                             {order.items.map((item, i) => (
                                                 <li key={i}>{item}</li>
                                             ))}
                                         </ul>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className={`p-12 text-center border border-dashed ${theme === 'dark' ? 'border-[#2C4A3B] text-[#A8A29E]' : 'border-[#D6D1C7] text-[#5D5A53]'}`}>
                            No orders placed yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;