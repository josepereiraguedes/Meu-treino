import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Clock, Play, Pause, RotateCcw, ChevronRight, Dumbbell } from 'lucide-react';
import { Workout, Exercise } from '../types';
import { Button, Card, Input } from './ui';
import { useApp } from '../context';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

interface ActiveWorkoutOverlayProps {
  workout: Workout;
  onClose: () => void;
}

export function ActiveWorkoutOverlay({ workout, onClose }: ActiveWorkoutOverlayProps) {
  const { toggleWorkoutCompletion } = useApp();
  const { addToast } = useToast();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [restTimer, setRestTimer] = useState<{ active: boolean; time: number; total: number } | null>(null);

  // Initialize completed sets state
  useEffect(() => {
    const initialSets: Record<string, boolean[]> = {};
    workout.exercises.forEach(ex => {
      initialSets[ex.id] = new Array(ex.sets).fill(false);
    });
    setCompletedSets(initialSets);
  }, [workout]);

  // Workout Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Rest Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restTimer?.active && restTimer.time > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev ? { ...prev, time: prev.time - 1 } : null);
      }, 1000);
    } else if (restTimer?.active && restTimer.time === 0) {
      setRestTimer(null);
      // Play sound or vibrate
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      new Audio('/notification.mp3').play().catch(() => {}); // Fallback if file exists, otherwise silent
      addToast("Descanso finalizado! Próxima série.", "info");
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    setCompletedSets(prev => {
      const currentSets = prev[exerciseId] ? [...prev[exerciseId]] : [];
      const newStatus = !currentSets[setIndex];
      currentSets[setIndex] = newStatus;
      
      // Start rest timer if checking (not unchecking) and not the last set
      if (newStatus && setIndex < currentSets.length - 1) {
        // We need to call startRest, but we can't do it directly inside the state updater if we want to be pure.
        // However, since startRest just sets state, it's technically okay in React 18 batching, 
        // but let's use a timeout to be safe and break out of the render phase.
        setTimeout(() => startRest(60), 0);
      }
      
      return {
        ...prev,
        [exerciseId]: currentSets
      };
    });
  };

  const startRest = (seconds: number) => {
    setRestTimer({ active: true, time: seconds, total: seconds });
  };

  const cancelRest = () => {
    setRestTimer(null);
  };

  const finishWorkout = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    toggleWorkoutCompletion(workout.id, today);
    addToast("Treino concluído! Parabéns! 🎉", "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F0F14] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1C1C22]">
        <div>
          <h2 className="font-bold text-lg">{workout.name}</h2>
          <div className="flex items-center gap-2 text-sm text-blue-400 font-mono">
            <Clock size={14} />
            {formatTime(elapsedTime)}
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {workout.exercises.map((ex, i) => (
          <Card key={ex.id} className="border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="text-gray-500 text-sm font-mono">#{i + 1}</span>
                {ex.name}
              </h3>
              {ex.videoUrl && (
                <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs flex items-center gap-1">
                  Ver vídeo <ChevronRight size={12} />
                </a>
              )}
            </div>

            {ex.instructions && (
              <p className="text-xs text-gray-400 mb-4 bg-black/20 p-2 rounded-lg border-l-2 border-gray-600">
                {ex.instructions}
              </p>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs text-gray-500 text-center mb-1 px-2">
                <div>SET</div>
                <div>KG</div>
                <div>REPS</div>
                <div>OK</div>
              </div>
              
              {Array.from({ length: ex.sets }).map((_, setIndex) => {
                const isCompleted = completedSets[ex.id]?.[setIndex];
                return (
                  <div 
                    key={setIndex} 
                    className={`grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center p-2 rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-500/10' : 'bg-white/5'
                    }`}
                  >
                    <div className="text-center font-mono text-gray-400">{setIndex + 1}</div>
                    <div className="text-center font-bold">{ex.weight}</div>
                    <div className="text-center font-bold">{ex.reps}</div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => toggleSet(ex.id, setIndex)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isCompleted 
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/20 scale-105' 
                            : 'bg-white/10 text-gray-500 hover:bg-white/20'
                        }`}
                      >
                        {isCompleted && <Check size={16} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {restTimer && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-24 left-4 right-4 bg-[#1C1C22] border border-blue-500/30 p-4 rounded-2xl shadow-2xl flex items-center justify-between z-10"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="24" cy="24" r="20" className="stroke-white/10" strokeWidth="4" fill="none" />
                  <motion.circle 
                    cx="24" cy="24" r="20" 
                    className="stroke-blue-500" 
                    strokeWidth="4" 
                    fill="none"
                    strokeDasharray={125}
                    strokeDashoffset={125 - (125 * restTimer.time) / restTimer.total}
                  />
                </svg>
                <span className="text-sm font-bold font-mono">{restTimer.time}s</span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">Descanso</div>
                <div className="text-xs text-gray-400">Respire fundo...</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => startRest(restTimer.time + 10)}>+10s</Button>
              <Button size="sm" variant="danger" onClick={cancelRest}>Pular</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10 bg-[#1C1C22] pb-8">
        <Button className="w-full py-6 text-lg font-bold shadow-lg shadow-blue-500/20" onClick={finishWorkout}>
          <Check size={24} className="mr-2" /> Finalizar Treino
        </Button>
      </div>
    </div>
  );
}
