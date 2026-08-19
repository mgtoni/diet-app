'use client';

import React from 'react';
import Link from 'next/link';

export function AIInsightCard({ 
  title, 
  content, 
  isPremium, 
  type,
  onDiscuss,
  href
}: { 
  title: string;
  content: string;
  isPremium: boolean;
  type: 'daily' | 'weekly';
  onDiscuss?: () => void;
  href?: string;
}) {
  if (!content) return null;
  
  // For non-premium, take the first sentence only.
  const sentences = content.split(/(?<=[.!?])\s+/);
  const previewText = sentences[0] || content;
  const hiddenText = sentences.slice(1).join(' ');

  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    const className = "bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden h-full flex flex-col group hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer block";
    if (href) {
      return <Link href={href} className={className}>{children}</Link>;
    }
    return <div onClick={onDiscuss} className={className}>{children}</div>;
  };

  return (
    <CardWrapper>
      <div className={`absolute top-0 right-0 -mr-12 -mt-12 w-40 h-40 rounded-full blur-3xl opacity-20 transition-opacity duration-700 ${type === 'daily' ? 'bg-emerald-500 group-hover:opacity-40' : 'bg-purple-500 group-hover:opacity-40'}`}></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {type === 'daily' ? (
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          ) : (
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          )}
          <h2 className="text-gray-900 font-bold">{title}</h2>
        </div>
        {isPremium && (
          <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {href ? "See more" : "Discuss this"} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </span>
        )}
      </div>
      
      <div className="relative flex-1 z-10 flex flex-col">
        <p className="text-gray-700 text-sm leading-relaxed mb-2 transition-all duration-300">
          {isPremium ? content : previewText}
        </p>
        
        {!isPremium && hiddenText && (
          <div className="relative mt-2 flex-1 flex flex-col">
            <p className="text-gray-700 text-sm leading-relaxed blur-[4px] select-none opacity-40">
              {hiddenText.length > 100 ? hiddenText : hiddenText + " This is some extra placeholder text to make the blur look longer and more enticing to the user so they see there is a lot of valuable information here."}
            </p>
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/50 to-transparent flex flex-col items-center justify-end pb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Premium Feature</span>
              <div className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2 px-6 rounded-full shadow-lg transition-transform transform group-hover:scale-105 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                Unlock AI Coach
              </div>
            </div>
          </div>
        )}
      </div>
    </CardWrapper>
  );
}
