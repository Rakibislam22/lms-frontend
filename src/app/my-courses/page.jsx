'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import StudentWorkspace from '@/components/dashboard/StudentWorkspace';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

function MyCoursesContent() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#181826] text-white py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">My Learning Tracks</h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Track your progress, view sequential lessons, and take auto-graded quizzes.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Full Dashboard</span>
        </Link>
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
