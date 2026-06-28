import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  dbInstance,
  verifyPassword,
  signToken,
  verifyToken,
  Task
} from './server/db';
import {
  analyzeTaskPriority,
  generateTaskBreakdown,
  generateDailySchedule,
  generateProductivityInsights,
  processVoiceCommand
} from './server/ai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. Missing token.' });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Access denied. Invalid or expired token.' });
  }
  req.userId = decoded.userId;
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  try {
    const existing = dbInstance.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    const user = dbInstance.createUser(name, email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, workingHoursStart: user.workingHoursStart, workingHoursEnd: user.workingHoursEnd, activeHours: user.activeHours }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const user = dbInstance.getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, workingHoursStart: user.workingHoursStart, workingHoursEnd: user.workingHoursEnd, activeHours: user.activeHours }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Client-side Google Sign-In helper endpoint (Popup based integration)
app.post('/api/auth/google', (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required.' });
  }
  try {
    let user = dbInstance.getUserByEmail(email);
    if (!user) {
      // Create user automatically
      user = dbInstance.createUser(name, email, 'google_oauth_placeholder_pwd_' + Math.random().toString());
    }
    const token = signToken({ userId: user.id, email: user.email });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, workingHoursStart: user.workingHoursStart, workingHoursEnd: user.workingHoursEnd, activeHours: user.activeHours }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  try {
    const user = dbInstance.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      workingHoursStart: user.workingHoursStart,
      workingHoursEnd: user.workingHoursEnd,
      activeHours: user.activeHours
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authenticate, (req: any, res) => {
  try {
    const user = dbInstance.updateUserProfile(req.userId, req.body);
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      workingHoursStart: user.workingHoursStart,
      workingHoursEnd: user.workingHoursEnd,
      activeHours: user.activeHours
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SMART TASK MANAGEMENT ENDPOINTS (AI Assisted)
// ==========================================

app.get('/api/tasks', authenticate, (req: any, res) => {
  try {
    const tasks = dbInstance.getTasks(req.userId);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', authenticate, async (req: any, res) => {
  const { title, description, deadline, category, estimatedDuration, recurring } = req.body;
  if (!title || !deadline) {
    return res.status(400).json({ error: 'Title and deadline are required.' });
  }

  try {
    const duration = estimatedDuration ? parseInt(estimatedDuration, 10) : 60;

    // AI Prioritization runs concurrently
    const aiPriorityPromise = analyzeTaskPriority(title, description || '', deadline, category || 'Personal', duration);
    
    // AI Autonomous Breakdown of subtasks if estimatedDuration > 120 mins or specifically large task description
    let subtasks: { id: string, title: string, duration: number, status: 'pending' | 'completed' }[] = [];
    const isLargeTask = duration >= 120 || (description && description.length > 50);
    
    const [priorityResult, breakdownResult] = await Promise.all([
      aiPriorityPromise,
      isLargeTask ? generateTaskBreakdown(title, description || '') : Promise.resolve([])
    ]);

    if (breakdownResult && breakdownResult.length > 0) {
      subtasks = breakdownResult.map((sub, idx) => ({
        id: `sub-${idx + 1}-${Math.random().toString(36).substr(2, 4)}`,
        title: sub.title,
        duration: sub.duration,
        status: 'pending'
      }));
    }

    const newTask = dbInstance.createTask(req.userId, {
      title,
      description: description || '',
      deadline,
      category: category || 'Personal',
      priority: priorityResult.priority,
      aiPriorityReason: priorityResult.reason,
      estimatedDuration: duration,
      recurring: recurring || 'none',
      status: 'pending',
      subtasks
    });

    // Create proactive notification for AI enhancement
    dbInstance.createNotification(
      req.userId,
      'Task AI-Analyzed',
      `"${title}" was prioritized as ${priorityResult.priority} priority. ${isLargeTask ? `Created ${subtasks.length} subtasks.` : ''}`,
      'success'
    );

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', authenticate, (req: any, res) => {
  try {
    const task = dbInstance.getTaskById(req.params.id);
    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const isCompleting = req.body.status === 'completed' && task.status === 'pending';
    const updates = { ...req.body };
    if (isCompleting) {
      updates.completedAt = new Date().toISOString();
      
      // Log completed task to analytics
      const todayStr = new Date().toISOString().split('T')[0];
      dbInstance.logAnalytics(req.userId, {
        date: todayStr,
        completedCount: 1,
        missedCount: 0,
        focusMinutes: task.estimatedDuration || 30,
        habitConsistency: 0
      });

      dbInstance.createNotification(
        req.userId,
        'Task Accomplished!',
        `Fantastic job completing "${task.title}"! Focus time logged: ${task.estimatedDuration} minutes.`,
        'success'
      );
    }

    const updatedTask = dbInstance.updateTask(req.userId, req.params.id, updates);
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticate, (req: any, res) => {
  try {
    const task = dbInstance.getTaskById(req.params.id);
    if (!task || task.userId !== req.userId) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    dbInstance.deleteTask(req.userId, req.params.id);
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// AI SMART SCHEDULING ENDPOINT
// ==========================================

let cachedSchedule: any = null;
let cacheTimestamp = 0;

app.get('/api/schedule', authenticate, async (req: any, res) => {
  const forceRegen = req.query.regenerate === 'true';
  const now = Date.now();

  try {
    const user = dbInstance.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Cache schedule for 10 minutes unless forced
    if (cachedSchedule && (now - cacheTimestamp < 600000) && !forceRegen) {
      return res.json(cachedSchedule);
    }

    const pendingTasks = dbInstance.getTasks(req.userId).filter(t => t.status === 'pending');
    
    const schedule = await generateDailySchedule(
      { start: user.workingHoursStart, end: user.workingHoursEnd },
      pendingTasks
    );

    cachedSchedule = schedule;
    cacheTimestamp = now;

    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// PERSONALIZED INSIGHTS ENDPOINT
// ==========================================

app.get('/api/insights', authenticate, async (req: any, res) => {
  try {
    const user = dbInstance.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const analytics = dbInstance.getAnalytics(req.userId);
    const tasks = dbInstance.getTasks(req.userId).filter(t => t.status === 'pending');

    const insights = await generateProductivityInsights(analytics, tasks, user.activeHours);
    res.json({
      insights,
      weeklyLogs: analytics.slice(-7)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// GOAL TRACKER ENDPOINTS
// ==========================================

app.get('/api/goals', authenticate, (req: any, res) => {
  try {
    const goals = dbInstance.getGoals(req.userId);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/goals', authenticate, (req: any, res) => {
  const { title, description, targetDate } = req.body;
  if (!title || !targetDate) {
    return res.status(400).json({ error: 'Title and targetDate are required.' });
  }
  try {
    const goal = dbInstance.createGoal(req.userId, {
      title,
      description: description || '',
      targetDate,
      progress: 0,
      status: 'active'
    });
    res.status(201).json(goal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/goals/:id', authenticate, (req: any, res) => {
  try {
    const updated = dbInstance.updateGoal(req.userId, req.params.id, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/goals/:id', authenticate, (req: any, res) => {
  try {
    dbInstance.deleteGoal(req.userId, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// HABIT TRACKER ENDPOINTS
// ==========================================

app.get('/api/habits', authenticate, (req: any, res) => {
  try {
    const habits = dbInstance.getHabits(req.userId);
    res.json(habits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/habits', authenticate, (req: any, res) => {
  const { title, frequency } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }
  try {
    const habit = dbInstance.createHabit(req.userId, {
      title,
      frequency: frequency || 'daily'
    });
    res.status(201).json(habit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/habits/:id/complete', authenticate, (req: any, res) => {
  const { date } = req.body; // YYYY-MM-DD
  const dateStr = date || new Date().toISOString().split('T')[0];
  try {
    const habit = dbInstance.completeHabit(req.userId, req.params.id, dateStr);
    
    // Log analytical metric for habit completed
    const todayStr = new Date().toISOString().split('T')[0];
    dbInstance.logAnalytics(req.userId, {
      date: todayStr,
      completedCount: 0,
      missedCount: 0,
      focusMinutes: 15, // habit completion bonus focus duration
      habitConsistency: 100
    });

    res.json(habit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/habits/:id', authenticate, (req: any, res) => {
  try {
    dbInstance.deleteHabit(req.userId, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// CONTEXT AWARE PROACTIVE ALARMS ENDPOINT
// ==========================================

app.get('/api/reminders', authenticate, (req: any, res) => {
  try {
    const tasks = dbInstance.getTasks(req.userId).filter(t => t.status === 'pending');
    const reminders = dbInstance.getReminders(req.userId);

    // Build immediate reactive recommendations
    const warnings: string[] = [];
    tasks.forEach(task => {
      const msLeft = new Date(task.deadline).getTime() - Date.now();
      const hoursLeft = msLeft / (1000 * 60 * 60);

      if (hoursLeft > 0 && hoursLeft < 24) {
        warnings.push(`URGENT: "${task.title}" is due in ${hoursLeft.toFixed(1)} hours! You have estimated ${task.estimatedDuration} minutes of work. Clear out time now.`);
      } else if (hoursLeft < 0) {
        warnings.push(`OVERDUE: "${task.title}" was due ${Math.abs(hoursLeft).toFixed(0)} hours ago. Consider breaking this task down or rescheduling immediately.`);
      }
    });

    res.json({
      activeReminders: reminders,
      proactiveAdvice: warnings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// IN-APP NOTIFICATIONS ENDPOINTS
// ==========================================

app.get('/api/notifications', authenticate, (req: any, res) => {
  try {
    const list = dbInstance.getNotifications(req.userId);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/read', authenticate, (req: any, res) => {
  try {
    const { notifId } = req.body;
    if (notifId) {
      dbInstance.markNotificationAsRead(req.userId, notifId);
    } else {
      dbInstance.markAllNotificationsAsRead(req.userId);
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VOICE INTELLIGENT COMMAND INTERPRETER
// ==========================================

app.post('/api/voice/command', authenticate, async (req: any, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).json({ error: 'Command text is required.' });
  }

  try {
    const interpretation = await processVoiceCommand(command);

    // If add_task was requested, automate creation
    if (interpretation.action === 'add_task' && interpretation.parameters?.title) {
      const deadline = interpretation.parameters.deadline || new Date(Date.now() + 86400000).toISOString();
      const priorityResult = await analyzeTaskPriority(interpretation.parameters.title, '', deadline, 'Personal', 60);
      
      dbInstance.createTask(req.userId, {
        title: interpretation.parameters.title,
        description: 'Added via Voice Command Assist.',
        deadline,
        category: 'Personal',
        priority: priorityResult.priority,
        aiPriorityReason: priorityResult.reason,
        estimatedDuration: 60,
        recurring: 'none',
        status: 'pending',
        subtasks: []
      });

      dbInstance.createNotification(
        req.userId,
        'Voice Task Created',
        `Added "${interpretation.parameters.title}" via voice assistant.`,
        'success'
      );
    }

    // If complete_task was requested, automate updating task status
    if (interpretation.action === 'complete_task') {
      const searchTitle = (interpretation.parameters?.title || '').toLowerCase().trim();
      if (searchTitle) {
        const userTasks = dbInstance.getTasks(req.userId);
        // Find a pending task that matches the title
        const taskToComplete = userTasks.find(t => 
          t.status === 'pending' && 
          (t.title.toLowerCase().includes(searchTitle) || searchTitle.includes(t.title.toLowerCase()))
        );

        if (taskToComplete) {
          dbInstance.updateTask(req.userId, taskToComplete.id, { status: 'completed' });
          dbInstance.createNotification(
            req.userId,
            'Task Completed via Voice',
            `Marked "${taskToComplete.title}" as completed.`,
            'success'
          );
          interpretation.spokenAnswer = `Great job! I've marked "${taskToComplete.title}" as completed.`;
        } else {
          // Try to find any task matching the title if no pending one matches
          const anyTask = userTasks.find(t => 
            t.title.toLowerCase().includes(searchTitle) || searchTitle.includes(t.title.toLowerCase())
          );
          if (anyTask) {
            if (anyTask.status === 'completed') {
              interpretation.spokenAnswer = `"${anyTask.title}" is already completed!`;
            } else {
              dbInstance.updateTask(req.userId, anyTask.id, { status: 'completed' });
              dbInstance.createNotification(
                req.userId,
                'Task Completed via Voice',
                `Marked "${anyTask.title}" as completed.`,
                'success'
              );
              interpretation.spokenAnswer = `I've marked "${anyTask.title}" as completed.`;
            }
          } else {
            interpretation.spokenAnswer = `I couldn't find any pending task named "${interpretation.parameters?.title}" to complete.`;
          }
        }
      } else {
        interpretation.spokenAnswer = `Which task would you like me to complete? Try saying "complete task [task name]".`;
      }
    }

    res.json(interpretation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// VITE INTEGRATION & STATIC FILE SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
