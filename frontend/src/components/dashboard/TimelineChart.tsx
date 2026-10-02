import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import type { HealthTimelinePoint } from '../../types/api';
import { Activity, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineChartProps {
  timeline: HealthTimelinePoint[];
}

export default function TimelineChart({ timeline }: TimelineChartProps) {
  const [filter, setFilter] = useState<'all' | '6m' | '3m'>('all');

  const filteredTimeline = timeline.filter((pt, index) => {
    if (filter === '3m') return index >= Math.max(0, timeline.length - 3);
    if (filter === '6m') return index >= Math.max(0, timeline.length - 6);
    return true;
  });

  const chartData = filteredTimeline.map(pt => ({
    date: format(new Date(pt.date), 'MMM d'),
    score: pt.health_score,
    fullDate: format(new Date(pt.date), 'MMMM d, yyyy')
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const status = score >= 80 ? 'Optimal' : score >= 60 ? 'Moderate' : 'Review Needed';
      const statusColor = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626';

      return (
        <div className="bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3.5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
              {payload[0].payload.fullDate}
            </span>
            <span
              className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded-md"
              style={{ color: statusColor, backgroundColor: score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2' }}
            >
              {status}
            </span>
          </div>
          <p className="font-display text-2xl font-extrabold text-[#0F172A] flex items-baseline gap-1">
            {score} <span className="text-xs font-bold text-[#94A3B8]">/ 100</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card-futuristic p-6 flex-1 flex flex-col min-h-[300px] bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[10px] font-extrabold uppercase tracking-wider mb-1.5">
            <TrendingUp className="w-3 h-3 text-[#059669]" />
            Longitudinal Telemetry
          </div>
          <h2 className="font-display text-lg font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            Health Index Trajectory
          </h2>
        </div>

        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl self-start sm:self-auto">
          {(['all', '6m', '3m'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                filter === t
                  ? 'bg-white text-[#059669] shadow-2xs border border-[#E2E8F0]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {t === 'all' ? 'All Panels' : t === '6m' ? 'Last 6' : 'Last 3'}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 w-full -ml-3"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFuturisticHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.35}/>
                  <stop offset="60%" stopColor="#0D9488" stopOpacity={0.08}/>
                  <stop offset="100%" stopColor="#0D9488" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                dx={-5}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#10B981', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFuturisticHealth)"
                animationDuration={1400}
                activeDot={{ r: 6, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] p-8">
          <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
            <Activity className="w-6 h-6 text-[#94A3B8]" />
          </div>
          <p className="text-xs font-bold text-[#64748B]">Multiple reports are required to plot your longitudinal trajectory.</p>
        </div>
      )}
    </div>
  );
}
