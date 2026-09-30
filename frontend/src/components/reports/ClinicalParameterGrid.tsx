import { ShieldAlert, Heart, Activity, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import type { ReportParameter, ScoreExplanation } from '../../types/api';
import { motion, AnimatePresence } from 'framer-motion';

interface ClinicalParameterGridProps {
  parameters: ReportParameter[];
  explanations?: (ScoreExplanation | string)[] | null;
}

export default function ClinicalParameterGrid({ parameters, explanations }: ClinicalParameterGridProps) {
  if (!parameters || parameters.length === 0) return null;

  // Build lookup map for explanations
  const explanationMap = new Map<string, string>();
  if (explanations) {
    for (const exp of explanations) {
      if (typeof exp === 'object' && exp !== null && exp.parameter && exp.explanation) {
        explanationMap.set(exp.parameter.toLowerCase(), exp.explanation);
      }
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]">
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#172033] tracking-tight">
              Laboratory Health Parameters
            </h2>
            <p className="text-xs text-[#64748B]">Extracted and validated blood and clinical test measurements</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[#64748B] bg-white px-3 py-1 rounded-full border border-[#E2E8F0]">
          {parameters.length} Parameters Evaluated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {parameters.map((param, index) => {
            const statusLower = (param.status || 'normal').toLowerCase();
            const isNormal = statusLower === 'normal';
            const isHigh = statusLower === 'high';
            const isLow = statusLower === 'low';
            
            // Calculate position in range for visual bar
            let percentInRange = 50;
            if (param.reference_min !== null && param.reference_max !== null && param.value !== null) {
              const range = param.reference_max - param.reference_min;
              if (range > 0) {
                const val = Math.max(param.reference_min, Math.min(param.reference_max, param.value));
                percentInRange = ((val - param.reference_min) / range) * 100;
              }
            } else if (!isNormal) {
              percentInRange = isHigh ? 92 : 8;
            }

            const explanation = explanationMap.get(param.name.toLowerCase());
            
            return (
              <motion.div 
                key={param.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="h-full"
              >
                <GlassCard 
                  className={`p-5 h-full flex flex-col justify-between transition-all duration-200 bg-white border ${
                    !isNormal 
                      ? (isHigh 
                          ? 'border-[#FECACA] hover:border-[#F87171] shadow-2xs' 
                          : 'border-[#FDE68A] hover:border-[#FBBF24] shadow-2xs') 
                      : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div>
                    {/* Top Status & Title */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-bold text-sm text-[#172033] truncate flex-1" title={param.name}>
                        {param.name}
                      </h3>
                      {isNormal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-[10px] font-bold uppercase tracking-wider shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-[#16A34A]" /> Normal
                        </span>
                      ) : isHigh ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[10px] font-bold uppercase tracking-wider shrink-0">
                          <ArrowUp className="w-3 h-3" /> High
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-[10px] font-bold uppercase tracking-wider shrink-0">
                          <ArrowDown className="w-3 h-3" /> Low
                        </span>
                      )}
                    </div>
                    
                    {/* Measurement Value & Unit */}
                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className={`text-2xl font-extrabold tracking-tight ${
                        isNormal ? 'text-[#172033]' : isHigh ? 'text-[#DC2626]' : 'text-[#D97706]'
                      }`}>
                        {param.value !== null ? param.value : '—'}
                      </span>
                      {param.unit && (
                        <span className="text-xs font-semibold text-[#64748B]">{param.unit}</span>
                      )}
                    </div>

                    {/* Explanation if available */}
                    {explanation && (
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed mb-3 bg-[#F8FAFC] p-2 rounded-lg border border-[#F1F5F9]">
                        {explanation}
                      </p>
                    )}
                  </div>
                  
                  {/* Visual Reference Range Bar */}
                  <div className="mt-auto pt-3 border-t border-[#F1F5F9]">
                    <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden relative">
                      {/* Normal zone indicator in center */}
                      <div className="absolute inset-y-0 left-[20%] right-[20%] bg-[#DCFCE7] rounded-full" />
                      
                      {/* Patient value marker */}
                      {param.value !== null && (
                        <div 
                          style={{ left: `${Math.min(95, Math.max(5, percentInRange))}%` }}
                          className={`absolute top-0 bottom-0 w-2 -ml-1 rounded-full ${
                            isNormal ? 'bg-[#16A34A]' : isHigh ? 'bg-[#DC2626]' : 'bg-[#D97706]'
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2 text-[10px] text-[#64748B] font-semibold">
                      <span>{param.reference_min !== null ? param.reference_min : 'Min'}</span>
                      <span className="text-[#94A3B8] uppercase text-[9px] tracking-wider">
                        {param.reference_text || 'Standard Range'}
                      </span>
                      <span>{param.reference_max !== null ? param.reference_max : 'Max'}</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
