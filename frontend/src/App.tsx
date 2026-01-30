import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import DashboardPage from './pages/DashboardPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import DiagnosticPage from './pages/DiagnosticPage';
import TestPage from './pages/TestPage';
import TestSetupPage from './pages/TestSetupPage';
import LearningPlanPage from './pages/LearningPlanPage';
import EgeTypePage from './pages/EgeTypePage';
import ExamTestPage from './pages/ExamTestPage';
import ExamPage from './pages/ExamPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ErrorAnalysisPage from './pages/ErrorAnalysisPage';
import SpinWheelPage from './pages/SpinWheelPage';
import FlashcardsPage from './pages/FlashcardsPage';
import PeriodicTablePage from './pages/PeriodicTablePage';
import UnitConverterPage from './pages/UnitConverterPage';
import FormulaCalculatorPage from './pages/FormulaCalculatorPage';
import NotesPage from './pages/NotesPage';
import ProblemGeneratorPage from './pages/ProblemGeneratorPage';
import DailyChallengePage from './pages/DailyChallengePage';
import OgeRussianTestPage from './pages/OgeRussianTestPage';
import VprPhysics8LevelPage from './pages/VprPhysics8LevelPage';
import VprPhysics8TestPage from './pages/VprPhysics8TestPage';
import VprPhysics10TestPage from './pages/VprPhysics10TestPage';
import VprHistory8TestPage from './pages/VprHistory8TestPage';
import VprBiology8TestPage from './pages/VprBiology8TestPage';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireDiagnostic } from './components/RequireDiagnostic';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';

function App() {
  useAchievementNotifications();

  return (
    <Router>
      <div className="min-h-screen bg-gray-950">
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
              color: '#f3f4f6',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            },
            success: {
              duration: 3000,
              style: {
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              },
              iconTheme: {
                primary: '#10b981',
                secondary: '#064e3b',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#7f1d1d',
              },
            },
          }}
        />
        <Routes>
          {/* Публичные роуты */}
          <Route path="/" element={<><Header /><HomePage /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<><Header /><TermsOfServicePage /></>} />

          {/* Диагностика - только аутентификация */}
          <Route path="/diagnostic" element={<ProtectedRoute><Header /><DiagnosticPage /></ProtectedRoute>} />
          <Route path="/diagnostic/test/:subject" element={<ProtectedRoute><TestPage /></ProtectedRoute>} />

          {/* Защищенные роуты - аутентификация + диагностика */}
          <Route path="/dashboard" element={<ProtectedRoute><RequireDiagnostic><Header /><DashboardPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><RequireDiagnostic><Header /><ProfilePage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/profiles/:username" element={<ProtectedRoute><RequireDiagnostic><Header /><PublicProfilePage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/setup/:subject" element={<ProtectedRoute><RequireDiagnostic><Header /><TestSetupPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/ege-type" element={<ProtectedRoute><RequireDiagnostic><Header /><EgeTypePage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/oge-ege" element={<ProtectedRoute><RequireDiagnostic><ExamTestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/oge-russian" element={<ProtectedRoute><RequireDiagnostic><OgeRussianTestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/vpr-physics8-level" element={<ProtectedRoute><RequireDiagnostic><Header /><VprPhysics8LevelPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/vpr-physics8" element={<ProtectedRoute><RequireDiagnostic><VprPhysics8TestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/vpr-physics10" element={<ProtectedRoute><RequireDiagnostic><VprPhysics10TestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/vpr-history8" element={<ProtectedRoute><RequireDiagnostic><VprHistory8TestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/vpr-biology8" element={<ProtectedRoute><RequireDiagnostic><VprBiology8TestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/ege" element={<ProtectedRoute><RequireDiagnostic><ExamTestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/exam" element={<ProtectedRoute><RequireDiagnostic><ExamPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/test/:testId" element={<ProtectedRoute><RequireDiagnostic><TestPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/learning-plan" element={<ProtectedRoute><RequireDiagnostic><Header /><LearningPlanPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><RequireDiagnostic><Header /><LeaderboardPage /></RequireDiagnostic></ProtectedRoute>} />
          <Route path="/error-analysis" element={<ProtectedRoute><RequireDiagnostic><Header /><ErrorAnalysisPage /></RequireDiagnostic></ProtectedRoute>} />

          {/* Мини-игры и инструменты */}
          <Route path="/spin-wheel" element={<SpinWheelPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/periodic-table" element={<PeriodicTablePage />} />
          <Route path="/unit-converter" element={<UnitConverterPage />} />
          <Route path="/formula-calculator" element={<FormulaCalculatorPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/problem-generator" element={<ProblemGeneratorPage />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />

          {/* Админ панель */}
          <Route path="/admin" element={<ProtectedRoute><Header /><AdminPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
