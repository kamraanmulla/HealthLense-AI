import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, ArrowRight, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onUpload: () => void;
}

export default function UploadZone({ onFileSelect, selectedFile, onUpload }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div
        {...getRootProps()}
        className={`
          w-full max-w-2xl mx-auto rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group
          border-2 border-dashed
          ${isDragActive
            ? 'border-emerald-500 bg-emerald-50/70 shadow-[0_0_40px_rgba(16,185,129,0.2)] scale-[1.01]'
            : 'border-slate-300 hover:border-emerald-500/70 bg-white/80 hover:bg-slate-50/80 shadow-card hover:shadow-card-hover'
          }
        `}
      >
        {/* Subtle grid and ambient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-teal-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Futuristic scanning ray when active or hover */}
        <div className="absolute inset-x-0 -top-1 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <input {...getInputProps()} />
        <motion.div
          className="flex flex-col items-center justify-center gap-6 relative z-10"
          animate={{ y: isDragActive ? -6 : 0, scale: isDragActive ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 350 }}
        >
          <div className="relative">
            <div className={`absolute -inset-4 rounded-full blur-xl opacity-60 transition-all duration-500 ${isDragActive ? 'bg-emerald-400/40' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'}`} />
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border ${isDragActive ? 'bg-emerald-100/80 text-emerald-700 border-emerald-300' : 'bg-white text-slate-400 border-slate-200 group-hover:text-emerald-600 group-hover:border-emerald-200 group-hover:shadow-md'}`}>
              <UploadCloud className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight mb-2">
              {isDragActive ? "Release to begin clinical analysis" : "Drop medical report here"}
            </p>
            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
              Drag & drop lab results, blood tests, or diagnostic panels, or click to browse
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600" /> PDF Reports
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> JPG / PNG Scans
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> Max 10 MB
            </span>
          </div>
        </motion.div>
      </div>

      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-2xl mx-auto p-3 pl-6 rounded-2xl border border-emerald-200 bg-white shadow-card flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 py-1 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[220px] sm:max-w-xs">{selectedFile.name}</p>
              <p className="text-xs font-semibold text-slate-400 tracking-wide mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for parsing
              </p>
            </div>
          </div>

          <button
            onClick={onUpload}
            className="btn-primary rounded-xl px-7 py-3 w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 shadow-emerald-500/20"
          >
            <span>Run Neural OCR</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Security note */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          HIPAA-compliant document handling
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Multi-layer deterministic validation
        </span>
      </div>
    </div>
  );
}
