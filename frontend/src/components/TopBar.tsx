import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  X,
  User as UserIcon,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '../lib/auth';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'Report Processed', text: 'Blood Test Report.pdf successfully analyzed', time: '2h ago', icon: Activity },
    { id: 2, title: 'Health Trends Updated', text: '4 biomarkers updated from recent report', time: '4h ago', icon: CheckCircle2 },
    { id: 3, title: 'AI Assistant Calibrated', text: 'Gemini 3.8 Flash active and ready for questions', time: 'Yesterday', icon: FileText },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/reports?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-18 border-b border-[#E2E8F0] bg-white sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8">

      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer border border-[#E2E8F0]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar (Exact Reference UI) */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#94A3B8] group-focus-within:text-[#10B981] transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-12 py-2 border border-[#E2E8F0] rounded-full text-xs bg-[#F8FAFC] text-[#172B3A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] focus:bg-white transition-all shadow-2xs"
            placeholder="Search reports, tests, or ask a question..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-medium text-[#94A3B8] tracking-wider px-1.5 py-0.5 rounded bg-white border border-[#E2E8F0]">
              ⌘ K
            </span>
          </div>
        </form>
      </div>

      {/* Right Actions (Exact Reference UI) */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Gemini Engine Active Pill */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-[#172B3A]">Gemini 3.8 Flash</span>
            <span className="text-[10px] font-medium text-[#64748B] mt-0.5">AI Engine Active</span>
          </div>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#64748B] hover:text-[#172B3A] hover:bg-[#F8FAFC] rounded-full transition-colors cursor-pointer border border-[#E2E8F0]"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-[#EF4444] rounded-full ring-2 ring-white">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white border border-[#E2E8F0] rounded-2xl shadow-xl z-50 p-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xs font-bold text-[#172B3A]">Notifications</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#ECFDF5] text-[#059669] rounded-md">3 New</span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[#94A3B8] hover:text-[#172B3A] text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <div key={n.id} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[#DCFCE7] text-[#059669] shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#172B3A]">{n.title}</p>
                        <p className="text-[11px] text-[#64748B] line-clamp-1">{n.text}</p>
                        <span className="text-[9px] text-[#94A3B8] font-medium">{n.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Time and Date Display */}
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-xs font-bold text-[#172B3A]">
            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
          <span className="text-[11px] font-medium text-[#64748B]">
            {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* User Profile Pill */}
        <Link to="/profile" className="flex items-center gap-3 pl-2 sm:border-l sm:border-[#E2E8F0] hover:opacity-85 transition-opacity">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {user?.full_name ? user.full_name[0].toUpperCase() : <UserIcon className="w-4 h-4 text-white" />}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-bold text-[#172B3A] truncate max-w-[120px]">
              {user?.full_name || 'User'}
            </span>
            <span className="text-[10px] font-medium text-[#64748B]">
              Premium User
            </span>
          </div>
        </Link>

      </div>
    </header>
  );
}
