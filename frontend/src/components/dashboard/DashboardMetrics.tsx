import { useEffect, useRef, useState } from 'react';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);

  useEffect(() => {
    const from = 0;
    const animate = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const elapsed = timestamp - start.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

interface DashboardMetricsProps {
  totalReports: number;
  abnormalCount: number;
  profileCompletion: number;
}

function MetricCard({ value, suffix = '' }: { value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return <>{animated}{suffix}</>;
}

export default function DashboardMetrics({ totalReports, abnormalCount, profileCompletion }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      <GlassCard hover className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-[#64748B]">All Time</span>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#172033] tracking-tight mb-1">
              <MetricCard value={totalReports} />
            </h3>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Reports</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard hover className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${abnormalCount > 0 ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]' : 'bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            {abnormalCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] text-[10px] font-bold uppercase tracking-wider border border-[#FECACA]">
                Needs Attention
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#15803D] text-[10px] font-bold uppercase tracking-wider border border-[#DCFCE7]">
                All Normal
              </span>
            )}
          </div>
          <div>
            <h3 className={`text-3xl font-extrabold tracking-tight mb-1 ${abnormalCount > 0 ? 'text-[#DC2626]' : 'text-[#172033]'}`}>
              <MetricCard value={abnormalCount} />
            </h3>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Abnormal Findings</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard hover className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            {profileCompletion < 100 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#B45309] text-[10px] font-bold uppercase tracking-wider border border-[#FDE68A]">
                Incomplete
              </span>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-[#172033] tracking-tight mb-1">
              <MetricCard value={profileCompletion} suffix="%" />
            </h3>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Profile Completeness</p>
          </div>
        </div>
      </GlassCard>

    </div>
  );
}
