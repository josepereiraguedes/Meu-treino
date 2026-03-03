import React, { useState } from 'react';
import { useApp } from '../context';
import { Card, Button, Input } from '../components/ui';
import { Plus, Trash2, Utensils, Droplets, Save } from 'lucide-react';
import { Meal } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function Nutrition() {
  const { meals, addMeal, deleteMeal, updateMeal, settings, logs, logWater } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysLog = logs[today] || { waterIntake: 0 };

  // Form State
  const [name, setName] = useState('');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('500');

  const resetForm = () => {
    setName('');
    setTime('12:00');
    setDescription('');
    setCalories('500');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name) return;
    
    const mealData = {
      name,
      time,
      description,
      calories: parseInt(calories) || 0
    };

    if (editingId) {
      updateMeal(editingId, mealData);
    } else {
      addMeal(mealData);
    }
    resetForm();
  };

  const startEdit = (meal: Meal) => {
    setName(meal.name);
    setTime(meal.time);
    setDescription(meal.description);
    setCalories(meal.calories.toString());
    setEditingId(meal.id);
    setIsCreating(true);
  };

  return (
    <div className="pb-20 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Alimentação</h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus size={18} /> Nova Refeição
          </Button>
        )}
      </header>

      {/* Water Tracker */}
      <Card className="bg-gradient-to-r from-blue-900/40 to-blue-800/20 border-blue-500/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
              <Droplets size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Hidratação</h3>
              <p className="text-xs text-blue-300">Meta: {settings.waterGoal}ml</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-100">{todaysLog.waterIntake}ml</div>
        </div>
        
        <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden mb-4">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (todaysLog.waterIntake / settings.waterGoal) * 100)}%` }} 
          />
        </div>

        <div className="flex gap-2 justify-between">
          <Button size="sm" variant="secondary" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex-1" onClick={() => logWater(today, 250)}>+250ml</Button>
          <Button size="sm" variant="secondary" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 flex-1" onClick={() => logWater(today, 500)}>+500ml</Button>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card>
              <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Refeição' : 'Nova Refeição'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nome (Ex: Almoço)</label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Horário</label>
                    <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Calorias (kcal)</label>
                    <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Descrição</label>
                  <Input 
                    placeholder="O que você vai comer?" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Save size={18} /> Salvar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Plano Alimentar</h2>
            {meals
              .sort((a, b) => parseInt(a.time.replace(':', '')) - parseInt(b.time.replace(':', '')))
              .map(meal => (
              <Card key={meal.id} className="group relative overflow-hidden" noPadding>
                <div className="p-4 flex gap-4 items-center">
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-sm font-bold text-white">{meal.time}</span>
                    <div className="h-8 w-[1px] bg-white/10 my-1"></div>
                    <Utensils size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-white">{meal.name}</h3>
                      <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">{meal.calories} kcal</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{meal.description}</p>
                  </div>
                </div>
                
                {/* Actions overlay on hover/focus */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/80 to-transparent pl-10">
                  <button onClick={() => startEdit(meal)} className="p-2 text-blue-400 hover:text-blue-300"><Save size={18} /></button>
                  <button onClick={() => deleteMeal(meal.id)} className="p-2 text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                </div>
              </Card>
            ))}
            
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
              <span className="text-gray-400">Total Diário</span>
              <span className="text-xl font-bold text-orange-400">
                {meals.reduce((acc, m) => acc + m.calories, 0)} <span className="text-sm text-gray-500">kcal</span>
              </span>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
