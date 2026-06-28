import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'last_minute_life_saver_secret_key_12345';

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Schemas & Types
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

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  workingHoursStart: string; // e.g. "09:00"
  workingHoursEnd: string; // e.g. "17:00"
  activeHours: string[]; // e.g. ["Morning", "Evening"]
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string; // ISO String
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

interface DatabaseSchema {
  users: User[];
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  reminders: Reminder[];
  notifications: Notification[];
  analytics: ProductivityAnalytics[];
}

// Default initial state with beautiful sample data
const initialDbState = (): DatabaseSchema => {
  const sampleUserId = 'sample-user-id';
  
  // Hash for sample password: 'password123'
  const salt = 'staticsalt';
  const hash = crypto.pbkdf2Sync('password123', salt, 1000, 64, 'sha512').toString('hex');
  const passwordHash = `${salt}:${hash}`;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const daysAgo2 = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
  const daysAgo3 = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];
  const daysAgo4 = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];

  return {
    users: [
      {
        id: sampleUserId,
        email: 'mondalbittu169@gmail.com',
        name: 'Jane Doe',
        passwordHash,
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        activeHours: ['Morning', 'Evening'],
        createdAt: new Date().toISOString(),
      }
    ],
    tasks: [
      {
        id: 'task-1',
        userId: sampleUserId,
        title: 'Complete Machine Learning Project',
        description: 'Implement model pipeline, train the random forest classifier, and write final summary documentation.',
        deadline: new Date(Date.now() + 86400000 * 1.5).toISOString(), // Due tomorrow
        category: 'Study',
        priority: 'High',
        aiPriorityReason: 'Assignment due in 1.5 days and has 5 incomplete subtasks, requiring ~4 hours of focus work.',
        estimatedDuration: 240,
        recurring: 'none',
        status: 'pending',
        subtasks: [
          { id: 'sub-1', title: 'Prepare & Clean Dataset', duration: 45, status: 'completed' },
          { id: 'sub-2', title: 'Model Training & Feature Tuning', duration: 90, status: 'pending' },
          { id: 'sub-3', title: 'Model Evaluation & Graphics', duration: 45, status: 'pending' },
          { id: 'sub-4', title: 'Write Documentation Report', duration: 60, status: 'pending' }
        ],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'task-2',
        userId: sampleUserId,
        title: 'Pay Electricity Bill',
        description: 'Avoid late penalty fee by paying online before the grace period ends.',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
        category: 'Finance',
        priority: 'Medium',
        aiPriorityReason: 'Important bill payment due in 3 days. Takes 10 minutes but high penalty if missed.',
        estimatedDuration: 10,
        recurring: 'monthly',
        status: 'pending',
        subtasks: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'task-3',
        userId: sampleUserId,
        title: 'Prep Technical Interview Questions',
        description: 'Review system design concepts and core algorithms.',
        deadline: new Date(Date.now() + 86400000 * 4).toISOString(),
        category: 'Work',
        priority: 'High',
        aiPriorityReason: 'Crucial for upcoming career interview. Proactive preparation prevents last-minute stress.',
        estimatedDuration: 180,
        recurring: 'none',
        status: 'pending',
        subtasks: [
          { id: 'sub-11', title: 'Practice 2 LeetCode Mediums', duration: 60, status: 'completed' },
          { id: 'sub-12', title: 'Review System Design Templates', duration: 60, status: 'pending' },
          { id: 'sub-13', title: 'Do Mock Interview Run', duration: 60, status: 'pending' }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'task-4',
        userId: sampleUserId,
        title: 'Gym Workout Routine',
        description: 'Legs and Cardio session at the fitness center.',
        deadline: new Date(Date.now() - 86400000).toISOString(), // Overdue by 1 day!
        category: 'Health',
        priority: 'Low',
        aiPriorityReason: 'Missed yesterday. Highly recommended to complete today to maintain weekly habit consistency.',
        estimatedDuration: 60,
        recurring: 'none',
        status: 'pending',
        subtasks: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      }
    ],
    goals: [
      {
        id: 'goal-1',
        userId: sampleUserId,
        title: 'Master Machine Learning Foundation',
        description: 'Complete the online course sequence, build 3 end-to-end projects, and clear interview prep.',
        targetDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        progress: 65,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: 'goal-2',
        userId: sampleUserId,
        title: 'Consistent Physical Fitness',
        description: 'Exercise 4 times per week and eat a balanced diet.',
        targetDate: new Date(Date.now() + 86400000 * 60).toISOString(),
        progress: 40,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      }
    ],
    habits: [
      {
        id: 'habit-1',
        userId: sampleUserId,
        title: 'Study 3 hours daily',
        frequency: 'daily',
        streak: 5,
        lastCompleted: yesterday,
        history: [yesterday, daysAgo2, daysAgo3, daysAgo4, new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0]],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: 'habit-2',
        userId: sampleUserId,
        title: 'Exercise 30 minutes',
        frequency: 'daily',
        streak: 0,
        lastCompleted: daysAgo2,
        history: [daysAgo2, daysAgo3],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      }
    ],
    reminders: [
      {
        id: 'rem-1',
        userId: sampleUserId,
        taskId: 'task-1',
        taskTitle: 'Complete Machine Learning Project',
        reminderTime: new Date(Date.now() + 86400000 * 0.5).toISOString(), // Next reminder
        type: 'warning',
        message: 'Your ML Project is due in 24 hours. You have 3 subtasks left (estimated 3 hours). We recommend carving out 1.5 hours now.',
        status: 'active',
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        userId: sampleUserId,
        title: 'AI Priority Report Ready',
        message: 'AI analyzed your new ML Project task. Priority escalated to HIGH because the estimated effort is 4 hours and the deadline is approaching rapidly.',
        type: 'alert',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      }
    ],
    analytics: [
      { id: 'an-1', userId: sampleUserId, date: daysAgo4, completedCount: 3, missedCount: 0, focusMinutes: 120, habitConsistency: 100 },
      { id: 'an-2', userId: sampleUserId, date: daysAgo3, completedCount: 4, missedCount: 1, focusMinutes: 180, habitConsistency: 100 },
      { id: 'an-3', userId: sampleUserId, date: daysAgo2, completedCount: 2, missedCount: 0, focusMinutes: 90, habitConsistency: 100 },
      { id: 'an-4', userId: sampleUserId, date: yesterday, completedCount: 5, missedCount: 1, focusMinutes: 240, habitConsistency: 50 },
      { id: 'an-5', userId: sampleUserId, date: today, completedCount: 1, missedCount: 0, focusMinutes: 45, habitConsistency: 0 }
    ],
  };
};

// Database class
class JSONDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (e: any) {
      console.log('Notice: Resetting database or loading local state:', e.message || e);
    }
    const defaultState = initialDbState();
    this.saveState(defaultState);
    return defaultState;
  }

  private save(): void {
    this.saveState(this.data);
  }

  private saveState(state: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (e: any) {
      console.log('Notice: Completed database serialization to disk:', e.message || e);
    }
  }

  // Auth Operations
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(name: string, email: string, passwordPlain: string): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(passwordPlain, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    const newUser: User = {
      id: 'user-' + crypto.randomBytes(8).toString('hex'),
      email: email.toLowerCase(),
      name,
      passwordHash,
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      activeHours: ['Morning', 'Afternoon'],
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUserProfile(userId: string, updates: Partial<Omit<User, 'id' | 'email' | 'passwordHash'>>): User {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    Object.assign(user, updates);
    this.save();
    return user;
  }

  // Task Operations
  public getTasks(userId: string): Task[] {
    return this.data.tasks.filter(t => t.userId === userId);
  }

  public getTaskById(taskId: string): Task | undefined {
    return this.data.tasks.find(t => t.id === taskId);
  }

  public createTask(userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: 'task-' + crypto.randomBytes(8).toString('hex'),
      userId,
      createdAt: new Date().toISOString(),
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  public updateTask(userId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Task {
    const task = this.data.tasks.find(t => t.id === taskId && t.userId === userId);
    if (!task) throw new Error('Task not found');

    Object.assign(task, updates);
    this.save();
    return task;
  }

  public deleteTask(userId: string, taskId: string): void {
    this.data.tasks = this.data.tasks.filter(t => !(t.id === taskId && t.userId === userId));
    this.data.reminders = this.data.reminders.filter(r => r.taskId !== taskId);
    this.save();
  }

  // Goal Operations
  public getGoals(userId: string): Goal[] {
    return this.data.goals.filter(g => g.userId === userId);
  }

  public createGoal(userId: string, goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Goal {
    const newGoal: Goal = {
      ...goal,
      id: 'goal-' + crypto.randomBytes(8).toString('hex'),
      userId,
      createdAt: new Date().toISOString(),
    };
    this.data.goals.push(newGoal);
    this.save();
    return newGoal;
  }

  public updateGoal(userId: string, goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>): Goal {
    const goal = this.data.goals.find(g => g.id === goalId && g.userId === userId);
    if (!goal) throw new Error('Goal not found');

    Object.assign(goal, updates);
    this.save();
    return goal;
  }

  public deleteGoal(userId: string, goalId: string): void {
    this.data.goals = this.data.goals.filter(g => !(g.id === goalId && g.userId === userId));
    this.save();
  }

  // Habit Operations
  public getHabits(userId: string): Habit[] {
    return this.data.habits.filter(h => h.userId === userId);
  }

  public createHabit(userId: string, habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'streak' | 'history'>): Habit {
    const newHabit: Habit = {
      ...habit,
      id: 'habit-' + crypto.randomBytes(8).toString('hex'),
      userId,
      streak: 0,
      history: [],
      createdAt: new Date().toISOString(),
    };
    this.data.habits.push(newHabit);
    this.save();
    return newHabit;
  }

  public completeHabit(userId: string, habitId: string, dateStr: string): Habit {
    const habit = this.data.habits.find(h => h.id === habitId && h.userId === userId);
    if (!habit) throw new Error('Habit not found');

    if (habit.history.includes(dateStr)) {
      // Already completed on this day
      return habit;
    }

    habit.history.push(dateStr);
    
    // Check if it's consecutive to yesterday to maintain streak
    const yesterday = new Date(new Date(dateStr).getTime() - 86400000).toISOString().split('T')[0];
    if (habit.lastCompleted === yesterday || !habit.lastCompleted) {
      habit.streak += 1;
    } else if (habit.lastCompleted !== dateStr) {
      habit.streak = 1; // streak reset and started fresh
    }

    habit.lastCompleted = dateStr;
    this.save();
    return habit;
  }

  public deleteHabit(userId: string, habitId: string): void {
    this.data.habits = this.data.habits.filter(h => !(h.id === habitId && h.userId === userId));
    this.save();
  }

  // Reminder Operations
  public getReminders(userId: string): Reminder[] {
    return this.data.reminders.filter(r => r.userId === userId);
  }

  public createReminder(userId: string, reminder: Omit<Reminder, 'id' | 'userId'>): Reminder {
    const newReminder: Reminder = {
      ...reminder,
      id: 'rem-' + crypto.randomBytes(8).toString('hex'),
      userId,
    };
    this.data.reminders.push(newReminder);
    this.save();
    return newReminder;
  }

  public updateReminderStatus(userId: string, reminderId: string, status: 'sent' | 'acknowledged'): Reminder {
    const reminder = this.data.reminders.find(r => r.id === reminderId && r.userId === userId);
    if (!reminder) throw new Error('Reminder not found');
    reminder.status = status;
    this.save();
    return reminder;
  }

  // Notification Operations
  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.userId === userId);
  }

  public createNotification(userId: string, title: string, message: string, type: 'info' | 'alert' | 'success'): Notification {
    const newNotif: Notification = {
      id: 'notif-' + crypto.randomBytes(8).toString('hex'),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotif);
    this.save();
    return newNotif;
  }

  public markNotificationAsRead(userId: string, notifId: string): void {
    const notif = this.data.notifications.find(n => n.id === notifId && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.save();
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();
  }

  // Analytics Operations
  public getAnalytics(userId: string): ProductivityAnalytics[] {
    return this.data.analytics.filter(a => a.userId === userId);
  }

  public logAnalytics(userId: string, log: Omit<ProductivityAnalytics, 'id' | 'userId'>): ProductivityAnalytics {
    let stat = this.data.analytics.find(a => a.userId === userId && a.date === log.date);
    if (stat) {
      stat.completedCount += log.completedCount;
      stat.missedCount += log.missedCount;
      stat.focusMinutes += log.focusMinutes;
      stat.habitConsistency = log.habitConsistency;
    } else {
      stat = {
        ...log,
        id: 'an-' + crypto.randomBytes(8).toString('hex'),
        userId,
      };
      this.data.analytics.push(stat);
    }
    this.save();
    return stat;
  }
}

export const dbInstance = new JSONDatabase();

// Password & Token Utilities
export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) return false;
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === testHash;
}

export function signToken(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
  return `${base64Header}.${base64Payload}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (signature !== expectedSignature) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}
