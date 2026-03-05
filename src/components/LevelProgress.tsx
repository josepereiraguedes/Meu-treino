import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  xp: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ level, xp }) => {
  const xpPerLevel = 500;
  const currentLevelXp = xp % xpPerLevel;
  const progress = (currentLevelXp / xpPerLevel) * 100;
  const nextLevelXp = xpPerLevel - currentLevelXp;

  return (
    <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-2xl p-4 border border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy size={64} />
      </div>
      
      <div className="flex justify-between items-end mb-2 relative z-10">
        <div>
          <div className="text-xs text-indigo-300 font-medium mb-1 flex items-center gap-1">
            <Star size={12} className="fill-indigo-300" /> Nível {level}
          </div>
          <div className="text-2xl font-bold text-white">
            {xp} <span className="text-sm font-normal text-gray-400">XP</span>
          </div>
        </div>
        <div className="text-xs text-gray-400 mb-1">
          Faltam {nextLevelXp} XP para o nível {level + 1}
        </div>
      </div>

      <div className="h-3 bg-black/40 rounded-full overflow-hidden relative z-10">
        <motion.div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
