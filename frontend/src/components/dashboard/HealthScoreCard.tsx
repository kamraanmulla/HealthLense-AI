import { FileText, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <GlassCard hover className="p-7 flex flex-col h-full bg-white border border-[#E2E8F0] shadow-sm">
      <div className="flex justify-between items-start w-full mb-6">
        <div>
          <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider block mb-1">
            Overall Assessment
          </span>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            Health Index
            {grade && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-bold">
                Grade {grade}
              </span>
            )}
          </h2>
        </div>
        <Link 
          to="/reports" 
          title="View Reports"
          className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#16A34A] hover:bg-[#F0FDF4] hover:border-[#DCFCE7] transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 -rotate-45" />
        </Link>
      </div>
      
      {healthScore !== null ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative my-2"
          >
            <HealthGauge score={healthScore} size={180} />
          </motion.div>
          
          <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 w-full flex flex-col items-center gap-2.5"
          >
            <RiskBadge level={riskLevel || 'UNKNOWN'} />
            <p className="text-xs text-[#64748B] text-center font-medium">
              {healthScore >= 80 
                ? 'Your key laboratory parameters fall within healthy reference bounds.'
                : healthScore >= 60
                ? 'Some parameters require monitoring or dietary/lifestyle attention.'
                : 'Several abnormal parameters detected. Please consult your physician.'
              }
            </p>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#94A3B8]">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-[#172033] font-bold text-sm mb-1">No Data Available</h3>
          <p className="text-[#64748B] text-xs">Upload a medical report to compute your comprehensive health score.</p>
          <Link to="/upload" className="mt-4 btn-primary text-xs py-2 px-3">
            Upload Report
          </Link>
        </div>
      )}
    </GlassCard>
  );
}
