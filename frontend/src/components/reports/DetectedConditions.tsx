import type { Condition } from '../../types/api';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { AlertTriangle, CheckCircle, Stethoscope, Clock, UserCheck } from 'lucide-react';

interface DetectedConditionsProps {
  conditions: Condition[];
}

export default function DetectedConditions({ conditions }: DetectedConditionsProps) {
  if (!conditions || conditions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-2.5 px-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <Stethoscope className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">Clinical Conditions Evaluated</h2>
          <p className="text-xs text-[#64748B]">Inferred by clinical reference rules based on laboratory parameter patterns</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {conditions.map((condition, idx) => {
          const confidencePct = Math.round(condition.confidence * 100);
          const sevLower = (condition.severity || '').toLowerCase();
          
          let severityBadge = 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]';
          if (sevLower === 'high' || sevLower === 'critical') {
            severityBadge = 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]';
          } else if (sevLower === 'moderate') {
            severityBadge = 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]';
          }

          return (
            <motion.div
              key={condition.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <GlassCard className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left Column */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${severityBadge}`}>
                        {condition.severity} Severity
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
                        Analysis Confidence: {confidencePct}%
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#172033] tracking-tight">
                      {condition.name}
                    </h3>
                    
                    <p className="text-xs text-[#475569] leading-relaxed">
                      {condition.explanation}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]">
                        <UserCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                        <span className="text-[11px] font-medium text-[#64748B]">Specialist:</span>
                        <span className="text-xs font-semibold text-[#172033]">{condition.recommended_specialist}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]">
                        <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                        <span className="text-[11px] font-medium text-[#64748B]">Urgency:</span>
                        <span className="text-xs font-semibold text-[#172033]">{condition.urgency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="md:w-72 flex flex-col gap-3">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
                      <h4 className="text-[11px] font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                        Supporting Lab Findings
                      </h4>
                      <ul className="space-y-1.5">
                        {condition.evidence.map((ev, i) => (
                          <li key={i} className="text-xs text-[#64748B] flex items-start gap-1.5 font-medium">
                            <span className="text-[#16A34A] mt-0.5">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {condition.recommended_tests && condition.recommended_tests.length > 0 && (
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5">
                        <h4 className="text-[11px] font-bold text-[#172033] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                          <CheckCircle className="w-3.5 h-3.5 text-[#16A34A]" />
                          Suggested Follow-up Tests
                        </h4>
                        <ul className="space-y-1.5">
                          {condition.recommended_tests.map((test, i) => (
                            <li key={i} className="text-xs text-[#64748B] flex items-start gap-1.5 font-medium">
                              <span className="text-[#16A34A] mt-0.5">→</span>
                              <span>{test}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
