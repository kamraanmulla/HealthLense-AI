import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface HealthTrendCardProps {
  parameterName: string;
  previousValue: string;
  currentValue: string;
  trend: 'Improving' | 'Stable' | 'Needs attention';
}

export default function HealthTrendCard({ parameterName, previousValue, currentValue, trend }: HealthTrendCardProps) {
  let trendColor = 'text-[#64748B]';
  let trendBg = 'bg-[#F8FAFC] border-[#E2E8F0]';
  let Icon = Minus;

  if (trend === 'Improving') {
    trendColor = 'text-[#16A34A]';
    trendBg = 'bg-[#F0FDF4] border-[#DCFCE7]';
    Icon = TrendingDown;
  } else if (trend === 'Needs attention') {
    trendColor = 'text-[#DC2626]';
    trendBg = 'bg-[#FEF2F2] border-[#FECACA]';
    Icon = TrendingUp;
  }

  return (
    <GlassCard className="p-5 bg-white border border-[#E2E8F0] flex items-center justify-between group hover:border-[#CBD5E1] transition-colors shadow-sm">
      <div>
        <h4 className="text-sm font-bold text-[#172033] mb-2">{parameterName}</h4>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-0.5">Previous</span>
            <span className="text-sm font-medium text-[#64748B]">{previousValue}</span>
          </div>
          <div className="w-px h-8 bg-[#E2E8F0]" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-0.5">Current</span>
            <span className="text-sm font-medium text-[#172033]">{currentValue}</span>
          </div>
        </div>
      </div>
      
      <div className={`flex flex-col items-end gap-2 ${trendColor}`}>
        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${trendBg}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold">{trend}</span>
      </div>
    </GlassCard>
  );
}
