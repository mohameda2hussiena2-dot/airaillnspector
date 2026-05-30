import React, { useEffect, useState, useMemo } from 'react';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  InfoWindow, 
  useAdvancedMarkerRef,
  MapControl,
  ControlPosition,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'motion/react';
import { TrackInspection, Severity, DetectedDefect, DefectType } from '../types';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Wind, 
  Thermometer, 
  CloudFog, 
  CloudSnow,
  Maximize, 
  Minimize, 
  LocateFixed, 
  Eye, 
  MapPin,
  Flame,
  Layers,
  Sliders,
  Sparkles,
  Activity,
  Filter,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  X,
  Check
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const defectLabels: Record<DefectType, { en: string; ar: string }> = {
  [DefectType.CRACK]: { en: 'Cracks', ar: 'شقوق وتصدعات' },
  [DefectType.EROSION]: { en: 'Erosion', ar: 'تآكل التربة' },
  [DefectType.MISSING_BOLT]: { en: 'Missing Bolts', ar: 'براغي مفقودة' },
  [DefectType.WEAR]: { en: 'Rail Wear', ar: 'اهتراء القضبان' },
  [DefectType.VEGETATION]: { en: 'Vegetation', ar: 'حشائش ومزروعات' },
  [DefectType.CORROSION]: { en: 'Corrosion', ar: 'الصدأ والتآكل' },
  [DefectType.TRACK_MISALIGNMENT]: { en: 'Misalignment', ar: 'انحراف المسار' },
  [DefectType.DEBRIS]: { en: 'Debris/Obstacles', ar: 'عوائق وحطام' }
};

const severityLabels: Record<Severity, { en: string; ar: string }> = {
  [Severity.CRITICAL]: { en: 'Critical', ar: 'حرج جداً' },
  [Severity.HIGH]: { en: 'High Risk', ar: 'عالي الخطورة' },
  [Severity.MEDIUM]: { en: 'Medium Risk', ar: 'متوسط الخطورة' },
  [Severity.LOW]: { en: 'Low Risk', ar: 'منخفض الخطورة' }
};

interface HeatmapOverlayProps {
  points: { lat: number; lng: number; weight: number }[];
  radius: number;
  opacity: number;
}

function HeatmapOverlay({ points, radius, opacity }: HeatmapOverlayProps) {
  const map = useMap();
  const visualizationLib = useMapsLibrary('visualization');
  const [heatmap, setHeatmap] = useState<any | null>(null);

  useEffect(() => {
    if (!visualizationLib || !map) return;

    const layer = new visualizationLib.HeatmapLayer({
      map: map,
      radius: radius,
      opacity: opacity,
      dissipating: true
    });

    setHeatmap(layer);

    return () => {
      layer.setMap(null);
    };
  }, [visualizationLib, map]);

  useEffect(() => {
    if (!heatmap || !visualizationLib) return;

    const googlePoints = points.map(p => ({
      location: new (window as any).google.maps.LatLng(p.lat, p.lng),
      weight: p.weight
    }));

    heatmap.setData(googlePoints);
  }, [heatmap, points, visualizationLib]);

  useEffect(() => {
    if (!heatmap) return;
    heatmap.setOptions({
      radius: radius,
      opacity: opacity
    });
  }, [heatmap, radius, opacity]);

  return null;
}

interface MapViewProps {
  inspections: TrackInspection[];
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-4 h-4 text-amber-400" />;
  if (code >= 1 && code <= 3) return <Cloud className="w-4 h-4 text-zinc-400" />;
  if (code === 45 || code === 48) return <CloudFog className="w-4 h-4 text-zinc-500" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-4 h-4 text-blue-400" />;
  if (code >= 71 && code <= 77) return <CloudSnow className="w-4 h-4 text-zinc-100" />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-4 h-4 text-blue-500" />;
  if (code >= 95) return <CloudLightning className="w-4 h-4 text-purple-400" />;
  return <Cloud className="w-4 h-4 text-zinc-400" />;
};

function WeatherOverlay({ lat, lng }: { lat: number, lng: number }) {
  const [weather, setWeather] = useState<{ temp: number; code: number; wind: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
        );
        const data = await response.json();
        if (data.current_weather) {
          setWeather({
            temp: data.current_weather.temperature,
            code: data.current_weather.weathercode,
            wind: data.current_weather.windspeed
          });
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchWeather, 500);
    return () => clearTimeout(timer);
  }, [lat, lng]);

  if (loading && !weather) return null;

  return (
    <div className={`bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-3 rounded-xl shadow-xl flex flex-col gap-2 min-w-[140px] mb-4 mr-4`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Thermometer className="w-3 h-3 text-emerald-500" />
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">WEATHER</span>
      </div>
      
      {weather ? (
        <div className="space-y-2">
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
             <div className="flex items-center gap-2">
               {getWeatherIcon(weather.code)}
               <span className="text-sm font-bold text-zinc-100">{weather.temp}°C</span>
             </div>
          </div>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Wind className="w-3 h-3 text-blue-400" />
            <span className="text-[9px] font-mono text-zinc-400">{weather.wind} km/h</span>
          </div>
        </div>
      ) : (
        <span className="text-[9px] text-zinc-500 italic">Weather unavailable</span>
      )}
    </div>
  );
}

interface MarkerWithInfoWindowProps {
  insp: TrackInspection;
  onSelect?: (id: string | null) => void;
  isSelected?: boolean;
  key?: string | number;
}

function MarkerWithInfoWindow({ insp, onSelect, isSelected }: MarkerWithInfoWindowProps) {
  const { t, isRTL } = useLanguage();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setInfoWindowShown(true);
    }
  }, [isSelected]);

  const getSeverityColor = (defects: DetectedDefect[]) => {
    if (defects.length === 0) return '#10b981';
    const severities = defects.map(d => d.severity);
    if (severities.includes(Severity.CRITICAL)) return '#ef4444';
    if (severities.includes(Severity.HIGH)) return '#f97316';
    if (severities.includes(Severity.MEDIUM)) return '#eab308';
    return '#06b6d4';
  };

  const color = getSeverityColor(insp.defects);
  const isCritical = insp.defects.some(d => d.severity === Severity.CRITICAL);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: insp.location.lat, lng: insp.location.lng }}
        onClick={() => {
          setInfoWindowShown(true);
          onSelect?.(insp.id);
        }}
        zIndex={isSelected ? 100 : 1}
      >
        <motion.div 
          initial={false}
          animate={{
            scale: isSelected ? 1.5 : 1,
            y: isSelected ? -5 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="relative group cursor-pointer"
        >
          <div 
            style={{ backgroundColor: color }} 
            className="w-4 h-4 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110"
          />
          {(isCritical || isSelected) && (
            <div 
              className={cn("absolute inset-0 rounded-full animate-ping border-2", isSelected ? "animate-[ping_1.5s_infinite]" : "animate-ping")}
              style={{ borderColor: color, opacity: isSelected ? 0.8 : 1 }}
            />
          )}
        </motion.div>
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => {
            setInfoWindowShown(false);
            onSelect?.(null);
          }}
        >
          <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 shadow-2xl min-w-[240px] -m-2">
            <div className="relative h-24 w-full">
              <img 
                src={insp.imageUrl} 
                alt="Track" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              <div className={`absolute bottom-2 left-3 right-3 flex items-end justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="text-[10px] font-black text-zinc-100 uppercase tracking-widest leading-none mb-1">
                    {t('segment')} {insp.id.slice(-6)}
                  </p>
                  <p className="text-[8px] text-zinc-400 font-mono leading-none">
                    {insp.location.lat.toFixed(4)}, {insp.location.lng.toFixed(4)}
                  </p>
                </div>
                
                {insp.defects.length > 0 && (
                  <div className="bg-red-500/20 border border-red-500/50 px-1.5 py-0.5 rounded text-[8px] font-black text-red-400 uppercase tracking-tighter animate-pulse">
                    {insp.defects.length} FAULTS
                  </div>
                )}
              </div>
            </div>

            <div className="p-3">
              <div className="space-y-1.5 mb-4 max-h-[120px] overflow-y-auto custom-scrollbar">
                {insp.defects.length > 0 ? (
                  insp.defects.map((d, idx) => (
                    <div key={idx} className={`group flex items-center justify-between p-1.5 rounded bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", 
                          d.severity === Severity.CRITICAL ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                          d.severity === Severity.HIGH ? 'bg-orange-500' :
                          d.severity === Severity.MEDIUM ? 'bg-yellow-500' :
                          'bg-cyan-500'
                        )} />
                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-tight">
                          {t(d.type.toLowerCase().replace('_', '') as any) || d.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={cn("text-[7px] font-black px-1 rounded uppercase tracking-[0.1em]",
                        d.severity === Severity.CRITICAL ? 'text-red-500' : 
                        d.severity === Severity.HIGH ? 'text-orange-500' :
                        d.severity === Severity.MEDIUM ? 'text-yellow-500' :
                        'text-cyan-500'
                      )}>
                        {t(d.severity.toLowerCase() as any)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 gap-2 opacity-50">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">{t('statusClear')}</p>
                  </div>
                )}
              </div>

              <button 
                className="group w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[9px] font-black py-2 rounded-lg flex items-center justify-center gap-2 uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
                onClick={() => console.log('Viewing details for:', insp.id)}
              >
                <Eye className="w-3 h-3 group-hover:scale-110 transition-transform" /> 
                {t('details')}
              </button>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function MapView({ inspections, selectedId, onSelect }: MapViewProps) {
  const { t, isRTL } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 30.0444, lng: 31.2357 });

  // Heatmap interactive settings states
  const [isHeatmapActive, setIsHeatmapActive] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([
    Severity.CRITICAL,
    Severity.HIGH,
    Severity.MEDIUM,
    Severity.LOW
  ]);
  const [selectedDefectTypes, setSelectedDefectTypes] = useState<DefectType[]>([
    DefectType.CRACK,
    DefectType.EROSION,
    DefectType.MISSING_BOLT,
    DefectType.WEAR,
    DefectType.VEGETATION,
    DefectType.CORROSION,
    DefectType.TRACK_MISALIGNMENT,
    DefectType.DEBRIS
  ]);
  const [heatmapRadius, setHeatmapRadius] = useState(25);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.8);
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(true);

  const initialCenter = useMemo(() => {
    const selected = selectedId ? inspections.find(i => i.id === selectedId) : null;
    if (selected) return { lat: selected.location.lat, lng: selected.location.lng };
    if (inspections.length > 0) return { lat: inspections[0].location.lat, lng: inspections[0].location.lng };
    return { lat: 30.0444, lng: 31.2357 }; // Default to Cairo
  }, [inspections, selectedId]);

  useEffect(() => {
    if (selectedId) {
      setMapCenter(initialCenter);
    }
  }, [selectedId, initialCenter]);

  // Dynamically calculate the weighted heatmap points
  const heatmapPoints = useMemo(() => {
    if (!isHeatmapActive) return [];

    const points: { lat: number; lng: number; weight: number }[] = [];

    inspections.forEach(insp => {
      // Find defects matching both selected severities and defect types
      const matchingDefects = insp.defects.filter(d => 
        selectedSeverities.includes(d.severity) &&
        selectedDefectTypes.includes(d.type)
      );

      if (matchingDefects.length > 0) {
        let totalWeight = 0;
        matchingDefects.forEach(d => {
          if (d.severity === Severity.CRITICAL) totalWeight += 5.0;
          else if (d.severity === Severity.HIGH) totalWeight += 3.5;
          else if (d.severity === Severity.MEDIUM) totalWeight += 2.0;
          else if (d.severity === Severity.LOW) totalWeight += 1.0;
        });

        points.push({
          lat: insp.location.lat,
          lng: insp.location.lng,
          weight: totalWeight
        });
      }
    });

    return points;
  }, [inspections, isHeatmapActive, selectedSeverities, selectedDefectTypes]);

  // Fallback Interactive Sci-Fi holographic vector map of Egypt Nile Delta railway
  if (!hasValidKey) {
    const getSvgCoords = (lat: number, lng: number) => {
      // Adjusted bounds to center the Nile Delta exactly:
      // Lng range: 29.5 (West of Alexandria) to 32.8 (East of Suez/Ismailia)
      // Lat range: 29.8 (Cairo South) to 31.6 (Mediterranean Coast)
      const x = ((lng - 29.4) / (32.8 - 29.4)) * 100;
      const y = (1 - (lat - 29.75) / (31.65 - 29.75)) * 100;
      return { x: `${x}%`, y: `${y}%` };
    };

    // Major holographic nodes in Egypt delta railway interlocking line
    const holoCities = [
      { nameEn: "Cairo Hub", nameAr: "مركز القاهرة", x: 55, y: 84 },
      { nameEn: "Banha Jct", nameAr: "مفرق بنها", x: 53, y: 66 },
      { nameEn: "Tanta Interlocking", nameAr: "تحويلة طنطا", x: 44, y: 46 },
      { nameEn: "Damanhour Sector", nameAr: "قطاع دمنهور", x: 30, y: 32 },
      { nameEn: "Alexandria Port Hub", nameAr: "ميناء الإسكندرية", x: 12, y: 16 },
      { nameEn: "Mansoura Terminal", nameAr: "محطة المنصورة", x: 67, y: 34 },
      { nameEn: "Damietta Sector", nameAr: "قطاع دمياط", x: 74, y: 14 },
      { nameEn: "Zagazig Sector", nameAr: "قطاع الزقازيق", x: 66, y: 56 },
      { nameEn: "Ismailia Sector", nameAr: "قطاع الإسماعيلية", x: 86, y: 54 },
      { nameEn: "Port Said Hub", nameAr: "محور بورسعيد", x: 88, y: 16 },
      { nameEn: "Suez Gate", nameAr: "بوابة السويس", x: 92, y: 78 },
    ];

    // Filtered inspection nodes
    const visibleInspections = inspections.filter(insp => {
      const matchingDefects = insp.defects.filter(d => 
        selectedSeverities.includes(d.severity) &&
        selectedDefectTypes.includes(d.type)
      );
      // If no defects, show it if low severity is enabled
      if (insp.defects.length === 0) {
        return selectedSeverities.includes(Severity.LOW);
      }
      return matchingDefects.length > 0;
    });

    // Currently selected inspection
    const activeInspection = selectedId ? inspections.find(i => i.id === selectedId) : null;

    return (
      <div className="h-full w-full rounded-2xl overflow-hidden border border-zinc-805 bg-slate-950/95 shadow-2xl relative flex flex-col xl:flex-row min-h-[580px]">
        {/* Holographic Radar Screen area */}
        <div className="flex-1 h-full relative overflow-hidden bg-[radial-gradient(circle_at_center,_#020617_0%,_#090d16_100%)] p-6 min-h-[420px]">
          {/* Tech Matrix lines grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(34,211,238,0.02)_1px,_transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="absolute top-4 left-4 z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xs font-black font-mono text-cyan-400 uppercase tracking-widest">HOLOGRAPHIC RAIL SPACE V1</h3>
            </div>
            <p className="text-[9px] font-mono text-slate-500">MAPPING PORTAL: NILE DELTA GRAPH LAYOUT (SCHEMATIC DIAGRAM)</p>
          </div>

          {/* Quick theme status badge / manual key reminder */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/60 backdrop-blur-md rounded-lg p-2 border border-white/5 text-[9px] text-slate-400 font-mono space-y-1 max-w-[280px]">
            <p className="font-bold text-slate-300">💡 {isRTL ? "محاكاة الخريطة التفاعلية الفضائية" : "ACTIVE SCHEMATIC INTERLOCK"}</p>
            <p className="opacity-70 leading-normal">
              {isRTL 
                ? "تعمل الخريطة بمرونة ودقة هندسية عالية بالاعتماد على مصفوفات تحويل خطوط العرض والإحداثيات محليًا." 
                : "Rendering full Egyptian delta GIS coordinates using linear spherical projection matrices."}
            </p>
          </div>

          {/* Core Interactive SVG Vector Map Canvas */}
          <div className="w-full h-full flex items-center justify-center relative">
            <svg className="w-full h-full max-w-[700px] max-h-[480px] absolute overflow-visible" viewBox="0 0 100 100">
              {/* Glowing Interlocking Rail Tracks Path curves (neon cyan/indigo theme) */}
              
              {/* Route 1: Cairo - Banha - Tanta - Damanhour - Alex */}
              <motion.path 
                d="M 55,84 Q 54,75 53,66 T 44,46 T 30,32 T 12,16" 
                fill="none" 
                stroke="rgba(99, 102, 241, 0.3)" 
                strokeWidth="1"
                className="stroke-cyan-500/20"
              />
              <motion.path 
                d="M 55,84 Q 54,75 53,66 T 44,46 T 30,32 T 12,16" 
                fill="none" 
                stroke="rgba(6, 182, 212, 0.75)" 
                strokeWidth="0.5"
                strokeDasharray="4, 4"
                animate={{ strokeDashoffset: [40, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />

              {/* Route 2: Banha - Zagazig - Ismailia - Port Said */}
              <motion.path 
                d="M 53,66 L 66,56 Q 78,55 86,54 T 88,16" 
                fill="none" 
                stroke="rgba(99, 102, 241, 0.3)" 
                strokeWidth="1"
              />
              <motion.path 
                d="M 53,66 L 66,56 Q 78,55 86,54 T 88,16" 
                fill="none" 
                stroke="rgba(168, 85, 247, 0.75)" 
                strokeWidth="0.5"
                strokeDasharray="4, 4"
                animate={{ strokeDashoffset: [0, 40] }}
                transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              />

              {/* Route 3: Ismailia - Suez */}
              <motion.path 
                d="M 86,54 L 92,78" 
                fill="none" 
                stroke="rgba(99, 102, 241, 0.3)" 
                strokeWidth="1"
              />
              <motion.path 
                d="M 86,54 L 92,78" 
                fill="none" 
                stroke="rgba(6, 182, 212, 0.6)" 
                strokeWidth="0.5"
                strokeDasharray="3, 3"
                animate={{ strokeDashoffset: [30, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />

              {/* Route 4: Tanta - Mansoura - Damietta */}
              <motion.path 
                d="M 44,46 L 67,34 L 74,14" 
                fill="none" 
                stroke="rgba(99, 102, 241, 0.3)" 
                strokeWidth="1"
              />
              <motion.path 
                d="M 44,46 L 67,34 L 74,14" 
                fill="none" 
                stroke="rgba(56, 189, 248, 0.75)" 
                strokeWidth="0.5"
                strokeDasharray="5, 3"
                animate={{ strokeDashoffset: [0, 30] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />

              {/* Static Egyptian Nile Rivers schematic aesthetic flow (dark indigo backdrops) */}
              <path 
                d="M 55,84 C 54,80 50,70 51,64 Q 52,56 47,44 T 42,26" 
                fill="none" 
                stroke="rgba(30, 58, 138, 0.2)" 
                strokeWidth="1.5"
              />

              {/* Draw major interlocking cities beacons */}
              {holoCities.map((city, idx) => (
                <g key={idx}>
                  {/* Glowing beacon circle */}
                  <circle 
                    cx={city.x} 
                    cy={city.y} 
                    r="1" 
                    fill="rgba(34, 211, 238, 0.45)" 
                  />
                  <circle 
                    cx={city.x} 
                    cy={city.y} 
                    r="2.5" 
                    fill="transparent" 
                    stroke="rgba(34, 211, 238, 0.25)" 
                    strokeWidth="0.25"
                    className="animate-ping"
                    style={{ animationDuration: `${2.5 + (idx % 3)}s` }}
                  />
                  
                  {/* Subtle Text labels */}
                  <text 
                    x={city.x + 2} 
                    y={city.y + 1} 
                    fill="rgba(148, 163, 184, 0.7)" 
                    fontSize="1.3" 
                    fontFamily="monospace"
                    className="select-none font-extrabold uppercase"
                  >
                    {isRTL ? city.nameAr : city.nameEn}
                  </text>
                </g>
              ))}
            </svg>

            {/* Render Active Inspection Pins onto topological vector canvas coordinates! */}
            {visibleInspections.map((insp) => {
              const coords = getSvgCoords(insp.location.lat, insp.location.lng);
              const isSelected = selectedId === insp.id;

              // Compute color based on defects severity
              let color = '#10b981'; // Green (No defects)
              let ringColor = 'rgba(16, 185, 129, ';
              const isCritical = insp.defects.some(d => d.severity === Severity.CRITICAL);
              const isHigh = insp.defects.some(d => d.severity === Severity.HIGH);
              const isMed = insp.defects.some(d => d.severity === Severity.MEDIUM);

              if (isCritical) {
                color = '#ef4444';
                ringColor = 'rgba(239, 68, 68, ';
              } else if (isHigh) {
                color = '#f97316';
                ringColor = 'rgba(249, 115, 22, ';
              } else if (isMed) {
                color = '#eab308';
                ringColor = 'rgba(234, 179, 8, ';
              } else if (insp.defects.length > 0) {
                color = '#06b6d4';
                ringColor = 'rgba(6, 182, 212, ';
              }

              return (
                <div
                  key={insp.id}
                  style={{ left: coords.x, top: coords.y }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                  onClick={() => onSelect?.(isSelected ? null : insp.id)}
                >
                  <motion.div 
                    whileHover={{ scale: 1.4 }}
                    animate={{
                      scale: isSelected ? 1.45 : 1,
                      z: isSelected ? 10 : 0
                    }}
                    className="relative p-2"
                  >
                    {/* Pulsing active pin circle */}
                    <div 
                      style={{ backgroundColor: color }}
                      className={`w-3 h-3 rounded-full border border-slate-900 shadow-xl transition-all ${
                        isSelected ? 'ring-2 ring-white scale-110' : ''
                      }`}
                    />
                    
                    {/* Ring aura ripple animation */}
                    {(isCritical || isSelected) && (
                      <div 
                        className="absolute inset-0 rounded-full border-2 animate-ping"
                        style={{ 
                          borderColor: color, 
                          animationDuration: isSelected ? '1.2s' : '1.8s',
                          opacity: isSelected ? 0.9 : 0.65
                        }}
                      />
                    )}
                  </motion.div>
                </div>
              );
            })}

            {/* Active inspection info display glass card overlay directly inside vector viewport */}
            <AnimatePresence>
              {activeInspection && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-6 right-6 left-6 md:left-auto md:w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl z-30 space-y-3"
                >
                  <div className="relative h-24 w-full rounded-lg overflow-hidden border border-white/5 bg-slate-950">
                    <img 
                      src={activeInspection.imageUrl} 
                      alt="Rail anomaly segment view" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                    <button 
                      onClick={() => onSelect?.(null)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-white bg-black/60 rounded-full p-1 border border-white/10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className={`absolute bottom-2 left-2.5 right-2-5 flex justify-between items-end ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none">
                          {isRTL ? 'القطاع' : 'SEGMENT'} {activeInspection.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-[8px] text-slate-400 font-mono mt-1">
                          {activeInspection.location.lat.toFixed(5)}°, {activeInspection.location.lng.toFixed(5)}°
                        </p>
                      </div>
                      {activeInspection.defects.length > 0 ? (
                        <span className="bg-red-500/15 border border-red-500/40 px-1.5 py-0.5 rounded text-[8px] font-black text-red-400 uppercase tracking-tighter animate-pulse">
                          {activeInspection.defects.length} DEFECTS
                        </span>
                      ) : (
                        <span className="bg-emerald-500/15 border border-emerald-500/40 px-1.5 py-0.5 rounded text-[8px] font-black text-emerald-400 uppercase tracking-tighter">
                          INTACT
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                    {activeInspection.defects.length > 0 ? (
                      activeInspection.defects.map((def, defIdx) => (
                        <div 
                          key={defIdx} 
                          className={`flex items-center justify-between p-2 rounded bg-slate-950/60 border border-white/5 text-[10px] ${
                            isRTL ? 'flex-row-reverse text-right' : 'text-left'
                          }`}
                        >
                          <div className={`flex items-center gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              def.severity === Severity.CRITICAL ? 'bg-red-500 animate-pulse' :
                              def.severity === Severity.HIGH ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-slate-300 font-bold uppercase tracking-wide">
                              {isRTL ? defectLabels[def.type].ar : defectLabels[def.type].en}
                            </span>
                          </div>
                          <span className={`text-[8px] font-bold px-1 rounded uppercase min-w-[50px] text-center ${
                            def.severity === Severity.CRITICAL ? 'bg-red-500/10 text-red-400' :
                            def.severity === Severity.HIGH ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {def.severity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-emerald-500/10 rounded-lg text-center bg-emerald-500/5 text-emerald-400 flex flex-col items-center gap-1">
                        <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
                        <span className="text-[9px] font-black tracking-widest uppercase">{isRTL ? "الخط الهيكلي سليم" : "STRUCTURAL STATE SAFE"}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Sidebar controls layout */}
        <div className="w-full xl:w-80 shrink-0 bg-slate-900/45 p-4 border-t xl:border-t-0 xl:border-l border-white/10 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">{isRTL ? "التحكم بالذكاء الاصطناعي" : "MAP CONTROL DESK"}</h4>
                <p className="text-[8px] text-slate-500 font-mono tracking-tight">{isRTL ? "منظومة فحص هولوجرام ثلاثية الأبعاد" : "SYSTEM: INTEGRATED GIS LAYERS"}</p>
              </div>
            </div>

            {/* Quick Actions / Downloaders */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  isHeatmapActive 
                    ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]" 
                    : "bg-slate-950/40 border-white/5 text-slate-500"
                )}
              >
                <Flame className={cn("w-3.5 h-3.5", isHeatmapActive && "animate-bounce")} />
                {isRTL ? 'الخريطة الحرارية' : 'Heatmap'}
              </button>
              <button
                onClick={() => setShowMarkers(!showMarkers)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  showMarkers 
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]" 
                    : "bg-slate-950/40 border-white/5 text-slate-500"
                )}
              >
                <MapPin className="w-3.5 h-3.5" />
                {isRTL ? 'المؤشرات النشطة' : 'Defect Markers'}
              </button>
            </div>

            {/* Severities selection Filter panel */}
            <div className="space-y-1.5">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-cyan-400" />
                  {isRTL ? 'مستويات الخطورة' : 'SEVERITY RATING'}
                </span>
                <span className="text-[8px] text-slate-600 font-bold uppercase">FILTER</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(severityLabels) as Severity[]).map((sev) => {
                  const isSelected = selectedSeverities.includes(sev);
                  const label = isRTL ? severityLabels[sev].ar : severityLabels[sev].en;
                  const btnColor = 
                    sev === Severity.CRITICAL ? (isSelected ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-slate-950/30 border-white/5 text-slate-650') :
                    sev === Severity.HIGH ? (isSelected ? 'bg-orange-500/10 border-orange-500/40 text-orange-400' : 'bg-slate-950/30 border-white/5 text-slate-650') :
                    sev === Severity.MEDIUM ? (isSelected ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' : 'bg-slate-950/30 border-white/5 text-slate-650') :
                    (isSelected ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-slate-950/30 border-white/5 text-slate-650');

                  return (
                    <button
                      key={sev}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSeverities(selectedSeverities.filter(s => s !== sev));
                        } else {
                          setSelectedSeverities([...selectedSeverities, sev]);
                        }
                      }}
                      className={cn(
                        "py-1.5 px-2 rounded-lg border text-[8px] font-bold text-center transition-all truncate uppercase cursor-pointer",
                        btnColor
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Defect types selection */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                {isRTL ? 'تصنيف الأعطال المعروضة' : 'DEFECT FILTER SPEC'}
              </span>
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-[8px]">
                {(Object.keys(defectLabels) as DefectType[]).map((def) => {
                  const isSelected = selectedDefectTypes.includes(def);
                  const label = isRTL ? defectLabels[def].ar : defectLabels[def].en;

                  return (
                    <div
                      key={def}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDefectTypes(selectedDefectTypes.filter(d => d !== def));
                        } else {
                          setSelectedDefectTypes([...selectedDefectTypes, def]);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg border hover:bg-slate-950/60 transition-colors cursor-pointer text-[8px]",
                        isSelected ? "bg-slate-950/80 border-slate-700 text-cyan-400 font-extrabold" : "bg-slate-950/20 border-white/5 text-slate-500"
                      )}
                    >
                      <span className="truncate">{label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                const sheetData = inspections.map((i, index) => ({
                  ID: i.id,
                  Date: new Date(i.timestamp).toLocaleString(),
                  Latitude: i.location.lat,
                  Longitude: i.location.lng,
                  Altitude: i.location.altitude,
                  DefectsFound: i.defects.length,
                  SummaryReports: i.summary
                }));
                const ws = XLSX.utils.json_to_sheet(sheetData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Inspections Report");
                XLSX.writeFile(wb, "AI-Rail-Inspections-Logs.xlsx");
              }}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              {isRTL ? "تصدير جدول المراقبة بـ Excel" : "EXPORT EXCEL DATA REPORT"}
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={`h-full w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative transition-all duration-300 ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none' : ''}`}>
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          center={mapCenter}
          zoom={13}
          mapTypeId="hybrid"
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          onCenterChanged={ev => setMapCenter(ev.detail.center)}
          disableDefaultUI={true}
          zoomControl={true}
        >
          {/* Heatmap Layer */}
          {isHeatmapActive && (
            <HeatmapOverlay 
              points={heatmapPoints} 
              radius={heatmapRadius} 
              opacity={heatmapOpacity} 
            />
          )}

          {/* Node Pinpoints */}
          {showMarkers && inspections.map((insp) => (
            <MarkerWithInfoWindow 
              key={insp.id} 
              insp={insp} 
              onSelect={onSelect}
              isSelected={selectedId === insp.id}
            />
          ))}

          {/* Heatmap Control Dashboard in TOP_LEFT */}
          <MapControl position={ControlPosition.TOP_LEFT}>
            <div className={`mt-4 ml-4 ${isRTL ? 'mr-4 font-sans text-right' : 'font-sans text-left'}`}>
              <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-2xl w-[280px] md:w-[310px] overflow-hidden shadow-2xl">
                {/* Header */}
                <div 
                  onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
                  className="p-3 bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-zinc-800 flex items-center justify-between cursor-pointer hover:from-zinc-850 hover:to-zinc-900 transition-colors"
                >
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                    <div>
                      <h4 className="text-[11px] font-black text-zinc-100 uppercase tracking-wider leading-none">
                        {isRTL ? 'منظومة الخريطة الحرارية' : 'Defect Heatmap Engine'}
                      </h4>
                      <p className="text-[8px] text-zinc-500 mt-0.5 leading-none font-semibold uppercase font-mono">
                        {isRTL ? 'تحليل تمركز العيوب الحرجة' : 'Critical Defect Concentration'}
                      </p>
                    </div>
                  </div>
                  {isFilterPanelExpanded ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                </div>

                {/* Content */}
                <AnimatePresence>
                  {isFilterPanelExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="p-3 space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar text-[10px]"
                    >
                      {/* Toggles */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setIsHeatmapActive(!isHeatmapActive)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all",
                            isHeatmapActive 
                              ? "bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.1)]" 
                              : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                          )}
                        >
                          <Flame className={cn("w-3 h-3", isHeatmapActive && "animate-bounce")} />
                          {isRTL ? 'الخريطة' : 'Heatmap'}
                        </button>
                        <button
                          onClick={() => setShowMarkers(!showMarkers)}
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all",
                            showMarkers 
                              ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.1)]" 
                              : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                          )}
                        >
                          <MapPin className="w-3 h-3" />
                          {isRTL ? 'الدبابيس' : 'Pins'}
                        </button>
                      </div>

                      {/* Severities Filter */}
                      <div className="space-y-1.5">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-zinc-500" />
                            {isRTL ? 'مستويات الخطورة' : 'Severity Filter'}
                          </span>
                          <div className={`flex gap-1.5 text-[8px] ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <button 
                              onClick={() => setSelectedSeverities([Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.LOW])}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-bold"
                            >
                              {isRTL ? 'الكل' : 'All'}
                            </button>
                            <span className="text-zinc-800">|</span>
                            <button 
                              onClick={() => setSelectedSeverities([])}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-bold"
                            >
                              {isRTL ? 'تصفير' : 'Clear'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          {(Object.keys(severityLabels) as Severity[]).map((sev) => {
                            const isSelected = selectedSeverities.includes(sev);
                            const label = isRTL ? severityLabels[sev].ar : severityLabels[sev].en;
                            
                            const colorClass = 
                              sev === Severity.CRITICAL ? (isSelected ? 'bg-red-500/10 border-red-500/80 text-red-400 font-bold shadow-[0_0_6px_rgba(239,68,68,0.15)]' : 'bg-zinc-900/30 border-zinc-900 text-zinc-650') :
                              sev === Severity.HIGH ? (isSelected ? 'bg-orange-500/10 border-orange-500/80 text-orange-400 font-bold' : 'bg-zinc-900/30 border-zinc-900 text-zinc-650') :
                              sev === Severity.MEDIUM ? (isSelected ? 'bg-yellow-500/10 border-yellow-500/80 text-yellow-400 font-bold' : 'bg-zinc-900/30 border-zinc-900 text-zinc-650') :
                              (isSelected ? 'bg-cyan-500/10 border-cyan-500/80 text-cyan-400 font-bold' : 'bg-zinc-900/30 border-zinc-900 text-zinc-650');

                            return (
                              <button
                                key={sev}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedSeverities(selectedSeverities.filter(s => s !== sev));
                                  } else {
                                    setSelectedSeverities([...selectedSeverities, sev]);
                                  }
                                }}
                                className={cn(
                                  "py-1 px-1.5 rounded border text-[8px] font-bold text-center transition-colors truncate uppercase tracking-tight cursor-pointer",
                                  colorClass
                                )}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Defect Type Filter */}
                      <div className="space-y-1.5">
                        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                            <Filter className="w-3 h-3 text-zinc-500" />
                            {isRTL ? 'نوع العيوب الفنية' : 'Defect Type Filter'}
                          </span>
                          <div className={`flex gap-1.5 text-[8px] ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <button 
                              onClick={() => setSelectedDefectTypes([
                                DefectType.CRACK, DefectType.EROSION, DefectType.MISSING_BOLT,
                                DefectType.WEAR, DefectType.VEGETATION, DefectType.CORROSION,
                                DefectType.TRACK_MISALIGNMENT, DefectType.DEBRIS
                              ])}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-bold"
                            >
                              {isRTL ? 'الكل' : 'All'}
                            </button>
                            <span className="text-zinc-800">|</span>
                            <button 
                              onClick={() => setSelectedDefectTypes([])}
                              className="text-zinc-500 hover:text-zinc-300 transition-colors uppercase font-bold"
                            >
                              {isRTL ? 'تصفير' : 'Clear'}
                            </button>
                          </div>
                        </div>

                        {/* Defect Checklist */}
                        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1 pad-left-0.5 custom-scrollbar font-sans text-[8px]">
                          {(Object.keys(defectLabels) as DefectType[]).map((def) => {
                            const isSelected = selectedDefectTypes.includes(def);
                            const label = isRTL ? defectLabels[def].ar : defectLabels[def].en;

                            return (
                              <div 
                                key={def} 
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedDefectTypes(selectedDefectTypes.filter(d => d !== def));
                                  } else {
                                    setSelectedDefectTypes([...selectedDefectTypes, def]);
                                  }
                                }}
                                className={cn(
                                  "flex items-center justify-between p-1.5 rounded-md border hover:bg-zinc-900/60 transition-colors cursor-pointer text-[8px]",
                                  isSelected 
                                    ? "bg-zinc-900/80 border-zinc-700/80 text-zinc-100 font-bold" 
                                    : "bg-zinc-950/40 border-zinc-850 text-zinc-500"
                                )}
                              >
                                <span className={isRTL ? "text-right" : "text-left"}>{label}</span>
                                <div className={cn(
                                  "w-3 h-3 rounded flex items-center justify-center border transition-all flex-shrink-0",
                                  isSelected ? "bg-red-500 border-red-500" : "border-zinc-800 bg-zinc-950"
                                )}>
                                  {isSelected && <div className="w-1 h-1 rounded-full bg-zinc-950" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Customize Sliders */}
                      <div className="space-y-2 pt-1.5 border-t border-zinc-900">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1">
                          <Layers className="w-3 h-3 text-zinc-500" />
                          {isRTL ? 'تخصيص الخريطة الحرارية' : 'Display Customization'}
                        </span>
                        
                        <div className="space-y-2.5">
                          {/* Radius */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono">
                              <span>{isRTL ? 'حجم قطر التأشير' : 'Radius Size'}</span>
                              <span className="text-red-400 font-bold">{heatmapRadius}px</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="60"
                              step="2"
                              value={heatmapRadius}
                              onChange={(e) => setHeatmapRadius(Number(e.target.value))}
                              className="w-full h-1 accent-red-500 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>

                          {/* Opacity */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono">
                              <span>{isRTL ? 'شـفـافية الغلاف' : 'Glow Opacity'}</span>
                              <span className="text-red-400 font-bold">{Math.round(heatmapOpacity * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="1.0"
                              step="0.05"
                              value={heatmapOpacity}
                              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                              className="w-full h-1 accent-red-500 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Summary status */}
                      {isHeatmapActive && (
                        <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[8px] text-zinc-500 font-mono uppercase">
                          <span>{isRTL ? 'إجمالي بؤر التمركز النشطة:' : 'Active Heat Centers:'}</span>
                          <span className="text-red-400 font-bold">{heatmapPoints.length} {isRTL ? 'موقعاً' : 'nodes'}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </MapControl>

          {/* Existing Controls in TOP_RIGHT */}
          <MapControl position={ControlPosition.TOP_RIGHT}>
            <div className="flex flex-col gap-4 mt-4 mr-4">
              <WeatherOverlay lat={mapCenter.lat} lng={mapCenter.lng} />
               
              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-1 rounded-xl shadow-xl flex flex-col gap-1">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 group cursor-pointer"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" /> : <Maximize className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" />}
                  <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-tighter">
                    {isRTL ? 'ملئ الشاشة' : 'Fullscreen'}
                  </span>
                </button>
                
                <button 
                  onClick={() => setMapCenter(initialCenter)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-2 group cursor-pointer"
                  title="Recenter Map"
                >
                  <LocateFixed className="w-4 h-4 text-zinc-400 group-hover:text-zinc-100" />
                  <span className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase tracking-tighter">
                    {isRTL ? 'إعادة توسيط' : 'Recenter'}
                  </span>
                </button>
              </div>

              <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 p-3 rounded-xl shadow-xl flex flex-col gap-2 min-w-[120px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">{t('critical')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">{t('high')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                  <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">{t('medium')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">{t('low')}</span>
                </div>
                <div className="flex items-center gap-2 opacity-60">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-wider">{t('statusClear')}</span>
                </div>
                <div className="h-[1px] bg-zinc-800 my-1" />
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">{inspections.length} NODES</span>
                </div>
              </div>
            </div>
          </MapControl>
          {/* Sector Report Button in BOTTOM_CENTER position */}
          <MapControl position={ControlPosition.BOTTOM_CENTER}>
            <SectorReportButtonControl 
              inspections={inspections}
              selectedSeverities={selectedSeverities}
              selectedDefectTypes={selectedDefectTypes}
              isRTL={isRTL}
            />
          </MapControl>
        </Map>
      </APIProvider>
    </div>
  );
}

interface SectorReportButtonControlProps {
  inspections: TrackInspection[];
  selectedSeverities: Severity[];
  selectedDefectTypes: DefectType[];
  isRTL: boolean;
}

function SectorReportButtonControl({
  inspections,
  selectedSeverities,
  selectedDefectTypes,
  isRTL
}: SectorReportButtonControlProps) {
  const map = useMap();
  const [inBoundsCount, setInBoundsCount] = useState<number>(0);
  const [visibleDefects, setVisibleDefects] = useState<any[]>([]);

  const updateVisibleItems = () => {
    if (!map) return;
    const bounds = map.getBounds();
    if (!bounds) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    const neLat = ne.lat();
    const neLng = ne.lng();
    const swLat = sw.lat();
    const swLng = sw.lng();

    const inBoundsInspections = inspections.filter(insp => {
      const lat = insp.location.lat;
      const lng = insp.location.lng;
      return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
    });

    const defects: any[] = [];
    inBoundsInspections.forEach(insp => {
      insp.defects.forEach(defect => {
        if (
          selectedSeverities.includes(defect.severity) &&
          selectedDefectTypes.includes(defect.type)
        ) {
          defects.push({
            inspectionId: insp.id,
            timestamp: insp.timestamp,
            latitude: insp.location.lat,
            longitude: insp.location.lng,
            defectId: defect.id,
            defectType: defect.type,
            severity: defect.severity,
            confidence: defect.confidence,
            description: defect.description,
            summary: insp.summary
          });
        }
      });
    });

    setVisibleDefects(defects);
    setInBoundsCount(defects.length);
  };

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('idle', () => {
      updateVisibleItems();
    });

    // Run initially
    updateVisibleItems();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [map, inspections, selectedSeverities, selectedDefectTypes]);

  const handleDownload = () => {
    if (visibleDefects.length === 0) {
      alert(isRTL ? 'لا توجد عيوب فنية مرئية في حدود الخريطة الحالية لتصديرها.' : 'No defects visible in the current map bounds to export.');
      return;
    }

    try {
      const formattedData = visibleDefects.map((def, idx) => ({
        '# (الرقم التوالي)': idx + 1,
        'Inspection ID (رقم الفحص)': def.inspectionId,
        'Date/Time (التاريخ والوقت)': def.timestamp,
        'Latitude (خط العرض)': def.latitude,
        'Longitude (خط الطول)': def.longitude,
        'Defect ID (رقم العيب)': def.defectId,
        'Defect Type (نوع العيب)': def.defectType,
        'Severity (درجة الخطورة)': def.severity,
        'Confidence (نسبة الموثوقية)': `${Math.round(def.confidence * 100)}%`,
        'Description (الوصف التفصيلي)': def.description,
        'Section Summary (ملخص القطاع)': def.summary
      }));

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      const colWidths = Object.keys(formattedData[0] || {}).map(key => {
        return { wch: Math.max(key.length + 4, 15) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sector Defect Report');

      XLSX.writeFile(workbook, `Sector_Defect_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Failed to generate sector report:', error);
    }
  };

  return (
    <div className="mb-6 flex items-center justify-center pointer-events-auto">
      <button
        type="button"
        onClick={handleDownload}
        disabled={inBoundsCount === 0}
        className={cn(
          "flex items-center gap-2.5 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-2xl border cursor-pointer",
          inBoundsCount > 0 
            ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 border-emerald-400 hover:scale-[1.03] active:scale-95 shadow-emerald-500/10" 
            : "bg-zinc-900/80 border-zinc-800 text-zinc-500 cursor-not-allowed"
        )}
      >
        <FileSpreadsheet className="w-3.5 h-3.5" />
        <span>
          {isRTL 
            ? `تحميل تقرير القطاع (${inBoundsCount})` 
            : `Download Sector Report (${inBoundsCount})`}
        </span>
      </button>
    </div>
  );
}
