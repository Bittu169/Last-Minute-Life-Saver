import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  LayoutDashboard,
  CheckSquare,
  Clock,
  Target,
  Calendar as CalendarIcon,
  BarChart2,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  X,
  AlertTriangle,
  User,
  Sparkles,
  Zap,
  Volume2
} from 'lucide-react';
import { api } from './lib/api';
import {
  User as UserType,
  Task,
  Goal,
  Habit,
  Reminder,
  Notification,
  ScheduleItem,
  InsightReport
} from './types';

// Components
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import Scheduler from './components/Scheduler';
import GoalsAndHabits from './components/GoalsAndHabits';
import CalendarView from './components/CalendarView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import VoiceAssistant from './components/VoiceAssistant';

export default function App() {
  const [sessionUser, setSessionUser] = useState<UserType | null>(null);
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  // App Tabs State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Core App Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [insights, setInsights] = useState<InsightReport | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [proactiveAdvice, setProactiveAdvice] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // UI Loaders
  const [initialLoading, setInitialLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await api.getMe();
          setSessionUser(user);
          setAuthView('landing'); // inside dashboard
        } catch (e) {
          console.error('Session auto-login failed', e);
          localStorage.removeItem('token');
        }
      }
      setInitialLoading(false);
    }
    checkAuth();
  }, []);

  // Sync data whenever user logs in
  useEffect(() => {
    if (sessionUser) {
      fetchAllData();
    }
  }, [sessionUser]);

  const fetchAllData = async () => {
    try {
      // Parallelize fetches for super fast container speed
      const [
        tasksData,
        goalsData,
        habitsData,
        remindersData,
        notifsData
      ] = await Promise.all([
        api.getTasks(),
        api.getGoals(),
        api.getHabits(),
        api.getReminders(),
        api.getNotifications()
      ]);

      setTasks(tasksData);
      setGoals(goalsData);
      setHabits(habitsData);
      setReminders(remindersData.activeReminders);
      setProactiveAdvice(remindersData.proactiveAdvice);
      setNotifications(notifsData);

      // Lazy loads for schedules and visual analytics
      fetchSchedule();
      fetchInsights();
    } catch (e) {
      console.error('Failed to sync database logs:', e);
    }
  };

  const fetchSchedule = async (regen: boolean = false) => {
    setScheduleLoading(true);
    try {
      const scheduleData = await api.getSchedule(regen);
      setSchedule(scheduleData);
    } catch (e) {
      console.error('Failed to fetch schedules:', e);
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const insightsData = await api.getInsights();
      setInsights(insightsData);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Auth Callbacks
  const handleAuthSuccess = (user: UserType) => {
    setSessionUser(user);
    setAuthView('landing');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setSessionUser(null);
    setAuthView('landing');
    setActiveTab('dashboard');
  };

  // Task Operations
  const handleCreateTask = async (taskData: any) => {
    try {
      await api.createTask(taskData);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await api.updateTask(taskId, updates);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleCompleteTaskDirectly = async (taskId: string) => {
    try {
      await api.updateTask(taskId, { status: 'completed' });
      await fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Goal Operations
  const handleCreateGoal = async (goalData: any) => {
    try {
      await api.createGoal(goalData);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleUpdateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await api.updateGoal(goalId, updates);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Habit Operations
  const handleCreateHabit = async (habitData: any) => {
    try {
      await api.createHabit(habitData);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleCompleteHabit = async (habitId: string, dateStr: string) => {
    try {
      await api.completeHabit(habitId, dateStr);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await api.deleteHabit(habitId);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Settings operations
  const handleUpdateProfile = async (updates: any) => {
    try {
      const updatedUser = await api.updateProfile(updates);
      setSessionUser(updatedUser);
      await fetchAllData();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Clear single / all notifications read
  const handleMarkNotificationsRead = async (notifId?: string) => {
    try {
      await api.markNotificationRead(notifId);
      const updated = await api.getNotifications();
      setNotifications(updated);
    } catch (e) {
      console.error(e);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 font-mono gap-3">
        <div className="p-3 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 rounded-2xl animate-spin shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <p className="text-xs">LAST MINUTE LIFE SAVER SECURE BOOTING...</p>
      </div>
    );
  }

  // Not Logged In View
  if (!sessionUser) {
    if (authView === 'landing') {
      return <LandingPage onStart={(view) => setAuthView(view)} />;
    } else {
      return (
        <AuthPage
          initialView={authView}
          onBack={() => setAuthView('landing')}
          onSuccess={handleAuthSuccess}
        />
      );
    }
  }

  // Logged In App Interface
  const sidebarItems = [
    { id: 'dashboard', label: 'Smart Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { id: 'tasks', label: 'Tasks Center', icon: <CheckSquare className="w-4.5 h-4.5" /> },
    { id: 'schedule', label: 'Daily Schedule', icon: <Clock className="w-4.5 h-4.5" /> },
    { id: 'goals', label: 'Habits & Goals', icon: <Target className="w-4.5 h-4.5" /> },
    { id: 'calendar', label: 'Calendar Grid', icon: <CalendarIcon className="w-4.5 h-4.5" /> },
    { id: 'analytics', label: 'Analytics Deep Dive', icon: <BarChart2 className="w-4.5 h-4.5" /> },
    { id: 'settings', label: 'Calibration Settings', icon: <SettingsIcon className="w-4.5 h-4.5" /> }
  ];

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* SIDEBAR - Desktop view */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900/40 border-r border-slate-900 backdrop-blur-xl z-20 shrink-0 h-screen sticky top-0 justify-between">
        <div className="flex flex-col flex-1">
          {/* Brand header */}
          <div className="px-6 py-5.5 flex items-center gap-3 border-b border-slate-900">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                LAST MINUTE
              </span>
              <span className="block text-[10px] font-mono font-medium tracking-widest text-rose-500 uppercase -mt-0.5">
                LIFE SAVER
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                  id={`side-nav-${item.id}`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User logout block */}
        <div className="p-4 border-t border-slate-900">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-xs font-black text-white uppercase shadow-inner">
                {sessionUser?.name[0] || 'U'}
              </div>
              <div className="max-w-[120px] truncate">
                <span className="block text-xs font-bold text-slate-200 leading-none truncate">{sessionUser?.name}</span>
                <span className="block text-[10px] font-mono text-slate-500 truncate mt-1">Calibrated</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/15 border border-transparent hover:border-rose-950/20 transition-all cursor-pointer"
            id="side-nav-logout"
          >
            <LogOut className="w-4.5 h-4.5" />
            Logout Companion
          </button>
        </div>
      </aside>

      {/* MOBILE MENU DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-900 z-50 flex flex-col justify-between"
          >
            <div>
              <div className="px-6 py-5.5 flex items-center justify-between border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-tr from-rose-500 to-indigo-600 rounded-xl">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-display font-extrabold text-xs tracking-tight text-white">LAST MINUTE</span>
                    <span className="block text-[8px] font-mono text-rose-500 uppercase">LIFE SAVER</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {sidebarItems.map((item) => {
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-900">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/15 transition-all"
              >
                <LogOut className="w-4.5 h-4.5" />
                Logout Companion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* HEADER / TOP NAVIGATION */}
        <header className="px-6 py-4.5 border-b border-slate-900 flex items-center justify-between sticky top-0 bg-slate-950/65 backdrop-blur-xl z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current Active Tab Breadcrumb title */}
            <div className="hidden sm:block">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-400">
                / {activeTab}
              </h2>
            </div>
          </div>

          {/* Right Header: Notifications and Profile badge */}
          <div className="flex items-center gap-3 relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/40 border border-slate-900 text-[10px] font-mono text-purple-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>GEMINI SHIELD ON</span>
            </div>

            {/* Notifications Alert Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer relative"
                id="header-notif-trigger-btn"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown card */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3.5 w-80 glass-panel border border-slate-800 rounded-xl shadow-2xl p-4 space-y-3 z-40 max-h-[360px] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">
                        Notifications ({unreadNotifications.length})
                      </span>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={() => handleMarkNotificationsRead()}
                          className="text-[10px] font-mono font-bold text-purple-400 hover:text-purple-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 font-sans py-6 text-center">
                          All systems normal. No active alerts.
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-lg border text-xs leading-relaxed font-sans flex items-start gap-2 relative group ${
                              notif.isRead 
                                ? 'bg-slate-950/20 border-slate-950/40 opacity-70' 
                                : 'bg-rose-500/5 border-rose-500/10'
                            }`}
                          >
                            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${notif.isRead ? 'text-slate-500' : 'text-rose-500'}`} />
                            <div className="flex-1">
                              <p className="font-semibold text-slate-200">{notif.title}</p>
                              <p className="text-slate-400 text-[10px] mt-0.5">{notif.message}</p>
                            </div>
                            {!notif.isRead && (
                              <button
                                onClick={() => handleMarkNotificationsRead(notif.id)}
                                className="absolute right-2 top-2 p-1 text-[10px] font-mono text-slate-500 hover:text-white"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ACTIVE MODULE VIEWPORT CONTAINER */}
        <main className="p-6 flex-1 max-w-7xl w-full mx-auto pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard
                  user={sessionUser}
                  tasks={tasks}
                  goals={goals}
                  habits={habits}
                  reminders={reminders}
                  proactiveAdvice={proactiveAdvice}
                  onCompleteTask={handleCompleteTaskDirectly}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'tasks' && (
                <TaskManager
                  tasks={tasks}
                  onCreateTask={handleCreateTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'schedule' && (
                <Scheduler
                  schedule={schedule}
                  loading={scheduleLoading}
                  onRegenerate={() => fetchSchedule(true)}
                  workingHours={{ start: sessionUser.workingHoursStart, end: sessionUser.workingHoursEnd }}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsAndHabits
                  goals={goals}
                  habits={habits}
                  onCreateGoal={handleCreateGoal}
                  onUpdateGoal={handleUpdateGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onCreateHabit={handleCreateHabit}
                  onCompleteHabit={handleCompleteHabit}
                  onDeleteHabit={handleDeleteHabit}
                />
              )}

              {activeTab === 'calendar' && (
                <CalendarView tasks={tasks} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsView insights={insights} loading={insightsLoading} />
              )}

              {activeTab === 'settings' && (
                <ProfileView
                  user={sessionUser}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* FLOAT-DOCK VOICE COMPANION ASSISTANT */}
      <VoiceAssistant
        onTaskCreated={fetchAllData}
        onRefreshSchedule={() => fetchSchedule(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
