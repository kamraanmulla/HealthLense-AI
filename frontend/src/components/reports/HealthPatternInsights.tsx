import type { MLAnomalyDetectionResult, LongitudinalChange } from '../../types/api';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface HealthPatternInsightsProps {
  mlResult: MLAnomalyDetectionResult;
}

export default function HealthPatternInsights({ mlResult }: HealthPatternInsightsProps) {
  if (!mlResult || mlResult.anomaly_level === 'unavailable') {
    return null;
  }

  const isAnomaly = mlResult.anomaly_detected;
  const level = mlResult.anomaly_level?.toLowerCase() || 'normal';
  const hasLongitudinal =
    mlResult.longitudinal_changes && mlResult.longitudinal_changes.length > 0;

  // Level-aware theming (non-alarming)
  let headerIcon = <CheckCircle2 className="w-5 h-5 stroke-[2]" />;
  let headerBg = 'bg-[#F0FDF4]';
  let headerBorder = 'border-[#DCFCE7]';
  let headerText = 'text-[#16A34A]';
  let statusBadgeCls = 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]';
  let statusLabel = 'Consistent Patterns';

  if (level === 'high') {
    headerIcon = <AlertTriangle className="w-5 h-5 stroke-[2]" />;
    headerBg = 'bg-[#FFFBEB]';
    headerBorder = 'border-[#FDE68A]';
    headerText = 'text-[#D97706]';
    statusBadgeCls = 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]';
    statusLabel = 'Unusual Pattern Detected';
  } else if (level === 'medium') {
    headerIcon = <Activity className="w-5 h-5 stroke-[2]" />;
    headerBg = 'bg-[#FFF7ED]';
    headerBorder = 'border-[#FED7AA]';
    headerText = 'text-[#EA580C]';
    statusBadgeCls = 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]';
    statusLabel = 'Notable Pattern Observed';
  } else if (level === 'low') {
    headerIcon = <Info className="w-5 h-5 stroke-[2]" />;
    headerBg = 'bg-[#F0F9FF]';
    headerBorder = 'border-[#BAE6FD]';
    headerText = 'text-[#0284C7]';
    statusBadgeCls = 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0369A1]';
    statusLabel = 'Minor Deviation Noted';
  }

  const directionIcon = (direction: string | null) => {
    if (!direction) return <Minus className="w-3.5 h-3.5 text-[#94A3B8]" />;
    if (direction === 'increasing')
      return <TrendingUp className="w-3.5 h-3.5 text-[#EA580C]" />;
    if (direction === 'decreasing')
      return <TrendingDown className="w-3.5 h-3.5 text-[#2563EB]" />;
    return <Minus className="w-3.5 h-3.5 text-[#94A3B8]" />;
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-1 mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${headerBg} border ${headerBorder} flex items-center justify-center ${headerText}`}
        >
          <Sparkles className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#172033] tracking-tight">
            Health Pattern Analysis
          </h2>
          <p className="text-xs text-[#64748B]">
            ML-powered population pattern comparison using NHANES reference data
          </p>
        </div>
      </div>

      <GlassCard className="p-6 bg-white border border-[#E2E8F0] shadow-sm">
        {/* Status Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${statusBadgeCls}`}
          >
            {headerIcon}
            {statusLabel}
          </span>

          {mlResult.parameters_analyzed && mlResult.parameters_analyzed.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
              {mlResult.parameters_analyzed.length} parameters analyzed
            </span>
          )}

          {mlResult.model_version && mlResult.model_version !== 'unavailable' && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B]">
              Model v{mlResult.model_version}
            </span>
          )}
        </div>

        {/* Reason / Explanation */}
        <p className="text-[13px] leading-relaxed text-[#334155] mb-5">
          {mlResult.reason}
        </p>

        {/* Affected Parameters */}
        {isAnomaly && mlResult.affected_parameters && mlResult.affected_parameters.length > 0 && (
          <div className="mb-5">
            <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2.5">
              Parameters Contributing to Unusual Pattern
            </h4>
            <div className="flex flex-wrap gap-2">
              {mlResult.affected_parameters.map((param) => (
                <span
                  key={param}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    level === 'high'
                      ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
                      : 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Normal State */}
        {!isAnomaly && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7]">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#15803D]">
                Values Consistent with Reference Patterns
              </p>
              <p className="text-xs text-[#166534] mt-0.5">
                The reported parameter combinations are within the range of patterns
                commonly observed in the reference population dataset.
              </p>
            </div>
          </div>
        )}

        {/* Longitudinal Changes */}
        {hasLongitudinal && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Changes from Previous Report
              </h4>
              <span className="text-[10px] text-[#94A3B8]">
                Personal baseline (user history)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {mlResult.longitudinal_changes!.map((change: LongitudinalChange) => (
                <motion.div
                  key={change.parameter}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  {directionIcon(change.direction)}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-[#172033] block truncate">
                      {change.parameter}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {change.previous_value != null
                        ? `${change.previous_value} → ${change.current_value}`
                        : `${change.current_value}`}
                      {change.percentage_change != null && (
                        <span
                          className={`ml-1 font-semibold ${
                            change.percentage_change > 10
                              ? 'text-[#EA580C]'
                              : change.percentage_change < -10
                              ? 'text-[#2563EB]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          ({change.percentage_change > 0 ? '+' : ''}
                          {change.percentage_change}%)
                        </span>
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-5 pt-4 border-t border-[#F1F5F9]">
          <p className="text-[10px] text-[#94A3B8] leading-relaxed">
            <span className="font-semibold">Disclaimer:</span>{' '}
            {mlResult.disclaimer ||
              'This pattern analysis is informational and is not a medical diagnosis. Please consult a qualified healthcare professional for clinical interpretation.'}
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
