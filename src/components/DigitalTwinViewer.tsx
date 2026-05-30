import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Rotate3d, ZoomIn, ZoomOut, AlertTriangle, ShieldCheck, Cpu, RefreshCw } from 'lucide-react';
import { DetectedDefect, Severity } from '../types';

interface DigitalTwinViewerProps {
  defects: DetectedDefect[];
  isRTL: boolean;
}

// 3D Point Definition
interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function DigitalTwinViewer({ defects, isRTL }: DigitalTwinViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: -0.4, y: 0.6 });
  const [zoom, setZoom] = useState(1.1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedSubComponent, setSelectedSubComponent] = useState<string>('Railhead-01-A');
  const [isScanning, setIsScanning] = useState(true);
  const [activeDefectIndex, setActiveDefectIndex] = useState<number>(0);

  // Stats for the inspected 3D segment
  const stats = {
    integrity: defects.length > 0 ? (defects.some(d => d.severity === Severity.CRITICAL) ? 72 : 88) : 99.4,
    stress: defects.length > 0 ? '480 MPa' : '150 MPa',
    vibration: defects.length > 0 ? '12.4 mm/s' : '1.8 mm/s',
    temperature: defects.length > 0 ? '42.8°C' : '28.5°C'
  };

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // 3D parameters
    const cameraDistance = 4.5;
    let scanLineZ = -2.0;

    // Generate tracks (left and right steel rails) and ties
    const trackLength = 5.0; // from Z = -2.5 to 2.5
    const numSleepers = 15;
    const sleeperSpacing = trackLength / (numSleepers - 1);

    // Coordinate conversion
    const project = (pt: Point3D): [number, number, number] => {
      // 1. Rotate around Y (yaw)
      let x = pt.x * Math.cos(rotation.y) - pt.z * Math.sin(rotation.y);
      let z = pt.x * Math.sin(rotation.y) + pt.z * Math.cos(rotation.y);
      let y = pt.y;

      // 2. Rotate around X (pitch)
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const yNew = y * cosX - z * sinX;
      const zNew = y * sinX + z * cosX;

      // Perspective projection
      const depth = zNew + cameraDistance;
      const perspectiveScale = (zoom * width * 0.45) / depth;
      
      const screenX = width / 2 + x * perspectiveScale;
      const screenY = height / 2.1 + yNew * perspectiveScale;

      return [screenX, screenY, depth];
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw high-tech blueprint background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      const numGrid = 12;
      for (let i = 0; i <= numGrid; i++) {
        const x = (width / numGrid) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const y = (height / numGrid) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw subtle orbital rings helper
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2.1, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Dynamic animation of laser scanning
      if (isScanning) {
        scanLineZ += 0.025;
        if (scanLineZ > 2.5) scanLineZ = -2.5;
      }

      // Draw rails (left and right)
      const railOffset = 0.65; // rail gauge spacing
      const leftRailPoints: Point3D[] = [];
      const rightRailPoints: Point3D[] = [];

      const segments = 40;
      for (let i = 0; i <= segments; i++) {
        const z = -2.5 + (trackLength / segments) * i;
        // Introduce small micro-waviness to look more technical
        const microDeform = Math.sin(z * 4) * 0.001; 
        
        leftRailPoints.push({ x: -railOffset + microDeform, y: 0.2, z });
        rightRailPoints.push({ x: railOffset + microDeform, y: 0.2, z });
      }

      // 1. Draw Sleepers (Ties)
      for (let i = 0; i < numSleepers; i++) {
        const z = -2.5 + sleeperSpacing * i;
        
        // Define sleeper vertices
        const sleeperWidth = 0.25;
        const sleeperHeight = 0.12;
        const sleeperLeft = -1.0;
        const sleeperRight = 1.0;

        const p1 = project({ x: sleeperLeft, y: 0.2, z: z - sleeperWidth / 2 });
        const p2 = project({ x: sleeperRight, y: 0.2, z: z - sleeperWidth / 2 });
        const p3 = project({ x: sleeperRight, y: 0.2, z: z + sleeperWidth / 2 });
        const p4 = project({ x: sleeperLeft, y: 0.2, z: z + sleeperWidth / 2 });

        const p1Bottom = project({ x: sleeperLeft, y: 0.32, z: z - sleeperWidth / 2 });
        const p2Bottom = project({ x: sleeperRight, y: 0.32, z: z - sleeperWidth / 2 });
        const p3Bottom = project({ x: sleeperRight, y: 0.32, z: z + sleeperWidth / 2 });
        const p4Bottom = project({ x: sleeperLeft, y: 0.32, z: z + sleeperWidth / 2 });

        // Draw Sleeper Face
        ctx.fillStyle = 'rgba(51, 65, 85, 0.18)';
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.lineTo(p4[0], p4[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw 3D sides of sleepers
        ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p1Bottom[0], p1Bottom[1]);
        ctx.lineTo(p4Bottom[0], p4Bottom[1]);
        ctx.lineTo(p4[0], p4[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p2[0], p2[1]);
        ctx.lineTo(p2Bottom[0], p2Bottom[1]);
        ctx.lineTo(p3Bottom[0], p3Bottom[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Standard fastener bolts
        const drawFastener = (fx: number) => {
          const bp = project({ x: fx, y: 0.18, z });
          ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
          ctx.beginPath();
          ctx.arc(bp[0], bp[1], 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.9)';
          ctx.stroke();
        };

        drawFastener(-railOffset - 0.1);
        drawFastener(-railOffset + 0.1);
        drawFastener(railOffset - 0.1);
        drawFastener(railOffset + 0.1);
      }

      // 2. Draw Ballast wireframe floor 
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 0.5;
      for (let gz = -2.5; gz <= 2.5; gz += 0.5) {
        const bpL = project({ x: -1.7, y: 0.32, z: gz });
        const bpR = project({ x: 1.7, y: 0.32, z: gz });
        ctx.beginPath();
        ctx.moveTo(bpL[0], bpL[1]);
        ctx.lineTo(bpR[0], bpR[1]);
        ctx.stroke();
      }

      // 3. Draw Left Rail Line (Solid metallic wireframe structure)
      ctx.beginPath();
      const pStartL = project(leftRailPoints[0]);
      ctx.moveTo(pStartL[0], pStartL[1]);
      for (let i = 1; i < leftRailPoints.length; i++) {
        const p = project(leftRailPoints[i]);
        ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Lower segment of left rail
      ctx.beginPath();
      const pStartLowerL = project({ x: leftRailPoints[0].x, y: 0.28, z: leftRailPoints[0].z });
      ctx.moveTo(pStartLowerL[0], pStartLowerL[1]);
      for (let i = 1; i < leftRailPoints.length; i++) {
        const p = project({ x: leftRailPoints[i].x, y: 0.28, z: leftRailPoints[i].z });
        ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vertical connector ribs for metal grid
      for (let i = 0; i < leftRailPoints.length; i += 4) {
        const pTop = project(leftRailPoints[i]);
        const pBottom = project({ x: leftRailPoints[i].x, y: 0.28, z: leftRailPoints[i].z });
        ctx.beginPath();
        ctx.moveTo(pTop[0], pTop[1]);
        ctx.lineTo(pBottom[0], pBottom[1]);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.stroke();
      }

      // 4. Draw Right Rail Line
      ctx.beginPath();
      const pStartR = project(rightRailPoints[0]);
      ctx.moveTo(pStartR[0], pStartR[1]);
      for (let i = 1; i < rightRailPoints.length; i++) {
        const p = project(rightRailPoints[i]);
        ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      const pStartLowerR = project({ x: rightRailPoints[0].x, y: 0.28, z: rightRailPoints[0].z });
      ctx.moveTo(pStartLowerR[0], pStartLowerR[1]);
      for (let i = 1; i < rightRailPoints.length; i++) {
        const p = project({ x: rightRailPoints[i].x, y: 0.28, z: rightRailPoints[i].z });
        ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < rightRailPoints.length; i += 4) {
        const pTop = project(rightRailPoints[i]);
        const pBottom = project({ x: rightRailPoints[i].x, y: 0.28, z: rightRailPoints[i].z });
        ctx.beginPath();
        ctx.moveTo(pTop[0], pTop[1]);
        ctx.lineTo(pBottom[0], pBottom[1]);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.stroke();
      }

      // 5. Draw Floating Drone Inspector
      const droneZ = Math.sin(Date.now() / 1200) * 1.5;
      const droneY = -0.7 + Math.sin(Date.now() / 300) * 0.03; // drone slight bobbing
      const dronePoints: Point3D[] = [
        { x: -0.2, y: droneY, z: droneZ - 0.2 },
        { x: 0.2, y: droneY, z: droneZ - 0.2 },
        { x: 0.2, y: droneY, z: droneZ + 0.2 },
        { x: -0.2, y: droneY, z: droneZ + 0.2 },
        { x: 0, y: droneY - 0.12, z: droneZ } // top point
      ];

      const projD = dronePoints.map(project);
      
      // Draw drone wireframe
      ctx.fillStyle = 'rgba(14, 165, 233, 0.25)';
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.moveTo(projD[0][0], projD[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(projD[i][0], projD[i][1]);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top prism lines
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(projD[i][0], projD[i][1]);
        ctx.lineTo(projD[4][0], projD[4][1]);
        ctx.stroke();
      }

      // Drone Rotors
      const rotorRadius = 8;
      const tNow = Date.now() / 30;
      const drawRotor = (px: number, py: number) => {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.ellipse(px, py, rotorRadius, 2, tNow, 0, Math.PI * 2);
        ctx.stroke();
      };
      drawRotor(projD[0][0], projD[0][1]);
      drawRotor(projD[1][0], projD[1][1]);
      drawRotor(projD[2][0], projD[2][1]);
      drawRotor(projD[3][0], projD[3][1]);

      // Laser Scanner Cone Beam (Projects down to tracks)
      const grad = ctx.createLinearGradient(projD[4][0], projD[4][1], width / 2, height / 2.1);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      
      // Laser sweep triangle
      const laserWidth = 1.25;
      const beamL = project({ x: -laserWidth, y: 0.2, z: scanLineZ });
      const beamR = project({ x: laserWidth, y: 0.2, z: scanLineZ });

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(projD[4][0], projD[4][1]);
      ctx.lineTo(beamL[0], beamL[1]);
      ctx.lineTo(beamR[0], beamR[1]);
      ctx.closePath();
      ctx.fill();

      // Bright laser line across the track
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.95)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(beamL[0], beamL[1]);
      ctx.lineTo(beamR[0], beamR[1]);
      ctx.stroke();
      // Reset shadows
      ctx.shadowBlur = 0;

      // 6. Draw Defects mapping
      if (defects && defects.length > 0) {
        defects.forEach((defect, dIdx) => {
          // Map defects dynamically to alternating 3D points
          // To make it look real, crack is on left rail, missing bolt is on sleeper fastener, vegetation on right gravel
          let dx = 0;
          let dy = 0.2;
          let dz = 0;

          if (defect.severity === Severity.CRITICAL) {
            dx = -railOffset; // Left rail
            dz = -0.5;
          } else if (defect.severity === Severity.HIGH) {
            dx = railOffset - 0.1; // fastener area
            dz = 0.8;
            dy = 0.18;
          } else {
            dx = railOffset + 0.3; // vegetation side
            dz = -1.2;
            dy = 0.28;
          }

          const defectProj = project({ x: dx, y: dy, z: dz });
          
          // Outer neon pulsing aura
          const auraPulse = 8 + Math.sin(Date.now() / 150) * 4;
          ctx.beginPath();
          ctx.arc(defectProj[0], defectProj[1], auraPulse, 0, Math.PI * 2);
          
          const glowColor = defect.severity === Severity.CRITICAL ? 'rgba(239, 68, 68,' : 
                            defect.severity === Severity.HIGH ? 'rgba(249, 115, 22,' : 
                            'rgba(234, 179, 8,';

          ctx.fillStyle = `${glowColor}0.15)`;
          ctx.fill();
          ctx.strokeStyle = `${glowColor}0.9)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Core warning indicator dot
          ctx.beginPath();
          ctx.arc(defectProj[0], defectProj[1], 3.5, 0, Math.PI * 2);
          ctx.fillStyle = defect.severity === Severity.CRITICAL ? '#ef4444' : 
                          defect.severity === Severity.HIGH ? '#f97316' : '#eab308';
          ctx.fill();

          // Connected 3D UI callout line if selected or hovered
          if (dIdx === activeDefectIndex) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            
            // Draw schematic cursor line pointing to dashboard label
            const labelX = defectProj[0] > width / 2 ? defectProj[0] + 60 : defectProj[0] - 60;
            const labelY = defectProj[1] - 40;
            
            ctx.moveTo(defectProj[0], defectProj[1]);
            ctx.lineTo(labelX, labelY);
            ctx.lineTo(labelX + (defectProj[0] > width / 2 ? 40 : -40), labelY);
            ctx.stroke();
            ctx.setLineDash([]); // Reset dashed

            // Draw glowing 3D box framing the anomaly segment
            const borderSz = 0.15;
            const b1 = project({ x: dx - borderSz, y: dy - borderSz, z: dz - borderSz });
            const b2 = project({ x: dx + borderSz, y: dy - borderSz, z: dz - borderSz });
            const b3 = project({ x: dx + borderSz, y: dy + borderSz, z: dz + borderSz });
            const b4 = project({ x: dx - borderSz, y: dy + borderSz, z: dz + borderSz });

            ctx.strokeStyle = defect.severity === Severity.CRITICAL ? '#ef4444' : '#f97316';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(b1[0], b1[1]);
            ctx.lineTo(b2[0], b2[1]);
            ctx.lineTo(b3[0], b3[1]);
            ctx.lineTo(b4[0], b4[1]);
            ctx.closePath();
            ctx.stroke();
          }
        });
      }

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [rotation, zoom, isScanning, defects, activeDefectIndex]);

  // Handle Dragging / Rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setRotation((prev) => ({
      x: Math.min(Math.max(prev.x + dy * 0.006, -Math.PI / 3), -0.05), // bound pitch
      y: prev.y + dx * 0.006, // infinite yaw
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-[380px] bg-slate-950/95 border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[inset_0_0_40px_rgba(30,41,59,0.5)]">
      {/* 3D Blueprint Canvas */}
      <div 
        className="flex-1 h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Dynamic Hologram HUD info in corners */}
        <div className="absolute top-4 left-4 pointer-events-none space-y-1">
          <div className="text-[10px] font-mono text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            LIVE TELEMETRY TWIN
          </div>
          <p className="text-[9px] font-mono text-slate-500">SEG-X4: PERSPECTIVE 3D PROJECTION</p>
        </div>

        <div className="absolute bottom-4 left-4 flex gap-1 bg-slate-900/60 backdrop-blur-md rounded-lg p-1 border border-white/5">
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
            className="p-1 px-2 text-slate-300 hover:text-white bg-slate-800/50 rounded hover:bg-slate-800 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.15, 0.6))}
            className="p-1 px-2 text-slate-300 hover:text-white bg-slate-800/50 rounded hover:bg-slate-800 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsScanning(s => !s)}
            className={`p-1 px-2 rounded cursor-pointer ${isScanning ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'bg-slate-800/50 text-slate-300'}`}
            title="Toggle Scanning Laser"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* UI Legend Helper */}
        <div className="absolute top-4 right-4 pointer-events-none text-right">
          <div className="bg-slate-900/80 backdrop-blur-sm p-1.5 px-2.5 rounded-lg border border-white/10 text-[9px] font-mono text-slate-400 space-y-0.5">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>Steel Rail Wireframe</span>
            </div>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Ballast Field Ties</span>
            </div>
            {defects.length > 0 && (
              <div className="flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-red-400 font-extrabold font-sans">
                  {defects.length} Fault {defects.length === 1 ? 'Point' : 'Points'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3D Core Diagnostics sidebar status card */}
      <div className="w-full md:w-64 bg-slate-900/65 border-t md:border-t-0 md:border-l border-white/10 p-4 shrink-0 flex flex-col justify-between backdrop-blur-xl">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              {isRTL ? 'بيانات التوأم الرقمي' : 'TWIN METRICS'}
            </h4>
            <span className={`text-[8px] font-mono rounded px-1.5 py-0.5 border ${
              defects.length > 0 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              {defects.length > 0 ? 'STRESS DEVIATION' : 'NOMINAL STATE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
              <p className="text-[8px] font-mono text-slate-500 uppercase">{isRTL ? 'معدل السلامة' : 'INTEGRITY'}</p>
              <p className={`text-sm font-black font-mono tracking-tight ${
                stats.integrity < 80 ? 'text-red-400' : stats.integrity < 95 ? 'text-amber-400' : 'text-emerald-400'
              }`}>{stats.integrity}%</p>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
              <p className="text-[8px] font-mono text-slate-500 uppercase">{isRTL ? 'حرارة السكة' : 'TEMP'}</p>
              <p className="text-sm font-black font-mono text-slate-300 tracking-tight">{stats.temperature}</p>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
              <p className="text-[8px] font-mono text-slate-500 uppercase">{isRTL ? 'إجهاد الضغط' : 'AXIAL STRESS'}</p>
              <p className="text-sm font-black font-mono text-slate-300 tracking-tight">{stats.stress}</p>
            </div>
            <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5">
              <p className="text-[8px] font-mono text-slate-500 uppercase">{isRTL ? 'معدل الاهتزاز' : 'VIBRATION'}</p>
              <p className="text-sm font-black font-mono text-slate-300 tracking-tight">{stats.vibration}</p>
            </div>
          </div>

          {/* Connected defect locator tab */}
          {defects.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">{isRTL ? 'موقع العيب المكتشف' : 'LOCAL ENVIRONMENT FAULTS'}</p>
              <div className="max-h-[110px] overflow-y-auto custom-scrollbar space-y-1">
                {defects.map((def, idx) => (
                  <button
                    key={def.id}
                    onClick={() => setActiveDefectIndex(idx)}
                    className={`w-full text-left p-1.5 rounded border text-[9px] flex items-center justify-between transition-all cursor-pointer ${
                      idx === activeDefectIndex 
                        ? 'bg-red-500/10 border-red-500/30 text-red-200' 
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <span className="truncate max-w-[124px] font-semibold">
                      {isRTL 
                        ? (def.type === 'CRACK' ? 'شرخ بالقضيب' : def.type === 'MISSING_BOLT' ? 'برغي ربط مفقود' : 'نمو نباتي')
                        : def.type.replace('_', ' ')}
                    </span>
                    <span className={`text-[8px] font-mono font-black py-0.2 px-1 rounded uppercase tracking-tighter ${
                      def.severity === Severity.CRITICAL ? 'bg-red-500/10 text-red-400' :
                      def.severity === Severity.HIGH ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {def.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/30 border border-emerald-500/10 p-3 rounded-lg flex items-center gap-2.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-[10px] font-medium leading-normal">{isRTL ? 'كافة القطع الهيكلية تطابق معايير السلامة الهندسية.' : 'All structural points align fully with structural safety scales.'}</p>
            </div>
          )}
        </div>

        <div className="pt-2 text-[8px] font-mono text-slate-500 leading-normal border-t border-white/5 flex items-center justify-between">
          <span>COORDS: X / Y / Z GRID</span>
          <span>FPS: 60/60</span>
        </div>
      </div>
    </div>
  );
}
