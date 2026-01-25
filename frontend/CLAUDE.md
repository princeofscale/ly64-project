# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the frontend for Lyceum 64, an educational preparation platform for Russian standardized tests (OGE, EGE, VPR). Built with React, TypeScript, Vite, and Tailwind CSS.

## Development Commands

```bash
# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check without emitting files
npm run type-check
```

## Architecture

### Core Domain Model (Strategy Pattern + Factory Pattern)

The application follows an object-oriented domain model with separation of concerns:

**`src/core/`** - Domain logic layer implementing OOP patterns:
- **`models/`** - Domain entities:
  - `Exam.ts`: Abstract `BaseExam` class with specialized subclasses (`OGEMathExam`, `EGEProfileMathExam`, `EGEBaseMathExam`, `RegularExam`)
  - `Task.ts`: Question model with validation strategy injection
  - `TestSession.ts`: Test state management with pause/resume, navigation, answer tracking, and serialization
- **`strategies/`** - Answer validation using Strategy pattern:
  - `AnswerValidationStrategies.ts`: Different validation strategies for different question types (short answer, choice, multiple choice, matching, detailed)
  - Each `Task` instance is injected with appropriate validation strategy based on question type
- **`factories/`** - Object creation:
  - `ExamFactory.ts`: Singleton factory with `ExamDataRegistry` for creating exam instances. Registry pattern for runtime exam data management
- **`services/`** - Domain services (singletons):
  - `ActiveTestService.ts`: Tracks active test sessions in localStorage
  - `TimerService.ts`: Timer functionality with pause/resume
  - `StorageService.ts`: localStorage abstraction
  - `ConfettiService.ts`: Achievement celebration effects
- **`interfaces/`** - Domain contracts (`IExam`, `ITask`, `ITestSession`, `IAnswerValidationStrategy`, etc.)
- **`types/`** - Type definitions for domain objects
- **`constants/`** - Domain constants (exam configurations, subject names, etc.)

### Application Layer

**`src/services/`** - Infrastructure services:
- `api.ts`: Axios instance with interceptors for auth token injection and 401 handling
- `authService.ts`: Authentication API calls
- `testService.ts`: Test/exam API integration

**`src/store/`** - Global state (Zustand):
- `authStore.ts`: Authentication state with persistence middleware

**`src/hooks/`** - React hooks:
- `useTestSession.ts`: Manages TestSession lifecycle
- `useExam.ts`: Exam state management
- `useTimer.ts`: Timer integration with TimerService
- `useAchievementNotifications.tsx`: Achievement toast notifications

**`src/pages/`** - Route components (22 pages including test variants, profiles, dashboard, leaderboard)

**`src/components/`** - Reusable UI components

**`src/data/`** - Static test variant data (OGE Russian, VPR variants for different subjects/grades)

### Key Patterns

1. **Strategy Pattern**: Answer validation strategies are injected into Task instances based on question type
2. **Factory Pattern**: ExamFactory with registry for creating different exam types
3. **Singleton Pattern**: Services (ActiveTestService, ExamFactory, ExamDataRegistry) use getInstance()
4. **Domain Model**: Rich domain objects (Exam, Task, TestSession) with behavior, not anemic data objects
5. **Serialization**: TestSession supports serialize/deserialize for persistence

### Test Session Flow

1. User selects exam type → ExamFactory creates appropriate Exam instance
2. Exam instance passed to TestSession constructor
3. TestSession manages:
   - Current task navigation (next/previous/goToTask)
   - Answer submission with status tracking (answered/skipped/flagged)
   - Pause/resume with time tracking
   - Progress calculation
   - Completion with automatic validation via Task.validate()
4. ActiveTestService tracks unfinished tests in localStorage (banner warning on dashboard)

### API Integration

- Base URL: `VITE_API_URL` env variable (defaults to `/api`)
- Proxy configured in vite.config.ts for `/api` → `http://localhost:3001`
- All API calls include Bearer token from authStore
- 401 responses trigger automatic logout and redirect to `/login`

### Path Aliases

- `@/` → `./src`
- `@lyceum64/shared` → `../shared/src` (monorepo shared package)

### State Management

- **Global auth state**: Zustand with localStorage persistence
- **Test sessions**: TestSession model instances (can be serialized to localStorage)
- **Active test tracking**: ActiveTestService singleton

### Routing

All routes in `App.tsx` use react-router-dom v6. Most routes include `<Header />` component. Test pages typically don't include Header for full-screen test experience.

### Styling

- Tailwind CSS with custom dark theme (bg-gray-950)
- Custom toast styling with glassmorphism effects
- Confetti animations via canvas-confetti
