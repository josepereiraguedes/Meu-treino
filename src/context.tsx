import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Workout, Meal, UserSettings, DailyLog, Exercise } from './types';
import { generateId } from './utils';

const STORAGE_KEY = 'focusfit_data_v1';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Atleta',
  notificationsEnabled: true,
  theme: 'dark',
  waterGoal: 2500,
  weightGoal: 70,
};

const INITIAL_STATE: AppState = {
  workouts: [],
  meals: [
    { id: '1', name: 'Café da Manhã', time: '08:00', description: 'Ovos e Aveia', calories: 400, completedDates: [] },
    { id: '2', name: 'Almoço', time: '13:00', description: 'Frango e Batata Doce', calories: 600, completedDates: [] },
    { id: '3', name: 'Jantar', time: '20:00', description: 'Peixe e Salada', calories: 500, completedDates: [] },
  ],
  settings: DEFAULT_SETTINGS,
  logs: {},
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
  
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
    setState(prev => ({
      ...prev,
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
    }));
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
    setState(prev => ({
      ...prev,
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
    }));
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
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [date]: { ...currentLog, waterIntake: Math.max(0, currentLog.waterIntake + amount) }
        }
      };
    });
  };

  const logWeight = (date: string, weight: number) => {
    setState(prev => {
      const currentLog = prev.logs[date] || { date, waterIntake: 0 };
      return {
        ...prev,
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
      resetData
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
