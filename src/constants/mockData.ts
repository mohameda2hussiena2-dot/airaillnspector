
export const MOCK_STATS = {
  totalUsers: 18,
  onlineUsersCount: 3,
  pendingTasks: 4,
  avgAiRating: 4.8,
  userAnalytics: [
    { id: 'mock-1', username: 'محمد حسين عبدالعزيز', email: 'mohameda2hussiena2@gmail.com', role_id: 'ceo', is_online: true, session_duration: 3600, last_login: new Date().toISOString() },
    { id: 'mock-2', username: 'أ.د. ابراهيم شعيب', email: 'ask.shoaib@ymail.com', role_id: 'supervising_prof', is_online: true, session_duration: 1200, last_login: new Date().toISOString() },
    { id: 'mock-3', username: 'نورة شحاتة محمد', email: 'nourashehata135@gmail.com', role_id: 'data_manager', is_online: true, session_duration: 2400, last_login: new Date().toISOString() }
  ],
  chartData: [
    { date: '2024-05-12', totalMinutes: 120 },
    { date: '2024-05-13', totalMinutes: 340 },
    { date: '2024-05-14', totalMinutes: 280 },
    { date: '2024-05-15', totalMinutes: 450 },
    { date: '2024-05-16', totalMinutes: 390 },
    { date: '2024-05-17', totalMinutes: 520 },
    { date: '2024-05-18', totalMinutes: 480 }
  ]
};

export const MOCK_TASKS = [
  { id: 'task-1', title: 'فحص قضبان قطاع الإسكندرية', status: 'pending', assigned_to: 'mechanical_team', assignee: 'أحمد ثروت إبراهيم', due_date: '2024-06-01' },
  { id: 'task-2', title: 'تحديث خوارزمية كشف الشروخ', status: 'completed', assigned_to: 'software_tech', assignee: 'فيلوباتير جورج وليم', due_date: '2024-05-20' },
  { id: 'task-3', title: 'صيانة قاعدة بيانات الصور', status: 'pending', assigned_to: 'data_manager', assignee: 'نورة شحاتة محمد', due_date: '2024-05-30' }
];

export const MOCK_MODELS = [
  { id: 'model-1', name: 'Rail Sensor Housing V2', category: 'Hardware', version: '2.1', engineer: 'أحمد ثروت إبراهيم', last_modified: new Date().toISOString() },
  { id: 'model-2', name: 'Inspection Drone Chassis', category: 'Drone Parts', version: '1.0', engineer: 'محمد محمد عبدالله', last_modified: new Date().toISOString() }
];

export const MOCK_AUDIT_LOGS = [
  { id: 'log-1', user_id: 'ceo', action: 'LOGIN', details: 'User logged in', created_at: new Date().toISOString() },
  { id: 'log-2', user_id: 'ceo', action: 'TASK_CREATED', details: 'New maintenance task created', created_at: new Date().toISOString() }
];
