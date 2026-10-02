import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../lib/api';
import { invalidateHealthQueries } from '../lib/queryClient';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import HealthGauge from '../components/ui/HealthGauge';
import RiskBadge from '../components/ui/RiskBadge';
import StatusBadge from '../components/ui/StatusBadge';
import ReportHeader from '../components/reports/ReportHeader';
import AiAnalysisSummary from '../components/reports/AiAnalysisSummary';
import DetectedConditions from '../components/reports/DetectedConditions';
import AIHealthSummaryComponent from '../components/ai/AIHealthSummary';
import ReportChatAssistant from '../components/ai/ReportChatAssistant';
import ClinicalParameterGrid from '../components/reports/ClinicalParameterGrid';
import HealthPatternInsights from '../components/reports/HealthPatternInsights';
import ReportAiExperiments from '../components/reports/ReportAiExperiments';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, HeartPulse, FileText, CheckCircle2 } from 'lucide-react';

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    const mainEl = document.querySelector('main') || document.getElementById('main-content');
    if (mainEl) mainEl.scrollTop = 0;
  }, [id]);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => reportsApi.get(id!),
    enabled: !!id,
  });

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this report?')) return;
    try {
      await reportsApi.delete(id);
      await invalidateHealthQueries();
      navigate('/reports');
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      const blob = await reportsApi.exportPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HealthLens_${report?.original_filename || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-16 skeleton rounded-2xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-1 h-[320px] skeleton rounded-2xl" />
          <div className="col-span-1 lg:col-span-2 h-[320px] skeleton rounded-2xl" />
        </div>
        <div className="h-[400px] skeleton rounded-2xl" />
      </div>
    );
  }

  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center mb-3">
        <Activity className="w-6 h-6 text-[#94A3B8]" />
      </div>
      <h2 className="text-lg font-bold text-[#172033]">Report not found</h2>
      <button onClick={() => navigate('/reports')} className="mt-3 btn-primary text-xs">
        Return to Reports
      </button>
    </div>
  );

  return (
    <PageTransition>
      {/* 1. Report Information Header */}
      <ReportHeader
        reportId={report.id}
        filename={report.original_filename}
        createdAt={report.created_at}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      {/* 2. Overall Health Status, Health Score & Risk Level */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Score Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full">
          <div className="card-futuristic h-full p-6 flex flex-col justify-between shadow-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-[10px] font-semibold mb-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span>CALIBRATED INDEX</span>
              </div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">
                  Health Index
                </h2>
                {report.health_grade && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                    Tier {report.health_grade}
                  </span>
                )}
              </div>
            </div>

            <div className="my-4 flex flex-col items-center justify-center">
              <HealthGauge score={report.health_score || 0} size={190} />
            </div>

            <div className="flex flex-col items-center gap-2 pt-3 border-t border-slate-100">
              <RiskBadge level={report.risk_level || 'UNKNOWN'} />
              {report.confidence_pct && (
                <span className="text-xs text-slate-400 font-medium">
                  Calibration Confidence: <strong className="text-slate-700 font-mono">{report.confidence_pct}%</strong>
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Health Summary & Key Findings */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2 h-full">
          <AiAnalysisSummary aiResult={report.ai_result} />
        </motion.div>
      </div>

      {/* 3. Health Parameters Grid */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <ClinicalParameterGrid
          parameters={report.parameters || []}
          explanations={report.ai_result?.score_explanation || null}
        />
      </motion.div>

      {/* 3b. ML Health Pattern Analysis */}
      {report.ai_result?.ml_anomaly_detection && report.ai_result.ml_anomaly_detection.anomaly_level !== 'unavailable' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.17 }} className="mt-8">
          <HealthPatternInsights mlResult={report.ai_result.ml_anomaly_detection} />
        </motion.div>
      )}

      {/* 3c. Integrated Report AI Experiments (Exp 1, 2, 5) */}
      {report.ai_result && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="mt-8">
          <ReportAiExperiments aiResult={report.ai_result} reportId={report.id} />
        </motion.div>
      )}

      {/* 4. Findings & Detected Conditions */}
      {report.ai_result?.detected_conditions && report.ai_result.detected_conditions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="mt-10">
          <DetectedConditions conditions={report.ai_result.detected_conditions} />
        </motion.div>
      )}

      {/* 5. Health Guidance & Lifestyle Recommendations */}
      {report.ai_result?.ai_health_summary && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }} className="mt-8">
          <AIHealthSummaryComponent summary={report.ai_result.ai_health_summary} />
        </motion.div>
      )}

      {/* 6. Ask About Your Report */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="mt-8">
        <ReportChatAssistant reportId={report.id} />
      </motion.div>
    </PageTransition>
  );
}
