import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Target,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Award,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Goal, Habit } from '../types';
import CustomDateTimePicker from './CustomDateTimePicker';

interface GoalsAndHabitsProps {
  goals: Goal[];
  habits: Habit[];
  onCreateGoal: (goal: any) => Promise<void>;
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onCreateHabit: (habit: any) => Promise<void>;
  onCompleteHabit: (habitId: string, dateStr: string) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
}

export default function GoalsAndHabits({
  goals,
  habits,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onCreateHabit,
  onCompleteHabit,
  onDeleteHabit
}: GoalsAndHabitsProps) {
  // Goals form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');

  // Habits form state
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!goalTitle.trim() || !goalTargetDate) {
      setError('Goal title and target date are required.');
      return;
    }

    setLoading(true);
    try {
      await onCreateGoal({
        title: goalTitle,
        description: goalDesc,
        targetDate: new Date(goalTargetDate).toISOString()
      });
      setGoalTitle('');
      setGoalDesc('');
      setGoalTargetDate('');
      setShowGoalForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!habitTitle.trim()) {
      setError('Habit title is required.');
      return;
    }

    setLoading(true);
    try {
      await onCreateHabit({
        title: habitTitle,
        frequency: habitFrequency
      });
      setHabitTitle('');
      setHabitFrequency('daily');
      setShowHabitForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create habit');
    } finally {
      setLoading(false);
    }
  };

  const handleProgressSlider = async (goalId: string, progressValue: number) => {
    let status: 'active' | 'achieved' | 'missed' = 'active';
    if (progressValue >= 100) status = 'achieved';
    await onUpdateGoal(goalId, { progress: progressValue, status });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT COLUMN: Habit Tracker */}
      <div className="lg:col-span-6 space-y-6">
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="font-display font-extrabold text-base text-white">Daily Habit Loop</h2>
          </div>
          <button
            onClick={() => setShowHabitForm(!showHabitForm)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            id="habit-add-trigger"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Create Habit form */}
        <AnimatePresence>
          {showHabitForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateHabit}
              className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 overflow-hidden"
            >
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Configure New Routine Habit
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Habit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Study 3 hours daily"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2.5 rounded-xl text-xs text-white"
                  id="new-habit-title"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Frequency</label>
                <select
                  value={habitFrequency}
                  onChange={(e: any) => setHabitFrequency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2.5 rounded-xl text-xs text-white"
                  id="new-habit-freq"
                >
                  <option value="daily">Daily Loop</option>
                  <option value="weekly">Weekly Routine</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowHabitForm(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl shadow-lg cursor-pointer"
                  id="new-habit-submit"
                >
                  Create Habit
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Habits Checklist */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-slate-900">
              <Sparkles className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-sans">No daily habits registered yet.</p>
            </div>
          ) : (
            habits.map((habit) => {
              const todayStr = new Date().toISOString().split('T')[0];
              const isCompletedToday = habit.history.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  className="p-4 rounded-xl bg-slate-900/35 border border-slate-900/60 flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                      {habit.frequency} LOOP
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {habit.title}
                    </h4>

                    {/* Streaks visualizer */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Flame className={`w-4 h-4 ${habit.streak > 0 ? 'text-amber-500 fill-amber-500/20 animate-pulse' : 'text-slate-500'}`} />
                      <span className="font-mono font-bold">{habit.streak} days streak</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCompleteHabit(habit.id, todayStr)}
                      disabled={isCompletedToday}
                      className={`px-4.5 py-2.5 rounded-xl text-xs font-bold font-display cursor-pointer transition-all ${
                        isCompletedToday
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 pointer-events-none'
                          : 'bg-slate-950 border border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                      }`}
                      id={`habit-tick-btn-${habit.id}`}
                    >
                      {isCompletedToday ? 'Completed' : 'Tick Today'}
                    </button>

                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Long-term Goals Progress */}
      <div className="lg:col-span-6 space-y-6">
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-extrabold text-base text-white">Focus Goals</h2>
          </div>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            id="goal-add-trigger"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Create Goal form */}
        <AnimatePresence>
          {showGoalForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateGoal}
              className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 overflow-hidden"
            >
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                Configure Focus Goal
              </h3>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Machine Learning Foundation"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2.5 rounded-xl text-xs text-white"
                  id="new-goal-title"
                />
              </div>
              <div className="space-y-1">
                <CustomDateTimePicker
                  label="Target Date"
                  value={goalTargetDate}
                  onChange={setGoalTargetDate}
                  type="date"
                  id="new-goal-date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase">Goal Details</label>
                <textarea
                  placeholder="Describe desired outcomes..."
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-900 px-3 py-2.5 rounded-xl text-xs text-white"
                  id="new-goal-desc"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-tr from-rose-500 to-purple-600 rounded-xl shadow-lg cursor-pointer"
                  id="new-goal-submit"
                >
                  Commit Goal
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Goals Progress sliders */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="glass-panel p-10 text-center rounded-2xl border border-slate-900">
              <Award className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-sans">No focus goals configured yet.</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="p-4 rounded-xl bg-slate-900/35 border border-slate-900/60 space-y-3 relative overflow-hidden group">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white leading-tight">{goal.title}</h4>
                    {goal.description && (
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{goal.description}</p>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 block pt-1">
                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/15 text-slate-500 hover:text-rose-400 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar and control */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wide">Progress Level</span>
                    <span className="font-mono text-purple-400 font-bold">{goal.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) => handleProgressSlider(goal.id, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-950 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
