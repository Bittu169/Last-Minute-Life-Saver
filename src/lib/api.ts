import {
  User,
  Task,
  Goal,
  Habit,
  Reminder,
  Notification,
  ScheduleItem,
  InsightReport
} from '../types';

const API_BASE = '/api';

// Helper to get auth header
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth Operations
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async googleSignIn(name: string, email: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Google Sign-In failed');
    }
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) {
      localStorage.removeItem('token');
      throw new Error('Session expired');
    }
    return res.json();
  },

  async updateProfile(updates: Partial<Omit<User, 'id' | 'email'>>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Task Operations
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  async deleteTask(taskId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete task');
  },

  // Schedule Operations
  async getSchedule(regenerate: boolean = false): Promise<ScheduleItem[]> {
    const url = `${API_BASE}/schedule${regenerate ? '?regenerate=true' : ''}`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },

  // Insights / Analytics Operations
  async getInsights(): Promise<InsightReport> {
    const res = await fetch(`${API_BASE}/insights`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch insights');
    return res.json();
  },

  // Goal Operations
  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch goals');
    return res.json();
  },

  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    return res.json();
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    return res.json();
  },

  async deleteGoal(goalId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/goals/${goalId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete goal');
  },

  // Habit Operations
  async getHabits(): Promise<Habit[]> {
    const res = await fetch(`${API_BASE}/habits`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch habits');
    return res.json();
  },

  async createHabit(habit: Partial<Habit>): Promise<Habit> {
    const res = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(habit),
    });
    if (!res.ok) throw new Error('Failed to create habit');
    return res.json();
  },

  async completeHabit(habitId: string, dateStr: string): Promise<Habit> {
    const res = await fetch(`${API_BASE}/habits/${habitId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ date: dateStr }),
    });
    if (!res.ok) throw new Error('Failed to complete habit');
    return res.json();
  },

  async deleteHabit(habitId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/habits/${habitId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete habit');
  },

  // Reminder Operations
  async getReminders(): Promise<{ activeReminders: Reminder[]; proactiveAdvice: string[] }> {
    const res = await fetch(`${API_BASE}/reminders`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch reminders');
    return res.json();
  },

  // Notification Operations
  async getNotifications(): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(notifId?: string): Promise<void> {
    const res = await fetch(`${API_BASE}/notifications/read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ notifId }),
    });
    if (!res.ok) throw new Error('Failed to mark notifications read');
  },

  // Voice Command Operations
  async sendVoiceCommand(command: string): Promise<{ action: string; spokenAnswer: string; parameters?: any }> {
    const res = await fetch(`${API_BASE}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ command }),
    });
    if (!res.ok) throw new Error('Failed to execute voice command');
    return res.json();
  }
};
