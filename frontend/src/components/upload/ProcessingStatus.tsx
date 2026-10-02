import { BrainCircuit, Loader2, Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

interface ProcessingStatusProps {
  progress: number;
  statusText: string;
}

export default function ProcessingStatus({ progress, statusText }: ProcessingStatusProps) {
  const getStep = () => {
    if (progress < 25) return 0;
    if (progress < 50) return 1;
    if (progress < 75) return 2;
    return 3;
  };

  const currentStep = getStep();

  const steps = [
    { label: "Securely transmitting document", icon: Activity },
    { label: "Extracting clinical parameters", icon: Sparkles },
    { label: "AI analyzing health index", icon: BrainCircuit },
    { label: "Finalizing medical insights", icon: Loader2 }
  ];

  return (
    <div className="card-futuristic p-8 sm:p-12 relative overflow-hidden max-w-2xl mx-auto shadow-card">
      {/* Subtle emerald background accent */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="flex flex-col items-center justify-center text-center relative z-10">

        {/* Core AI Visualization */}
        <div className="relative mb-10">
          {/* Outer rotating rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-dashed border-emerald-300"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 rounded-full border border-teal-200/60"
          />

          {/* Center Brain/Core */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-2xl animate-pulse" />
            <BrainCircuit className="w-10 h-10 text-emerald-600 relative z-10" />

            <motion.div
              animate={{ scale: [1, 0.7, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="absolute inset-3 rounded-xl border border-emerald-400"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 mb-2 tracking-tight">
          Processing Document
        </h2>
        <p className="text-sm text-slate-500 font-medium mb-8">
          Executing multi-stage neural parsing and clinical range verification
        </p>

        {/* Step Progress indicators */}
        <div className="w-full max-w-sm mb-10 space-y-4 text-left mx-auto">
          {steps.map((step, idx) => {
            const isActive = idx === currentStep;
            const isPast = idx < currentStep;
            const Icon = step.icon;

            return (
              <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'opacity-100 transform scale-105' : isPast ? 'opacity-60' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isActive ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#16A34A] shadow-sm' : isPast ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#15803D]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#CBD5E1]'}`}>
                  <Icon className={`w-4 h-4 ${isActive && idx === 3 ? 'animate-spin' : ''}`} />
                </div>
                <p className={`text-sm font-bold tracking-wide ${isActive ? 'text-[#172033]' : isPast ? 'text-[#64748B]' : 'text-[#CBD5E1]'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-[#F1F5F9] rounded-full h-3 mb-4 overflow-hidden relative border border-[#E2E8F0]">
          <motion.div
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Moving light effect on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>

        <div className="flex items-center justify-between w-full max-w-md px-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{statusText}</p>
          <p className="text-base font-extrabold font-mono text-emerald-600">{progress}%</p>
        </div>

      </div>
    </div>
  );
}
