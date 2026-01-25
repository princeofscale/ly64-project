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
import OgeRussianTestPage from './pages/OgeRussianTestPage';
import VprPhysics8LevelPage from './pages/VprPhysics8LevelPage';
import VprPhysics8TestPage from './pages/VprPhysics8TestPage';
import VprPhysics10TestPage from './pages/VprPhysics10TestPage';
import VprHistory8TestPage from './pages/VprHistory8TestPage';
import VprBiology8TestPage from './pages/VprBiology8TestPage';
import { Header } from './components/Header';
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
          <Route path="/" element={<><Header /><HomePage /></>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<><Header /><TermsOfServicePage /></>} />
          <Route path="/dashboard" element={<><Header /><DashboardPage /></>} />
          <Route path="/profile" element={<><Header /><ProfilePage /></>} />
          <Route path="/profiles/:username" element={<><Header /><PublicProfilePage /></>} />
          <Route path="/diagnostic" element={<><Header /><DiagnosticPage /></>} />
          <Route path="/diagnostic/test/:subject" element={<TestPage />} />
          <Route path="/test/setup/:subject" element={<><Header /><TestSetupPage /></>} />
          <Route path="/test/ege-type" element={<><Header /><EgeTypePage /></>} />
          <Route path="/test/oge-ege" element={<ExamTestPage />} />
          <Route path="/test/oge-russian" element={<OgeRussianTestPage />} />
          <Route path="/test/vpr-physics8-level" element={<><Header /><VprPhysics8LevelPage /></>} />
          <Route path="/test/vpr-physics8" element={<VprPhysics8TestPage />} />
          <Route path="/test/vpr-physics10" element={<VprPhysics10TestPage />} />
          <Route path="/test/vpr-history8" element={<VprHistory8TestPage />} />
          <Route path="/test/vpr-biology8" element={<VprBiology8TestPage />} />
          <Route path="/test/ege" element={<ExamTestPage />} />
          <Route path="/test/exam" element={<ExamPage />} />
          <Route path="/test/:testId" element={<TestPage />} />
          <Route path="/learning-plan" element={<><Header /><LearningPlanPage /></>} />
          <Route path="/leaderboard" element={<><Header /><LeaderboardPage /></>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
