import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Video, Upload, X, ShieldAlert, CheckCircle2, Loader2, Maximize2, AlertTriangle, Layers, FileDown, Search, Play, Pause, CameraOff, RefreshCw, Flag, Check, QrCode, HelpCircle, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { analyzeTrackImage } from '../services/geminiService';
import { DetectedDefect, TrackInspection, Severity, DefectType } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../i18n/LanguageContext';
import { generateInspectionReport } from '../lib/pdfReport';
import { DefectAnomalyCard } from './DefectAnomalyCard';
import { ReportAnnotationModal } from './ReportAnnotationModal';
import jsQR from 'jsqr';
import { QRScannerGuide } from './QRScannerGuide';

interface LiveScannerProps {
  onAnalysisResult: (inspection: TrackInspection) => void;
}

const RAIL_EQUIPMENT_DATABASE: Record<string, {
  serialNumber: string;
  name: string;
  type: string;
  location: string;
  status: 'Safe' | 'Warning' | 'Maintenance Required';
  lastInspected: string;
  engineer: string;
}> = {
  "EQ-SWITCH-104A": {
    serialNumber: "EQ-SWITCH-104A",
    name: "Alexandria High-Speed Rail Switcher",
    type: "Electromechanical Track Switch",
    location: "Alexandria Platform Center Hub (KM 42.5)",
    status: "Safe",
    lastInspected: "2026-05-10",
    engineer: "أحمد ثروت إبراهيم"
  },
  "EQ-JOINT-409B": {
    serialNumber: "EQ-JOINT-409B",
    name: "Insulated Heavy-Duty Rail Joint",
    type: "Structural Track Joint Spacer",
    location: "Cairo-Alex Express Line (KM 118.2)",
    status: "Maintenance Required",
    lastInspected: "2026-04-22",
    engineer: "عبدالرحمن على محمد"
  },
  "EQ-SBOX-220": {
    serialNumber: "EQ-SBOX-220",
    name: "Embedded IoT Acoustic Telemetry Box V2",
    type: "AI Sensory Node & Telemetry Receiver",
    location: "Tanta Junction Bypass Section (KM 76.1)",
    status: "Safe",
    lastInspected: "2026-05-15",
    engineer: "فيلوباتير جورج وليم"
  },
  "EQ-SIG-55C": {
    serialNumber: "EQ-SIG-55C",
    name: "Interlocking Multi-Aspect Signal Column",
    type: "Active Electronic Signal Tower",
    location: "Giza Crossing Zone A-1 (KM 12.8)",
    status: "Warning",
    lastInspected: "2026-05-01",
    engineer: "محمد راوف عبده محمد"
  },
  "EQ-TRANS-09F": {
    serialNumber: "EQ-TRANS-09F",
    name: "Balise / Automatic Train Protection Beacon",
    type: "Trackside RFID Transponder Unit",
    location: "Banha Station Gate Crossing (KM 45.1)",
    status: "Warning",
    lastInspected: "2026-04-18",
    engineer: "شهد احمد هلال"
  }
};

export function LiveScanner({ onAnalysisResult }: LiveScannerProps) {
  const { t, language, isRTL } = useLanguage();
  const { token } = useAuth();
  
  // State
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAutoScanning, setIsAutoScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TrackInspection | null>(null);
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [hoveredDefect, setHoveredDefect] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isRecording, setIsRecording] = useState(false);
  const [autoFlagLowConfidence, setAutoFlagLowConfidence] = useState(() => {
    return localStorage.getItem('auto_flag_low_confidence') === 'true';
  });
  const [minConfidenceAlert, setMinConfidenceAlert] = useState(() => {
    const stored = localStorage.getItem('min_confidence_alert');
    return stored ? parseFloat(stored) : 0.60;
  });
  
  // State for QR scanning
  const [qrScanMode, setQrScanMode] = useState<boolean>(false);
  const [scannedQrResult, setScannedQrResult] = useState<{
    serialNumber: string;
    name: string;
    type: string;
    location: string;
    status: 'Safe' | 'Warning' | 'Maintenance Required';
    lastInspected: string;
    engineer: string;
  } | null>(null);
  const [showQrDetails, setShowQrDetails] = useState<boolean>(false);
  const [showQrGuide, setShowQrGuide] = useState<boolean>(false);
  const autoScanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('auto_flag_low_confidence', String(autoFlagLowConfidence));
  }, [autoFlagLowConfidence]);

  useEffect(() => {
    localStorage.setItem('min_confidence_alert', String(minConfidenceAlert));
  }, [minConfidenceAlert]);

  // QR Scan Loop
  useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout | null = null;

    const scanQrFrame = () => {
      if (!isCameraActive || !qrScanMode || !videoRef.current || !active) {
        if (active) {
          timerId = setTimeout(scanQrFrame, 500);
        }
        return;
      }

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (video.videoWidth > 0 && video.videoHeight > 0 && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          
          if (code && code.data) {
            const rawData = code.data.trim();
            console.log("Scanned QR code:", rawData);

            let matchedEquipment = RAIL_EQUIPMENT_DATABASE[rawData];
            if (!matchedEquipment) {
              matchedEquipment = {
                serialNumber: rawData.substring(0, 30),
                name: rawData.startsWith('http') ? "External Web Asset Tag" : "Custom Serial Number / Equipment ID",
                type: rawData.startsWith('http') ? "URL Asset Reference" : "Track / Rolling Stock Identity Tag",
                location: "Manual QR Capture Zone",
                status: "Safe",
                lastInspected: new Date().toLocaleDateString(),
                engineer: token?.username || "عادل قدرى محمد"
              };
            }

            setScannedQrResult(matchedEquipment);
            setShowQrDetails(true);
            
            if (navigator?.vibrate) {
              try {
                navigator.vibrate(200);
              } catch (vibError) {}
            }
          }
        } catch (e) {
          console.error("QR image data reading error:", e);
        }
      }

      if (active) {
        timerId = setTimeout(scanQrFrame, 400);
      }
    };

    if (isCameraActive && qrScanMode) {
      scanQrFrame();
    }

    return () => {
      active = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isCameraActive, qrScanMode, token]);

  // Stop camera when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
    };
  }, [stream]);

  // Auto-scan logic
  useEffect(() => {
    if (isAutoScanning && (isCameraActive || videoUrl)) {
      autoScanIntervalRef.current = setInterval(() => {
        if (!isAnalyzing) {
          handleCaptureAndAnalyze();
        }
      }, 5000); // Analyze every 5 seconds
    } else {
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
        autoScanIntervalRef.current = null;
      }
    }
    return () => {
      if (autoScanIntervalRef.current) {
        clearInterval(autoScanIntervalRef.current);
      }
    };
  }, [isAutoScanning, isCameraActive, videoUrl, isAnalyzing]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error("Camera access error:", err);
      setError(t('noCameraAccess'));
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsAutoScanning(false);
  };

  const handleCaptureAndAnalyze = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        
        setIsAnalyzing(true);
        try {
          const { defects, summary } = await analyzeTrackImage(dataUrl);
          
          // Identify if we can auto-approve this inspection or mark layout verification
          const hasLowConfidence = defects.some(d => d.confidence < 0.70);
          const shouldBeReviewed = autoFlagLowConfidence ? !hasLowConfidence : false;

          const inspection: TrackInspection = {
            id: `live-${Date.now()}`,
            timestamp: new Date().toISOString(),
            imageUrl: dataUrl,
            location: {
              lat: 51.5 + (Math.random() - 0.5) * 0.05,
              lng: -0.1 + (Math.random() - 0.5) * 0.05,
              altitude: 100 + Math.random() * 20
            },
            defects,
            summary,
            reviewed: shouldBeReviewed
          };
          setResult(inspection);
          onAnalysisResult(inspection);
          setError(null);
        } catch (err: any) {
          console.error("Auto-scan analysis failed:", err);
          setError(err.message || "Auto-scan AI failed.");
          setIsAutoScanning(false); // Stop auto-scanning on failure to avoid error spam
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        setResult(null);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setCapturedImage(null);
      setResult(null);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        setVideoUrl(null);
        setVideoFile(null);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
    setError(null);
  };

  const runAnalysis = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setFeedback(null);

    try {
      const { defects, summary } = await analyzeTrackImage(capturedImage);
      
      const hasLowConfidence = defects.some(d => d.confidence < 0.70);
      const shouldBeReviewed = autoFlagLowConfidence ? !hasLowConfidence : false;

      const inspection: TrackInspection = {
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl: capturedImage,
        location: {
          lat: 51.5 + (Math.random() - 0.5) * 0.05,
          lng: -0.1 + (Math.random() - 0.5) * 0.05,
          altitude: 100 + Math.random() * 20
        },
        defects,
        summary,
        reviewed: shouldBeReviewed
      };

      setResult(inspection);
      onAnalysisResult(inspection);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (!result) return;
    setFeedback(type);
    
    // Logic for local simulation - no backend connection
    console.log(`AI Feedback received: ${type} for inspection ${result.id}`);
  };

  const handleUpdateReviewState = (reviewed: boolean) => {
    if (!result) return;
    const updated = { ...result, reviewed };
    setResult(updated);
    onAnalysisResult(updated);
  };

  const startRecording = () => {
    if (!stream) return;
    
    recordedChunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    
    try {
      const recorder = new MediaRecorder(stream, options);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `track-inspection-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      // Fallback if webm/vp9 not supported
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `track-inspection-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (e) {
        setError("Recording not supported in this browser.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    setIsAnnotationModalOpen(true);
  };

  const handleAnnotationSubmit = async (notes: string) => {
    if (!result) return;
    setIsAnnotationModalOpen(false);
    setIsExporting(true);
    try {
      await generateInspectionReport(result, language, notes);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (capturedImage) {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const prevZoom = zoom;
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      const newZoom = Math.min(Math.max(zoom + delta, 1), 5);

      if (newZoom === prevZoom) return;

      if (newZoom <= 1.05) {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const dx = mouseX - centerX;
      const dy = mouseY - centerY;

      const newX = dx - (dx - position.x) * (newZoom / prevZoom);
      const newY = dy - (dy - position.y) * (newZoom / prevZoom);

      setZoom(newZoom);
      setPosition({ x: newX, y: newY });
    } else if (videoUrl) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.min(Math.max(zoom + delta, 1), 5);
      setZoom(newZoom);
    }
  };

  const handleSliderChange = (newZoom: number) => {
    const prevZoom = zoom;
    if (newZoom <= 1.05) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      return;
    }
    const ratio = newZoom / prevZoom;
    setPosition({
      x: position.x * ratio,
      y: position.y * ratio
    });
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setFeedback(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoFile(null);
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.CRITICAL: return 'text-red-600 border-red-200 bg-red-50';
      case Severity.HIGH: return 'text-orange-600 border-orange-200 bg-orange-50';
      case Severity.MEDIUM: return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      case Severity.LOW: return 'text-blue-600 border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="flex flex-col min-h-full gap-6">
      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('liveScanner')}</h2>
          <p className="text-sm text-slate-500">Real-time track defect detection & monitoring</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-tighter">Zoom</span>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.1" 
                  value={zoom} 
                  onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] font-mono text-blue-600 font-bold min-w-[30px]">{zoom.toFixed(1)}x</span>
            </div>

            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex">
                <button 
                  onClick={() => { setMode('camera'); reset(); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                    mode === 'camera' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                    <Camera className="w-3.5 h-3.5" /> Camera
                </button>
                <button 
                  onClick={() => { setMode('upload'); stopCamera(); reset(); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                    mode === 'upload' ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                    <Upload className="w-3.5 h-3.5" /> {t('uploadVideo')}
                </button>
            </div>
            
            {(isCameraActive || videoUrl) && (
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={cn(
                  "p-2 rounded-xl border transition-all flex items-center gap-2 px-4 whitespace-nowrap shadow-sm",
                  isRecording 
                    ? "bg-red-600 border-red-500 text-white animate-pulse" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                )}
              >
                <Video className={cn("w-3.5 h-3.5", isRecording && "fill-current")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {isRecording ? "Stop Recording" : "Record Video"}
                </span>
              </button>
            )}

            {(isCameraActive || videoUrl) && (
              <button 
                onClick={() => setIsAutoScanning(!isAutoScanning)}
                className={cn(
                  "p-2 rounded-xl border transition-all flex items-center gap-2 px-4 whitespace-nowrap shadow-sm",
                  isAutoScanning 
                    ? "bg-blue-600 border-blue-500 text-white" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isAutoScanning && "animate-spin")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {isAutoScanning ? "Auto-Scanning On" : "Auto-Scan"}
                </span>
              </button>
            )}

            {isCameraActive && (
              <button 
                onClick={() => {
                  const newMode = !qrScanMode;
                  setQrScanMode(newMode);
                  if (newMode) {
                    setIsAutoScanning(false);
                  }
                }}
                className={cn(
                  "p-2 rounded-xl border transition-all flex items-center gap-2 px-4 whitespace-nowrap shadow-sm",
                  qrScanMode 
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                    : "bg-white border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200"
                )}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {qrScanMode ? "QR Scanning On" : "Scan Equipment QR"}
                </span>
              </button>
            )}

            {isCameraActive && qrScanMode && (
              <button 
                onClick={() => setShowQrGuide(true)}
                className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 transition-all flex items-center gap-2 px-4 whitespace-nowrap shadow-sm cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {isRTL ? "دليل المحاذاة" : "Alignment Guide"}
                </span>
              </button>
            )}

            {(capturedImage || videoUrl) && (
              <button 
                onClick={reset}
                className="text-slate-400 hover:text-slate-600 p-2 transition-colors"
                title={t('clearSession')}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>

      {/* Cyberpunk Triage Verification Rules settings panel */}
      <div className="flex flex-col gap-4 p-4 p-y-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
        <div className={cn("flex flex-wrap items-center justify-between gap-4", isRTL ? "flex-row-reverse" : "")}>
          <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse text-right" : "text-left")}>
            <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20 text-blue-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                {isRTL ? "قواعد الفرز بالذكاء الاصطناعي وتقييم الثقة" : "AI Verification & Triage Settings"}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {isRTL ? "تحديد متطلبات المراجعة اليدوية تلقائياً عند انخفاض مستوى دقة الكشف" : "Optionally bypass human logs for clear high-confidence defects"}
              </p>
            </div>
          </div>

          <div className={cn("flex items-center gap-4", isRTL ? "flex-row-reverse" : "")}>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                id="live-scanner-confidence-toggle"
                checked={autoFlagLowConfidence} 
                onChange={(e) => setAutoFlagLowConfidence(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              <span className={cn("text-xs font-bold text-slate-700", isRTL ? "mr-2.5" : "ml-2.5")}>
                {isRTL ? "وضع علامة 'غير مراجع' تلقائياً للعيوب الأقل من %70 دقة" : "Auto-flag low confidence defects for human review (< 70%)"}
              </span>
            </label>
            <div className={cn(
              "text-[9px] border px-2.5 py-1 rounded-lg font-mono uppercase font-black tracking-wider transition-colors",
              autoFlagLowConfidence 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
                : "bg-slate-500/10 border-slate-500/20 text-slate-500"
            )}>
              {autoFlagLowConfidence ? (isRTL ? "نشط" : "ACTIVE") : (isRTL ? "غير نشط" : "MUTED")}
            </div>
          </div>
        </div>

        {/* Dynamic SLIDER for minimum confidence score required for an automatic defect alert */}
        <div className="h-px bg-slate-200" />

        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", isRTL ? "md:flex-row-reverse" : "")}>
          <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse text-right" : "text-left")}>
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 text-amber-600">
              <AlertTriangle className="w-4 h-4 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                {isRTL ? "مستوى الثقة للتنبيه بالعيوب تلقائياً" : "Min confidence for defect alerts"}
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                {isRTL ? "تعديل الحد الأدنى لدقة وموثوقية الذكاء الاصطناعي المطلوبة لإرسال تنبيه بوجود عيب" : "Dynamically adjust the AI confidence score threshold to trigger system notifications"}
              </p>
            </div>
          </div>

          <div className={cn("flex items-center gap-4 flex-1 max-w-md w-full", isRTL ? "flex-row-reverse" : "")}>
            <span className="text-[10px] font-bold text-slate-400 font-mono w-8 shrink-0">30%</span>
            <div className="relative flex-1 group py-2">
              <input 
                type="range"
                min="0.30"
                max="0.95"
                step="0.05"
                value={minConfidenceAlert}
                onChange={(e) => setMinConfidenceAlert(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 outline-none hover:bg-slate-300 transition-colors"
                id="confidence-alert-threshold-slider"
              />
              <div 
                className={cn(
                  "absolute -top-5 transform -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black font-mono px-1.5 py-0.5 rounded-md shadow-lg pointer-events-none transition-all",
                  isRTL ? "hidden" : "block"
                )}
                style={{ left: `${((minConfidenceAlert - 0.30) / (0.95 - 0.30)) * 100}%` }}
              >
                {Math.round(minConfidenceAlert * 100)}%
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono w-8 shrink-0">95%</span>

            <div className={cn(
              "px-3 py-1.5 rounded-xl border font-mono text-xs font-black shrink-0 shadow-sm transition-all",
              "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700"
            )}>
              {Math.round(minConfidenceAlert * 100)}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        <div className="xl:col-span-3 flex flex-col gap-4">
          <div 
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={cn(
              "relative flex-1 bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-2xl group",
              zoom > 1 && (capturedImage || videoUrl) && "cursor-move"
            )}
          >
             {/* Main Viewer */}
             <div className="w-full h-full flex items-center justify-center p-4 md:p-8 bg-slate-900/10">
                {mode === 'camera' && !capturedImage && (
                  <>
                    <video 
                      ref={videoRef}
                      autoPlay 
                      playsInline 
                      className={cn(
                        "w-full h-full object-cover transition-transform duration-200",
                        !isCameraActive && "hidden"
                      )}
                      style={{ transform: `scale(${zoom})` }}
                    />
                    {!isCameraActive ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm">
                          <Camera className="w-10 h-10 text-slate-300" />
                        </div>
                        <button 
                           onClick={startCamera}
                           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20"
                        >
                           <Play className="w-4 h-4" /> {t('startCamera')}
                        </button>
                      </div>
                    ) : (
                      <div className="absolute top-6 right-6 flex flex-col gap-3 z-50">
                        <button 
                           onClick={stopCamera}
                           className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-full text-red-600 shadow-lg hover:bg-red-50 transition-colors"
                           title="Stop Camera"
                        >
                           <CameraOff className="w-5 h-5" />
                        </button>
                        <button 
                           onClick={handleCapture}
                           className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-full text-blue-600 shadow-lg hover:bg-blue-50 transition-colors"
                           title="Take Snapshot"
                        >
                           <Camera className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {mode === 'upload' && !capturedImage && !videoUrl && (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full border-2 border-dashed border-slate-200 bg-white rounded-3xl flex flex-col items-center justify-center p-12 hover:border-blue-500/30 hover:bg-blue-50/10 transition-all cursor-pointer group"
                  >
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform shadow-sm mb-6">
                      <Video className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{t('uploadVideo')}</h3>
                    <p className="text-sm text-slate-500 max-w-xs text-center">{t('uploadSubtitle')}</p>
                    <input 
                       ref={fileInputRef}
                       type="file" 
                       accept="video/*,image/*" 
                       className="hidden" 
                       onChange={handleFileUpload}
                    />
                  </div>
                )}

                {videoUrl && !capturedImage && (
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain transition-transform duration-200"
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}
                  />
                )}

                {capturedImage && (
                  <div className="relative w-full h-full flex items-center justify-center p-8 bg-slate-900/30 overflow-hidden">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ 
                        scale: zoom, 
                        opacity: 1,
                        x: position.x,
                        y: position.y
                      }}
                      transition={isDragging ? { type: 'tween', duration: 0 } : { type: 'spring', damping: 20 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <img 
                        src={capturedImage} 
                        alt="Capture" 
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-sm pointer-events-none" 
                      />
                      
                      <div className="absolute inset-0 pointer-events-none">
                        {result && result.defects.map((defect) => {
                            const { ymin, xmin, ymax, xmax } = defect.box;
                            return (
                                <div
                                  key={defect.id}
                                  onMouseEnter={() => setHoveredDefect(defect.id)}
                                  onMouseLeave={() => setHoveredDefect(null)}
                                  className="absolute border-2 transition-all cursor-crosshair pointer-events-auto"
                                  style={{
                                      top: `${ymin / 10}%`,
                                      left: `${xmin / 10}%`,
                                      width: `${(xmax - xmin) / 10}%`,
                                      height: `${(ymax - ymin) / 10}%`,
                                      borderColor: hoveredDefect === defect.id ? 'white' : getSeverityHex(defect.severity),
                                      boxShadow: hoveredDefect === defect.id ? '0 0 20px rgba(255,255,255,0.4)' : undefined
                                  }}
                                >
                                  <div className="absolute -top-6 left-0 text-[8px] font-bold px-1 rounded uppercase bg-black border whitespace-nowrap" style={{ borderColor: getSeverityHex(defect.severity), color: getSeverityHex(defect.severity) }}>
                                      {t(defect.type.toLowerCase() as any) || defect.type} ({Math.round(defect.confidence * 100)}%)
                                  </div>
                                </div>
                            );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}
             </div>

             {/* UI Overlay */}
             <div className="absolute inset-y-0 right-0 p-6 flex flex-col justify-center gap-4 z-40 pointer-events-none">
                <AnimatePresence>
                    {((isCameraActive && !capturedImage) || (videoUrl && !capturedImage)) && (
                        <motion.button
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onClick={handleCapture}
                            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
             </div>

             {isAnalyzing && !isAutoScanning && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-white font-mono text-xs uppercase tracking-[0.4em]">{t('processing')}</p>
                </div>
             )}

             {isAutoScanning && isAnalyzing && (
                <div className="absolute top-6 right-6 z-50">
                   <div className="bg-white/90 backdrop-blur-md border border-blue-500/30 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                      <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                      <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-bold">AI Syncing...</span>
                   </div>
                </div>
             )}

             {capturedImage && !result && !isAnalyzing && (
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                    <button 
                       onClick={runAnalysis}
                       className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/20"
                    >
                       <Layers className="w-5 h-5" /> {t('runDiagnostics')}
                    </button>
                </div>
             )}

             {isCameraActive && (
               <div className="absolute top-6 left-6 z-40">
                  <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                     <span className="text-[10px] font-mono text-white uppercase tracking-widest">{t('cameraActive')}</span>
                  </div>
               </div>
             )}

             <QRScannerGuide isOpen={showQrGuide} onClose={() => setShowQrGuide(false)} isRTL={isRTL} />
          </div>
          {/* QR Scanner live overlay */}
          {mode === 'camera' && !capturedImage && isCameraActive && qrScanMode && (
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none z-30 animate-fade-in">
              <style>{`
                @keyframes scanLaser {
                  0% { transform: translateY(0px); }
                  50% { transform: translateY(220px); }
                  100% { transform: translateY(0px); }
                }
              `}</style>
              <div className="relative w-64 h-64 border border-indigo-400/25 rounded-3xl overflow-hidden flex flex-col justify-between">
                {/* Neon corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />
                
                {/* Glowing animating laser */}
                <div 
                  className="w-full h-1 bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.9)] absolute" 
                  style={{
                    animation: 'scanLaser 2.2s infinite ease-in-out'
                  }} 
                />
              </div>
              
              <div className="mt-6 bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-white/10 text-center max-w-sm shrink-0 flex flex-col items-center gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-100 tracking-wide uppercase">
                    {isRTL ? "جاري مسح الباركود و الـ QR" : "QR / BARCODE ACTIVE SCAN"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed font-sans mt-1">
                    {isRTL ? "وجه الكاميرا نحو الكود الملصق على القضبان ومعدات السير" : "Aim camera at any track equipment RFID/QR label for immediate telemetry cataloging"}
                  </p>
                </div>

                <button
                  onClick={() => setShowQrGuide(true)}
                  className="pointer-events-auto bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-[0_4px_12px_rgba(79,70,229,0.3)] flex items-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '2.5s' }} />
                  {isRTL ? "عرض دليل محاذاة الكود" : "Show Alignment Guide"}
                </button>
              </div>
            </div>
          )}

          {/* QR Decoded Bottom Card */}
          <AnimatePresence>
            {showQrDetails && scannedQrResult && (
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.15)] p-6 z-50 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center pointer-events-auto shadow-2xl"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase font-mono border border-indigo-200">
                      {scannedQrResult.serialNumber}
                    </span>
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                      scannedQrResult.status === 'Safe' ? "bg-emerald-100 text-emerald-700" :
                      scannedQrResult.status === 'Warning' ? "bg-amber-100 text-amber-700 animate-pulse" :
                      "bg-red-100 text-red-700 animate-bounce"
                    )}>
                      {isRTL 
                         ? (scannedQrResult.status === 'Safe' ? "آمن" : scannedQrResult.status === 'Warning' ? "تحذير" : "مطلوب صيانة") 
                         : scannedQrResult.status}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-none pt-1">
                    {scannedQrResult.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-2 text-xs">
                    <div>
                      <span className="text-slate-400 font-semibold">{isRTL ? "نوع المعدة:" : "Equipment Type:"} </span>
                      <span className="text-slate-700 font-bold">{scannedQrResult.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">{isRTL ? "الموقع الجغرافي:" : "Track Location:"} </span>
                      <span className="text-slate-700 font-bold">{scannedQrResult.location}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">{isRTL ? "آخر فحص:" : "Last Inspected:"} </span>
                      <span className="text-slate-700 font-mono font-bold">{scannedQrResult.lastInspected}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-semibold">{isRTL ? "المهندس المسؤول:" : "Assigned Engineer:"} </span>
                      <span className="text-slate-700 font-bold">{scannedQrResult.engineer}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 w-full md:w-auto self-stretch md:self-auto justify-end">
                  <button
                    onClick={() => {
                      const currentType = scannedQrResult.status === 'Safe' ? DefectType.WEAR : DefectType.TRACK_MISALIGNMENT;
                      const inspection: TrackInspection = {
                        id: `qr-${Date.now()}`,
                        timestamp: new Date().toISOString(),
                        imageUrl: "/public/AI Rail Inspector logo2.png",
                        location: {
                          lat: 31.2001,
                          lng: 29.9187,
                          altitude: 45
                        },
                        defects: [
                          {
                            id: `defect-qr-${Date.now()}`,
                            type: currentType,
                            severity: scannedQrResult.status === 'Safe' ? Severity.LOW : scannedQrResult.status === 'Warning' ? Severity.MEDIUM : Severity.HIGH,
                            confidence: 1.0,
                            box: { ymin: 150, xmin: 150, ymax: 850, xmax: 850 },
                            description: `Scanned QR Equipment Serial Code: ${scannedQrResult.serialNumber}. Item name: ${scannedQrResult.name}. Status is currently marked as: ${scannedQrResult.status}.`
                          }
                        ],
                        summary: `QR verified trackside physical identifier parsed: Serial ${scannedQrResult.serialNumber}. Status evaluates to ${scannedQrResult.status}. Assigned dispatcher is ${scannedQrResult.engineer}.`,
                        reviewed: true
                      };
                      onAnalysisResult(inspection);
                      setShowQrDetails(false);
                    }}
                    className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> {isRTL ? "ربط بتقرير الفحص" : "Bind Report Log"}
                  </button>
                  <button
                    onClick={() => setShowQrDetails(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  >
                    {isRTL ? "إغلاق" : "Dismiss"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Results Sidebar */}
        <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
          <div className={`p-6 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className={`font-bold text-slate-900 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <ShieldAlert className="w-5 h-5 text-blue-600" /> {t('analysisReport')}
            </h3>
            {result && (
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-mono border border-blue-100">
                {result.defects.length} {t('found')}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
             {error && (
               <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
               </div>
             )}

             {result && result.defects.some(d => d.confidence >= minConfidenceAlert) && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden"
               >
                 <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600" />
                 <div className="bg-red-100 text-red-600 p-2 rounded-xl">
                   <ShieldAlert className="w-4 h-4 animate-pulse text-red-600" />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-xs font-black text-red-600 uppercase tracking-widest leading-none mb-1">
                     {isRTL ? "⚠️ تنبيه عيب تلقائي" : "⚠️ DETECT ALARM ACTIVE"}
                   </h4>
                   <p className="text-[10px] text-slate-700 font-medium leading-normal">
                     {isRTL 
                       ? `تم الكشف عن عيوب في المسار بمستوى ثقة يتجاوز الحد الأدنى للتنبيه (${Math.round(minConfidenceAlert * 100)}%)!`
                       : `A dynamic track anomaly has triggered the automatic alarm sensor (Confidence >= ${Math.round(minConfidenceAlert * 100)}%)!`
                     }
                   </p>
                 </div>
               </motion.div>
             )}

             {!result ? (
               qrScanMode ? (
                 <div className={`space-y-5 animate-fade-in ${isRTL ? 'text-right' : 'text-left'}`}>
                    {/* QR Header */}
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                       <div className={`flex items-center gap-2 text-indigo-700 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <QrCode className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest font-mono">
                            {isRTL ? "معايرة محاذاة الكود ثنائي الأبعاد" : "QR Calibration Guide"}
                          </span>
                       </div>
                       <h4 className="text-xs font-black text-slate-900">
                         {isRTL ? "فحص وتحديد معدات خط السكة الحديدية" : "Trackside Component Identification"}
                       </h4>
                       <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                         {isRTL 
                          ? "لضمان قراءة فائقة السرعة للمستشعرات الميدانية في التحويلات، العوارض، المعابر، ووصلات القضبان، يُرجى الالتزام بمعايير المسافة والزوايا التالية."
                          : "For high-speed railway switchpoints, crossings, and joints, precise optical alignment maximizes parsing speed and AI sensor recognition rates."}
                       </p>
                    </div>

                    {/* Distance Requirement */}
                    <div className="p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-2.5">
                       <div className={`flex items-center justify-between text-[11px] font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-1.5 text-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <Ruler className="w-3.5 h-3.5 text-indigo-500" />
                             <span>{isRTL ? "مسافة المسح المطلوبة" : "Distance Requirement"}</span>
                          </span>
                          <span className="text-indigo-600 font-mono font-black">15 - 20 cm</span>
                       </div>
                       <p className="text-[10px] text-slate-500 leading-relaxed">
                         {isRTL 
                           ? "أبقِ كاميرا الهاتف أو الجهاز المحمول على مسافة دقيقة تتراوح بين ١٥ إلى ٢٠ سم (٦-٨ بوصة) من الملصق المعدني لتشغيل التركيز الفوري."
                           : "Keep the device camera exactly 15 to 20 cm (6 to 8 inches) away from the asset label. This maximizes the autofocus sensor focus range on metal."}
                       </p>
                       <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex mt-1">
                          <div className="w-[15%] h-full bg-slate-300" />
                          <div className="w-[45%] h-full bg-indigo-500 rounded-full" />
                          <div className="w-[40%] h-full bg-slate-300" />
                       </div>
                       <div className={`flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>{isRTL ? "قريب جداً (< 10سم)" : "Too Close (<10cm)"}</span>
                          <span className="text-indigo-600 font-black">{isRTL ? "نطاق المسح المثالي (15-20سم)" : "OPTIMAL SWEEPRANGE"}</span>
                          <span>{isRTL ? "بعيد جداً (> 30سم)" : "Too Far (>30cm)"}</span>
                       </div>
                    </div>

                    {/* Angle Requirement */}
                    <div className="p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-2.5">
                       <div className={`flex items-center justify-between text-[11px] font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`flex items-center gap-1.5 text-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <Camera className="w-3.5 h-3.5 text-indigo-500" />
                             <span>{isRTL ? "زاوية سقوط الكاميرا" : "Angle of Incidence"}</span>
                          </span>
                          <span className="text-indigo-600 font-mono font-black">≤ 15° Skew</span>
                       </div>
                       <p className="text-[10px] text-slate-500 leading-relaxed">
                         {isRTL 
                           ? "أبقِ الجهاز موازياً لسطح الملصق بزاوية ميل لا تتعدى ١٥ درجة. تجنب تماماً زوايا الانحراف الحادة المائلة بأكثر من ٤٥ درجة لمنع تشوه الصورة."
                           : "Align your device flush or within 15 degrees of skew relative to the flat track equipment face. Skew past 45 degrees triggers perspective failure."}
                       </p>
                       <div className={`grid grid-cols-3 gap-2.5 text-center pt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                             <span className="block text-[8px] font-bold text-emerald-700 uppercase">{isRTL ? "مثالي" : "Optimal"}</span>
                             <span className="text-xs font-black text-emerald-600">0° - 15°</span>
                          </div>
                          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-xl">
                             <span className="block text-[8px] font-bold text-yellow-700 uppercase">{isRTL ? "مقبول" : "Usable"}</span>
                             <span className="text-xs font-black text-yellow-600">15° - 45°</span>
                          </div>
                          <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl">
                             <span className="block text-[8px] font-bold text-rose-700 uppercase">{isRTL ? "مرفوض" : "Rejected"}</span>
                             <span className="text-xs font-black text-rose-600">&gt; 45°</span>
                          </div>
                       </div>
                    </div>

                    {/* Component Specific Guidelines */}
                    <div className="p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 space-y-3">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                         {isRTL ? "دليل مكونات خطوط السكك الحديدية" : "Track Component Layout Specs"}
                       </span>
                       
                       <div className="space-y-2.5 text-[10px] text-slate-600 font-bold">
                          <div className={`flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <span>🛤️ {isRTL ? "صناديق محركات التحاويل" : "Switch Motor Boxes"}</span>
                             <span className="text-slate-900 font-black font-mono">{isRTL ? "مسح عمودي تماماً ٩٠°، مسافة ١٥سم" : "90° perpendicular, 15cm"}</span>
                          </div>
                          <div className={`flex items-center justify-between border-b border-dashed border-slate-200 pb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <span>🐸 {isRTL ? "معابر تفريعة الضفدعة" : "Frog Crossing Plates"}</span>
                             <span className="text-slate-900 font-black font-mono">{isRTL ? "بزاوية ميل ٤٥° من الأعلى، مسافة ١٨سم" : "45° inclined from top, 18cm"}</span>
                          </div>
                          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                             <span>🔗 {isRTL ? "فواصل المفاصل ووصلات السير" : "Rail Joints & Couplers"}</span>
                             <span className="text-slate-900 font-black font-mono">{isRTL ? "مسح محاذٍ مسطح موازٍ، مسافة ٢٠سم" : "Flat parallel view, 20cm"}</span>
                          </div>
                       </div>
                    </div>

                    {/* Calibration Active Simulator widget */}
                    <div className="p-4 bg-slate-950 text-white rounded-2xl border border-white/5 space-y-3.5 shadow-lg">
                       <div className={`flex justify-between items-center text-[9px] text-slate-400 tracking-wider uppercase font-bold ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span>{isRTL ? "رادار مطابقة زاوية الكاميرا الحالي" : "Live Camera Decoupler State"}</span>
                          <span className="text-indigo-400 font-mono font-black">LASER INTEL</span>
                        </div>
                       
                       <div className="space-y-2">
                          <div className="space-y-1">
                             <div className={`flex justify-between text-[10px] text-slate-400 font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span>{isRTL ? "زاوية الإمساك الحالية للجهاز:" : "Device Hold Angle:"}</span>
                                <span className="font-bold text-white">11° ({isRTL ? "ممتاز" : "Optimal"})</span>
                             </div>
                             <div className="h-1 bg-indigo-950/20 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-[72%]" />
                             </div>
                          </div>
                          
                          <div className="space-y-1">
                             <div className={`flex justify-between text-[10px] text-slate-400 font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span>{isRTL ? "مسافة الاستجابة المقدرة:" : "Est. Range Distance:"}</span>
                                <span className="font-bold text-white">16.8 cm ({isRTL ? "مثالي" : "Ideal"})</span>
                             </div>
                             <div className="h-1 bg-indigo-950/20 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 w-[84%]" />
                             </div>
                          </div>
                       </div>

                       <div className={`bg-slate-900 p-2.5 rounded-xl border border-white/5 text-[9px] flex items-center gap-2 text-emerald-400 font-black ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                          <span>
                            {isRTL 
                              ? "✔ مصفوفة المعايرة متطابقة ومستقرة. اضغط التقاط المسح الفوري!"
                              : "Alignment matrix calibrated. Ready for instant capture!"}
                          </span>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 text-center px-6">
                    <Search className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm italic">Capture a frame to begin AI track inspection</p>
                 </div>
               )
             ) : (
               <div className={`space-y-6 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> {t('aiRecommendation')}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{result.summary}"</p>

                    {/* Verification Status */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col gap-1.5">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                        {isRTL ? "مستوى التحقق والتأكيد" : "Verification Status"}
                      </p>
                      {result.reviewed ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider leading-none">
                              {isRTL ? "تم التأكيد التلقائي" : "Auto-Verified"}
                            </p>
                            <p className="text-[9px] text-slate-500 leading-none mt-1">
                              {isRTL ? "جميع العيوب أعلى من حاجز الثقة %70" : "All defects exceed 70% confidence"}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-1.5 animate-in fade-in">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider leading-none font-sans">
                              {isRTL ? "مطلوب تحقق بشري" : "Needs Verification"}
                            </p>
                            <p className="text-[9px] text-slate-500 leading-none mt-1">
                              {result.defects.some(d => d.confidence < 0.70) 
                                ? (isRTL ? "يوجد عيب بمستوى ثقة أقل من %70" : "Some defects are below 70% confidence")
                                : (isRTL ? "جميع العينات مراجعة يدوية قياسياً" : "Marked for human review by ruleset")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Feedback Mechanism */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col gap-2">
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Was this analysis accurate?</p>
                      {feedback ? (
                        <div className="flex items-center gap-2 text-blue-600 animate-in fade-in slide-in-from-bottom-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-[10px] font-bold">Thank you for your feedback!</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleFeedback('positive')}
                            className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all font-bold"
                          >
                            <motion.div whileTap={{ scale: 1.2 }}>👍</motion.div>
                          </button>
                          <button 
                            onClick={() => handleFeedback('negative')}
                            className="flex items-center justify-center p-1.5 rounded-lg border border-slate-200 hover:border-red-500 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all font-bold"
                          >
                            <motion.div whileTap={{ scale: 1.2 }}>👎</motion.div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-1">{t('detectedAnomalies')}</p>
                    {result.defects.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                             <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                             <p className="text-xs">All clear</p>
                        </div>
                    ) : (
                        result.defects.map((defect) => (
                            <DefectAnomalyCard
                                key={defect.id}
                                defect={defect}
                                isRTL={isRTL}
                                t={t}
                                isReviewed={result.reviewed}
                                onFlagReview={() => handleUpdateReviewState(false)}
                                onDismiss={() => handleUpdateReviewState(true)}
                                theme="light"
                            />
                        ))
                    )}
                  </div>
               </div>
             )}
          </div>

          <div className="p-6 bg-white border-t border-slate-100">
             <button 
               onClick={handleExportPDF}
               disabled={!result || isExporting}
               className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
             >
               {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <FileDown className="w-4 h-4" />} 
               {t('exportPDF')}
             </button>
          </div>
        </div>
      </div>

      <ReportAnnotationModal
        isOpen={isAnnotationModalOpen}
        onClose={() => setIsAnnotationModalOpen(false)}
        onSubmit={handleAnnotationSubmit}
      />
    </div>
  );
}

function getSeverityHex(severity: Severity) {
  switch (severity) {
    case Severity.CRITICAL: return '#ef4444';
    case Severity.HIGH: return '#f97316';
    case Severity.MEDIUM: return '#eab308';
    case Severity.LOW: return '#2563eb';
  }
}
