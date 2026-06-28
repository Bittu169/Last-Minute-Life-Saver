import React from 'react';
import { motion } from 'motion/react';
import { Shield, Sparkles, Clock, Calendar, CheckSquare, Target, Zap, ChevronRight, Mic, BarChart2 } from 'lucide-react';

interface LandingPageProps {
  onStart: (view: 'login' | 'register') => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-900 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 rounded-xl shadow-lg shadow-rose-900/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LAST MINUTE
            </span>
            <span className="block text-xs font-mono font-medium tracking-widest text-rose-500 uppercase -mt-1">
              LIFE SAVER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onStart('login')}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            id="nav-login-btn"
          >
            Log In
          </button>
          <button
            onClick={() => onStart('register')}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-white text-slate-950 hover:bg-slate-100 shadow-md shadow-white/5 transition-all duration-200 cursor-pointer"
            id="nav-register-btn"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-12 md:py-24 z-10 max-w-7xl mx-auto text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl flex flex-col items-center"
        >
          {/* AI Banner Badge */}
          <motion.div
            variants={itemVariants}
            className="mb-6 px-4 py-1.5 rounded-full glass-panel border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-rose-500" />
            PROACTIVE AI DEADLINE ANTIDOTE
          </motion.div>

          {/* Hero Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Stop Reacting to Deadlines.<br />
            <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Intelligently Conquer Them.
            </span>
          </motion.h1>

          {/* Subheading description */}
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed font-sans"
          >
            Meet the active productivity companion. Last Minute Life Saver uses advanced Gemini AI to prioritize, plan, build hour-by-hour visual schedules, and escalate alarms so you never miss another critical milestone.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={() => onStart('register')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-base"
              id="hero-register-btn"
            >
              Unleash AI Companion
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onStart('login')}
              className="px-8 py-4 rounded-xl glass-panel text-slate-200 font-semibold border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50 transition-all duration-200 text-base"
              id="hero-login-btn"
            >
              Sign In to Dashboard
            </button>
          </motion.div>

          {/* Key Features Bento Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-12"
          >
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                AI Prioritization Score
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Gemini reviews complexity, workload, and hours-to-deadline, assigning detailed high/medium/low priority scores with transparent action reasons.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                Visual Hour-by-Hour Scheduler
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates optimal hour-by-hour schedules aligned with your personal high-energy hours and free blocks. Adjusts and regenerates dynamically.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">
                Autonomous Task Breakdown
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Large, daunting tasks are instantly split into realistic, timed subtask workflows, removing overwhelm and establishing instant momentum.
              </p>
            </div>
          </motion.div>

          {/* secondary details block */}
          <motion.div
            variants={itemVariants}
            className="mt-16 pt-10 border-t border-slate-900 w-full flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-slate-500 font-mono"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-rose-500" /> GEMINI POWERED</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-purple-500" /> VOICE COMPANION</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-indigo-500" /> INTUITIVE RECHARTS</span>
            </div>
            <div>
              <span>© {new Date().getFullYear()} LAST MINUTE LIFE SAVER. ALL RIGHTS RESERVED.</span>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
