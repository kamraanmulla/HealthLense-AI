import { motion } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

export default function UploadSuccess() {
  return (
    <GlassCard className="p-16 text-center border-[#DCFCE7] max-w-2xl mx-auto relative overflow-hidden bg-white shadow-sm">
      {/* Subtle green glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#16A34A] opacity-[0.04] blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Celebration Animation */}
        <div className="relative mb-10">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-[#16A34A] rounded-full blur-md"
          />
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.5], opacity: [0, 0.1, 0] }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
            className="absolute -inset-4 bg-[#16A34A] rounded-full blur-xl"
          />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center shadow-lg border-4 border-white"
          >
            <CheckCircle2 className="w-14 h-14 text-white" />
          </motion.div>
        </div>
        
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-extrabold text-[#172033] mb-4 tracking-tight"
        >
          Analysis Complete
        </motion.h3>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#64748B] font-medium text-lg mb-8"
        >
          Your medical report has been successfully processed.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          className="flex flex-col sm:flex-row items-center gap-4 bg-[#F8FAFC] p-2 pl-6 rounded-full border border-[#E2E8F0]"
        >
          <div className="flex items-center gap-3 mr-4">
            <FileText className="w-5 h-5 text-[#16A34A]" />
            <span className="text-sm font-bold text-[#172033]">Redirecting to report</span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#15803D]">
            Please wait <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </motion.div>
      </div>
    </GlassCard>
  );
}
