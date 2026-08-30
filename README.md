# LearnSphere LMS — Frontend (Next.js)

> **Junior Software Engineer — Project Round**  
> Modern, minimalist, and responsive Learning Management System built with **Next.js (App Router)** and styled with **Tailwind CSS**. Deployed on **Vercel**.

---

## 🔗 Live Deployment & Repositories

- **Live Frontend (Vercel):** [https://learn-sphere-pi.vercel.app](https://learn-sphere-pi.vercel.app)
- **Live Backend (Railway):** [https://lms-backend-production-b6a5.up.railway.app](https://lms-backend-production-b6a5.up.railway.app)
- **Frontend GitHub Repository:** [https://github.com/Rakibislam22/lms-frontend](https://github.com/Rakibislam22/lms-frontend)
- **Backend GitHub Repository:** [https://github.com/Rakibislam22/lms-backend](https://github.com/Rakibislam22/lms-backend)

---

## 🧱 Mandatory Tech Stack

| Layer | Technology | Hosting |
|---|---|---|
| **Frontend** | **Next.js 16 (App Router) + Tailwind CSS + Lucide React** | **Vercel** |
| **Backend / CMS** | **Strapi 5 (Headless CMS, SQLite / PostgreSQL)** | **Railway** |

---

## 👥 User Roles & 4-Role Permission Matrix

LearnSphere enforces strict, leak-free role-based access control (RBAC) across four distinct roles:

1. **Admin** — Full platform control. Can manage all users, reassign roles, manage all courses, lessons, quizzes, and blog publications.
2. **Content Manager** — Platform-wide content library manager. Creates and manages courses, lessons, quizzes, and articles. Does not manage user roles.
3. **Instructor** — Manages their own courses, lessons, quizzes, and views progress of enrolled students in their courses.
4. **Student** — Enrolls in courses, watches lessons in sequence, marks lessons complete, takes auto-graded quizzes, and reviews test history.

### Permission Matrix

| Action | Admin | Content Manager | Instructor | Student |
|---|:---:|:---:|:---:|:---:|
| **Manage users & assign roles** | ✅ | ❌ | ❌ | ❌ |
| **Create / edit / delete any course** | ✅ | ✅ | Own only | ❌ |
| **Add / edit / delete lessons** | ✅ | ✅ | Own courses | ❌ |
| **Create quizzes** | ✅ | ✅ | Own courses | ❌ |
| **View student progress & results** | ✅ | ✅ | Own courses | Own only |
| **Write / manage blog posts** | ✅ | ✅ | ❌ | ❌ |
| **Enroll in a course** | ❌ | ❌ | ❌ | ✅ |
| **Take quizzes & view auto-grades** | ❌ | ❌ | ❌ | ✅ |

---

## ✅ Implemented Features

### 1. Core Features (Mandatory)
- **Authentication & RBAC**:
  - Sign up with role selection: **Student**, **Instructor**, or **Content Manager** (Admin is protected from public signup).
  - JWT token stored securely in cookies (`js-cookie`).
  - **Auto-Redirect**: If an authenticated user visits `/login` or `/register`, they are automatically redirected to `/dashboard`.
  - Client-side route protection (`ProtectedRoute.jsx`) ensuring unauthorized roles cannot access restricted routes.
- **Course Management**:
  - Full CRUD operations on courses with responsive modals.
  - Role-filtered course feeds (Instructors see only their courses, Content Managers & Admins manage all courses).
- **Curriculum & Lesson Management**:
  - Add, edit, re-order, and delete lessons under each course.
  - Rich video embedding (YouTube embed converter) and formatted lesson notes.
- **Course Enrollment (Students)**:
  - Browse course catalog with search and enroll with one click.
  - Active enrollments display in the student's personalized workspace under "My Courses".
- **Lesson Viewing (Students)**:
  - Sequential lesson viewer with collapsible playlist sidebar, responsive video player, and complete toggle.

### 2. Differentiator Features (Advanced)
- **1. Progress Tracking**:
  - Students mark individual lessons as "complete" or "in-progress".
  - Real-time progress bar calculation (`(completed / total) * 100%`).
  - Full persistence across page reloads via backend Strapi collection (`/api/lesson-progresses`).
- **2. Quiz with Auto-Grading**:
  - MCQ quiz builder for instructors and content managers.
  - Student quiz runner with question navigation, timer, and unanswered warning modal.
  - **Instant Server-Side Evaluation**: Correct answers are verified on submit; score percentage is computed instantly.
  - **Average Score & Detailed Modal**: The student progress table calculates and shows each student's average quiz score. Clicking the score opens a detailed breakdown modal with question-by-question answer review.
- **3. Dedicated Admin Panel**:
  - Accessible strictly to the **admin** role at `/dashboard` (User Management tab).
  - Platform overview metrics (total users per role, total courses, enrollments).
  - Live user role manager: Promote or modify any user's role on the fly with SweetAlert2 confirmation.
- **4. Blog — Draft vs. Published Workflow**:
  - Dedicated `/blog` index and `/blog/[id]` dynamic reading page.
  - Content Managers and Admins can create, edit, toggle draft/published status, and delete articles.
  - Published articles are public; draft articles are strictly hidden from students and public visitors.

### 3. Extra Polish & UX Enhancements
- **React-Toastify**: Configured at `bottom-right` for non-intrusive notifications (login welcome messages, enrollment confirmations, link copy alerts, submission confirmations).
- **SweetAlert2 (Dark Theme)**: Replaced native browser `alert()` and `confirm()` with custom-styled dark dialogs matching LearnSphere's UI palette (`#181826` / `#1f1f33`).
- **Modal Background Scroll Lock**: Custom hook (`useScrollLock`) disables background page scrolling whenever any modal is open.
- **1400px Fluid Containers**: Standardized navigation bar, course workspace, and content containers to a max-width of `1400px`.

---

## 📁 Project Structure

```
lms-frontend/
├── public/
│   ├── logo.png                # Platform branding logo
│   └── favicon.ico             # App favicon
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root layout with ToastProvider & AuthProvider
│   │   ├── page.jsx            # Landing / Homepage
│   │   ├── login/page.jsx      # Login page (with auto-redirect)
│   │   ├── register/page.jsx   # Register page with role selection (with auto-redirect)
│   │   ├── courses/page.jsx    # Public & student course browsing
│   │   ├── blog/
│   │   │   ├── page.jsx        # Blog list page (filtered by status)
│   │   │   └── [id]/page.jsx   # Blog article reading page
│   │   └── dashboard/
│   │       ├── page.jsx        # Role-based workspace switcher
│   │       └── courses/[id]/   # Interactive course classroom & curriculum runner
│   ├── components/
│   │   ├── Navbar.jsx          # Top sticky navigation (1400px max, role dropdown)
│   │   ├── Footer.jsx          # Footer with custom branding
│   │   ├── ProtectedRoute.jsx  # Client-side RBAC guard
│   │   ├── ToastProvider.jsx   # React-Toastify provider (bottom-right)
│   │   └── dashboard/
│   │       ├── DashboardShell.jsx      # Tabbed workspace shell
│   │       ├── StudentWorkspace.jsx    # Student enrollments & quiz cards
│   │       ├── CourseManagementTab.jsx # Instructor / Content Manager course tab
│   │       ├── UserManagementTab.jsx   # Admin user & role management
│   │       ├── BlogManagementTab.jsx   # Article authoring & publication
│   │       ├── CourseModal.jsx         # Create/edit course modal
│   │       ├── LessonManagerModal.jsx  # Curriculum lesson builder
│   │       ├── QuizManagerModal.jsx    # MCQ quiz editor
│   │       └── QuizRunnerModal.jsx     # Student quiz test modal
│   ├── context/
│   │   ├── AuthContext.jsx     # Global authentication state (JWT + user me)
│   │   └── ModalContext.jsx    # Modal trigger management
│   ├── hooks/
│   │   └── useScrollLock.js    # Background scroll lock hook
│   └── lib/
│       ├── api.js              # Axios instance with auto Bearer token injection
│       └── alerts.js           # SweetAlert2 dark theme presets
├── package.json
└── tailwind.config.mjs
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v9.x` or higher

### 2. Clone the Repository
```bash
git clone https://github.com/Rakibislam22/lms-frontend.git
cd lms-frontend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# URL to your local Strapi backend or deployed Railway backend
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
# Or for deployed backend:
# NEXT_PUBLIC_STRAPI_URL=https://your-backend.up.railway.app
```

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production Build & Linting
```bash
npm run build
npm run lint
```

---

## 🎥 10-Minute Video Walkthrough Checklist

When recording the mandatory 10-minute screen demonstration:

1. **Live Demo Across All 4 Roles**:
   - **Student**: Sign up/login → browse catalog → enroll in course → view lesson in sequence → toggle complete (observe progress bar update) → launch quiz → submit answers → view immediate score.
   - **Instructor**: Create course → add lessons with video → create quiz with multiple options → view student progress table with average scores and results modal.
   - **Content Manager**: Manage courses across instructors → write blog post → toggle draft/published.
   - **Admin**: Open admin dashboard → inspect system metrics → change a user's role on the fly with SweetAlert2 confirmation.
2. **Data Flow**:
   - Trace quiz submission from `QuizRunnerModal.jsx` → `POST /api/quiz-results` → controller auto-grading → persisted score response → UI results state.
3. **Role-Based Access Enforcement**:
   - Demonstrate that backend route policies reject unauthorized attempts (e.g., student attempting to delete a course returns `403 Forbidden`).
4. **Progress Tracking Logic**:
   - Explain `toggleLessonComplete` in `CourseDetailPage`, persistent database updates via `/api/lesson-progresses`, and recalculation of `progressPercent`.
5. **Quiz Auto-Grading Logic**:
   - Show how user answers are compared against stored correct options on the backend and mapped to percentage points.
6. **Admin Panel & Blog Workflow**:
   - Showcase role assignment in `UserManagementTab.jsx` and the draft vs. published filter logic in `BlogManagementTab.jsx`.
7. **Deployment & Environment Variables**:
   - Show Vercel project settings (`NEXT_PUBLIC_STRAPI_URL`) and Railway deployment configuration.

---

## 📄 License
This project was developed for the **Junior Software Engineer — Project Round**. All rights reserved.
