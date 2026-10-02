import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Eye,
  Download,
  Trash2,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Moon,
  Globe,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { authApi } from '../lib/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';

export default function Settings() {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    reportReady: true,
    healthAlerts: true,
    weeklyDigest: false,
    productUpdates: false,
  });

  const handleDeactivate = async () => {
    setDeleteLoading(true);
    try {
      await authApi.deactivate();
      logout();
    } catch {
      setDeleteLoading(false);
    }
  };

  const SettingRow = ({ icon: Icon, title, description, children, danger = false }: {
    icon: React.ElementType;
    title: string;
    description: string;
    children?: React.ReactNode;
    danger?: boolean;
  }) => (
    <div className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
      danger
        ? 'bg-rose-50/50 border-rose-200'
        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
    }`}>
      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${
        danger ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-bold font-display mb-0.5 ${danger ? 'text-rose-700' : 'text-slate-900'}`}>{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">{description}</p>
      </div>
      {children && <div className="shrink-0 self-center">{children}</div>}
    </div>
  );

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-emerald-600' : 'bg-slate-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>SYSTEM CONFIGURATION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Settings & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your clinical workspace preferences, telemetry notifications, and privacy encryption.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main settings content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Privacy & Data */}
          <div className="card-futuristic p-6 shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Privacy & Encryption
            </h2>
            <div className="space-y-3">
              <SettingRow
                icon={Lock}
                title="End-to-End Encryption"
                description="Diagnostic reports and physiological measurements are encrypted at rest and in transit."
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </SettingRow>
              <SettingRow
                icon={Eye}
                title="Strict Report Isolation"
                description="Your reports and biomarker models are private and accessible exclusively by your authenticated session."
              >
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Private
                </span>
              </SettingRow>
              <SettingRow
                icon={HardDrive}
                title="Data Storage"
                description="Reports and clinical embeddings are stored on secure local infrastructure."
              >
                <span className="text-xs font-bold font-mono text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100">Local OS</span>
              </SettingRow>
            </div>
          </div>

          {/* Notifications */}
          <div className="card-futuristic p-6 shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600" /> Clinical Notifications
            </h2>
            <div className="space-y-3">
              <SettingRow
                icon={CheckCircle2}
                title="Report Ingestion Alerts"
                description="Instant notification when document OCR and biomarker calibration completes."
              >
                <Toggle checked={notifications.reportReady} onChange={(v) => setNotifications(prev => ({ ...prev, reportReady: v }))} />
              </SettingRow>
              <SettingRow
                icon={AlertTriangle}
                title="Out-of-Range Biomarker Alerts"
                description="Highlight parameters exceeding standard biological reference bounds."
              >
                <Toggle checked={notifications.healthAlerts} onChange={(v) => setNotifications(prev => ({ ...prev, healthAlerts: v }))} />
              </SettingRow>
              <SettingRow
                icon={Globe}
                title="Weekly Trajectory Digest"
                description="Weekly synthesis of your health index trends and biomarker deltas."
              >
                <Toggle checked={notifications.weeklyDigest} onChange={(v) => setNotifications(prev => ({ ...prev, weeklyDigest: v }))} />
              </SettingRow>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card-futuristic p-6 border-rose-200/80 shadow-card">
            <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-5 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone
            </h2>
            <div className="space-y-3">
              <SettingRow
                icon={Trash2}
                title="Deactivate Account"
                description="Permanently delete your profile, clinical reports, and trajectory history. This action cannot be reversed."
                danger
              >
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Deactivate
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="btn-secondary text-xs py-2 px-3"
                      disabled={deleteLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeactivate}
                      disabled={deleteLoading}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                )}
              </SettingRow>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Info */}
          <div className="card-futuristic p-6 shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Account Profile</h2>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg font-bold text-white shadow-sm">
                {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold font-display text-slate-900 truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Session Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active Authenticated
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Member Since</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card-futuristic p-6 shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Navigation</h2>
            <div className="space-y-2">
              {[
                { label: 'Edit Health Profile', href: '/profile' },
                { label: 'View Clinical Reports', href: '/reports' },
                { label: 'Upload New Report', href: '/upload' },
                { label: 'Advanced Insights', href: '/insights' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="card-futuristic p-6 shadow-card">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform Telemetry</h2>
            <div className="space-y-2 text-xs text-slate-500">
              <p><strong className="text-slate-900 font-display">HealthLens AI OS</strong> • v2.5 Futuristic Edition</p>
              <p className="font-mono text-[11px] text-emerald-700">AI Model: Google Gemini 3.8 Flash</p>
              <p className="leading-relaxed mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Calibrated educational platform with strict clinical bounds. Not a substitute for licensed medical practice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
