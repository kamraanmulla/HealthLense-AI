import { motion } from 'framer-motion';
import { CheckCircle2, FileText, ArrowRight, Sparkles, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UploadSuccessProps {
  reportId?: string | null;
}

export default function UploadSuccess({ reportId }: UploadSuccessProps) {
  return (
    <div className="card-futuristic p-8 sm:p-12 text-center max-w-2xl mx-auto relative overflow-hidden shadow-card">
      {/* Subtle emerald glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-emerald-500/10 blur-[110px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Celebration Animation */}
        <div className="relative mb-6">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1], opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-emerald-500 rounded-full blur-md"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 1.5], opacity: [0, 0.1, 0] }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
            className="absolute -inset-4 bg-teal-500 rounded-full blur-xl"
          />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg border-2 border-white/80"
          >
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Biomarkers Extracted & Analyzed</span>
        </div>

        <motion.h3
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 mb-2 tracking-tight"
        >
          Analysis Complete
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 font-medium text-sm sm:text-base mb-6 max-w-md"
        >
          Your diagnostic report has been evaluated and calibrated with clinical reference ranges.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md"
        >
          <Link
            to="/reports"
            className="btn-primary w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-emerald-500/20"
          >
            <Layers className="w-4 h-4" />
            <span>Go to My Reports</span>
          </Link>
          {reportId && (
            <Link
              to={`/reports/${reportId}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>View Report Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </motion.div>

        <p className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Automatically taking you to My Reports...
        </p>
      </div>
    </div>
  );
}
