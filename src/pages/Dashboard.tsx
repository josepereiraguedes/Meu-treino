import React, { useState } from 'react';
import { useApp } from '../context';
import { Card, Button } from '../components/ui';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Flame, Droplets, Trophy, ChevronRight, CheckCircle2, Circle, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const { settings, workouts, meals, logs, logWater, toggleWorkoutCompletion } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayOfWeekName = format(new Date(), 'eeee', { locale: ptBR });
  
  // Capitalize day name
  const formattedDayName = dayOfWeekName.charAt(0).toUpperCase() + dayOfWeekName.slice(1);

  const todaysLog = logs[today] || { waterIntake: 0 };
  const waterPercentage = Math.min(100, Math.round((todaysLog.waterIntake / settings.waterGoal) * 100));

  const handleLogWater = (amount: number) => {
    logWater(today, amount);
    const newTotal = (todaysLog.waterIntake || 0) + amount;
    
    // Trigger confetti if goal reached (or close to it)
    if (newTotal >= settings.waterGoal && (todaysLog.waterIntake || 0) < settings.waterGoal) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'] // Blue shades
      });
    }
  };

  const handleToggleWorkout = (id: string) => {
    const wasCompleted = nextWorkout?.completedDates.includes(today);
    toggleWorkoutCompletion(id, today);
    
    if (!wasCompleted) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#FBBF24'] // Green and Gold
      });
    }
  };

  // Find today's workouts and sort by time
  const todaysWorkouts = workouts
    .filter(w => w.day.toLowerCase() === formattedDayName.split('-')[0].toLowerCase())
    .sort((a, b) => parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')));

  // Find the next upcoming workout or the first one if all are done/past
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimeValue = currentHour * 60 + currentMinute;

  const nextWorkout = todaysWorkouts.find(w => {
    const [h, m] = w.time.split(':').map(Number);
    const workoutTimeValue = h * 60 + m;
    return workoutTimeValue > currentTimeValue && !w.completedDates.includes(today);
  }) || todaysWorkouts[0]; // Fallback to first workout of the day

  const isWorkoutCompleted = nextWorkout && nextWorkout.completedDates.includes(today);

  // Find next meal
  const nextMeal = meals
    .sort((a, b) => parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')))
    .find(m => {
      const [h, mTime] = m.time.split(':').map(Number);
      return (h * 60 + mTime) > currentTimeValue;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">Bem-vindo de volta,</p>
          <h1 className="text-2xl font-bold text-white">{settings.name}</h1>
        </div>
        <Link to="/settings">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden border border-white/10">
            {settings.profileImage ? (
              <img src={settings.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              settings.name.charAt(0)
            )}
          </div>
        </Link>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border-orange-500/20">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
            <span className="text-xs text-gray-400">Meta Diária</span>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-white">
              {meals.reduce((acc, m) => acc + m.calories, 0)}
            </h3>
            <p className="text-xs text-gray-400">Kcal Planejadas</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-blue-500/10 transition-all duration-500" style={{ height: `${waterPercentage}%` }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
                <Droplets size={20} />
              </div>
              <button onClick={() => handleLogWater(250)} className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded-md transition-colors">
                +250ml
              </button>
            </div>
            <div className="mt-2">
              <h3 className="text-2xl font-bold text-white">
                {todaysLog.waterIntake}<span className="text-sm font-normal text-gray-400">/{settings.waterGoal}</span>
              </h3>
              <p className="text-xs text-gray-400">ml Água</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Workout */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Treino de Hoje</h2>
          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-md">{formattedDayName}</span>
        </div>
        
        {nextWorkout ? (
          <Card className={cn("border-l-4", isWorkoutCompleted ? "border-l-green-500" : "border-l-blue-500")}>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{nextWorkout.name}</h3>
                <p className="text-sm text-gray-400">{nextWorkout.exercises.length} Exercícios • {nextWorkout.time}</p>
              </div>
              <button 
                onClick={() => handleToggleWorkout(nextWorkout.id)}
                className={cn(
                  "p-3 rounded-full transition-all",
                  isWorkoutCompleted ? "bg-green-500 text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"
                )}
              >
                {isWorkoutCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
            </div>
          </Card>
        ) : (
          <Card className="border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center py-8">
            <p className="text-gray-500 mb-3">Nenhum treino programado para hoje.</p>
            <Link to="/workouts">
              <Button size="sm" variant="secondary">Configurar Rotina</Button>
            </Link>
          </Card>
        )}
      </section>

      {/* Next Meal */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Próxima Refeição</h2>
        {nextMeal ? (
          <Card className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <Utensils size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-medium">{nextMeal.name}</h3>
                <span className="text-sm font-mono text-gray-400">{nextMeal.time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{nextMeal.description}</p>
            </div>
          </Card>
        ) : (
          <Card className="py-4">
            <p className="text-gray-500 text-center text-sm">Todas as refeições de hoje foram concluídas ou não há próximas.</p>
          </Card>
        )}
      </section>

      {/* Consistency */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Consistência</h2>
        <Card className="flex justify-between items-center p-4">
          {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - dayOffset));
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayLetter = format(date, 'EEEEE', { locale: ptBR }).toUpperCase();
            
            // Check if any workout was done on this date
            const hasWorkout = workouts.some(w => w.completedDates.includes(dateStr));
            const isToday = dateStr === today;

            return (
              <div key={dayOffset} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  hasWorkout ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white/5 text-gray-600",
                  isToday && !hasWorkout && "border border-blue-500 text-blue-500"
                )}>
                  {hasWorkout ? <Trophy size={12} /> : dayLetter}
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
