import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DetectedDefect, Severity, DefectType } from '../types';
import { cn } from '../lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Copy, 
  Check, 
  Flag, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

export function getMockSensorData(defectType: DefectType, defectId: string, confidence: number) {
  const baseHash = defectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offset = (baseHash % 100) / 100;

  switch (defectType) {
    case DefectType.CRACK:
      return {
        sensor_type: "Ultrasonic Acoustic Pulse Flaw Detector",
        signal_to_noise_ratio_db: (32 + offset * 12).toFixed(1) + " dB",
        crack_depth_mm: (2.4 + offset * 18.5).toFixed(1) + " mm",
        ultrasonic_frequency: "5.0 MHz",
        crack_orientation_degrees: Math.round(15 + offset * 150) + "°",
        propagation_risk_index: (confidence * 9.8).toFixed(1) + " / 10",
        material_density_g_cm3: (7.8 + offset * 0.1).toFixed(2) + " g/cm³"
      };
    case DefectType.EROSION:
      return {
        sensor_type: "Ground Penetrating Radar (GPR) & LiDAR Profile",
        sub_ballast_void_ratio: (12.4 + offset * 24.1).toFixed(1) + "%",
        dielectric_constant: (6.2 + offset * 4.1).toFixed(1),
        gpr_frequency_range: "400 MHz",
        lateral_ballast_slope_deg: (22 + offset * 18).toFixed(1) + "°",
        moisture_saturation_percentage: (45 + offset * 50).toFixed(0) + "%",
        structural_support_capacity_mpa: (85 - offset * 45).toFixed(1) + " MPa"
      };
    case DefectType.MISSING_BOLT:
      return {
        sensor_type: "Optical Machine Vision & Smart Fasteners Proximity",
        fastener_plate_tension_kn: (0.1 + offset * 5.0).toFixed(1) + " kN (Expected: 60 kN)",
        inductive_proximity_voltage: (0.12 + offset * 0.45).toFixed(3) + " V (Target: 4.80 V)",
        pixel_misalignment_offset_px: (14 + offset * 86).toFixed(0) + " px",
        joint_clamping_force_loss: (99.8 - offset * 12).toFixed(1) + "%",
        adjacent_vibration_amplitude_g: (1.2 + offset * 3.4).toFixed(2) + " g"
      };
    case DefectType.WEAR:
      return {
        sensor_type: "Laser Profilometer & Gauge Measurement Probe",
        vertical_rail_wear_mm: (1.5 + offset * 14.2).toFixed(1) + " mm",
        gauge_deviation_mm: (-4.5 + offset * 22).toFixed(1) + " mm",
        lateral_head_wear_mm: (0.8 + offset * 11.4).toFixed(1) + " mm",
        contact_surface_roughness_um: (12.4 + offset * 48).toFixed(1) + " μm",
        cant_angle_alignment_deg: (-0.4 + offset * 2.8).toFixed(2) + "°"
      };
    case DefectType.VEGETATION:
      return {
        sensor_type: "Multispectral Infrared NDVI Canopy Profiler",
        canopy_encroachment_index: (offset * 1.0).toFixed(2) + " NDVI",
        vegetation_height_m: (0.2 + offset * 2.8).toFixed(1) + " m",
        clearance_violation_distance_mm: Math.round(150 + offset * 1450) + " mm",
        moisture_index: (35 + offset * 55).toFixed(0) + "%",
        estimated_biomass_density_kg_m2: (0.4 + offset * 3.2).toFixed(2) + " kg/m²"
      };
    case DefectType.CORROSION:
      return {
        sensor_type: "Infrared Thermography & Eddy Current Sensor Array",
        metal_loss_percentage: (5.4 + offset * 42.5).toFixed(1) + "%",
        corrosion_rate_mm_year: (0.05 + offset * 0.85).toFixed(3) + " mm/yr",
        eddy_current_impedance_ohms: (12.4 + offset * 85).toFixed(1) + " Ω",
        thermal_differential_kelvin: (0.2 + offset * 5.4).toFixed(1) + " K",
        oxide_layer_thickness_um: Math.round(45 + offset * 450) + " μm"
      };
    case DefectType.TRACK_MISALIGNMENT:
      return {
        sensor_type: "Dual-Axis Inertial Measurement Unit (IMU) & Gyroscope",
        lateral_offset_shift_mm: (2.4 + offset * 32.5).toFixed(1) + " mm",
        vertical_track_settlement_mm: (1.2 + offset * 24).toFixed(1) + " mm",
        gyro_cant_rate_deg_sec: (0.05 + offset * 1.85).toFixed(3) + "°/s",
        twist_irregularity_percentage: (4.2 + offset * 18.2).toFixed(1) + "%",
        ballast_retention_pressure_kpa: (120 - offset * 80).toFixed(0) + " kPa"
      };
    case DefectType.DEBRIS:
    default:
      return {
        sensor_type: "LiDAR Spatial Rangefinder & Stereoscopic Obstacle Engine",
        obstacle_volume_dm3: (0.2 + offset * 148).toFixed(1) + " dm³",
        pixel_fill_percentage: (12 + offset * 74).toFixed(0) + "%",
        minimum_safe_passing_distance_mm: Math.round(50 + offset * 850) + " mm",
        object_reflectivity_albedo: (0.12 + offset * 0.65).toFixed(2),
        estimated_mass_kg: (0.1 + offset * 125).toFixed(1) + " kg"
      };
  }
}

export interface DefectAnomalyCardProps {
  key?: React.Key;
  defect: DetectedDefect;
  isRTL: boolean;
  t: (key: string) => string;
  isReviewed?: boolean;
  onFlagReview?: () => void;
  onDismiss?: () => void;
  theme?: 'light' | 'dark';
}

export function DefectAnomalyCard({
  defect,
  isRTL,
  t,
  isReviewed = false,
  onFlagReview,
  onDismiss,
  theme = 'dark'
}: DefectAnomalyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const rawData = getMockSensorData(defect.type, defect.id, defect.confidence);

  const getSeverityHex = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return '#f43f5e';
      case Severity.HIGH: return '#f59e0b';
      case Severity.MEDIUM: return '#eab308';
      case Severity.LOW: return '#3b82f6';
    }
  };

  const getSeverityColorClasses = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL:
        return theme === 'dark' 
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
          : 'bg-rose-50 border-rose-200 text-rose-700';
      case Severity.HIGH:
        return theme === 'dark' 
          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
          : 'bg-amber-50 border-amber-200 text-amber-700';
      case Severity.MEDIUM:
        return theme === 'dark' 
          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
          : 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case Severity.LOW:
      default:
        return theme === 'dark' 
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
          : 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getConfidenceLevelClasses = (conf: number) => {
    if (conf >= 0.85) {
      return theme === 'dark'
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        : "bg-emerald-50 border-emerald-250 text-emerald-700";
    } else if (conf >= 0.65) {
      return theme === 'dark'
        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
        : "bg-amber-50 border-amber-200 text-amber-700";
    } else {
      return theme === 'dark'
        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
        : "bg-rose-50 border-rose-200 text-rose-700";
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.2 }}
      className={cn(
        "defect-anomaly-card relative rounded-2xl border transition-all duration-300 shadow-md group overflow-hidden select-none",
        theme === 'dark'
          ? "bg-slate-950/40 border-white/5 text-slate-100"
          : "bg-white border-slate-100 text-slate-800",
        isExpanded ? "ring-1" : ""
      )}
      style={{
        borderColor: isHovered || isExpanded ? getSeverityHex(defect.severity) : undefined,
        boxShadow: isHovered || isExpanded ? `0 10px 30px ${getSeverityHex(defect.severity)}12` : undefined,
        ringColor: getSeverityHex(defect.severity)
      }}
    >
      {/* Visual background accents for technical aesthetic */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none rounded-full blur-2xl"
        style={{ backgroundColor: getSeverityHex(defect.severity) }}
      />

      {/* Main Trigger Header Area */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer flex flex-col gap-3"
      >
        <div className={cn("flex items-start justify-between gap-3", isRTL ? "flex-row-reverse" : "")}>
          <div className={cn("flex items-start gap-3", isRTL ? "flex-row-reverse text-right" : "text-left")}>
            <div 
              className={cn("p-2 rounded-xl border shrink-0 flex items-center justify-center transition-transform duration-500", 
                isExpanded ? "rotate-90 scale-105" : "",
                theme === 'dark' ? 'bg-zinc-900/50 border-white/10' : 'bg-slate-50 border-slate-200'
              )}
              style={{ color: getSeverityHex(defect.severity) }}
            >
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className={cn("text-xs font-black uppercase tracking-wider", 
                theme === 'dark' ? "text-white" : "text-slate-900"
              )}>
                {t(defect.type.toLowerCase().replace(/_/g, '') as any) || defect.type.replace(/_/g, ' ')}
              </h4>
              <p className={cn("text-[10px] sm:text-xs mt-1 leading-relaxed font-semibold",
                theme === 'dark' ? "text-slate-400" : "text-slate-500"
              )}>
                {defect.description}
              </p>
            </div>
          </div>

          <div className={cn("flex flex-col items-end gap-1.5 shrink-0", isRTL ? "items-start" : "items-end")}>
            <span className={cn("px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border leading-none", getSeverityColorClasses(defect.severity))}>
              {t(defect.severity.toLowerCase() as any)}
            </span>
            <div className={cn("flex items-center gap-1 text-[10px] font-mono font-extrabold leading-none", 
              theme === 'dark' ? "text-blue-400" : "text-blue-600"
            )}>
              <span>{Math.round(defect.confidence * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Action Button Strip & State Disclosure Toggle */}
        <div className={cn("flex items-center justify-between border-t border-dashed pt-3 mt-1", 
          theme === 'dark' ? "border-white/5" : "border-slate-100",
          isRTL ? "flex-row-reverse" : ""
        )}>
          {/* Action Row */}
          <div className={cn("flex gap-2", isRTL ? "flex-row-reverse" : "")}>
            {onFlagReview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFlagReview();
                }}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border shadow-xs leading-none",
                  !isReviewed
                    ? "bg-amber-500/10 border-amber-500/25 text-amber-500 cursor-default"
                    : theme === 'dark'
                      ? "bg-white/5 border-white/10 hover:border-amber-500/30 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 active:scale-95"
                      : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-500 hover:text-amber-600 active:scale-95"
                )}
              >
                <Flag className="w-2.5 h-2.5" />
                <span>{isRTL ? "طلب مراجعة" : "Flag for Review"}</span>
              </button>
            )}

            {onDismiss && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                type="button"
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border shadow-xs leading-none",
                  isReviewed
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500 cursor-default"
                    : theme === 'dark'
                      ? "bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 active:scale-95"
                      : "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 active:scale-95"
                )}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>{isRTL ? "تجاهل" : "Dismiss"}</span>
              </button>
            )}
          </div>

          {/* Interactive Collapse Button */}
          <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors", 
            isRTL ? "flex-row-reverse" : ""
          )}>
            <span className="text-[9px] hidden sm:inline">
              {isExpanded 
                ? (isRTL ? "إخفاء الحساس" : "Mute Sensors") 
                : (isRTL ? "قراءة الحساس" : "Read Sensors")}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: getSeverityHex(defect.severity) }} />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Sensor Data Sub-Panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn("border-t overflow-hidden font-mono text-[10px]", 
              theme === 'dark' ? "border-white/5 bg-slate-950/80" : "border-slate-100 bg-slate-50/50"
            )}
          >
            <div className="p-4 flex flex-col gap-3">
              {/* Terminal Title & Copy Button */}
              <div className="flex items-center justify-between pb-2 border-b border-dashed border-white/5">
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 tracking-wider">
                  <Cpu className="w-3 h-3 text-blue-500" />
                  <span>METADATA_STREAM_INTEGRATED.JSON</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/20 active:scale-95 transition-all font-sans font-bold text-[8.5px]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 uppercase tracking-widest">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" />
                      <span className="uppercase tracking-widest">COPY DATA</span>
                    </>
                  )}
                </button>
              </div>

              {/* JSON code representation formatted elegantly */}
              <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-left overflow-x-auto max-h-[160px] custom-scrollbar selection:bg-blue-500/40">
                <pre className="leading-relaxed">
                  <span className="text-slate-500">{'{'}</span>
                  <br />
                  {Object.entries(rawData).map(([key, value], idx, arr) => (
                    <span key={key} className="block pl-4">
                      <span className="text-cyan-400">"{key}"</span>
                      <span className="text-slate-400">: </span>
                      {typeof value === 'number' ? (
                        <span className="text-yellow-400">{value}</span>
                      ) : (
                        <span className="text-emerald-400">"{value}"</span>
                      )}
                      {idx < arr.length - 1 && <span className="text-slate-500">,</span>}
                    </span>
                  ))}
                  <span className="text-slate-500">{'}'}</span>
                </pre>
              </div>

              {/* Integrity status alert footer */}
              <div className={cn("p-2 rounded-xl flex items-center gap-2.5 border", 
                theme === 'dark' ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-100",
                isRTL ? "flex-row-reverse text-right" : "text-left"
              )}>
                <AlertTriangle className="w-3.5 h-3.5" style={{ color: getSeverityHex(defect.severity) }} />
                <span className={cn("text-[9px] font-black uppercase tracking-wider leading-none",
                  theme === 'dark' ? "text-slate-400" : "text-slate-500"
                )}>
                  {isRTL 
                    ? "تحليل الحساس يدعم تصنيف النموذج وموثوقية المعايرة الفنية." 
                    : "Sensor calibration validates the detected classifier state parameters."}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
