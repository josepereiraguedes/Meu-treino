import { Home, Dumbbell, Utensils, BarChart2, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn, MOTIVATIONAL_QUOTES } from '../utils';
import React, { useEffect } from 'react';
import { useApp } from '../context';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RestTimer } from './RestTimer';

export function BottomNav() {
  const location = useLocation();
  
  const tabs = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Dumbbell, label: 'Treinos', path: '/workouts' },
    { icon: Utensils, label: 'Dieta', path: '/nutrition' },
    { icon: BarChart2, label: 'Progresso', path: '/progress' },
    { icon: Settings, label: 'Ajustes', path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-[#0F0F14] via-[#0F0F14] to-transparent pointer-events-none">
      <nav className="glass rounded-2xl flex items-center justify-around p-2 max-w-md mx-auto shadow-2xl shadow-black/50 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16",
                isActive ? "text-[#0A84FF] bg-white/5" : "text-gray-500 hover:text-gray-300"
              )}
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { workouts, meals, settings } = useApp();
  const lastNotificationRef = React.useRef<string>("");

  useEffect(() => {
    if (!settings.notificationsEnabled) return;

    // Request permission on mount if enabled in settings but not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const todayStr = format(now, 'yyyy-MM-dd');
      const dayOfWeekName = format(now, 'eeee', { locale: ptBR });
      const formattedDayName = dayOfWeekName.charAt(0).toUpperCase() + dayOfWeekName.slice(1);
      
      // Create a key for the current minute to prevent duplicate checks in the same minute
      const timeKey = `${currentHour}:${currentMinute}`;
      if (lastNotificationRef.current === timeKey) return;
      lastNotificationRef.current = timeKey;

      // 1. Check Workouts (30 min before)
      workouts.forEach(workout => {
        if (workout.day.toLowerCase() === formattedDayName.split('-')[0].toLowerCase()) {
          const [wHour, wMinute] = workout.time.split(':').map(Number);
          const workoutTime = new Date();
          workoutTime.setHours(wHour, wMinute, 0);
          
          const diffInMinutes = (workoutTime.getTime() - now.getTime()) / 1000 / 60;
          
          // Notify exactly 30 minutes before (allowing a small window for execution delay)
          if (diffInMinutes >= 29.5 && diffInMinutes <= 30.5) {
            new Notification("Hora do Treino! 💪", {
              body: `Seu treino de ${workout.name} começa em 30 minutos! Prepare-se.`,
              icon: '/vite.svg',
              tag: `workout-${workout.id}-${todayStr}` // Prevent duplicate notifications
            });
          }
        }
      });

      // 2. Check Meals (Exact time)
      meals.forEach(meal => {
        const [mHour, mMinute] = meal.time.split(':').map(Number);
        if (currentHour === mHour && currentMinute === mMinute) {
           new Notification("Hora de Comer! 🍽️", {
              body: `Refeição: ${meal.name} - ${meal.description}`,
              icon: '/vite.svg',
              tag: `meal-${meal.id}-${todayStr}`
            });
        }
      });

      // 3. Daily Motivation (at 09:00 AM)
      if (currentHour === 9 && currentMinute === 0) {
        const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        new Notification("Motivação Diária 🔥", {
          body: quote,
          icon: '/vite.svg',
          tag: `motivation-${todayStr}`
        });
      }

      // 4. Inactivity Check (at 18:00 PM)
      if (currentHour === 18 && currentMinute === 0) {
        // Find last completed workout date
        let lastWorkoutDate: Date | null = null;
        
        workouts.forEach(w => {
          w.completedDates.forEach(dateStr => {
            const date = parseISO(dateStr);
            if (!lastWorkoutDate || date > lastWorkoutDate) {
              lastWorkoutDate = date;
            }
          });
        });

        if (lastWorkoutDate) {
          const daysSinceLastWorkout = differenceInDays(now, lastWorkoutDate);
          if (daysSinceLastWorkout >= 3) {
            new Notification("Sentimos sua falta! 🥺", {
              body: `Você não treina há ${daysSinceLastWorkout} dias. Que tal voltar hoje?`,
              icon: '/vite.svg',
              tag: `inactivity-${todayStr}`
            });
          }
        } else if (workouts.length > 0) {
           // User has workouts but never completed one
           // Check if they created the account more than 3 days ago (using a simple check if workouts exist)
           // For simplicity, we just remind them to start.
           new Notification("Comece sua jornada! 🚀", {
             body: "Você tem treinos configurados. Vamos fazer o primeiro hoje?",
             icon: '/vite.svg',
             tag: `start-${todayStr}`
           });
        }
      }
    };

    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds for better precision
    return () => clearInterval(interval);
  }, [workouts, meals, settings.notificationsEnabled]);

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto relative overflow-hidden bg-[#0F0F14]">
      {/* Background ambient glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="p-5 relative z-10">
        {children}
      </main>
      <RestTimer />
      <BottomNav />
    </div>
  );
}
