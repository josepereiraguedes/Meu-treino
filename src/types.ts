export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: string;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  day: string; // "Segunda", "Terça", etc.
  time: string; // "08:00"
  exercises: Exercise[];
  completedDates: string[]; // ISO date strings
}

export interface Meal {
  id: string;
  name: string; // "Café da Manhã"
  time: string;
  description: string;
  calories: number;
  completedDates: string[]; // ISO date strings
}

export interface UserSettings {
  name: string;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
  waterGoal: number; // ml
  weightGoal: number; // kg
  profileImage?: string; // Base64 or URL
  height?: number; // cm
  age?: number;
  gender?: 'male' | 'female';
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntake: number; // ml
  weight?: number;
  notes?: string;
}

export interface AppState {
  workouts: Workout[];
  meals: Meal[];
  settings: UserSettings;
  logs: Record<string, DailyLog>; // Keyed by date
}
