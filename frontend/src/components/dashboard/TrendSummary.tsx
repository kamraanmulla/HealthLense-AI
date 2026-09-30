import { ArrowUpRight, ArrowDownRight, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { motion } from 'framer-motion';

interface TrendSummaryProps {
  attentionRequired: string[];
  improving: string[];
  declining: string[];
  type: 'attention' | 'trends';
}

export default function TrendSummary({ attentionRequired, improving, declining, type }: TrendSummaryProps) {
  
  if (type === 'attention') {
    return (
      <GlassCard className="p-6 h-full flex flex-col bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626]">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">Parameters Requiring Attention</h2>
        </div>
        
        {attentionRequired.length > 0 ? (
          <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {attentionRequired.map((param, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -8 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.05 * i }}
                key={param} 
                className="flex items-center justify-between p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]"
              >
                <span className="text-[#172033] font-semibold text-xs">{param}</span>
                <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#FECACA]">
                  Review
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
            <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            </div>
            <p className="text-[#64748B] text-xs font-medium">All recent parameters look normal. No immediate attention needed.</p>
          </div>
        )}
      </GlassCard>
    );
  }

  // Type: trends
  return (
    <GlassCard className="p-6 h-full flex flex-col bg-white border border-[#E2E8F0] shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-[#F0FDF4] text-[#16A34A]">
          <TrendingUp className="w-4 h-4" />
        </div>
        <h2 className="text-xs font-bold text-[#172033] uppercase tracking-wider">Health Parameter Trends</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {improving.map((param, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.05 * i }}
              key={`imp-${param}`} 
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]"
            >
              <div className="p-2 rounded-lg bg-white text-[#16A34A] shadow-2xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[#172033] font-semibold text-xs mb-0.5">{param}</p>
                <p className="text-[#15803D] text-[10px] font-bold uppercase tracking-wider">Improving</p>
              </div>
            </motion.div>
          ))}
          
          {declining.map((param, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: (improving.length * 0.05) + (0.05 * i) }}
              key={`dec-${param}`} 
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]"
            >
              <div className="p-2 rounded-lg bg-white text-[#D97706] shadow-2xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[#172033] font-semibold text-xs mb-0.5">{param}</p>
                <p className="text-[#B45309] text-[10px] font-bold uppercase tracking-wider">Declining</p>
              </div>
            </motion.div>
          ))}
          
          {improving.length === 0 && declining.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <TrendingUp className="w-5 h-5 text-[#94A3B8] mb-1.5" />
              <p className="text-[#64748B] text-xs font-medium">Multiple reports are needed to display parameter trend trajectories.</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
