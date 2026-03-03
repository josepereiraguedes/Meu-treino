import React from 'react';
import { useApp } from '../context';
import { Card, Button, Input } from '../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Scale, TrendingUp, Calendar } from 'lucide-react';

export default function Progress() {
  const { logs, settings, logWeight } = useApp();
  const [newWeight, setNewWeight] = React.useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleWeightLog = () => {
    if (newWeight) {
      logWeight(today, parseFloat(newWeight));
      setNewWeight('');
    }
  };

  // Prepare data for charts
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    return {
      name: format(d, 'dd/MM'),
      weight: logs[dateStr]?.weight || null,
      water: logs[dateStr]?.waterIntake || 0,
    };
  });

  // Filter out null weights for the line chart to avoid gaps if possible, or let Recharts handle it
  const weightData = last7Days.filter(d => d.weight !== null);

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold">Progresso</h1>

      {/* Weight Input */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
            <Scale size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Registro de Peso</h2>
            <p className="text-xs text-gray-400">Acompanhe sua evolução</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Input 
            type="number" 
            placeholder="Peso atual (kg)" 
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
          />
          <Button onClick={handleWeightLog}>Salvar</Button>
        </div>
      </Card>

      {/* Weight Chart */}
      <Card className="h-[300px] flex flex-col">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-500" /> Evolução de Peso
        </h3>
        <div className="flex-1 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData}>
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
                domain={['dataMin - 2', 'dataMax + 2']} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {weightData.length < 2 && (
          <p className="text-center text-xs text-gray-500 mt-2">Registre seu peso por pelo menos 2 dias para ver o gráfico.</p>
        )}
      </Card>

      {/* Water History */}
      <Card className="h-[250px] flex flex-col">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-blue-500" /> Histórico de Hidratação
        </h3>
        <div className="flex-1 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#666" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1C1C22', border: '1px solid #333', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="water" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Goals Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center py-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Meta de Peso</p>
          <p className="text-2xl font-bold text-white">{settings.weightGoal} kg</p>
        </Card>
        <Card className="text-center py-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Meta de Água</p>
          <p className="text-2xl font-bold text-blue-400">{settings.waterGoal} ml</p>
        </Card>
      </div>
    </div>
  );
}
