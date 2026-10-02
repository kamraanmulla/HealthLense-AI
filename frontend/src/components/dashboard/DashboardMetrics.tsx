import { useEffect, useRef, useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">

      {/* Card 1: Total Reports */}
      <div className="card-futuristic p-5 sm:p-6 bg-white flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ECFDF5] to-[#F0FDFA] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              Verified
            </span>
          </div>
          <div className="mt-2">
            <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-1">
              <MetricCard value={totalReports} />
            </h3>
            <p className="text-xs font-bold text-[#64748B]">Total Laboratory Panels</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8] font-medium">All-time medical history</span>
          <Link to="/reports" className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-0.5">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 2: Abnormal Findings */}
      <div className="card-futuristic p-5 sm:p-6 bg-white flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform ${
              abnormalCount > 0
                ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]'
                : 'bg-gradient-to-tr from-[#ECFDF5] to-[#F0FDFA] border border-[#A7F3D0] text-[#059669]'
            }`}>
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            {abnormalCount > 0 ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B91C1C] bg-[#FEF2F2] px-2 py-0.5 rounded-full border border-[#FECACA]">
                Attention
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                All Normal
              </span>
            )}
          </div>
          <div className="mt-2">
            <h3 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-1 ${
              abnormalCount > 0 ? 'text-[#DC2626]' : 'text-[#0F172A]'
            }`}>
              <MetricCard value={abnormalCount} />
            </h3>
            <p className="text-xs font-bold text-[#64748B]">Biomarker Anomalies</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8] font-medium">Out-of-range indicators</span>
          <Link to="/analytics" className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-0.5">
            Analyze <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Card 3: Profile Completeness */}
      <div className="card-futuristic p-5 sm:p-6 bg-white flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ECFDF5] to-[#F0FDFA] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
              Telemetry
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-1">
                <MetricCard value={profileCompletion} suffix="%" />
              </h3>
            </div>
            <p className="text-xs font-bold text-[#64748B]">Health Profile Integrity</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
            <div
              className="bg-gradient-to-r from-[#059669] to-[#0D9488] h-full rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(10, profileCompletion))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-medium">Demographics & history</span>
            <Link to="/profile" className="text-[11px] font-bold text-[#059669] hover:underline flex items-center gap-0.5">
              Update <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
