import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BackgroundEffects from '../components/layout/BackgroundEffects';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
      mainRef.current.scrollLeft = 0;
    }
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#172033] overflow-hidden">
      {/* Soft Ambient Background */}
      <BackgroundEffects />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <TopBar onMenuToggle={() => setSidebarOpen(true)} />

        <main
          ref={mainRef}
          id="main-content"
          className="flex-1 overflow-y-auto"
        >
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
