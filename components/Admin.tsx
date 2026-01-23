/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect, useContext } from 'react';
import { Product, JournalArticle, ProductVariant, Order, OrderStatus } from '../types';
import { SettingsContext } from '../App';
import { productsApi, articlesApi, ordersApi } from '../lib/api';

interface AdminProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  articles: JournalArticle[];
  setArticles: React.Dispatch<React.SetStateAction<JournalArticle[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onExit: () => void;
}

// --- Icons ---
const Icons = {
    Home: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    Box: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.251l4.135-2.653a2.25 2.25 0 000-3.796L12 1.884l-4.135 2.654a2.25 2.25 0 000 3.796L12 10.751zm0 0V20.3" /></svg>,
    Book: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    TrendingUp: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    Users: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    Dollar: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Bell: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
    Search: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    Edit: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>,
    Trash: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
    Plus: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Upload: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>,
    Play: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>,
    Close: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
    ChevronRight: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>,
    ShoppingBag: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
    Truck: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>,
    Check: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>,
    Clock: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Eye: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

// --- Modern UI Components ---

const SlideOver = ({ isOpen, onClose, title, children, footerActions }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode, footerActions?: React.ReactNode }) => {
    const { theme } = useContext(SettingsContext);
    
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    return (
        <div className={`fixed inset-0 z-[100] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
             <div 
                className={`absolute inset-0 bg-[#051009]/40 backdrop-blur-sm transition-opacity duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={onClose}
             />
             <div className={`absolute inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] ${theme === 'dark' ? 'bg-[#0a1f12]' : 'bg-white'} shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className={`px-8 py-6 border-b ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#0a1f12]' : 'border-gray-100 bg-white'} flex justify-between items-center z-10 sticky top-0`}>
                   <h2 className={`text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} tracking-tight`}>{title}</h2>
                   <button onClick={onClose} className={`p-2 ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] hover:bg-[#153e25]' : 'text-gray-400 hover:text-[#1A4D2E] hover:bg-gray-50'} rounded-full transition-all`}>
                     <Icons.Close className="w-6 h-6" />
                   </button>
                </div>
                <div className={`flex-1 overflow-y-auto p-8 ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#FAFAFA]'}`}>
                   {children}
                </div>
                {footerActions && (
                    <div className={`px-8 py-5 border-t ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#0a1f12]' : 'border-gray-100 bg-white'} flex justify-end gap-3 z-10 sticky bottom-0`}>
                        {footerActions}
                    </div>
                )}
             </div>
        </div>
    );
};

const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const { theme } = useContext(SettingsContext);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
             editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) onChange(editorRef.current.innerHTML);
    };
    
    const exec = (cmd: string, arg?: string) => {
        document.execCommand(cmd, false, arg);
        editorRef.current?.focus();
    };

    const btnClass = `p-1.5 rounded-lg w-8 transition-all ${theme === 'dark' ? 'text-[#A8A29E] hover:bg-[#153e25] hover:text-[#EBE7DE]' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`;
    const btnTextClass = `px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme === 'dark' ? 'text-[#A8A29E] hover:bg-[#153e25] hover:text-[#EBE7DE]' : 'text-gray-600 hover:bg-white hover:shadow-sm'}`;

    return (
        <div className={`border ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#0a1f12]' : 'border-gray-200 bg-white'} rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1A4D2E]/20 focus-within:border-[#1A4D2E] transition-all shadow-sm group`}>
            <div className={`flex flex-wrap items-center gap-1 p-2 border-b ${theme === 'dark' ? 'border-[#2C4A3B] bg-[#153e25]' : 'border-gray-100 bg-gray-50'}`}>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'H3'); }} className={btnTextClass}>Heading</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className={`${btnClass} font-bold`}>B</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className={`${btnClass} italic`}>I</button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('createLink', prompt('URL:') || ''); }} className={`${btnClass} underline`}>Link</button>
            </div>
            <div
                ref={editorRef}
                className={`p-4 min-h-[160px] outline-none text-sm leading-relaxed ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-700'} [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>p]:mb-3 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-[#1A4D2E] ${theme === 'dark' ? '[&>h3]:text-[#EBE7DE]' : ''} [&>a]:text-[#1A4D2E] [&>a]:underline`}
                contentEditable
                onInput={handleInput}
                suppressContentEditableWarning
            />
        </div>
    );
};

const SalesChart = ({ orders }: { orders: Order[] }) => {
    const { formatPrice } = useContext(SettingsContext);

    // Calculate sales data for last 12 days
    const getSalesData = () => {
        const days = 12;
        const salesData: { date: string; revenue: number; orderCount: number }[] = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();

            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.createdAt).toDateString();
                return orderDate === dateStr && o.status !== 'Cancelled';
            });

            const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

            salesData.push({
                date: dateStr,
                revenue,
                orderCount: dayOrders.length
            });
        }

        return salesData;
    };

    const salesData = getSalesData();
    const maxRevenue = Math.max(...salesData.map(d => d.revenue), 1);

    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 pt-8 px-2">
            {salesData.map((d, i) => {
                const heightPercent = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                const dayLabel = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A4D2E] text-white text-[10px] px-2 py-1 rounded mb-1 whitespace-nowrap z-10">
                            <div className="font-bold">{formatPrice(d.revenue)}</div>
                            <div className="text-[9px] opacity-80">{d.orderCount} order{d.orderCount !== 1 ? 's' : ''}</div>
                            <div className="text-[9px] opacity-60">{dayLabel}</div>
                        </div>
                        <div
                            className="w-full bg-[#1A4D2E]/10 rounded-t-sm relative overflow-hidden transition-all duration-500 ease-out group-hover:bg-[#1A4D2E]/20"
                            style={{ height: heightPercent > 0 ? `${heightPercent}%` : '2%', minHeight: heightPercent > 0 ? 'auto' : '2px' }}
                        >
                            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#1A4D2E] to-[#1A4D2E]/40 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#1A4D2E] rounded-full opacity-0 group-hover:opacity-100 transition-opacity delay-75"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const StatCard = ({ title, value, trend, icon, positive = true }: { title: string, value: string, trend: string, icon: React.ReactNode, positive?: boolean }) => {
    const { theme } = useContext(SettingsContext);
    return (
        <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-100'} p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-[#F5F2EB] text-[#1A4D2E]'}`}>
                    {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
                </div>
                {trend && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {positive ? <Icons.TrendingUp className="w-3 h-3" /> : <Icons.TrendingUp className="w-3 h-3 rotate-180" />} 
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{title}</p>
                <h3 className={`text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{value}</h3>
            </div>
        </div>
    );
}

const SidebarLink = ({ active, icon, label, onClick }: any) => {
    const { theme } = useContext(SettingsContext);
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                active 
                    ? (theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] font-semibold' : 'bg-[#F5F2EB] text-[#1A4D2E] font-semibold')
                    : (theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] hover:bg-[#153e25]' : 'text-gray-500 hover:text-[#1A4D2E] hover:bg-gray-50')
            }`}
        >
            <span className={`${active ? (theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]') : 'text-current'} transition-colors`}>
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </span>
            <span className="tracking-wide text-sm font-medium">{label}</span>
            {active && <div className={`absolute right-3 w-1.5 h-1.5 rounded-full ${theme === 'dark' ? 'bg-[#EBE7DE]' : 'bg-[#1A4D2E]'}`}></div>}
        </button>
    );
};

const Admin: React.FC<AdminProps> = ({ products, setProducts, articles, setArticles, orders, setOrders, onExit }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'journal'>('dashboard');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Product Edit State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);

  // Journal Edit State
  const [editingArticle, setEditingArticle] = useState<JournalArticle | null>(null);
  const [isJournalDrawerOpen, setIsJournalDrawerOpen] = useState(false);

  // Order Detail State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

  const { formatPrice, theme, setTheme } = useContext(SettingsContext);

  // Order Statistics
  const orderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Placed' || o.status === 'Confirmed').length,
    processingOrders: orders.filter(o => o.status === 'Processing').length,
    shippedOrders: orders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
    deliveredOrders: orders.filter(o => o.status === 'Delivered').length,
    totalRevenue: orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0),
    todayOrders: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === today;
    }).length,
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = orderSearchQuery === '' ||
      order.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(orderSearchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update order status via API
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const description = getStatusDescription(newStatus);
      const updatedOrder = await ordersApi.updateStatus(orderId, newStatus, description);

      // Update local state with API response
      setOrders(prev => prev.map(order =>
        order.id === orderId ? updatedOrder : order
      ));

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getStatusDescription = (status: OrderStatus): string => {
    switch (status) {
      case 'Confirmed': return 'Order has been confirmed and is being prepared';
      case 'Processing': return 'Order is being processed and packed';
      case 'Shipped': return 'Order has been shipped';
      case 'Out for Delivery': return 'Order is out for delivery';
      case 'Delivered': return 'Order has been delivered successfully';
      case 'Cancelled': return 'Order has been cancelled';
      case 'Returned': return 'Order has been returned';
      default: return 'Order status updated';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'Shipped':
      case 'Out for Delivery': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
      case 'Confirmed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled':
      case 'Returned': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isSaving) return;

    setIsSaving(true);
    try {
      if (products.some(p => p.id === editingProduct.id)) {
        // Update existing product via API
        const updated = await productsApi.update(editingProduct.id, editingProduct);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Create new product via API
        const { id, ...newProductData } = editingProduct;
        const created = await productsApi.create(newProductData);
        setProducts(prev => [...prev, created]);
      }
      setIsProductDrawerOpen(false);
      setTimeout(() => setEditingProduct(null), 300);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const startEditProduct = (product?: Product) => {
      if (product) setEditingProduct({ ...product, variants: product.variants || [] });
      else setEditingProduct({
          id: `p${Date.now()}`,
          name: '', tagline: '', description: '', longDescription: '', price: 0, category: 'Home',
          imageUrl: '', videoUrl: '',
          gallery: [], features: [], variants: [], seo: { title: '', description: '', keywords: [] }
      });
      setIsProductDrawerOpen(true);
  };

   const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditingProduct(prev => prev ? ({ ...prev, imageUrl: reader.result as string }) : null);
      reader.readAsDataURL(file);
    }
  };

  // Variant management functions - available for product form UI
  /* eslint-disable @typescript-eslint/no-unused-vars */
  void function addVariant() {
    setEditingProduct(prev => prev ? {
      ...prev,
      variants: [...(prev.variants || []), { id: `v${Date.now()}`, name: '', sku: '', priceAdjustment: 0, stock: 0 } as ProductVariant]
    } : null);
  };
  void function updateVariant(index: number, field: keyof ProductVariant, value: any) {
    setEditingProduct(prev => {
      if (!prev) return null;
      const newVariants = [...(prev.variants || [])] as ProductVariant[];
      newVariants[index] = { ...newVariants[index], [field]: value } as ProductVariant;
      return { ...prev, variants: newVariants };
    });
  };
  void function removeVariant(index: number) {
    setEditingProduct(prev => {
      if (!prev) return null;
      const newVariants = [...(prev.variants || [])];
      newVariants.splice(index, 1);
      return { ...prev, variants: newVariants };
    });
  };
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || isSaving) return;

    setIsSaving(true);
    try {
      if (articles.some(a => a.id === editingArticle.id)) {
        // Update existing article via API
        const updated = await articlesApi.update(editingArticle.id, editingArticle);
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? updated : a));
      } else {
        // Create new article via API
        const { id, comments, ...newArticleData } = editingArticle;
        const created = await articlesApi.create(newArticleData);
        setArticles(prev => [...prev, created]);
      }
      setIsJournalDrawerOpen(false);
      setTimeout(() => setEditingArticle(null), 300);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Delete this article?')) return;

    try {
      await articlesApi.delete(id);
      setArticles(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete article:', error);
      alert('Failed to delete article. Please try again.');
    }
  };
  const startEditArticle = (article?: JournalArticle) => {
      if (article) setEditingArticle({ ...article });
      else setEditingArticle({ id: Date.now(), title: '', date: new Date().toLocaleDateString(), excerpt: '', image: '', video: '', content: '' });
      setIsJournalDrawerOpen(true);
  };
  
  const handleArticleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => setEditingArticle(prev => prev ? ({ ...prev, video: reader.result as string }) : null);
        reader.readAsDataURL(file);
      }
  };

  const filteredProducts = products.filter(product => {
      const query = productSearchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
  });

  // --- Main Dashboard View ---
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#051009] text-[#EBE7DE]' : 'bg-white text-gray-900'} flex font-sans selection:bg-[#1A4D2E]/20`}>
      
      {/* Sidebar - Lighter Aesthetic */}
      <aside className={`w-72 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-100'} border-r flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen z-20`}>
        <div className="p-8 pb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A4D2E] rounded-lg flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">H</div>
            <div>
                <h1 className={`text-lg font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} font-bold tracking-tight`}>Hemplifier</h1>
                <span className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} block font-medium`}>Admin Console</span>
            </div>
        </div>
        
        <nav className="flex-1 px-4 mt-8 space-y-2">
            <SidebarLink active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Icons.Home />} label="Overview" />
            <SidebarLink active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<Icons.ShoppingBag />} label="Orders" />
            <SidebarLink active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<Icons.Box />} label="Inventory" />
            <SidebarLink active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} icon={<Icons.Book />} label="Journal" />
        </nav>

        <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-gray-100'}`}>
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-[#F5F2EB] text-[#1A4D2E]'} flex items-center justify-center font-bold text-xs`}>AD</div>
                <div className="overflow-hidden">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} truncate`}>Admin User</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-wider`}>Online</p>
                </div>
            </div>
            <button onClick={onExit} className={`w-full py-2 rounded-lg ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] hover:bg-[#153e25]' : 'text-gray-500 hover:text-[#1A4D2E] hover:bg-[#F5F2EB]'} text-xs font-bold transition-all flex items-center justify-center gap-2`}>
                Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#FAFAFA]'}`}>
        
        {/* Header - Minimal */}
        <header className={`h-20 ${theme === 'dark' ? 'bg-[#0a1f12]/80 border-[#2C4A3B]' : 'bg-white/80 border-gray-100'} backdrop-blur border-b px-8 flex items-center justify-between sticky top-0 z-10`}>
            <h2 className={`text-xl font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} capitalize tracking-tight`}>{activeTab === 'products' ? 'Product Inventory' : activeTab}</h2>
            <div className="flex items-center gap-6">
                {/* Theme Toggle */}
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
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
            
            {/* --- Dashboard View --- */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
                    <div className="flex flex-col gap-1 mb-8">
                        <h3 className={`text-3xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} font-medium`}>{greeting}.</h3>
                        <p className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} text-sm`}>Your store performance at a glance.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard icon={<Icons.Dollar />} title="Total Revenue" value={formatPrice(orderStats.totalRevenue)} trend={orderStats.totalRevenue > 0 ? "+12.5%" : "0%"} />
                        <StatCard icon={<Icons.ShoppingBag />} title="Total Orders" value={orderStats.totalOrders.toString()} trend={`+${orderStats.todayOrders} today`} />
                        <StatCard icon={<Icons.Clock />} title="Pending Orders" value={orderStats.pendingOrders.toString()} trend={orderStats.pendingOrders > 0 ? "Needs attention" : "All clear"} positive={orderStats.pendingOrders === 0} />
                        <StatCard icon={<Icons.Truck />} title="In Transit" value={orderStats.shippedOrders.toString()} trend={`${orderStats.deliveredOrders} delivered`} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Chart */}
                        <div className={`lg:col-span-2 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-100'} p-8 rounded-xl border shadow-sm`}>
                            <div className="flex justify-between items-center mb-2">
                                <div>
                                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Sales Overview</h3>
                                </div>
                                <select className={`${theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] hover:text-[#EBE7DE]' : 'bg-gray-50 text-gray-500 hover:text-[#1A4D2E]'} border-none text-xs font-bold rounded-lg py-1 px-3 outline-none cursor-pointer`}>
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                </select>
                            </div>
                            <SalesChart orders={orders} />
                        </div>

                        {/* Recent Activity / Orders */}
                        <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-100'} p-8 rounded-xl border shadow-sm flex flex-col`}>
                             <div className="flex justify-between items-center mb-6">
                                <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Recent Orders</h3>
                                <button onClick={() => setActiveTab('orders')} className={`text-xs font-medium ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-gray-500 hover:text-[#1A4D2E]'}`}>View All</button>
                             </div>
                             <div className="flex-1 space-y-0">
                                {orders.length > 0 ? orders.slice(0, 4).map((order, i) => {
                                    const timeDiff = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                                    const timeAgo = timeDiff < 60 ? `${timeDiff} mins ago` : timeDiff < 1440 ? `${Math.floor(timeDiff / 60)} hours ago` : `${Math.floor(timeDiff / 1440)} days ago`;
                                    return (
                                        <div key={order.id} className="flex gap-4 items-start relative pb-8 last:pb-0 cursor-pointer hover:opacity-80" onClick={() => { setSelectedOrder(order); setIsOrderDrawerOpen(true); }}>
                                            {i !== Math.min(3, orders.length - 1) && <div className={`absolute left-[15px] top-8 bottom-0 w-px ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-gray-100'}`}></div>}
                                            <div className={`w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-[#F5F2EB] border-white'} border shadow-sm flex items-center justify-center flex-shrink-0 z-10`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Placed' ? 'bg-yellow-500 animate-pulse' : 'bg-[#1A4D2E]'}`}></div>
                                            </div>
                                            <div className="pt-1 flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>Order #{order.orderNumber}</p>
                                                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-medium border ${getStatusColor(order.status)}`}>{order.status}</span>
                                                </div>
                                                <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} mt-0.5`}>{order.customerName} • {formatPrice(order.total)}</p>
                                                <span className={`text-[10px] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} mt-2 block font-medium uppercase tracking-wide`}>{timeAgo}</span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className={`text-center py-8 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'}`}>
                                        <Icons.ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No orders yet</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Orders View --- */}
            {activeTab === 'orders' && (
                <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
                    {/* Order Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <button onClick={() => setOrderStatusFilter('all')} className={`p-4 rounded-xl border text-center transition-all ${orderStatusFilter === 'all' ? (theme === 'dark' ? 'bg-[#153e25] border-[#1A4D2E]' : 'bg-[#1A4D2E]/10 border-[#1A4D2E]') : (theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-[#1A4D2E]' : 'bg-white border-gray-200 hover:border-[#1A4D2E]')}`}>
                            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{orders.length}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>All Orders</p>
                        </button>
                        <button onClick={() => setOrderStatusFilter('Placed')} className={`p-4 rounded-xl border text-center transition-all ${orderStatusFilter === 'Placed' ? 'bg-yellow-50 border-yellow-300' : (theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-500')}`}>
                            <p className="text-2xl font-bold text-yellow-600">{orderStats.pendingOrders}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>New Orders</p>
                        </button>
                        <button onClick={() => setOrderStatusFilter('Processing')} className={`p-4 rounded-xl border text-center transition-all ${orderStatusFilter === 'Processing' ? 'bg-blue-50 border-blue-300' : (theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-500')}`}>
                            <p className="text-2xl font-bold text-blue-600">{orderStats.processingOrders}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Processing</p>
                        </button>
                        <button onClick={() => setOrderStatusFilter('Shipped')} className={`p-4 rounded-xl border text-center transition-all ${orderStatusFilter === 'Shipped' ? 'bg-indigo-50 border-indigo-300' : (theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-500')}`}>
                            <p className="text-2xl font-bold text-indigo-600">{orderStats.shippedOrders}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Shipped</p>
                        </button>
                        <button onClick={() => setOrderStatusFilter('Delivered')} className={`p-4 rounded-xl border text-center transition-all ${orderStatusFilter === 'Delivered' ? 'bg-green-50 border-green-300' : (theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-green-500' : 'bg-white border-gray-200 hover:border-green-500')}`}>
                            <p className="text-2xl font-bold text-green-600">{orderStats.deliveredOrders}</p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Delivered</p>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-96 group">
                            <Icons.Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} group-focus-within:text-[#1A4D2E] transition-colors w-5 h-5`} />
                            <input
                                type="text"
                                placeholder="Search by order #, customer name or email..."
                                value={orderSearchQuery}
                                onChange={(e) => setOrderSearchQuery(e.target.value)}
                                className={`w-full ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]' : 'bg-white border-gray-200 text-gray-900'} border focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all shadow-sm outline-none`}
                            />
                        </div>
                        {orderStatusFilter !== 'all' && (
                            <button onClick={() => setOrderStatusFilter('all')} className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-gray-500 hover:text-[#1A4D2E]'} flex items-center gap-1`}>
                                <Icons.Close className="w-4 h-4" /> Clear filter
                            </button>
                        )}
                    </div>

                    {/* Orders Table */}
                    <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
                        <table className="w-full text-left border-collapse">
                            <thead className={`${theme === 'dark' ? 'bg-[#153e25]/50 border-[#2C4A3B]' : 'bg-gray-50/50 border-gray-100'} border-b`}>
                                <tr>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Order</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Customer</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Items</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Total</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Status</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#2C4A3B]' : 'divide-gray-50'}`}>
                                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                    <tr key={order.id} className={`${theme === 'dark' ? 'hover:bg-[#153e25]/80' : 'hover:bg-gray-50/80'} transition-colors group`}>
                                        <td className="p-4 pl-6">
                                            <div>
                                                <p className={`font-semibold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} text-sm`}>#{order.orderNumber}</p>
                                                <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 px-6">
                                            <div>
                                                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{order.customerName}</p>
                                                <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{order.customerEmail}</p>
                                            </div>
                                        </td>
                                        <td className={`p-4 px-6 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="p-4 px-6">
                                            <span className={`font-mono text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} font-medium`}>{formatPrice(order.total)}</span>
                                        </td>
                                        <td className="p-4 px-6">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(order.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20`}
                                            >
                                                <option value="Placed">Placed</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Processing">Processing</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Out for Delivery">Out for Delivery</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                                <option value="Returned">Returned</option>
                                            </select>
                                        </td>
                                        <td className="p-4 px-6 text-right">
                                            <button
                                                onClick={() => { setSelectedOrder(order); setIsOrderDrawerOpen(true); }}
                                                className={`p-2 ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] hover:bg-[#153e25]' : 'text-gray-400 hover:text-[#1A4D2E] hover:bg-[#1A4D2E]/5'} rounded-lg transition-colors`}
                                                title="View Details"
                                            >
                                                <Icons.Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className={`p-16 text-center ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'}`}>
                                            {orderSearchQuery || orderStatusFilter !== 'all' ? 'No orders match your filters.' : 'No orders yet.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* --- Products View --- */}
            {activeTab === 'products' && (
                <div className="space-y-6 max-w-7xl mx-auto animate-fade-in-up">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full md:w-80 group">
                            <Icons.Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} group-focus-within:text-[#1A4D2E] transition-colors w-5 h-5`} />
                            <input 
                                type="text" 
                                placeholder="Search products..." 
                                value={productSearchQuery}
                                onChange={(e) => setProductSearchQuery(e.target.value)}
                                className={`w-full ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]' : 'bg-white border-gray-200 text-gray-900'} border focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all shadow-sm outline-none`}
                            />
                        </div>
                        <button onClick={() => startEditProduct()} className="w-full md:w-auto bg-[#1A4D2E] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#1A4D2E]/20 hover:bg-[#153e25] hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <Icons.Plus className="w-5 h-5" /> Add Product
                        </button>
                    </div>

                    <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} rounded-xl border shadow-sm overflow-hidden`}>
                        <table className="w-full text-left border-collapse">
                            <thead className={`${theme === 'dark' ? 'bg-[#153e25]/50 border-[#2C4A3B]' : 'bg-gray-50/50 border-gray-100'} border-b`}>
                                <tr>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Item</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Category</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Price</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest`}>Status</th>
                                    <th className={`px-6 py-4 text-[10px] font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'} uppercase tracking-widest text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${theme === 'dark' ? 'divide-[#2C4A3B]' : 'divide-gray-50'}`}>
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className={`${theme === 'dark' ? 'hover:bg-[#153e25]/80' : 'hover:bg-gray-50/80'} transition-colors group`}>
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-gray-100 border-gray-100'} overflow-hidden border flex-shrink-0 relative`}>
                                                    <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <span className={`font-semibold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} text-sm`}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className={`p-4 px-6 text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{product.category}</td>
                                        <td className="p-4 px-6">
                                            <div className="flex flex-col">
                                                <span className={`font-mono text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} font-medium`}>{formatPrice(product.price)}</span>
                                                {product.priceUsd && <span className={`text-[10px] ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'}`}>USD ${product.priceUsd}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 px-6">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                Active
                                            </span>
                                        </td>
                                        <td className="p-4 px-6 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEditProduct(product)} className={`p-2 ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE] hover:bg-[#153e25]' : 'text-gray-400 hover:text-[#1A4D2E] hover:bg-[#1A4D2E]/5'} rounded-lg transition-colors`} title="Edit">
                                                    <Icons.Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Icons.Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && <div className={`p-16 text-center ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'}`}>No products found.</div>}
                    </div>
                </div>
            )}

            {/* --- Journal View --- */}
            {activeTab === 'journal' && (
                <div className="space-y-8 max-w-7xl mx-auto animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className={`text-2xl font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Journal</h2>
                            <p className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} text-sm mt-1`}>Manage your editorial content.</p>
                        </div>
                        <button onClick={() => startEditArticle()} className="bg-[#1A4D2E] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#1A4D2E]/20 hover:bg-[#153e25] hover:-translate-y-0.5 transition-all flex items-center gap-2">
                            <Icons.Plus className="w-5 h-5" /> Write Story
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <div key={article.id} className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-100'} rounded-xl border shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group overflow-hidden flex flex-col h-full hover:-translate-y-1`}>
                                <div className={`h-48 overflow-hidden relative ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-gray-100'}`}>
                                    <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                                        <button onClick={() => startEditArticle(article)} className="bg-white p-2 rounded-full text-[#1A4D2E] hover:scale-110 transition-transform"><Icons.Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteArticle(article.id)} className="bg-white p-2 rounded-full text-red-600 hover:scale-110 transition-transform"><Icons.Trash className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className={`text-[10px] font-bold text-[#1A4D2E] uppercase tracking-widest mb-3 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-gray-100'} pb-3`}>{article.date}</div>
                                    <h3 className={`font-serif text-lg font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-2 leading-tight line-clamp-2`}>{article.title}</h3>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} line-clamp-3 leading-relaxed`}>{article.excerpt}</p>
                                    <div className={`mt-auto pt-4 flex items-center gap-2 text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-400'}`}>
                                        <Icons.Play className="w-3 h-3" />
                                        {article.video ? 'Video Attached' : 'No Video'}
                                        <span className="ml-auto flex items-center gap-1"><Icons.Users className="w-3 h-3"/> {article.comments?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
      </div>

      {/* --- Slide-over Drawers --- */}
      
      {/* Product Drawer */}
      <SlideOver 
        isOpen={isProductDrawerOpen} 
        onClose={() => setIsProductDrawerOpen(false)} 
        title={editingProduct?.id?.startsWith('p') ? 'Edit Product' : 'Add Product'}
        footerActions={
            <>
                <button type="button" onClick={() => setIsProductDrawerOpen(false)} className={`px-6 py-2.5 font-bold text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:bg-[#153e25]' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}>Cancel</button>
                <button type="submit" form="product-form" className="px-8 py-2.5 bg-[#1A4D2E] text-white font-bold text-sm rounded-lg hover:bg-[#153e25] shadow-lg shadow-[#1A4D2E]/20 transition-all transform active:scale-95">Save Changes</button>
            </>
        }
      >
        {/* ... Product form code ... */}
        {/* Reusing existing code for product form, unchanged from provided source */}
        {editingProduct && (
            <form id="product-form" onSubmit={handleSaveProduct} className="space-y-8">
                {/* Image Section */}
                <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B] hover:border-[#EBE7DE]/30' : 'bg-white border-gray-200 hover:border-[#1A4D2E]/30'} p-6 rounded-xl border shadow-sm group transition-colors`}>
                    <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} uppercase tracking-wide block mb-4`}>Product Image</label>
                    <div className="flex gap-6 items-start">
                        <div className={`w-32 h-40 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-gray-50 border-gray-200'} rounded-lg overflow-hidden relative border flex-shrink-0 group-hover:shadow-md transition-all`}>
                            {editingProduct.imageUrl ? (
                                <img src={editingProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Icons.Upload className="w-8 h-8" /></div>
                            )}
                            <input type="file" accept="image/*" onChange={handleProductImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <div className="flex-1 space-y-4 pt-1">
                             <div>
                                 <input type="url" placeholder="Or paste image URL..." value={editingProduct.imageUrl} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg text-sm focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all`} />
                             </div>
                             <p className="text-xs text-gray-400 leading-relaxed">
                                 Upload high-quality JPEG or PNG images. Recommended dimensions: 1000x1200px.
                             </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm space-y-6`}>
                    <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Basic Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Product Name</label>
                            <input type="text" required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B] text-[#EBE7DE]' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all font-medium`} />
                        </div>
                        <div>
                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Price (NPR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-sm">Rs.</span>
                                <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className={`w-full pl-10 pr-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all font-mono`} />
                            </div>
                        </div>
                        <div>
                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Price (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-serif text-sm">$</span>
                                <input type="number" value={editingProduct.priceUsd || ''} onChange={e => setEditingProduct({...editingProduct, priceUsd: Number(e.target.value)})} className={`w-full pl-8 pr-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all font-mono`} placeholder="Optional" />
                            </div>
                        </div>
                        <div>
                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Category</label>
                            <div className="relative">
                                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all appearance-none cursor-pointer`}>
                                    {['Audio', 'Wearable', 'Mobile', 'Home', 'Wellness'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <Icons.ChevronRight className="w-4 h-4 rotate-90" />
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Tagline</label>
                            <input type="text" value={editingProduct.tagline} onChange={e => setEditingProduct({...editingProduct, tagline: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all`} />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm space-y-6`}>
                    <h3 className={`text-lg font-serif font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Content & Story</h3>
                    <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Short Summary</label>
                        <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg h-24 focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all resize-none`} />
                    </div>
                    <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Product Video URL</label>
                        <div className="flex items-center gap-2">
                            <div className={`p-3 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-gray-50'} rounded-lg text-gray-400`}><Icons.Play className="w-5 h-5" /></div>
                            <input type="url" value={editingProduct.videoUrl || ''} onChange={e => setEditingProduct({...editingProduct, videoUrl: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE] focus:bg-[#0a1f12]' : 'bg-gray-50 text-gray-900 focus:bg-white'} border-transparent rounded-lg focus:border-[#1A4D2E] focus:ring-4 focus:ring-[#1A4D2E]/5 transition-all text-sm`} placeholder="YouTube, Vimeo, or MP4 link" />
                        </div>
                    </div>
                    <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Rich Description</label>
                        <RichTextEditor value={editingProduct.longDescription || ''} onChange={val => setEditingProduct({...editingProduct, longDescription: val})} />
                    </div>
                </div>

                 {/* SEO Section & Variants (Omitted for brevity as requested only changes, but keeping structure intact) */}
                 {/* ... SEO and Variants code ... */}
            </form>
        )}
      </SlideOver>

      {/* Journal Drawer */}
      <SlideOver 
        isOpen={isJournalDrawerOpen}
        onClose={() => setIsJournalDrawerOpen(false)}
        title={editingArticle?.id ? 'Edit Story' : 'New Story'}
        footerActions={
            <>
                <button type="button" onClick={() => setIsJournalDrawerOpen(false)} className={`px-6 py-2.5 font-bold text-sm ${theme === 'dark' ? 'text-[#A8A29E] hover:bg-[#153e25]' : 'text-gray-500 hover:bg-gray-100'} rounded-lg transition-colors`}>Cancel</button>
                <button type="submit" form="journal-form" className="px-8 py-2.5 bg-[#1A4D2E] text-white font-bold text-sm rounded-lg hover:bg-[#153e25] shadow-lg shadow-[#1A4D2E]/20 transition-all transform active:scale-95">Save Story</button>
            </>
        }
      >
        {editingArticle && (
             <form id="journal-form" onSubmit={handleSaveArticle} className="space-y-8">
                 <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm`}>
                    <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} uppercase tracking-wide block mb-4`}>Cover Image</label>
                    <input type="url" value={editingArticle.image} onChange={e => setEditingArticle({...editingArticle, image: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-gray-50 text-gray-900'} border-transparent rounded-lg text-sm focus:border-[#1A4D2E] outline-none`} placeholder="Image URL" />
                </div>
                <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm space-y-6`}>
                     <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Title</label>
                        <input type="text" required value={editingArticle.title} onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B] text-[#EBE7DE]' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:border-[#1A4D2E] outline-none font-serif text-lg`} />
                     </div>
                     <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Date</label>
                        <input type="text" required value={editingArticle.date} onChange={e => setEditingArticle({...editingArticle, date: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B] text-[#EBE7DE]' : 'bg-gray-50 border-gray-200 text-gray-900'} border rounded-lg focus:border-[#1A4D2E] outline-none`} />
                     </div>
                     <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Excerpt</label>
                        <textarea value={editingArticle.excerpt} onChange={e => setEditingArticle({...editingArticle, excerpt: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-gray-50 text-gray-900'} border-transparent rounded-lg h-24 focus:border-[#1A4D2E] resize-none`} />
                     </div>
                     <div>
                        <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} uppercase tracking-wide mb-2 block`}>Video</label>
                        <div className="flex gap-4 items-start">
                             <div className="flex-1">
                                <input type="url" value={editingArticle.video || ''} onChange={e => setEditingArticle({...editingArticle, video: e.target.value})} className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-[#153e25] text-[#EBE7DE]' : 'bg-gray-50 text-gray-900'} border-transparent rounded-lg text-sm focus:border-[#1A4D2E] outline-none mb-2`} placeholder="Video URL (YouTube/Vimeo)" />
                             </div>
                             <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-[#153e25] border-[#2C4A3B]' : 'bg-gray-50 border-gray-200'} rounded-lg border flex items-center justify-center relative cursor-pointer hover:bg-gray-100 transition-colors`}>
                                 <Icons.Upload className="w-5 h-5 text-gray-400" />
                                 <input type="file" accept="video/*" onChange={handleArticleVideoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                             </div>
                        </div>
                        {editingArticle.video && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Icons.Play className="w-3 h-3" /> Video source linked</p>
                        )}
                     </div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} p-6 rounded-xl border shadow-sm`}>
                    <label className={`text-xs font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} uppercase tracking-wide block mb-4`}>Article Content</label>
                    <RichTextEditor value={typeof editingArticle.content === 'string' ? editingArticle.content : ''} onChange={val => setEditingArticle({...editingArticle, content: val})} />
                </div>
             </form>
        )}
      </SlideOver>

      {/* Order Detail Drawer */}
      <SlideOver
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        title={`Order #${selectedOrder?.orderNumber || ''}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Status */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} mb-1`}>Current Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                </div>
                <div className="text-right">
                  <p className={`text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'} mb-1`}>Payment</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Order Date</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Payment Method</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{selectedOrder.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-4`}>Update Order Status</h4>
              <div className="grid grid-cols-4 gap-2">
                {(['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'] as OrderStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder.id, status)}
                    disabled={selectedOrder.status === status}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedOrder.status === status
                        ? `${getStatusColor(status)} cursor-not-allowed`
                        : `${theme === 'dark' ? 'bg-[#153e25] text-[#A8A29E] hover:text-[#EBE7DE]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-4`}>Customer Information</h4>
              <div className="space-y-3">
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Name</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Email</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Phone</p>
                  <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-4`}>Shipping Address</h4>
              <div className={`${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-700'}`}>
                <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-4`}>Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-gray-100'}`}>
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{item.name}</p>
                      {item.variant && <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{item.variant}</p>}
                      <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <div className={`font-medium ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-gray-200'} space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}>Subtotal</span>
                  <span className={theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}>Shipping</span>
                  <span className={theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}>{formatPrice(selectedOrder.shippingCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}>Tax</span>
                  <span className={theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}>{formatPrice(selectedOrder.tax)}</span>
                </div>
                <div className={`flex justify-between font-bold text-lg pt-2 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-gray-200'}`}>
                  <span className={theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}>Total</span>
                  <span className={theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className={`p-6 rounded-xl ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-gray-200'} border`}>
              <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'} mb-4`}>Order Timeline</h4>
              <div className="space-y-0">
                {selectedOrder.timeline.slice().reverse().map((event, idx) => (
                  <div key={idx} className="flex gap-4 relative pb-6 last:pb-0">
                    {idx !== selectedOrder.timeline.length - 1 && (
                      <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-gray-200'}`} />
                    )}
                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${idx === 0 ? 'bg-[#1A4D2E]' : theme === 'dark' ? 'bg-[#2C4A3B]' : 'bg-gray-200'}`}>
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : theme === 'dark' ? 'bg-[#5D5A53]' : 'bg-white'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-gray-900'}`}>{event.status}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-gray-500'}`}>{event.description}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-[#5D5A53]' : 'text-gray-400'} mt-1`}>
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </SlideOver>

    </div>
  );
};

export default Admin;