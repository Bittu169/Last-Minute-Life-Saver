import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, AlertCircle, Play } from 'lucide-react';
import { api } from '../lib/api';

interface VoiceAssistantProps {
  onTaskCreated: () => void;
  onRefreshSchedule: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function VoiceAssistant({ onTaskCreated, onRefreshSchedule, activeTab, setActiveTab }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [commandText, setCommandText] = useState('');
  const [spokenResponse, setSpokenResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userTranscript, setUserTranscript] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  // Cleanup Speech Recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Failed to abort speech recognition on unmount:', e);
        }
      }
    };
  }, []);

  // Voice Wave Animation
  useEffect(() => {
    if (isListening && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let angle = 0;
      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();

        const sliceWidth = canvas.width / 100;
        for (let i = 0; i < 100; i++) {
          const x = i * sliceWidth;
          const amplitude = Math.sin(angle + i * 0.1) * Math.cos(angle * 0.5) * 15;
          const y = canvas.height / 2 + amplitude * (i < 20 || i > 80 ? 0.2 : 1);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        angle += 0.15;
        animationRef.current = requestAnimationFrame(draw);
      };
      draw();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isListening]);

  const speakText = (text: string) => {
    if (!soundEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis failed:', e);
    }
  };

  const lastClickRef = useRef<number>(0);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Please type your command.');
      return;
    }

    try {
      // Abort previous session if exists
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
        setCommandText(transcript);
        
        try {
          rec.stop();
        } catch (e) {}
        
        setIsListening(false);
        isListeningRef.current = false;

        handleSendCommand(transcript);
      };

      rec.onerror = (e: any) => {
        console.error('Speech Recognition error', e);
        if (e.error === 'not-allowed') {
          setError('Microphone access blocked. Please enable microphone permissions or type your command below.');
        } else if (e.error === 'no-speech') {
          setError('No speech detected. Please try speaking again.');
        } else if (e.error === 'aborted') {
          // Silent abort
        } else {
          setError('Could not understand clearly. Please try typing or speak again.');
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      setSpokenResponse(null);
      setUserTranscript(null);
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition. Please try typing your command.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    isListeningRef.current = false;
  };

  const toggleListening = () => {
    const nowTime = Date.now();
    if (nowTime - lastClickRef.current < 600) {
      console.warn('Voice command click ignored to prevent browser API collision');
      return;
    }
    lastClickRef.current = nowTime;

    // Active speech synthesis pre-unlock trigger for modern browsers
    try {
      const unlockUtterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(unlockUtterance);
    } catch (e) {}

    if (isListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendCommand = async (textToSend: string) => {
    const cmd = textToSend || commandText;
    if (!cmd.trim()) return;

    setUserTranscript(cmd);
    setLoading(true);
    setError(null);
    try {
      const response = await api.sendVoiceCommand(cmd);
      setSpokenResponse(response.spokenAnswer);
      speakText(response.spokenAnswer);

      // Trigger respective actions in the UI
      if (response.action === 'add_task') {
        onTaskCreated();
      } else if (response.action === 'show_tasks') {
        setActiveTab('tasks');
      } else if (response.action === 'show_schedule') {
        setActiveTab('schedule');
        onRefreshSchedule();
      } else if (response.action === 'complete_task') {
        onTaskCreated(); // refresh tasks list
      }

      setCommandText('');
    } catch (err: any) {
      setError('Could not process action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Voice Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-full bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 text-white shadow-xl shadow-rose-950/40 relative group cursor-pointer"
          id="floating-voice-btn"
        >
          <Mic className="w-6 h-6" />
          <span className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono font-semibold tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            AI VOICE ASSISTANT
          </span>
        </motion.button>
      </div>

      {/* Voice Assistant Overlay Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-24 right-6 w-96 glass-panel border border-slate-800 rounded-2xl shadow-2xl z-50 p-6 flex flex-col gap-4 overflow-hidden"
          >
            {/* Wave effect overlay behind */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="font-display font-bold text-sm tracking-wide text-white">
                  Intelligent Companion Voice
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={soundEnabled ? 'Mute Speech Output' : 'Unmute Speech Output'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Speaking Output */}
            <div className="bg-slate-950/60 rounded-xl p-4 min-h-[90px] flex flex-col justify-center border border-slate-900 relative">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-150" />
                  <span>Processing command...</span>
                </div>
              ) : (spokenResponse || userTranscript) ? (
                <div className="space-y-2">
                  {userTranscript && (
                    <div className="border-b border-slate-900 pb-1.5 mb-1.5">
                      <span className="block text-slate-500 text-[10px] font-mono font-medium tracking-wide uppercase">
                        YOU SAID:
                      </span>
                      <p className="text-xs text-slate-400 font-medium italic">
                        "{userTranscript}"
                      </p>
                    </div>
                  )}
                  {spokenResponse && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="block text-rose-500 text-[10px] font-mono font-medium tracking-wide uppercase">
                          COMPANION:
                        </span>
                        <button
                          onClick={() => speakText(spokenResponse)}
                          className="p-1 rounded hover:bg-slate-900 text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Repeat Speech"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-200 font-medium leading-relaxed">
                        {spokenResponse}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-slate-500 font-mono">
                    "Add ML Project tomorrow at 5 PM"<br />
                    "Show my schedule"<br />
                    "What's my productivity score?"
                  </p>
                </div>
              )}
            </div>

            {/* Visualizer & Listen Buttons */}
            <div className="flex flex-col items-center gap-2.5 my-2">
              {isListening ? (
                <div className="w-full h-12 flex items-center justify-center relative">
                  <canvas ref={canvasRef} width={280} height={48} className="w-full max-w-[280px]" />
                </div>
              ) : (
                <div className="h-4" />
              )}

              <button
                onClick={toggleListening}
                className={`p-5 rounded-full transition-all duration-300 shadow-lg cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-950/40'
                    : 'bg-slate-900 border border-slate-800 text-rose-500 hover:text-white hover:bg-rose-600 shadow-black/40'
                }`}
                id="voice-mic-trigger-btn"
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-400">
                {isListening ? 'LISTENING... TAP TO STOP' : 'TAP TO TALK'}
              </span>
            </div>

            {/* Text input fallback */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                Type Command Fallback
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Add personal gym routine"
                  value={commandText}
                  onChange={(e) => setCommandText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCommand('')}
                  className="flex-1 bg-slate-900/60 border border-slate-900 px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500"
                  id="voice-command-text"
                />
                <button
                  onClick={() => handleSendCommand('')}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                  id="voice-command-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
