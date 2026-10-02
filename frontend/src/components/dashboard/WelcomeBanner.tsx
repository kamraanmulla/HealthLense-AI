import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface WelcomeBannerProps {
  userName?: string | null;
  healthScore?: number | null;
  riskLevel?: string | null;
}

export default function WelcomeBanner({ userName, healthScore, riskLevel }: WelcomeBannerProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = userName ? userName.split(' ')[0] : 'there';
  const hasScore = healthScore !== null && healthScore !== undefined;
  const score = hasScore ? healthScore : 0;
  const gradeLabel = hasScore
    ? score >= 80 ? 'Good' : score >= 65 ? 'Moderate' : 'Attention'
    : null;

  // SVG circular arc calculation
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = hasScore
    ? circumference - (score / 100) * circumference
    : circumference; // full empty circle when no score

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">

      {/* Left Banner with Greeting & Slogan */}
      <div className="lg:col-span-9 rounded-2xl bg-white border border-[#E2E8F0] p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between shadow-2xs">

        {/* Soft Background Leaf Gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#ECFDF5]/80 via-[#F0FDF4]/40 to-transparent pointer-events-none" />
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-48 h-32 opacity-40 text-[#10B981] pointer-events-none hidden md:block">
          <svg viewBox="0 0 200 120" fill="currentColor">
            <path d="M120 20 C160 10, 190 40, 200 80 C170 100, 130 90, 100 60 C80 40, 90 20, 120 20 Z" opacity="0.6" />
            <path d="M150 50 C180 40, 195 70, 190 100 C160 110, 130 95, 120 75 Z" opacity="0.4" />
          </svg>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#172B3A] tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
            {hasScore
              ? "Here's your health overview and latest updates."
              : "Welcome to your personal health dashboard."
            }
          </p>
        </div>

        <div className="relative z-10 mt-4 sm:mt-0 text-left sm:text-right hidden sm:block">
          <span className="text-xs font-semibold text-[#059669] leading-tight block">
            Small steps today,
          </span>
          <span className="text-xs font-semibold text-[#059669] leading-tight block">
            better health tomorrow.
          </span>
        </div>
      </div>

      {/* Right Card: Health Score Badge */}
      {hasScore ? (
        <Link
          to="/analytics"
          className="lg:col-span-3 rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between gap-4 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            {/* Circular Progress Gauge */}
            <div className="relative w-15 h-15 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  className="stroke-[#E2E8F0]"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  className="stroke-[#10B981] transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center leading-none">
                <span className="font-display text-base font-extrabold text-[#172B3A]">{score}</span>
                <span className="text-[9px] text-[#94A3B8] font-bold">/100</span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#64748B]">Your Health Score</span>
              <span className="text-sm font-bold text-[#172B3A] mt-0.5">{gradeLabel}</span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
        </Link>
      ) : (
        <div className="lg:col-span-3 rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-center shadow-2xs">
          <div className="text-center">
            <div className="relative w-15 h-15 flex items-center justify-center mx-auto mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  className="stroke-[#E2E8F0]"
                  strokeWidth="6"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center leading-none">
                <span className="font-display text-sm font-bold text-[#94A3B8]">—</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#64748B] block">Health Score</span>
            <span className="text-xs font-medium text-[#94A3B8] mt-0.5 block">Not available yet</span>
          </div>
        </div>
      )}

    </div>
  );
}
