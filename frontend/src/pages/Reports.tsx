import { useState } from 'react';
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

  const { data, isLoading } = useQuery({
    queryKey: ['reports', page, search, statusFilter],
    queryFn: () => reportsApi.list(page, 10, statusFilter || undefined, search || undefined),
    placeholderData: (prev) => prev,
  });

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-bold text-[#16A34A] uppercase tracking-wider block mb-1">
            Clinical Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Medical Health Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            View, review, and track past laboratory analyses and physiological parameters.
          </p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary shrink-0 self-start md:self-auto text-xs py-2.5 px-4 shadow-xs">
          Upload New Report <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>

      <GlassCard className="p-4 sm:p-6 bg-white border border-[#E2E8F0] shadow-sm">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <input 
              type="text" 
              placeholder="Search reports by filename..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] focus:bg-white transition-all"
            />
          </div>
          <div className="relative w-full sm:w-52">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-[#94A3B8]" />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 appearance-none bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#172033] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] focus:bg-white transition-all"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-2.5">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-16 skeleton w-full rounded-xl" />
                ))}
              </div>
            ) : data?.data.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-[#94A3B8]" />
                </div>
                <h3 className="text-sm font-bold text-[#172033] mb-1">No medical reports found</h3>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  {search ? 'No reports match your search query.' : 'Upload your first laboratory report to get started.'}
                </p>
                <button onClick={() => navigate('/upload')} className="mt-4 btn-primary text-xs py-2 px-3">
                  Upload Report
                </button>
              </div>
            ) : (
              <div>
                {data?.data.map((report) => (
                  <motion.div 
                    key={report.id}
                    onClick={() => report.status === 'completed' && navigate(`/reports/${report.id}`)}
                    className={`group rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5 transition-all duration-150 ${
                      report.status === 'completed' 
                        ? 'bg-white hover:bg-[#F8FAFC] hover:border-[#CBD5E1] cursor-pointer shadow-2xs' 
                        : 'bg-[#F8FAFC] opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${
                        report.status === 'completed' 
                          ? 'bg-[#F0FDF4] border-[#DCFCE7] text-[#16A34A]' 
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#172033] truncate group-hover:text-[#16A34A] transition-colors">
                          {report.original_filename}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                          <span>{format(new Date(report.created_at), 'MMM d, yyyy')}</span>
                          <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                          <span className="uppercase">{report.file_type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <StatusBadge status={report.status} />
                      
                      {report.status === 'completed' && (
                        <>
                          {report.health_score !== null && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-xs font-bold text-[#15803D]">
                              <Activity className="w-3.5 h-3.5 text-[#16A34A]" />
                              <span>{report.health_score}</span>
                            </div>
                          )}
                          <RiskBadge level={report.risk_level || 'UNKNOWN'} />
                          <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all hidden sm:block" />
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
          <div className="mt-6 flex items-center justify-between border-t border-[#F1F5F9] pt-4 text-xs text-[#64748B]">
            <p>
              Showing <span className="font-semibold text-[#172033]">{((data.meta.page - 1) * data.meta.per_page) + 1}</span> to <span className="font-semibold text-[#172033]">{Math.min(data.meta.page * data.meta.per_page, data.meta.total)}</span> of <span className="font-semibold text-[#172033]">{data.meta.total}</span> reports
            </p>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
                disabled={page === data.meta.pages}
                className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </PageTransition>
  );
}
