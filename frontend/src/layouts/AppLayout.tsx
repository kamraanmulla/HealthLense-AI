import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import BackgroundEffects from '../components/layout/BackgroundEffects';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#172033] overflow-hidden">
      {/* Soft Ambient Background */}
      <BackgroundEffects />
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <TopBar />
        
        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
