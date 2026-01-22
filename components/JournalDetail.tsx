/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useContext, useState } from 'react';
import { JournalArticle, Customer } from '../types';
import { SettingsContext } from '../App';

interface JournalDetailProps {
  article: JournalArticle;
  onBack: () => void;
  onAddComment?: (articleId: number, comment: { author: string, text: string }) => void;
  currentUser?: Customer | null;
  onLogin?: () => void;
}

const JournalDetail: React.FC<JournalDetailProps> = ({ article, onBack, onAddComment, currentUser, onLogin }) => {
  const { theme, t } = useContext(SettingsContext);
  const [commentText, setCommentText] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.name || '');

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtu.be')) {
      const id = url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('youtube.com')) {
      const params = new URLSearchParams(new URL(url).search);
      const id = params.get('v');
      return `https://www.youtube.com/embed/${id}?autoplay=0&rel=0`;
    }
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  };

  const embedUrl = article.video ? getEmbedUrl(article.video) : null;
  
  const handleSubmitComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      
      const author = currentUser ? currentUser.name : (authorName.trim() || 'Guest');
      
      if (onAddComment) {
          onAddComment(article.id, { author, text: commentText });
          setCommentText('');
      }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#051009]' : 'bg-[#F5F2EB]'} animate-fade-in-up`}>
       {/* Hero Section - Video or Image */}
       <div className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden bg-black">
          {article.video ? (
             embedUrl ? (
                <iframe 
                  src={embedUrl} 
                  className="w-full h-full" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
             ) : (
                <video 
                   src={article.video} 
                   className="w-full h-full object-cover" 
                   controls 
                   poster={article.image}
                >
                   Your browser does not support the video tag.
                </video>
             )
          ) : (
             <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover"
             />
          )}
          {!article.video && <div className="absolute inset-0 bg-black/20"></div>}
       </div>

       <div className="max-w-3xl mx-auto px-6 md:px-12 -mt-32 relative z-10 pb-32">
          <div className={`${theme === 'dark' ? 'bg-[#0a1f12] shadow-[#000]/20' : 'bg-[#F5F2EB] shadow-[#1A4D2E]/5'} p-8 md:p-16 shadow-xl`}>
             <div className={`flex justify-between items-center mb-12 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} pb-8`}>
                <button 
                  onClick={onBack}
                  className={`group flex items-center gap-2 text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E] hover:text-[#EBE7DE]' : 'text-[#A8A29E] hover:text-[#1A4D2E]'} transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back to Journal
                </button>
                <span className={`text-xs font-medium uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}`}>{article.date}</span>
             </div>

             <h1 className={`text-4xl md:text-6xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-12 leading-tight text-center`}>
               {article.title}
             </h1>

             <div 
               className={`prose prose-stone prose-lg mx-auto font-light leading-loose ${theme === 'dark' ? 'text-[#A8A29E] [&>blockquote]:text-[#EBE7DE] [&>blockquote]:border-[#EBE7DE]' : 'text-[#5D5A53]'} [&>p]:mb-6`}
               dangerouslySetInnerHTML={typeof article.content === 'string' ? { __html: article.content } : undefined}
             >
               {typeof article.content !== 'string' && article.content}
             </div>
             
             <div className={`mt-16 pt-12 border-t ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#D6D1C7]'} flex justify-center`}>
                 <span className={`text-2xl font-serif italic ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>Hemplifier</span>
             </div>
          </div>

          {/* Comments Section */}
          <div className={`mt-12 ${theme === 'dark' ? 'bg-[#0a1f12] border-[#2C4A3B]' : 'bg-white border-[#D6D1C7]'} border p-8 md:p-12 shadow-sm`}>
              <h3 className={`text-2xl font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-8`}>Thoughts ({article.comments?.length || 0})</h3>
              
              <div className="space-y-8 mb-12">
                  {article.comments && article.comments.length > 0 ? (
                      article.comments.map(comment => (
                          <div key={comment.id} className={`pb-6 border-b ${theme === 'dark' ? 'border-[#2C4A3B]' : 'border-[#F5F2EB]'} last:border-0`}>
                              <div className="flex justify-between items-center mb-2">
                                  <span className={`font-bold ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'}`}>{comment.author}</span>
                                  <span className={`text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}`}>{comment.date}</span>
                              </div>
                              <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'} leading-relaxed`}>{comment.text}</p>
                          </div>
                      ))
                  ) : (
                      <p className={`text-sm italic ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#A8A29E]'}`}>No comments yet. Be the first to share your thoughts.</p>
                  )}
              </div>

              <h4 className={`text-lg font-serif ${theme === 'dark' ? 'text-[#EBE7DE]' : 'text-[#1A4D2E]'} mb-6`}>Leave a Comment</h4>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                  {!currentUser && (
                      <div className="mb-6 space-y-3">
                          <p className={`text-sm ${theme === 'dark' ? 'text-[#A8A29E]' : 'text-[#5D5A53]'}`}>
                              <button type="button" onClick={onLogin} className={`underline underline-offset-4 ${theme === 'dark' ? 'hover:text-[#EBE7DE]' : 'hover:text-[#1A4D2E]'} font-medium transition-colors`}>Log in</button> to comment with your profile, or enter your name below to post as a guest.
                          </p>
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            className={`w-full p-4 bg-transparent border ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} outline-none focus:border-[#1A4D2E] transition-colors`}
                            required
                          />
                      </div>
                  )}
                  <textarea 
                    placeholder="Share your thoughts..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className={`w-full p-4 bg-transparent border ${theme === 'dark' ? 'border-[#2C4A3B] text-[#EBE7DE] placeholder-[#A8A29E]/50' : 'border-[#D6D1C7] text-[#1A4D2E] placeholder-[#5D5A53]/50'} outline-none focus:border-[#1A4D2E] transition-colors h-32 resize-none`}
                    required
                  />
                  <button 
                    type="submit" 
                    className={`px-8 py-3 ${theme === 'dark' ? 'bg-[#EBE7DE] text-[#051009] hover:bg-[#A8A29E]' : 'bg-[#1A4D2E] text-[#F5F2EB] hover:bg-[#2e5c41]'} uppercase tracking-widest text-sm font-medium transition-colors`}
                  >
                    Post Comment
                  </button>
              </form>
          </div>
       </div>
    </div>
  );
};

export default JournalDetail;