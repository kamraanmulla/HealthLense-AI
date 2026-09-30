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
    <GlassCard className="p-12 relative overflow-hidden max-w-2xl mx-auto border-[#DCFCE7] bg-white shadow-sm">
      {/* Subtle green background accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0FDF4] opacity-60 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Core AI Visualization */}
        <div className="relative mb-12">
          {/* Outer rotating rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-8 rounded-full border border-dashed border-[#BBF7D0]"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-12 rounded-full border border-[#DCFCE7]"
          />
          
          {/* Center Brain/Core */}
          <div className="w-28 h-28 rounded-full bg-[#F0FDF4] border-2 border-[#DCFCE7] flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#16A34A]/10 to-[#22C55E]/10 rounded-full animate-pulse" />
            <BrainCircuit className="w-12 h-12 text-[#16A34A] relative z-10" />
            
            <motion.div 
              animate={{ scale: [1, 0.5, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-4 rounded-full border border-[#86EFAC]"
            />
          </div>
        </div>
        
        <h2 className="text-3xl font-extrabold text-[#172033] mb-8 tracking-tight">
          Processing Report
        </h2>
        
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
          <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">{statusText}</p>
          <p className="text-sm font-extrabold text-[#16A34A]">{progress}%</p>
        </div>
        
      </div>
    </GlassCard>
  );
}
