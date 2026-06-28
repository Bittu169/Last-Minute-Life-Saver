import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Sparkles,
  Coffee,
  Shield,
  Layers,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle,
  Play
} from 'lucide-react';
import { ScheduleItem } from '../types';

interface SchedulerProps {
  schedule: ScheduleItem[];
  loading: boolean;
  onRegenerate: () => Promise<void>;
  workingHours: { start: string; end: string };
}

export default function Scheduler({
  schedule,
  loading,
  onRegenerate,
  workingHours
}: SchedulerProps) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setSuccessMsg(null);
    try {
      await onRegenerate();
      setSuccessMsg('AI generated a new optimal daily schedule successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const slotColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    work: {
      bg: 'bg-indigo-500/10 hover:bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
      label: 'Focus Block'
    },
    personal: {
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
      label: 'Personal Duty'
    },
    buffer: {
      bg: 'bg-amber-500/10 hover:bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/20',
      label: 'Admin / Email / Buffer'
    },
    break: {
      bg: 'bg-rose-500/10 hover:bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
      label: 'Recharge Break'
    }
  };

  const slotIcons: Record<string, React.ReactNode> = {
    work: <Layers className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />,
    personal: <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />,
    buffer: <Shield className="w-4.5 h-4.5 text-amber-400" />,
    break: <Coffee className="w-4.5 h-4.5 text-rose-400" />
  };

  return (
    <div className="space-y-6">
      {/* Title block with control */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-900 shadow-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-extrabold text-white">
            Daily Scheduling Assistant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hour-by-hour dynamic agenda calibrated with your active peak hours ({workingHours.start} - {workingHours.end}).
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-rose-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 shrink-0"
          id="scheduler-regen-btn"
        >
          <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Consulting Gemini...' : 'Regenerate Daily Schedule'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          {successMsg}
        </div>
      )}

      {/* Main Schedule Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-900 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-purple-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-400 font-mono">
              AI companion is mapping your day, sorting priority deadlines, and scheduling breaks...
            </p>
          </div>
        ) : schedule.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Calendar className="w-12 h-12 text-slate-700 mx-auto" />
            <p className="text-sm text-slate-500 font-sans">
              No tasks scheduled. Add tasks first or set up your active profile settings.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline connector */}
            <div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-slate-900" />

            <div className="space-y-5">
              {schedule.map((item, idx) => {
                const colors = slotColors[item.type] || slotColors.work;
                const icon = slotIcons[item.type] || slotIcons.work;

                return (
                  <div key={idx} className="flex gap-4 relative group">
                    {/* Time indicator circle */}
                    <div className="w-11 h-11 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 z-10 transition-colors group-hover:border-purple-500">
                      <Clock className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    </div>

                    {/* Schedule block details */}
                    <div className={`flex-1 p-4 rounded-xl border ${colors.bg} ${colors.border} transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-white tracking-tight">
                            {item.time}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">•</span>
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${colors.text}`}>
                            {colors.label}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white leading-tight">
                          {item.taskTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-950/80 border border-slate-900 px-2.5 py-1 rounded-md">
                          {item.duration} mins
                        </span>
                        <div className="p-2 bg-slate-950 border border-slate-900 rounded-xl">
                          {icon}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Proactive context advice footer */}
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          <strong>Proactive Tip:</strong> Gemini schedules your heaviest tasks during your self-proclaimed peak performance windows. Update your <strong>Profile & working hours</strong> in Settings to customize optimization algorithms!
        </p>
      </div>
    </div>
  );
}
