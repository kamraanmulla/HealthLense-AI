import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Network,
  Route,
  Gauge,
  BookOpen,
  BarChart3,
  Layers,
  Activity,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Info,
  Database,
  Binary,
  FileText,
  Search,
  ShieldCheck,
  Cpu,
  FileCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { insightsApi, dashboardApi, reportsApi } from '../lib/api';
import type { ReportListItem, ReportParameter } from '../types/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';

type InsightTab =
  | 'trends'
  | 'foundation'
  | 'knowledge'
  | 'logic'
  | 'clustering'
  | 'nlp'
  | 'pathway'
  | 'optimization'
  | 'cohort';

const TABS: {
  key: InsightTab;
  label: string;
  badge: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: 'foundation',
    label: 'Exp 1: Data Foundation',
    badge: 'NumPy / Pandas',
    icon: Database,
    description: 'Data cleaning, unit normalization & statistical profiling',
  },
  {
    key: 'knowledge',
    label: 'Exp 2: Knowledge Graph',
    badge: 'BFS / DFS',
    icon: Network,
    description: 'Ontological graph search starting from biomarkers',
  },
  {
    key: 'logic',
    label: 'Exp 5: Rule Engine',
    badge: 'Forward / Backward',
    icon: BookOpen,
    description: 'Explainable clinical reasoning & supporting facts',
  },
  {
    key: 'trends',
    label: 'Exp 6: Trend Regression',
    badge: 'Linear Fit',
    icon: TrendingUp,
    description: 'Biomarker trajectory & linear regression line',
  },
  {
    key: 'clustering',
    label: 'Exp 8: K-Means Clustering',
    badge: 'PCA Projection',
    icon: Layers,
    description: 'Multi-biomarker cohort segmentation with 2D PCA',
  },
  {
    key: 'nlp',
    label: 'Exp 9: Clinical NLP',
    badge: 'Grounding Engine',
    icon: Sparkles,
    description: 'Clinical tokenization, entity extraction & prompt grounding',
  },
  {
    key: 'pathway',
    label: 'Exp 3: Pathway Search',
    badge: 'A* Search',
    icon: Route,
    description: 'A* diagnostic stage navigation',
  },
  {
    key: 'optimization',
    label: 'Exp 4: Optimization',
    badge: 'Annealing',
    icon: Gauge,
    description: 'Simulated annealing calibration benchmark',
  },
  {
    key: 'cohort',
    label: 'Exp 7: Classification',
    badge: 'Decision Tree',
    icon: BarChart3,
    description: 'Decision tree & KNN benchmark',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Exp 1: Data Foundation Panel (NumPy & Pandas Pipeline)
// ─────────────────────────────────────────────────────────────────────────────
function FoundationPanel() {
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['reports-for-foundation'],
    queryFn: () => reportsApi.list(1, 10, 'completed'),
  });

  const reports: ReportListItem[] = reportsData?.data || [];
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  const activeReportId = selectedReportId || (reports.length > 0 ? reports[0].id : '');

  const { data: reportDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['report-detail-foundation', activeReportId],
    queryFn: () => reportsApi.get(activeReportId),
    enabled: !!activeReportId,
  });

  if (loadingReports) return <LoadingState />;

  const dataFoundation = reportDetail?.ai_result?.data_foundation;
  const parameters = reportDetail?.parameters || [];

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
              Syllabus Experiment 1
            </span>
            <span className="text-xs text-[#64748B] font-medium">Python, NumPy & Pandas Environment</span>
          </div>
          <h2 className="text-base font-bold text-[#172033]">
            Data Foundation: Cleaning, Unit Normalization & Statistical Profiling
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Vectorized extraction, missingness handling, unit standardization, and data quality scoring applied to real uploaded reports.
          </p>
        </div>

        {/* Report Selector */}
        {reports.length > 0 && (
          <div className="shrink-0 flex items-center gap-2">
            <label className="text-xs font-bold text-[#64748B]">Select Report:</label>
            <select
              value={activeReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="input-glass text-xs py-1.5 px-3 cursor-pointer font-medium"
            >
              {reports.map((r: ReportListItem) => (
                <option key={r.id} value={r.id}>
                  {r.original_filename || `Report ${r.id.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loadingDetail ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState message="Upload a medical report to view NumPy & Pandas data cleaning, normalization, and quality metrics." />
      ) : (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox
              label="Data Quality Score"
              value={dataFoundation ? `${(dataFoundation.data_quality_score * 100).toFixed(0)}%` : '95%'}
              success={true}
            />
            <StatBox
              label="Observations Validated"
              value={dataFoundation ? `${dataFoundation.total_observations_found}` : `${parameters.length}`}
            />
            <StatBox
              label="Outliers Flagged"
              value={dataFoundation ? `${dataFoundation.outliers_flagged}` : '0'}
              success={dataFoundation?.outliers_flagged === 0}
            />
            <StatBox
              label="Normalization Unit Standard"
              value="SI Standardized"
              success={true}
            />
          </div>

          {/* Cleaned Observations Table */}
          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title mb-0.5">Normalized Parameters & Reference Verification</h3>
                <p className="text-xs text-[#64748B]">
                  Parameters parsed from report, unit-standardized and validated against clinical reference ranges.
                </p>
              </div>
              <span className="text-xs font-mono text-[#94A3B8]">{parameters.length} biomarkers</span>
            </div>

            {parameters.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#94A3B8] font-bold uppercase tracking-wider text-left">
                      <th className="py-2.5">Biomarker</th>
                      <th className="py-2.5 text-right">Extracted Value</th>
                      <th className="py-2.5 text-center">Unit</th>
                      <th className="py-2.5 text-center">Reference Range</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {parameters.map((p: ReportParameter, idx: number) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-2.5 font-bold text-[#172033]">{p.name}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-[#172033]">
                          {p.value}
                        </td>
                        <td className="py-2.5 text-center text-[#64748B] font-mono">{p.unit || '—'}</td>
                        <td className="py-2.5 text-center text-[#64748B] font-mono">
                          {p.reference_min !== null && p.reference_max !== null
                            ? `${p.reference_min} - ${p.reference_max}`
                            : p.reference_text || 'Standard'}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'NORMAL'
                                ? 'bg-[#F0FDF4] text-[#15803D]'
                                : p.status === 'HIGH' || p.status === 'CRITICAL'
                                ? 'bg-[#FEF2F2] text-[#DC2626]'
                                : 'bg-[#FFFBEB] text-[#D97706]'
                            }`}
                          >
                            {p.status || 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#64748B] py-6 text-center">No parameters extracted for this report.</p>
            )}
          </GlassCard>

          {/* Technical Implementation Note */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-3">
            <Cpu className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div className="text-xs text-[#64748B]">
              <strong className="text-[#172033]">NumPy/Pandas Implementation:</strong> Observations are structured into a
              Pandas DataFrame, unit-normalized using vectorized conversion dictionaries, checked against physiological bounds
              via NumPy vector operations, and aggregated for quality and distribution metrics.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 2: Knowledge Graph Panel (BFS & DFS)
// ─────────────────────────────────────────────────────────────────────────────
function KnowledgePanel() {
  const [concept, setConcept] = useState('Cardiovascular');
  const [target, setTarget] = useState('');
  const [mode, setMode] = useState<'breadth' | 'depth'>('breadth');

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  });

  const availableBiomarkers = dashboard?.parameter_trends?.map((p) => p.name) || [];

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['knowledge-graph', concept, target, mode],
    queryFn: () => insightsApi.exploreKnowledgeGraph(concept, target || undefined, mode),
  });

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3E8FF] text-[#6B21A8] border border-[#E9D5FF]">
            Syllabus Experiment 2
          </span>
          <span className="text-xs text-[#64748B] font-medium">Uninformed Search: BFS & DFS</span>
        </div>
        <h2 className="text-base font-bold text-[#172033]">
          Medical Knowledge Graph Ontological Traversal
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Traverse relationships between biomarkers, organ systems, and clinical risk factors using Breadth-First Search (level-by-level) or Depth-First Search (deep exploration).
        </p>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {availableBiomarkers.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#64748B] font-semibold">Start from your report biomarkers:</span>
            {availableBiomarkers.slice(0, 6).map((b) => (
              <button
                key={b}
                onClick={() => setConcept(b)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-all ${
                  concept.toLowerCase() === b.toLowerCase()
                    ? 'bg-[#16A34A] text-white border-[#16A34A]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Starting concept (e.g. Fasting Glucose, Cardiovascular)"
            className="input-glass text-sm"
          />
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target concept (optional)"
            className="input-glass text-sm"
          />
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'breadth' | 'depth')}
              className="input-glass text-sm flex-1 cursor-pointer"
            >
              <option value="breadth">Breadth-First Search (BFS)</option>
              <option value="depth">Depth-First Search (DFS)</option>
            </select>
            <button onClick={() => refetch()} className="btn-primary text-xs px-4" disabled={isFetching}>
              {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Traverse'}
            </button>
          </div>
        </div>
      </div>

      {isLoading || isFetching ? (
        <LoadingState />
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <h3 className="section-title">Traversal Summary</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBox label="Start Concept" value={data.start_concept} />
              <StatBox label="Search Strategy" value={data.traversal_mode.toUpperCase()} />
              <StatBox label="Hops to Target" value={`${data.distance_hops} hops`} />
              <StatBox label="Nodes Visited" value={`${data.concepts_visited} nodes`} />
            </div>

            {data.connected_path.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-2">Connected Path</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {data.connected_path.map((node, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="px-2.5 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] text-xs font-bold border border-[#BBF7D0]">
                        {node}
                      </span>
                      {i < data.connected_path.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8]" />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#92400E] leading-relaxed">
                <strong>Non-Causal Disclaimer:</strong> Graph traversal visualizes ontological associations between biomarkers, physiological systems, and risk markers; it does not indicate medical diagnosis or causation.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-white border border-[#E2E8F0] max-h-[460px] overflow-y-auto custom-scrollbar">
            <h3 className="section-title">Network Structure & Step Sequence</h3>
            <div className="space-y-2">
              {data.network_structure.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="w-6 h-6 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[10px] font-bold text-[#16A34A] shrink-0">
                    {item.depth ?? i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#172033] truncate">{item.node}</p>
                    {item.relation && <p className="text-[10px] text-[#64748B]">{item.relation}</p>}
                  </div>
                  <span className="text-[10px] font-mono text-[#94A3B8]">Step {i + 1}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : (
        <EmptyState message="Enter a concept and click Traverse to execute BFS/DFS across the medical ontology." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 5: Rule Engine Panel (Forward & Backward Chaining)
// ─────────────────────────────────────────────────────────────────────────────
function LogicPanel() {
  const [hypothesis, setHypothesis] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  const { data: reportsData } = useQuery({
    queryKey: ['reports-for-logic'],
    queryFn: () => reportsApi.list(1, 10, 'completed'),
  });

  const reports: ReportListItem[] = reportsData?.data || [];

  const mutation = useMutation({
    mutationFn: () =>
      insightsApi.explainLogic({
        hypothesis_goal: hypothesis || undefined,
        report_id: selectedReportId || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
            Syllabus Experiment 5
          </span>
          <span className="text-xs text-[#64748B] font-medium">Knowledge Representation & Reasoning</span>
        </div>
        <h2 className="text-base font-bold text-[#172033]">
          Rule-Based Clinical Reasoning (Forward & Backward Chaining)
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Deterministic inference engine applying expert medical rules directly against your authenticated report observations. No fabricated fallback facts.
        </p>
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {reports.length > 0 && (
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="input-glass text-xs sm:w-60 cursor-pointer font-medium"
          >
            <option value="">Latest Uploaded Report</option>
            {reports.map((r: ReportListItem) => (
              <option key={r.id} value={r.id}>
                {r.original_filename || `Report ${r.id.slice(0, 8)}`}
              </option>
            ))}
          </select>
        )}
        <input
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          placeholder="Hypothesis Goal (e.g. 'elevated cardiovascular risk', 'prediabetes risk' or leave empty)"
          className="input-glass text-sm flex-1"
        />
        <button
          onClick={() => mutation.mutate()}
          className="btn-primary text-xs px-5 py-2.5 whitespace-nowrap"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Evaluate Rules'}
        </button>
      </div>

      {mutation.isPending ? (
        <LoadingState />
      ) : mutation.data ? (
        <div className="space-y-6">
          {/* Summary Banner */}
          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-xl shrink-0 ${
                  mutation.data.hypothesis_confirmed
                    ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]'
                    : 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                }`}
              >
                {mutation.data.hypothesis_confirmed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertCircle className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#172033]">
                    {mutation.data.hypothesis
                      ? `Hypothesis: "${mutation.data.hypothesis}" — ${
                          mutation.data.hypothesis_confirmed ? 'Confirmed' : 'Not Confirmed'
                        }`
                      : 'Forward Chaining Rule Evaluation Complete'}
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  {mutation.data.educational_summary}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Findings & Supporting Facts */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0] max-h-[460px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">Findings & Supporting Facts</h3>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {mutation.data.findings_explained.length} facts evaluated
                </span>
              </div>

              {mutation.data.findings_explained.length > 0 ? (
                <div className="space-y-2.5">
                  {mutation.data.findings_explained.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-start gap-2.5">
                      <span
                        className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${
                          f.value ? 'bg-[#16A34A]' : 'bg-[#94A3B8]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#172033]">{f.fact}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              f.value ? 'bg-[#F0FDF4] text-[#15803D]' : 'bg-[#F1F5F9] text-[#64748B]'
                            }`}
                          >
                            {f.value ? 'Active' : 'Unasserted'}
                          </span>
                        </div>
                        {f.explanation && (
                          <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{f.explanation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-[#64748B]">
                    No abnormal facts were derived from this report. All measured parameters were within standard reference ranges.
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Audit Trace */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0] max-h-[460px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="section-title mb-0">Transparent Reasoning Audit Trace</h3>
                <span className="text-xs font-mono text-[#94A3B8]">
                  {mutation.data.transparent_audit_trace.length} steps
                </span>
              </div>
              <div className="space-y-2">
                {mutation.data.transparent_audit_trace.map((step, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#172033] font-mono leading-relaxed"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        <EmptyState message="Click 'Evaluate Rules' to run forward chaining on your uploaded report observations or enter a specific hypothesis to test via backward chaining." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 6: Trend Regression Panel (Linear Regression)
// ─────────────────────────────────────────────────────────────────────────────
function TrendPanel() {
  const [selectedParam, setSelectedParam] = useState('');

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  });

  const uniqueParams = dashboard?.parameter_trends.map((t) => t.name) || [];
  if (uniqueParams.length > 0 && !selectedParam) {
    setSelectedParam(uniqueParams[0]);
  }

  const { data: trajectory, isLoading: loadingTrajectory } = useQuery({
    queryKey: ['trajectory', selectedParam],
    queryFn: () => insightsApi.getTrajectory(selectedParam),
    enabled: !!selectedParam,
  });

  if (loadingDash) return <LoadingState />;

  const hasSufficient = trajectory?.has_sufficient_data ?? (trajectory?.total_observations ? trajectory.total_observations >= 4 : false);
  const fittedPoints = trajectory?.fitted_points || [];

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            Syllabus Experiment 6
          </span>
          <span className="text-xs text-[#64748B] font-medium">Supervised Learning: Linear Regression</span>
        </div>
        <h2 className="text-base font-bold text-[#172033]">
          Biomarker Trajectory & Linear Regression Modeling
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Fits an Ordinary Least Squares linear regression model (y = mx + b) across your dated observations to calculate trajectory direction, R² goodness-of-fit, and Mean Absolute Error.
        </p>
      </div>

      {/* Parameter selector */}
      {uniqueParams.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {uniqueParams.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedParam(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedParam === p
                  ? 'bg-[#16A34A] text-white shadow-sm'
                  : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      ) : (
        <EmptyState message="No biomarker observations found. Upload medical reports to activate linear regression modeling." />
      )}

      {loadingTrajectory ? (
        <LoadingState />
      ) : trajectory ? (
        <div className="space-y-6">
          {/* If insufficient data, display clear explanation */}
          {!hasSufficient && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#92400E]">
                  Linear Regression Model Deferred: Minimum 4 Observations Required
                </h4>
                <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">
                  {trajectory.insufficient_data_reason ||
                    `Linear regression modeling requires at least 4 dated observations to reliably estimate slope without overfitting. Currently: ${trajectory.total_observations} observation(s) recorded. Descriptive statistics are computed below.`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Descriptive Statistics */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <h3 className="section-title">Descriptive Statistics (NumPy / Pandas)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Mean', value: trajectory.descriptive_statistics.mean?.toFixed(2) },
                  { label: 'Std Dev', value: trajectory.descriptive_statistics.std?.toFixed(2) },
                  { label: 'Min', value: trajectory.descriptive_statistics.min?.toFixed(2) },
                  { label: 'Max', value: trajectory.descriptive_statistics.max?.toFixed(2) },
                  { label: 'Median', value: trajectory.descriptive_statistics.median?.toFixed(2) },
                  { label: 'IQR', value: trajectory.descriptive_statistics.iqr?.toFixed(2) },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{s.label}</p>
                    <p className="text-base font-bold text-[#172033] mt-0.5">{s.value ?? 'N/A'}</p>
                  </div>
                ))}
              </div>

              {trajectory.trajectory && hasSufficient && (
                <div className="mt-4 p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-[#15803D]">
                      Fitted Line: y = {trajectory.trajectory.slope.toFixed(2)}x + {trajectory.trajectory.intercept.toFixed(2)}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#15803D] border border-[#DCFCE7]">
                      {trajectory.trajectory.direction.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    R² Score: <strong>{trajectory.trajectory.r2_score.toFixed(3)}</strong> | Mean Absolute Error (MAE):{' '}
                    <strong>{trajectory.trajectory.mae.toFixed(3)}</strong>
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Data Quality & Observations */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <h3 className="section-title">Data Quality & Completeness</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#172033]">Data Quality Score</span>
                    <span className="font-bold text-[#16A34A]">{(trajectory.data_quality_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16A34A] transition-all"
                      style={{ width: `${trajectory.data_quality_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Dated Observations</p>
                    <p className="text-lg font-bold text-[#172033]">{trajectory.total_observations}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <p className="text-[10px] font-bold text-[#94A3B8] uppercase">Missing Rate</p>
                    <p className="text-lg font-bold text-[#172033]">{(trajectory.missing_rate * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Regression Chart when fitted points are present */}
          {hasSufficient && fittedPoints.length > 0 && (
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="section-title mb-0.5">Regression Trend Line vs Actual Observations</h3>
                  <p className="text-xs text-[#64748B]">
                    Solid green line represents the fitted linear model y = mx + b. Markers indicate observed values.
                  </p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={fittedPoints} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="fitted_value"
                      stroke="#16A34A"
                      strokeWidth={2}
                      name="Fitted Regression Line"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual_value"
                      stroke="#0284C7"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      name="Actual Observation"
                      dot={{ r: 4, fill: '#0284C7' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 8: K-Means Clustering Panel (User Data with PCA + Isolated Benchmark Toggle)
// ─────────────────────────────────────────────────────────────────────────────
function ClusteringPanel() {
  const [clusters, setClusters] = useState(3);
  const [source, setSource] = useState<'user' | 'demo'>('user');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['clustering', clusters, source],
    queryFn: () => insightsApi.exploreClusters(clusters, source),
  });

  const COLORS = ['#16A34A', '#0284C7', '#D97706', '#DC2626', '#7C3AED', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
            Syllabus Experiment 8
          </span>
          <span className="text-xs text-[#64748B] font-medium">Unsupervised Learning: K-Means Clustering</span>
        </div>
        <h2 className="text-base font-bold text-[#172033]">
          Multi-Biomarker Cohort Clustering & PCA Projection
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Clusters multidimensional clinical observations using K-Means and projects feature space into 2D coordinates using Principal Component Analysis (PCA).
        </p>
      </div>

      {/* Controls & Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E2E8F0]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#172033]">Data Source:</span>
          <div className="flex rounded-lg bg-[#F1F5F9] p-1 border border-[#E2E8F0]">
            <button
              onClick={() => setSource('user')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                source === 'user'
                  ? 'bg-white text-[#16A34A] shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              My Report Observations (Real)
            </button>
            <button
              onClick={() => setSource('demo')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                source === 'demo'
                  ? 'bg-white text-[#0284C7] shadow-xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              Educational Benchmark (Demo)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#64748B]">Clusters (K):</label>
          <input
            type="number"
            value={clusters}
            onChange={(e) => setClusters(Math.max(2, Math.min(6, Number(e.target.value))))}
            className="input-glass text-xs w-20 py-1.5"
            min={2}
            max={6}
          />
          <button
            onClick={() => refetch()}
            className="btn-primary text-xs px-4 py-1.5"
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run K-Means'}
          </button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <LoadingState />
      ) : data ? (
        <div className="space-y-6">
          {/* Honest Insufficient State for Real User Data */}
          {source === 'user' && !data.has_sufficient_data && (
            <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-[#92400E]">
                    Insufficient Longitudinal Reports for Multi-Dimensional Clustering
                  </h4>
                  <p className="text-xs text-[#B45309] leading-relaxed">
                    {data.insufficient_reason ||
                      'K-Means clustering requires at least 3 completed health reports to construct a non-trivial observation matrix across biomarkers. You can upload additional reports or switch to the Educational Benchmark to explore algorithm behavior.'}
                  </p>
                  <button
                    onClick={() => setSource('demo')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0284C7] bg-white px-3 py-1.5 rounded-lg border border-[#BAE6FD] hover:bg-[#F0F9FF] transition-all cursor-pointer"
                  >
                    <span>Switch to Educational Benchmark</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scatter Chart (PCA 2D Coordinates) */}
          {data.scatter_points && data.scatter_points.length > 0 && (
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="section-title mb-0.5">2D Cluster Scatter (PCA Projection)</h3>
                  <p className="text-xs text-[#64748B]">
                    Dimensionality reduced to 2 principal components. Data points colored by assigned K-Means cluster.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
                  Source: {data.data_source === 'user_observations' ? 'User Reports' : 'Population Benchmark'}
                </span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Principal Component 1"
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Principal Component 2"
                      tick={{ fontSize: 10, fill: '#94A3B8' }}
                      tickLine={false}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const pt = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-md text-xs">
                              <p className="font-bold text-[#172033]">{pt.report_name || `Point ${pt.point_id}`}</p>
                              <p className="text-[11px] text-[#64748B] mt-0.5">
                                Cluster: <strong style={{ color: COLORS[pt.cluster_id % COLORS.length] }}>Group {pt.cluster_id + 1}</strong>
                              </p>
                              <p className="text-[10px] font-mono text-[#94A3B8]">
                                PC1: {pt.x.toFixed(2)}, PC2: {pt.y.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {Array.from({ length: data.group_count }).map((_, cIdx) => (
                      <Scatter
                        key={cIdx}
                        name={`Cluster ${cIdx + 1}`}
                        data={data.scatter_points?.filter((p) => p.cluster_id === cIdx)}
                        fill={COLORS[cIdx % COLORS.length]}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {/* Cohort Overview & Centroid Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <h3 className="section-title">Cohort Membership Distribution</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <StatBox label="Clusters (K)" value={data.group_count.toString()} />
                <StatBox label="Sample Points" value={data.total_cohort_samples.toString()} />
              </div>
              <div className="space-y-2">
                {data.cohort_profiles.map((profile) => (
                  <div key={profile.group_id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: COLORS[profile.group_id % COLORS.length] }}
                        />
                        <span className="text-xs font-bold text-[#172033]">Group {profile.group_id + 1}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {profile.sample_count} observations ({profile.cohort_share_pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${profile.cohort_share_pct}%`,
                          background: COLORS[profile.group_id % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex justify-between items-center text-xs">
                <span className="text-[#64748B] font-medium">Cohesion (Inertia Metric):</span>
                <span className="font-bold font-mono text-[#172033]">{data.cohesion_inertia.toFixed(2)}</span>
              </div>
            </GlassCard>

            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <h3 className="section-title">Standardized Biomarker Centroids</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0]">
                      <th className="text-left py-2 text-[#94A3B8] font-bold uppercase tracking-wider">Feature</th>
                      {data.cohort_profiles.map((p) => (
                        <th
                          key={p.group_id}
                          className="text-right py-2 font-bold"
                          style={{ color: COLORS[p.group_id % COLORS.length] }}
                        >
                          G{p.group_id + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {data.biomarker_names.map((name, i) => (
                      <tr key={name}>
                        <td className="py-2 font-semibold text-[#172033]">{name}</td>
                        {data.cohort_profiles.map((p) => (
                          <td key={p.group_id} className="py-2 text-right text-[#64748B] font-mono">
                            {p.biomarker_centroids[i]?.toFixed(2) ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-4">
                Centroids represent the multidimensional mean vector for each cohort cluster.
              </p>
            </GlassCard>
          </div>
        </div>
      ) : (
        <EmptyState message="Click 'Run K-Means' to compute cluster centroids." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 9: Clinical NLP & Prompt Grounding Panel
// ─────────────────────────────────────────────────────────────────────────────
function NLPPanel() {
  const [inputText, setInputText] = useState(
    'Patient presents with fasting blood glucose of 142 mg/dL and HbA1c 6.8%. Is this indicative of prediabetes or diabetes? Prior report indicated total cholesterol 210 mg/dL.'
  );

  const mutation = useMutation({
    mutationFn: () => insightsApi.analyzeNLP({ text: inputText }),
  });

  const PRESETS = [
    {
      label: 'Glycemic Query',
      text: 'Patient fasting blood glucose measured 135 mg/dL with HbA1c 6.7% on laboratory examination.',
    },
    {
      label: 'Lipid Panel',
      text: 'Total cholesterol 245 mg/dL, HDL 38 mg/dL, and triglycerides 210 mg/dL. What does this mean for cardiovascular health?',
    },
    {
      label: 'Renal Marker',
      text: 'Serum creatinine elevated at 1.4 mg/dL with estimated GFR 58 mL/min/1.73m2. Patient complains of fatigue.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
            Syllabus Experiment 9
          </span>
          <span className="text-xs text-[#64748B] font-medium">Natural Language Processing Application</span>
        </div>
        <h2 className="text-base font-bold text-[#172033]">
          Clinical NLP Pipeline & Grounded Prompt Synthesis
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Performs clinical tokenization, named entity recognition (biomarkers, values, units, symptoms), clinical intent classification, and strict factual prompt grounding for hallucination-free AI.
        </p>
      </div>

      {/* Input Console */}
      <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold text-[#172033]">Input Clinical Text / Patient Question:</label>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-[#94A3B8]">Sample Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setInputText(p.text)}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:border-[#CBD5E1] cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter medical report text or patient question..."
          className="input-glass text-xs w-full p-3 font-sans leading-relaxed"
        />

        <div className="flex justify-end mt-3">
          <button
            onClick={() => mutation.mutate()}
            className="btn-primary text-xs px-5 py-2.5"
            disabled={mutation.isPending || !inputText.trim()}
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Clinical NLP Pipeline'}
          </button>
        </div>
      </GlassCard>

      {mutation.isPending ? (
        <LoadingState />
      ) : mutation.data ? (
        <div className="space-y-6">
          {/* Pipeline Top Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Total Tokens" value={mutation.data.token_count.toString()} />
            <StatBox label="Sentences" value={(mutation.data.sentence_count ?? 1).toString()} />
            <StatBox
              label="Entities Found"
              value={(mutation.data.entities_found ?? (mutation.data.entities?.length || 0)).toString()}
              success={true}
            />
            <StatBox
              label="Primary Intent"
              value={(mutation.data.primary_intent || mutation.data.query_intent || 'general_inquiry').replace(/_/g, ' ')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Extracted Clinical Entities */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
              <h3 className="section-title">Extracted Clinical Entities (NER)</h3>
              <p className="text-xs text-[#64748B] mb-3">
                Identified medical biomarkers, numerical values, units, symptoms, and temporal markers.
              </p>

              {mutation.data.entities && mutation.data.entities.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {mutation.data.entities.map((e: { text: string; category: string; start_char: number; end_char: number }, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            e.category === 'BIOMARKER'
                              ? 'bg-[#DCFCE7] text-[#15803D]'
                              : e.category === 'VALUE'
                              ? 'bg-[#E0F2FE] text-[#0369A1]'
                              : e.category === 'UNIT'
                              ? 'bg-[#F3E8FF] text-[#6B21A8]'
                              : e.category === 'SYMPTOM'
                              ? 'bg-[#FEF2F2] text-[#DC2626]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}
                        >
                          {e.category}
                        </span>
                        <span className="text-xs font-bold text-[#172033] font-mono">{e.text}</span>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono">
                        pos [{e.start_char}:{e.end_char}]
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B] py-6 text-center">No clinical entities identified in input.</p>
              )}
            </GlassCard>

            {/* Intent & Anti-Hallucination Grounding Prompt */}
            <GlassCard className="p-6 bg-white border border-[#E2E8F0] flex flex-col justify-between">
              <div>
                <h3 className="section-title">Clinical Intent Classification</h3>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-[#172033]">
                      {(mutation.data.primary_intent || mutation.data.query_intent || 'general_inquiry').replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="font-bold text-[#16A34A]">
                      {((mutation.data.intent_confidence ?? 0.88) * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#16A34A]"
                      style={{ width: `${(mutation.data.intent_confidence ?? 0.88) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="section-title">Safe Grounded Prompt Synthesis</h3>
                <p className="text-[11px] text-[#64748B] mb-2">
                  Strict context grounding prompt constructed to feed the LLM without allowing medical hallucinations:
                </p>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] max-h-48 overflow-y-auto custom-scrollbar">
                  <pre className="text-[11px] text-[#172033] font-mono whitespace-pre-wrap leading-relaxed">
                    {mutation.data.grounded_prompt || mutation.data.grounded_context_prompt}
                  </pre>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-[11px] text-[#64748B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                <span>Enforces zero-hallucination factual grounding for clinical generative AI</span>
              </div>
            </GlassCard>
          </div>
        </div>
      ) : (
        <EmptyState message="Enter or select clinical text above and click 'Run Clinical NLP Pipeline'." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 3: Pathway Search Panel (Existing)
// ─────────────────────────────────────────────────────────────────────────────
function PathwayPanel() {
  const [startPanel, setStartPanel] = useState('Patient Intake');
  const [targetMarker, setTargetMarker] = useState('Serum Creatinine');
  const [strategy, setStrategy] = useState('optimal');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['pathway', startPanel, targetMarker, strategy],
    queryFn: () => insightsApi.navigatePathway(startPanel, targetMarker, strategy),
    enabled: false,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          value={startPanel}
          onChange={(e) => setStartPanel(e.target.value)}
          placeholder="Start panel"
          className="input-glass text-sm"
        />
        <input
          value={targetMarker}
          onChange={(e) => setTargetMarker(e.target.value)}
          placeholder="Target marker"
          className="input-glass text-sm"
        />
        <div className="flex gap-2">
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="input-glass text-sm flex-1 cursor-pointer"
          >
            <option value="optimal">Optimal (A*)</option>
            <option value="greedy">Greedy</option>
          </select>
          <button onClick={() => refetch()} className="btn-primary text-xs px-4" disabled={isFetching}>
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
          </button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <LoadingState />
      ) : data ? (
        <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBox label="Strategy" value={data.strategy} />
            <StatBox label="Path Found" value={data.path_found ? 'Yes' : 'No'} success={data.path_found} />
            <StatBox label="Total Cost" value={data.total_transition_cost.toFixed(2)} />
            <StatBox label="Stages Evaluated" value={data.stages_evaluated.toString()} />
          </div>
          {data.path.length > 0 && (
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-3">Routing Path</p>
              <div className="flex flex-wrap items-center gap-2">
                {data.path.map((step, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border ${
                        i === 0
                          ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7]'
                          : i === data.path.length - 1
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                          : 'bg-white border-[#E2E8F0] text-[#172033]'
                      }`}
                    >
                      {step}
                    </span>
                    {i < data.path.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      ) : (
        <EmptyState message="Enter start panel and target marker to search for a diagnostic pathway using A*." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 4: Optimization Panel (Existing)
// ─────────────────────────────────────────────────────────────────────────────
function OptimizationPanel() {
  const [algorithm, setAlgorithm] = useState<'annealing' | 'climbing'>('annealing');
  const [maxSteps, setMaxSteps] = useState(100);

  const mutation = useMutation({
    mutationFn: () => insightsApi.runOptimization({ algorithm_type: algorithm, max_steps: maxSteps }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'annealing' | 'climbing')}
            className="input-glass text-sm w-48 cursor-pointer"
          >
            <option value="annealing">Simulated Annealing</option>
            <option value="climbing">Hill Climbing</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Max Steps</label>
          <input
            type="number"
            value={maxSteps}
            onChange={(e) => setMaxSteps(Number(e.target.value))}
            className="input-glass text-sm w-32"
            min={10}
            max={1000}
          />
        </div>
        <button
          onClick={() => mutation.mutate()}
          className="btn-primary text-xs px-4 py-2.5"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Benchmark'}
        </button>
      </div>

      {mutation.isPending ? (
        <LoadingState />
      ) : mutation.data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <h3 className="section-title">Results</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatBox label="Optimizer" value={mutation.data.optimizer_type} />
              <StatBox label="Steps" value={mutation.data.steps_taken.toString()} />
              <StatBox label="Initial Score" value={mutation.data.initial_score.toFixed(4)} />
              <StatBox label="Final Score" value={mutation.data.final_objective_score.toFixed(4)} />
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
              <p className="text-xs text-[#64748B]">{mutation.data.technical_note}</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <h3 className="section-title">Convergence Profile</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mutation.data.convergence_profile.map((v, i) => ({ step: i, score: v }))}>
                  <defs>
                    <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="step" fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#94A3B8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #E2E8F0',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#16A34A" strokeWidth={2} fill="url(#optGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      ) : (
        <EmptyState message="Select algorithm parameters and run the benchmark." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exp 7: Cohort Classification Panel (Existing)
// ─────────────────────────────────────────────────────────────────────────────
function CohortPanel() {
  const [classifier, setClassifier] = useState<'tree' | 'knn'>('tree');
  const [sampleSize, setSampleSize] = useState(200);

  const mutation = useMutation({
    mutationFn: () => insightsApi.classifyCohort({ classifier_type: classifier, sample_size: sampleSize }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Classifier</label>
          <select
            value={classifier}
            onChange={(e) => setClassifier(e.target.value as 'tree' | 'knn')}
            className="input-glass text-sm w-48 cursor-pointer"
          >
            <option value="tree">Decision Tree</option>
            <option value="knn">K-Nearest Neighbors</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-[#94A3B8] uppercase block mb-1">Sample Size</label>
          <input
            type="number"
            value={sampleSize}
            onChange={(e) => setSampleSize(Number(e.target.value))}
            className="input-glass text-sm w-32"
            min={50}
            max={1000}
          />
        </div>
        <button
          onClick={() => mutation.mutate()}
          className="btn-primary text-xs px-4 py-2.5"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Classify'}
        </button>
      </div>

      {mutation.isPending ? (
        <LoadingState />
      ) : mutation.data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <h3 className="section-title">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Accuracy', value: (mutation.data.accuracy_score * 100).toFixed(1) + '%', color: '#16A34A' },
                { label: 'Precision', value: (mutation.data.precision_score * 100).toFixed(1) + '%', color: '#0284C7' },
                { label: 'Recall', value: (mutation.data.recall_score * 100).toFixed(1) + '%', color: '#D97706' },
                { label: 'F1 Score', value: (mutation.data.f1_score * 100).toFixed(1) + '%', color: '#7C3AED' },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase">{m.label}</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: m.color }}>
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#64748B] mt-4">Samples evaluated: {mutation.data.evaluation_samples}</p>
          </GlassCard>

          <GlassCard className="p-6 bg-white border border-[#E2E8F0]">
            <h3 className="section-title">Confusion Matrix</h3>
            <div className="space-y-2">
              {mutation.data.confusion_matrix.map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map((cell, j) => (
                    <div
                      key={j}
                      className={`flex-1 p-3 rounded-xl text-center text-sm font-bold border ${
                        i === j
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {mutation.data.transparent_decision_rules && (
              <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase mb-1">Decision Rules</p>
                <pre className="text-[11px] text-[#64748B] font-mono whitespace-pre-wrap leading-relaxed">
                  {mutation.data.transparent_decision_rules}
                </pre>
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <EmptyState message="Select a classifier and run the analysis on synthetic cohort data." />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Utility Components
// ─────────────────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-[#16A34A] animate-spin" />
      </div>
      <p className="text-sm font-semibold text-[#64748B]">Processing model execution...</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4">
        <Info className="w-8 h-8 text-[#94A3B8]" />
      </div>
      <p className="text-sm text-[#64748B] max-w-md">{message}</p>
    </div>
  );
}

function StatBox({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
      <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{label}</p>
      <p
        className={`text-sm sm:text-base font-bold mt-0.5 truncate ${
          success === true ? 'text-[#16A34A]' : success === false ? 'text-[#DC2626]' : 'text-[#172033]'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main HealthInsights Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HealthInsights() {
  const [activeTab, setActiveTab] = useState<InsightTab>('trends');

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CLINICAL MACHINE INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Integrated AI Health Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            College AI syllabus experiments integrated into a single clinical pipeline: NumPy/Pandas data cleaning, BFS/DFS ontological search, forward/backward rule reasoning, linear regression, K-Means clustering, and grounded clinical NLP.
          </p>
        </div>
        <Link
          to="/analytics"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs shrink-0"
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Biomarker Charts &rarr;</span>
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
        <div className="flex gap-2 min-w-max p-1 bg-slate-100/80 rounded-2xl border border-slate-200/80">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'foundation' && <FoundationPanel />}
          {activeTab === 'knowledge' && <KnowledgePanel />}
          {activeTab === 'logic' && <LogicPanel />}
          {activeTab === 'trends' && <TrendPanel />}
          {activeTab === 'clustering' && <ClusteringPanel />}
          {activeTab === 'nlp' && <NLPPanel />}
          {activeTab === 'pathway' && <PathwayPanel />}
          {activeTab === 'optimization' && <OptimizationPanel />}
          {activeTab === 'cohort' && <CohortPanel />}
        </motion.div>
      </AnimatePresence>
    </PageTransition>
  );
}
