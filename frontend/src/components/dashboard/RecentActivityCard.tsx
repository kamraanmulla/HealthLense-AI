import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, User as UserIcon, Lightbulb, Clock, UploadCloud } from 'lucide-react';
import type { RecentActivityItem } from '../../types/api';

interface RecentActivityCardProps {
  activities?: RecentActivityItem[];
}

export default function RecentActivityCard({ activities = [] }: RecentActivityCardProps) {
  const displayActivities = activities.slice(0, 4);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'report':
        return {
          icon: CheckCircle2,
          bg: 'bg-[#ECFDF5]',
          color: 'text-[#10B981]',
        };
      case 'analysis':
        return {
          icon: Sparkles,
          bg: 'bg-[#F5F3FF]',
          color: 'text-[#7C3AED]',
        };
      case 'profile':
        return {
          icon: UserIcon,
          bg: 'bg-[#F0FDFA]',
          color: 'text-[#0D9488]',
        };
      case 'insight':
      default:
        return {
          icon: Lightbulb,
          bg: 'bg-[#FDF4FF]',
          color: 'text-[#A855F7]',
        };
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
          Recent Activity
        </h2>
        {displayActivities.length > 0 && (
          <Link
            to="/reports"
            className="text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {displayActivities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-3">
          <div className="w-11 h-11 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8] flex items-center justify-center mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#172B3A]">No recent activity</p>
          <p className="text-[11px] text-[#64748B] mt-1 max-w-[200px]">
            Activity will appear here as you upload reports and track your vitals.
          </p>
          <Link
            to="/upload"
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#10B981] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Report
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5 flex-1 flex flex-col justify-around">
          {displayActivities.map((act) => {
            const { icon: Icon, bg, color } = getIconForType(act.type);
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full ${bg} ${color} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#172B3A] leading-tight truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-[#94A3B8] font-medium block mt-0.5">
                    {act.time_ago}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
