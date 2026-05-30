import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  QrCode, 
  Printer, 
  Download, 
  Plus, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  HelpCircle,
  Cpu,
  RefreshCw
} from 'lucide-react';

// Equipment mock schema matching RAIL_EQUIPMENT_DATABASE
interface EquipmentAsset {
  serialNumber: string;
  name: string;
  type: string;
  location: string;
  status: 'Safe' | 'Warning' | 'Maintenance Required';
  lastInspected: string;
  engineer: string;
}

const STATIC_RAIL_ASSETS: EquipmentAsset[] = [
  {
    serialNumber: "EQ-SWITCH-104A",
    name: "Alexandria High-Speed Rail Switcher",
    type: "Electromechanical Track Switch",
    location: "Alexandria Platform Center Hub (KM 42.5)",
    status: "Safe",
    lastInspected: "2026-05-10",
    engineer: "أحمد ثروت إبراهيم"
  },
  {
    serialNumber: "EQ-JOINT-409B",
    name: "Insulated Heavy-Duty Rail Joint",
    type: "Structural Track Joint Spacer",
    location: "Cairo-Alex Express Line (KM 118.2)",
    status: "Maintenance Required",
    lastInspected: "2026-04-22",
    engineer: "عبدالرحمن على محمد"
  },
  {
    serialNumber: "EQ-SBOX-220",
    name: "Embedded IoT Acoustic Telemetry Box V2",
    type: "AI Sensory Node & Telemetry Receiver",
    location: "Tanta Junction Bypass Section (KM 76.1)",
    status: "Safe",
    lastInspected: "2026-05-15",
    engineer: "فيلوباتير جورج وليم"
  },
  {
    serialNumber: "EQ-SIG-55C",
    name: "Interlocking Multi-Aspect Signal Column",
    type: "Active Electronic Signal Tower",
    location: "Giza Crossing Zone A-1 (KM 12.8)",
    status: "Warning",
    lastInspected: "2026-05-01",
    engineer: "محمد راوف عبده محمد"
  },
  {
    serialNumber: "EQ-TRANS-09F",
    name: "Balise / Automatic Train Protection Beacon",
    type: "Trackside RFID Transponder Unit",
    location: "Banha Station Gate Crossing (KM 45.1)",
    status: "Warning",
    lastInspected: "2026-04-18",
    engineer: "شهد احمد هلال"
  }
];

export function TrackQrGenerator() {
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [assets, setAssets] = useState<EquipmentAsset[]>(() => {
    const saved = localStorage.getItem('track_qr_assets_db_v1');
    return saved ? JSON.parse(saved) : STATIC_RAIL_ASSETS;
  });
  
  const [selectedAsset, setSelectedAsset] = useState<EquipmentAsset>(assets[0]);
  const [selectedSerials, setSelectedSerials] = useState<string[]>(() => assets.map(a => a.serialNumber));
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // New Asset input form fields
  const [newSerial, setNewSerial] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<'Safe' | 'Warning' | 'Maintenance Required'>('Safe');

  const handleToggleSelect = (serial: string) => {
    setSelectedSerials(prev => 
      prev.includes(serial) 
        ? prev.filter(s => s !== serial) 
        : [...prev, serial]
    );
  };

  const handleSelectAll = () => {
    if (selectedSerials.length === assets.length) {
      setSelectedSerials([]);
    } else {
      setSelectedSerials(assets.map(a => a.serialNumber));
    }
  };

  const generateQrDataUrl = (serial: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(serial, {
        width: 256,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#ffffff',
        }
      }, (err, url) => {
        if (err) reject(err);
        else resolve(url);
      });
    });
  };

  // Trigger regeneration whenever the selected asset changes
  useEffect(() => {
    if (selectedAsset) {
      QRCode.toDataURL(selectedAsset.serialNumber, {
        width: 256,
        margin: 2,
        color: {
          dark: '#030712', // Dark background of tag
          light: '#ffffff', // Clean white paper background
        }
      }, (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      });
    }
  }, [selectedAsset]);

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.trim() || !newName.trim()) return;

    const formattedSerial = newSerial.trim().toUpperCase().replace(/\s+/g, '-');
    
    // Check if duplicate
    if (assets.some(a => a.serialNumber === formattedSerial)) {
      alert(isRTL ? "الرقم التسلسلي هذا مستخدم بالفعل!" : "This serial number is already registered!");
      return;
    }

    const newAsset: EquipmentAsset = {
      serialNumber: formattedSerial,
      name: newName.trim(),
      type: newType.trim() || "Physical Track Asset",
      location: newLocation.trim() || "Field Route Subsector",
      status: newStatus,
      lastInspected: new Date().toISOString().split('T')[0],
      engineer: user?.username || "عادل قدرى محمد"
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    localStorage.setItem('track_qr_assets_db_v1', JSON.stringify(updated));
    setSelectedAsset(newAsset);
    setSelectedSerials(prev => [formattedSerial, ...prev]);
    
    // Reset Form
    setNewSerial('');
    setNewName('');
    setNewType('');
    setNewLocation('');
    setNewStatus('Safe');
    setIsGeneratingNew(false);
  };

  const handlePrintSelected = async () => {
    const selectedAssets = assets.filter(a => selectedSerials.includes(a.serialNumber));
    if (selectedAssets.length === 0) {
      alert(isRTL ? "يرجى تحديد أصل واحد على الأقل للطباعة المجمعة!" : "Please select at least one asset for combined printing!");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate QR codes for all selected assets asynchronously
    const labelsHtmlPromises = selectedAssets.map(async (asset) => {
      try {
        const url = await generateQrDataUrl(asset.serialNumber);
        return `
          <div class="tag-container">
            <div class="system-banner">AI RAIL INSPECTOR PROTOCOL</div>
            <div class="title">${asset.name}</div>
            <div class="serial">${asset.serialNumber}</div>
            <img src="${url}" style="width: 200px; height: 200px; margin: 10px auto; display: block;" />
            <table class="details-table" style="direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}">
              <tr>
                <td class="label">${isRTL ? 'نوع الأصل' : 'Asset Type'}:</td>
                <td class="val">${asset.type}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'الموقع الفني' : 'Technical Location'}:</td>
                <td class="val">${asset.location}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'تاريخ الفحص' : 'Last Inspection'}:</td>
                <td class="val">${asset.lastInspected}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'المهندس المسؤول' : 'Inspector'}:</td>
                <td class="val">${asset.engineer}</td>
              </tr>
            </table>
            <div class="footer-tag">DYNAMIC QR CODE - PRINT READY - SOVEREIGN RAIL OS</div>
          </div>
        `;
      } catch (e) {
        console.error("Error generating QR code inside combined print", e);
        return '';
      }
    });

    const labelsHtmls = await Promise.all(labelsHtmlPromises);
    const combinedContent = labelsHtmls.join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>${isRTL ? 'طباعة الملصقات المحددة' : 'Print Selected Asset Tags'}</title>
          <style>
            body { 
              font-family: 'Inter', system-ui, sans-serif; 
              background-color: #f3f4f6;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 30px;
            }
            .tag-container {
              width: 380px;
              background: #ffffff;
              padding: 24px;
              border: 3px solid #111827;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .system-banner {
              background: #1e3a8a;
              color: white;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1.5px;
              padding: 6px;
              text-transform: uppercase;
              border-radius: 4px;
              margin-bottom: 12px;
            }
            .title {
              font-size: 18px;
              font-weight: 850;
              color: #111827;
              margin: 8px 0;
            }
            .serial {
              font-family: monospace;
              font-size: 14px;
              background: #f3f4f6;
              color: #1f2937;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: bold;
              display: inline-block;
              border: 1px dashed #9ca3af;
            }
            .details-table {
              width: 100%;
              font-size: 11px;
              text-align: left;
              margin-top: 15px;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 5px 2px;
            }
            .details-table td.label {
              font-weight: bold;
              color: #4b5563;
              width: 35%;
            }
            .details-table td.val {
              color: #111827;
            }
            .footer-tag {
              font-size: 8px;
              color: #9ca3af;
              margin-top: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @page {
              size: auto;
              margin: 0;
            }
            @media print {
              html, body { 
                background: #ffffff !important; 
                margin: 0 !important; 
                padding: 0 !important;
                height: auto !important;
                width: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                display: block !important;
              }
              .tag-container { 
                border: 2.5px solid #000000 !important; 
                box-shadow: none !important; 
                width: 3.5in !important; /* Standard industrial/thermal labels */
                height: auto !important;
                margin: 0 auto 30px auto !important;
                padding: 16px !important;
                page-break-inside: avoid !important;
                page-break-after: always !important;
                background: #ffffff !important;
              }
              .tag-container:last-child {
                page-break-after: avoid !important;
                margin-bottom: 0 !important;
              }
              .system-banner {
                background: #1e3a8a !important;
                color: #ffffff !important;
                border-radius: 4px !important;
              }
              .serial {
                border: 1px dashed #000000 !important;
                background: #f3f4f6 !important;
              }
            }
          </style>
        </head>
        <body>
          ${combinedContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrImageHtml = `<img src="${qrDataUrl}" style="width: 200px; height: 200px; margin: 10px auto; display: block;" />`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${isRTL ? 'بطاقة الأصل الهندسي' : 'Print Track Asset Tag'}</title>
          <style>
            body { 
              font-family: 'Inter', system-ui, sans-serif; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh;
              background-color: #f3f4f6;
              margin: 0;
            }
            .tag-container {
              width: 380px;
              background: #ffffff;
              padding: 24px;
              border: 3px solid #111827;
              border-radius: 12px;
              text-align: center;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            }
            .system-banner {
              background: #1e3a8a;
              color: white;
              font-size: 11px;
              font-weight: 900;
              letter-spacing: 1.5px;
              padding: 6px;
              text-transform: uppercase;
              border-radius: 4px;
              margin-bottom: 12px;
            }
            .title {
              font-size: 18px;
              font-weight: 850;
              color: #111827;
              margin: 8px 0;
            }
            .serial {
              font-family: monospace;
              font-size: 14px;
              background: #f3f4f6;
              color: #1f2937;
              padding: 4px 10px;
              border-radius: 4px;
              font-weight: bold;
              display: inline-block;
              border: 1px dashed #9ca3af;
            }
            .details-table {
              width: 100%;
              font-size: 11px;
              text-align: left;
              margin-top: 15px;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 5px 2px;
            }
            .details-table td.label {
              font-weight: bold;
              color: #4b5563;
              width: 35%;
            }
            .details-table td.val {
              color: #111827;
            }
            .footer-tag {
              font-size: 8px;
              color: #9ca3af;
              margin-top: 15px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @page {
              size: auto;
              margin: 0;
            }
            @media print {
              html, body { 
                background: #ffffff !important; 
                margin: 0 !important; 
                padding: 0 !important;
                height: auto !important;
                width: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                min-height: 100vh !important;
              }
              .tag-container { 
                border: 2.5px solid #000000 !important; 
                box-shadow: none !important; 
                width: 3.5in !important; /* Standard industrial/thermal labels (3.5 x 4 in width range) */
                height: auto !important;
                margin: 0 auto !important;
                padding: 16px !important;
                page-break-inside: avoid !important;
                background: #ffffff !important;
              }
              .system-banner {
                background: #1e3a8a !important;
                color: #ffffff !important;
                border-radius: 4px !important;
              }
              .serial {
                border: 1px dashed #000000 !important;
                background: #f3f4f6 !important;
              }
              .no-print { 
                display: none !important; 
              }
            }
          </style>
        </head>
        <body>
          <div class="tag-container">
            <div class="system-banner">AI RAIL INSPECTOR PROTOCOL</div>
            <div class="title">${selectedAsset.name}</div>
            <div class="serial">${selectedAsset.serialNumber}</div>
            ${qrImageHtml}
            <table class="details-table" style="direction: ${isRTL ? 'rtl' : 'ltr'}; text-align: ${isRTL ? 'right' : 'left'}">
              <tr>
                <td class="label">${isRTL ? 'نوع الأصل' : 'Asset Type'}:</td>
                <td class="val">${selectedAsset.type}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'الموقع الفني' : 'Technical Location'}:</td>
                <td class="val">${selectedAsset.location}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'تاريخ الفحص' : 'Last Inspection'}:</td>
                <td class="val">${selectedAsset.lastInspected}</td>
              </tr>
              <tr>
                <td class="label">${isRTL ? 'المهندس المسؤول' : 'Inspector'}:</td>
                <td class="val">${selectedAsset.engineer}</td>
              </tr>
            </table>
            <div class="footer-tag">DYNAMIC QR CODE - PRINT READY - SOVEREIGN RAIL OS</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="w-full">
      {/* Target purple trigger as displayed in the image, robustly built for narrow sidebars */}
      <div className="bg-purple-500/5 p-4 rounded-xl border border-purple-500/10 mt-3 shadow-[0_4px_20px_rgba(168,85,247,0.05)] flex flex-col gap-3">
        <div className={`flex items-start gap-2.5 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="p-2 rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)] flex-shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className={`text-[11px] font-black text-purple-300 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'مولد ملصقات وفحص الأصول' : 'Asset Tag Generator'}
            </span>
            <span className={`text-[9px] text-slate-400 font-medium leading-relaxed mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? 'توليد وطباعة ملصقات QR لقواعد الأصول' : 'Generate printable QR codes for track hardware'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2 bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/30 text-white rounded-lg text-[10px] font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase select-none active:scale-95 shadow-md shadow-purple-600/20"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isRTL ? 'توليد و تصفح الرموز' : 'Generate & Browse QR'}</span>
        </button>
      </div>

      {/* Onboarding Dialog Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              />

              {/* Content Card container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: -15 }}
                className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)] text-white flex flex-col md:flex-row max-h-[90vh]"
              >
                {/* Purple/Indigo visual header */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500" />
                
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-5 right-5 p-2 bg-white/5 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer z-10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Left Column: Asset selection and generation Form */}
                <div className={`p-8 md:w-3/5 border-slate-800 flex flex-col justify-between overflow-y-auto ${isRTL ? 'md:border-l' : 'md:border-r'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                          {isRTL ? 'مولّد ملصقات الأصول والرموز البرمجية' : 'Sovereign QR Asset Tag Manager'}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          {isRTL ? 'إصدار رموز QR مطابقة لقاعدة التفتيش للمسارات والتحقق الآمن.' : 'Issue fully scanner-compatible electronic tags for physical railway joints.'}
                        </p>
                      </div>
                    </div>

                    {/* Toggle button: Switch or Create */}
                    <div className="bg-slate-950/50 p-1 rounded-xl border border-white/5 flex gap-1 mb-6">
                      <button
                        onClick={() => setIsGeneratingNew(false)}
                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                          !isGeneratingNew ? 'bg-purple-600 text-white' : 'text-slate-450 hover:text-white'
                        }`}
                      >
                        {isRTL ? 'قائمة الأصول الحالية' : 'Active Track Assets'}
                      </button>
                      <button
                        onClick={() => setIsGeneratingNew(true)}
                        className={`flex-1 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                          isGeneratingNew ? 'bg-purple-600 text-white' : 'text-slate-450 hover:text-white'
                        }`}
                      >
                        {isRTL ? 'تسجيل أصل هندسي جديد +' : 'Add New Hardware +'}
                      </button>
                    </div>

                    {!isGeneratingNew ? (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-slate-950/30 p-2.5 rounded-xl border border-white/5">
                          <label className={`block text-[11px] font-black text-slate-400 uppercase tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'قائمة الأصول والتصنيفات المهيأة:' : 'Engineering Hardware Assets:'}
                          </label>
                          
                          <button
                            type="button"
                            onClick={handlePrintSelected}
                            className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3.5 py-2 rounded-xl transition-all shadow-md shadow-purple-600/20 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>
                              {isRTL 
                                ? `طباعة المحدد (${selectedSerials.length})` 
                                : `Print Selected (${selectedSerials.length})`}
                            </span>
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/40 max-h-[260px] overflow-y-auto no-scrollbar">
                          <table className="w-full text-xs text-left text-slate-350 border-collapse">
                            <thead className="bg-slate-950 text-[10px] font-black uppercase text-slate-450 border-b border-white/10 sticky top-0 bg-slate-950 z-10">
                              <tr>
                                <th className="p-3 w-12 text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedSerials.length === assets.length && assets.length > 0}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 rounded accent-purple-600 bg-slate-900 border-white/10 cursor-pointer"
                                    title={isRTL ? "تحديد الكل" : "Select All"}
                                  />
                                </th>
                                <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'اسم الأصل' : 'Asset Name'}</th>
                                <th className={`p-3 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المعرف الرقمي' : 'Serial ID'}</th>
                                <th className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'الحالة والمستوى' : 'Status'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {assets.map((asset) => {
                                const isChecked = selectedSerials.includes(asset.serialNumber);
                                const isCurrent = selectedAsset.serialNumber === asset.serialNumber;
                                return (
                                  <tr 
                                    key={asset.serialNumber}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`hover:bg-purple-600/5 transition-all cursor-pointer ${
                                      isCurrent 
                                        ? 'bg-purple-600/10 text-white font-medium' 
                                        : 'text-slate-300'
                                    }`}
                                  >
                                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        onChange={() => handleToggleSelect(asset.serialNumber)}
                                        className="w-4 h-4 rounded accent-purple-650 bg-slate-900 border-white/10 cursor-pointer"
                                      />
                                    </td>
                                    <td className={`p-3 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                                      <div className="flex flex-col">
                                        <span className="line-clamp-1">{asset.name}</span>
                                        <span className="text-[9px] text-slate-500 font-normal line-clamp-1 hidden sm:inline">{asset.type}</span>
                                      </div>
                                    </td>
                                    <td className={`p-3 font-mono text-[10.5px] font-bold text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      {asset.serialNumber}
                                    </td>
                                    <td className={`p-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                        asset.status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400' :
                                        asset.status === 'Warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-450'
                                      }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                          asset.status === 'Safe' ? 'bg-emerald-500' :
                                          asset.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                                        }`} />
                                        {asset.status === 'Safe' ? (isRTL ? 'آمن' : 'Safe') :
                                         asset.status === 'Warning' ? (isRTL ? 'تحذير' : 'Warning') : (isRTL ? 'حرج' : 'Critical')}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleCreateAsset} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الرقم التسلسلي (ID)' : 'Serial ID (EQ-...)'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="EQ-JOINT-550X"
                              value={newSerial}
                              onChange={(e) => setNewSerial(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'اسم المكون أو الأصل' : 'Asset Name'}
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={isRTL ? "فاصل اتجاهات طنطا" : "Tanta Joint Sizer"}
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'نوع الأجهزة والصلابة' : 'System Hardware Type'}
                            </label>
                            <input
                              type="text"
                              placeholder="Heavy Joint Linker"
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {isRTL ? 'الموقع الفني الدقيق' : 'Geographical Location'}
                            </label>
                            <input
                              type="text"
                              placeholder="KM 42.8 Bypass Link"
                              value={newLocation}
                              onChange={(e) => setNewLocation(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-605 outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className={`block text-[10px] font-black text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {isRTL ? 'حالة الأمان الفورية' : 'Initial Status'}
                          </label>
                          <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as any)}
                            className="w-full bg-slate-950 border border-white/10 focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="Safe">{isRTL ? 'آمن وسليم (Safe)' : 'Safe'}</option>
                            <option value="Warning">{isRTL ? 'تحذير / انتباه (Warning)' : 'Warning'}</option>
                            <option value="Maintenance Required">{isRTL ? 'بحاجة لصيانة فورية (Critical)' : 'Critical'}</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer shadow-lg shadow-purple-600/20 uppercase"
                        >
                          {isRTL ? 'حفظ وتثبيت الرمز الجديد' : 'Confirm Hardware Registration'}
                        </button>
                      </form>
                    )}
                  </div>

                  <div className={`text-[10px] text-slate-500 border-t border-white/5 pt-4 mt-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL 
                      ? '*ملاحظة: الملصقات المولدة هنا متوافقة بشكل كامل مع بروتوكول جهاز الفحص المباشر في لوحة التحكم.'
                      : '*Note: All generated QR labels are completely compatible with the field camera scanner decoder.'}
                  </div>
                </div>

                {/* Right Column: Print preview of the generated Tag */}
                <div className="p-8 md:w-2/5 bg-slate-950/40 flex flex-col justify-between items-center overflow-y-auto">
                  <div className="w-full text-center">
                    <h4 className="text-xs font-black text-slate-450 uppercase tracking-widest mb-4">
                      {isRTL ? 'معاينة ملصق الأجهزة المطبوع' : 'Printable Tag Preview'}
                    </h4>

                    {/* High Quality Design Asset label Box */}
                    <div className="bg-white text-slate-950 p-6 rounded-2xl border-2 border-slate-900 shadow-2xl w-full max-w-[280px] mx-auto text-center font-display relative">
                      <span className="absolute top-2 left-2 px-1 bg-blue-900 text-white text-[7.5px] font-black font-mono tracking-widest rounded">
                        OS_TAG
                      </span>
                      
                      <h5 className="text-[12px] font-black tracking-wider text-blue-900 border-b border-slate-200 pb-2 mb-2 uppercase">
                        AI Rail Inspector
                      </h5>

                      <h6 className="text-[14px] font-black text-slate-900 truncate leading-snug">
                        {selectedAsset.name}
                      </h6>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[10px] text-slate-700 font-bold mt-1 select-all">
                        {selectedAsset.serialNumber}
                      </span>

                      {/* QR Code Canvas rendering area */}
                      <div className="my-4 flex justify-center bg-white p-2 rounded-xl border border-slate-150">
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt="QR Code" 
                            className="w-36 h-36 object-contain"
                          />
                        ) : (
                          <div className="w-36 h-36 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin text-slate-300" />
                          </div>
                        )}
                      </div>

                      <div className={`space-y-1 text-[9px] text-slate-700 border-t border-slate-200 pt-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-550">{isRTL ? 'المهندس' : 'By'}:</span>
                          <span className="truncate max-w-[125px]">{selectedAsset.engineer}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-550">{isRTL ? 'الموقع' : 'Loc'}:</span>
                          <span className="truncate max-w-[125px]">{selectedAsset.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-550">{isRTL ? 'الحالة' : 'Status'}:</span>
                          <span className={`w-2 h-2 rounded-full ${
                            selectedAsset.status === 'Safe' ? 'bg-emerald-500' :
                            selectedAsset.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-2 mt-6">
                    <button
                      onClick={handlePrint}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-lg shadow-emerald-600/10"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{isRTL ? 'طباعة الملصق' : 'Print Label'}</span>
                    </button>

                    <a
                      href={qrDataUrl}
                      download={`QR_${selectedAsset.serialNumber}.png`}
                      className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-95"
                      title={isRTL ? "تحميل الصورة" : "Download PNG"}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
