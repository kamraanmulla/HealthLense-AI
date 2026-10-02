import { ShieldCheck, TrendingUp, AlertCircle, FileCheck } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import type { AIAnalysisResult } from '../../types/api';
import { motion } from 'framer-motion';

interface AiAnalysisSummaryProps {
  aiResult: AIAnalysisResult | null;
}

export default function AiAnalysisSummary({ aiResult }: AiAnalysisSummaryProps) {
  if (!aiResult) return null;

  const insights = aiResult.personalized_health_insights ?? [];
  const warnings = (aiResult.abnormal_parameters ?? []).map(
    (p) => `${p.test_name}: ${p.result ?? 'N/A'} (Reference: ${p.range ?? 'N/A'}) — ${p.status}`
  );

  return (
    <div className="card-futuristic p-6 sm:p-7 shadow-card h-full flex flex-col">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <FileCheck className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            Health Summary & Insights
          </h2>
          <p className="text-xs text-slate-500 font-medium">Automated clinical interpretation and educational findings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Executive Summary Section */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" /> Health Overview
          </h3>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 flex-1">
            <p className="text-[#172033] leading-relaxed text-sm font-medium">
              {aiResult.summary}
            </p>
          </div>
        </div>

        {/* Actionable Insights Section */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" /> Actionable Findings
          </h3>
          <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar">
            {insights.length > 0 ? insights.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className="flex gap-3 items-start bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl"
              >
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#CBD5E1] text-[#16A34A] flex items-center justify-center text-xs font-bold shadow-2xs">
                  {index + 1}
                </div>
                <p className="text-[#172033] text-xs leading-relaxed font-medium flex-1 pt-0.5">
                  {item.insight}
                </p>
              </motion.div>
            )) : (
              <p className="text-[#94A3B8] text-xs italic">No specific insights available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Abnormal Parameters Warnings */}
      {warnings.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#DC2626]" />
            <h4 className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider">
              Out-of-Range Parameters
            </h4>
          </div>
          <ul className="space-y-1.5">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-center gap-2 text-[#991B1B] text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
