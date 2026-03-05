import React from 'react';
import { motion } from 'motion/react';
import { format, subDays, isSameDay } from 'date-fns';
import { DailyLog, Workout } from '../types';

interface ActivityHeatmapProps {
  logs: Record<string, DailyLog>;
  workouts: Workout[];
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ logs, workouts }) => {
  const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));

  const getActivityLevel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs[dateStr];
    
    // Check if any workout was completed on this date
    const workoutCompleted = workouts.some(w => w.completedDates.includes(dateStr));
    
    // Check if water goal was met (assuming 2000ml as a baseline if goal not available in log)
    const waterMet = (log?.waterIntake || 0) > 2000;

    if (workoutCompleted && waterMet) return 3; // High
    if (workoutCompleted || waterMet) return 2; // Medium
    if (log) return 1; // Low (just logged in/water)
    return 0; // None
  };

  const getColor = (level: number) => {
    switch (level) {
      case 3: return 'bg-emerald-500';
      case 2: return 'bg-emerald-500/60';
      case 1: return 'bg-emerald-500/30';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="bg-[#1C1C22] p-4 rounded-2xl border border-white/5">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Consistência (30 dias)</h3>
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((day, i) => {
          const level = getActivityLevel(day);
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`aspect-square rounded-sm ${getColor(level)}`}
              title={format(day, 'dd/MM/yyyy')}
            />
          );
        })}
      </div>
      <div className="flex justify-end gap-2 mt-2 text-[10px] text-gray-500 items-center">
        <span>Menos</span>
        <div className="w-2 h-2 bg-white/5 rounded-sm"></div>
        <div className="w-2 h-2 bg-emerald-500/30 rounded-sm"></div>
        <div className="w-2 h-2 bg-emerald-500/60 rounded-sm"></div>
        <div className="w-2 h-2 bg-emerald-500 rounded-sm"></div>
        <span>Mais</span>
      </div>
    </div>
  );
};
