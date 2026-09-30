import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="skeleton w-32 h-32 rounded-full opacity-50"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // If user hasn't completed onboarding, redirect to /onboarding
  if (user && !user.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Onboarding (protected but outside AppLayout) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <AppLayout />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

