import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { Button, Card, Input } from './ui';
import { generateWorkoutRoutine, AIWorkoutParams } from '../services/ai';
import { useApp } from '../context';
import { motion, AnimatePresence } from 'motion/react';
import { generateId } from '../utils';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIGeneratorModal({ isOpen, onClose }: AIGeneratorModalProps) {
  const { addWorkout } = useApp();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'generating' | 'success'>('form');
  
  const [formData, setFormData] = useState<AIWorkoutParams>({
    goal: 'Hipertrofia (Ganho de Massa)',
    level: 'Intermediário',
    days: 4,
    equipment: 'Academia Completa',
    duration: '60 min'
  });

  const handleSubmit = async () => {
    setLoading(true);
    setStep('generating');
    
    try {
      const routines = await generateWorkoutRoutine(formData);
      
      // Add each generated workout to the context
      routines.forEach((routine: any) => {
        addWorkout({
          name: routine.name,
          day: routine.day,
          time: routine.time || "18:00",
          exercises: routine.exercises.map((ex: any) => ({
            id: generateId(),
            name: ex.name,
            sets: parseInt(ex.sets) || 3,
            reps: ex.reps,
            weight: parseInt(ex.weight) || 0,
            completed: false
          }))
        });
      });

      setStep('success');
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar treino. Tente novamente.");
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden border-blue-500/30">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Personal IA</h2>
                  <p className="text-xs text-blue-200">Crie seu treino perfeito em segundos</p>
                </div>
              </div>

              {step === 'form' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Qual seu objetivo?</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                      value={formData.goal}
                      onChange={e => setFormData({...formData, goal: e.target.value})}
                    >
                      <option>Hipertrofia (Ganho de Massa)</option>
                      <option>Emagrecimento (Perda de Gordura)</option>
                      <option>Resistência / Condicionamento</option>
                      <option>Força Pura</option>
                      <option>Flexibilidade e Mobilidade</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Nível</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                        value={formData.level}
                        onChange={e => setFormData({...formData, level: e.target.value})}
                      >
                        <option>Iniciante</option>
                        <option>Intermediário</option>
                        <option>Avançado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Dias / Semana</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                        value={formData.days}
                        onChange={e => setFormData({...formData, days: parseInt(e.target.value)})}
                      >
                        <option value={2}>2 dias</option>
                        <option value={3}>3 dias</option>
                        <option value={4}>4 dias</option>
                        <option value={5}>5 dias</option>
                        <option value={6}>6 dias</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Equipamento Disponível</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm"
                      value={formData.equipment}
                      onChange={e => setFormData({...formData, equipment: e.target.value})}
                    >
                      <option>Academia Completa</option>
                      <option>Halteres em Casa</option>
                      <option>Apenas Peso do Corpo (Calistenia)</option>
                      <option>Elásticos e Colchonete</option>
                    </select>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/20 mt-4"
                    onClick={handleSubmit}
                  >
                    <Sparkles size={18} className="mr-2" />
                    Gerar Treino Mágico
                  </Button>
                </div>
              )}

              {step === 'generating' && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                    <Loader2 size={48} className="text-blue-500 animate-spin relative z-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Criando sua rotina...</h3>
                  <p className="text-sm text-gray-400 max-w-[200px]">
                    A IA está analisando a melhor combinação de exercícios para seu objetivo.
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                    <Check size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Treino Criado!</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Sua nova rotina foi adicionada com sucesso aos seus treinos.
                  </p>
                  <Button onClick={onClose} className="w-full bg-green-600 hover:bg-green-500">
                    Ver Meus Treinos
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
