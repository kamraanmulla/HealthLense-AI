import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, Activity, ArrowRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { reportsApi } from '../lib/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import RiskBadge from '../components/ui/RiskBadge';
import StatusBadge from '../components/ui/StatusBadge';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Explicit scroll reset to top of page upon navigating to My Reports
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainContent = document.getElementById('main-content') || document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', page, search, statusFilter],
    queryFn: () => reportsApi.list(page, 10, statusFilter || undefined, search || undefined),
    placeholderData: (prev) => prev,
  });

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>CLINICAL ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Medical Health Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access past laboratory diagnostic panels, extracted parameters, and clinical trajectory models.
          </p>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary shrink-0 self-start md:self-auto text-xs py-2.5 px-4"
        >
          <span>Upload Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="card-futuristic p-4 sm:p-6 shadow-card">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search reports by filename or biomarker..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 appearance-none bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed Only</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-18 skeleton w-full rounded-2xl" />
                ))}
              </div>
            ) : data?.data.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-base font-bold font-display text-slate-900 mb-1">No medical reports found</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                  {search ? 'No reports match your search query.' : 'Upload your first laboratory report to begin health tracking.'}
                </p>
                <button onClick={() => navigate('/upload')} className="btn-primary text-xs py-2 px-4">
                  Upload Report
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {data?.data.map((report) => (
                  <motion.div
                    key={report.id}
                    onClick={() => report.status === 'completed' && navigate(`/reports/${report.id}`)}
                    className={`group rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 ${
                      report.status === 'completed'
                        ? 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-emerald-300 hover:shadow-card-hover cursor-pointer'
                        : 'bg-slate-50/60 border-slate-200 opacity-85'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                        report.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                          {report.original_filename}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{format(new Date(report.created_at), 'MMM d, yyyy • h:mm a')}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="uppercase font-mono text-[10px] tracking-wide font-bold">{report.file_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <StatusBadge status={report.status} />

                      {report.status === 'completed' && (
                        <>
                          {report.health_score !== null && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                              <Activity className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-mono">{report.health_score}</span>
                            </div>
                          )}
                          <RiskBadge level={report.risk_level || 'UNKNOWN'} />
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {data && data.meta.pages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p>
              Showing <span className="font-semibold text-slate-900">{((data.meta.page - 1) * data.meta.per_page) + 1}</span> to <span className="font-semibold text-slate-900">{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}</span> of <span className="font-semibold text-slate-900">{data.meta.total}</span> records
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
                disabled={page === data.meta.pages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
