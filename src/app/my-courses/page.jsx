'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import StudentWorkspace from '@/components/dashboard/StudentWorkspace';
import { useAuth } from '@/context/AuthContext';

function MyCoursesContent() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#181826] text-white py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Learning Tracks</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Track your progress, view sequential lessons, and take auto-graded quizzes.
          </p>
        </div>

      </div>

      <StudentWorkspace user={user} />
    </main>
  );
}

export default function MyCoursesPage() {
  return (
    <ProtectedRoute allowedRoles={['student', 'admin', 'content_manager', 'instructor']}>
      <MyCoursesContent />
    </ProtectedRoute>
  );
}
