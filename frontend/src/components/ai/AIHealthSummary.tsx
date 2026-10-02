import type { AIHealthSummary as AIHealthSummaryType } from '../../types/api';
import { Activity, Apple, Coffee, Info, MessageCircle, ShieldAlert } from 'lucide-react';

interface AIHealthSummaryProps {
  summary?: AIHealthSummaryType;
}

export default function AIHealthSummary({ summary }: AIHealthSummaryProps) {
  if (!summary) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 px-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
          <Activity className="w-5 h-5 stroke-[2]" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">Clinical Health Guidance</h2>
          <p className="text-xs text-slate-500 font-medium">Evidence-based lifestyle suggestions and doctor discussion points</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="card-futuristic p-5 shadow-card">
          <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-emerald-600" />
            Key Clinical Observations
          </h3>
          <ul className="space-y-2">
            {summary.key_findings.map((finding, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-futuristic p-5 shadow-card">
          <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Coffee className="w-4 h-4 text-amber-600" />
            Lifestyle Recommendations
          </h3>
          <ul className="space-y-2">
            {summary.lifestyle_recommendations.map((rec, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-futuristic p-5 shadow-card">
          <h3 className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Apple className="w-4 h-4 text-teal-600" />
            Dietary Guidance
          </h3>
          <ul className="space-y-2">
            {summary.dietary_guidance.map((guidance, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-teal-500 mt-0.5">•</span>
                <span>{guidance}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-futuristic p-5 shadow-card">
          <h3 className="text-xs font-bold text-cyan-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-cyan-600" />
            Doctor Discussion Points
          </h3>
          <ul className="space-y-2">
            {summary.doctor_discussion_points.map((point, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2 font-medium leading-relaxed">
                <span className="text-cyan-500 mt-0.5">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {summary.medical_disclaimer && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">{summary.medical_disclaimer}</p>
        </div>
      )}
    </div>
  );
}
