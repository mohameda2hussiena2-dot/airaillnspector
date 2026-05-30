
import { MOCK_TASKS } from '../constants/mockData';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigned_to?: string; 
  assigned_role?: string;
  assignee?: string;
  status: 'pending' | 'in-progress' | 'completed';
  due_date?: string;
  deadline_time?: string;
  report?: string;
  created_at: string;
  updated_at: string;
}

export const saveTask = (task: Partial<Task>) => {
  const tasks = JSON.parse(localStorage.getItem('app_tasks') || '[]');
  const newTask: Task = {
    id: `task-${Date.now()}`,
    title: task.title || '',
    description: task.description || '',
    assigned_to: task.assigned_to || '',
    assigned_role: task.assigned_role || '',
    assignee: task.assignee || '',
    status: 'pending',
    due_date: task.due_date || '',
    deadline_time: task.deadline_time || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...task
  };
  tasks.unshift(newTask);
  localStorage.setItem('app_tasks', JSON.stringify(tasks));
  return newTask;
};

export const updateTask = (taskId: string, updates: Partial<Task>) => {
  const tasks = JSON.parse(localStorage.getItem('app_tasks') || '[]');
  const index = tasks.findIndex((t: Task) => t.id === taskId);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem('app_tasks', JSON.stringify(tasks));
  }
};

export const getTasks = (): Task[] => {
  const existing = localStorage.getItem('app_tasks');
  if (!existing) {
    // Transform mock tasks into full Task interface objects
    const initialTasks: Task[] = MOCK_TASKS.map(t => ({
      id: t.id,
      title: t.title,
      description: 'مهمة عمل مرسلة من النظام للفحص والمتابعة.',
      assigned_to: t.assigned_to,
      assigned_role: t.assigned_to,
      assignee: t.assignee,
      status: t.status as Task['status'],
      due_date: t.due_date,
      deadline_time: '12:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    localStorage.setItem('app_tasks', JSON.stringify(initialTasks));
    return initialTasks;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    return [];
  }
};

export const getTasksForUser = (userId: string, roleId: string): Task[] => {
  const tasks = getTasks();
  return tasks.filter(t => t.assigned_to === userId || t.assigned_role === roleId);
};
