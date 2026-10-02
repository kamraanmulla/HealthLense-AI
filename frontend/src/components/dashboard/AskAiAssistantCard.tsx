import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Send, ChevronRight } from 'lucide-react';

interface AskAiAssistantCardProps {
  hasReports?: boolean;
}

export default function AskAiAssistantCard({ hasReports = false }: AskAiAssistantCardProps) {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const quickPrompts = hasReports ? [
    'Explain my latest report findings',
    'What do my key biomarkers indicate?',
    'How can I improve my health score?',
  ] : [
    'What medical reports can I upload?',
    'How does HealthLens analyze lab results?',
    'What biomarkers are tracked here?',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      navigate(`/assistant?q=${encodeURIComponent(question.trim())}`);
    }
  };

  const handlePromptClick = (prompt: string) => {
    navigate(`/assistant?q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      {/* Header */}
      <div>
        <Link
          to="/assistant"
          className="flex items-center justify-between group cursor-pointer mb-1"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#7C3AED]" />
            <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight group-hover:text-[#7C3AED] transition-colors">
              Ask AI Assistant
            </h2>
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
        </Link>
        <p className="text-xs text-[#64748B]">
          Get instant answers about your health reports, trends and more.
        </p>
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="relative my-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type your question..."
          className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#172B3A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] focus:bg-white transition-all shadow-2xs"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#0D9488] hover:bg-[#0f766e] text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Send question"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Prompt Pills */}
      <div className="space-y-1.5">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handlePromptClick(prompt)}
            className="w-full text-left px-3 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#A7F3D0] text-[11px] font-semibold text-[#0284C7] hover:text-[#059669] transition-all truncate block cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

    </div>
  );
}
