import { useState, useEffect } from 'react';
import { Bell, Search, Command, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function TopBar() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-20 border-b border-[#E2E8F0] bg-white sticky top-0 z-30 flex items-center justify-between px-8">
      
      {/* Greeting & Time */}
      <div className="flex flex-col">
        <h1 className="text-lg font-bold text-[#172033] tracking-tight">
          {getGreeting()}, <span className="text-[#16A34A]">{user?.full_name?.split(' ')[0] || 'there'}</span>
        </h1>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs font-medium text-[#64748B]">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
          <p className="text-xs font-medium text-[#64748B]">
            {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Clinical Engine Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span className="text-xs font-semibold text-[#15803D]">Health Engine Active</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
        </div>

        {/* Clean Search */}
        <div className="relative hidden md:block group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#94A3B8] group-focus-within:text-[#16A34A] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-[240px] lg:w-[280px] pl-9 pr-12 py-2 border border-[#E2E8F0] rounded-xl text-xs bg-[#F8FAFC] text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] focus:bg-white transition-all shadow-xs"
            placeholder="Search reports or tests..."
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#E2E8F0] text-[#64748B]">
              <Command className="w-2.5 h-2.5" />
              <span className="text-[10px] font-semibold">K</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-[#64748B] hover:text-[#172033] bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer shadow-xs">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 block w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
        </button>

      </div>
    </header>
  );
}
