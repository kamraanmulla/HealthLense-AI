import { Link } from 'react-router-dom';
import { Heart, FlaskConical, Shield, Calendar, ChevronRight } from 'lucide-react';

interface MetricCardsProps {
  totalReports?: number;
  totalBiomarkers?: number;
  totalInsights?: number;
  nextCheckupDate?: string | null;
  nextCheckupDays?: number | null;
}

export default function DashboardMetricCards({
  totalReports = 0,
  totalBiomarkers = 0,
  totalInsights = 0,
  nextCheckupDate = null,
  nextCheckupDays = null,
}: MetricCardsProps) {

  // SVG mini sparkline curves
  const greenSparkline = "M0 16 Q 15 14, 25 18 T 50 10 T 75 12 T 100 4";
  const blueSparkline = "M0 14 Q 20 18, 40 12 T 65 15 T 85 8 T 100 6";
  const purpleSparkline = "M0 18 Q 20 10, 35 16 T 60 14 T 80 8 T 100 12";
  const tealSparkline = "M0 15 Q 25 10, 50 16 T 75 8 T 100 5";
  const flatSparkline = "M0 14 L 100 14";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* 1. Total Reports */}
      <Link
        to="/reports"
        className="rounded-2xl bg-white border border-[#E2E8F0] p-4.5 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-[#10B981]/20 stroke-[2.2]" />
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div>
          <span className="text-xs font-semibold text-[#64748B]">Total Reports</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-extrabold text-[#172B3A]">
              {totalReports}
            </span>
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 24" className={`w-full h-full ${totalReports > 0 ? 'stroke-[#10B981]' : 'stroke-[#CBD5E1]'} fill-none stroke-[2]`} strokeLinecap="round" strokeDasharray={totalReports > 0 ? undefined : '3 3'}>
                <path d={totalReports > 0 ? greenSparkline : flatSparkline} />
              </svg>
            </div>
          </div>
          <span className={`text-[11px] font-semibold mt-1 block ${totalReports > 0 ? 'text-[#10B981] font-bold' : 'text-[#94A3B8]'}`}>
            {totalReports > 0 ? `${totalReports} ${totalReports === 1 ? 'report' : 'reports'} saved` : 'No reports yet'}
          </span>
        </div>
      </Link>

      {/* 2. Biomarkers Analyzed */}
      <Link
        to="/analytics"
        className="rounded-2xl bg-white border border-[#E2E8F0] p-4.5 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5 stroke-[2.2]" />
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0D9488] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div>
          <span className="text-xs font-semibold text-[#64748B]">Biomarkers Analyzed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-extrabold text-[#172B3A]">
              {totalBiomarkers}
            </span>
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 24" className={`w-full h-full ${totalBiomarkers > 0 ? 'stroke-[#0D9488]' : 'stroke-[#CBD5E1]'} fill-none stroke-[2]`} strokeLinecap="round" strokeDasharray={totalBiomarkers > 0 ? undefined : '3 3'}>
                <path d={totalBiomarkers > 0 ? blueSparkline : flatSparkline} />
              </svg>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#94A3B8] mt-1 block">
            {totalBiomarkers > 0 ? `${totalBiomarkers} parameters extracted` : '0 parameters extracted'}
          </span>
        </div>
      </Link>

      {/* 3. Health Insights */}
      <Link
        to="/insights"
        className="rounded-2xl bg-white border border-[#E2E8F0] p-4.5 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 fill-[#7C3AED]/15 stroke-[2.2]" />
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#7C3AED] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div>
          <span className="text-xs font-semibold text-[#64748B]">Health Insights</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-display text-2xl font-extrabold text-[#172B3A]">
              {totalInsights}
            </span>
            <div className="w-20 h-6">
              <svg viewBox="0 0 100 24" className={`w-full h-full ${totalInsights > 0 ? 'stroke-[#7C3AED]' : 'stroke-[#CBD5E1]'} fill-none stroke-[2]`} strokeLinecap="round" strokeDasharray={totalInsights > 0 ? undefined : '3 3'}>
                <path d={totalInsights > 0 ? purpleSparkline : flatSparkline} />
              </svg>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#94A3B8] mt-1 block">
            {totalInsights > 0 ? `${totalInsights} clinical insights` : 'No insights yet'}
          </span>
        </div>
      </Link>

      {/* 4. Next Checkup */}
      <div
        className="rounded-2xl bg-white border border-[#E2E8F0] p-4.5 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs group flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all" />
        </div>

        <div>
          <span className="text-xs font-semibold text-[#64748B]">Next Checkup</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className={`font-display font-extrabold text-[#172B3A] truncate ${nextCheckupDate ? 'text-lg' : 'text-base'}`}>
              {nextCheckupDate ?? 'Not scheduled'}
            </span>
            <div className="w-16 h-6">
              <svg viewBox="0 0 100 24" className={`w-full h-full ${nextCheckupDate ? 'stroke-[#16A34A]' : 'stroke-[#CBD5E1]'} fill-none stroke-[2]`} strokeLinecap="round" strokeDasharray={nextCheckupDate ? undefined : '3 3'}>
                <path d={nextCheckupDate ? tealSparkline : flatSparkline} />
              </svg>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-[#94A3B8] mt-1 block">
            {nextCheckupDate && nextCheckupDays !== null && nextCheckupDays !== undefined
              ? `In ${nextCheckupDays} ${nextCheckupDays === 1 ? 'day' : 'days'}`
              : 'Upload report to calculate'}
          </span>
        </div>
      </div>

    </div>
  );
}
