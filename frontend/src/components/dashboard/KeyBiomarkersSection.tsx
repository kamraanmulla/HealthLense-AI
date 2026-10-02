import { Link } from 'react-router-dom';
import { Droplet, Heart, Sun, Activity, FlaskConical, UploadCloud } from 'lucide-react';
import type { KeyBiomarker } from '../../types/api';

interface KeyBiomarkersSectionProps {
  biomarkers?: KeyBiomarker[];
}

export default function KeyBiomarkersSection({ biomarkers = [] }: KeyBiomarkersSectionProps) {
  const itemsToRender = biomarkers.slice(0, 4);

  const getStyleForBiomarker = (item: KeyBiomarker, index: number) => {
    const isNormal = item.status?.toLowerCase() === 'normal';

    if (index === 0) {
      return {
        icon: Droplet,
        iconBg: 'bg-[#ECFDF5]',
        iconColor: 'text-[#10B981]',
        progressColor: 'bg-[#10B981]',
      };
    } else if (index === 1) {
      return {
        icon: Heart,
        iconBg: 'bg-[#F5F3FF]',
        iconColor: 'text-[#7C3AED]',
        progressColor: 'bg-[#7C3AED]',
      };
    } else if (index === 2) {
      return {
        icon: Sun,
        iconBg: 'bg-[#FFFBEB]',
        iconColor: 'text-[#F59E0B]',
        progressColor: isNormal ? 'bg-[#10B981]' : 'bg-[#F59E0B]',
      };
    } else {
      return {
        icon: Activity,
        iconBg: 'bg-[#FEF2F2]',
        iconColor: 'text-[#EF4444]',
        progressColor: 'bg-[#10B981]',
      };
    }
  };

  const getBadgeStyle = (status: string) => {
    const lower = (status || '').toLowerCase();
    if (lower === 'normal') {
      return 'bg-[#ECFDF5] text-[#10B981] border-[#A7F3D0]';
    } else if (lower === 'low') {
      return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
    } else {
      return 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]';
    }
  };

  return (
    <div className="mb-6">

      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
          Key Biomarkers
        </h2>
        {itemsToRender.length > 0 && (
          <Link
            to="/analytics"
            className="text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {itemsToRender.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B3A]">No biomarkers recorded yet</h3>
              <p className="text-xs text-[#64748B] mt-0.5 max-w-xl">
                Upload your lab results (such as a Complete Blood Count, Lipid Profile, or Metabolic Panel) to automatically extract, analyze, and track your biomarker values.
              </p>
            </div>
          </div>
          <Link
            to="/upload"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[#065F46] hover:bg-[#044e39] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Lab Report
          </Link>
        </div>
      ) : (
        /* 4 Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {itemsToRender.map((item, index) => {
            const { icon: Icon, iconBg, iconColor, progressColor } = getStyleForBiomarker(item, index);

            // Calculate percentage position for bar
            let pct = 50;
            if (item.min_ref !== null && item.min_ref !== undefined && item.max_ref !== null && item.max_ref !== undefined) {
              const span = (item.max_ref - item.min_ref) || 1;
              pct = Math.min(100, Math.max(10, ((item.value - item.min_ref) / span) * 100));
            }

            return (
              <div
                key={index}
                className="rounded-2xl bg-white border border-[#E2E8F0] p-4.5 hover:border-[#CBD5E1] hover:shadow-xs transition-all shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border capitalize ${getBadgeStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#64748B]">
                    {item.display_name || item.name}
                  </span>

                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-display text-xl font-extrabold text-[#172B3A]">
                      {item.value}
                    </span>
                    <span className="text-xs font-semibold text-[#94A3B8]">
                      {item.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1 font-medium">
                    <span>{item.reference_range || 'Normal range'}</span>
                  </div>
                </div>

                {/* Progress Indicator Bar */}
                <div className="w-full bg-[#F1F5F9] h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${progressColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
