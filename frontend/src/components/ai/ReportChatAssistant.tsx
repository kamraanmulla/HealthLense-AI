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
      <div className="flex items-center gap-2.5 px-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <MessageSquare className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Ask About Your Report</h2>
          <p className="text-xs text-[#64748B]">Ask questions strictly answered from this report's findings</p>
        </div>
      </div>

      <GlassCard className="flex flex-col h-[520px] bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-[#16A34A] text-white' : 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                    msg.role === 'user' 
                      ? 'bg-[#16A34A] text-white rounded-tr-xs' 
                      : 'bg-[#F8FAFC] text-[#172033] border border-[#E2E8F0] rounded-tl-xs'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  
                  {msg.disclaimer && (
                    <div className="mt-1.5 flex items-start gap-1.5 text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] p-2 rounded-lg text-[11px] max-w-full font-medium">
                      <ShieldAlert className="w-3 h-3 text-[#D97706] shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl rounded-tl-xs p-3 flex items-center gap-2 text-[#64748B] text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />
                <span>Consulting report context...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g. What do my hemoglobin results indicate?"
              disabled={isLoading}
              className="w-full bg-white border border-[#CBD5E1] rounded-xl py-2.5 pl-3.5 pr-11 text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-1.5 rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] disabled:opacity-40 disabled:hover:bg-[#16A34A] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-[#94A3B8]">
            Answers are strictly grounded in your uploaded report context • Not a substitute for medical advice
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
