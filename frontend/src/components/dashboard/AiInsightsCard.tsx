import { Sparkles, Activity, FileCheck, Stethoscope, ArrowRight, MessageSquareText, Cpu } from 'lucide-react';
import type { HealthInsight } from '../../types/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface AiInsightsCardProps {
  summary: string;
  insights: HealthInsight[];
}

export default function AiInsightsCard({ summary, insights }: AiInsightsCardProps) {
  return (
    <div className="card-futuristic p-6 sm:p-7 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ECFDF5] to-[#F0FDFA] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs">
            <Cpu className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              Neural Clinical Intelligence
            </h2>
            <p className="text-xs font-medium text-[#64748B]">Personalized clinical analysis synthesized by Gemini 3.8 Flash</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            AI Grounded
          </span>
          <Link
            to="/assistant"
            className="text-xs font-bold text-[#059669] hover:underline inline-flex items-center gap-1"
          >
            Chat with AI <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Health Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-[#059669] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" /> Synthesized Clinical Summary
            </h3>
            <div className="bg-gradient-to-br from-[#F8FAFC] to-[#F0FDF4] border border-[#E2E8F0] rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#059669] to-[#0D9488]" />
              <p className="text-[#0F172A] leading-relaxed text-sm font-medium">
                {summary}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center gap-2">
            <Link
              to="/assistant"
              className="flex-1 py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#A7F3D0] text-[#059669] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Ask AI About This Summary</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Key Clinical Insights */}
        <div className="lg:col-span-7 flex flex-col">
          <h3 className="text-xs font-extrabold text-[#059669] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Key Physiological Insights
          </h3>
          <div className="space-y-3 flex-1">
            {insights.slice(0, 3).map((insight, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx }}
                key={idx}
                className="flex gap-3.5 items-start bg-white hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#A7F3D0] transition-all p-4 rounded-2xl shadow-2xs group"
              >
                <div className="mt-0.5 shrink-0 w-7 h-7 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] group-hover:border-[#A7F3D0] group-hover:bg-white flex items-center justify-center transition-colors">
                  <span className="font-display text-xs font-extrabold text-[#059669]">{idx + 1}</span>
                </div>
                <p className="text-[#0F172A] text-xs leading-relaxed font-semibold flex-1 pt-0.5">
                  {insight.insight}
                </p>
              </motion.div>
            ))}

            {insights.length === 0 && (
              <div className="p-6 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl text-xs text-[#64748B]">
                Upload additional medical panels to unlock deep multi-variable trend insights.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
