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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Upload Report', icon: UploadCloud, badge: 'New' },
  { path: '/reports', label: 'Health Reports', icon: FileText },
  { path: '/analytics', label: 'Health Insights', icon: TrendingUp },
  { path: '/profile', label: 'Health Profile', icon: UserCircle },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-[260px] h-screen sticky top-0 flex flex-col border-r border-[#E2E8F0] bg-white z-40 relative select-none">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-[#F1F5F9]">
        <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shadow-xs">
          <Activity className="text-[#16A34A] w-5 h-5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-[#172033] leading-tight">HealthLens</span>
          <span className="text-[11px] font-semibold text-[#16A34A] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#16A34A]" /> Clinical Care
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-3 px-3">
          Navigation
        </div>
        
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link key={item.path} to={item.path} className="relative block group">
              {isActive && (
                <motion.div
                  layoutId="active-sidebar-nav"
                  className="absolute inset-0 bg-[#F0FDF4] rounded-xl border border-[#DCFCE7]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              
              <div 
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-[#15803D] font-semibold' 
                    : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC]'
                }`}
              >
                <div 
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-[#DCFCE7] text-[#15803D]' 
                      : 'text-[#64748B] group-hover:text-[#172033] group-hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <span className="text-sm">{item.label}</span>
                
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-[#DCFCE7] text-[#15803D] rounded-full border border-[#BBF7D0]">
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-[#F1F5F9] mt-auto">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#E2E8F0] text-[#172033] flex items-center justify-center text-xs font-bold border border-[#CBD5E1]">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#16A34A] rounded-full border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#172033] truncate">{user?.full_name || 'User'}</p>
              <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#DC2626] bg-white hover:bg-[#FEF2F2] rounded-lg transition-colors border border-[#E2E8F0] hover:border-[#FECACA] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
      
    </aside>
  );
}
