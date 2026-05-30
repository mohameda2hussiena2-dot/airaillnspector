import React, { useState } from 'react';
import { Search, Plus, Download, Eye, Trash2, FileText, Package, Database, Library, Film, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface WorkspaceItem {
  id: string;
  name: string;
  category: string;
  version?: string;
  date: string;
  owner: string;
  size?: string;
  status?: string;
  accuracy?: string;
  quantity?: number;
  type?: string;
  format?: string;
}

interface WorkspaceConfig {
  id: string;
  title: string;
  icon: any;
  stats: { label: string; value: string | number; color: string }[];
  categories: string[];
  columns: { key: keyof WorkspaceItem; label: string }[];
  items: WorkspaceItem[];
}

export function WorkspacePage({ type }: { type: '3d_models' | 'db_training' | 'inventory' | 'media' }) {
  const { isRTL, t } = useLanguage();
  const { hasPermission } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const configs: Record<string, WorkspaceConfig> = {
    '3d_models': {
      id: '3d_models',
      title: isRTL ? "مكتبة التصميمات" : "3D Models Library",
      icon: Library,
      stats: [
        { label: isRTL ? "إجمالي الملفات" : "Total Files", value: 124, color: "blue" },
        { label: isRTL ? "نماذج الطائرات" : "Drone Models", value: 8, color: "emerald" },
        { label: isRTL ? "قيد المراجعة" : "Pending Review", value: 3, color: "amber" }
      ],
      categories: ['All', 'Drone Parts', 'Mounting', '3D Print'],
      columns: [
        { key: 'name', label: isRTL ? "اسم القطعة" : "Component Name" },
        { key: 'version', label: isRTL ? "الإصدار" : "Version" },
        { key: 'date', label: isRTL ? "تاريخ التعديل" : "Last Modified" },
        { key: 'owner', label: isRTL ? "المهندس المسؤول" : "Responsible Engineer" }
      ],
      items: [
        { id: '1', name: 'Drone Frame V2', category: 'Drone Parts', version: 'V2.1', date: '2024-05-10', owner: 'Hodhod', format: '.sldprt' },
        { id: '2', name: 'Camera Support', category: 'Mounting', version: 'V1.0', date: '2024-05-08', owner: 'Hodhod', format: '.stl' },
        { id: '3', name: 'Landing Gear', category: '3D Print', version: 'V3.4', date: '2024-05-12', owner: 'Hodhod', format: '.obj' },
      ]
    },
    'db_training': {
      id: 'db_training',
      title: isRTL ? "إدارة قواعد البيانات والتدريب" : "Data & AI Training",
      icon: Database,
      stats: [
        { label: isRTL ? "إجمالي الصور" : "Total Images", value: "52.4k", color: "blue" },
        { label: isRTL ? "دقة النموذج" : "Model Accuracy", value: "98.2%", color: "emerald" },
        { label: isRTL ? "مجموعات البيانات" : "Datasets", value: 12, color: "purple" }
      ],
      categories: ['All', 'Defect Images', 'YOLO Data', 'Checkpoints'],
      columns: [
        { key: 'name', label: isRTL ? "اسم الـ Dataset" : "Dataset Name" },
        { key: 'size', label: isRTL ? "الحجم" : "Size" },
        { key: 'accuracy', label: isRTL ? "دقة النموذج" : "Accuracy" },
        { key: 'date', label: isRTL ? "تاريخ آخر تدريب" : "Latest Training" }
      ],
      items: [
        { id: '1', name: 'Rail Cracks 2024', category: 'Defect Images', size: '12.5 GB', accuracy: '97.5%', date: '2024-05-11', owner: 'Nour Shady Mohamed' },
        { id: '2', name: 'Rust Detection YOLOv8', category: 'YOLO Data', size: '4.2 GB', accuracy: '98.8%', date: '2024-05-14', owner: 'Shahd' },
        { id: '3', name: 'Object Tracking Test', category: 'Checkpoints', size: '850 MB', accuracy: '94.2%', date: '2024-05-09', owner: 'Hanin' },
      ]
    },
    'inventory': {
      id: 'inventory',
      title: isRTL ? "المخازن وقطع الغيار" : "Inventory & Spare Parts",
      icon: Package,
      stats: [
        { label: isRTL ? "نواقص المخزن" : "Low Stock Items", value: 3, color: "red" },
        { label: isRTL ? "إجمالي المكونات" : "Total Components", value: 842, color: "blue" },
        { label: isRTL ? "قيمة المخزون" : "Inventory Value", value: "$12.5k", color: "emerald" }
      ],
      categories: ['All', 'Controllers', 'Sensors', 'Batteries'],
      columns: [
        { key: 'name', label: isRTL ? "اسم المكون" : "Component Name" },
        { key: 'quantity', label: isRTL ? "الكمية" : "Quantity" },
        { key: 'status', label: isRTL ? "الحالة" : "Condition" },
        { key: 'owner', label: isRTL ? "المسؤول" : "Responsible" }
      ],
      items: [
        { id: '1', name: 'Flight Controller H7', category: 'Controllers', quantity: 2, status: isRTL ? 'جديد' : 'New', date: '2024-05-13', owner: 'Peter' },
        { id: '2', name: 'LiPo Battery 6S 4500mAh', category: 'Batteries', quantity: 12, status: isRTL ? 'جديد' : 'Used', date: '2024-05-12', owner: 'Tharwat' },
        { id: '3', name: 'FPV Camera 1200TVL', category: 'Sensors', quantity: 1, status: isRTL ? 'مستهلك' : 'Low Stock', date: '2024-05-14', owner: 'Peter' },
      ]
    },
    'media': {
      id: 'media',
      title: isRTL ? "المركز الإعلامي والتوثيق" : "Media & Documentation",
      icon: Film,
      stats: [
        { label: isRTL ? "إجمالي الميديا" : "Total Assets", value: 342, color: "blue" },
        { label: isRTL ? "فيديوهات ترويجية" : "Promo Videos", value: 24, color: "emerald" },
        { label: isRTL ? "تغطيات صحفية" : "Press Coverage", value: 15, color: "purple" }
      ],
      categories: ['All', 'Branding', 'Videos', 'Events'],
      columns: [
        { key: 'name', label: isRTL ? "عنوان الملف" : "File Title" },
        { key: 'type', label: isRTL ? "نوع الميديا" : "Type" },
        { key: 'date', label: isRTL ? "تاريخ النشر" : "Publish Date" },
        { key: 'owner', label: isRTL ? "بواسطة" : "Uploaded By" }
      ],
      items: [
        { id: '1', name: 'AI Rail Logo HD', category: 'Branding', type: 'SVG/PNG', date: '2024-05-10', owner: 'Fares' },
        { id: '2', name: 'Project Overview 2024', category: 'Videos', type: 'MP4 (4K)', date: '2024-05-12', owner: 'Adel' },
        { id: '3', name: 'Competition Photos', category: 'Events', type: 'Album', date: '2024-05-14', owner: 'Fares' },
      ]
    }
  };

  const config = configs[type];

  const filteredItems = config.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <config.icon className="w-5 h-5 text-blue-600" />
            </div>
            {config.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-arabic-desc">
            {isRTL ? "إدارة وتنظيم موارد القسم بشكل متكامل" : "Comprehensive management of department resources"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('action', 'canUpload') && (
            <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all">
              <Plus className="w-4 h-4" />
              {isRTL ? "رفع ملف جديد" : "Upload New File"}
            </button>
          )}
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm group hover:border-blue-500/50 transition-all">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-black text-slate-900`}>{stat.value}</h3>
              <div className={`w-1.5 h-1.5 rounded-full bg-${stat.color}-500 animate-pulse`} />
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full md:w-auto">
          {config.categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                activeCategory === cat ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative flex-1 w-full">
          <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
          <input
            type="text"
            placeholder={isRTL ? "البحث عن الملفات او المهندسين..." : "Search files or engineers..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full bg-slate-50/50 border border-slate-100 rounded-2xl py-2 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all",
              isRTL ? "pr-10" : "pl-10"
            )}
          />
        </div>

        <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50")}
            >
              <List className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Data Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  {config.columns.map(col => (
                    <th key={col.key} className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400", isRTL ? "text-right" : "text-left")}>
                      {col.label}
                    </th>
                  ))}
                  <th className={cn("px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400", isRTL ? "text-left" : "text-right")}>
                    {isRTL ? "إجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    {config.columns.map(col => (
                      <td key={col.key} className={cn("px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap", isRTL ? "text-right" : "text-left")}>
                        {col.key === 'name' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors">
                              <FileText className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="text-slate-900 font-bold">{item[col.key]}</span>
                          </div>
                        ) : col.key === 'quantity' ? (
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-black",
                              (item.quantity || 0) < 3 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                            )}>
                              {item.quantity}
                            </span>
                          </div>
                        ) : (
                          item[col.key]
                        )}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className={cn("flex items-center gap-2", isRTL ? "justify-start" : "justify-end")}>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasPermission('action', 'canDownload') && (
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {hasPermission('admin') && (
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-blue-500/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-900">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-slate-900 font-bold mb-1 truncate">{item.name}</h4>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">{item.category}</p>
                
                <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{isRTL ? "بواسطة" : "By"}</span>
                      <span className="text-slate-900 font-bold">{item.owner}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{isRTL ? "التاريخ" : "Date"}</span>
                      <span className="text-slate-600 font-mono">{item.date}</span>
                   </div>
                </div>

                <div className="flex gap-2">
                   <button className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all">
                    {isRTL ? "عرض" : "View"}
                   </button>
                   {hasPermission('action', 'canDownload') && (
                     <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all">
                      <Download className="w-4 h-4" />
                     </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{isRTL ? "لا توجد نتائج" : "No Results Found"}</h3>
            <p className="text-sm text-slate-500 max-w-xs">{isRTL ? "لم نتمكن من العثور على أي ملفات تطابق بحثك" : "We couldn't find any files matching your search criteria"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
