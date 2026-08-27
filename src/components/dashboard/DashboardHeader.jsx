'use client';

import {
  Shield,
  BookOpen,
  FileEdit,
  Award,
  Sparkles
} from 'lucide-react';

export default function DashboardHeader({ user }) {
  const roleType = user?.role?.type || 'student';

  const roleConfig = {
    admin: {
      title: 'Administrator Command Hub',
      badge: 'Admin • Root Governance',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Total platform authority: govern users, assign roles, manage all courses, lessons, quizzes, and blog publications.',
      icon: Shield,
    },
    content_manager: {
      title: 'Content Curation Studio',
      badge: 'Content Manager • Editorial',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      avatarClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      description: 'Platform content manager: curate curricula, publish rich articles, manage draft vs published workflows, and build course quizzes.',
      icon: FileEdit,
    },
    instructor: {
      title: 'Instructor Studio',
      badge: 'Instructor • Educator',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      avatarClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Course instructor: build your curriculum, add video lessons, author MCQ quizzes with auto-grading, and monitor student progression.',
      icon: BookOpen,
    },
    student: {
      title: 'Student Learning Center',
      badge: 'Student • Learner',
      badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      avatarClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      description: 'Your interactive learning workspace: track course completion percentages, mark lessons finished, and take auto-graded assessments.',
      icon: Award,
    },
  };

  const currentRoleInfo = roleConfig[roleType] || roleConfig.student;
  const RoleIcon = currentRoleInfo.icon;

  return (
    <div className="relative rounded-3xl bg-[#1f1f33]/70 border border-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-2xl overflow-hidden mb-6">
      {/* Subtle background glow based on role */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
          roleType === 'admin'
            ? 'bg-rose-500'
            : roleType === 'content_manager'
            ? 'bg-purple-500'
            : roleType === 'instructor'
            ? 'bg-emerald-500'
            : 'bg-sky-500'
        }`}
      />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        {/* User Identity & Info */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-14 h-14 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl border shrink-0 shadow-lg ${currentRoleInfo.avatarClass}`}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.username || 'User'}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 shadow-sm ${currentRoleInfo.badgeClass}`}
              >
                <RoleIcon className="w-3 h-3" />
                <span>{currentRoleInfo.badge}</span>
              </span>
            </div>

            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              {currentRoleInfo.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Session Active
              </span>
              <span>•</span>
              <span className="font-mono text-white/50">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
