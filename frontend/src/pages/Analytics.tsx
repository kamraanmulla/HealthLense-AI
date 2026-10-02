import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Dot } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, ChevronRight, Minus, BarChart3, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { dashboardApi, trendsApi } from '../lib/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Analytics() {
  const [selectedParam, setSelectedParam] = useState<string>('');

  const { data: dashboard, isLoading: loadingDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  });

  const uniqueParams = dashboard?.parameter_trends.map(t => t.name) || [];

  if (uniqueParams.length > 0 && !selectedParam) {
    setSelectedParam(uniqueParams[0]);
  }

  const { data: trendData, isLoading: loadingTrend } = useQuery({
    queryKey: ['trend', selectedParam],
    queryFn: () => trendsApi.get(selectedParam),
    enabled: !!selectedParam,
  });

  const chartData = trendData?.points?.map(pt => ({
    date: format(new Date(pt.date), 'MMM d, yyyy'),
    shortDate: format(new Date(pt.date), 'MMM d'),
    value: pt.value,
  })) || [];

  // ── Trend classification from backend ──────────────────────────────────────
  const trend = trendData?.trend || 'no_data';
  const isImproving = trend === 'improving';
  const isWorsening = trend === 'worsening' || trend === 'declining';
  const isSingleResult = trend === 'single_result';
  const isNoData = trend === 'no_data';
  const isStable = trend === 'stable';

  // ── Authoritative reference range from backend (NOT from data min/max) ─────
  const referenceRange = trendData?.reference_range || null;
  const refMin = trendData?.reference_min ?? null;
  const refMax = trendData?.reference_max ?? null;
  const latestValue = trendData?.latest_value ?? (chartData.length > 0 ? chartData[chartData.length - 1].value : null);
  const totalMeasurements = trendData?.total_measurements ?? chartData.length;

  // ── Dynamic Y-axis domain ─────────────────────────────────────────────────
  const yDomain = useMemo(() => {
    const values = chartData.map(d => d.value);
    const allValues = [...values];
    if (refMin !== null) allValues.push(refMin);
    if (refMax !== null) allValues.push(refMax);

    if (allValues.length === 0) return [0, 10];

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || max * 0.2 || 1;
    const padding = range * 0.15;

    return [
      Math.max(0, Math.floor((min - padding) * 10) / 10),
      Math.ceil((max + padding) * 10) / 10
    ];
  }, [chartData, refMin, refMax]);

  // ── Trend badge rendering ──────────────────────────────────────────────────
  const getTrendBadge = () => {
    if (isNoData) return { bg: 'bg-[#F1F5F9]', border: 'border-[#E2E8F0]', text: 'text-[#64748B]', icon: <AlertCircle className="w-4 h-4" />, label: 'No Data' };
    if (isSingleResult) return { bg: 'bg-[#F5F3FF]', border: 'border-[#DDD6FE]', text: 'text-[#7C3AED]', icon: <BarChart3 className="w-4 h-4" />, label: 'Single Result' };
    if (isImproving) return { bg: 'bg-[#F0FDF4]', border: 'border-[#DCFCE7]', text: 'text-[#16A34A]', icon: <TrendingUp className="w-4 h-4" />, label: 'Improving' };
    if (isWorsening) return { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#D97706]', icon: <TrendingDown className="w-4 h-4" />, label: 'Worsening' };
    return { bg: 'bg-[#E0F2FE]', border: 'border-[#BAE6FD]', text: 'text-[#0284C7]', icon: <Minus className="w-4 h-4" />, label: 'Stable' };
  };

  const badge = getTrendBadge();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-md">
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-2">{payload[0].payload.date}</p>
          <p className="text-3xl font-extrabold text-[#172033] flex items-baseline gap-2">
            {payload[0].value} <span className="text-sm font-bold text-[#94A3B8] tracking-wide">{trendData?.unit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom dot for single data point visibility
  const renderDot = (props: any) => {
    if (chartData.length === 1) {
      return <Dot {...props} r={8} fill="#16A34A" stroke="#FFFFFF" strokeWidth={3} />;
    }
    return null;
  };

  if (loadingDash) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-64 skeleton mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1 h-[600px] skeleton rounded-[32px]" />
          <div className="col-span-1 lg:col-span-3 h-[600px] skeleton rounded-[32px]" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LONGITUDINAL BIOMARKERS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Health Data Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Track physiological biomarkers, reference bounds, and clinical trajectories over time.</p>
        </div>
        <Link
          to="/insights"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Advanced Health Insights &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Sidebar/Selector */}
        <div className="card-futuristic col-span-1 p-5 h-[680px] flex flex-col relative overflow-hidden shadow-card">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Parameter</h2>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{uniqueParams.length}</span>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1 pb-4">
            {uniqueParams.map(param => (
              <button
                key={param}
                onClick={() => setSelectedParam(param)}
                className={`w-full text-left px-3.5 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                  selectedParam === param
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 shadow-2xs font-bold'
                    : 'bg-transparent border border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <span className="text-xs sm:text-sm tracking-tight truncate pr-2">
                  {param}
                </span>
                {selectedParam === param && (
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </button>
            ))}
            {uniqueParams.length === 0 && (
              <div className="text-center p-6 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 text-xs font-medium">No parameters recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-3 flex flex-col">
          <div className="card-futuristic p-6 sm:p-8 flex-1 flex flex-col min-h-[680px] relative overflow-hidden shadow-card">

            <AnimatePresence mode="wait">
              {loadingTrend ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-20"
                >
                  <div className="w-12 h-12 rounded-xl border border-[#DCFCE7] flex items-center justify-center mb-4 bg-[#F0FDF4]">
                    <div className="w-5 h-5 border-2 border-[#DCFCE7] border-t-[#16A34A] rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-bold text-[#64748B] tracking-wide uppercase">Analyzing Data...</p>
                </motion.div>
              ) : trendData ? (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col h-full relative z-10"
                >
                  {/* Header & Stats */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                    <div>
                      <h2 className="text-3xl font-extrabold text-[#172033] tracking-tight mb-2">{trendData.parameter}</h2>

                      {/* Trend Badge — uses backend trend, not data min/max */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border} ${badge.text}`}>
                        {badge.icon}
                        <span className="font-bold text-xs uppercase tracking-widest">{badge.label}</span>
                      </div>
                    </div>

                    {/* Quick Stats — uses authoritative reference_range from backend */}
                    <div className="flex items-center gap-6 p-3.5 px-5 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Latest</p>
                        <p className="text-xl font-bold font-display text-slate-900">
                          {latestValue !== null ? latestValue : '--'} <span className="text-xs text-slate-400 font-mono">{trendData.unit}</span>
                        </p>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Reference Bounds</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700 font-mono">{referenceRange || 'N/A'}</p>
                      </div>
                      <div className="w-[1px] h-8 bg-slate-200" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Records</p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-700 font-mono">{totalMeasurements}</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  {chartData.length > 0 ? (
                    <div className="flex-1 w-full mt-4 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAnalyticsHealthcare" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10B981" stopOpacity={0.28}/>
                              <stop offset="100%" stopColor="#0D9488" stopOpacity={0.02}/>
                            </linearGradient>
                          </defs>

                          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />

                          <XAxis
                            dataKey="shortDate"
                            stroke="#94A3B8"
                            fontSize={11}
                            fontWeight={700}
                            tickLine={false}
                            axisLine={false}
                            dy={15}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            fontSize={11}
                            fontWeight={700}
                            tickLine={false}
                            axisLine={false}
                            dx={-15}
                            domain={yDomain}
                            tickFormatter={(val) => val.toFixed(1)}
                          />

                          {/* Reference range boundary lines */}
                          {refMin !== null && (
                            <ReferenceLine y={refMin} stroke="#10B981" strokeDasharray="6 4" strokeOpacity={0.6} label={{ value: `Min: ${refMin}`, position: 'insideTopRight', fill: '#059669', fontSize: 10, fontWeight: 700 }} />
                          )}
                          {refMax !== null && (
                            <ReferenceLine y={refMax} stroke="#10B981" strokeDasharray="6 4" strokeOpacity={0.6} label={{ value: `Max: ${refMax}`, position: 'insideBottomRight', fill: '#059669', fontSize: 10, fontWeight: 700 }} />
                          )}

                          <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#059669"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAnalyticsHealthcare)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                            activeDot={{ r: 6, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
                            dot={chartData.length === 1 ? { r: 8, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 3 } : false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-bold tracking-wide text-slate-600">No historical data points found.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 opacity-50 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold tracking-wide text-slate-600">Select a parameter to view analytics</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
