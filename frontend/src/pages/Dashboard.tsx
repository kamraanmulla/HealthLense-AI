import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import PageTransition from '../components/ui/PageTransition';
import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import DashboardMetricCards from '../components/dashboard/DashboardMetricCards';
import HealthTrendOverviewChart from '../components/dashboard/HealthTrendOverviewChart';
import HealthScoreBreakdownCard from '../components/dashboard/HealthScoreBreakdownCard';
import RecentActivityCard from '../components/dashboard/RecentActivityCard';
import KeyBiomarkersSection from '../components/dashboard/KeyBiomarkersSection';
import DashboardRecentReportsTable from '../components/dashboard/DashboardRecentReportsTable';
import AskAiAssistantCard from '../components/dashboard/AskAiAssistantCard';
import DashboardHealthInsightsCard from '../components/dashboard/DashboardHealthInsightsCard';
import { UploadCloud, HeartPulse, FileText, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse py-2">
        <div className="h-24 bg-white rounded-2xl border border-[#E2E8F0]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 h-80 bg-white rounded-2xl border border-[#E2E8F0]" />
          <div className="lg:col-span-3 h-80 bg-white rounded-2xl border border-[#E2E8F0]" />
          <div className="lg:col-span-3 h-80 bg-white rounded-2xl border border-[#E2E8F0]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#172B3A]">Unable to load dashboard</h2>
          <p className="text-sm text-[#64748B] text-center max-w-md">
            We couldn't fetch your health data. Please check your connection and try again.
          </p>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </PageTransition>
    );
  }

  const hasReports = data && data.stats && data.stats.total_reports > 0;
  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'there';

  return (
    <PageTransition>
      <div className="pb-10 space-y-6">

        {/* 1. Top Welcome Banner & Health Score */}
        <WelcomeBanner
          userName={user?.full_name || undefined}
          healthScore={hasReports ? data.health_score : null}
          riskLevel={hasReports ? data.risk_level : null}
        />

        {/* If brand-new user, show helpful onboarding callout */}
        {!hasReports && (
          <div className="rounded-2xl bg-gradient-to-br from-[#ECFDF5] via-white to-[#F0FDFA] border border-[#A7F3D0] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white flex items-center justify-center shrink-0">
                <HeartPulse className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-[#172B3A]">
                  Welcome to HealthLens AI, {firstName}!
                </h2>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed max-w-xl">
                  Upload your first blood test or lab report to get personalized health analysis powered by AI.
                  We'll extract your biomarkers, calculate trends, and provide actionable insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Link
                    to="/upload"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Your First Medical Report
                  </Link>
                  <Link
                    to="/profile"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#172B3A] text-sm font-semibold rounded-xl border border-[#E2E8F0] transition-colors"
                  >
                    Complete Your Health Profile
                  </Link>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Upload PDF or image reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>AI-powered analysis & insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Top 4 Metric Cards — actual data only */}
        <DashboardMetricCards
          totalReports={data?.stats?.total_reports ?? 0}
          totalBiomarkers={data?.total_biomarkers ?? 0}
          totalInsights={data?.latest_insights?.length ?? 0}
          nextCheckupDate={data?.next_checkup?.date_str ?? null}
          nextCheckupDays={data?.next_checkup?.days_left ?? null}
        />

        {/* 3. Middle Section: Health Trend Overview + Health Score Breakdown + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Health Trend Overview Chart (approx 50% width) */}
          <div className="lg:col-span-6">
            <HealthTrendOverviewChart
              parameterTrends={data?.parameter_trends ?? []}
            />
          </div>

          {/* Health Score Breakdown (approx 25% width) */}
          <div className="lg:col-span-3">
            <HealthScoreBreakdownCard
              score={hasReports ? data.health_score : null}
              breakdown={hasReports ? data.health_score_breakdown : null}
            />
          </div>

          {/* Recent Activity (approx 25% width) */}
          <div className="lg:col-span-3">
            <RecentActivityCard
              activities={data?.recent_activity ?? []}
            />
          </div>

        </div>

        {/* 4. Key Biomarkers Section (4 cards in row) */}
        <KeyBiomarkersSection
          biomarkers={data?.key_biomarkers ?? []}
        />

        {/* 5. Bottom Section: Recent Reports + Ask AI Assistant + Health Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Recent Reports Table */}
          <div className="lg:col-span-5">
            <DashboardRecentReportsTable
              reports={data?.recent_reports_list ?? []}
            />
          </div>

          {/* Ask AI Assistant */}
          <div className="lg:col-span-4">
            <AskAiAssistantCard hasReports={hasReports} />
          </div>

          {/* Health Insights */}
          <div className="lg:col-span-3">
            <DashboardHealthInsightsCard
              insights={data?.latest_insights ?? []}
            />
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
