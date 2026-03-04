import React, { useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Card, Button, Input } from '../components/ui';
import { Bell, Moon, Trash2, User, Droplets, Target, Save, Camera, Upload } from 'lucide-react';
import { InstallPWA } from '../components/InstallPWA';

import { getRoutineForActivityLevel } from '../utils/routines';

export default function Settings() {
  const { settings, updateSettings, resetData, setRoutine } = useApp();
  const [localSettings, setLocalSettings] = React.useState(settings);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when global settings change (e.g. on first load)
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    alert('Configurações salvas com sucesso!');
  };

  const handleGenerateRoutine = () => {
    if (confirm(`Deseja gerar uma nova rotina baseada no nível "${localSettings.activityLevel}"? Isso substituirá seus treinos e refeições atuais.`)) {
      const { workouts, meals } = getRoutineForActivityLevel(localSettings.activityLevel);
      setRoutine(workouts, meals);
      updateSettings({ activityLevel: localSettings.activityLevel });
      alert('Rotina gerada com sucesso! Verifique as abas de Treinos e Alimentação.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const requestNotificationPermission = () => {
    if (!("Notification" in window)) {
      alert("Este navegador não suporta notificações.");
    } else if (Notification.permission === "granted") {
      alert("Notificações já estão ativadas!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          updateSettings({ notificationsEnabled: true });
          alert("Notificações ativadas!");
        }
      });
    }
  };

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <InstallPWA />

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-700/50 rounded-full">
            <User size={20} />
          </div>
          <h2 className="font-semibold">Perfil</h2>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
              {localSettings.profileImage ? (
                <img src={localSettings.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-500" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">Toque para alterar foto</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Seu Nome</label>
            <Input 
              value={localSettings.name} 
              onChange={e => setLocalSettings({...localSettings, name: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Peso Atual (kg)</label>
              <Input 
                type="number"
                value={localSettings.currentWeight || ''} 
                onChange={e => setLocalSettings({...localSettings, currentWeight: parseFloat(e.target.value) || 0})} 
                placeholder="Ex: 75"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Altura (cm)</label>
              <Input 
                type="number"
                value={localSettings.height || ''} 
                onChange={e => setLocalSettings({...localSettings, height: parseInt(e.target.value) || 0})} 
                placeholder="Ex: 175"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Idade</label>
              <Input 
                type="number"
                value={localSettings.age || ''} 
                onChange={e => setLocalSettings({...localSettings, age: parseInt(e.target.value) || 0})} 
                placeholder="Ex: 30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nível de Atividade</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              value={localSettings.activityLevel || 'moderate'}
              onChange={e => {
                const newLevel = e.target.value as any;
                setLocalSettings({...localSettings, activityLevel: newLevel});
                
                // Update routine immediately as requested
                const { workouts, meals } = getRoutineForActivityLevel(newLevel);
                setRoutine(workouts, meals);
                updateSettings({ activityLevel: newLevel });
              }}
            >
              <option value="sedentary" className="bg-gray-900">Sedentário (Pouco ou nenhum exercício)</option>
              <option value="light" className="bg-gray-900">Leve (Exercício leve 1-3 dias/semana)</option>
              <option value="moderate" className="bg-gray-900">Moderado (Exercício moderado 3-5 dias/semana)</option>
              <option value="active" className="bg-gray-900">Ativo (Exercício pesado 6-7 dias/semana)</option>
              <option value="very_active" className="bg-gray-900">Muito Ativo (Exercício muito pesado + trabalho físico)</option>
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              Ao alterar o nível, sua rotina de treinos e dieta será atualizada automaticamente.
            </p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="mt-2 w-full text-xs"
              onClick={handleGenerateRoutine}
            >
              Regerar Rotina Sugerida (Substituir Atual)
            </Button>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Gênero (para cálculo de TMB)</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setLocalSettings({...localSettings, gender: 'male'})}
                className={`flex-1 p-2 rounded-lg border ${localSettings.gender === 'male' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                Masculino
              </button>
              <button 
                onClick={() => setLocalSettings({...localSettings, gender: 'female'})}
                className={`flex-1 p-2 rounded-lg border ${localSettings.gender === 'female' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                Feminino
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-full text-blue-400">
            <Target size={20} />
          </div>
          <h2 className="font-semibold">Metas</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Meta de Peso (kg)</label>
            <Input 
              type="number"
              value={localSettings.weightGoal} 
              onChange={e => setLocalSettings({...localSettings, weightGoal: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Meta de Água Diária (ml)</label>
            <Input 
              type="number"
              value={localSettings.waterGoal} 
              onChange={e => setLocalSettings({...localSettings, waterGoal: parseFloat(e.target.value)})} 
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-500/20 rounded-full text-yellow-400">
            <Bell size={20} />
          </div>
          <h2 className="font-semibold">Notificações</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-300">Ativar lembretes</span>
          <div 
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${localSettings.notificationsEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            onClick={() => {
              const newState = !localSettings.notificationsEnabled;
              setLocalSettings({...localSettings, notificationsEnabled: newState});
              if (newState) requestNotificationPermission();
            }}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${localSettings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full text-xs"
          onClick={() => {
            if (Notification.permission === 'granted') {
              new Notification("Teste de Notificação 🔔", {
                body: "Se você está vendo isso, as notificações estão funcionando perfeitamente!",
                icon: '/vite.svg'
              });
            } else {
              requestNotificationPermission();
            }
          }}
        >
          Testar Notificação
        </Button>

        <p className="text-xs text-gray-500 mt-3">
          Inclui: Lembretes de treino (30min antes), refeições, motivação diária e alertas de inatividade.
        </p>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>
        <Save size={20} /> Salvar Alterações
      </Button>

      <div className="pt-6 border-t border-white/10">
        <h3 className="text-red-500 font-semibold mb-3 text-sm">Zona de Perigo</h3>
        <Button variant="danger" className="w-full" onClick={resetData}>
          <Trash2 size={18} /> Resetar Todos os Dados
        </Button>
      </div>
      
      <p className="text-center text-xs text-gray-600 pt-4">FocusFit v1.0.0</p>
    </div>
  );
}
