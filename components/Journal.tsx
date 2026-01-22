/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext } from 'react';
import { JournalArticle } from '../types';
import { SettingsContext } from '../App';

interface JournalProps {
  articles: JournalArticle[];
  onArticleClick: (article: JournalArticle) => void;
  featured?: boolean;
  limit?: number;
}

const Journal: React.FC<JournalProps> = ({ articles, onArticleClick, featured = false, limit }) => {
  const { theme } = useContext(SettingsContext);
  const displayArticles = limit ? articles.slice(0, limit) : articles;

  return (
    <section id="journal" className={`${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} ${featured ? 'py-0' : 'py-12'} px-6 md:px-12 transition-colors duration-300`}>
      <div className="max-w-[1800px] mx-auto">
        {!featured && (
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-20 pb-8 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'}`}>
                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>Reading time: 5-10 mins</span>
            </div>
        )}

        <div className={`grid grid-cols-1 ${featured ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-12`}>
            {displayArticles.map((article) => (
                <div key={article.id} className="group cursor-pointer flex flex-col text-left" onClick={() => onArticleClick(article)}>
                    <div className={`w-full aspect-[4/3] overflow-hidden mb-8 ${theme === 'dark' ? 'bg-[#153e25]' : 'bg-[#EBE7DE]'} relative`}>
                        <img 
                            src={article.image} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale-[0.2] group-hover:grayscale-0"
                        />
                        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-[#000]/0 group-hover:bg-[#000]/20' : 'bg-[#1A4D2E]/0 group-hover:bg-[#1A4D2E]/10'} transition-colors duration-500`}></div>
                        {article.video && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                                <div className={`w-14 h-14 rounded-full ${theme === 'dark' ? 'bg-[#0a1f12]/90 text-[#EBE7DE]' : 'bg-white/90 text-[#1A4D2E]'} backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 ml-1">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col flex-1 text-left">
                        <span className={`text-xs font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'} mb-3`}>{article.date}</span>
                        <h3 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4`}>{article.title}</h3>
                        <p className={`${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} font-light leading-relaxed line-clamp-3`}>{article.excerpt}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Journal;