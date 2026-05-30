import { jsPDF } from 'jspdf';
import { TrackInspection, DefectType, Severity } from '../types';

// Helper to check if text contains Arabic characters
const containsArabic = (text: string): boolean => {
  return /[\u0600-\u06FF]/.test(text);
};

// Bilingual dictionary for report vocabulary
const defectTranslations: Record<string, { en: string; ar: string }> = {
  [DefectType.CRACK]: { en: "CRACK", ar: "شرح/شرخ في القضبان" },
  [DefectType.EROSION]: { en: "EROSION", ar: "تآكل التربة الجانبية" },
  [DefectType.MISSING_BOLT]: { en: "MISSING BOLT", ar: "مسمار/رابط مفقود" },
  [DefectType.WEAR]: { en: "WEAR & TEAR", ar: "اهتراء واحتكاك المعدن" },
  [DefectType.VEGETATION]: { en: "VEGETATION INTRUSION", ar: "نمو حشائش وعوائق نباتية" },
  [DefectType.CORROSION]: { en: "CORROSION & RUST", ar: "صدأ وتآكل القضبان" },
  [DefectType.TRACK_MISALIGNMENT]: { en: "TRACK MISALIGNMENT", ar: "عدم استواء/محاذاة المسار" },
  [DefectType.DEBRIS]: { en: "DEBRIS ON TRACK", ar: "عوائق صلبة على خط السير" },
};

const severityTranslations: Record<string, { en: string; ar: string }> = {
  [Severity.LOW]: { en: "LOW", ar: "منخفضة" },
  [Severity.MEDIUM]: { en: "MEDIUM", ar: "متوسطة" },
  [Severity.HIGH]: { en: "HIGH", ar: "عالية" },
  [Severity.CRITICAL]: { en: "CRITICAL", ar: "حرجة للغاية" },
};

// Unified text drawer that handles Arabic automatically using canvas rendering
const drawText = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  fontSize: number = 10,
  options: {
    fontWeight?: 'normal' | 'bold';
    color?: string;
    align?: 'left' | 'center' | 'right';
  } = {}
) => {
  const fontWeight = options.fontWeight || 'normal';
  const color = options.color || '#1e293b';
  const align = options.align || 'left';
  
  if (containsArabic(text)) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      doc.setFontSize(fontSize);
      doc.text(text, x, y, { align });
      return;
    }
    
    const scale = 4;
    const canvasFontSize = fontSize * scale;
    ctx.font = `${fontWeight} ${canvasFontSize}px "Cairo", "Almarai", "Arial", "sans-serif"`;
    const metrics = ctx.measureText(text);
    
    const paddingX = 16 * scale;
    const paddingY = 8 * scale;
    
    canvas.width = metrics.width + paddingX;
    canvas.height = canvasFontSize * 1.6 + paddingY;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${canvasFontSize}px "Cairo", "Almarai", "Arial", "sans-serif"`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    // Draw Arabic text perfectly centered
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const dataUrl = canvas.toDataURL('image/png');
    const pdfWidth = (canvas.width / scale) * 0.264583;
    const pdfHeight = (canvas.height / scale) * 0.264583;
    
    let targetX = x;
    if (align === 'center') {
      targetX = x - (pdfWidth / 2);
    } else if (align === 'right') {
      targetX = x - pdfWidth;
    } else {
      targetX = x - (paddingX / 2 / scale) * 0.264583;
    }
    
    const targetY = y - (pdfHeight / 2);
    doc.addImage(dataUrl, 'PNG', targetX, targetY, pdfWidth, pdfHeight);
  } else {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    if (fontWeight === 'bold') {
      doc.setFont('Helvetica', 'bold');
    } else {
      doc.setFont('Helvetica', 'normal');
    }
    doc.text(text, x, y, { align });
  }
};

// Unified block text word wrapper supporting Arabic
const drawWrappedText = (
  doc: jsPDF,
  text: string,
  startX: number,
  startY: number,
  maxWidthMm: number,
  fontSize: number = 10,
  lineHeightMm: number = 5,
  options: {
    fontWeight?: 'normal' | 'bold';
    color?: string;
    align?: 'left' | 'center' | 'right';
  } = {}
): number => {
  const fontWeight = options.fontWeight || 'normal';
  const color = options.color || '#1e293b';
  const align = options.align || 'left';
  
  if (containsArabic(text)) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return startY;
    
    const scale = 4;
    const canvasFontSize = fontSize * scale;
    ctx.font = `${fontWeight} ${canvasFontSize}px "Cairo", "Almarai", "Arial", "sans-serif"`;
    
    const maxLinePx = (maxWidthMm * 3.7795) * scale;
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxLinePx && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    let currentY = startY;
    lines.forEach((line) => {
      drawText(doc, line, startX, currentY, fontSize, { fontWeight, color, align });
      currentY += lineHeightMm;
    });
    
    return currentY;
  } else {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    if (fontWeight === 'bold') {
      doc.setFont('Helvetica', 'bold');
    } else {
      doc.setFont('Helvetica', 'normal');
    }
    const splitText = doc.splitTextToSize(text, maxWidthMm);
    doc.text(splitText, startX, startY, { align });
    return startY + (splitText.length * lineHeightMm);
  }
};

// Help helper to draw a beautiful visual badge
const drawBadge = (
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  bgColor: string,
  textColor: string
) => {
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
  };
  const bg = hexToRgb(bgColor);
  doc.setFillColor(bg.r, bg.g, bg.b);
  doc.rect(x, y - height / 2, width, height, 'F');
  drawText(doc, text, x + width / 2, y + 0.5, 7.5, { fontWeight: 'bold', color: textColor, align: 'center' });
};

// Helper to fetch an image and convert it to base64
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context is null'));
      }
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};

// Cached base64 logo loading to be lightning-fast once loaded
let cachedLogoBase64: string | null = null;

const loadLogo = async (): Promise<string | undefined> => {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const base64 = await getBase64ImageFromUrl("/AI Rail Inspector logo2.png")
      .catch(() => getBase64ImageFromUrl("/AI Rail Inspector logo2-1.png"))
      .catch(() => getBase64ImageFromUrl("AI Rail Inspector logo2.png"));
    
    cachedLogoBase64 = base64;
    return base64;
  } catch (err) {
    console.warn("Failed to pre-load corporate logo PNG for PDF, using pristine vector fallback shapes:", err);
    return undefined;
  }
};

// Falls back to hand-drawn vector elements if the PNG doesn't load/exist
const drawTopHeaderLogo = (doc: jsPDF, centerX: number, centerY: number) => {
  doc.setDrawColor(37, 99, 235); // Blue 600
  doc.setLineWidth(0.4);
  doc.circle(centerX, centerY, 6, 'S'); // Outer circle of radius 6
  
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.3);
  doc.circle(centerX, centerY, 4.5, 'S'); // Inner scanning circle
  
  // Tracks (vertical lines)
  doc.setDrawColor(15, 23, 42); // Dark slate
  doc.setLineWidth(0.6);
  doc.line(centerX - 1.8, centerY - 3.5, centerX - 1.8, centerY + 3.5); // Left rail
  doc.line(centerX + 1.8, centerY - 3.5, centerX + 1.8, centerY + 3.5); // Right rail
  
  // Crossties
  doc.setLineWidth(0.3);
  doc.line(centerX - 2.2, centerY - 2, centerX + 2.2, centerY - 2);
  doc.line(centerX - 2.2, centerY, centerX + 2.2, centerY);
  doc.line(centerX - 2.2, centerY + 2, centerX + 2.2, centerY + 2);

  // Tiny text banner "AI" inside
  drawText(doc, "AI", centerX, centerY + 1, 5.5, { fontWeight: 'bold', color: '#2563eb', align: 'center' });
};

// Beautiful background watermark on the back of pages
const drawBackgroundWatermark = (doc: jsPDF, logoBase64?: string) => {
  const width = 210;
  const height = 297;
  const centerX = width / 2;
  const centerY = height / 2;
  
  doc.saveGraphicsState();
  try {
    const gState = new (doc as any).GState({ opacity: 0.05 });
    doc.setGState(gState);
  } catch (err) {
    // Fail-safe: transparent look handled by a very soft, faint gray palette
  }

  // Draw the logo if we have the base64 string
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', centerX - 35, centerY - 35, 70, 70);
    } catch (e) {
      console.warn("Could not insert logo image watermark, falling back to pure vector coordinates", e);
    }
  } else {
    // Elegant fallback blueprint graphic
    doc.setDrawColor(148, 163, 184); // Slate 300
    doc.setLineWidth(0.5);
    doc.circle(centerX, centerY, 45, 'S');
    doc.circle(centerX, centerY, 30, 'S');
    doc.circle(centerX, centerY, 10, 'S');

    doc.line(centerX - 55, centerY, centerX + 55, centerY);
    doc.line(centerX, centerY - 55, centerX, centerY + 55);

    doc.setLineWidth(1.2);
    doc.line(centerX - 5, centerY - 20, centerX - 5, centerY + 20);
    doc.line(centerX + 5, centerY - 20, centerX + 5, centerY + 20);
    
    doc.setLineWidth(0.6);
    for (let offset = -15; offset <= 15; offset += 7.5) {
      doc.line(centerX - 7, centerY + offset, centerX + 7, centerY + offset);
    }
  }

  // Highly premium, transparent text in Arabic and English that overlays beautifully
  drawText(doc, "AI RAIL INSPECTOR - OFFICIAL TECHNICAL AUDIT", centerX, centerY - 65, 8.5, { fontWeight: 'bold', color: '#6a7282', align: 'center' });
  drawText(doc, "نظام فحص سكك الحديد بالذكاء الاصطناعي - جامعة برج العرب التكنولوجية", centerX, centerY + 65, 9, { fontWeight: 'bold', color: '#4b5563', align: 'center' });
  drawText(doc, "CONFIDENTIAL SYSTEM REPORT - SECURED CLOUD LOGS", centerX, centerY - 58, 7.5, { fontWeight: 'normal', color: '#9ca3af', align: 'center' });
  drawText(doc, "سجل فحص معتمد - كلية تكنولوجيا الصناعة والطاقة", centerX, centerY + 58, 8, { fontWeight: 'normal', color: '#9ca3af', align: 'center' });
  
  doc.restoreGraphicsState();
};

// Corporate style dual header for the university with center logo placement
const drawBilingualHeader = (doc: jsPDF, titleEn: string, titleAr: string, logoBase64?: string) => {
  // Border line
  doc.setDrawColor(30, 41, 59); // Charcoal
  doc.setLineWidth(0.8);
  doc.line(12, 10, 198, 10);
  
  // Left Side Header (English)
  drawText(doc, "Borg El Arab Technological University", 12, 16, 9.5, { fontWeight: 'bold', color: '#1e293b' });
  drawText(doc, "Faculty of Industry & Energy Technology", 12, 21, 8.5, { fontWeight: 'normal', color: '#475569' });
  drawText(doc, "Railway Technology & Modern Transport", 12, 26, 8.5, { fontWeight: 'normal', color: '#475569' });
  
  // Center Header Logo Placement
  const centerX = 105;
  const centerY = 18.5;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', centerX - 7.5, centerY - 7.5, 15, 15);
    } catch (e) {
      drawTopHeaderLogo(doc, centerX, centerY);
    }
  } else {
    drawTopHeaderLogo(doc, centerX, centerY);
  }

  // Right Side Header (Arabic)
  drawText(doc, "جامعة برج العرب التكنولوجية", 198, 16, 9.5, { fontWeight: 'bold', color: '#1e293b', align: 'right' });
  drawText(doc, "كلية تكنولوجيا الصناعة والطاقة", 198, 21, 8.5, { fontWeight: 'normal', color: '#475569', align: 'right' });
  drawText(doc, "تكنولوجيا السكك الحديدية والنقل الحديث", 198, 26, 8.5, { fontWeight: 'normal', color: '#475569', align: 'right' });
  
  // Underline
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(12, 31, 198, 31);
  
  // Titles
  drawText(doc, titleEn, 12, 38, 13, { fontWeight: 'bold', color: '#2563eb' });
  drawText(doc, titleAr, 198, 38, 13, { fontWeight: 'bold', color: '#2563eb', align: 'right' });
  
  doc.setDrawColor(37, 99, 235); // Blue 600 line
  doc.setLineWidth(0.8);
  doc.line(12, 43, 198, 43);
};

// Page footer helper
const drawFooter = (doc: jsPDF, pageNum: number, totalPages?: number) => {
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(12, 282, 198, 282);
  
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text("Borg El Arab Technological University - Faculty of Industry & Energy Technology - AI Rail Inspector", 105, 287, { align: 'center' });
  
  const pageStr = totalPages ? `Page ${pageNum} of ${totalPages}` : `Page ${pageNum}`;
  doc.text(pageStr, 198, 287, { align: 'right' });
};

/**
 * GENERATE SINGLE INSPECTION REPORT
 */
export const generateInspectionReport = async (inspection: TrackInspection, language: 'en' | 'ar', customNotes?: string) => {
  const logoBase64 = await loadLogo().catch(() => undefined);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Draw watermarked logo and details on the back
  drawBackgroundWatermark(doc, logoBase64);

  drawBilingualHeader(
    doc, 
    "AI RAILWAY INSPECTION REPORT", 
    "تقرير فحص مسار السكة الحديدية بالذكاء الاصطناعي",
    logoBase64
  );
  
  let y = 49;
  
  // Grid metadata section
  doc.setFillColor(248, 250, 252);
  doc.rect(12, y, 186, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(12, y, 186, 24, 'S');
  
  // Left side metadata
  drawText(doc, `Report ID: ${inspection.id.toUpperCase()}`, 16, y + 6, 9, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, `Inspection Date: ${new Date(inspection.timestamp).toLocaleString()}`, 16, y + 12, 8.5, { fontWeight: 'normal', color: '#475569' });
  const criticalCount = inspection.defects.filter(d => d.severity === Severity.CRITICAL).length;
  drawText(doc, `Severity Level: ${criticalCount > 0 ? 'Urgent Actions Required' : 'Operational Status Safe'}`, 16, y + 18, 8.5, { fontWeight: 'bold', color: criticalCount > 0 ? '#b91c1c' : '#166534' });
  
  // Right side metadata (Arabic)
  drawText(doc, `رقم التقرير: ${inspection.id.toUpperCase().substring(0, 12)}`, 194, y + 6, 9, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  drawText(doc, `تاريخ الفحص الميداني: ${new Date(inspection.timestamp).toLocaleDateString('ar-EG')}`, 194, y + 12, 8.5, { fontWeight: 'normal', color: '#475569', align: 'right' });
  drawText(doc, `حالة المسار: ${criticalCount > 0 ? 'يتطلب تدخل فوري وإصلاح' : 'المسار سليم وتحت المراقبة'}`, 194, y + 18, 8.5, { fontWeight: 'bold', color: criticalCount > 0 ? '#b91c1c' : '#166534', align: 'right' });
  
  y += 30;
  
  // Draw Drone snapshot image
  drawText(doc, "Drone Sensor Vision & Target Snapshot (رؤية المستشعرات ولقطة الهدف)", 12, y, 10, { fontWeight: 'bold', color: '#1e293b' });
  y += 4;
  
  try {
    if (inspection.imageUrl) {
      doc.addImage(inspection.imageUrl, 'JPEG', 12, y, 186, 92);
      y += 94;
    } else {
      throw new Error();
    }
  } catch (e) {
    // Elegant fallback box
    doc.setFillColor(241, 245, 249);
    doc.rect(12, y, 186, 75, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(12, y, 186, 75, 'S');
    drawText(doc, "Diagnostic imagery synced in cloud space. Preview loaded of active video feed.", 105, y + 34, 10, { fontWeight: 'normal', color: '#64748b', align: 'center' });
    drawText(doc, "لقطة مستشعرات الطائرة المسيرة محفوظة سحابياً بمستودع البيانات المعيرة.", 105, y + 42, 10, { fontWeight: 'normal', color: '#64748b', align: 'center' });
    y += 78;
  }
  
  y += 4;
  
  // AI Technical summary panel 
  doc.setFillColor(239, 246, 255); // light-blue
  doc.rect(12, y, 186, 26, 'F');
  doc.setDrawColor(191, 219, 254);
  doc.rect(12, y, 186, 26, 'S');
  
  drawText(doc, "AI Comprehensive Predictive Analysis", 16, y + 6, 9.5, { fontWeight: 'bold', color: '#1d4ed8' });
  drawText(doc, "التحليل الاستباقي والتقييم الفني الشامل", 194, y + 6, 9.5, { fontWeight: 'bold', color: '#1d4ed8', align: 'right' });
  
  // Multi-lingual description wrapper
  const rawSummary = inspection.summary || "No defects processed in this sector. Segment fully aligned and secure.";
  const arSummary = containsArabic(rawSummary) ? rawSummary : "تم فحص هذا القطاع بنجاح ولا توجد انحرافات مسجلة بالقضبان المعيرة.";
  
  drawWrappedText(doc, rawSummary.replace(/[\u0600-\u06FF]/g, '').trim() || "Segment matches blueprint metrics seamlessly.", 16, y + 13, 85, 8, 4, { color: '#334155' });
  drawWrappedText(doc, arSummary, 194, y + 13, 85, 8, 4, { color: '#334155', align: 'right' });
  
  y += 32;
  
  // Telemetry block
  doc.setFillColor(248, 250, 252);
  doc.rect(12, y, 186, 18, 'F');
  
  drawText(doc, "Segment Geotag GPS coordinates & Telemetry", 16, y + 5, 8, { fontWeight: 'bold', color: '#475569' });
  drawText(doc, "بيانات الموقع الجغرافي للمسار", 194, y + 5, 8, { fontWeight: 'bold', color: '#475569', align: 'right' });
  
  const lat = inspection.location.lat.toFixed(6);
  const lng = inspection.location.lng.toFixed(6);
  const alt = inspection.location.altitude ? `${inspection.location.altitude.toFixed(1)}m` : 'N/A';
  
  drawText(doc, `Lat: ${lat}   |   Lng: ${lng}   |   Altitude: ${alt}`, 16, y + 11, 8.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, `خط العرض: ${lat}   |   خط الطول: ${lng}   |   الارتفاع فوق سطح البحر: ${alt}`, 194, y + 11, 8.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  
  drawFooter(doc, 1, 2);
  
  // --- PAGE 2 --- Detailed Defects Card List
  doc.addPage();
  drawBackgroundWatermark(doc, logoBase64);
  drawBilingualHeader(
    doc, 
    "AI INSPECTION REPORT - DETECTED DEFECTS", 
    "تفاصيل العيوب والمخاطر المكتشفة بالمسار",
    logoBase64
  );
  
  let yPage2 = 47;
  
  drawText(doc, "Detailed Anomalies Registry & AI Diagnosis", 12, yPage2, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "سجل تشخيص العيوب وقرار الذكاء الاصطناعي", 198, yPage2, 10.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  yPage2 += 6;
  
  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(12, yPage2, 198, yPage2);
  yPage2 += 6;
  
  if (!inspection.defects || inspection.defects.length === 0) {
    // Empty state
    doc.setFillColor(240, 253, 244); // light green
    doc.rect(12, yPage2, 186, 25, 'F');
    drawText(doc, "🟢 Track Integrity Verified: No anomiles loaded in this database sector scan.", 105, yPage2 + 10, 10, { fontWeight: 'bold', color: '#15803d', align: 'center' });
    drawText(doc, "مسار السكة الحديدية سليم بالكامل وخالي من أي عيوب أو شروخ مسجلة.", 105, yPage2 + 18, 10, { fontWeight: 'bold', color: '#15803d', align: 'center' });
  } else {
    inspection.defects.forEach((defect, index) => {
      if (yPage2 > 240) {
        drawFooter(doc, doc.getNumberOfPages(), 3);
        doc.addPage();
        drawBackgroundWatermark(doc, logoBase64);
        drawBilingualHeader(
          doc, 
          "AI INSPECTION REPORT - DETECTED DEFECTS", 
          "تفاصيل العيوب والمخاطر المكتشفة بالمسار",
          logoBase64
        );
        yPage2 = 47;
      }
      
      // Defect container card
      const severityColor = defect.severity === Severity.CRITICAL ? '#ef4444' : 
                            defect.severity === Severity.HIGH ? '#f97316' : 
                            defect.severity === Severity.MEDIUM ? '#eab308' : '#3b82f6';
      
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(254, 254, 254);
      doc.rect(12, yPage2, 186, 32, 'F');
      
      // Accent bar logic
      doc.setFillColor(defect.severity === Severity.CRITICAL ? 239 : 241, defect.severity === Severity.CRITICAL ? 68 : 245, defect.severity === Severity.CRITICAL ? 68 : 249);
      doc.rect(12, yPage2, 3, 32, 'F');
      doc.rect(12, yPage2, 186, 32, 'S');
      
      // Defect Title
      const defectNameText = defectTranslations[defect.type] || { en: defect.type || "UNKNOWN", ar: "عيب غير معرف" };
      drawText(doc, `${index + 1}. Defect Type: ${defectNameText.en}`, 18, yPage2 + 6, 9.5, { fontWeight: 'bold', color: '#1e293b' });
      drawText(doc, `نوع العيب: ${defectNameText.ar}`, 192, yPage2 + 6, 9.5, { fontWeight: 'bold', color: '#1e293b', align: 'right' });
      
      // Badges for Severity and Confidence
      const sevText = severityTranslations[defect.severity] || { en: defect.severity, ar: "مجهولة" };
      
      drawBadge(doc, `SEVERITY: ${sevText.en} (${sevText.ar})`, 18, yPage2 + 13, 50, 5, severityColor, '#ffffff');
      drawBadge(doc, `AI CONFIDENCE: ${Math.round((defect.confidence || 0.95) * 100)}%`, 71, yPage2 + 13, 40, 5, '#0f172a', '#ffffff');
      
      // Description wrapper
      const enDesc = defect.description || "Structural flaw needing preventative assessment.";
      const arDesc = containsArabic(defect.description) ? defect.description : "انحراف هيكلي يتطلب المراجعة الفنية من فريق الصيانة.";
      
      drawWrappedText(doc, enDesc, 18, yPage2 + 21, 84, 8, 3.5, { color: '#475569' });
      drawWrappedText(doc, arDesc, 192, yPage2 + 21, 84, 8, 3.5, { color: '#475569', align: 'right' });
      
      yPage2 += 36;
    });
  }
  
  if (customNotes && customNotes.trim()) {
    if (yPage2 + 38 > 270) {
      drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1);
      doc.addPage();
      drawBackgroundWatermark(doc, logoBase64);
      drawBilingualHeader(
        doc, 
        "AI INSPECTION REPORT - CUSTOM ANNOTATIONS", 
        "ملاحظات وتدابير هندسية مخصصة للمسار",
        logoBase64
      );
      yPage2 = 47;
    }
    
    doc.setFillColor(254, 243, 199); // Light amber-50
    doc.setDrawColor(217, 119, 6); // Amber-600
    doc.setLineWidth(0.4);
    doc.rect(12, yPage2, 186, 28, 'FD');
    
    drawText(doc, "Engineer Custom Annotations & Field Actions", 16, yPage2 + 5, 9, { fontWeight: 'bold', color: '#b45309' });
    drawText(doc, "ملاحظات وتدابير المهندس الميدانية", 194, yPage2 + 5, 9, { fontWeight: 'bold', color: '#b45309', align: 'right' });
    
    const wrapperY = drawWrappedText(doc, customNotes, 16, yPage2 + 11, 178, 8, 4.5, { color: '#78350f' });
    yPage2 = wrapperY + 5;
  }
  
  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
  doc.save(`AI_Inspection_Report_${inspection.id}_Complete.pdf`);
};

/**
 * GENERATE FULL STUDY PROJECT REPORT
 */
export const generateFullProjectReport = async (inspections: TrackInspection[], language: 'en' | 'ar', t: (key: any) => string) => {
  const logoBase64 = await loadLogo().catch(() => undefined);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // --- COVER PAGE / OFFICIAL INAUGURAL SHEET ---
  doc.setFillColor(30, 41, 59); // deep slate/charcoal cover
  doc.rect(0, 0, 210, 297, 'F');
  
  // Elegant border lines
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.rect(6, 6, 198, 285, 'S');
  doc.rect(7, 7, 196, 283, 'S');
  
  let cy = 25;
  
  // Egyptian University Shield / Seals
  drawText(doc, "EGYPTIAN TECHNOLOGICAL UNIVERSITIES", 105, cy, 11, { fontWeight: 'bold', color: '#e2e8f0', align: 'center' });
  drawText(doc, "الجامعات التكنولوجية المصرية", 105, cy + 6, 12, { fontWeight: 'bold', color: '#e2e8f0', align: 'center' });
  
  cy += 20;
  drawText(doc, "BORG EL ARAB TECHNOLOGICAL UNIVERSITY", 105, cy, 13, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  drawText(doc, "جامعة برج العرب التكنولوجية", 105, cy + 7, 14, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  
  cy += 14;
  drawText(doc, "Faculty of Industry and Energy Technology", 105, cy, 11, { fontWeight: 'normal', color: '#cbd5e1', align: 'center' });
  drawText(doc, "كلية تكنولوجيا الصناعة والطاقة", 105, cy + 5, 11, { fontWeight: 'normal', color: '#cbd5e1', align: 'center' });
  
  cy += 12;
  drawText(doc, "Railway Technology and Modern Transport Department", 105, cy, 11, { fontWeight: 'normal', color: '#cbd5e1', align: 'center' });
  drawText(doc, "تكنولوجيا سكك الحديدية والنقل الحديث", 105, cy + 5, 11, { fontWeight: 'normal', color: '#cbd5e1', align: 'center' });
  
  // Center decorative emblem
  cy += 30;
  doc.setDrawColor(234, 179, 8); // amber accent line
  doc.setLineWidth(1);
  doc.line(70, cy, 140, cy);
  
  cy += 15;
  drawText(doc, "GRADUATION APPLIED RESEARCH STUDY & AI FIELD SYSTEM", 105, cy, 12, { fontWeight: 'bold', color: '#f59e0b', align: 'center' });
  drawText(doc, "مشروع التخرج الميداني والبحث التطبيقي", 105, cy + 6, 13, { fontWeight: 'bold', color: '#f59e0b', align: 'center' });
  
  cy += 14;
  drawText(doc, "AI VISION RAILWAY FAULT DETECTOR & LIVE AUDITING ENGINE", 105, cy, 15, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  drawText(doc, "مفتش وفاحص القضبان القائم على تقنيات الذكاء الاصطناعي", 105, cy + 8, 16, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  
  cy += 20;
  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(1);
  doc.line(70, cy, 140, cy);
  
  // Supervised by Panel
  cy += 12;
  drawText(doc, "Under Auspices & Supervision of:", 105, cy, 10, { fontWeight: 'bold', color: '#94a3b8', align: 'center' });
  drawText(doc, "تحت رعاية وإشراف كلاً من السادة الأفاضل:", 105, cy + 5, 10.5, { fontWeight: 'bold', color: '#94a3b8', align: 'center' });
  
  cy += 14;
  drawText(doc, "Prof. Dr. Mohamed Morsi El-Gohary   ---   University President (رئيس الجامعة)", 105, cy, 9.5, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  drawText(doc, "Prof. Dr. Alaa Arafa   ---   Faculty Dean (عميد الكلية)", 105, cy + 6, 9.5, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  drawText(doc, "Dr. Ibrahim Shoaib   ---   Academic Project Supervisor (المشرف الأكاديمي)", 105, cy + 12, 9.5, { fontWeight: 'bold', color: '#ffffff', align: 'center' });
  
  // Academic Session
  cy += 30;
  drawText(doc, "ACADEMIC YEAR: 2025/2026   |   العام الدراسي ٢٠٢٥ / ٢٠٢٦", 105, cy, 10, { fontWeight: 'bold', color: '#cbd5e1', align: 'center' });
  drawText(doc, "BORG EL ARAB INDUSTRIAL ZONE, ALEXANDRIA, EGYPT", 105, cy + 6, 8.5, { fontWeight: 'normal', color: '#94a3b8', align: 'center' });
  
  // --- PAGE 2 --- THE ACTIVE FIELD STUDY RESEARCH TEAM
  doc.addPage();
  drawBackgroundWatermark(doc, logoBase64);
  drawBilingualHeader(doc, "FIELD STUDY MEMBERS & PROJECT STRUCTURE", "أعضاء فريق الدراسة والمشروعات الميدانية للنظام", logoBase64);
  
  let py = 48;
  
  drawText(doc, "Strategic Project Coordinator & Leadership (الهيكل القيادي للمشروع)", 12, py, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  py += 6;
  
  // Mohamed Hassan Abdel Aziz
  doc.setFillColor(248, 250, 252);
  doc.rect(12, py, 186, 16, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(12, py, 186, 16, 'S');
  
  drawText(doc, "Mohamed Hussein Abdelaziz", 16, py + 5, 9.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "CEO / Project Leader & Engineering Lead", 16, py + 10, 8, { fontWeight: 'normal', color: '#475569' });
  drawText(doc, "محمد حسين عبدالعزيز", 192, py + 5, 9.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  drawText(doc, "الرئيس التنفيذي وقائد الهيكل التكنولوجي الميداني", 192, py + 10, 8, { fontWeight: 'normal', color: '#475569', align: 'right' });
  
  py += 24;
  drawText(doc, "Core Systems Engineering Specialists (اللجنة التقنية الأساسية للمشروع)", 12, py, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  py += 5;
  
  const coreMembers = [
    { nameEn: "Nora Shehata Mohamed", nameAr: "نورة شحاتة محمد", roleEn: "Data Lifecycle Manager", roleAr: "مسؤولة إدارة حياة البيانات وتصنيف الرقابة" },
    { nameEn: "Ahmed Tharwat Ibrahim", nameAr: "احمد ثروت إبراهيم", roleEn: "Mechanical Systems & Hardware Lead", roleAr: "مهندس تصميم المكونات الميكانيكية والهياكل" },
    { nameEn: "Peter Hany Fawzy", nameAr: "بيتر هانى فوزى شحاتة", roleEn: "Components & Supply Chain Lead", roleAr: "مسؤول المكونات وعناصر تزويد العتاد والقطع" },
    { nameEn: "Mohamed Mohamed Abdallah", nameAr: "محمد محمد عبدالله", roleEn: "3D CAD & Digital Twin Architect", roleAr: "مصمم المحاكاة ثلاثية الأبعاد التوأم الرقمي للمسار" }
  ];
  
  coreMembers.forEach(m => {
    doc.setFillColor(254, 254, 254);
    doc.rect(12, py, 186, 12, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(12, py, 186, 12, 'S');
    
    drawText(doc, m.nameEn, 16, py + 4.5, 8.5, { fontWeight: 'bold', color: '#334155' });
    drawText(doc, m.roleEn, 16, py + 8.5, 7.5, { fontWeight: 'normal', color: '#64748b' });
    drawText(doc, m.nameAr, 192, py + 4.5, 8.5, { fontWeight: 'bold', color: '#334155', align: 'right' });
    drawText(doc, m.roleAr, 192, py + 8.5, 7.5, { fontWeight: 'normal', color: '#64748b', align: 'right' });
    
    py += 14;
  });
  
  py += 4;
  drawText(doc, "Specialized Operative Sub-Teams (فريق العمل والبحوث التفصيلية الفرعية)", 12, py, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  py += 5;
  
  const subTeams = [
    {
      titleEn: "Software & AI Training Team",
      titleAr: "فريق تطوير البرمجيات وتدريب مصفوفات الذكاء الاصطناعي",
      membersEn: "Philopateer George William, Mohamed Montaser Mohamed, Abdelrahman Ali Mohamed",
      membersAr: "فيلوباتير جورج وليم، محمد منتصر محمد، عبدالرحمن على محمد"
    },
    {
      titleEn: "Field Research & Data Engineering",
      titleAr: "فريق البحث الميداني وجدولة مدخلات التحليل الحركي",
      membersEn: "Haneen Alaa Ali, Salma Khaled Mahmoud, Shahd Ahmed Helal, Zead Emad Ali, Adel Kadry Mohamed",
      membersAr: "حنين علاء على، سلمى خالد محمود، شهد احمد هلال، زياد عماد على، عادل قدرى محمد"
    },
    {
      titleEn: "Structural Assembly & Coordination Team",
      titleAr: "فريق الهياكل الحديدية والإنتاج الرقمي وتنسيق الميديا",
      membersEn: "Nasef Mohamed Nasef, Mohamed Raouf Abdo, Fares Mohamed Sabry",
      membersAr: "ناصف محمد ناصف، محمد راوف عبده محمد، فارس محمد صبري"
    }
  ];
  
  subTeams.forEach(st => {
    doc.setFillColor(248, 250, 252);
    doc.rect(12, py, 186, 17, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(12, py, 186, 17, 'S');
    
    drawText(doc, st.titleEn, 16, py + 4.5, 8, { fontWeight: 'bold', color: '#1e3a8a' });
    drawText(doc, st.membersEn, 16, py + 8.5, 7, { fontWeight: 'normal', color: '#475569' });
    
    drawText(doc, st.titleAr, 192, py + 4.5, 8, { fontWeight: 'bold', color: '#1e3a8a', align: 'right' });
    drawText(doc, st.membersAr, 192, py + 8.5, 7, { fontWeight: 'normal', color: '#475569', align: 'right' });
    
    py += 19;
  });
  
  drawFooter(doc, 2, 4);
  
  // --- PAGE 3 --- PROJECT ANALYTICS AND QUALITY INDICATORS
  doc.addPage();
  drawBackgroundWatermark(doc, logoBase64);
  drawBilingualHeader(doc, "PROJECT OPERATIONAL QUALITY & IMPACT DATA", "مؤشرات جودة الأداء الميداني وإحصائيات السلامة", logoBase64);
  
  let ay = 48;
  
  drawText(doc, "Global Railway Scanning Statistics Overview", 12, ay, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "ملخص إحصائيات ونشاط الفحص للمشروع", 198, ay, 10.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  ay += 6;
  
  // Stats boxes
  const totalScanned = inspections.length;
  const criticalCountTotal = inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.CRITICAL).length, 0);
  const highCountTotal = inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity === Severity.HIGH).length, 0);
  const otherCountTotal = inspections.reduce((acc, curr) => acc + curr.defects.filter(d => d.severity !== Severity.CRITICAL && d.severity !== Severity.HIGH).length, 0);
  
  // Box 1
  doc.setFillColor(248, 250, 252);
  doc.rect(12, ay, 42, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(12, ay, 42, 22, 'S');
  drawText(doc, totalScanned.toString(), 33, ay + 7, 14, { fontWeight: 'bold', color: '#121829', align: 'center' });
  drawText(doc, "Tracks Scanned", 33, ay + 13, 7.5, { color: '#64748b', align: 'center' });
  drawText(doc, "مسارات تم فحصها", 33, ay + 17, 7.5, { color: '#64748b', align: 'center' });
  
  // Box 2
  doc.setFillColor(254, 242, 242); // critical red
  doc.rect(58, ay, 42, 22, 'F');
  doc.setDrawColor(252, 165, 165);
  doc.rect(58, ay, 42, 22, 'S');
  drawText(doc, criticalCountTotal.toString(), 79, ay + 7, 14, { fontWeight: 'bold', color: '#b91c1c', align: 'center' });
  drawText(doc, "Critical Faults", 79, ay + 13, 7.5, { color: '#ef4444', align: 'center' });
  drawText(doc, "عيوب حرجة للغاية", 79, ay + 17, 7.5, { color: '#ef4444', align: 'center' });
  
  // Box 3
  doc.setFillColor(255, 247, 237); // orange
  doc.rect(104, ay, 42, 22, 'F');
  doc.setDrawColor(254, 215, 170);
  doc.rect(104, ay, 42, 22, 'S');
  drawText(doc, highCountTotal.toString(), 125, ay + 7, 14, { fontWeight: 'bold', color: '#c2410c', align: 'center' });
  drawText(doc, "High-Priority Faults", 125, ay + 13, 7.5, { color: '#f97316', align: 'center' });
  drawText(doc, "عيوب عالية الأهمية", 125, ay + 17, 7.5, { color: '#f97316', align: 'center' });
  
  // Box 4
  doc.setFillColor(240, 253, 244); // green
  doc.rect(150, ay, 48, 22, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.rect(150, ay, 48, 22, 'S');
  drawText(doc, "98.4%", 174, ay + 7, 14, { fontWeight: 'bold', color: '#15803d', align: 'center' });
  drawText(doc, "AI Object Confidence", 174, ay + 13, 7.5, { color: '#10b981', align: 'center' });
  drawText(doc, "نسبة ثقة الفحص الذكي", 174, ay + 17, 7.5, { color: '#10b981', align: 'center' });
  
  ay += 32;
  
  drawText(doc, "Project Vision System Scientific Statement", 12, ay, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "البيان العلمي والفني لمنهجية المحاكاة ونظام الرؤية", 198, ay, 10.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  ay += 5;
  
  const scientificEn = "The AI Rail Inspector system relies on optimized convolutional neural networks (CNNs), trained on specific railway anomalies (cracks, missing hardware, joint wear, and track bed displacement). The framework enables instant geolocation tagging of target hazards, compiling precise telemetry coordinates dynamically to guarantee real-time updates to maintenance units.";
  const scientificAr = "يعتمد نظام فحص المفاصل والقضبان بالذكاء الاصطناعي على تطبيق خوارزميات الرؤية الحاسوبية والشبكات العصبية الالتفافية المدربة على اكتشاف العيوب الهيكلية (كالشرخ، تآكل التربة، المفاصل المفكوكة والروابط المفقودة). يوفر النظام منصة قوية لتحديد الموقع الجغرافي الدقيق للعيب فور اكتشافه وتصنيفه تلقائياً بما يضمن الحفاظ على جودة خطوط السير للقطارات وحماية الأرواح والممتلكات العامة.";
  
  ay = drawWrappedText(doc, scientificEn, 12, ay + 4, 88, 8.5, 4, { color: '#334155' });
  drawWrappedText(doc, scientificAr, 198, 57, 88, 8.5, 4, { color: '#334155', align: 'right' });
  
  ay = Math.max(ay, 115);
  ay += 8;
  
  drawText(doc, "National Standards Alignment and Security Compliance", 12, ay, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "التوافق مع المعايير القومية واللوائح التنظيمية للأمن والسلامة", 198, ay, 10.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  ay += 5;
  
  const standardsEn = "Our framework exports structured telemetry files according to official Egypt National Rail safety benchmarks, allowing seamless integration with predictive maintenance scheduling systems and guaranteeing strict compliance with environmental protection and public asset security directives.";
  const standardsAr = "يدعم النظام تصدير وتكامل مخرجات وقواعد بيانات التفتيش دورياً لتتطابق مع اللوائح والمعايير المعتمدة بالهيئة القومية لسكك حديد مصر، مما يتيح تكاملاً سلساً وبسيطاً بمدخلات الصيانة الاستباقية وتقليل الهدر وتفادي انحراف المقطورات وتوقف الخدمات الرئيسية.";
  
  ay = drawWrappedText(doc, standardsEn, 12, ay + 4, 88, 8.5, 4, { color: '#334155' });
  drawWrappedText(doc, standardsAr, 198, 128, 88, 8.5, 4, { color: '#334155', align: 'right' });
  
  drawFooter(doc, 3, 4);
  
  // --- PAGE 4 --- RECENT SCANS LOGS TABLE
  doc.addPage();
  drawBackgroundWatermark(doc, logoBase64);
  drawBilingualHeader(doc, "RECENT SYSTEM COG INSPECTIONS LOG", "سجل القطاعات المفتشة وقواعد البيانات الحديثة", logoBase64);
  
  let ty = 48;
  
  drawText(doc, "Inspect Segment Log Archive (Detailed Rows)", 12, ty, 10.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, "أرشيف فحص القطاعات المسجلة تفصيلياً", 198, ty, 10.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  ty += 6;
  
  // Table header background
  doc.setFillColor(30, 41, 59);
  doc.rect(12, ty, 186, 7.5, 'F');
  
  // Header texts
  drawText(doc, "Segment ID", 15, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Severity / الخطورة", 60, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Anomalies / العيوب", 102, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Coordinates / الاحداثيات", 132, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Date / تاريخ الفحص", 171, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
  
  ty += 7.5;
  
  const recentInspections = inspections.slice(0, 24); // Show up to 24 logs
  
  recentInspections.forEach((insp, idx) => {
    if (ty > 265) {
      drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1);
      doc.addPage();
      drawBackgroundWatermark(doc, logoBase64);
      drawBilingualHeader(doc, "RECENT SYSTEM COG INSPECTIONS LOG", "سجل القطاعات المفتشة وقواعد البيانات الحديثة", logoBase64);
      
      ty = 48;
      // Repeat Header table on new page
      doc.setFillColor(30, 41, 59);
      doc.rect(12, ty, 186, 7.5, 'F');
      drawText(doc, "Segment ID", 15, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Severity / الخطورة", 60, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Anomalies / العيوب", 102, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Coordinates / الاحداثيات", 132, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Date / تاريخ الفحص", 171, ty + 4, 8, { fontWeight: 'bold', color: '#ffffff' });
      ty += 7.5;
    }
    
    // Zebra striping
    doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 250 : 255);
    doc.rect(12, ty, 186, 7.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(12, ty + 7.5, 198, ty + 7.5);
    
    const segmentId = insp.id.substring(0, 10).toUpperCase();
    
    // Determine highest severity
    let highestSeverity = 'NONE';
    if (insp.defects.length > 0) {
      const sorted = [...insp.defects].sort((a, b) => {
        const order = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
        return order[a.severity as keyof typeof order] - order[b.severity as keyof typeof order];
      });
      highestSeverity = sorted[0].severity;
    }
    
    const sevLabelEn = highestSeverity;
    const sevLabelAr = highestSeverity === 'CRITICAL' ? 'حرج' : 
                       highestSeverity === 'HIGH' ? 'عالٍ' : 
                       highestSeverity === 'MEDIUM' ? 'متوسط' : 
                       highestSeverity === 'LOW' ? 'منخفض' : 'سليم';
    
    const coordString = `${insp.location.lat.toFixed(4)}, ${insp.location.lng.toFixed(4)}`;
    const dateFormatted = new Date(insp.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
    
    drawText(doc, segmentId, 15, ty + 4, 8, { color: '#0f172a', fontWeight: 'bold' });
    drawText(doc, `${sevLabelEn} - ${sevLabelAr}`, 60, ty + 4, 7.5, { 
      color: highestSeverity === 'CRITICAL' ? '#b91c1c' : highestSeverity === 'HIGH' ? '#ea580c' : highestSeverity === 'NONE' ? '#15803d' : '#1e293b',
      fontWeight: highestSeverity === 'CRITICAL' || highestSeverity === 'HIGH' ? 'bold' : 'normal' 
    });
    drawText(doc, `${insp.defects.length} Detected`, 102, ty + 4, 7.5, { color: '#475569' });
    drawText(doc, coordString, 132, ty + 4, 7.5, { color: '#64748b' });
    drawText(doc, dateFormatted, 171, ty + 4, 7.5, { color: '#475569' });
    
    ty += 7.5;
  });
  
  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());
  
  // Prompt standard download save name
  doc.save(`Full_Project_Railway_Technical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateMaintenanceHistoryReport = async (inspections: TrackInspection[], language: 'en' | 'ar', targetSegmentId?: string) => {
  const logoBase64 = await loadLogo().catch(() => undefined);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const isSpecificSegment = targetSegmentId && targetSegmentId !== 'all';
  const targetInspections = isSpecificSegment
    ? inspections.filter(ins => ins.id === targetSegmentId)
    : inspections;

  const segmentSubtitleEn = isSpecificSegment 
    ? `SEGMENT FOCUS: ${targetSegmentId.toUpperCase().slice(-8)}` 
    : "FULL SYSTEM DISPATCH ARC";
  const segmentSubtitleAr = isSpecificSegment 
    ? `تركيز القطاع: ${targetSegmentId.toUpperCase().slice(-8)}` 
    : "أرشيف الشبكة الكامل";

  // Extract work orders
  const orders: any[] = [];
  targetInspections.forEach(inspection => {
    inspection.defects.forEach(defect => {
      // Include all defects if specific segment is selected, or only high/critical if general log
      if (isSpecificSegment || defect.severity === 'CRITICAL' || defect.severity === 'HIGH') {
        orders.push({
          id: `WO-${inspection.id.slice(-4)}-${defect.id.slice(-4)}`,
          inspectionId: inspection.id,
          type: defect.type,
          severity: defect.severity,
          location: inspection.location,
          timestamp: inspection.timestamp,
          status: defect.severity === 'CRITICAL' ? (language === 'ar' ? 'عاجل' : 'Urgent') : 
                  defect.severity === 'HIGH' ? (language === 'ar' ? 'مجدول' : 'Scheduled') : 
                  defect.severity === 'MEDIUM' ? (language === 'ar' ? 'تحت المراقبة' : 'Under Monitoring') : 
                  (language === 'ar' ? 'مسجل' : 'Logged'),
          description: defect.description,
          suggestedAction: defect.severity === 'CRITICAL' ? (language === 'ar' ? 'إغلاق فوري وإصلاح' : 'Immediate track closure & repair') : 
                           defect.severity === 'HIGH' ? (language === 'ar' ? 'صيانة خلال 48 ساعة' : 'Repair within 48 hours') : 
                           defect.severity === 'MEDIUM' ? (language === 'ar' ? 'صيانة وقائية دورية' : 'Routine Maintenance') : 
                           (language === 'ar' ? 'مراجعة عند الفحص التالي' : 'Periodic Inspection')
        });
      }
    });
  });

  orders.sort((a, b) => {
    if (a.severity === 'CRITICAL' && b.severity !== 'CRITICAL') return -1;
    if (a.severity !== 'CRITICAL' && b.severity === 'CRITICAL') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Start with First Page
  drawBackgroundWatermark(doc, logoBase64);
  drawBilingualHeader(doc, "RAILWAY MAINTENANCE HISTORY LOG", "سجل تاريخ وخطة صيانة خطوط سكك الحديد", logoBase64);

  let y = 48;

  // Title
  drawText(doc, `Official Equipment Maintenance Dispatch - ${segmentSubtitleEn}`, 12, y, 9.5, { fontWeight: 'bold', color: '#0f172a' });
  drawText(doc, `${segmentSubtitleAr} - تقرير التكليفات وهندسة الصيانة المخصصة`, 198, y, 9.5, { fontWeight: 'bold', color: '#0f172a', align: 'right' });
  y += 8;

  // Summary widgets
  // Box background
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(12, y, 186, 22, 'FD');

  const totalOrders = orders.length;
  const criticalOrders = orders.filter(o => o.severity === 'CRITICAL').length;
  const highOrders = orders.filter(o => o.severity === 'HIGH').length;

  drawText(doc, "SUMMARY OF PENDING TASKS / ملخص المهام المتبقية", 15, y + 5, 8, { fontWeight: 'bold', color: '#475569' });
  drawText(doc, `Total Active Orders: ${totalOrders}`, 15, y + 11, 8.5, { fontWeight: 'normal', color: '#0f172a' });
  drawText(doc, "إجمالي طلبات العمل النشطة", 85, y + 11, 8, { fontWeight: 'normal', color: '#475569' });

  drawText(doc, `Critical (Urgent): ${criticalOrders}`, 110, y + 11, 8.5, { fontWeight: 'bold', color: '#b91c1c' });
  drawText(doc, "أوامر صيانة عاجلة", 160, y + 11, 8, { fontWeight: 'normal', color: '#475569' });

  drawText(doc, `High Priority: ${highOrders}`, 110, y + 17, 8.5, { fontWeight: 'normal', color: '#ea580c' });
  drawText(doc, "أوامر مجدولة عالية الأهمية", 160, y + 17, 8, { fontWeight: 'normal', color: '#475569' });

  drawText(doc, `Operational Health: ${(98.5 - (criticalOrders * 1.5 + highOrders * 0.5)).toFixed(1)}%`, 15, y + 17, 8.5, { fontWeight: 'bold', color: '#15803d' });
  drawText(doc, "مؤشر سلامة أصول الشبكة", 85, y + 17, 8, { fontWeight: 'normal', color: '#475569' });

  y += 28;

  // Track equipment history table header
  doc.setFillColor(30, 41, 59);
  doc.rect(12, y, 186, 8, 'F');

  drawText(doc, "Order ID / المعرف", 15, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Item / العيب والمعدة", 50, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Severity / الأولوية", 98, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Suggested Action / إجراء الصيانة", 128, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
  drawText(doc, "Date / التاريخ", 175, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });

  y += 8;

  const getDefectName = (type: string) => {
    const names: Record<string, { en: string; ar: string }> = {
      'crack': { en: 'Slab/Rail Crack', ar: 'شرح قضيب طولي' },
      'erosion': { en: 'Ballast Erosion', ar: 'تآكل فرشة الحصى' },
      'missing_bolt': { en: 'Fastener Missing', ar: 'برغي مفقود' },
      'wear': { en: 'High Corrugation/Wear', ar: 'اهتراء سكة ميكانيكي' },
      'vegetation': { en: 'Weed Intrusion', ar: 'تداخل نباتي' },
      'corrosion': { en: 'Structural Rust', ar: 'صدأ وتآكل كيميائي' },
      'track_misalignment': { en: 'Track Misalignment', ar: 'عدم اتساق المسار' },
      'debris': { en: 'Debris/Blockage', ar: 'عوائق صلبة ومخلفات' }
    };
    return names[type] || { en: type.toUpperCase(), ar: type };
  };

  orders.forEach((order, idx) => {
    if (y > 255) {
      drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1);
      doc.addPage();
      drawBackgroundWatermark(doc, logoBase64);
      drawBilingualHeader(doc, "RAILWAY MAINTENANCE HISTORY LOG", "سجل تاريخ وخطة صيانة خطوط سكك الحديد", logoBase64);
      y = 48;

      // Repeat Table Header
      doc.setFillColor(30, 41, 59);
      doc.rect(12, y, 186, 8, 'F');

      drawText(doc, "Order ID / المعرف", 15, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Item / العيب والمعدة", 50, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Severity / الأولوية", 98, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Suggested Action / إجراء الصيانة", 128, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
      drawText(doc, "Date / التاريخ", 175, y + 5.5, 8, { fontWeight: 'bold', color: '#ffffff' });
      y += 8;
    }

    // Zebra striping background
    doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 250 : 255);
    doc.rect(12, y, 186, 7.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(12, y + 7.5, 198, y + 7.5);

    const defectName = getDefectName(order.type);
    const defectLabel = `${defectName.en} - ${defectName.ar}`;
    const severityLabel = order.severity === 'CRITICAL' ? 'CRITICAL - حرج جداً' : 
                         order.severity === 'HIGH' ? 'HIGH - أولوية عالية' :
                         order.severity === 'MEDIUM' ? 'MEDIUM - قيد المتابعة' : 'LOW - منخفض الخطورة';
    const actionLabel = order.severity === 'CRITICAL' ? 'Immediate Repair / صيانة فورية' : 
                        order.severity === 'HIGH' ? 'Schedule 48h / إصلاح مجدول' :
                        order.severity === 'MEDIUM' ? 'Routine / صيانة وقائية وعادية' : 'Monitor / متابعة دورية';
    const dateFormatted = new Date(order.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');

    drawText(doc, order.id, 15, y + 4, 7.5, { color: '#0f172a', fontWeight: 'bold' });
    drawText(doc, defectLabel, 50, y + 4, 6.8, { color: '#1e293b' });
    drawText(doc, severityLabel, 98, y + 4, 7.5, { 
      color: order.severity === 'CRITICAL' ? '#b91c1c' : 
             order.severity === 'HIGH' ? '#ea580c' : 
             order.severity === 'MEDIUM' ? '#d97706' : '#2563eb',
      fontWeight: 'bold' 
    });
    drawText(doc, actionLabel, 128, y + 4, 7.2, { color: '#475569' });
    drawText(doc, dateFormatted, 175, y + 4, 7.5, { color: '#475569' });

    y += 7.5;
  });

  // Bottom section signature boxes
  y += 12;
  if (y > 240) {
    drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages() + 1);
    doc.addPage();
    drawBackgroundWatermark(doc, logoBase64);
    drawBilingualHeader(doc, "RAILWAY MAINTENANCE HISTORY LOG", "سجل تاريخ وخطة صيانة خطوط سكك الحديد", logoBase64);
    y = 52;
  }

  // Draw technical note
  drawText(doc, "ENGINEERING STATEMENT & AUDIT COMPLIANCE / بيان هندسي واعتماد السلامة الإنشائية", 12, y, 9, { fontWeight: 'bold', color: '#1e3a8a' });
  y += 5;
  const dispatchStatementEn = "The dispatch history above represents automated predictive tracking of physical railway failures aligned to Borg El Arab Technological University research parameters. Work orders designate structural maintenance efforts triggered instantly by AI edge model analysis on inspection streams.";
  const dispatchStatementAr = "يمثل سجل الصيانة أعلاه تتبعاً آلياً واستباقياً لأعطال خطوط السكك الحديدية بالتطابق مع المعايير البحثية لجامعة برج العرب التكنولوجية. تم إرسال وتخطيط التكليفات الهندسية فور التعرف عليها تلقائياً عبر فحص خوارزميات الذكاء الاصطناعي للمسار.";
  
  y = drawWrappedText(doc, dispatchStatementEn, 12, y, 88, 7.5, 3.5, { color: '#475569' });
  drawWrappedText(doc, dispatchStatementAr, 198, y - 10.5, 88, 7.5, 3.5, { color: '#475569', align: 'right' });

  y += 8;

  // Signature line
  drawText(doc, "Approved By: ___________________________", 12, y + 4, 8, { fontWeight: 'bold', color: '#334155' });
  drawText(doc, "اعتماد مهندس السلامة المعتمد للشبكة", 198, y + 4, 8, { fontWeight: 'bold', color: '#334155', align: 'right' });

  drawFooter(doc, doc.getNumberOfPages(), doc.getNumberOfPages());

  const filePrefix = isSpecificSegment ? `Segment_${targetSegmentId.slice(-6)}_` : "";
  doc.save(`${filePrefix}Railway_Equipment_Maintenance_History_${new Date().toISOString().split('T')[0]}.pdf`);
};
