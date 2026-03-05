import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/Layout';
import { RingingAlarm } from './components/RingingAlarm';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import ExerciseHistory from './pages/ExerciseHistory';
import AlarmClock from './pages/AlarmClock';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <HashRouter>
          <Layout>
            <RingingAlarm />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/exercise-history" element={<ExerciseHistory />} />
              <Route path="/alarm" element={<AlarmClock />} />
            </Routes>
          </Layout>
        </HashRouter>
      </ToastProvider>
    </AppProvider>
  );
}
