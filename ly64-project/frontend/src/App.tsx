import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Header } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import EgeTypePage from './pages/EgeTypePage';
import ErrorAnalysisPage from './pages/ErrorAnalysisPage';
import ExamPage from './pages/ExamPage';
import ExamTestPage from './pages/ExamTestPage';
import FormulaCalculatorPage from './pages/FormulaCalculatorPage';
import GamesPage from './pages/GamesPage';
import HomePage from './pages/HomePage';
import LeaderboardPage from './pages/LeaderboardPage';
import LearningPlanPage from './pages/LearningPlanPage';
import LoginPage from './pages/LoginPage';
import NotesPage from './pages/NotesPage';
import PeriodicTablePage from './pages/PeriodicTablePage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import RegisterPage from './pages/RegisterPage';
import RocketPage from './pages/RocketPage';
import RoulettePage from './pages/RoulettePage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import TestPage from './pages/TestPage';
import TestSetupPage from './pages/TestSetupPage';
import UnitConverterPage from './pages/UnitConverterPage';
import VariantSelectionPage from './pages/VariantSelectionPage';
import SdamgiaTestPage from './pages/SdamgiaTestPage';

function App() {
  useAchievementNotifications();

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            },
            success: {
              duration: 3000,
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#ffffff',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <Routes>
          {/* Публичные роуты */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <HomePage />
              </>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/terms"
            element={
              <>
                <Header />
                <TermsOfServicePage />
              </>
            }
          />

          {/* Защищенные роуты */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Header />
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Header />
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profiles/:username"
            element={
              <ProtectedRoute>
                <Header />
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/setup/:subject"
            element={
              <ProtectedRoute>
                <Header />
                <TestSetupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/variants"
            element={
              <ProtectedRoute>
                <VariantSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/sdamgia"
            element={
              <ProtectedRoute>
                <SdamgiaTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/ege-type"
            element={
              <ProtectedRoute>
                <Header />
                <EgeTypePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/oge-ege"
            element={
              <ProtectedRoute>
                <ExamTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/ege"
            element={
              <ProtectedRoute>
                <ExamTestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/exam"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:testId"
            element={
              <ProtectedRoute>
                <TestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-plan"
            element={
              <ProtectedRoute>
                <Header />
                <LearningPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Header />
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/error-analysis"
            element={
              <ProtectedRoute>
                <Header />
                <ErrorAnalysisPage />
              </ProtectedRoute>
            }
          />

          {/* Игры */}
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Header />
                <GamesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rocket"
            element={
              <ProtectedRoute>
                <Header />
                <RocketPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roulette"
            element={
              <ProtectedRoute>
                <Header />
                <RoulettePage />
              </ProtectedRoute>
            }
          />

          {/* Инструменты */}
          <Route path="/periodic-table" element={<PeriodicTablePage />} />
          <Route path="/unit-converter" element={<UnitConverterPage />} />
          <Route path="/formula-calculator" element={<FormulaCalculatorPage />} />
          <Route path="/notes" element={<NotesPage />} />

          {/* Админ панель */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Header />
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
