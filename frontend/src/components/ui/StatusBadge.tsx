import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = (status || '').toLowerCase();

  if (normStatus === 'completed') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-medium text-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
        Completed
      </div>
    );
  }
  
  if (normStatus === 'processing' || normStatus === 'pending') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] font-medium text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0284C7]" />
        Processing
      </div>
    );
  }

  if (normStatus === 'failed') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] font-medium text-xs">
        <XCircle className="w-3.5 h-3.5" />
        Failed
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] font-medium text-xs">
      <Clock className="w-3.5 h-3.5" />
      {status}
    </div>
  );
}
