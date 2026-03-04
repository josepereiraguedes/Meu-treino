
export const calculateBMI = (weight: number, heightCm: number): { value: number, label: string, color: string } => {
  if (!weight || !heightCm) return { value: 0, label: '-', color: 'text-gray-500' };
  
  const heightM = heightCm / 100;
  const bmi = weight / (heightM * heightM);
  
  let label = '';
  let color = '';

  if (bmi < 18.5) { label = 'Abaixo do peso'; color = 'text-blue-400'; }
  else if (bmi < 24.9) { label = 'Peso normal'; color = 'text-green-500'; }
  else if (bmi < 29.9) { label = 'Sobrepeso'; color = 'text-yellow-500'; }
  else { label = 'Obesidade'; color = 'text-red-500'; }

  return { value: parseFloat(bmi.toFixed(1)), label, color };
};

export const calculateBMR = (weight: number, heightCm: number, age: number, gender: 'male' | 'female'): number => {
  // Mifflin-St Jeor Equation
  if (!weight || !heightCm || !age) return 0;
  
  let bmr = (10 * weight) + (6.25 * heightCm) - (5 * age);
  
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  return Math.round(bmr);
};

export const calculateTDEE = (bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' = 'moderate'): number => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  return Math.round(bmr * multipliers[activityLevel]);
};

export const calculateMacros = (calories: number, goal: 'lose' | 'maintain' | 'gain' = 'maintain') => {
  // Standard split: 
  // Lose: 40% Protein, 35% Fat, 25% Carbs
  // Maintain: 30% Protein, 35% Fat, 35% Carbs
  // Gain: 30% Protein, 20% Fat, 50% Carbs
  
  let ratios = { p: 0.3, f: 0.35, c: 0.35 };
  
  if (goal === 'lose') ratios = { p: 0.4, f: 0.35, c: 0.25 };
  if (goal === 'gain') ratios = { p: 0.3, f: 0.2, c: 0.5 };

  return {
    protein: Math.round((calories * ratios.p) / 4), // 4 kcal/g
    fats: Math.round((calories * ratios.f) / 9),    // 9 kcal/g
    carbs: Math.round((calories * ratios.c) / 4)    // 4 kcal/g
  };
};

export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  // Epley Formula
  return Math.round(weight * (1 + reps / 30));
};

export const calculateWaterGoal = (weight: number, activityLevel: 'low' | 'moderate' | 'high', trainedToday: boolean): number => {
  let base = weight * 35; // 35ml per kg base
  
  if (trainedToday) {
    base += 500; // Add 500ml for workout
  }
  
  return Math.round(base);
};
