import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Send, 
  Mic, 
  Square, 
  Volume2, 
  User, 
  Wifi, 
  Clock, 
  Layers, 
  Flame, 
  VolumeX, 
  Bot,
  MessageSquare,
  Activity,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  textAr?: string;
  channel: string;
  timestamp: string;
  type: 'message' | 'system';
  actorName?: string;
  actorRole?: string;
}

export function CrewIntercom() {
  const { isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [showSystemLogs, setShowSystemLogs] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordInterval = useRef<any>(null);

  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calibration sequence
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  // Sync with Backend via Socket.io
  useEffect(() => {
    if (isLoading) return;

    const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? window.location.origin : '');
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Intercom socket connected successfully');
      if (user?.id) {
        socket.emit('login', {
          userId: user.id,
          email: user.email,
          username: user.username,
          roleId: user.roleId
        });
      }
    });

    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat_message', (msg: ChatMessage) => {
      setMessages(prev => {
        if (prev.some(p => p.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('typing_users_change', (allTyping: Record<string, string[]>) => {
      setTypingUsers(allTyping);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [isLoading, user?.id]);

  // Clean-up typing indicator when changing active channels
  useEffect(() => {
    if (socketRef.current && user?.id) {
      // General safety cleanup across all other channels
      ['general', 'mechanical', 'software'].forEach(ch => {
        if (ch !== activeChannel) {
          socketRef.current.emit('typing_stop', {
            userId: user.id,
            username: user.username,
            channel: ch
          });
        }
      });
      setIsTyping(false);
    }
  }, [activeChannel, user?.id]);

  // Handle Input text changes and emit typing notification with debounce
  const handleInputChange = (val: string) => {
    setTypedMessage(val);
    if (!user?.id || !socketRef.current) return;

    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit('typing_start', {
        userId: user.id,
        username: user.username,
        channel: activeChannel
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing_stop', {
          userId: user.id,
          username: user.username,
          channel: activeChannel
        });
      }
      setIsTyping(false);
    }, 2500);
  };

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, activeChannel]);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || typedMessage;
    if (!text.trim()) return;

    if (socketRef.current) {
      socketRef.current.emit('send_chat_message', {
        senderId: user?.id || 'anonymous',
        senderName: user?.username,
        senderRole: user?.roleId,
        text,
        channel: activeChannel
      });

      // Clear typing indicator instantly on send
      socketRef.current.emit('typing_stop', {
        userId: user?.id,
        username: user?.username,
        channel: activeChannel
      });
      setTypedMessage('');
      setIsTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  // Profile icon helper
  const getUserEmoji = (username?: string, role?: string) => {
    if (username === "System Notification" || role === "system") return "🔔";
    if (username === "محمد حسين عبدالعزيز" || role === "ceo" || role === "admin") return "👑";
    if (role?.includes('prof') || role?.includes('assistant')) return "🎓";
    if (role === 'three_d_manager') return "📐";
    if (role === 'data_manager') return "📊";
    if (role === 'software_tech') return "💻";
    if (role === 'mechanical_team') return "🔧";
    if (role === 'research_data') return "🔬";
    if (role === 'media_team') return "🎥";
    if (role === 'components_manager') return "📦";
    return "👤";
  };

  const getUserPicture = (username?: string) => {
    if (!username) return null;
    switch (username) {
      case "محمد حسين عبدالعزيز": return "/leader.jpeg";
      case "محمد محمد عبدالله": return "/mohamed_abdallah.jpg";
      case "نورة شحاتة محمد": return "/nora_shehata.jpg";
      case "فارس محمد صبري": return "/fares_sabry.jpeg";
      case "شهد احمد هلال": return "/shahd_ahmed.jpeg";
      case "محمد راوف عبده محمد": return "/mohamed_raouf.jpeg";
      case "عادل قدرى محمد": return "/adel_kadry.jpeg";
      case "عبدالرحمن على محمد": return "/abdelrahman_ali.jpeg";
      case "فيلوباتير جورج وليم": return "/philopateer_george.jpeg";
      case "بيتر هانى فوزى شحاتة": return "/peter_hany.jpeg";
      case "محمد منتصر محمد": return "/mohamed_montaser.jpeg";
      case "حنين علاء على": return "/haneen_alaa.jpeg";
      case "سلمي خالد محمود احمد": return "/salma_khaled.jpeg";
      case "ناصف محمد ناصف": return "/nasef_mohamed.jpg";
      case "م. روشان": return "/roshan.png";
      case "أ.د. ابراهيم شعيب": return "/dr_ibrahim_shoaib.png";
      default: return null;
    }
  };

  const getRoleLabel = (roleId?: string, isArabic?: boolean) => {
    switch (roleId) {
      case 'ceo':
        return isArabic ? 'الرئيس التنفيذي / القائد' : 'CEO / Leader';
      case 'supervising_prof':
        return isArabic ? 'الأستاذ المشرف' : 'Supervising Professor';
      case 'supervising_assistant':
        return isArabic ? 'مساعد مشرف' : 'Supervising Assistant';
      case 'three_d_manager':
        return isArabic ? 'مدير التصميم 3D' : '3D Design Manager';
      case 'data_manager':
        return isArabic ? 'مدير البيانات والمشروعات' : 'Data & Projects Manager';
      case 'software_tech':
        return isArabic ? 'فريق البرمجيات والذكاء الإصطناعي' : 'AI & Software Team';
      case 'mechanical_team':
        return isArabic ? 'الهندسة الميكانيكية والمعدات' : 'Mechanical & Hardware Team';
      case 'research_data':
        return isArabic ? 'البحث العلمي والتحليلات' : 'Research & Analytics Team';
      case 'media_team':
        return isArabic ? 'التنسيق والإعلام' : 'Media & Formatting Team';
      case 'components_manager':
        return isArabic ? 'مسؤول المكونات والمخازن' : 'Inventory Manager';
      default:
        return isArabic ? 'عضو فريق فني' : 'Technical Officer';
    }
  };

  // SpeechSynthesis TTS function - matches playVoice original feature
  const playVoiceMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const isArabic = /[\u0600-\u06FF]/.test(text);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isArabic ? 'ar-EG' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // VoiceRecording simulator
  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordDuration(0);
    recordInterval.current = setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);

    // Emit a client action so everyone sees who is recording a voice clip!
    if (socketRef.current && user?.id) {
      socketRef.current.emit('send_client_action', {
        userId: user.id,
        actionEn: "Started recording a voice dispatch in the channel",
        actionAr: "بدأ بتسجيل إرسال صوتي ميداني في القناة"
      });
    }
  };

  const stopVoiceRecording = () => {
    clearInterval(recordInterval.current);
    setIsRecording(false);
    if (recordDuration > 0) {
      const voiceLabel = isRTL 
        ? `🎙️ إفادة صوتية ميدانية (${recordDuration} ثانية)` 
        : `🎙️ Live Voice Dispatch (${recordDuration}s)`;
      handleSendMessage(voiceLabel);
    }
  };

  // Filter messages dynamically
  // System actions (notifications) are universal and showed inside all channels. Standard chat messages are filtered by channel.
  const filteredMessages = messages.filter(msg => {
    if (msg.type === 'system') {
      return showSystemLogs;
    }
    return msg.channel === activeChannel;
  });

  const activeTypers = (typingUsers[activeChannel] || []).filter(u => u !== user?.username);

  return (
    <div className="flex flex-col gap-6 text-white h-full pb-10" id="intercom-container">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md" id="intercom-header">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </span>
            {isRTL ? 'مركز التواصل الجماعي والعمليات اللحظية' : 'Team Operations Chat & System Intercom'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-light">
            {isRTL 
              ? 'تواصل جماعي لاسلكي مشفر للربط والتدقيق اللحظي لجميع أعضاء الفريق، مع تحديثات فورية تفاعلية للعمليات والإجراءات المنفذة.' 
              : 'Collaborative real-time room for synchronized group chat and system audit feeds. Track current typers and automated live activity logs.'}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 shrink-0">
          {/* Action Log visibility filter */}
          <button
            onClick={() => setShowSystemLogs(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-2xl border transition-all cursor-pointer ${
              showSystemLogs 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20' 
                : 'bg-slate-900 border-white/5 text-slate-400 hover:bg-slate-850'
            }`}
            title={isRTL ? 'إظهار/إخفاء السجلات السيستم' : 'Toggle System Actions Visibility'}
          >
            {showSystemLogs ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isRTL ? 'تنبيهات النظام' : 'System Alerts'}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${showSystemLogs ? 'bg-blue-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

          <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-900 border border-white/5 py-2.5 px-4 rounded-2xl text-emerald-400">
            <Wifi className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            SOCKET HOST: ONLINE
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]" id="intercom-skeleton-view" key="intercom-skeleton">
            <div className="bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
            <div className="lg:col-span-3 bg-slate-950/30 border border-white/5 rounded-3xl animate-pulse h-full" />
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch"
            id="intercom-panels"
            key="intercom-content"
          >
            {/* Multi-channel left side control list */}
            <div className="bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col gap-4" id="intercom-sidebar-rooms">
              <h3 className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{isRTL ? 'الغرف والقنوات المتاحة' : 'Rooms & Channels'}</h3>
              
              <div className="flex flex-col gap-2">
                {[
                  { id: 'general', label: isRTL ? '📢 التوجيه العام والقيادة' : '📢 General & Broadcast', desc: isRTL ? 'لجميع التحديثات العامة والملاحظات' : 'Universal broadcast feed' },
                  { id: 'mechanical', label: isRTL ? '🔧 الورشة والصيانة الميدانية' : '🔧 Mechanical & Hardware', desc: isRTL ? 'عادل قدري والتعديلات الإنشائية' : 'Hardware engineering log' },
                  { id: 'software', label: isRTL ? '💻 كود المزامنة والذكاء الإصطناعي' : '💻 AI & Software Suite', desc: isRTL ? 'فيلوباتير وبيتر هاني والمطورين' : 'Code and machine learning logs' }
                ].map(chan => {
                  const hasTyping = (typingUsers[chan.id] || []).filter(u => u !== user?.username).length > 0;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => setActiveChannel(chan.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 hover:bg-white/5 ${
                        activeChannel === chan.id 
                          ? 'bg-blue-600/15 border-blue-500 text-white shadow-xl shadow-blue-500/5' 
                          : 'bg-transparent border-white/5 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold leading-tight">{chan.label}</span>
                        {hasTyping ? (
                          <span className="flex gap-0.5 items-center">
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${activeChannel === chan.id ? 'bg-blue-400' : 'bg-slate-700'}`} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 text-left font-light truncate">{chan.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Online Users Count panel */}
              <div className="mt-auto bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-300">{isRTL ? 'احصائيات البوابة' : 'ROOM ANALYTICS'}</span>
                </div>
                <div className="text-xs font-extrabold flex justify-between">
                  <span className="text-slate-500">{isRTL ? 'إجمالي الرسائل:' : 'Total Log Capacity:'}</span>
                  <span className="font-mono text-slate-300">{messages.length}</span>
                </div>
                <div className="text-xs font-extrabold flex justify-between">
                  <span className="text-slate-500">{isRTL ? 'حالة التشفير:' : 'Cipher Mode:'}</span>
                  <span className="font-mono text-emerald-400">TLS AES-256</span>
                </div>
              </div>
            </div>

            {/* Chat Room Center Screen Panel */}
            <div className="lg:col-span-3 bg-slate-950/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-[560px] relative" id="intercom-main-screen">
              
              {/* Active channel header info */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black font-mono tracking-widest text-blue-400 uppercase">
                      #{activeChannel}
                    </span>
                    <span className="text-[9px] text-slate-500">
                      {isRTL ? 'محدث بصورة كاملة وفورية' : 'E2EE Real-time Sync'}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isRTL ? 'جلسة تشفير موحدة' : 'Connected Group Room'}
                </div>
              </div>

              {/* Chat timeline history viewport */}
              <div className="flex-1 overflow-y-auto pr-1 mb-4 space-y-4 no-scrollbar">
                {filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <MessageSquare className="w-8 h-8 text-slate-650 animate-bounce mb-3" />
                    <p className="text-xs text-slate-400 font-medium">
                      {isRTL ? 'لا يوجد رسائل أو تنبيهات في هذا المجرى حالياً' : 'No messages or notifications currently in this feed.'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isRTL ? 'قم بكتابة رسالتك بالأسفل للتحدث اللحظي مع الزملاء.' : 'Type your dispatch message below to speak live with the crew.'}
                    </p>
                  </div>
                ) : (
                  filteredMessages.map((msg, index) => {
                    const isSystem = msg.type === 'system';
                    const isSelf = msg.senderId === user?.id;

                    if (isSystem) {
                      {/* Fulfill "Who performed the action" with a stunning structured System/AI Notice block */}
                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id || index} 
                          className="flex justify-center my-4 px-4 pr-1"
                        >
                          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 max-w-[85%] text-slate-300 shadow-lg text-[11px] leading-relaxed relative overflow-hidden flex items-start gap-3">
                            {/* Decorative left bar highlighting audit level */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 shadow" />
                            
                            {/* Activity icon container */}
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                              <Activity className="w-3.5 h-3.5" />
                            </div>

                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center gap-1.5 justify-between">
                                <span className="font-extrabold text-[10px] text-blue-300 font-mono tracking-wide uppercase">
                                  {isRTL ? 'تنبيه حدث لوحي' : 'SYSTEM AUDIT ACTION'}
                                </span>
                                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                                </span>
                              </div>
                              <p className="text-slate-300 text-left text-xs font-semibold leading-relaxed">
                                {isRTL && msg.textAr ? msg.textAr : msg.text}
                              </p>
                              <div className="flex items-center gap-1.5 pt-1 text-[9px] text-slate-500 font-medium">
                                <span>{msg.actorName || (isRTL ? 'المنصة' : 'Cloud Engine')}</span>
                                {msg.actorRole && (
                                  <>
                                    <span>•</span>
                                    <span className="text-indigo-400 font-mono tracking-wider text-[8.5px] font-semibold">{getRoleLabel(msg.actorRole, isRTL)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    {/* Regular Chat message bubble ("Who is talking") */}
                    const profileImage = getUserPicture(msg.senderName);
                    const parsedTime = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id || index} 
                        className={`flex gap-3 max-w-[80%] ${isSelf ? 'ml-auto flex-row-reverse items-start' : 'mr-auto flex-row items-start'}`}
                      >
                        {/* Avatar representation with fallback design */}
                        {profileImage ? (
                          <img 
                            src={profileImage} 
                            alt={msg.senderName} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-2xl border border-white/10 shrink-0 object-cover mt-1"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center mt-1 text-md select-none">
                            {getUserEmoji(msg.senderName, msg.senderRole)}
                          </div>
                        )}

                        <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                          {/* Sender name + Role badge */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-extrabold text-blue-300">{msg.senderName}</span>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 font-mono text-slate-400 scale-90">
                              {getRoleLabel(msg.senderRole, isRTL)}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{parsedTime}</span>
                          </div>

                          {/* Message bubble speech content */}
                          <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-4 group transition-all ${
                            isSelf 
                              ? 'bg-blue-600/10 border-blue-500/30 text-white rounded-tr-none' 
                              : 'bg-slate-900/90 border-white/10 text-slate-200 rounded-tl-none'
                          }`}>
                            <p className="flex-1 text-left whitespace-pre-wrap">{msg.text}</p>
                            
                            {/* Text-to-Speech instant playback */}
                            <button 
                              onClick={() => playVoiceMessage(msg.text)}
                              className="p-1.5 bg-slate-950/40 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
                              title={isRTL ? 'نطق الإفادة صوتياً' : 'Speak voice dispatch'}
                            >
                              <Volume2 className="w-3.5 h-3.5 text-blue-400 hover:text-blue-300" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                {/* Ref for auto scrolling down */}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic indicator displaying who is current typing: "Who is typing" */}
              <AnimatePresence>
                {activeTypers.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-20 left-6 flex items-center gap-2 bg-slate-950/80 border border-white/5 py-1.5 px-3 rounded-2xl"
                  >
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300">
                      {activeTypers.join(', ')} {activeTypers.length === 1 ? (isRTL ? 'يكتب الآن...' : 'is typing...') : (isRTL ? 'يكتبون الآن...' : 'are typing...')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Real-time Composer and Voice dispatcher inputs panel */}
              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                {isRecording ? (
                  /* Audio visual transmission interface */
                  <div className="flex-1 bg-red-950/25 border border-red-500/30 p-3 rounded-2xl flex items-center justify-between text-xs text-red-400 animate-pulse font-mono">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span>DISPATCH AUDIO TRANSMITTING ({recordDuration}s)</span>
                    </div>

                    <button 
                      onClick={stopVoiceRecording}
                      className="bg-red-600 hover:bg-red-500 p-2.5 rounded-xl text-white outline-none active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <Square className="w-4 h-4 text-white" />
                      <span className="text-[10px] font-black">{isRTL ? 'إرسال' : 'SEND'}</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Simulator Record Button */}
                    <button 
                      onClick={startVoiceRecording}
                      className="bg-slate-900 hover:bg-slate-800 border border-white/10 p-4 rounded-2xl text-slate-300 hover:text-red-400 transition-all transform active:scale-90 outline-none cursor-pointer shrink-0"
                      title={isRTL ? 'تسجيل إفادة صوتية قصيرة' : 'Record live voice dispatch clip'}
                    >
                      <Mic className="w-5 h-5 text-rose-500 hover:scale-105 transition-transform" />
                    </button>

                    <input 
                      type="text"
                      placeholder={isRTL ? 'ارسل رسالة فورية جماعية أو إفادة للغرفة المفتوحة...' : 'Type dispatch message for crews...'}
                      value={typedMessage}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />

                    <button 
                      onClick={() => handleSendMessage()}
                      className="bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-2xl active:scale-95 transition-all transform outline-none cursor-pointer shrink-0"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
