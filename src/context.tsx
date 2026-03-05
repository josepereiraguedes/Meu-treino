import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, Workout, Meal, UserSettings, DailyLog, Exercise, ExerciseLog, Achievement, Alarm } from './types';
import { generateId } from './utils';
import { calculateWaterGoal } from './utils/calculations';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'focusfit_data_v1';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Atleta',
  notificationsEnabled: true,
  theme: 'dark',
  waterGoal: 2500,
  weightGoal: 70,
  currentWeight: 75,
  height: 175,
  age: 30,
  gender: 'male',
  activityLevel: 'moderate',
  macroGoals: {
    protein: 150,
    carbs: 200,
    fats: 60
  },
  xp: 0,
  level: 1
};

const INITIAL_STATE: AppState = {
  workouts: [],
  meals: [
    { 
      id: '1', 
      name: 'Café da Manhã', 
      time: '08:00', 
      description: 'Ovos e Aveia', 
      calories: 400, 
      protein: 30,
      carbs: 40,
      fats: 15,
      completedDates: [] 
    },
    { 
      id: '2', 
      name: 'Almoço', 
      time: '13:00', 
      description: 'Frango e Batata Doce', 
      calories: 600, 
      protein: 50,
      carbs: 60,
      fats: 10,
      completedDates: [] 
    },
    { 
      id: '3', 
      name: 'Jantar', 
      time: '20:00', 
      description: 'Peixe e Salada', 
      calories: 500, 
      protein: 40,
      carbs: 20,
      fats: 20,
      completedDates: [] 
    },
  ],
  settings: DEFAULT_SETTINGS,
  logs: {},
  exerciseLogs: [],
  achievements: [
    {
      id: 'first_workout',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro treino.',
      icon: 'Trophy',
      condition: (state) => state.workouts.some(w => w.completedDates.length > 0)
    },
    {
      id: 'water_master',
      title: 'Hidratado',
      description: 'Beba a meta de água por 3 dias seguidos.',
      icon: 'Droplets',
      condition: (state) => {
        const dates = Object.keys(state.logs).sort();
        if (dates.length < 3) return false;
        let streak = 0;
        for (let i = 0; i < dates.length; i++) {
          const log = state.logs[dates[i]];
          if (log.waterIntake >= state.settings.waterGoal) {
            streak++;
            if (streak >= 3) return true;
          } else {
            streak = 0;
          }
        }
        return false;
      }
    },
    {
      id: 'strength_builder',
      title: 'Forte como um Touro',
      description: 'Complete 10 treinos no total.',
      icon: 'Dumbbell',
      condition: (state) => {
        const totalCompleted = state.workouts.reduce((acc, w) => acc + w.completedDates.length, 0);
        return totalCompleted >= 10;
      }
    }
  ],
  alarms: []
};

interface AppContextType extends AppState {
  addWorkout: (workout: Omit<Workout, 'id' | 'completedDates'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  toggleWorkoutCompletion: (id: string, date: string) => void;
  
  addMeal: (meal: Omit<Meal, 'id' | 'completedDates'>) => void;
  updateMeal: (id: string, meal: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  toggleMealCompletion: (id: string, date: string) => void;
  
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  logWater: (date: string, amount: number) => void;
  logWeight: (date: string, weight: number) => void;
  
  setRoutine: (workouts: Workout[], meals: Meal[]) => void;

  resetData: () => void;

  // Alarms
  addAlarm: (alarm: Omit<Alarm, 'id'>) => void;
  updateAlarm: (id: string, alarm: Partial<Alarm>) => void;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  ringingAlarm: Alarm | null;
  stopAlarm: () => void;
  addXp: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Merge stored state with initial structure to ensure new fields exist
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...INITIAL_STATE,
        ...parsed,
        // Ensure achievements are merged correctly (keep definitions, update status)
        achievements: INITIAL_STATE.achievements.map(a => {
            const storedAchievement = parsed.achievements?.find((sa: Achievement) => sa.id === a.id);
            return storedAchievement ? { ...a, unlockedAt: storedAchievement.unlockedAt } : a;
        }),
        // Ensure new fields exist if they were missing in old data
        exerciseLogs: parsed.exerciseLogs || [],
        alarms: parsed.alarms || [],
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
      };
    }
    return INITIAL_STATE;
  });

  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const lastTriggeredRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
    
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Check Achievements
  useEffect(() => {
    let changed = false;
    const newAchievements = state.achievements.map(achievement => {
      if (!achievement.unlockedAt && achievement.condition(state)) {
        changed = true;
        return { ...achievement, unlockedAt: new Date().toISOString() };
      }
      return achievement;
    });

    if (changed) {
      setState(prev => ({ ...prev, achievements: newAchievements }));
    }
  }, [state.workouts, state.logs, state.meals, state.settings]);

  // Check Alarms
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours().toString().padStart(2, '0');
      const currentMinute = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHour}:${currentMinute}`;
      
      if (lastTriggeredRef.current === currentTime) return;

      const currentDay = now.getDay(); // 0 (Sun) - 6 (Sat)

      state.alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime && alarm.days.includes(currentDay)) {
          triggerAlarm(alarm);
        }
      });
      
      lastTriggeredRef.current = currentTime;
    }, 1000);
    return () => clearInterval(interval);
  }, [state.alarms]);

  const triggerAlarm = (alarm: Alarm) => {
    setRingingAlarm(alarm);
    
    if (alarm.soundEnabled) {
      // Clear any existing sound loop before starting a new one
      if ((window as any)._alarmInterval) {
        clearInterval((window as any)._alarmInterval);
      }
      playAlarmSound();
    }

    if (alarm.notificationEnabled && Notification.permission === 'granted') {
      new Notification(`⏰ Alarme: ${alarm.label}`, {
        body: `Hora do alarme! ${alarm.time}`,
        icon: '/icon.svg',
        requireInteraction: true
      });
    }
  };

  const playAlarmSound = () => {
    // Create a simple beep using Web Audio API to avoid asset dependencies
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    
    // Create oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.5); // A5
    
    // Pulse pattern
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.5, ctx.currentTime + 1);
    gain.gain.setValueAtTime(0, ctx.currentTime + 1.5);
    
    osc.start();
    
    // Loop the sound by creating a loop function if we wanted, 
    // but for now let's just play a 2-second alert pattern repeatedly
    // Actually, let's just play a long pattern or loop it.
    // Since we need to stop it, we should store the context/oscillator.
    // For simplicity, let's just make a long annoying sound until stopped.
    
    // Better approach: Use an HTML5 Audio element with a data URI if possible, 
    // or just rely on the oscillator for a few seconds.
    // But the user wants a "complete" alarm clock, so it should ring until stopped.
    
    // Let's use an interval to repeat the beep
    const beepInterval = setInterval(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'square';
        osc2.frequency.value = 880;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
    }, 1000);

    // Store cleanup in a ref or state to stop it later
    (window as any)._alarmInterval = beepInterval;
  };

  const stopAlarm = () => {
    setRingingAlarm(null);
    if ((window as any)._alarmInterval) {
        clearInterval((window as any)._alarmInterval);
        (window as any)._alarmInterval = null;
    }
  };

  // --- XP Helper ---
  const calculateNewSettingsWithXp = (settings: UserSettings, amount: number) => {
    const currentXp = settings.xp || 0;
    const currentLevel = settings.level || 1;
    const newXp = currentXp + amount;
    const newLevel = 1 + Math.floor(newXp / 500); // 500 XP per level

    if (newLevel > currentLevel) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    return { ...settings, xp: newXp, level: newLevel };
  };

  const addXp = (amount: number) => {
    setState(prev => ({
      ...prev,
      settings: calculateNewSettingsWithXp(prev.settings, amount)
    }));
  };

  // --- Routine ---
  const setRoutine = (workouts: Workout[], meals: Meal[]) => {
    setState(prev => ({
      ...prev,
      workouts,
      meals
    }));
  };

  // --- Workouts ---
  const addWorkout = (workout: Omit<Workout, 'id' | 'completedDates'>) => {
    setState(prev => ({
      ...prev,
      workouts: [...prev.workouts, { ...workout, id: generateId(), completedDates: [] }]
    }));
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const deleteWorkout = (id: string) => {
    setState(prev => ({
      ...prev,
      workouts: prev.workouts.filter(w => w.id !== id)
    }));
  };

  const toggleWorkoutCompletion = (id: string, date: string) => {
    setState(prev => {
      // Find the workout being toggled
      const workout = prev.workouts.find(w => w.id === id);
      const isNowCompleted = !workout?.completedDates.includes(date);
      
      // Calculate new water goal if settings have weight
      let newSettings = prev.settings;
      if (prev.settings.weightGoal || prev.settings.currentWeight) {
         const currentWeight = prev.settings.currentWeight || (Object.values(prev.logs) as DailyLog[])
            .filter(l => l.weight)
            .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || prev.settings.weightGoal;
         
         let waterActivity: 'low' | 'moderate' | 'high' = 'moderate';
         const level = prev.settings.activityLevel;
         if (level === 'sedentary' || level === 'light') waterActivity = 'low';
         else if (level === 'active' || level === 'very_active') waterActivity = 'high';

         const newGoal = calculateWaterGoal(currentWeight, waterActivity, isNowCompleted);
         
         // Only update if it's an increase (to avoid reducing if they untoggle by mistake) or strictly dynamic
         if (isNowCompleted) {
            newSettings = { ...prev.settings, waterGoal: newGoal };
         }
      }

      // Add XP if completed
      if (isNowCompleted) {
        newSettings = calculateNewSettingsWithXp(newSettings, 50); // 50 XP for workout
      }

      // Log exercises if completed
      let newExerciseLogs = prev.exerciseLogs;
      if (isNowCompleted && workout) {
        const logsToAdd: ExerciseLog[] = workout.exercises.map(ex => ({
          id: generateId(),
          date: date,
          exerciseId: ex.id,
          exerciseName: ex.name,
          weight: parseFloat(ex.weight) || 0,
          reps: ex.reps,
          sets: ex.sets
        }));
        newExerciseLogs = [...prev.exerciseLogs, ...logsToAdd];
      }

      return {
        ...prev,
        settings: newSettings,
        exerciseLogs: newExerciseLogs,
        workouts: prev.workouts.map(w => {
          if (w.id !== id) return w;
          const isCompleted = w.completedDates.includes(date);
          return {
            ...w,
            completedDates: isCompleted
              ? w.completedDates.filter(d => d !== date)
              : [...w.completedDates, date]
          };
        })
      };
    });
  };

  // --- Meals ---
  const addMeal = (meal: Omit<Meal, 'id' | 'completedDates'>) => {
    setState(prev => ({
      ...prev,
      meals: [...prev.meals, { ...meal, id: generateId(), completedDates: [] }]
    }));
  };

  const updateMeal = (id: string, updates: Partial<Meal>) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMeal = (id: string) => {
    setState(prev => ({
      ...prev,
      meals: prev.meals.filter(m => m.id !== id)
    }));
  };

  const toggleMealCompletion = (id: string, date: string) => {
    setState(prev => {
      const meal = prev.meals.find(m => m.id === id);
      const isNowCompleted = !meal?.completedDates.includes(date);
      
      let newSettings = prev.settings;
      if (isNowCompleted) {
        newSettings = calculateNewSettingsWithXp(newSettings, 10); // 10 XP for meal
      }

      return {
        ...prev,
        settings: newSettings,
        meals: prev.meals.map(m => {
          if (m.id !== id) return m;
          const isCompleted = m.completedDates.includes(date);
          return {
            ...m,
            completedDates: isCompleted
              ? m.completedDates.filter(d => d !== date)
              : [...m.completedDates, date]
          };
        })
      };
    });
  };

  // --- Settings ---
  const updateSettings = (updates: Partial<UserSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  };

  // --- Logs (Water/Weight) ---
  const logWater = (date: string, amount: number) => {
    setState(prev => {
      const currentLog = prev.logs[date] || { date, waterIntake: 0 };
      const newWaterIntake = Math.max(0, currentLog.waterIntake + amount);
      
      let newSettings = prev.settings;
      // Add XP only if adding water (not removing)
      if (amount > 0) {
        newSettings = calculateNewSettingsWithXp(newSettings, 5); // 5 XP for water
      }

      return {
        ...prev,
        settings: newSettings,
        logs: {
          ...prev.logs,
          [date]: { ...currentLog, waterIntake: newWaterIntake }
        }
      };
    });
  };

  const logWeight = (date: string, weight: number) => {
    setState(prev => {
      const currentLog = prev.logs[date] || { date, waterIntake: 0 };
      return {
        ...prev,
        settings: {
          ...prev.settings,
          currentWeight: weight
        },
        logs: {
          ...prev.logs,
          [date]: { ...currentLog, weight }
        }
      };
    });
  };

  const resetData = () => {
    if (confirm('Tem certeza que deseja apagar todos os dados?')) {
      setState(INITIAL_STATE);
    }
  };

  // --- Alarms ---
  const addAlarm = (alarm: Omit<Alarm, 'id'>) => {
    setState(prev => ({
      ...prev,
      alarms: [...prev.alarms, { ...alarm, id: generateId() }]
    }));
  };

  const updateAlarm = (id: string, updates: Partial<Alarm>) => {
    setState(prev => ({
      ...prev,
      alarms: prev.alarms.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAlarm = (id: string) => {
    setState(prev => ({
      ...prev,
      alarms: prev.alarms.filter(a => a.id !== id)
    }));
  };

  const toggleAlarm = (id: string) => {
    setState(prev => ({
      ...prev,
      alarms: prev.alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
    }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addWorkout,
      updateWorkout,
      deleteWorkout,
      toggleWorkoutCompletion,
      addMeal,
      updateMeal,
      deleteMeal,
      toggleMealCompletion,
      updateSettings,
      logWater,
      logWeight,
      setRoutine,
      resetData,
      addAlarm,
      updateAlarm,
      deleteAlarm,
      toggleAlarm,
      ringingAlarm,
      stopAlarm
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
