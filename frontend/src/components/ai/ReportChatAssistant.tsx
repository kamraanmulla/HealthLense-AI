import { useState, useRef, useEffect } from 'react';
import type { ChatResponse } from '../../types/api';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { MessageSquare, Send, User, Loader2, ShieldAlert, Bot } from 'lucide-react';
import { reportsApi } from '../../lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  disclaimer?: string;
}

interface ReportChatAssistantProps {
  reportId: string;
}

export default function ReportChatAssistant({ reportId }: ReportChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! You can ask questions about this medical report. I can explain specific findings, abnormal parameters, or medical terms strictly based on your report findings.',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await reportsApi.chat(reportId, userMsg.content);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        disclaimer: response.disclaimer,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try asking again.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 px-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <MessageSquare className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">Ask About Your Report</h2>
          <p className="text-xs text-slate-500 font-medium">Context-grounded clinical explanations for this specific report</p>
        </div>
      </div>

      <div className="card-futuristic flex flex-col h-[520px] shadow-card overflow-hidden">
        {/* Messages viewport */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white'
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs shadow-sm'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.disclaimer && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-amber-900 bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl text-xs max-w-full font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2.5 text-slate-500 text-xs font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Consulting neural context & clinical ranges...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-slate-50/80 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this report (e.g., What does my platelet count indicate?)"
              disabled={isLoading}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-12 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
            Strictly grounded in your uploaded report context • Not a substitute for professional medical consultation
          </p>
        </div>
      </div>
    </div>
  );
}
