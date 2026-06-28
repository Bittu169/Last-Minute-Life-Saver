import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart2, TrendingUp, Zap, Sparkles, Award, Star } from 'lucide-react';
import { InsightReport } from '../types';

interface AnalyticsViewProps {
  insights: InsightReport | null;
  loading: boolean;
}

export default function AnalyticsView({ insights, loading }: AnalyticsViewProps) {
  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <BarChart2 className="w-10 h-10 text-purple-500 animate-pulse mx-auto" />
        <p className="text-sm text-slate-400 font-mono">Consolidating weekly logs & calculating peak focal metrics...</p>
      </div>
    );
  }

  const reports = insights?.weeklyLogs || [];
  const details = insights?.insights || {
    bestTime: 'Morning (8 AM - 11 AM)',
    efficiencyRate: 85,
    focusRecommendation: 'Schedule heavy mathematical, code drafting, or intense logic problems during peak active blocks.',
    habitsAdvice: 'Stick to completing habits early in the morning before urgent tasks overflow your focus buffers.'
  };

  // Convert logs into chart-friendly formats
  const chartData = reports.map((rep) => ({
    name: rep.date.split('-').slice(1).join('/'), // MM/DD
    Completed: rep.completedCount,
    Missed: rep.missedCount,
    Minutes: rep.focusMinutes,
    Consistency: rep.habitConsistency
  }));

  return (
    <div className="space-y-6">
      {/* Dynamic AI Insights Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 via-purple-950/20 to-slate-900/60 border border-slate-900 flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-extrabold text-base text-white">
              Gemini Productivity Evaluation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 text-xs text-slate-400 leading-relaxed">
              <span className="font-mono font-bold text-indigo-400 block mb-1">PEAK FOCUS BLOCK</span>
              <p className="text-slate-200 font-semibold">{details.bestTime}</p>
              <p className="mt-1.5 text-[10px]">{details.focusRecommendation}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 text-xs text-slate-400 leading-relaxed">
              <span className="font-mono font-bold text-amber-400 block mb-1">HABIT HABITUATION</span>
              <p className="text-slate-200 font-semibold">Consistency Score: {details.efficiencyRate}%</p>
              <p className="mt-1.5 text-[10px]">{details.habitsAdvice}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/80 border border-slate-900 rounded-xl min-w-[140px] shrink-0 text-center">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Focus Index</span>
          <div className="text-3xl font-display font-black text-purple-400">{details.efficiencyRate}</div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
            OPTIMIZED
          </span>
        </div>
      </div>

      {/* Recharts Graphical grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Completion Bar chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="font-display font-bold text-white text-sm">Completed vs. Overdue Milestones</h3>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Completed" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} name="Completed on Time" />
                <Bar dataKey="Missed" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} name="Overdue / Missed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Habits Consistency split card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-display font-bold text-white text-sm">Habit Loop Consistency</h3>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConsistency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Consistency" stroke="#f59e0b" fillOpacity={1} fill="url(#colorConsistency)" name="Routine Consistency" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Focus block Minutes trend line */}
        <div className="lg:col-span-12 glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-bold text-white text-sm">Daily Focal Block Effort (Minutes)</h3>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="Minutes" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Focus Duration" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
