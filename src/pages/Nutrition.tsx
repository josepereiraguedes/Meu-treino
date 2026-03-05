import React, { useState } from 'react';
import { useApp } from '../context';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input } from '../components/ui';
import { Plus, Trash2, Utensils, Droplets, Save } from 'lucide-react';
import { Meal } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { calculateBMR, calculateTDEE, calculateMacros } from '../utils/calculations';

export default function Nutrition() {
  const { meals, addMeal, deleteMeal, updateMeal, settings, logs, logWater } = useApp();
  const { addToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysLog = logs[today] || { waterIntake: 0 };

  // Smart Metrics
  const currentWeight = settings.currentWeight || (Object.values(logs) as any[])
    .filter(l => l.weight)
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.weight || settings.weightGoal;
    
  const bmr = settings.height && settings.age && settings.gender 
    ? calculateBMR(currentWeight, settings.height, settings.age, settings.gender)
    : 0;
    
  const activityLevel = settings.activityLevel || 'moderate';
  const tdee = bmr ? calculateTDEE(bmr, activityLevel) : 0;
  const calculatedMacros = tdee ? calculateMacros(tdee, 'maintain') : null;
  const macros = settings.macroGoals || calculatedMacros;

  // Form State
  const [name, setName] = useState('');
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('500');
  const [protein, setProtein] = useState('30');
  const [carbs, setCarbs] = useState('50');
  const [fats, setFats] = useState('15');

  const resetForm = () => {
    setName('');
    setTime('12:00');
    setDescription('');
    setCalories('500');
    setProtein('30');
    setCarbs('50');
    setFats('15');
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name) {
      addToast('O nome da refeição é obrigatório.', 'error');
      return;
    }
    
    const mealData = {
      name,
      time,
      description,
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0
    };

    if (editingId) {
      updateMeal(editingId, mealData);
      addToast('Refeição atualizada com sucesso!', 'success');
    } else {
      addMeal(mealData);
      addToast('Refeição criada com sucesso!', 'success');
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta refeição?')) {
      deleteMeal(id);
      addToast('Refeição excluída com sucesso!', 'success');
    }
  };

  const startEdit = (meal: Meal) => {
    setName(meal.name);
    setTime(meal.time);
    setDescription(meal.description);
    setCalories(meal.calories.toString());
    setProtein((meal.protein || 0).toString());
    setCarbs((meal.carbs || 0).toString());
    setFats((meal.fats || 0).toString());
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

      {/* Smart Nutrition Insights */}
      {tdee > 0 && (
        <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/20">
          <div className="flex items-center gap-2 mb-3 text-green-400">
            <Utensils size={18} />
            <span className="text-xs font-bold uppercase">Metas Sugeridas (Manutenção)</span>
          </div>
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-2xl font-bold text-white">{tdee}</div>
              <div className="text-xs text-gray-400">Kcal Diárias</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-300">Metabolismo Basal: {bmr}</div>
            </div>
          </div>
          
          {macros && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/20 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-400 mb-1">Proteína</div>
                <div className="font-bold text-blue-400">{macros.protein}g</div>
              </div>
              <div className="bg-black/20 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-400 mb-1">Carbo</div>
                <div className="font-bold text-orange-400">{macros.carbs}g</div>
              </div>
              <div className="bg-black/20 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-400 mb-1">Gordura</div>
                <div className="font-bold text-yellow-400">{macros.fats}g</div>
              </div>
            </div>
          )}
        </Card>
      )}

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
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-blue-400 mb-1 block">Proteína (g)</label>
                    <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} className="border-blue-500/30 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs text-orange-400 mb-1 block">Carbo (g)</label>
                    <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} className="border-orange-500/30 focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="text-xs text-yellow-400 mb-1 block">Gordura (g)</label>
                    <Input type="number" value={fats} onChange={e => setFats(e.target.value)} className="border-yellow-500/30 focus:border-yellow-500" />
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
                    <div className="flex gap-3 mt-2 text-xs font-mono">
                      <span className="text-blue-400">P: {meal.protein || 0}g</span>
                      <span className="text-orange-400">C: {meal.carbs || 0}g</span>
                      <span className="text-yellow-400">G: {meal.fats || 0}g</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => startEdit(meal)} className="p-2 text-gray-500 hover:text-blue-400 transition-colors">
                      <Save size={18} />
                    </button>
                    <button onClick={() => handleDelete(meal.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-gray-400">Total Diário</span>
                <span className="text-xl font-bold text-orange-400">
                  {meals.reduce((acc, m) => acc + m.calories, 0)} <span className="text-sm text-gray-500">kcal</span>
                </span>
              </div>
              <div className="flex justify-between text-sm font-mono">
                <div className="text-blue-400">
                  <span className="text-gray-500 block text-xs">Proteína</span>
                  {meals.reduce((acc, m) => acc + (m.protein || 0), 0)}g
                </div>
                <div className="text-orange-400 text-center">
                  <span className="text-gray-500 block text-xs">Carbo</span>
                  {meals.reduce((acc, m) => acc + (m.carbs || 0), 0)}g
                </div>
                <div className="text-yellow-400 text-right">
                  <span className="text-gray-500 block text-xs">Gordura</span>
                  {meals.reduce((acc, m) => acc + (m.fats || 0), 0)}g
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
