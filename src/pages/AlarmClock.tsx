import React, { useState } from 'react';
import { useApp } from '../context';
import { useToast } from '../context/ToastContext';
import { Card, Button, Input } from '../components/ui';
import { Bell, Plus, Trash2, Clock, Volume2, BellOff, VolumeX } from 'lucide-react';
import { Alarm } from '../types';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function AlarmClock() {
  const { alarms, addAlarm, deleteAlarm, toggleAlarm, updateAlarm } = useApp();
  const { addToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [newAlarm, setNewAlarm] = useState<Partial<Alarm>>({
    time: '07:00',
    label: 'Acordar',
    days: [1, 2, 3, 4, 5], // Mon-Fri
    soundEnabled: true,
    notificationEnabled: true,
    enabled: true
  });

  const handleAdd = () => {
    if (!newAlarm.time) {
      addToast('Defina um horário para o alarme.', 'error');
      return;
    }
    
    addAlarm({
      time: newAlarm.time,
      label: newAlarm.label || 'Alarme',
      days: newAlarm.days || [],
      soundEnabled: newAlarm.soundEnabled ?? true,
      notificationEnabled: newAlarm.notificationEnabled ?? true,
      enabled: true
    });
    addToast('Alarme criado com sucesso!', 'success');
    setIsAdding(false);
    setNewAlarm({
      time: '07:00',
      label: 'Acordar',
      days: [1, 2, 3, 4, 5],
      soundEnabled: true,
      notificationEnabled: true,
      enabled: true
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este alarme?')) {
      deleteAlarm(id);
      addToast('Alarme excluído com sucesso!', 'success');
    }
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = newAlarm.days || [];
    if (currentDays.includes(dayIndex)) {
      setNewAlarm({ ...newAlarm, days: currentDays.filter(d => d !== dayIndex) });
    } else {
      setNewAlarm({ ...newAlarm, days: [...currentDays, dayIndex].sort() });
    }
  };

  return (
    <div className="pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="text-blue-400" /> Despertador
        </h1>
        <Button onClick={() => setIsAdding(!isAdding)} size="sm">
          <Plus size={20} /> Novo
        </Button>
      </div>

      {isAdding && (
        <Card className="border-blue-500/30 bg-blue-500/5">
          <h3 className="font-semibold mb-4">Novo Alarme</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Hora</label>
                <Input 
                  type="time" 
                  value={newAlarm.time} 
                  onChange={e => setNewAlarm({ ...newAlarm, time: e.target.value })}
                  className="text-2xl p-2 h-12"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">Etiqueta</label>
                <Input 
                  value={newAlarm.label} 
                  onChange={e => setNewAlarm({ ...newAlarm, label: e.target.value })}
                  placeholder="Ex: Treino"
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Dias da Semana</label>
              <div className="flex justify-between gap-1">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    className={`w-8 h-8 rounded-full text-xs flex items-center justify-center transition-colors ${
                      newAlarm.days?.includes(index) 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {day.charAt(0)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setNewAlarm({ ...newAlarm, soundEnabled: !newAlarm.soundEnabled })}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  newAlarm.soundEnabled 
                    ? 'bg-green-500/20 border-green-500 text-green-400' 
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {newAlarm.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                Som
              </button>
              <button
                onClick={() => {
                  const newState = !newAlarm.notificationEnabled;
                  setNewAlarm({ ...newAlarm, notificationEnabled: newState });
                  if (newState) {
                    if (Notification.permission === 'default') {
                      Notification.requestPermission();
                    } else if (Notification.permission === 'denied') {
                      alert('As notificações estão bloqueadas. Por favor, ative-as nas configurações do navegador para receber alertas.');
                    }
                  }
                }}
                className={`flex-1 p-3 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                  newAlarm.notificationEnabled 
                    ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                {newAlarm.notificationEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                Notificação
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" className="flex-1" onClick={() => setIsAdding(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleAdd}>
                Salvar
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {alarms.length === 0 && !isAdding && (
          <div className="text-center py-10 text-gray-500">
            <Clock size={48} className="mx-auto mb-3 opacity-20" />
            <p>Nenhum alarme configurado</p>
          </div>
        )}

        {alarms.map(alarm => (
          <Card key={alarm.id} className={`transition-opacity ${!alarm.enabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${alarm.enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  onClick={() => toggleAlarm(alarm.id)}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${alarm.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
                <div>
                  <div className="text-3xl font-bold font-mono leading-none">{alarm.time}</div>
                  <div className="text-sm text-gray-400 mt-1">{alarm.label}</div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1">
                  {alarm.days.length === 7 ? (
                    <span className="text-xs text-blue-400">Todos os dias</span>
                  ) : alarm.days.length === 0 ? (
                    <span className="text-xs text-gray-500">Uma vez</span>
                  ) : (
                    DAYS.map((day, index) => (
                      <span 
                        key={day} 
                        className={`text-[10px] ${alarm.days.includes(index) ? 'text-blue-400 font-bold' : 'text-gray-600'}`}
                      >
                        {day.charAt(0)}
                      </span>
                    ))
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {alarm.soundEnabled && <Volume2 size={14} className="text-green-400" />}
                  {alarm.notificationEnabled && <Bell size={14} className="text-yellow-400" />}
                  <button 
                    onClick={() => handleDelete(alarm.id)}
                    className="p-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
