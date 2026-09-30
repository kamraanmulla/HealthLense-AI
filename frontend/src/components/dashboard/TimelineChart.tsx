import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import GlassCard from '../ui/GlassCard';
import type { HealthTimelinePoint } from '../../types/api';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface TimelineChartProps {
  timeline: HealthTimelinePoint[];
}

export default function TimelineChart({ timeline }: TimelineChartProps) {
  const chartData = timeline.map(pt => ({
    date: format(new Date(pt.date), 'MMM d'),
    score: pt.health_score,
    fullDate: format(new Date(pt.date), 'MMMM d, yyyy')
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-md">
          <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">
            {payload[0].payload.fullDate}
          </p>
          <p className="text-base font-bold text-[#172033] flex items-center gap-1.5">
            Score: <span className="text-[#16A34A]">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard className="p-6 flex-1 flex flex-col min-h-[280px] bg-white border border-[#E2E8F0] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider block mb-1">
            Historical Progress
          </span>
          <h2 className="text-base font-bold text-[#172033] tracking-tight flex items-center gap-2">
            Health Score Timeline <Activity className="w-4 h-4 text-[#16A34A]" />
          </h2>
        </div>
      </div>

      {chartData.length > 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 w-full -ml-3"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScoreHealthcare" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25}/>
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94A3B8" 
                fontSize={11} 
                fontWeight={500}
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={11} 
                fontWeight={500}
                tickLine={false} 
                axisLine={false}
                domain={[0, 100]} 
                dx={-5}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#16A34A" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorScoreHealthcare)" 
                animationDuration={1500}
                activeDot={{ r: 5, fill: '#16A34A', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8] p-6">
          <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
            <Activity className="w-5 h-5 text-[#94A3B8]" />
          </div>
          <p className="text-xs font-semibold text-[#64748B]">Multiple reports needed to plot timeline</p>
        </div>
      )}
    </GlassCard>
  );
}
