import React, { useState } from 'react';
import { useApp } from '../context';
import { Card, Button, Input } from '../components/ui';
import { Plus, Trash2, Clock, Calendar, ChevronDown, ChevronUp, Dumbbell, Save, X } from 'lucide-react';
import { DAYS_OF_WEEK, generateId } from '../utils';
import { Workout, Exercise } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function Workouts() {
  const { workouts, addWorkout, deleteWorkout, updateWorkout } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [day, setDay] = useState(DAYS_OF_WEEK[1]); // Default Monday
  const [time, setTime] = useState('08:00');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const resetForm = () => {
    setName('');
    setDay(DAYS_OF_WEEK[1]);
    setTime('08:00');
    setExercises([]);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name) return;
    
    const workoutData = {
      name,
      day,
      time,
      exercises
    };

    if (editingId) {
      updateWorkout(editingId, workoutData);
    } else {
      addWorkout(workoutData);
    }
    resetForm();
  };

  const startEdit = (workout: Workout) => {
    setName(workout.name);
    setDay(workout.day);
    setTime(workout.time);
    setExercises(workout.exercises);
    setEditingId(workout.id);
    setIsCreating(true);
  };

  const addExercise = () => {
    setExercises([...exercises, {
      id: generateId(),
      name: '',
      sets: 3,
      reps: '12',
      weight: '0',
      completed: false
    }]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  return (
    <div className="pb-20">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Treinos</h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus size={18} /> Novo
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card>
              <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar Treino' : 'Novo Treino'}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nome do Treino</label>
                  <Input 
                    placeholder="Ex: Peito e Tríceps" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dia da Semana</label>
                    <select 
                      className="w-full bg-[#1C1C22] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#0A84FF]"
                      value={day}
                      onChange={e => setDay(e.target.value)}
                    >
                      {DAYS_OF_WEEK.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Horário</label>
                    <Input 
                      type="time" 
                      value={time} 
                      onChange={e => setTime(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-sm text-gray-300">Exercícios</h3>
                    <Button size="sm" variant="ghost" onClick={addExercise} className="text-blue-400">
                      <Plus size={14} /> Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {exercises.map((ex, index) => (
                      <div key={ex.id} className="bg-white/5 p-3 rounded-lg flex flex-col gap-2">
                        <div className="flex gap-2">
                          <span className="text-gray-500 font-mono text-sm py-3">{index + 1}.</span>
                          <Input 
                            placeholder="Nome do exercício" 
                            value={ex.name} 
                            onChange={e => updateExercise(ex.id, 'name', e.target.value)}
                            className="flex-1 py-2 text-sm"
                          />
                          <button onClick={() => removeExercise(ex.id)} className="text-red-500/50 hover:text-red-500 p-2">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pl-6">
                          <div>
                            <label className="text-[10px] text-gray-500">Séries</label>
                            <Input 
                              type="number" 
                              value={ex.sets} 
                              onChange={e => updateExercise(ex.id, 'sets', parseInt(e.target.value))}
                              className="py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500">Reps</label>
                            <Input 
                              value={ex.reps} 
                              onChange={e => updateExercise(ex.id, 'reps', e.target.value)}
                              className="py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500">Carga (kg)</label>
                            <Input 
                              value={ex.weight} 
                              onChange={e => updateExercise(ex.id, 'weight', e.target.value)}
                              className="py-1 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {exercises.length === 0 && (
                      <p className="text-center text-xs text-gray-500 py-4">Nenhum exercício adicionado</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={resetForm}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleSave}>
                    <Save size={18} /> Salvar
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                <p>Você ainda não criou nenhum treino.</p>
              </div>
            ) : (
              workouts.map(workout => (
                <WorkoutCard 
                  key={workout.id} 
                  workout={workout} 
                  onEdit={() => startEdit(workout)} 
                  onDelete={() => deleteWorkout(workout.id)} 
                />
              ))
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WorkoutCard({ workout, onEdit, onDelete }: { workout: Workout, onEdit: () => void, onDelete: () => void } & React.Attributes) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="relative group" noPadding>
      <div className="p-5" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 h-fit">
              <Dumbbell size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{workout.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Calendar size={12} /> {workout.day}</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {workout.time}</span>
              </div>
            </div>
          </div>
          <button className="text-gray-500">
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/20 border-t border-white/5 px-5 overflow-hidden"
          >
            <div className="py-4 space-y-2">
              {workout.exercises.map((ex, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-300 border-b border-white/5 last:border-0 pb-2 last:pb-0">
                  <span>{ex.sets}x {ex.name}</span>
                  <span className="text-gray-500">{ex.reps} reps • {ex.weight}kg</span>
                </div>
              ))}
              
              <div className="flex justify-end gap-2 mt-4 pt-2">
                <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                  <Trash2 size={14} /> Excluir
                </Button>
                <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  Editar
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
