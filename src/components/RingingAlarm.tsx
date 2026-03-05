import React, { useEffect } from 'react';
import { useApp } from '../context';
import { Bell, X, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function RingingAlarm() {
  const { ringingAlarm, stopAlarm } = useApp();

  if (!ringingAlarm) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-blue-500/50 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl shadow-blue-500/20"
      >
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
          <Bell size={64} className="text-blue-400 mx-auto relative z-10 animate-bounce" />
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-2 font-mono">{ringingAlarm.time}</h2>
        <p className="text-xl text-blue-300 mb-8">{ringingAlarm.label}</p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={stopAlarm}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            <Check size={24} />
            Parar Alarme
          </button>
          
          <button 
            onClick={stopAlarm}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          >
            <X size={18} />
            Soneca (5 min)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
