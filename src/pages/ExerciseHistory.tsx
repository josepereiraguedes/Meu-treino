import React from 'react';
import { useApp } from '../context';
import { Card } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dumbbell } from 'lucide-react';

export default function ExerciseHistory() {
  const { exerciseLogs } = useApp();

  // Get unique exercises from logs
  const uniqueExercises = Array.from(new Set(exerciseLogs.map(log => log.exerciseName)));

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold">Histórico de Cargas</h1>

      {uniqueExercises.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
          <p>Nenhum exercício registrado ainda.</p>
          <p className="text-sm mt-2">Complete seus treinos para ver o progresso aqui.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {uniqueExercises.map(exerciseName => {
            const logs = exerciseLogs
              .filter(log => log.exerciseName === exerciseName)
              .sort((a, b) => a.date.localeCompare(b.date));

            // Prepare data for chart
            const data = logs.map(log => ({
              date: format(parseISO(log.date), 'dd/MM'),
              weight: log.weight
            }));

            if (data.length < 2) return null; // Only show chart if there's enough data

            return (
              <Card key={exerciseName}>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Dumbbell size={18} className="text-blue-400" />
                  {exerciseName}
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#666" 
                        fontSize={10} 
                        tickLine={false}
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid #333', borderRadius: '8px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 3 }}
                        activeDot={{ r: 5, fill: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between text-xs text-gray-400">
                  <span>Início: {logs[0].weight}kg</span>
                  <span className="text-green-400">
                    Atual: {logs[logs.length - 1].weight}kg 
                    ({logs[logs.length - 1].weight - logs[0].weight > 0 ? '+' : ''}
                    {logs[logs.length - 1].weight - logs[0].weight}kg)
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
