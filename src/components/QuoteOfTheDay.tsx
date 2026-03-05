import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const QUOTES = [
  "O único treino ruim é aquele que não aconteceu.",
  "Suor é a gordura chorando.",
  "Se fosse fácil, todo mundo faria.",
  "Disciplina é fazer o que precisa ser feito, mesmo sem vontade.",
  "Seu corpo pode suportar quase tudo. É sua mente que você precisa convencer.",
  "Não pare quando estiver cansado. Pare quando tiver terminado.",
  "Motivação é o que te faz começar. Hábito é o que te faz continuar.",
  "A dor de hoje é a força de amanhã.",
  "Você não precisa ser ótimo para começar, mas precisa começar para ser ótimo.",
  "Desculpas não queimam calorias.",
  "O corpo alcança o que a mente acredita.",
  "Transforme 'eu não consigo' em 'eu ainda não consigo'.",
  "Cada passo conta, não importa o tamanho.",
  "A melhor versão de você está esperando do outro lado do medo.",
  "Foco no progresso, não na perfeição."
];

export const QuoteOfTheDay: React.FC = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Pick a quote based on the day of the year to be consistent for the day
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % QUOTES.length;
    setQuote(QUOTES[index]);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/10 p-4 rounded-2xl relative overflow-hidden"
    >
      <Quote className="absolute top-2 left-2 text-orange-500/10 rotate-180" size={48} />
      <p className="text-center text-orange-200/90 italic font-medium relative z-10 text-sm md:text-base px-4">
        "{quote}"
      </p>
    </motion.div>
  );
};
