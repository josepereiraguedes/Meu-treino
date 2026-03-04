import React from 'react';
import { useApp } from '../context';
import { Card } from '../components/ui';
import { Trophy, Droplets, Dumbbell, Lock, CheckCircle } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function Achievements() {
  const { achievements } = useApp();

  // Helper to get icon component dynamically
  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon ? <Icon size={24} /> : <Trophy size={24} />;
  };

  return (
    <div className="pb-20 space-y-6">
      <h1 className="text-2xl font-bold">Conquistas</h1>

      <div className="grid grid-cols-1 gap-4">
        {achievements.map(achievement => {
          const isUnlocked = !!achievement.unlockedAt;
          
          return (
            <Card 
              key={achievement.id} 
              className={`relative overflow-hidden transition-all ${isUnlocked ? 'border-yellow-500/30 bg-yellow-900/10' : 'opacity-70 grayscale'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isUnlocked ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'}`}>
                  {getIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>{achievement.title}</h3>
                    {isUnlocked ? (
                      <span className="text-xs text-yellow-500 flex items-center gap-1">
                        <CheckCircle size={12} /> Desbloqueado
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Lock size={12} /> Bloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                  {isUnlocked && (
                    <p className="text-[10px] text-gray-600 mt-2">
                      Conquistado em: {new Date(achievement.unlockedAt!).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
