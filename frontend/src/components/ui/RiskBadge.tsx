import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: string;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const normLevel = (level || 'UNKNOWN').toUpperCase();

  if (normLevel === 'LOW') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-semibold text-xs shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
        Normal / Low Risk
      </div>
    );
  }
  
  if (normLevel === 'MODERATE') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] font-semibold text-xs shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
        Needs Attention
      </div>
    );
  }

  if (normLevel === 'HIGH' || normLevel === 'CRITICAL') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#B91C1C] font-semibold text-xs shadow-2xs">
        <AlertCircle className="w-3.5 h-3.5 text-[#DC2626]" />
        High Risk / Critical
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] font-semibold text-xs">
      {level || 'Unknown Risk'}
    </div>
  );
}
