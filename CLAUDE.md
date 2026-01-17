# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **non-commercial EdTech platform** for students preparing to enter Lyceum-Internat №64 in Saratov, Russia (grades 8 and 10), as well as for OGE and EGE exam preparation. This is a **final school project (grade 9)** with architecture designed for future development.

**IMPORTANT:** All content must use ONLY official information from:
- https://lic-int64-saratov-r64.gosweb.gosuslugi.ru/roditelyam-i-uchenikam/poleznaya-informatsiya/informatsiya-dlya-postupayuschih/

## Technology Stack

### Monorepo Structure
- **Workspace Manager:** npm workspaces
- **Package Manager:** npm
- **Packages:** frontend, backend, shared

### Frontend (`/frontend`)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** Zustand
- **HTTP Client:** Axios

### Backend (`/backend`)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **ORM:** Prisma
- **Database:** SQLite (development), PostgreSQL-ready
- **Auth:** JWT
- **Validation:** Zod

### Shared (`/shared`)
- **Purpose:** Shared TypeScript types and constants
- **Exports:** Type definitions, enums, constants for entire application

## Development Commands

### Running the Application

```bash
# Start both frontend and backend simultaneously
npm run dev

# Start frontend only (port 5173)
npm run dev:frontend

# Start backend only (port 3001)
npm run dev:backend
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
```

### Database Management

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database with test data
npm run db:seed
```

### Type Checking & Linting

```bash
# Type check all packages
npm run type-check

# Lint all packages
npm run lint
```

## Architecture

### Data Model (Prisma Schema)

Located in `backend/prisma/schema.prisma`:

- **User** - User accounts with email/password auth
- **UserProgress** - Tracks user's learning progress, chosen direction, target grade
- **Question** - Individual exam questions with metadata (subject, difficulty, type, etc.)
- **Test** - Collections of questions grouped by subject/exam type
- **TestQuestion** - Many-to-many relationship between Tests and Questions
- **TestAttempt** - Records of user test attempts with answers and scores

### Shared Types (`shared/src/types/index.ts`)

Key enums and interfaces:
- **Direction** - 5 learning tracks (Programming, Robotics, Medicine, Biotechnology, Culture)
- **Subject** - Exam subjects (Russian, Math, Physics, Informatics, Biology, History, English)
- **TargetGrade** - Grade 8 or Grade 10
- **ExamType** - Lyceum entrance, OGE, or EGE
- **QuestionType** - Single choice, multiple choice, text input, detailed answer
- **DifficultyLevel** - Easy, medium, hard

### Constants (`shared/src/constants/index.ts`)

- **DIRECTION_LABELS** - Russian labels for directions
- **SUBJECT_LABELS** - Russian labels for subjects
- **REQUIRED_SUBJECTS** - Russian and Mathematics (required for all)
- **DIRECTION_SUBJECTS** - Map of directions to their profile subjects
- **LYCEUM_INFO** - Official lyceum information (phone, email, website, etc.)

### Frontend Structure

```
frontend/src/
├── components/    # Reusable React components
├── pages/         # Page-level components (one per route)
├── hooks/         # Custom React hooks
├── services/      # API service layer (axios calls)
├── store/         # Zustand state management
├── utils/         # Utility functions
└── types/         # Frontend-specific TypeScript types
```

**Current Pages:**
- `HomePage.tsx` - Landing page with lyceum info and directions

### Backend Structure

```
backend/src/
├── routes/        # Express route definitions
├── controllers/   # Request handlers
├── services/      # Business logic layer
├── middlewares/   # Express middleware (auth, error handling, validation)
├── utils/         # Utility functions
└── config/        # Configuration files
```

**Key Middleware:**
- `errorHandler.ts` - Centralized error handling with AppError class

### API Design (Planned)

RESTful API following these patterns:
- `/api/auth/*` - Authentication endpoints
- `/api/tests/*` - Test CRUD and attempts
- `/api/questions/*` - Question management
- `/api/users/*` - User profile and progress

## Important Constraints

1. **Non-Commercial:** No paid features, no monetization
2. **Official Data Only:** Use only information from official lyceum website
3. **Educational Focus:** This is a school project; keep complexity appropriate
4. **Scalability:** Architecture allows future development (migrations, additional features)

## Lyceum-Specific Business Rules

### Admission Requirements

**Required Subjects (all students):**
- Russian Language
- Mathematics

**Profile Subjects by Direction:**
- Programming/Robotics → Physics + Informatics
- Medicine/Biotechnology → Biology
- Culture → History + English

**Target Grades:**
- Grade 8 - 100 places available
- Grade 10 - Available after getting basic education certificate

**Admission Period:**
- Document submission: until July 14
- Entrance exams: July 15-22

### Social Categories (Priority Admission)

- Orphans or children without parental care
- Children of Special Military Operation participants
- Children from low-income families
- Children from large/single-parent families

## Code Style Guidelines

- **Language:** Use Russian for UI text, comments can be in English or Russian
- **Components:** Functional components with hooks (no class components)
- **Typing:** Strict TypeScript - use shared types from `@lyceum64/shared`
- **Imports:** Use path alias `@/*` for frontend imports
- **API Calls:** Centralize in `frontend/src/services/`
- **Error Handling:** Use AppError class for backend errors
- **Validation:** Use Zod schemas for request validation

## Environment Setup

Backend requires `.env` file (copy from `.env.example`):
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## Testing Strategy (Future)

- Unit tests for business logic (services)
- Integration tests for API endpoints
- E2E tests for critical user flows
- Use Vitest for frontend, Jest for backend

## Deployment Considerations (Future)

- Frontend: Static hosting (Vercel, Netlify)
- Backend: Node.js hosting (Railway, Render)
- Database: Migrate to PostgreSQL for production
- Environment variables must be set in hosting platform

## Current Development Status

**Completed:**
- Project structure and workspaces
- Type definitions and constants
- Database schema
- Basic frontend with landing page
- Basic backend server setup

**In Progress:**
- Authentication system
- Question database
- Test creation and taking flow

**Planned:**
- User progress tracking
- Statistics and analytics
- Admin panel for question management
- Advanced features (adaptive tests, recommendations, gamification)
