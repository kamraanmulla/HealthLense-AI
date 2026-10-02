import { ArrowUpRight, ArrowDownRight, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
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
      <div className="card-futuristic p-6 h-full flex flex-col bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="font-display text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">Parameters Requiring Attention</h2>
          </div>
          {attentionRequired.length > 0 && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
              {attentionRequired.length} Flagged
            </span>
          )}
        </div>

        {attentionRequired.length > 0 ? (
          <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {attentionRequired.map((param, i) => (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                key={param}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#FEF2F2]/70 border border-[#FECACA] hover:bg-[#FEF2F2] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="text-[#0F172A] font-bold text-xs">{param}</span>
                </div>
                <Link
                  to={`/analytics`}
                  className="text-[10px] font-extrabold text-[#B91C1C] uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors"
                >
                  Review Trend &rarr;
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mb-2">
              <CheckCircle2 className="w-5 h-5 text-[#059669]" />
            </div>
            <p className="text-[#0F172A] text-xs font-bold">All Parameters Normal</p>
            <p className="text-[#64748B] text-[11px] mt-0.5">No critical deviations detected across active panels.</p>
          </div>
        )}
      </div>
    );
  }

  // Type: trends
  return (
    <div className="card-futuristic p-6 h-full flex flex-col bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="font-display text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">Health Parameter Trajectories</h2>
        </div>
        <Link
          to="/analytics"
          className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1 transition-colors"
        >
          Detailed Analytics &rarr;
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {improving.map((param, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              key={`imp-${param}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F0FDF4] border border-[#A7F3D0] hover:border-[#6EE7B7] transition-all"
            >
              <div className="p-2 rounded-lg bg-white text-[#059669] shadow-2xs">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#0F172A] font-bold text-xs truncate mb-0.5">{param}</p>
                <span className="text-[#047857] text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                  Stabilizing
                </span>
              </div>
            </motion.div>
          ))}

          {declining.map((param, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: (improving.length * 0.05) + (0.05 * i) }}
              key={`dec-${param}`}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] hover:border-[#FCD34D] transition-all"
            >
              <div className="p-2 rounded-lg bg-white text-[#D97706] shadow-2xs">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[#0F172A] font-bold text-xs truncate mb-0.5">{param}</p>
                <span className="text-[#B45309] text-[10px] font-extrabold uppercase tracking-wider bg-white/80 px-1.5 py-0.2 rounded border border-[#FDE68A]">
                  Monitoring
                </span>
              </div>
            </motion.div>
          ))}

          {improving.length === 0 && declining.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9]">
              <TrendingUp className="w-5 h-5 text-[#94A3B8] mb-1.5" />
              <p className="text-[#0F172A] text-xs font-bold">Trajectories In Progress</p>
              <p className="text-[#64748B] text-[11px] mt-0.5">Upload a second medical panel to compute trend velocity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
