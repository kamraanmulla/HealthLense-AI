import { Activity, Heart, Apple, User as UserIcon } from 'lucide-react';
import type { HealthCategoryBreakdown } from '../../types/api';

interface HealthScoreBreakdownProps {
  score?: number | null;
  breakdown?: HealthCategoryBreakdown | null;
}

export default function HealthScoreBreakdownCard({
  score = null,
  breakdown = null,
}: HealthScoreBreakdownProps) {
  const hasData = score !== null && score !== undefined;
  const currentScore = score ?? 0;
  const gradeLabel = !hasData
    ? 'Awaiting Data'
    : currentScore >= 80
      ? 'Good'
      : currentScore >= 65
        ? 'Moderate'
        : 'Attention';

  // SVG circular arc calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasData
    ? circumference - (currentScore / 100) * circumference
    : circumference;

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      <div>
        <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
          Health Score Breakdown
        </h2>
      </div>

      {/* Central Circular Gauge */}
      <div className="my-3 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="stroke-[#E2E8F0]"
              strokeWidth="10"
              fill="transparent"
            />
            {hasData ? (
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#10B981] transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            ) : (
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#CBD5E1]"
                strokeWidth="6"
                strokeDasharray="4 4"
                fill="transparent"
              />
            )}
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-display text-2xl font-extrabold text-[#172B3A] leading-tight">
              {hasData ? currentScore : '--'}
            </span>
            <span className="text-[10px] text-[#94A3B8] font-bold">/100</span>
            <span className={`text-xs font-bold mt-0.5 ${hasData ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {gradeLabel}
            </span>
          </div>
        </div>
        {!hasData && (
          <p className="text-[11px] text-[#94A3B8] text-center mt-2 max-w-[190px]">
            Upload a report to generate category scores
          </p>
        )}
      </div>

      {/* 2x2 Sub-Scores Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F1F5F9]">

        {/* Metabolic */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-[#64748B] block truncate">Metabolic</span>
            <span className="text-xs font-extrabold text-[#172B3A] font-mono">
              {breakdown?.metabolic ?? '--'}<span className="text-[10px] text-[#94A3B8] font-normal">/100</span>
            </span>
          </div>
        </div>

        {/* Cardiovascular */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F0F9FF] text-[#0284C7] flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-[#64748B] block truncate">Cardiovascular</span>
            <span className="text-xs font-extrabold text-[#172B3A] font-mono">
              {breakdown?.cardiovascular ?? '--'}<span className="text-[10px] text-[#94A3B8] font-normal">/100</span>
            </span>
          </div>
        </div>

        {/* Nutritional */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#D97706] flex items-center justify-center shrink-0">
            <Apple className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-[#64748B] block truncate">Nutritional</span>
            <span className="text-xs font-extrabold text-[#172B3A] font-mono">
              {breakdown?.nutritional ?? '--'}<span className="text-[10px] text-[#94A3B8] font-normal">/100</span>
            </span>
          </div>
        </div>

        {/* Lifestyle */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center shrink-0">
            <UserIcon className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-[#64748B] block truncate">Lifestyle</span>
            <span className="text-xs font-extrabold text-[#172B3A] font-mono">
              {breakdown?.lifestyle ?? '--'}<span className="text-[10px] text-[#94A3B8] font-normal">/100</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
