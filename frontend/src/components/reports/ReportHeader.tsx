import { ArrowLeft, Download, Trash2, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ReportHeaderProps {
  reportId: string;
  filename: string;
  createdAt: string;
  onDelete: () => void;
  onExport: () => void;
}

export default function ReportHeader({ filename, createdAt, onDelete, onExport }: ReportHeaderProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
    >
      <div className="flex items-start gap-3.5">
        <button 
          onClick={() => navigate('/reports')}
          className="p-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#172033] hover:bg-[#F8FAFC] transition-colors mt-0.5 cursor-pointer shadow-2xs"
          aria-label="Back to reports"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] mb-2">
            <FileText className="w-3.5 h-3.5 text-[#16A34A]" />
            <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider">Clinical Lab Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight truncate max-w-sm md:max-w-xl">
            {filename}
          </h1>
          <div className="flex items-center gap-2 text-[#64748B] text-xs font-medium mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Uploaded & Analyzed on {format(new Date(createdAt), 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <button onClick={onExport} className="btn-primary text-xs py-2 px-3.5" aria-label="Export PDF">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Summary
        </button>
        <button 
          onClick={onDelete} 
          className="p-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer shadow-2xs"
          aria-label="Delete report"
          title="Delete Report"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
