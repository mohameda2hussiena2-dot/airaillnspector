
export interface LogEntry {
  id: string;
  userId: string;
  username: string;
  action: string;
  details?: string;
  timestamp: string;
}

export const logActivity = (username: string, userId: string, action: string, details?: string) => {
  const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
  const newLog: LogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  // Keep only last 200 logs
  if (logs.length > 200) logs.length = 200;
  localStorage.setItem('activity_logs', JSON.stringify(logs));
  
  // Also dispatch a custom event so UI can react if it's currently open
  window.dispatchEvent(new CustomEvent('activity_logged', { detail: newLog }));
};

export const getLogs = (): LogEntry[] => {
  return JSON.parse(localStorage.getItem('activity_logs') || '[]');
};
