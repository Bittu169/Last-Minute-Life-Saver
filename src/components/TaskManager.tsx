import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Trash2,
  Calendar,
  Layers,
  Folder,
  Zap,
  Tag,
  CheckCircle,
  Clock,
  Briefcase,
  User,
  Heart,
  DollarSign,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { Task, SubTask } from '../types';
import CustomDateTimePicker from './CustomDateTimePicker';

interface TaskManagerProps {
  tasks: Task[];
  onCreateTask: (taskData: any) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export default function TaskManager({
  tasks,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: TaskManagerProps) {
  // Filters & State
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New task form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState<'Work' | 'Study' | 'Personal' | 'Health' | 'Finance' | 'Urgent'>('Personal');
  const [estimatedDuration, setEstimatedDuration] = useState('60'); // in minutes
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Expanded task ID for subtask view
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const deadlineInputRef = useRef<HTMLInputElement>(null);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setQuickDeadline = (type: 'today' | 'tomorrow' | '3days' | '1week') => {
    const now = new Date();
    if (type === 'today') {
      now.setHours(18, 0, 0, 0);
    } else if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(9, 0, 0, 0);
    } else if (type === '3days') {
      now.setDate(now.getDate() + 3);
      now.setHours(9, 0, 0, 0);
    } else if (type === '1week') {
      now.setDate(now.getDate() + 7);
      now.setHours(9, 0, 0, 0);
    }
    setDeadline(formatDateTimeLocal(now));
  };

  const triggerDatePicker = () => {
    if (deadlineInputRef.current) {
      deadlineInputRef.current.focus();
      try {
        if (typeof (deadlineInputRef.current as any).showPicker === 'function') {
          (deadlineInputRef.current as any).showPicker();
        }
      } catch (e) {
        console.warn('showPicker not supported:', e);
      }
    }
  };

  const categories = ['Work', 'Study', 'Personal', 'Health', 'Finance', 'Urgent'];
  const priorities = ['High', 'Medium', 'Low'];

  const categoryIcons: Record<string, React.ReactNode> = {
    Work: <Briefcase className="w-4 h-4 text-indigo-400" />,
    Study: <Layers className="w-4 h-4 text-purple-400" />,
    Personal: <User className="w-4 h-4 text-slate-400" />,
    Health: <Heart className="w-4 h-4 text-rose-400" />,
    Finance: <DollarSign className="w-4 h-4 text-emerald-400" />,
    Urgent: <AlertCircle className="w-4 h-4 text-amber-400" />
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError('Task title is required.');
      return;
    }
    if (!deadline) {
      setFormError('Due date deadline is required.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateTask({
        title,
        description,
        deadline: new Date(deadline).toISOString(),
        category,
        estimatedDuration: parseInt(estimatedDuration, 10),
        recurring
      });
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setCategory('Personal');
      setEstimatedDuration('60');
      setRecurring('none');
      setShowAddForm(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to analyze and save task.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSubtask = async (task: Task, subtaskId: string) => {
    const updatedSubtasks: SubTask[] = task.subtasks.map(sub => {
      if (sub.id === subtaskId) {
        return { ...sub, status: (sub.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' };
      }
      return sub;
    });

    await onUpdateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleMarkTaskCompleted = async (task: Task) => {
    // Also mark all subtasks completed for cleaner workflow
    const updatedSubtasks = task.subtasks.map(sub => ({ ...sub, status: 'completed' as const }));
    await onUpdateTask(task.id, {
      status: 'completed',
      subtasks: updatedSubtasks
    });
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title Header with Add Task CTA */}
      <div className="flex justify-between items-center bg-slate-900/40 p-4.5 rounded-2xl border border-slate-900 shadow-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-extrabold text-white">
            Task Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Proactively monitor priorities, manage focus blocks, and tick subtasks.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:scale-[1.01] active:scale-[0.99] transition-all text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20"
          id="task-toggle-form-btn"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Slide / Fade Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleCreateTask}
              className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl"
            >
              <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                Configure New Task (AI Enhanced)
              </h2>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Complete Machine Learning Project"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                    id="new-task-title"
                  />
                </div>

                <div className="space-y-1">
                  <CustomDateTimePicker
                    label="Due Date Deadline"
                    value={deadline}
                    onChange={setDeadline}
                    type="datetime-local"
                    id="new-task-deadline"
                  />
                  
                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('today')}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      Today (6 PM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('tomorrow')}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      Tomorrow (9 AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('3days')}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      In 3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDeadline('1week')}
                      className="px-2 py-1 text-[10px] font-medium rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                    >
                      In 1 Week
                    </button>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Detailed Scope Description
                  </label>
                  <textarea
                    placeholder="Enter context. Large workloads automatically trigger an AI subtask breakdown planner."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                    id="new-task-desc"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Category Type
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                    id="new-task-cat"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="1440"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 font-mono"
                    id="new-task-duration"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Recurring Interval
                  </label>
                  <select
                    value={recurring}
                    onChange={(e: any) => setRecurring(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs text-slate-100"
                    id="new-task-recurring"
                  >
                    <option value="none">No Recurrence</option>
                    <option value="daily">Daily recurrence</option>
                    <option value="weekly">Weekly recurrence</option>
                    <option value="monthly">Monthly recurrence</option>
                  </select>
                </div>

                <div className="flex items-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 text-xs font-semibold text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-purple-600 rounded-xl shadow-lg shadow-rose-950/20 cursor-pointer disabled:opacity-50"
                    id="new-task-submit-btn"
                  >
                    {submitting ? 'Analyzing task details...' : 'Delegate & Prioritize'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search controls */}
      <div className="glass-panel p-4.5 rounded-2xl border border-slate-900 flex flex-wrap gap-4 items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 border-none w-full outline-none focus:ring-0"
            id="task-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="bg-slate-950/80 p-1 rounded-xl border border-slate-900 flex">
            {(['all', 'pending', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                id={`task-filter-status-${status}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-900 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-2 rounded-xl text-slate-300"
            id="task-filter-category"
          >
            <option value="all">ALL CATEGORIES</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.toUpperCase()}</option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-900 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-2 rounded-xl text-slate-300"
            id="task-filter-priority"
          >
            <option value="all">ALL PRIORITIES</option>
            {priorities.map(prio => (
              <option key={prio} value={prio}>{prio.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="glass-panel py-16 text-center rounded-2xl border border-slate-900 shadow-md">
            <Folder className="w-10 h-10 text-slate-700 mx-auto mb-3.5" />
            <p className="text-sm text-slate-500 font-sans">No tasks matched your filtered conditions.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const completedSubs = task.subtasks.filter(s => s.status === 'completed').length;
            const subtasksCount = task.subtasks.length;
            const progress = subtasksCount > 0 ? Math.round((completedSubs / subtasksCount) * 100) : 0;

            return (
              <div
                key={task.id}
                className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
                  task.status === 'completed'
                    ? 'border-emerald-950/20 opacity-75'
                    : 'border-slate-900 hover:border-slate-800'
                }`}
              >
                {/* Task Header info */}
                <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
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
                      <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-900">
                        {categoryIcons[task.category]}
                        {task.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-900 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {task.estimatedDuration}m
                      </span>
                      {task.recurring !== 'none' && (
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {task.recurring.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-bold text-white ${task.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-3xl">
                        {task.description}
                      </p>
                    )}

                    {/* Deadline warning countdown */}
                    <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: {new Date(task.deadline).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions right side */}
                  <div className="flex items-center gap-2.5 self-end md:self-auto">
                    {subtasksCount > 0 && (
                      <button
                        onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        Subtasks ({completedSubs}/{subtasksCount})
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleMarkTaskCompleted(task)}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-emerald-500/30 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer shadow-inner"
                        title="Mark Completed"
                        id={`task-check-btn-${task.id}`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer shadow-inner"
                      title="Delete task"
                      id={`task-delete-btn-${task.id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* AI priority explanation text block */}
                {task.aiPriorityReason && (
                  <div className="px-5 pb-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 flex items-start gap-2 text-xs text-slate-400 leading-relaxed font-sans">
                      <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-300 block mb-0.5">AI Prioritization rationale:</strong>
                        <span>{task.aiPriorityReason}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expand subtasks details */}
                <AnimatePresence>
                  {isExpanded && subtasksCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-900 bg-slate-950/30 px-5 py-4 space-y-3"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-slate-500 uppercase tracking-wide">
                          Task completion milestones
                        </span>
                        <span className="font-mono text-purple-400 font-semibold">{progress}%</span>
                      </div>

                      {/* Subtask progress bar */}
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Subtasks checklist */}
                      <div className="space-y-2 mt-3">
                        {task.subtasks.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => toggleSubtask(task, sub.id)}
                            className="p-3 rounded-xl bg-slate-900/30 hover:bg-slate-900/60 border border-slate-900/50 hover:border-slate-900 transition-all flex items-center justify-between gap-3 cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              {sub.status === 'completed' ? (
                                <CheckSquare className="w-4.5 h-4.5 text-emerald-500" />
                              ) : (
                                <Square className="w-4.5 h-4.5 text-slate-500" />
                              )}
                              <span className={`text-xs text-slate-200 ${sub.status === 'completed' ? 'line-through text-slate-500' : ''}`}>
                                {sub.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">
                              {sub.duration} mins
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
