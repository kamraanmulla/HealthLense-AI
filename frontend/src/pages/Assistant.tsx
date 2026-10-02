import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  Send,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
  FileText,
  Loader2,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { assistantApi, reportsApi } from '../lib/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import type { AssistantMessage } from '../types/api';

const SUGGESTIONS = [
  "What does a high cholesterol level mean?",
  "Explain my latest blood test results",
  "What are the normal ranges for hemoglobin?",
  "How does blood sugar affect my health?",
  "What lifestyle changes can improve my health?",
  "What is the difference between HDL and LDL?",
];

export default function Assistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch user reports for context
  const { data: reports } = useQuery({
    queryKey: ['reports-for-assistant'],
    queryFn: () => reportsApi.list(1, 20, 'completed'),
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideMessage?: string) => {
    const question = overrideMessage || input.trim();
    if (!question || isLoading) return;

    const userMsg: AssistantMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await assistantApi.chat({
        question,
        report_id: selectedReportId || undefined,
        history: messages.slice(-10), // last 10 messages for context
      });

      const assistantMsg: AssistantMessage = { role: 'assistant', content: res.reply };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AssistantMessage = {
        role: 'assistant',
        content: 'I apologize, but I was unable to process your question. Please try again or rephrase your query.',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CLINICAL AI COPILOT</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-800 font-bold">Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Health Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time conversational medical explanation, biomarker inquiry, and health wellness guidance.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {messages.length > 0 && (
            <button onClick={clearChat} className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Clear Session</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-230px)] min-h-[520px]">

        {/* Sidebar — Report Context Selector */}
        <div className="lg:col-span-1 hidden lg:block">
          <div className="card-futuristic p-5 h-full flex flex-col shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Context Grounding</h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Select a diagnostic report to ground responses strictly in your personal clinical lab measurements.
            </p>

            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all mb-4 shadow-inner"
            >
              <option value="">General clinical knowledge</option>
              {reports?.data.map((r) => (
                <option key={r.id} value={r.id}>{r.original_filename}</option>
              ))}
            </select>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 mb-4">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Active Model
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Google Gemini 3.8 Flash with calibrated safety bounds
              </p>
            </div>

            <div className="flex-1" />

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  Educational health information only. Always consult a licensed clinician for medical decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="card-futuristic flex-1 flex flex-col overflow-hidden shadow-card">

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-20 h-20 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center mx-auto mb-6">
                      <MessageSquareText className="w-10 h-10 text-[#16A34A]" />
                    </div>
                    <h2 className="text-xl font-extrabold text-[#172033] mb-2 tracking-tight">
                      How can I help?
                    </h2>
                    <p className="text-sm text-[#64748B] mb-8 max-w-md mx-auto">
                      Ask me about your health reports, biomarker meanings, or general wellness topics.
                    </p>

                    {/* Suggestion chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                      {SUGGESTIONS.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(suggestion)}
                          className="text-left p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B] font-medium hover:bg-[#F0FDF4] hover:border-[#DCFCE7] hover:text-[#15803D] transition-all cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                            <Bot className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3.5 text-xs sm:text-sm leading-relaxed font-medium ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs shadow-sm'
                              : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                            <User className="w-4 h-4 text-slate-700" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loading indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 flex items-center gap-2.5">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span className="text-xs text-slate-500 font-medium">Synthesizing clinical response...</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-100 p-4 bg-slate-50/70">
              {/* Mobile report selector */}
              <div className="lg:hidden mb-3">
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="">General health questions</option>
                  {reports?.data.map((r) => (
                    <option key={r.id} value={r.id}>{r.original_filename}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about biomarkers, ranges, or health conditions..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12 shadow-inner"
                    disabled={isLoading}
                  />
                  {selectedReportId && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                HealthLens AI provides educational clinical explanation • Always consult a qualified medical professional for diagnosis
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
