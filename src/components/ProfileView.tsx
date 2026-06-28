import React, { useState } from 'react';
import { User, Clock, Shield, Sparkles, Download, CheckCircle, Save, Info, Key } from 'lucide-react';

interface ProfileViewProps {
  user: any;
  onUpdateProfile: (updates: any) => Promise<void>;
}

export default function ProfileView({ user, onUpdateProfile }: ProfileViewProps) {
  const [name, setName] = useState(user?.name || 'Jane Doe');
  const [workingHoursStart, setWorkingHoursStart] = useState(user?.workingHoursStart || '09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = useState(user?.workingHoursEnd || '17:00');
  const [activeHours, setActiveHours] = useState<string[]>(user?.activeHours || ['09:00', '10:00', '11:00', '14:00', '15:00']);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hourBlocks = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const handleToggleHour = (hour: string) => {
    if (activeHours.includes(hour)) {
      setActiveHours(activeHours.filter(h => h !== hour));
    } else {
      setActiveHours([...activeHours, hour]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await onUpdateProfile({
        name,
        workingHoursStart,
        workingHoursEnd,
        activeHours
      });
      setMessage('Profile settings saved successfully. Gemini algorithms updated!');
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage('Failed to update settings. Please check fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "LastMinuteLifeSaver_Export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Form - Left columns */}
      <div className="lg:col-span-8 space-y-6">
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-slate-900 space-y-5 shadow-lg relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl pointer-events-none" />

          <div className="border-b border-slate-900 pb-3">
            <h2 className="font-display font-extrabold text-base text-white">
              Profile & Proactive Algorithm Calibration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure parameters that guide Gemini's visual timelines, buffer allocations, and risk scores.
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-xl border text-xs ${
              message.includes('saved') 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Full Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm text-white"
                  id="profile-name"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Working Day Starts
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="time"
                  required
                  value={workingHoursStart}
                  onChange={(e) => setWorkingHoursStart(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm text-white font-mono"
                  id="profile-start-time"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Working Day Ends
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="time"
                  required
                  value={workingHoursEnd}
                  onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-sm text-white font-mono"
                  id="profile-end-time"
                />
              </div>
            </div>
          </div>

          {/* Peak energy selector */}
          <div className="space-y-2.5 pt-2">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Peak Cognitive Energy Blocks (Select 3-5 hours)
              </label>
              <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                Gemini automatically reserves priority code reviews, calculations, and complex writing tasks for these blocks.
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {hourBlocks.map((hour) => {
                const isSelected = activeHours.includes(hour);

                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleToggleHour(hour)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-tight border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border-purple-500/20 shadow-md'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hour}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-900 pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 hover:scale-[1.01] active:scale-[0.99] transition-all font-semibold rounded-xl text-xs text-white shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              id="profile-save-btn"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Parameters...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Account actions & Warn card - Right column */}
      <div className="lg:col-span-4 space-y-4">
        {/* Info card */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-3 shadow-md">
          <div className="flex items-center gap-2">
            <Info className="w-4.5 h-4.5 text-purple-400" />
            <span className="text-xs font-display font-extrabold text-white tracking-wider">Security & Platform</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Your credentials and keys are secured under standard sandboxing policies. Gemini API keys are never exposed browser-side.
          </p>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-900/60 flex items-start gap-2">
            <Key className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-[10px] text-slate-500 font-mono leading-relaxed">
              API key managed server-side.
            </span>
          </div>
        </div>

        {/* Export JSON backup action */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-900 space-y-3 shadow-md">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Data Sovereignty</span>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Download your comprehensive task database, goals logs, and weekly performance indices instantly.
          </p>
          <button
            onClick={handleExportData}
            className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-slate-300 hover:text-white hover:border-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="profile-export-btn"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export Backups (.json)
          </button>
        </div>
      </div>
    </div>
  );
}
