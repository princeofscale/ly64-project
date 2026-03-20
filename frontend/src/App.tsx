import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { InstallPrompt } from './components/InstallPrompt';
import { OfflineBanner } from './components/OfflineBanner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAchievementNotifications } from './hooks/useAchievementNotifications';
import { useTheme } from './hooks/useTheme';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const CheatSheetPage = lazy(() => import('./pages/CheatSheetPage'));
const ClassroomPage = lazy(() => import('./pages/ClassroomPage'));
const DailyChallengePage = lazy(() => import('./pages/DailyChallengePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DuelLobbyPage = lazy(() => import('./pages/DuelLobbyPage'));
const DuelPage = lazy(() => import('./pages/DuelPage'));
const EgeTypePage = lazy(() => import('./pages/EgeTypePage'));
const ErrorAnalysisPage = lazy(() => import('./pages/ErrorAnalysisPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ExamTestPage = lazy(() => import('./pages/ExamTestPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const FormulaCalculatorPage = lazy(() => import('./pages/FormulaCalculatorPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const KnowledgeMapPage = lazy(() => import('./pages/KnowledgeMapPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const LearningPlanPage = lazy(() => import('./pages/LearningPlanPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const MarathonPage = lazy(() => import('./pages/MarathonPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const OgeRussianTestPage = lazy(() => import('./pages/OgeRussianTestPage'));
const PeriodicTablePage = lazy(() => import('./pages/PeriodicTablePage'));
const ProblemGeneratorPage = lazy(() => import('./pages/ProblemGeneratorPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SdamgiaTestPage = lazy(() => import('./pages/SdamgiaTestPage'));
const SpacedRepetitionPage = lazy(() => import('./pages/SpacedRepetitionPage'));
const SpinWheelPage = lazy(() => import('./pages/SpinWheelPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const TestSetupPage = lazy(() => import('./pages/TestSetupPage'));
const TheoryPage = lazy(() => import('./pages/TheoryPage'));
const TheoryTopicPage = lazy(() => import('./pages/TheoryTopicPage'));
const UnitConverterPage = lazy(() => import('./pages/UnitConverterPage'));
const VariantSelectionPage = lazy(() => import('./pages/VariantSelectionPage'));
const TopicPracticePage = lazy(() => import('./pages/TopicPracticePage'));
const TestHistoryPage = lazy(() => import('./pages/TestHistoryPage'));
const GlossaryPage = lazy(() => import('./pages/GlossaryPage'));
const TimelinePage = lazy(() => import('./pages/TimelinePage'));
const HistoryFiguresPage = lazy(() => import('./pages/HistoryFiguresPage'));
const TrigTablePage = lazy(() => import('./pages/TrigTablePage'));
const CalcTablePage = lazy(() => import('./pages/CalcTablePage'));
const LiteraturePage = lazy(() => import('./pages/LiteraturePage'));
const PhysicsConstantsPage = lazy(() => import('./pages/PhysicsConstantsPage'));
const LiteraryTermsPage = lazy(() => import('./pages/LiteraryTermsPage'));
const ChemistryReactionsPage = lazy(() => import('./pages/ChemistryReactionsPage'));
const SocialTermsPage = lazy(() => import('./pages/SocialTermsPage'));
const LiteratureAuthorsPage = lazy(() => import('./pages/LiteratureAuthorsPage'));
const IrregularVerbsPage = lazy(() => import('./pages/IrregularVerbsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const TicketDetailPage = lazy(() => import('./pages/TicketDetailPage'));
const AdminSupportPage = lazy(() => import('./pages/AdminSupportPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  useAchievementNotifications();
  useTheme();

  return (
    <Router>
      <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <OfflineBanner />
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
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
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {}
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

          {}
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
            path="/test/oge-russian"
            element={
              <ProtectedRoute>
                <OgeRussianTestPage />
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
          <Route
            path="/theory"
            element={
              <ProtectedRoute>
                <TheoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theory/:subject/:topicId"
            element={
              <ProtectedRoute>
                <Header />
                <TheoryTopicPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route path="/spin-wheel" element={<ProtectedRoute><SpinWheelPage /></ProtectedRoute>} />
          <Route path="/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
          <Route path="/periodic-table" element={<ProtectedRoute><PeriodicTablePage /></ProtectedRoute>} />
          <Route path="/unit-converter" element={<ProtectedRoute><UnitConverterPage /></ProtectedRoute>} />
          <Route path="/formula-calculator" element={<ProtectedRoute><FormulaCalculatorPage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/problem-generator" element={<ProtectedRoute><ProblemGeneratorPage /></ProtectedRoute>} />
          <Route path="/daily-challenge" element={<ProtectedRoute><DailyChallengePage /></ProtectedRoute>} />
          <Route path="/marathon" element={<ProtectedRoute><Header /><MarathonPage /></ProtectedRoute>} />
          <Route path="/knowledge-map" element={<ProtectedRoute><Header /><KnowledgeMapPage /></ProtectedRoute>} />
          <Route path="/practice/topic/:subject/:topicId" element={<ProtectedRoute><TopicPracticePage /></ProtectedRoute>} />
          <Route path="/duel" element={<ProtectedRoute><Header /><DuelLobbyPage /></ProtectedRoute>} />
          <Route path="/duel/:id" element={<ProtectedRoute><DuelPage /></ProtectedRoute>} />
          <Route path="/cheat-sheets" element={<ProtectedRoute><Header /><CheatSheetPage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><Header /><BookmarksPage /></ProtectedRoute>} />
          <Route path="/spaced-repetition" element={<ProtectedRoute><Header /><SpacedRepetitionPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Header /><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/test-history" element={<ProtectedRoute><Header /><TestHistoryPage /></ProtectedRoute>} />
          <Route path="/classroom" element={<ProtectedRoute><Header /><ClassroomPage /></ProtectedRoute>} />
          <Route path="/glossary" element={<ProtectedRoute><Header /><GlossaryPage /></ProtectedRoute>} />
          <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
          <Route path="/history-figures" element={<ProtectedRoute><HistoryFiguresPage /></ProtectedRoute>} />
          <Route path="/trig-table" element={<ProtectedRoute><TrigTablePage /></ProtectedRoute>} />
          <Route path="/calc-table" element={<ProtectedRoute><CalcTablePage /></ProtectedRoute>} />
          <Route path="/literature" element={<ProtectedRoute><LiteraturePage /></ProtectedRoute>} />
          <Route path="/physics-constants" element={<ProtectedRoute><PhysicsConstantsPage /></ProtectedRoute>} />
          <Route path="/literary-terms" element={<ProtectedRoute><LiteraryTermsPage /></ProtectedRoute>} />
          <Route path="/chemistry-reactions" element={<ProtectedRoute><ChemistryReactionsPage /></ProtectedRoute>} />
          <Route path="/social-terms" element={<ProtectedRoute><SocialTermsPage /></ProtectedRoute>} />
          <Route path="/literature-authors" element={<ProtectedRoute><LiteratureAuthorsPage /></ProtectedRoute>} />
          <Route path="/irregular-verbs" element={<ProtectedRoute><IrregularVerbsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          <Route path="/support" element={<ProtectedRoute><Header /><SupportPage /></ProtectedRoute>} />
          <Route path="/support/:id" element={<ProtectedRoute><Header /><TicketDetailPage /></ProtectedRoute>} />

          {}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Header />
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/support"
            element={
              <ProtectedRoute requireAdmin>
                <Header />
                <AdminSupportPage />
              </ProtectedRoute>
            }
          />

          {}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <InstallPrompt />
      </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
