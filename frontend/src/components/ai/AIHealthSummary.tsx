import type { AIHealthSummary as AIHealthSummaryType } from '../../types/api';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { Activity, Apple, Coffee, Info, MessageCircle, ShieldAlert } from 'lucide-react';

interface AIHealthSummaryProps {
  summary?: AIHealthSummaryType;
}

export default function AIHealthSummary({ summary }: AIHealthSummaryProps) {
  if (!summary) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2.5 px-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <Activity className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Clinical Health Guidance</h2>
          <p className="text-xs text-[#64748B]">Lifestyle suggestions and doctor consultation discussion points</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <GlassCard className="p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-[#16A34A]" />
            Key Clinical Observations
          </h3>
          <ul className="space-y-2">
            {summary.key_findings.map((finding, idx) => (
              <li key={idx} className="text-xs text-[#475569] flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-[#16A34A] mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-xs font-bold text-[#D97706] uppercase tracking-wider flex items-center gap-2 mb-3">
            <Coffee className="w-4 h-4 text-[#D97706]" />
            Lifestyle Recommendations
          </h3>
          <ul className="space-y-2">
            {summary.lifestyle_recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-[#475569] flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-[#D97706] mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-xs font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-2 mb-3">
            <Apple className="w-4 h-4 text-[#16A34A]" />
            Dietary Guidance
          </h3>
          <ul className="space-y-2">
            {summary.dietary_guidance.map((guidance, idx) => (
              <li key={idx} className="text-xs text-[#475569] flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-[#16A34A] mt-0.5">•</span>
                <span>{guidance}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-xs font-bold text-[#0284C7] uppercase tracking-wider flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-[#0284C7]" />
            Doctor Discussion Points
          </h3>
          <ul className="space-y-2">
            {summary.doctor_discussion_points.map((point, idx) => (
              <li key={idx} className="text-xs text-[#475569] flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-[#0284C7] mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {summary.medical_disclaimer && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs">
          <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{summary.medical_disclaimer}</p>
        </div>
      )}
    </div>
  );
}
