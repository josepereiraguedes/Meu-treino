import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId() {
  return uuidv4();
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export const MOTIVATIONAL_QUOTES = [
  "O único treino ruim é aquele que não aconteceu.",
  "Disciplina é fazer o que precisa ser feito, mesmo sem vontade.",
  "Seu corpo pode suportar quase tudo. É sua mente que você precisa convencer.",
  "Não pare quando estiver cansado. Pare quando tiver terminado.",
  "A dor de hoje é a força de amanhã.",
  "Foco no progresso, não na perfeição.",
  "Cada gota de suor é um passo para o seu objetivo.",
  "Você é mais forte do que imagina.",
];
