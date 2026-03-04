import React from 'react';
import { useApp } from '../context';
import { Card } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, Scale, Activity, Brain } from 'lucide-react';
import { calculateBMI, calculateBMR } from '../utils/calculations';

export default function Progress() {
  const { logs, settings, workouts } = useApp();
  
  // Prepare data for chart (last 7 days)
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logs[dateStr];
    return {
      name: format(date, 'dd/MM'),
      weight: log?.weight || null,
      water: log?.waterIntake || 0
    };
  });

  // Calculate Smart Metrics
  const currentWeight = settings.currentWeight || (Object.values(logs) as any[])
    .filter(l => l.weight)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || settings.weightGoal;

  const bmi = calculateBMI(currentWeight, settings.height || 0);
  const bmr = calculateBMR(currentWeight, settings.height || 0, settings.age || 0, settings.gender || 'male');

  // Calculate Total Volume (Last 7 days)
  const weeklyVolume = workouts.reduce((total, workout) => {
    // Check if workout was completed in the last 7 days
    const completedInWeek = workout.completedDates.filter(d => {
      const date = parseISO(d);
      const diff = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }).length;

    if (completedInWeek > 0) {
      const workoutVolume = workout.exercises.reduce((vol, ex) => {
        return vol + (ex.sets * parseInt(ex.reps) * (parseFloat(ex.weight) || 0));
      }, 0);
      return total + (workoutVolume * completedInWeek);
    }
    return total;
  }, 0);

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold">Seu Progresso</h1>

      {/* Smart Metrics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-purple-500/20">
          <div className="flex items-center gap-2 mb-2 text-purple-300">
            <Activity size={18} />
            <span className="text-xs font-bold uppercase">IMC Atual</span>
          </div>
          <div className="text-2xl font-bold text-white">{bmi.value || '--'}</div>
          <div className={`text-xs font-medium ${bmi.color}`}>{bmi.label}</div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2 text-orange-300">
            <Brain size={18} />
            <span className="text-xs font-bold uppercase">Metabolismo (TMB)</span>
          </div>
          <div className="text-2xl font-bold text-white">{bmr || '--'} <span className="text-sm font-normal text-gray-400">kcal</span></div>
          <div className="text-xs text-gray-400">Gasto em repouso</div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
            <Scale size={20} />
          </div>
          <div>
            <h2 className="font-bold">Peso Corporal</h2>
            <p className="text-xs text-gray-400">Últimos 7 dias</p>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="font-bold">Volume de Treino</h2>
            <p className="text-xs text-gray-400">Carga total levantada (7 dias)</p>
          </div>
        </div>
        <div className="text-3xl font-bold text-white font-mono">
          {(weeklyVolume / 1000).toFixed(1)}k <span className="text-sm text-gray-500 font-sans">kg</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Quanto maior este número, mais trabalho seus músculos realizaram.
        </p>
      </Card>
    </div>
  );
}
