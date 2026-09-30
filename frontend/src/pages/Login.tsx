import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Mail, Lock, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useHookForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-8 md:p-10 rounded-2xl border border-[#E2E8F0] shadow-sm relative"
    >
      <div>
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
            <Activity className="w-6 h-6 text-[#16A34A]" />
          </div>
          <h2 className="text-2xl font-bold text-[#172033] tracking-tight">Welcome Back</h2>
          <p className="text-[#64748B] text-sm mt-1">Sign in to access your HealthLens dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                placeholder="name@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider">
                Password
              </label>
              <Link to="#" className="text-xs font-medium text-[#16A34A] hover:text-[#15803D] transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-[#DC2626] font-medium">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary h-11 text-sm font-semibold shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In to HealthLens <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#64748B]">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-[#16A34A] hover:text-[#15803D] transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
