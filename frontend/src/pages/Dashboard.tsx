import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import PageTransition from '../components/ui/PageTransition';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import HealthScoreCard from '../components/dashboard/HealthScoreCard';
import TimelineChart from '../components/dashboard/TimelineChart';
import AiInsightsCard from '../components/dashboard/AiInsightsCard';
import TrendSummary from '../components/dashboard/TrendSummary';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CheckCircle2, HeartPulse, UploadCloud, AlertTriangle } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import { Link } from 'react-router-dom';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyDashboard() {
  return (
    <PageTransition>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-xs font-semibold mb-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[#16A34A]" />
            Personal Health Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Clinical Health Overview
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="max-w-md w-full"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center mx-auto mb-6">
            <HeartPulse className="w-10 h-10 text-[#16A34A]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#172033] mb-3 tracking-tight">
            No health reports yet
          </h2>
          <p className="text-[#64748B] mb-8 leading-relaxed">
            Upload your first medical report to start building your personal health record. We'll extract parameters, calculate your health score, and generate AI-powered insights.
          </p>
          <Link
            to="/upload"
            className="btn-primary rounded-full px-8 py-3.5 text-base inline-flex items-center gap-2"
          >
            <UploadCloud className="w-5 h-5" />
            Upload Your First Report
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────
function ErrorDashboard({ message }: { message: string }) {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
        </div>
        <h2 className="text-xl font-bold text-[#172033] mb-2">Unable to load dashboard</h2>
        <p className="text-[#64748B] text-sm max-w-sm">{message}</p>
      </div>
    </PageTransition>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 animate-pulse">
        <div className="col-span-1 md:col-span-6 lg:col-span-4 h-[380px] skeleton" />
        <div className="col-span-1 md:col-span-6 lg:col-span-8 flex flex-col gap-6">
          <div className="h-[110px] skeleton w-full" />
          <div className="h-[250px] skeleton w-full" />
        </div>
        <div className="col-span-1 md:col-span-6 lg:col-span-12 h-[260px] skeleton" />
      </div>
    );
  }

  if (isError) {
    const errMsg = (error as any)?.response?.data?.detail || 'Please try refreshing the page.';
    return <ErrorDashboard message={errMsg} />;
  }

  // No data at all — show empty state
  if (!data) {
    return <EmptyDashboard />;
  }

  // User has no completed reports yet — empty state
  if (data.stats.total_reports === 0) {
    return <EmptyDashboard />;
  }

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-xs font-semibold mb-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-[#16A34A]" />
            Personal Health Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Clinical Health Overview
          </h1>
          <p className="text-[#64748B] text-xs sm:text-sm mt-0.5">
            Summary of your latest blood parameters, health score, and clinical insights.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-full shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          <span className="text-xs font-semibold text-[#15803D]">Health Engine Active</span>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
      >
        {/* Main Health Score Card */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4 h-full">
          <HealthScoreCard
            healthScore={data.health_score}
            riskLevel={data.risk_level}
          />
        </motion.div>

        {/* Stats & Score Timeline */}
        <motion.div variants={item} className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full">
          <DashboardMetrics
            totalReports={data.stats.total_reports}
            abnormalCount={(data.stats.parameter_summary?.high ?? 0) + (data.stats.parameter_summary?.low ?? 0)}
            profileCompletion={data.profile_completion}
          />
          <TimelineChart timeline={data.health_timeline ?? []} />
        </motion.div>

        {/* AI Health Insights */}
        {data.health_summary && (
          <motion.div variants={item} className="col-span-12">
            <AiInsightsCard
              summary={data.health_summary}
              insights={data.latest_insights ?? []}
            />
          </motion.div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <motion.div variants={item} className="col-span-12">
            <GlassCard className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#F0FDF4] text-[#16A34A]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider">
                  Health Recommendations
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.recommendations.slice(0, 6).map((rec: any, idx: number) => {
                  const recText = typeof rec === 'string' ? rec : (rec.recommendation || rec.text || JSON.stringify(rec));
                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#172033] font-medium leading-relaxed">
                        {recText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Attention & Parameter Trends */}
        <motion.div variants={item} className="col-span-12 lg:col-span-4">
          <TrendSummary
            attentionRequired={data.attention_required ?? []}
            improving={data.improving_parameters ?? []}
            declining={data.declining_parameters ?? []}
            type="attention"
          />
        </motion.div>

        <motion.div variants={item} className="col-span-12 lg:col-span-8">
          <TrendSummary
            attentionRequired={data.attention_required ?? []}
            improving={data.improving_parameters ?? []}
            declining={data.declining_parameters ?? []}
            type="trends"
          />
        </motion.div>

      </motion.div>
    </PageTransition>
  );
}
