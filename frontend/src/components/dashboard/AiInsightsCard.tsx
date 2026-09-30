import { Sparkles, ChevronRight, Activity, FileCheck, Stethoscope } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import type { HealthInsight } from '../../types/api';
import { motion } from 'framer-motion';

interface AiInsightsCardProps {
  summary: string;
  insights: HealthInsight[];
}

export default function AiInsightsCard({ summary, insights }: AiInsightsCardProps) {
  return (
    <GlassCard className="p-7 bg-white border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <Stethoscope className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            Health Insights & Summary
          </h2>
          <p className="text-xs font-medium text-[#64748B]">Personalized clinical analysis from your latest report</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 flex flex-col">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" /> Health Summary
          </h3>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 flex-1">
            <p className="text-[#172033] leading-relaxed text-sm font-medium">
              {summary}
            </p>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" /> Key Clinical Insights
          </h3>
          <div className="space-y-2.5 flex-1">
            {insights.slice(0, 3).map((insight, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                key={idx} 
                className="flex gap-3.5 items-start bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#DCFCE7] transition-all p-3.5 rounded-xl group"
              >
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-white border border-[#E2E8F0] group-hover:border-[#DCFCE7] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#16A34A]">{idx + 1}</span>
                </div>
                <p className="text-[#172033] text-xs leading-relaxed font-medium flex-1 pt-0.5">
                  {insight.insight}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
