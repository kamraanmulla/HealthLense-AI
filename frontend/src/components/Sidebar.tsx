import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  LayoutDashboard,
  UploadCloud,
  FileText,
  TrendingUp,
  UserCircle,
  LogOut,
  MessageSquareText,
  Sparkles,
  Settings,
  X,
  ChevronRight,
  Heart
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Report', icon: UploadCloud },
  { path: '/reports', label: 'My Reports', icon: FileText },
  { path: '/analytics', label: 'Health Analytics', icon: TrendingUp },
  { path: '/insights', label: 'Health Insights', icon: Sparkles },
  { path: '/assistant', label: 'AI Assistant', icon: MessageSquareText },
  { path: '/profile', label: 'Health Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay lg:hidden ${isOpen ? 'sidebar-overlay-visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`
        w-[250px] sm:w-[260px] h-screen flex flex-col border-r border-[#E2E8F0] bg-white z-50 select-none
        fixed lg:sticky top-0 shadow-[1px_0_10px_rgba(15,23,42,0.02)]
        transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#F1F5F9]/80">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => onClose?.()}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#0D9488] flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Activity className="text-white w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-display text-lg font-bold tracking-tight text-[#172B3A]">
                  HealthLens
                </span>
                <span className="text-base font-extrabold text-[#10B981]">
                  AI
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#94A3B8] tracking-tight">
                Your Health. Our Focus.
              </span>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative block"
                onClick={() => onClose?.()}
              >
                <div
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive
                      ? 'bg-[#166534] text-white shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#172B3A] hover:bg-[#F0FDF4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 stroke-[2.2] ${isActive ? 'text-white' : 'text-[#64748B]'}`} />
                  <span className="text-xs tracking-tight">{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Promotional / Wellness Encouragement Box (Reference UI) */}
          <div className="pt-6 px-1">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ECFDF5] via-[#F0FDF4] to-[#E6F4EA] border border-[#A7F3D0]/60 p-4 shadow-xs">
              {/* Soft decorative background leaf pattern */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-30 text-[#059669] pointer-events-none">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 0 C70 30, 90 40, 100 70 C70 90, 40 80, 20 60 C10 40, 30 10, 50 0 Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <h4 className="text-xs font-bold text-[#172B3A] leading-tight mb-0.5">
                  Better Health
                </h4>
                <h4 className="text-xs font-extrabold text-[#059669] leading-tight mb-2">
                  Brighter Tomorrow
                </h4>
                <p className="text-[10px] text-[#64748B] font-medium leading-relaxed mb-3">
                  Track. Understand.<br />Take control.
                </p>

                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#0D9488] flex items-center justify-center shadow-xs">
                  <Heart className="w-4 h-4 text-white fill-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile / Quick Signout Footer */}
        <div className="p-3 border-t border-[#F1F5F9] mt-auto">
          <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]/80 flex items-center justify-between gap-2">
            <Link
              to="/profile"
              onClick={() => onClose?.()}
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#166534] to-[#16A34A] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                {user?.full_name ? user.full_name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#172B3A] truncate">{user?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-[10px] text-[#16A34A] font-semibold truncate">Active Member</p>
              </div>
            </Link>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-white transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
