import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Check, X } from 'lucide-react';

interface CustomDateTimePickerProps {
  value: string; // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  type?: 'date' | 'datetime-local';
  label?: string;
  id?: string;
  className?: string;
}

export default function CustomDateTimePicker({
  value,
  onChange,
  type = 'datetime-local',
  label,
  id,
  className = '',
}: CustomDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial or current value to a Date object
  const getParsedDate = (valString: string): Date => {
    if (!valString) return new Date();
    const d = new Date(valString);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const initialDate = getParsedDate(value);
  const [viewDate, setViewDate] = useState<Date>(initialDate); // Controls the calendar month view
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  // Time components
  const [hour, setHour] = useState<number>(() => {
    const h = initialDate.getHours();
    return h === 0 ? 12 : h > 12 ? h - 12 : h;
  });
  const [minute, setMinute] = useState<number>(initialDate.getMinutes());
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initialDate.getHours() >= 12 ? 'PM' : 'AM');

  // Keep internal selectedDate in sync with external value prop updates
  useEffect(() => {
    const d = getParsedDate(value);
    setSelectedDate(d);
    
    // Also sync the hour/minute state
    const h = d.getHours();
    setHour(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setMinute(d.getMinutes());
    setAmpm(h >= 12 ? 'PM' : 'AM');
  }, [value]);

  // Click outside listener to close the popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper to format Date back to expected string representation
  const formatValue = (dateObj: Date, h12: number, min: number, meridiem: 'AM' | 'PM'): string => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');

    if (type === 'date') {
      return `${y}-${m}-${d}`;
    }

    // Convert 12 hour to 24 hour format
    let h24 = h12;
    if (meridiem === 'PM' && h12 < 12) h24 = h12 + 12;
    if (meridiem === 'AM' && h12 === 12) h24 = 0;

    const hourStr = String(h24).padStart(2, '0');
    const minStr = String(min).padStart(2, '0');

    return `${y}-${m}-${d}T${hourStr}:${minStr}`;
  };

  // Triggered when any picker element changes
  const updateValue = (newDate: Date, newHour: number, newMin: number, newAmpm: 'AM' | 'PM') => {
    setSelectedDate(newDate);
    const formatted = formatValue(newDate, newHour, newMin, newAmpm);
    onChange(formatted);
  };

  // Month navigation helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month buffer days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month buffer days to keep full 6-row grid
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const handleDaySelect = (dayDate: Date, e: React.MouseEvent) => {
    e.stopPropagation();
    updateValue(dayDate, hour, minute, ampm);
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setHour(val);
    updateValue(selectedDate, val, minute, ampm);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setMinute(val);
    updateValue(selectedDate, hour, val, ampm);
  };

  const handleAmpmChange = (meridiem: 'AM' | 'PM', e: React.MouseEvent) => {
    e.stopPropagation();
    setAmpm(meridiem);
    updateValue(selectedDate, hour, minute, meridiem);
  };

  // Pretty displays
  const getFormattedDisplay = () => {
    if (!value) {
      return type === 'date' ? 'Select date...' : 'Select date & time...';
    }
    const d = selectedDate;
    const dateStr = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    if (type === 'date') return dateStr;

    const minStr = String(minute).padStart(2, '0');
    return `${dateStr} @ ${hour}:${minStr} ${ampm}`;
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {label && (
        <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </span>
      )}
      
      {/* Clickable input-lookalike button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full bg-slate-950 border border-slate-900 px-3.5 py-2.5 rounded-xl text-xs cursor-pointer hover:border-slate-800 transition-colors focus-within:ring-1 focus-within:ring-purple-500 ${
          !value ? 'text-slate-500' : 'text-slate-100'
        }`}
        id={id}
      >
        <span className="font-mono">
          {getFormattedDisplay()}
        </span>
        <CalendarIcon className={`w-4 h-4 ml-2 transition-colors ${!value ? 'text-slate-500' : 'text-purple-400'}`} />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-72 md:w-80 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
          {/* Header Month / Year control */}
          <div className="flex justify-between items-center mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-slate-900 border border-slate-900/60 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-200">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-slate-900 border border-slate-900/60 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day} className="text-[10px] font-mono font-bold text-slate-500">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => {
              const isSelected = isSameDay(cell.date, selectedDate);
              const isToday = isSameDay(cell.date, new Date());
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => handleDaySelect(cell.date, e)}
                  className={`
                    h-8 text-xs font-mono rounded-lg transition-all flex items-center justify-center cursor-pointer
                    ${!cell.isCurrentMonth ? 'text-slate-600 hover:bg-slate-900/30' : 'text-slate-300'}
                    ${isSelected ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold' : 'hover:bg-slate-900'}
                    ${isToday && !isSelected ? 'border border-purple-500/50 text-purple-300 font-bold' : ''}
                  `}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Time Picker Controls */}
          {type === 'datetime-local' && (
            <div className="border-t border-slate-900 mt-4 pt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>Select Time</span>
                </div>
                <span className="text-[9px] text-slate-500">
                  {hour}:{String(minute).padStart(2, '0')} {ampm}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Hour Select */}
                <select
                  value={hour}
                  onChange={handleHourChange}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>

                <span className="text-slate-600">:</span>

                {/* Minute Select */}
                <select
                  value={minute}
                  onChange={handleMinuteChange}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-2 py-1 text-xs font-mono flex-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>

                {/* AM/PM toggle */}
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleAmpmChange('AM', e)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                      ampm === 'AM'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleAmpmChange('PM', e)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                      ampm === 'PM'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end gap-1.5 border-t border-slate-900 mt-3 pt-2.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!value) {
                  updateValue(selectedDate, hour, minute, ampm);
                }
                setIsOpen(false);
              }}
              className="px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-[10px] font-bold text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
