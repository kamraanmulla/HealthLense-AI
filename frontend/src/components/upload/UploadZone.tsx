import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';
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
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div 
        {...getRootProps()} 
        className={`
          w-full max-w-2xl mx-auto border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer transition-all duration-500 relative overflow-hidden group
          ${isDragActive 
            ? 'border-[#16A34A] bg-[#F0FDF4] shadow-[0_0_30px_rgba(22,163,74,0.1)]' 
            : 'border-[#CBD5E1] hover:border-[#16A34A]/60 bg-[#F8FAFC] hover:bg-[#F0FDF4]/50 shadow-sm'
          }
        `}
      >
        {/* Subtle hover gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#16A34A]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <input {...getInputProps()} />
        <motion.div 
          className="flex flex-col items-center justify-center gap-6 relative z-10"
          animate={{ y: isDragActive ? -10 : 0, scale: isDragActive ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="relative">
            <div className={`absolute inset-0 blur-xl opacity-40 transition-all duration-500 ${isDragActive ? 'bg-[#16A34A] scale-150' : 'bg-transparent'}`} />
            <div className={`p-5 rounded-2xl transition-all duration-500 shadow-sm ${isDragActive ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]' : 'bg-white text-[#94A3B8] border border-[#E2E8F0] group-hover:bg-[#F0FDF4] group-hover:text-[#16A34A] group-hover:border-[#BBF7D0]'}`}>
              <UploadCloud className="w-12 h-12" />
            </div>
          </div>
          
          <div>
            <p className="text-xl font-bold text-[#172033] tracking-tight mb-2">
              {isDragActive ? "Drop to upload..." : "Drag & drop your medical report"}
            </p>
            <p className="text-sm font-medium text-[#64748B]">
              or click to browse from your computer
            </p>
          </div>
        </motion.div>
      </div>

      {selectedFile && (
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="w-full max-w-2xl mx-auto p-2 pl-6 rounded-full border border-[#E2E8F0] bg-white shadow-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-4 py-2">
            <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033] truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
              <p className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-widest mt-0.5">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
              </p>
            </div>
          </div>
          
          <button onClick={onUpload} className="btn-primary rounded-full px-6 py-3 shrink-0">
            Analyze Report <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
