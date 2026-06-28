export interface User {
  id: string;
  name: string;
  email: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  activeHours: string[];
}

export interface SubTask {
  id: string;
  title: string;
  duration: number; // in minutes
  status: 'pending' | 'completed';
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  deadline: string; // ISO string
  category: 'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | 'Urgent';
  priority: 'High' | 'Medium' | 'Low';
  aiPriorityReason?: string;
  estimatedDuration: number; // in minutes
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed';
  subtasks: SubTask[];
  completedAt?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string; // ISO string
  progress: number; // 0 to 100
  status: 'active' | 'achieved' | 'missed';
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompleted?: string; // YYYY-MM-DD
  history: string[]; // YYYY-MM-DD
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  taskId: string;
  taskTitle: string;
  reminderTime: string; // ISO string
  type: 'info' | 'warning' | 'urgent' | 'escalation';
  message: string;
  status: 'active' | 'sent' | 'acknowledged';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface ProductivityAnalytics {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedCount: number;
  missedCount: number;
  focusMinutes: number;
  habitConsistency: number; // percentage
}

export interface ScheduleItem {
  time: string;
  taskTitle: string;
  type: 'work' | 'personal' | 'buffer' | 'break';
  duration: number;
}

export interface InsightReport {
  insights: {
    bestTime: string;
    efficiencyRate: number;
    focusRecommendation: string;
    habitsAdvice: string;
  };
  weeklyLogs: ProductivityAnalytics[];
}
