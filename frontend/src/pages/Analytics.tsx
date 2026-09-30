import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Dot } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertCircle, ChevronRight, Minus, BarChart3 } from 'lucide-react';
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] mb-4">
            <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Clinical Analytics</span>
          </div>
          <h1 className="text-4xl font-extrabold text-[#172033] tracking-tight mb-2">
            Health Data Trends
          </h1>
          <p className="text-[#64748B] font-medium">Track your biomarkers and clinical history over time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar/Selector */}
        <GlassCard className="col-span-1 p-6 h-[700px] flex flex-col relative overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
          <h2 className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-6 px-2">Select Parameter</h2>
          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
            {uniqueParams.map(param => (
              <button
                key={param}
                onClick={() => setSelectedParam(param)}
                className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
                  selectedParam === param 
                    ? 'bg-[#F0FDF4] border border-[#DCFCE7]' 
                    : 'bg-transparent border border-transparent hover:bg-[#F8FAFC] hover:border-[#E2E8F0]'
                }`}
              >
                <span className={`font-bold text-sm tracking-tight ${selectedParam === param ? 'text-[#15803D]' : 'text-[#64748B] group-hover:text-[#172033]'}`}>
                  {param}
                </span>
                {selectedParam === param && (
                  <ChevronRight className="w-4 h-4 text-[#16A34A]" />
                )}
              </button>
            ))}
            {uniqueParams.length === 0 && (
              <div className="text-center p-6 border border-dashed border-[#E2E8F0] rounded-2xl">
                <p className="text-[#94A3B8] text-sm font-medium">No parameters found.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Chart Area */}
        <div className="col-span-1 lg:col-span-3 flex flex-col">
          <GlassCard className="p-8 flex-1 flex flex-col min-h-[700px] relative overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
            
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
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div>
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Latest</p>
                        <p className="text-xl font-bold text-[#172033]">
                          {latestValue !== null ? latestValue : '--'} <span className="text-xs text-[#94A3B8]">{trendData.unit}</span>
                        </p>
                      </div>
                      <div className="w-[1px] h-8 bg-[#E2E8F0]" />
                      <div>
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Reference Range</p>
                        <p className="text-sm font-bold text-[#64748B]">{referenceRange || 'N/A'}</p>
                      </div>
                      <div className="w-[1px] h-8 bg-[#E2E8F0]" />
                      <div>
                        <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Measurements</p>
                        <p className="text-sm font-bold text-[#64748B]">{totalMeasurements}</p>
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
                              <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25}/>
                              <stop offset="100%" stopColor="#16A34A" stopOpacity={0}/>
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
                            <ReferenceLine y={refMin} stroke="#16A34A" strokeDasharray="6 4" strokeOpacity={0.5} label={{ value: `Min: ${refMin}`, position: 'insideTopRight', fill: '#16A34A', fontSize: 10, fontWeight: 700 }} />
                          )}
                          {refMax !== null && (
                            <ReferenceLine y={refMax} stroke="#16A34A" strokeDasharray="6 4" strokeOpacity={0.5} label={{ value: `Max: ${refMax}`, position: 'insideBottomRight', fill: '#16A34A', fontSize: 10, fontWeight: 700 }} />
                          )}

                          <Tooltip 
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#16A34A" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorAnalyticsHealthcare)"
                            animationDuration={1500}
                            animationEasing="ease-out"
                            activeDot={{ r: 6, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 2 }}
                            dot={chartData.length === 1 ? { r: 8, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 3 } : false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8]">
                      <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-sm font-bold tracking-wide text-[#64748B]">No historical data points found.</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8]">
                  <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 opacity-50 text-[#16A34A]" />
                  </div>
                  <p className="text-sm font-bold tracking-wide text-[#64748B]">Select a parameter to view analytics</p>
                </div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
        
      </div>
    </PageTransition>
  );
}
