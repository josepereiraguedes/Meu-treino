
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

export const calculateWaterGoal = (weight: number, activityLevel: 'low' | 'moderate' | 'high', trainedToday: boolean): number => {
  let base = weight * 35; // 35ml per kg base
  
  if (trainedToday) {
    base += 500; // Add 500ml for workout
  }
  
  return Math.round(base);
};
