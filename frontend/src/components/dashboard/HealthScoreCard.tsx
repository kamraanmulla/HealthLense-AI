import { FileText, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import HealthGauge from '../ui/HealthGauge';
import RiskBadge from '../ui/RiskBadge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HealthScoreCardProps {
  healthScore: number | null;
  riskLevel: string | null;
  healthGrade?: string | null;
}

export default function HealthScoreCard({ healthScore, riskLevel, healthGrade }: HealthScoreCardProps) {
  // Compute health grade if not provided directly
  const grade = healthGrade || (
    healthScore !== null
      ? (healthScore >= 90 ? 'A+' : healthScore >= 80 ? 'A' : healthScore >= 70 ? 'B' : healthScore >= 60 ? 'C' : 'Critical')
      : null
  );

  return (
    <div className="card-futuristic p-6 sm:p-7 flex flex-col h-full bg-white">
      <div className="flex justify-between items-start w-full mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3 h-3 text-[#059669]" />
            Physiological Index
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            Health Score
            {grade && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ECFDF5] to-[#F0FDFA] border border-[#A7F3D0] text-[#047857] font-bold shadow-2xs">
                Grade {grade}
              </span>
            )}
          </h2>
        </div>
        <Link
          to="/reports"
          title="View All Lab Reports"
          className="w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#059669] hover:bg-[#F0FDF4] hover:border-[#A7F3D0] transition-all cursor-pointer shadow-2xs group"
        >
          <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {healthScore !== null ? (
        <div className="flex flex-col items-center justify-between flex-1">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative my-3"
          >
            <HealthGauge score={healthScore} size={185} />
          </motion.div>

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full flex flex-col items-center gap-3 pt-2"
          >
            <div className="flex items-center gap-2">
              <RiskBadge level={riskLevel || 'UNKNOWN'} />
              <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                {healthScore >= 80 ? 'Top 12% Demographic' : healthScore >= 60 ? 'Median Baseline' : 'Attention Required'}
              </span>
            </div>

            <p className="text-xs text-[#64748B] text-center font-medium leading-relaxed max-w-xs">
              {healthScore >= 80
                ? 'Your key laboratory parameters fall within healthy physiological bounds.'
                : healthScore >= 60
                ? 'Select parameters deviate slightly from target reference intervals.'
                : 'Multiple clinical markers require review. Consult your healthcare physician.'
              }
            </p>

            <Link
              to="/insights"
              className="mt-1 w-full py-2 px-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F0FDF4] border border-[#E2E8F0] hover:border-[#A7F3D0] text-[#059669] text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Explore AI Health Trajectory &rarr;</span>
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#94A3B8]">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-display text-[#0F172A] font-bold text-base mb-1">No Data Available</h3>
          <p className="text-[#64748B] text-xs">Upload your first blood report to generate an integrated clinical health score.</p>
          <Link to="/upload" className="mt-4 btn-primary text-xs py-2 px-4">
            Upload Report
          </Link>
        </div>
      )}
    </div>
  );
}
