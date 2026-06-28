import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, User, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

interface AuthPageProps {
  initialView: 'login' | 'register';
  onBack: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthPage({ initialView, onBack, onSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(initialView === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else {
        if (!name.trim()) throw new Error('Name is required');
        const res = await api.register(name, email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // Direct Google Auth Simulator using the User's AI Studio email if metadata matches or a beautiful standard profile
      const testEmail = 'mondalbittu169@gmail.com';
      const testName = 'Bittu Mondal';
      
      const res = await api.googleSignIn(testName, testEmail);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Google Auth simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden">
      {/* Back to Home Action */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 z-10 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-rose-950/40 mb-3">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display font-black text-2xl tracking-tight text-white uppercase">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans text-center">
            {isLogin
              ? 'Your intelligent proactive companion is waiting.'
              : 'Sign up to configure your smart prioritizer and visual scheduler.'}
          </p>
        </div>

        {/* Auth Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative"
        >
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1.5"
                >
                  <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-white placeholder-slate-500 transition-colors duration-200 focus:border-purple-500"
                      id="auth-name-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-white placeholder-slate-500 transition-colors duration-200 focus:border-purple-500"
                  id="auth-email-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => alert('Forgot password? Please use the easy simulated Sign In With Google.')}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    id="auth-forgot-btn"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-sm text-white placeholder-slate-500 transition-colors duration-200 focus:border-purple-500"
                  id="auth-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 font-semibold text-white shadow-md shadow-rose-950/20 text-sm cursor-pointer disabled:opacity-50"
              id="auth-submit-btn"
            >
              {loading ? 'Authenticating...' : isLogin ? 'Access Dashboard' : 'Create Account'}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-900" />
            </div>
            <span className="relative px-3 text-xs font-mono text-slate-500 bg-slate-950/20 uppercase tracking-widest">
              Or Connect
            </span>
          </div>

          {/* Simulated Google Button */}
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-center gap-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-all duration-200 cursor-pointer"
            id="auth-google-btn"
          >
            <Sparkles className="w-4.5 h-4.5 text-rose-400 animate-pulse" />
            Sign In with Google
          </button>

          {/* Toggle Screen Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-400 hover:text-white font-medium"
              id="auth-toggle-btn"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
