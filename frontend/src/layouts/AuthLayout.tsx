import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Activity, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50 relative flex overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Left side - Healthcare Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-slate-200/80 bg-white/70 backdrop-blur-md">

        <div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
              <Activity className="text-white w-6 h-6 stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold font-display tracking-tight text-slate-900 leading-tight">HealthLens AI</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Clinical Intelligence OS v2.5
              </span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-16 max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Next-Gen Medical Report Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-[2.85rem] font-extrabold font-display text-slate-900 leading-[1.15] tracking-tight">
              Clinical diagnostic clarity for modern healthcare.
            </h1>
            <p className="mt-5 text-base text-slate-600 leading-relaxed font-normal">
              Seamlessly analyze blood panels and lab documents to extract parameters, identify calibrated biological ranges, and unlock educational health explanations.
            </p>

            <div className="mt-10 space-y-3.5">
              {[
                { icon: Zap, title: 'Neural Biomarker Extraction', desc: 'Parses complex laboratory parameters and reference ranges instantly' },
                { icon: ShieldCheck, title: 'Local Session Isolation', desc: 'Protected data handling with strict private report boundaries' },
                { icon: CheckCircle2, title: 'Calibrated Health Index', desc: 'Context-grounded summaries designed for clinician & patient comprehension' }
              ].map((feature, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + (idx * 0.1) }}
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all"
                >
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 mt-0.5 shrink-0">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-bold font-display text-sm">{feature.title}</h3>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="text-slate-400 text-xs font-medium flex items-center justify-between">
          <span>© {new Date().getFullYear()} HealthLens AI • Clinical Platform</span>
          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">v2.5 FUTURISTIC</span>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 bg-slate-50/80 backdrop-blur-sm">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Activity className="text-white w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold font-display tracking-tight text-slate-900">HealthLens AI</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
