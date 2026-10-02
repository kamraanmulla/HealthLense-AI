import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, FileText } from 'lucide-react';
import { reportsApi } from '../lib/api';
import { invalidateHealthQueries } from '../lib/queryClient';
import PageTransition from '../components/ui/PageTransition';
import UploadZone from '../components/upload/UploadZone';
import ProcessingStatus from '../components/upload/ProcessingStatus';
import UploadSuccess from '../components/upload/UploadSuccess';

type UploadState = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadState>('idle');
  const [reportId, setReportId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState<string>('Initializing document pipeline...');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setErrorMsg(null);
    setProgress(10);
    setStageText('Securely transmitting document to analysis cluster...');

    try {
      const res = await reportsApi.upload(file);
      setReportId(res.id);
      setStatus('processing');
      setProgress(15);
      setStageText('Document received. Initializing OCR pipeline...');
    } catch (err: any) {
      setStatus('error');
      const detail = err.response?.data?.detail;
      const httpStatus = err.response?.status;
      if (httpStatus === 415) {
        setErrorMsg('Unsupported file type. Please upload a PDF, PNG, or JPG file.');
      } else if (httpStatus === 413) {
        setErrorMsg('File is too large. Maximum size is 10 MB.');
      } else if (httpStatus === 401) {
        setErrorMsg('Your session has expired. Please log in again.');
      } else if (detail) {
        setErrorMsg(detail);
      } else {
        setErrorMsg('Unable to upload the report. Please check your connection and try again.');
      }
      setProgress(0);
    }
  };

  // Poll for status with timeout guard (max 3 minutes)
  useEffect(() => {
    if (status !== 'processing' || !reportId) return;

    let pollCount = 0;
    const MAX_POLLS = 90; // 90 × 2s = 3 minutes

    const interval = setInterval(async () => {
      pollCount++;
      if (pollCount > MAX_POLLS) {
        setStatus('error');
        setErrorMsg('Report analysis is taking longer than expected. Please check Reports page later.');
        clearInterval(interval);
        return;
      }

      try {
        const res = await reportsApi.status(reportId);
        if (res.status === 'completed') {
          setProgress(100);
          setStageText('Processing complete! Loading report archive...');
          setStatus('completed');
          clearInterval(interval);

          // Invalidate and trigger immediate refetch across all queries
          await invalidateHealthQueries();

          // Smooth redirect to My Reports page
          setTimeout(() => {
            navigate('/reports');
          }, 1400);
        } else if (res.status === 'failed') {
          setStatus('error');
          const backendError = res.error_message || '';
          if (backendError.toLowerCase().includes('ocr') || backendError.toLowerCase().includes('text extraction') || backendError.toLowerCase().includes('empty content') || backendError.toLowerCase().includes('tesseract')) {
            setErrorMsg('Report uploaded, but text extraction failed. The file may be unreadable, blank, or corrupted.');
          } else if (backendError.toLowerCase().includes('no medical parameters') || backendError.toLowerCase().includes('no parameters')) {
            setErrorMsg('Unable to extract medical parameters from this report. Please ensure it is a valid medical blood or laboratory test report.');
          } else {
            setErrorMsg(backendError || 'Report processing failed. Please try uploading again.');
          }
          clearInterval(interval);
        } else {
          // Dynamic backend progress
          if (typeof res.progress === 'number' && res.progress > 0) {
            setProgress(res.progress);
          } else {
            setProgress(prev => Math.min(prev + 5, 88));
          }
          if (res.processing_stage) {
            setStageText(res.processing_stage);
          }
        }
      } catch {
        // Ignore transient network errors during polling
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [status, reportId, navigate]);

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] px-4">

        {/* Header / Text section */}
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'error') && (
            <motion.div
              initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15, transition: { duration: 0.2 } }}
              className="text-center mb-10 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>NEURAL DOCUMENT INGESTION</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-800 font-bold">OCR v2.4</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 tracking-tight mb-4 leading-tight">
                Analyze your medical report
              </h1>
              <p className="text-slate-600 text-base sm:text-lg font-normal max-w-xl mx-auto">
                Securely extract clinical biomarkers, evaluate biological ranges, and generate personalized actionable insights in seconds.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full max-w-4xl relative">
          <AnimatePresence mode="wait">

            {/* Idle / Error State */}
            {(status === 'idle' || status === 'error') && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full"
              >
                <UploadZone
                  onFileSelect={(f) => { setFile(f); setStatus('idle'); setErrorMsg(null); }}
                  selectedFile={file}
                  onUpload={handleUpload}
                />

                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center gap-3 text-[#DC2626] max-w-md mx-auto"
                  >
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-bold text-sm">{errorMsg}</span>
                  </motion.div>
                )}

                {/* Security Trust Badges */}
                <div className="flex items-center justify-center gap-8 mt-12 opacity-50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">PDF / Image</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">End-to-End Encrypted</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Uploading / Processing State */}
            {(status === 'uploading' || status === 'processing') && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-2xl mx-auto"
              >
                <ProcessingStatus
                  progress={progress}
                  statusText={stageText}
                />
              </motion.div>
            )}

            {/* Completed State */}
            {status === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
                className="w-full max-w-2xl mx-auto"
              >
                <UploadSuccess reportId={reportId} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
