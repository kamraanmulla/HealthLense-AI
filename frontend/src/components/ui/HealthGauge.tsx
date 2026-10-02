import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number;
  size?: number;
}

export default function HealthGauge({ score, size = 190 }: HealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 13;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 150);
    return () => clearTimeout(timer);
  }, [score]);

  // Clean futuristic medical gradient colors
  const gradientId = `gaugeGrad-${score >= 80 ? 'optimal' : score >= 60 ? 'moderate' : 'critical'}`;
  let primaryColor = '#10B981';
  let stopColor = '#0D9488';
  let statusText = 'Optimal Health';
  let statusColor = '#047857';

  if (score < 60) {
    primaryColor = '#EF4444';
    stopColor = '#DC2626';
    statusText = 'Needs Review';
    statusColor = '#B91C1C';
  } else if (score < 80) {
    primaryColor = '#F59E0B';
    stopColor = '#D97706';
    statusText = 'Moderate Health';
    statusColor = '#B45309';
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>

      {/* Subtle Ambient Radial Glow Behind Gauge */}
      <div
        className="absolute inset-4 rounded-full opacity-20 blur-xl pointer-events-none transition-colors"
        style={{ backgroundColor: primaryColor }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 relative z-10"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={stopColor} />
          </linearGradient>
        </defs>

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated value track with gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 pointer-events-none">
        <motion.div
          className="flex items-baseline justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <span
            className="font-display text-5xl font-extrabold tracking-tight leading-none"
            style={{ color: primaryColor }}
          >
            {Math.round(animatedScore)}
          </span>
          <span className="text-xs font-bold text-[#94A3B8] ml-0.5">/100</span>
        </motion.div>

        <span
          className="text-[10px] font-extrabold tracking-widest uppercase mt-1 px-2 py-0.5 rounded-full"
          style={{ color: statusColor, backgroundColor: score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2' }}
        >
          {statusText}
        </span>
      </div>
    </div>
  );
}
