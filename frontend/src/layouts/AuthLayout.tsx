import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Activity, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex overflow-hidden">
      
      {/* Left side - Healthcare Branding (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-[#E2E8F0] bg-gradient-to-br from-white via-[#F8FAFC] to-[#F0FDF4]">
        
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shadow-xs">
              <Activity className="text-[#16A34A] w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight text-[#172033] leading-tight">HealthLens</span>
              <span className="text-xs font-semibold text-[#16A34A] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" /> Medical Insights Platform
              </span>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-20 max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] text-xs font-semibold mb-6">
              Clinical Intelligence & Analysis
            </div>
            <h1 className="text-[2.75rem] font-extrabold text-[#172033] leading-[1.15] tracking-tight">
              Understand your health reports with clarity.
            </h1>
            <p className="mt-6 text-base text-[#64748B] leading-relaxed">
              Upload blood work and laboratory documents to extract parameters, identify reference ranges, and view educational health explanations.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Zap, title: 'Instant Report Extraction', desc: 'Accurately parses laboratory parameters and reference ranges' },
                { icon: ShieldCheck, title: 'Private & Secure', desc: 'Secure local processing with enterprise data safeguards' },
                { icon: CheckCircle2, title: 'Clear Health Insights', desc: 'Plain-language summaries designed for patient understanding' }
              ].map((feature, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  key={idx} 
                  className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs"
                >
                  <div className="p-2 rounded-lg bg-[#F0FDF4] text-[#16A34A] mt-0.5">
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[#172033] font-semibold text-sm">{feature.title}</h3>
                    <p className="text-[#64748B] text-xs mt-0.5">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        <div className="text-[#94A3B8] text-xs font-medium">
          © {new Date().getFullYear()} HealthLens AI • Educational Health Platform
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-10">
            <div className="w-11 h-11 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center">
              <Activity className="text-[#16A34A] w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#172033]">HealthLens</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
