'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AIInsightCard } from '@/components/AIInsightCard';
import Link from 'next/link';

export default function AICoachPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [aiInsights, setAiInsights] = useState<{ daily: string; weekly: string } | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Dashboard Insights (to show on the left)
      const insightsRes = await fetch('/api/dashboard');
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setAiInsights(insightsData.aiInsights);
        setIsPremium(insightsData.isPremium);
      }

      // Fetch Chat History
      const chatRes = await fetch('/api/chat');
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setMessages(chatData.data || []);
      }
    } catch (error) {
      console.error('Error fetching AI Coach data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !isPremium || isSending) return;

    const userMessage = input;
    setInput('');
    setIsSending(true);

    // Optimistically add user message
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: userMessage, created_at: new Date().toISOString() }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.data]); // Append AI response
      } else {
        // If it fails, maybe remove optimistic message or show error.
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscussInsight = (insightType: 'daily' | 'weekly') => {
    if (!isPremium) return;
    setInput(`Regarding my ${insightType} insight: `);
    // Focus input if we had a ref to it
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-40px)] gap-6 p-4 lg:p-6 overflow-hidden">
      
      {/* Left Column: Insights */}
      <div className="lg:w-1/3 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-20 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Coach</h1>
          <p className="text-gray-600 mb-6">Your personal nutrition companion.</p>
        </div>

        <div className="flex flex-col gap-4">
          <AIInsightCard 
            title="Today's Insight"
            content={aiInsights?.daily || ''}
            isPremium={isPremium}
            type="daily"
            onDiscuss={() => handleDiscussInsight('daily')}
          />
          <AIInsightCard 
            title="This Week's Review"
            content={aiInsights?.weekly || 'Your weekly review will be available on Sunday. Keep logging your meals!'}
            isPremium={isPremium}
            type="weekly"
            onDiscuss={() => handleDiscussInsight('weekly')}
          />
        </div>
      </div>

      {/* Right Column: Chat Interface */}
      <div className="lg:w-2/3 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden h-full">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 max-w-md mx-auto">
              <span className="material-symbols-outlined text-5xl text-emerald-300 mb-4">smart_toy</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to your AI Coach</h3>
              <p>I'm here to help you understand your nutrition scores, suggest meal improvements, and answer any questions about your diet. Say hello to get started!</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-emerald-500">psychology</span>
                    <span className="text-xs font-bold text-emerald-600">AI Coach</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-2 opacity-60 text-right`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isSending && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm p-4 shadow-sm">
                 <div className="flex gap-1 items-center h-5">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-4 bg-white border-t border-gray-200 relative z-20">
          {!isPremium && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-30 flex items-center justify-center border-t border-gray-200">
              <Link href="/insights" className="bg-gray-900 text-white font-semibold py-2 px-6 rounded-full hover:bg-gray-800 transition-colors shadow-md flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                Upgrade to Premium to Chat
              </Link>
            </div>
          )}
          
          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder={isPremium ? "Ask your coach anything..." : "Premium feature locked"}
              disabled={!isPremium || isSending}
              className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none max-h-32 min-h-[52px]"
              rows={1}
            />
            <button 
              type="submit"
              disabled={!input.trim() || !isPremium || isSending}
              className="absolute right-2 bottom-2 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-gray-400">AI responses are for coaching purposes and do not constitute medical advice.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
