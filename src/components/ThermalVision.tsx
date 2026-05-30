import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Flame, 
  Compass, 
  Layers, 
  Sliders, 
  Thermometer, 
  Info, 
  Zap,
  Activity,
  Heart
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function ThermalVision() {
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [colorFilter, setColorFilter] = useState<'ironbow' | 'rainbow' | 'hotblack'>('ironbow');
  const [anomalyTemperature, setAnomalyTemperature] = useState(74.5); // °C
  const [scanningActive, setScanningActive] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calibration loading stage mimics thermal lens alignment
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 950);
    return () => clearTimeout(timer);
  }, []);

  // Animating a high-tech thermal track scan in standard HTML5 Canvas
  useEffect(() => {
    if (isLoading || !scanningActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frameShift = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;

      // Draw thermal background gradients
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (colorFilter === 'ironbow') {
        bgGrad.addColorStop(0, '#0d0d26'); // Dark purple
        bgGrad.addColorStop(0.5, '#2e114d'); // Purple magenta
        bgGrad.addColorStop(1, '#130421');
      } else if (colorFilter === 'rainbow') {
        bgGrad.addColorStop(0, '#000033'); // Indigo
        bgGrad.addColorStop(0.5, '#003300'); // Blue green
        bgGrad.addColorStop(1, '#110011');
      } else {
        bgGrad.addColorStop(0, '#0a0a0a'); // Ultra-dark gray
        bgGrad.addColorStop(1, '#222222');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw double standard railway lines in canvas
      const trackCenter = width / 2;
      const trackGauge = 110;
      const leftTrackX = trackCenter - trackGauge / 2;
      const rightTrackX = trackCenter + trackGauge / 2;

      // Vertical sleepers
      ctx.strokeStyle = colorFilter === 'ironbow' ? '#bf40bf22' : colorFilter === 'rainbow' ? '#00640033' : '#44444422';
      ctx.lineWidth = 14;
      for (let y = (frameShift % 40) - 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(leftTrackX - 30, y);
        ctx.lineTo(rightTrackX + 30, y);
        ctx.stroke();
      }

      // Live tracks
      const createTrackGradient = (x: number) => {
        const trackGrad = ctx.createLinearGradient(x - 10, 0, x + 10, 0);
        if (colorFilter === 'ironbow') {
          trackGrad.addColorStop(0, '#5a189a');
          trackGrad.addColorStop(0.3, '#ff9e00'); // Heat glow index 1
          trackGrad.addColorStop(0.5, '#ff0054'); // Heat blow index 2
          trackGrad.addColorStop(0.7, '#ffb703');
          trackGrad.addColorStop(1, '#3c096c');
        } else if (colorFilter === 'rainbow') {
          trackGrad.addColorStop(0, '#0000ff');
          trackGrad.addColorStop(0.4, '#00ff00');
          trackGrad.addColorStop(0.6, '#ffff00');
          trackGrad.addColorStop(1, '#ff0000');
        } else {
          trackGrad.addColorStop(0, '#333');
          trackGrad.addColorStop(0.5, '#fff');
          trackGrad.addColorStop(1, '#222');
        }
        return trackGrad;
      };

      ctx.lineWidth = 10;
      
      // Left track
      ctx.strokeStyle = createTrackGradient(leftTrackX);
      ctx.beginPath();
      ctx.moveTo(leftTrackX, 0);
      ctx.lineTo(leftTrackX, height);
      ctx.stroke();

      // Right track
      ctx.strokeStyle = createTrackGradient(rightTrackX);
      ctx.beginPath();
      ctx.moveTo(rightTrackX, 0);
      ctx.lineTo(rightTrackX, height);
      ctx.stroke();

      // CRITICAL Heat Anomaly Blob on right track
      const anomalyY = (height / 2) + Math.sin(frameShift * 0.05) * 30;
      const anomalyRadius = 35 + Math.sin(frameShift * 0.1) * 5;

      const radialGrad = ctx.createRadialGradient(rightTrackX, anomalyY, 2, rightTrackX, anomalyY, anomalyRadius);
      if (colorFilter === 'ironbow') {
        radialGrad.addColorStop(0, '#ffffff'); // Melting core
        radialGrad.addColorStop(0.2, '#fffb00'); // Extreme white-hot yellow
        radialGrad.addColorStop(0.5, '#ff4800'); // Orange glow
        radialGrad.addColorStop(0.8, '#ff0055'); // Magenta boundary
        radialGrad.addColorStop(1, '#00000000');
      } else if (colorFilter === 'rainbow') {
        radialGrad.addColorStop(0, '#ffffff');
        radialGrad.addColorStop(0.3, '#ff0000');
        radialGrad.addColorStop(0.6, '#ffaa00');
        radialGrad.addColorStop(1, '#00000000');
      } else {
        radialGrad.addColorStop(0, '#ffffff');
        radialGrad.addColorStop(0.5, '#777777');
        radialGrad.addColorStop(1, '#00000000');
      }
      
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(rightTrackX, anomalyY, anomalyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Static crosshair centering on anomaly
      ctx.strokeStyle = '#ef444499';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Horiz line
      ctx.moveTo(rightTrackX - 45, anomalyY);
      ctx.lineTo(rightTrackX + 45, anomalyY);
      // Vert line
      ctx.moveTo(rightTrackX, anomalyY - 45);
      ctx.lineTo(rightTrackX, anomalyY + 45);
      ctx.stroke();

      // Outer bounding tag
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillText(`ANOMALY: ${anomalyTemperature.toFixed(1)}°C`, rightTrackX + 18, anomalyY - 18);

      // Radar scanning horizontal line indicator
      const scannerY = (frameShift * 2) % height;
      ctx.strokeStyle = '#2563eb66';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scannerY);
      ctx.lineTo(width, scannerY);
      ctx.stroke();

      // Scanning HUD elements
      ctx.fillStyle = '#ffffff2a';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText("FLIR CAM TR-402 // SPECTRAL MODE: ACTIVE", 20, 30);
      ctx.fillText(`GPS SEC REF: 31.0409, 31.3785`, 20, 45);

      frameShift += 1.5;
      animationId = requestAnimationFrame(render);
    };

    render();

    // Heat wiggle randomizer
    const tempInterval = setInterval(() => {
      setAnomalyTemperature(prev => Number((prev + (Math.random() - 0.5) * 0.8).toFixed(1)));
    }, 800);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(tempInterval);
    };
  }, [isLoading, colorFilter, scanningActive]);

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </span>
            {isRTL ? 'نظام الرؤية الحرارية الاستباقي (Thermovision)' : 'AI FLIR Thermal Vision Lab'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'تحليل حراري فوري للأسطح الميكانيكية، لرصد الاحتكاك الزائد والنقاط الساخنة التي تسبق التصدعات.' 
              : 'Real-time thermal analysis, highlighting high-friction anomalies and critical heat distribution points.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScanningActive(!scanningActive)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold border cursor-pointer transition-all active:scale-95 ${
              scanningActive 
                ? 'bg-rose-600/10 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white' 
                : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            {scanningActive ? (isRTL ? 'إيقاف البث' : 'Freeze Stream') : (isRTL ? 'بدء البث الحراري' : 'Resume Feed')}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]" key="thermal-skeleton">
            <div className="lg:col-span-2 bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            key="thermal-ui"
          >
            {/* Left: Thermal Video Canvas Screen */}
            <div className="lg:col-span-2 bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold font-mono tracking-wider">FLIR MATRIX FEED // DIRECT INFRARED</span>
                </div>

                {/* Color Spectrum Filter Select */}
                <div className="flex bg-slate-900 border border-white/10 p-1 rounded-xl gap-1 text-[10px] font-bold">
                  <button 
                    onClick={() => setColorFilter('ironbow')} 
                    className={`px-2.5 py-1 rounded-lg ${colorFilter === 'ironbow' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
                  >
                    Ironbow
                  </button>
                  <button 
                    onClick={() => setColorFilter('rainbow')} 
                    className={`px-2.5 py-1 rounded-lg ${colorFilter === 'rainbow' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                  >
                    Rainbow
                  </button>
                  <button 
                    onClick={() => setColorFilter('hotblack')} 
                    className={`px-2.5 py-1 rounded-lg ${colorFilter === 'hotblack' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                  >
                    Hot-B
                  </button>
                </div>
              </div>

              {/* Dynamic Canvas Area */}
              <div className="flex-1 bg-black border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center relative min-h-[350px]">
                <canvas 
                  ref={canvasRef} 
                  width={560} 
                  height={380} 
                  className="w-full h-full object-cover rounded-xl"
                />

                {/* Hotspot flash widget */}
                <div className="absolute top-4 right-4 bg-red-600/35 border border-red-500 text-red-100 text-[9px] font-mono px-2 py-1 rounded-md animate-pulse">
                  HOTSPOT DETECTED
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-between text-xs text-slate-400 font-mono gap-2">
                <span>{isRTL ? 'معيار المسح: ISO 18434-1' : 'Diagnostic Standard: ISO 18434-1'}</span>
                <span>CALIBRATION: STABLE // DRIFT: 0.00%</span>
              </div>
            </div>

            {/* Right: Thermal Analytics Panel and gauges */}
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 mb-6">
                  <Thermometer className="w-4 h-4 text-rose-500" />
                  {isRTL ? 'قراءات وعدادات درجات الحرارة المكتشفة' : 'Telemetry Temperature Diagnostics'}
                </h3>

                {/* Thermometer Dial */}
                <div className="bg-[#05030c] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden mb-6">
                  <div className="w-28 h-28 rounded-full border-4 border-dashed border-rose-500/25 flex items-center justify-center text-center animate-spin-slow absolute" />
                  <div className="relative z-10">
                    <span className="text-4xl font-black font-mono text-rose-500">{anomalyTemperature.toFixed(1)}°C</span>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Peak Core Temp</p>
                  </div>
                </div>

                {/* Parameters lists */}
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-slate-300">{isRTL ? 'درجة الحرارة المحيطة' : 'Ambient Track Temp'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">28.4 °C</span>
                  </div>

                  <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-slate-300">{isRTL ? 'درجة الاحتكاك الهيكلي' : 'Friction Heat Index'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">4.82 µJ</span>
                  </div>

                  <div className="p-3.5 bg-slate-900/40 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-300">{isRTL ? 'درجة التدرج الحراري' : 'Thermal Gradient Rate'}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">+0.42 °C/min</span>
                  </div>
                </div>
              </div>

              {/* Informative Guidance */}
              <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex gap-3 mt-6">
                <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <p className="font-extrabold text-white">{isRTL ? 'توصيات الأمان الميكانيكي' : 'Friction Warning Thresholds'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 leading-normal">
                    {isRTL 
                      ? 'قراءات درجات الحرارة التي تتجاوز الـ 65 درجة مئوية تدق جرس الإنذار لاحتمال تصدع الفواصل الحديدية.' 
                      : 'Infrared readings exceeding 65.0°C represent severe structural friction. Field mechanics should inspect and apply thermal lubricant.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
