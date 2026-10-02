import { Link } from 'react-router-dom';
import { TrendingDown, ShieldAlert, Lightbulb, Moon, ChevronRight, Sparkles, UploadCloud } from 'lucide-react';

interface HealthInsightsCardProps {
  insights?: any[];
}

export default function DashboardHealthInsightsCard({ insights = [] }: HealthInsightsCardProps) {
  const displayInsights = insights.slice(0, 4);

  const getStyleForIndex = (index: number) => {
    switch (index % 4) {
      case 0:
        return {
          icon: TrendingDown,
          iconBg: 'bg-[#ECFDF5]',
          iconColor: 'text-[#10B981]',
        };
      case 1:
        return {
          icon: ShieldAlert,
          iconBg: 'bg-[#FFFBEB]',
          iconColor: 'text-[#F59E0B]',
        };
      case 2:
        return {
          icon: Lightbulb,
          iconBg: 'bg-[#F0F9FF]',
          iconColor: 'text-[#0284C7]',
        };
      case 3:
      default:
        return {
          icon: Moon,
          iconBg: 'bg-[#F5F3FF]',
          iconColor: 'text-[#7C3AED]',
        };
    }
  };

  const parseInsight = (item: any, idx: number) => {
    if (typeof item === 'string') {
      return {
        id: `ins-${idx}`,
        title: idx === 0 ? 'Primary Finding' : idx === 1 ? 'Clinical Recommendation' : 'Health Observation',
        description: item,
      };
    }
    return {
      id: item.id || `ins-${idx}`,
      title: item.title || item.category || (idx === 0 ? 'Primary Finding' : idx === 1 ? 'Clinical Recommendation' : 'Health Observation'),
      description: item.insight || item.description || item.recommendation || (typeof item === 'object' ? Object.values(item).join(' ') : String(item)),
    };
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
          Health Insights
        </h2>
        {displayInsights.length > 0 && (
          <Link
            to="/insights"
            className="text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {displayInsights.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
          <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#172B3A]">No health insights yet</p>
          <p className="text-[11px] text-[#64748B] mt-1 max-w-[240px]">
            Upload a report to generate AI-driven clinical findings, risk assessments, and recommendations.
          </p>
          <Link
            to="/upload"
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3FF] hover:bg-[#EDE9FE] text-[#7C3AED] rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Report
          </Link>
        </div>
      ) : (
        /* Insights List */
        <div className="space-y-3 flex-1 flex flex-col justify-around">
          {displayInsights.map((rawItem, idx) => {
            const item = parseInsight(rawItem, idx);
            const { icon: Icon, iconBg, iconColor } = getStyleForIndex(idx);

            return (
              <Link
                key={item.id}
                to="/insights"
                className="flex items-center justify-between gap-3 p-1.5 -mx-1.5 hover:bg-[#F8FAFC] rounded-xl transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#172B3A] group-hover:text-[#10B981] transition-colors leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
