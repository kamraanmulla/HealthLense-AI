import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface HealthGaugeProps {
  score: number;
  size?: number;
}

export default function HealthGauge({ score, size = 190 }: HealthGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  // Clean medical semantic colors
  let color = '#DC2626'; // High risk (<60)
  let bgSubtle = '#FEF2F2';
  if (score >= 80) {
    color = '#16A34A'; // Healthy / Optimal (>=80)
    bgSubtle = '#F0FDF4';
  } else if (score >= 60) {
    color = '#D97706'; // Moderate / Attention (60-79)
    bgSubtle = '#FFFBEB';
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 relative z-10"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated value track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span 
          className="text-4xl font-extrabold tracking-tight"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {Math.round(animatedScore)}
        </motion.span>
        <span className="text-[11px] text-[#64748B] font-semibold tracking-wider uppercase mt-0.5">
          Health Score
        </span>
      </div>
    </div>
  );
}
