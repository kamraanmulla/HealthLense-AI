import { Link } from 'react-router-dom';
import { FileText, ChevronRight, UploadCloud } from 'lucide-react';
import type { DashboardRecentReport } from '../../types/api';

interface RecentReportsTableProps {
  reports?: DashboardRecentReport[];
}

export default function DashboardRecentReportsTable({ reports = [] }: RecentReportsTableProps) {
  const displayReports = reports.slice(0, 3);

  const getScoreBadgeColor = (score: number | null) => {
    if (!score) return 'bg-[#F1F5F9] text-[#64748B]';
    if (score >= 80) return 'bg-[#ECFDF5] text-[#10B981]';
    if (score >= 65) return 'bg-[#FFFBEB] text-[#D97706]';
    return 'bg-[#FEF2F2] text-[#EF4444]';
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-2xs h-full flex flex-col justify-between">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-base font-bold text-[#172B3A] tracking-tight">
          Recent Reports
        </h2>
        {displayReports.length > 0 && (
          <Link
            to="/reports"
            className="text-xs font-semibold text-[#10B981] hover:text-[#059669] transition-colors"
          >
            View All
          </Link>
        )}
      </div>

      {displayReports.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4">
          <div className="w-11 h-11 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-3">
            <FileText className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-[#172B3A]">No reports uploaded yet</p>
          <p className="text-[11px] text-[#64748B] mt-1 max-w-[240px]">
            Upload your first blood test, panel, or clinical report to view records here.
          </p>
          <Link
            to="/upload"
            className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#065F46] hover:bg-[#044e39] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Report
          </Link>
        </div>
      ) : (
        <>
          {/* Table Headers */}
          <div className="grid grid-cols-12 text-[11px] font-bold text-[#94A3B8] pb-2 border-b border-[#F1F5F9] px-2">
            <span className="col-span-5">Report Name</span>
            <span className="col-span-3 text-center">Date</span>
            <span className="col-span-2 text-center">Status</span>
            <span className="col-span-2 text-right">Health Score</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#F1F5F9] flex-1 flex flex-col justify-around">
            {displayReports.map((rpt) => (
              <Link
                key={rpt.id}
                to={`/reports/${rpt.id}`}
                className="grid grid-cols-12 items-center py-2.5 px-2 hover:bg-[#F8FAFC] rounded-xl transition-colors group cursor-pointer"
              >
                {/* Name */}
                <div className="col-span-5 flex items-center gap-2.5 min-w-0 pr-1">
                  <div className="w-7 h-7 rounded-lg bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                  <span className="text-xs font-bold text-[#172B3A] truncate group-hover:text-[#10B981] transition-colors">
                    {rpt.name}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-3 text-center">
                  <span className="text-xs font-medium text-[#64748B]">
                    {rpt.date}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2 text-center">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] rounded-md">
                    {rpt.status}
                  </span>
                </div>

                {/* Health Score + Chevron */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${getScoreBadgeColor(rpt.health_score)}`}>
                    {rpt.health_score ?? '-'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
