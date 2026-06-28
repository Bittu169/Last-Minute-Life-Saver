import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle, Clock, Sparkles, CheckSquare } from 'lucide-react';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSynced, setIsSynced] = useState(false);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // Next month buffer days to keep full grids
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Check if dates match YYYY-MM-DD
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Get tasks scheduled for a date
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(new Date(task.deadline), date));
  };

  const selectedDateTasks = getTasksForDate(selectedDate);

  const handleGoogleSync = () => {
    setIsSynced(!isSynced);
    alert(
      isSynced
        ? 'Google Calendar Link has been disconnected.'
        : 'Successfully authenticated with simulated Google Calendar. Real-time bi-directional sync enabled!'
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Calendar Grid - Left side */}
      <div className="lg:col-span-8 space-y-4">
        {/* Navigation Bar */}
        <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-900">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display font-bold text-slate-100 text-sm">
              {monthNames[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-900 text-slate-400 hover:text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Monthly Grid */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-900 space-y-2">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center py-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <span key={day} className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {day}
              </span>
            ))}
          </div>

          {/* Days Cell Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.date);
              const isSelected = isSameDay(cell.date, selectedDate);
              const isToday = isSameDay(cell.date, new Date());

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[70px] p-1.5 rounded-xl border flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'opacity-30 border-transparent bg-transparent'
                      : isSelected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-900 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-900/10'
                  }`}
                >
                  {/* Number Label */}
                  <span
                    className={`text-xs font-mono font-semibold ${
                      isToday
                        ? 'text-rose-400 bg-rose-500/15 border border-rose-500/25 px-1.5 py-0.5 rounded-md w-fit leading-none'
                        : isSelected
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.date.getDate()}
                  </span>

                  {/* Task Count indicators */}
                  {dayTasks.length > 0 && (
                    <div className="flex gap-1 overflow-x-hidden mt-1.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            task.priority === 'High'
                              ? 'bg-rose-500 shadow-sm shadow-rose-950'
                              : task.priority === 'Medium'
                              ? 'bg-amber-500 shadow-sm shadow-amber-950'
                              : 'bg-emerald-500 shadow-sm shadow-emerald-950'
                          }`}
                          title={task.title}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[7px] font-mono font-bold text-slate-500">+{dayTasks.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Agenda details - Right side */}
      <div className="lg:col-span-4 space-y-4">
        {/* Google Link Simulator card */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-slate-900 flex flex-col gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-display font-extrabold text-white tracking-wide">
              Calendar Integrations
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            Connect your primary Google Calendar account. Gemini automatically schedules around existing external appointments.
          </p>
          <button
            onClick={handleGoogleSync}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              isSynced
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950 border border-slate-900 text-slate-300 hover:text-white hover:border-slate-800'
            }`}
            id="google-cal-sync-btn"
          >
            {isSynced ? 'Disconnect Google Cal' : 'Simulate Google Sync'}
          </button>
        </div>

        {/* Selected Date Tasks List */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 flex flex-col gap-3 min-h-[300px]">
          <div className="border-b border-slate-900 pb-2.5">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
              Agenda details
            </span>
            <span className="text-xs font-display font-extrabold text-slate-200 mt-0.5 block">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {selectedDateTasks.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-xs text-slate-500 font-sans">No deadlines scheduled.</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 flex items-start gap-2.5 relative"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                      task.priority === 'High' ? 'bg-rose-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{task.title}</h4>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mt-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{task.category}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
