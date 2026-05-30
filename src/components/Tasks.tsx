import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle, Clock, Calendar, AlertCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, getTasks, updateTask } from '../lib/tasks';
import { cn } from '../lib/utils';
import { getApiUrl } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

export function Tasks() {
  const { user, token } = useAuth();
  const { isRTL } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTexts, setReportTexts] = useState<Record<string, string>>({});
  const [taskDates, setTaskDates] = useState<Record<string, string>>({});
  const [taskTimes, setTaskTimes] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const fetchTasks = async () => {
    try {
      if (!token) {
        setTasks(getTasks());
        setLoading(false);
        return;
      }
      const res = await fetch(getApiUrl('/api/engineering/tasks'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setTasks(data);
          // Sync server data to local storage for offline use
          localStorage.setItem('app_tasks', JSON.stringify(data));
          return;
        }
      }
      setTasks(getTasks());
    } catch (err) {
      console.warn("Failed to fetch tasks from server, falling back to local database", err);
      setTasks(getTasks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    const handleTaskUpdate = () => fetchTasks();
    window.addEventListener('taskUpdated', handleTaskUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('taskUpdated', handleTaskUpdate);
    };
  }, [token]);

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    // Optimistic / Fallback localStorage update
    updateTask(taskId, { status: newStatus });
    setTasks(getTasks());

    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (err) {
      console.warn("Failed to update status on server, local state is kept", err);
    }
  };

  const handleDeadlineUpdate = async (taskId: string) => {
    const date = taskDates[taskId];
    const time = taskTimes[taskId];
    
    // Backup offline local storage update
    updateTask(taskId, { due_date: date, deadline_time: time });
    setTasks(getTasks());

    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          due_date: date,
          deadline_time: time
        })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (err) {
      console.warn("Failed to update deadline on server, local state is kept", err);
    }
  };

  const handleSubmitReport = async (taskId: string) => {
    const reportText = reportTexts[taskId];
    if (!reportText?.trim()) return;

    // Backup offline local storage update
    updateTask(taskId, { report: reportText });
    setTasks(getTasks());
    setReportTexts(prev => ({ ...prev, [taskId]: '' }));

    if (!token) return;
    try {
      const res = await fetch(getApiUrl(`/api/engineering/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ report: reportText })
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('taskUpdated'));
      }
    } catch (err) {
      console.warn("Failed to submit report on server, local state is kept", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.4em] italic text-xs">
          {isRTL ? "جاري تحميل سجل المهام..." : "FETCHING_OPERATIONAL_DIRECTIVES"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={cn("flex flex-col gap-2", isRTL && "items-end")}>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
          {isRTL ? "سجل المهام والمسؤوليات" : "Operational Directives"}
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
            {isRTL ? "قائمة التكليفات الموجهة لك ومتابعة الإنجاز" : "PERSONAL TASK QUEUE & PROGRESS TRACKING"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => {
            const isExpanded = !!expandedTasks[task.id];
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -15 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                key={task.id} 
                className={cn(
                  "bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] transition-all duration-300 group relative overflow-hidden",
                  isExpanded ? "p-8 border-blue-500/20" : "p-6 hover:border-slate-700/50 cursor-pointer"
                )}
                onClick={() => {
                  if (!isExpanded) toggleExpand(task.id);
                }}
              >
              <div className={cn("absolute top-0 right-0 w-1.5 h-full", 
                task.status === 'completed' ? "bg-emerald-500" : 
                task.status === 'in-progress' ? "bg-blue-500" : 
                "bg-slate-700"
              )} />

              {/* Header Box - Clickable to expand/collapse at any time */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(task.id);
                }}
                className={cn(
                  "flex items-center justify-between gap-4 cursor-pointer select-none",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                  <div className={cn(
                    "p-3 rounded-2xl border shrink-0",
                    task.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : 
                    task.status === 'in-progress' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : 
                    "bg-white/5 border-white/10 text-slate-500"
                  )}>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate max-w-xs sm:max-w-md text-glow">
                      {task.title}
                    </h3>
                    
                    {!isExpanded && (
                      <p className={cn("text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1.5", isRTL && "text-right")}>
                        {isRTL ? "اضغط لعرض تفاصيل المهمة والتقارير المرفوعة" : "CLICK TO VIEW DETAIL OVERVIEW & SUBMITTED REPORTS"}
                      </p>
                    )}
                  </div>
                </div>

                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  {/* Status Badge in Header */}
                  <span className={cn(
                    "hidden sm:inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    task.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                    task.status === 'in-progress' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                    "bg-slate-800 border-white/10 text-slate-500"
                  )}>
                    {task.status === 'completed' ? (isRTL ? "مكتمل" : "COMPLETED") :
                     task.status === 'in-progress' ? (isRTL ? "جاري العمل" : "IN PROGRESS") :
                     (isRTL ? "قيد الانتظار" : "PENDING")}
                  </span>

                  {/* Toggle Chevron */}
                  <div className="p-2 bg-white/5 rounded-xl border border-white/10 hover:border-blue-500/30 text-slate-400 group-hover:text-blue-400 transition-all">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsed/Expanded section */}
              {isExpanded && (
                <div className="mt-8 pt-8 border-t border-white/5 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    <div className="flex-1 space-y-6">
                      
                      {/* Deadline details */}
                      <div className={cn("space-y-2.5", isRTL && "text-right")}>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-mono opacity-80">
                          {isRTL ? "الموعد النهائي وصلاحية المهمة" : "Operational SLA Deadline Time"}
                        </h4>
                        <div className={cn("flex flex-wrap gap-4", isRTL && "flex-row-reverse justify-start")}>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 shrink-0">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-black uppercase tracking-widest">{task.due_date || (isRTL ? 'غير معروف' : 'NO_DATE')}</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 shrink-0">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-black uppercase tracking-widest">{task.deadline_time || (isRTL ? 'غير معروف' : 'NO_TIME')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Full description */}
                      <div className={cn("space-y-2.5", isRTL && "text-right")}>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-mono opacity-80 font-semibold">
                          {isRTL ? "تفاصيل المهمة بالكامل" : "Full Operational Description"}
                        </h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed bg-white/[0.02] p-6 rounded-2xl border border-white/5 pre-wrap">
                          {task.description || (isRTL ? "لا يوجد وصف عمليات لهذه المهمة" : "No operation description provided.")}
                        </p>
                      </div>

                      {/* Submitted reports history section */}
                      {task.report ? (
                        <div className={cn("space-y-2.5", isRTL && "text-right")}>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-mono opacity-80">
                            {isRTL ? "التقرير المرفق للإنجاز والمتابعة" : "Submitted Report & History Logs"}
                          </h4>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3.5 italic font-mono">
                              {isRTL ? "تم إرسال التقرير" : "FILED_PROGRESS_REPORT"}
                            </p>
                            <p className="text-slate-300 text-xs italic">{task.report}</p>
                            <p className="text-[8px] text-slate-600 mt-3 font-mono">
                              {new Date(task.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className={cn("space-y-2.5", isRTL && "text-right")}>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic font-mono opacity-80">
                            {isRTL ? "التقارير المرفوعة" : "Submitted Reports"}
                          </h4>
                          <p className="text-slate-600 text-[11px] font-bold italic bg-white/[0.01] p-4 rounded-xl border border-dashed border-white/5">
                            {isRTL ? "لا يوجد تقارير مقدمة حالياً لمتابعة التقدم." : "No operational reports filed for this task queue yet."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Controller side-bar */}
                    <div className="lg:w-80 space-y-6 shrink-0" onClick={e => e.stopPropagation()}>
                      <div>
                        <label className={cn("block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic", isRTL && "text-right")}>
                          {isRTL ? "تحديث حالة المهمة" : "Operational Status"}
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'pending', label: isRTL ? 'قيد الانتظار' : 'QUEUED', color: 'slate' },
                            { id: 'in-progress', label: isRTL ? 'جاري العمل' : 'ACTIVE', color: 'blue' },
                            { id: 'completed', label: isRTL ? 'مكتمل' : 'SUCCESS', color: 'emerald' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleStatusUpdate(task.id, s.id as any)}
                              className={cn(
                                "px-4 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all italic border cursor-pointer",
                                task.status === s.id 
                                  ? (
                                    s.id === 'pending' ? "bg-slate-500/20 border-slate-500/50 text-slate-500 shadow-lg shadow-slate-500/10" :
                                    s.id === 'in-progress' ? "bg-blue-500/20 border-blue-500/50 text-blue-500 shadow-lg shadow-blue-500/10" :
                                    "bg-emerald-500/20 border-emerald-500/50 text-emerald-500 shadow-lg shadow-emerald-500/10"
                                  )
                                  : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                              )}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {task.status !== 'completed' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={cn("block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic", isRTL && "text-right")}>
                                {isRTL ? "تحديث التاريخ" : "Update Date"}
                              </label>
                              <input 
                                type="date"
                                defaultValue={task.due_date}
                                onChange={e => setTaskDates(prev => ({ ...prev, [task.id]: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-mono text-white outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className={cn("block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 italic", isRTL && "text-right")}>
                                {isRTL ? "تحديث الوقت" : "Update Time"}
                              </label>
                              <input 
                                type="time"
                                defaultValue={task.deadline_time}
                                onChange={e => setTaskTimes(prev => ({ ...prev, [task.id]: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-mono text-white outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeadlineUpdate(task.id)}
                            className="w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all italic cursor-pointer"
                          >
                            {isRTL ? "تحديث الموعد" : "Update Operational SLA"}
                          </button>

                          <div className="h-px bg-white/5" />

                          <div>
                            <label className={cn("block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic", isRTL && "text-right")}>
                              {isRTL ? "إرسال تقرير التقدم" : "Field Report"}
                            </label>
                            <textarea
                              className={cn("w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-medium text-white outline-none focus:ring-1 focus:ring-blue-500 resize-none h-24 placeholder:text-slate-700", isRTL && "text-right")}
                              placeholder={isRTL ? "اكتب تفاصيل الإنجاز هنا..." : "Input mission progress details..."}
                              value={reportTexts[task.id] || ''}
                              onChange={e => setReportTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                            />
                            <button
                              onClick={() => handleSubmitReport(task.id)}
                              disabled={!reportTexts[task.id]?.trim()}
                              className="w-full mt-2 py-3 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-20 italic cursor-pointer"
                            >
                              {isRTL ? "حفظ التقرير" : "Transmit Report"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-32 text-center bg-slate-900/40 rounded-[32px] border border-white/5 border-dashed">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/5 rounded-full border border-white/10">
                <AlertCircle className="w-12 h-12 text-slate-700" />
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-700 uppercase tracking-[0.4em] italic">
              {isRTL ? "لا توجد مهام حالياً" : "NO_DIRECTIVES_ASSIGNED"}
            </h3>
            <p className="text-[10px] text-slate-800 font-black uppercase tracking-widest mt-2 font-mono">
              SYSTEM_IDLE // WAITING_FOR_COMMANDS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
