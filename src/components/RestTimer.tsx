import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { Button } from './ui';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

export function RestTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Default 60s
  const [isActive, setIsActive] = useState(false);
  const [defaultTime, setDefaultTime] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or vibrate here if supported
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      new Notification("Tempo Esgotado!", { body: "Hora da próxima série!", icon: '/vite.svg' });
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(defaultTime);
  };

  const addTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds);
  };

  const startPreset = (seconds: number) => {
    setDefaultTime(seconds);
    setTimeLeft(seconds);
    setIsActive(true);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-24 right-4 z-40 bg-[#0A84FF] text-white p-4 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center"
        onClick={() => setIsOpen(true)}
      >
        <Timer size={24} />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40"
      >
        <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#1C1C22]/95 backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Descanso</h3>
              <div className="text-4xl font-mono font-bold text-white tabular-nums">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 h-2 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-[#0A84FF]"
              initial={{ width: "100%" }}
              animate={{ width: `${(timeLeft / defaultTime) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {[30, 45, 60, 90, 120].map(t => (
              <button
                key={t}
                onClick={() => startPreset(t)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  defaultTime === t ? "bg-white/10 text-white" : "bg-transparent text-gray-500 border border-white/5"
                )}
              >
                {t}s
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              className={cn("flex-1", isActive ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" : "bg-[#0A84FF] text-white")}
              onClick={toggleTimer}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? "Pausar" : "Iniciar"}
            </Button>
            <Button variant="secondary" onClick={resetTimer}>
              <RotateCcw size={18} />
            </Button>
            <Button variant="secondary" onClick={() => addTime(10)}>
              +10s
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
