import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Cpu, 
  RotateCcw, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  Zap, 
  Layers, 
  Truck,
  Flame,
  Gauge
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export function LoadSimulator() {
  const { isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [trainWeight, setTrainWeight] = useState(120); // Metric Tons
  const [selectedDefect, setSelectedDefect] = useState('crack-medium');
  const [simulationResult, setSimulationResult] = useState<{
    passed: boolean;
    stressMpa: number;
    safetyFactor: number;
    displacementMm: number;
  } | null>(null);

  // Calibration sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      calculateStress(trainWeight, selectedDefect);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  const calculateStress = (weight: number, defect: string) => {
    // Basic dynamic stress simulator formula
    let defectMultiplier = 1.0;
    if (defect === 'crack-low') defectMultiplier = 1.25;
    if (defect === 'crack-medium') defectMultiplier = 1.85;
    if (defect === 'crack-critical') defectMultiplier = 3.20;
    if (defect === 'bolt-missing') defectMultiplier = 1.45;
    if (defect === 'wear-severe') defectMultiplier = 2.05;

    // Normal pressure: Weight * 9.81 / contact area
    const baseStress = (weight * 3.82);
    const stressMpa = Number((baseStress * defectMultiplier).toFixed(1));

    // Structural Yield Strength of track steel: roughly 450 MPa
    const yieldStrength = 410;
    const safetyFactor = Number((yieldStrength / stressMpa).toFixed(2));
    const passed = safetyFactor >= 1.2; // Require 1.2 safety factor to pass under load
    const displacementMm = Number(((stressMpa / yieldStrength) * 12.5).toFixed(2));

    setSimulationResult({
      passed,
      stressMpa,
      safetyFactor,
      displacementMm
    });
  };

  const handleWeightChange = (val: number) => {
    setTrainWeight(val);
    calculateStress(val, selectedDefect);
  };

  const handleDefectChange = (val: string) => {
    setSelectedDefect(val);
    calculateStress(trainWeight, val);
  };

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
              <Truck className="w-6 h-6 animate-bounce" />
            </span>
            {isRTL ? 'محاكي الأحمال الهيكلية وأوزان القطارات' : 'Railway Load & Stress Simulator'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'نمذجة تفاعلية لأحمال القطارات على القضبان المصابة بالعيوب للتأكد من قدرتها الهندسية على تحمل قوى الضغط.' 
              : 'Interactive stress modeling evaluating rail load resistance when compromised by structural anomalies.'}
          </p>
        </div>

        <button 
          onClick={() => {
            setTrainWeight(120);
            setSelectedDefect('crack-medium');
            calculateStress(120, 'crack-medium');
          }}
          className="flex items-center gap-2 bg-slate-900 border border-white/10 hover:border-yellow-500/40 text-xs px-4 py-2.5 rounded-2xl text-slate-400 hover:text-white transition-all outline-none"
        >
          <RotateCcw className="w-4 h-4" />
          {isRTL ? 'إعادة ضبط المحاكي' : 'Reset Simulator'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* Skeleton View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[480px]" key="load-skeleton">
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            key="load-content"
          >
            {/* Left Column: Interactive Inputs and anomalous track details */}
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 mb-6">
                  <Sliders className="w-4 h-4 text-yellow-500" />
                  {isRTL ? 'تعديل المعاملات والأوزان الميدانية' : 'Lock-In Simulation Variables'}
                </h3>

                {/* Train Weight Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-center text-xs font-mono mb-2">
                    <span className="text-slate-400">{isRTL ? 'وزن المقطورة الجرارة (الطن)' : 'Simulated locomotive weight (Metric Tons)'}</span>
                    <span className="text-yellow-400 font-extrabold text-sm">{trainWeight} Tons</span>
                  </div>
                  <input 
                    type="range"
                    min={20}
                    max={400}
                    step={10}
                    value={trainWeight}
                    onChange={(e) => handleWeightChange(Number(e.target.value))}
                    className="w-full accent-yellow-400 bg-slate-800 rounded-lg cursor-pointer h-2 focus:outline-none"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                    <span>20 T</span>
                    <span>120 T (Light Metro)</span>
                    <span>250 T (Cargo Train)</span>
                    <span>400 T</span>
                  </div>
                </div>

                {/* Defect severity selection */}
                <div className="mb-6">
                  <span className="text-xs text-slate-400 font-mono block mb-2">{isRTL ? 'نوع وحجم العيب في السبيكة' : 'Track Structural Defect Profile'}</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'none', label: isRTL ? 'قضيب حديدي سليم' : 'Intact flawless Rail', mult: 1.0 },
                      { id: 'bolt-missing', label: isRTL ? 'قفل ميكانيكي مفقود (Sleeper Bolt)' : 'Missing Joint Fastener Bolt', mult: 1.4 },
                      { id: 'crack-low', label: isRTL ? 'شرخ سطحي بسيط (Crack Micro)' : 'Microscope Hairline Crack', mult: 1.25 },
                      { id: 'crack-medium', label: isRTL ? 'شرخ بنيوي متوسط (Medium Crack)' : 'Subsurface Medium Crack', mult: 1.85 },
                      { id: 'crack-critical', label: isRTL ? 'انكسار بنيوي حرج (Crack Critical)' : 'Severe Transverse Crack', mult: 3.2 },
                      { id: 'wear-severe', label: isRTL ? 'تآكل وتجويف حرج للسطح' : 'Severe Friction Head wear', mult: 2.05 }
                    ].map(def => (
                      <button
                        key={def.id}
                        onClick={() => handleDefectChange(def.id)}
                        className={`text-left px-3 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex justify-between items-center ${
                          selectedDefect === def.id 
                            ? 'bg-yellow-500/10 border-yellow-500 text-white' 
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span className="truncate mr-1">{def.label}</span>
                        <span className="text-[8px] font-mono text-slate-500 shrink-0">x{def.mult}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Safety warning notification */}
              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-4 flex gap-3 mt-4">
                <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-300">
                  <p className="font-extrabold text-white">{isRTL ? 'توقعات انهيار المعادن' : 'Fatigue Limit Mechanics'}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {isRTL 
                      ? 'يؤدي الكراك الحرج لتركيز قوى الإجهاد الميكانيكية، مما يسرع الانكسار الفوري لبيانات السبائك الحديدية.' 
                      : 'Severe cracks amplify local shear-stress concentration, reducing the maximum supportable vehicle ton-load.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Physics outputs results Passed/Failed */}
            {simulationResult && (
              <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 mb-6">
                    <Activity className="w-4 h-4 text-yellow-500" />
                    {isRTL ? 'تحليل الإجهاد الهيكلي الناتج' : 'Locomotive Strain Stress Analysis'}
                  </h3>

                  {/* LARGE COMPLIANCE BADGE */}
                  <div className={`p-6 rounded-2xl border text-center transition-all ${
                    simulationResult.passed 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]' 
                      : 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] animate-pulse'
                  }`}>
                    <span className="text-3xl font-black font-display tracking-widest uppercase">
                      {simulationResult.passed ? (isRTL ? 'آمن / ناجح' : 'SUCCESS / PASSED') : (isRTL ? 'خطر / فشل' : 'STRUCTURAL FAILURE')}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">
                      {simulationResult.passed 
                        ? (isRTL ? 'المسار قادر هندسياً على تجاوز الـ load' : 'Rail safety threshold exceeds load stress factors')
                        : (isRTL ? 'القضبان عرضة للانكسار المفاجئ فوراً' : 'Stress factor exceeds steel elastic bounds - CRITICAL RUPTURE RISK')
                      }
                    </p>
                  </div>

                  {/* Stress Meters parameters grids */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'قوة الإجهاد' : 'STRESS'}</span>
                      <span className="text-xl font-bold font-mono text-white mt-2">{simulationResult.stressMpa} <span className="text-[9px] text-slate-400">MPa</span></span>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'معامل الأمان' : 'SAFETY F.'}</span>
                      <span className={`text-xl font-bold font-mono mt-2 ${simulationResult.passed ? 'text-emerald-400' : 'text-red-500'}`}>{simulationResult.safetyFactor}x</span>
                    </div>

                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">{isRTL ? 'الاهتزاز / الهبوط' : 'DEFLEX'}</span>
                      <span className="text-xl font-bold font-mono text-white mt-2">{simulationResult.displacementMm} <span className="text-[9px] text-slate-400">mm</span></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex flex-col gap-2 mt-6">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>Steel Yield Strength limit:</span>
                    <span>410.0 MPa</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${simulationResult.passed ? 'bg-emerald-500' : 'bg-red-500'}`} 
                      style={{ width: `${Math.min(100, (simulationResult.stressMpa / 410) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
