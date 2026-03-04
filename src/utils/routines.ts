import { Workout, Meal } from '../types';
import { generateId } from '.';

export const getRoutineForActivityLevel = (level: string): { workouts: Workout[], meals: Meal[] } => {
  const workouts: Workout[] = [];
  const meals: Meal[] = [];

  // Helper to create workout
  const createWorkout = (name: string, day: string, time: string, exercises: any[]) => ({
    id: generateId(),
    name,
    day,
    time,
    exercises: exercises.map(ex => ({
      ...ex,
      id: generateId(),
      completed: false,
      instructions: ex.instructions || "Mantenha a postura correta e controle o movimento.",
      videoUrl: ex.videoUrl
    })),
    completedDates: []
  });

  // Helper to create meal
  const createMeal = (name: string, time: string, description: string, calories: number, protein: number, carbs: number, fats: number, ingredients: string[] = []) => ({
    id: generateId(),
    name,
    time,
    description,
    calories,
    protein,
    carbs,
    fats,
    ingredients,
    completedDates: []
  });

  switch (level) {
    case 'sedentary':
      // Foco: Mobilidade e Caminhadas leves
      workouts.push(
        createWorkout('Caminhada Leve', 'Segunda', '08:00', [
          { name: 'Caminhada', sets: 1, reps: '20 min', weight: '0', instructions: 'Caminhada em ritmo constante, sem correr.' },
          { name: 'Alongamento', sets: 1, reps: '5 min', weight: '0', instructions: 'Alongue pernas, braços e costas suavemente.' }
        ]),
        createWorkout('Mobilidade', 'Quarta', '08:00', [
          { name: 'Rotação de Ombros', sets: 3, reps: '10', weight: '0', instructions: 'Gire os ombros para frente e para trás.' },
          { name: 'Agachamento Assistido', sets: 3, reps: '10', weight: '0', instructions: 'Use uma cadeira para apoio se necessário.' }
        ]),
        createWorkout('Caminhada Leve', 'Sexta', '08:00', [
          { name: 'Caminhada', sets: 1, reps: '20 min', weight: '0' }
        ])
      );
      meals.push(
        createMeal('Café da Manhã', '08:00', 'Iogurte com frutas e aveia', 300, 15, 45, 8, ['Iogurte Natural', 'Banana', 'Aveia', 'Mel']),
        createMeal('Almoço', '12:00', 'Salada grelhada com frango', 500, 40, 30, 20, ['Peito de Frango', 'Alface', 'Tomate', 'Azeite']),
        createMeal('Lanche', '16:00', 'Fruta (Maçã ou Banana)', 100, 1, 25, 0, ['Maçã']),
        createMeal('Jantar', '20:00', 'Sopa de legumes', 300, 10, 40, 10, ['Batata', 'Cenoura', 'Chuchu'])
      );
      break;

    case 'light':
      // Foco: Corpo inteiro leve 2x semana
      workouts.push(
        createWorkout('Full Body A', 'Terça', '18:00', [
          { name: 'Agachamento Livre', sets: 3, reps: '12', weight: '0', instructions: 'Pés na largura dos ombros, desça como se fosse sentar.' },
          { name: 'Flexão de Braço (Joelho)', sets: 3, reps: '10', weight: '0', instructions: 'Apoie os joelhos no chão para facilitar.' },
          { name: 'Prancha', sets: 3, reps: '30s', weight: '0', instructions: 'Mantenha o corpo reto, contraia o abdômen.' }
        ]),
        createWorkout('Full Body B', 'Quinta', '18:00', [
          { name: 'Afundo', sets: 3, reps: '10', weight: '0', instructions: 'Dê um passo à frente e desça o joelho de trás.' },
          { name: 'Remada Curvada (Garrafa)', sets: 3, reps: '12', weight: '2', instructions: 'Incline o tronco e puxe o peso em direção ao quadril.' },
          { name: 'Abdominal Supra', sets: 3, reps: '15', weight: '0' }
        ])
      );
      meals.push(
        createMeal('Café da Manhã', '07:30', 'Ovos mexidos (2) e torrada integral', 350, 20, 30, 15, ['Ovos', 'Pão Integral', 'Manteiga']),
        createMeal('Almoço', '12:30', 'Arroz integral, feijão, frango e salada', 600, 45, 70, 15, ['Arroz Integral', 'Feijão', 'Frango Grelhado', 'Salada Variada']),
        createMeal('Lanche', '16:00', 'Iogurte natural e castanhas', 200, 10, 15, 12, ['Iogurte', 'Castanha do Pará']),
        createMeal('Jantar', '20:00', 'Omelete de legumes', 400, 25, 10, 25, ['Ovos', 'Espinafre', 'Tomate', 'Queijo'])
      );
      break;

    case 'moderate':
      // Foco: Hipertrofia/Condicionamento 3-4x
      workouts.push(
        createWorkout('Superiores', 'Segunda', '19:00', [
          { name: 'Supino Reto', sets: 3, reps: '10', weight: '20', instructions: 'Barra na linha do peito, cotovelos a 45 graus.' },
          { name: 'Puxada Alta', sets: 3, reps: '12', weight: '30', instructions: 'Puxe a barra em direção ao peito, contraindo as costas.' },
          { name: 'Desenvolvimento', sets: 3, reps: '10', weight: '10', instructions: 'Empurre o peso acima da cabeça, mantendo o core firme.' }
        ]),
        createWorkout('Inferiores', 'Quarta', '19:00', [
          { name: 'Agachamento', sets: 4, reps: '10', weight: '40', instructions: 'Desça até as coxas ficarem paralelas ao chão.' },
          { name: 'Leg Press', sets: 3, reps: '12', weight: '80', instructions: 'Empurre a plataforma sem estender totalmente os joelhos.' },
          { name: 'Extensora', sets: 3, reps: '15', weight: '30', instructions: 'Estenda as pernas completamente e segure 1s.' }
        ]),
        createWorkout('Full Body', 'Sexta', '19:00', [
          { name: 'Levantamento Terra', sets: 3, reps: '8', weight: '50', instructions: 'Mantenha a coluna reta, levante o peso usando as pernas e costas.' },
          { name: 'Barra Fixa', sets: 3, reps: 'MAX', weight: '0', instructions: 'Puxe o corpo até o queixo passar da barra.' },
          { name: 'Dips', sets: 3, reps: '10', weight: '0', instructions: 'Mergulho nas paralelas, focando em tríceps e peito.' }
        ])
      );
      meals.push(
        createMeal('Café da Manhã', '07:00', 'Tapioca com queijo e ovos', 450, 20, 50, 18, ['Goma de Tapioca', 'Queijo Coalho', 'Ovos']),
        createMeal('Almoço', '12:30', 'Prato feito completo (Proteína 150g)', 700, 50, 80, 20, ['Arroz', 'Feijão', 'Carne Bovina', 'Salada']),
        createMeal('Pré-Treino', '17:30', 'Banana e Pasta de Amendoim', 250, 8, 30, 12, ['Banana Prata', 'Pasta de Amendoim']),
        createMeal('Jantar', '21:00', 'Filé de frango e batata doce', 500, 40, 60, 10, ['Frango', 'Batata Doce', 'Brócolis'])
      );
      break;

    case 'active':
    case 'very_active':
      // Foco: Performance 5-6x
      workouts.push(
        createWorkout('Push (Empurrar)', 'Segunda', '06:00', [
          { name: 'Supino Inclinado', sets: 4, reps: '8', weight: '25', instructions: 'Foco na parte superior do peitoral.' },
          { name: 'Crucifixo', sets: 3, reps: '12', weight: '12', instructions: 'Abra os braços controlando a descida, alongando o peito.' },
          { name: 'Tríceps Testa', sets: 3, reps: '10', weight: '10', instructions: 'Barra em direção à testa, cotovelos fechados.' }
        ]),
        createWorkout('Pull (Puxar)', 'Terça', '06:00', [
          { name: 'Remada Curvada', sets: 4, reps: '8', weight: '40', instructions: 'Tronco inclinado, puxe a barra na linha do umbigo.' },
          { name: 'Puxada Frente', sets: 3, reps: '12', weight: '40' },
          { name: 'Rosca Direta', sets: 3, reps: '10', weight: '10', instructions: 'Mantenha os cotovelos fixos ao lado do corpo.' }
        ]),
        createWorkout('Legs (Pernas)', 'Quarta', '06:00', [
          { name: 'Agachamento Livre', sets: 4, reps: '6', weight: '80' },
          { name: 'Stiff', sets: 3, reps: '10', weight: '60', instructions: 'Foco nos posteriores de coxa, coluna reta.' },
          { name: 'Panturrilha', sets: 4, reps: '15', weight: '40' }
        ]),
        createWorkout('Upper Body', 'Sexta', '06:00', [
          { name: 'Desenvolvimento Militar', sets: 4, reps: '8', weight: '30' },
          { name: 'Barra Fixa', sets: 4, reps: '8', weight: '0' }
        ])
      );
      meals.push(
        createMeal('Café da Manhã', '06:00', 'Mingau de Aveia Proteico', 500, 30, 60, 10, ['Aveia', 'Whey Protein', 'Leite Desnatado']),
        createMeal('Almoço', '12:00', 'Arroz, Feijão, Carne (200g), Legumes', 800, 60, 90, 25, ['Arroz', 'Feijão', 'Carne', 'Legumes']),
        createMeal('Lanche Tarde', '16:00', 'Sanduíche Natural de Atum', 400, 25, 40, 15, ['Pão Integral', 'Atum', 'Maionese Light']),
        createMeal('Jantar', '20:00', 'Macarrão Integral com Carne Moída', 700, 50, 80, 20, ['Macarrão Integral', 'Carne Moída Magra', 'Molho de Tomate']),
        createMeal('Ceia', '23:00', 'Iogurte e Caseína/Albumina', 200, 25, 10, 5, ['Iogurte', 'Proteína em Pó'])
      );
      break;

    default:
      // Default to moderate
      return getRoutineForActivityLevel('moderate');
  }

  return { workouts, meals };
};
