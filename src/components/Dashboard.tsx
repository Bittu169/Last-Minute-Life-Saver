import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Flame,
  Target,
  ChevronRight,
  TrendingUp,
  Award,
  Bell,
  CheckSquare
} from 'lucide-react';
import { Task, Goal, Habit, Reminder } from '../types';

interface DashboardProps {
  user: any;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  reminders: Reminder[];
  proactiveAdvice: string[];
  onCompleteTask: (taskId: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({
  user,
  tasks,
  goals,
  habits,
  reminders,
  proactiveAdvice,
  onCompleteTask,
  onNavigateToTab
}: DashboardProps) {
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Overdue tasks
  const overdueTasks = pendingTasks.filter(t => new Date(t.deadline).getTime() < Date.now());
  const todayTasks = pendingTasks.filter(t => {
    const dDate = new Date(t.deadline).toDateString();
    const today = new Date().toDateString();
    return dDate === today;
  });

  // Productivity score calculation
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
  const streakBonus = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0) * 5;
  const productivityScore = Math.min(100, Math.max(10, completionRate + streakBonus));

  // Goal Progress average
  const avgGoalProgress = goals.length > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;

  // Active streaks count
  const activeStreak = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner / Alarm notification */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-slate-900/60 via-purple-950/20 to-slate-900/60 p-6 rounded-2xl border border-slate-900 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white">
            Hello, {user?.name || 'Jane Doe'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {overdueTasks.length > 0 
              ? `Heads up! You have ${overdueTasks.length} overdue tasks that need immediate AI evaluation.`
              : "Great job! All your high-priority projects are currently scheduled and on track."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToTab('schedule')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:border-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-2"
          >
            <Clock className="w-4 h-4 text-purple-400" />
            Check Smart Schedule
          </button>
          <button
            onClick={() => onNavigateToTab('tasks')}
            className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-xs font-semibold text-white shadow-lg shadow-rose-950/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
          >
            Create Urgent Task
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proactive Context-Aware Reminders Alert Drawer */}
      {(proactiveAdvice.length > 0 || reminders.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-3 shadow-lg shadow-rose-950/10"
        >
          <div className="flex items-center gap-2.5 border-b border-rose-500/15 pb-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
            <h3 className="text-sm font-display font-extrabold text-rose-400 tracking-wide uppercase">
              Proactive AI Escalation Warning
            </h3>
          </div>
          <ul className="space-y-2">
            {proactiveAdvice.map((advice, idx) => (
              <li key={idx} className="text-xs text-rose-200 leading-relaxed font-sans flex gap-2">
                <span className="text-rose-500 select-none">•</span>
                <span>{advice}</span>
              </li>
            ))}
            {reminders.map((rem, idx) => (
              <li key={rem.id} className="text-xs text-rose-300 leading-relaxed font-sans flex gap-2">
                <span className="text-rose-500 select-none">•</span>
                <span><strong>AI recommendation:</strong> {rem.message}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Productivity Score */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
              Productivity Rating
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-black text-white">{productivityScore}</span>
            <span className="text-xs font-mono font-medium text-slate-500">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${productivityScore}%` }}
            />
          </div>
        </div>

        {/* Pending Items count */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
              Milestones Left
            </span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-black text-white">{pendingTasks.length}</span>
            <span className="text-xs text-rose-400 font-mono font-semibold">
              {overdueTasks.length} OVERDUE
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-3">
            {completedTasks.length} completed this cycle. Keep going!
          </p>
        </div>

        {/* Habit Streak */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
              Peak Habit Streak
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-black text-amber-400">{activeStreak}</span>
            <span className="text-xs font-mono font-medium text-slate-500">DAYS ACTIVE</span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-3">
            Consistency level matches {activeStreak > 2 ? 'Excellent' : 'Routine'} threshold.
          </p>
        </div>

        {/* Average Goal progress */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
              Goal Progress
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-display font-black text-white">{avgGoalProgress}%</span>
            <span className="text-xs font-mono font-medium text-slate-500">AVERAGE</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${avgGoalProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Dashboard Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Urgent Pending Milestones Timeline */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-purple-400" />
              <h2 className="font-display font-extrabold text-base text-white">
                Urgent Priorities Timeline
              </h2>
            </div>
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-semibold"
              id="dash-view-all-tasks-btn"
            >
              Manage Tasks
            </button>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-500 font-sans">No pending tasks or deadlines.</p>
                <button
                  onClick={() => onNavigateToTab('tasks')}
                  className="mt-3 text-xs text-purple-400 hover:underline font-semibold"
                >
                  Create your first task now
                </button>
              </div>
            ) : (
              pendingTasks.slice(0, 4).map((task) => {
                const daysDiff = (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
                const isOverdue = daysDiff < 0;

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-all flex justify-between items-start gap-4 relative group"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {task.priority.toUpperCase()} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">
                          {task.category}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-semibold ${
                            isOverdue ? 'text-rose-400' : 'text-slate-400'
                          }`}
                        >
                          {isOverdue 
                            ? `Overdue by ${Math.abs(daysDiff).toFixed(1)}d` 
                            : `Due in ${daysDiff.toFixed(1)}d`}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-white leading-tight">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {task.aiPriorityReason && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-950/50 border border-slate-900/80 text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed font-sans">
                          <Zap className="w-3 h-3 text-purple-400 mt-0.5 shrink-0" />
                          <span>{task.aiPriorityReason}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer shadow-inner shrink-0"
                      title="Mark task completed"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Goal / Streak Tracker Progress */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-4 flex flex-col gap-4">
          <div className="border-b border-slate-900 pb-3">
            <h2 className="font-display font-extrabold text-base text-white">
              Goals Progress Tracker
            </h2>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-[380px]">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-slate-500 font-sans">No goals configured.</p>
                <button
                  onClick={() => onNavigateToTab('goals')}
                  className="mt-2 text-xs text-purple-400 hover:underline font-semibold"
                >
                  Configure habits & goals
                </button>
              </div>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{goal.title}</span>
                    <span className="font-mono text-purple-400">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-900 pt-3">
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                    HABITS TICKED
                  </span>
                  <span className="text-xs text-slate-300 font-semibold leading-none mt-1 block">
                    {habits.filter(h => h.streak > 0).length} active streaks running
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('goals')}
                className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
