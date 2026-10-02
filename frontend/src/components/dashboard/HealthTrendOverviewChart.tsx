import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ParameterTrend } from '../../types/api';

interface HealthTrendOverviewProps {
  parameterTrends?: ParameterTrend[];
}

export default function HealthTrendOverviewChart({ parameterTrends = [] }: HealthTrendOverviewProps) {
  const [activeRange, setActiveRange] = useState<'6M' | '3M' | 'All'>('6M');

  // Format real timeline points only
  const { chartData, availableBiomarkers, hasData } = useMemo(() => {
    // Check if there are any points
    const totalPointsCount = parameterTrends.reduce((acc, t) => acc + (t.points ? t.points.length : 0), 0);
    if (totalPointsCount === 0) {
      return { chartData: [], availableBiomarkers: [], hasData: false };
    }

    // Collect all dates
    const dateMap = new Map<string, any>();
    const trackedKeys = new Set<string>();

    // Target the 4 core biomarkers or top parameter trends
    parameterTrends.forEach((trend) => {
      let key = trend.name;
      const lower = trend.name.toLowerCase();
      if (lower.includes('glucose')) key = 'Glucose';
      else if (lower.includes('cholesterol') || lower.includes('ldl')) key = 'Cholesterol';
      else if (lower.includes('vitamin d')) key = 'VitaminD';
      else if (lower.includes('hemoglobin') || lower.includes('haemoglobin')) key = 'Hemoglobin';

      trackedKeys.add(key);

      (trend.points || []).forEach((pt) => {
        const dateObj = new Date(pt.date);
        const dateKey = pt.date.slice(0, 10); // YYYY-MM-DD
        const monthStr = !isNaN(dateObj.getTime())
          ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : pt.date;

        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            dateKey,
            month: monthStr,
            fullDate: !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : pt.date,
            rawTimestamp: !isNaN(dateObj.getTime()) ? dateObj.getTime() : 0,
          });
        }

        const pointObj = dateMap.get(dateKey);
        pointObj[key] = pt.value;
      });
    });

    let sorted = Array.from(dateMap.values()).sort((a, b) => a.rawTimestamp - b.rawTimestamp);

    // Apply activeRange filter
    if (activeRange !== 'All' && sorted.length > 0) {
      const latestTime = sorted[sorted.length - 1].rawTimestamp;
      const days = activeRange === '3M' ? 90 : 180;
      const cutoff = latestTime - days * 24 * 60 * 60 * 1000;
      const filtered = sorted.filter(item => item.rawTimestamp >= cutoff);
      if (filtered.length > 0) {
        sorted = filtered;
      }
    }

    return {
      chartData: sorted,
      availableBiomarkers: Array.from(trackedKeys),
      hasData: sorted.length > 0,
    };
  }, [parameterTrends, activeRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-[#E2E8F0] px-3.5 py-2.5 rounded-xl shadow-md text-xs">
          <p className="font-bold text-[#172B3A] mb-1.5">{dataPoint.fullDate || label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#64748B]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-[#172B3A] font-mono">
                  {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
            Health Trend Overview
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            {hasData ? 'Track your key health indicators over time' : 'Historical biomarker trajectory'}
          </p>
        </div>

        {/* Filter Pills */}
        {hasData && (
          <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl self-start sm:self-auto">
            {(['6M', '3M', 'All'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setActiveRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeRange === range
                    ? 'bg-[#065F46] text-white shadow-2xs'
                    : 'text-[#64748B] hover:text-[#172B3A]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasData ? (
        <>
          {/* Legend Dots */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs font-semibold text-[#64748B]">
            {availableBiomarkers.includes('Glucose') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Glucose</span>
              </div>
            )}
            {availableBiomarkers.includes('Cholesterol') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />
                <span>Cholesterol</span>
              </div>
            )}
            {availableBiomarkers.includes('VitaminD') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Vitamin D</span>
              </div>
            )}
            {availableBiomarkers.includes('Hemoglobin') && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
                <span>Hemoglobin</span>
              </div>
            )}
          </div>

          {/* Chart Canvas */}
          <div className="w-full h-[220px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                  tick={{ fill: '#94A3B8', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />

                {availableBiomarkers.includes('Glucose') && (
                  <Line
                    type="monotone"
                    dataKey="Glucose"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#10B981', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                )}
                {availableBiomarkers.includes('Cholesterol') && (
                  <Line
                    type="monotone"
                    dataKey="Cholesterol"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284C7', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5, stroke: '#0284C7', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                )}
                {availableBiomarkers.includes('VitaminD') && (
                  <Line
                    type="monotone"
                    dataKey="VitaminD"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#F59E0B', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5, stroke: '#F59E0B', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                )}
                {availableBiomarkers.includes('Hemoglobin') && (
                  <Line
                    type="monotone"
                    dataKey="Hemoglobin"
                    stroke="#EC4899"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#EC4899', strokeWidth: 1, stroke: '#FFFFFF' }}
                    activeDot={{ r: 5, stroke: '#EC4899', strokeWidth: 2, fill: '#FFFFFF' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 min-h-[220px]">
          <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#172B3A]">No trend data available yet</h3>
          <p className="text-xs text-[#64748B] mt-1.5 max-w-md">
            Upload multiple medical reports over time to automatically visualize your biomarker trajectories and clinical progress.
          </p>
          <Link
            to="/upload"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#065F46] hover:bg-[#044e39] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Upload First Report
          </Link>
        </div>
      )}

    </div>
  );
}
