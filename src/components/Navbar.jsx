'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  FileEdit,
  Search,
  BookOpen,
  Menu,
  X,
  ArrowRight,
  Shield,
  Award
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { openCreateCourse, openCreateBlog } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const roleType = user?.role?.type || 'student';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
      case 'content_manager':
        return { label: 'Content Mgr', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30' };
      case 'instructor':
        return { label: 'Instructor', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Student', bg: 'bg-sky-500/10 text-sky-300 border-sky-500/30' };
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#181826]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/25'
          : 'bg-[#181826]/80 backdrop-blur-sm border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* 1. Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
                <div className="w-full h-full bg-[#181826] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white">LearnSphere</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">LMS</span>
                </div>
                <span className="text-[10px] text-white/40 -mt-0.5 tracking-wide">Next-Gen Education</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/courses"
                className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                All Courses
              </Link>
              <Link
                href="/#features"
                className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Platform
              </Link>
              <Link
                href="/#blog"
                className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Tech Blog
              </Link>
            </nav>
          </div>

          {/* 2. Right Action Hub */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-32 h-9 bg-white/5 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2.5">
                {/* Role Specific Action Buttons In Navbar */}
                {roleType === 'admin' && (
                  <>
                    <button
                      onClick={openCreateCourse}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-sm shadow-white/10 active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Create Course</span>
                    </button>
                    <button
                      onClick={openCreateBlog}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-purple-400" />
                      <span>New Blog</span>
                    </button>
                  </>
                )}

                {roleType === 'content_manager' && (
                  <>
                    <button
                      onClick={openCreateCourse}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-sm shadow-white/10 active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
                      <span>Add Course</span>
                    </button>
                    <button
                      onClick={openCreateBlog}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
                    >
                      <FileEdit className="w-3.5 h-3.5 text-purple-400" />
                      <span>Write Article</span>
                    </button>
                  </>
                )}

                {roleType === 'instructor' && (
                  <button
                    onClick={openCreateCourse}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-sm shadow-white/10 active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Create Course</span>
                  </button>
                )}

                {roleType === 'student' && (
                  <Link
                    href="/courses"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1f1f33] text-white/90 font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
                  >
                    <Search className="w-3.5 h-3.5 text-sky-400" />
                    <span>Browse Courses</span>
                  </Link>
                )}

                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#262640] text-white font-semibold text-xs border border-white/15 hover:bg-[#2e2e4e] transition-all"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>

                {/* User Identity Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-none">{user.username}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-full border inline-block mt-0.5 ${getRoleBadge(roleType).bg}`}>
                      {getRoleBadge(roleType).label}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#181826] text-xs font-bold hover:bg-white/90 transition-all shadow-md shadow-white/10"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#1f1f33] text-white/80 hover:text-white border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181826] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5"
            >
              Explore Courses
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5"
            >
              Features
            </Link>
            <Link
              href="/#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/5"
            >
              Blog
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#1f1f33] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{user.username}</div>
                      <div className="text-[10px] text-white/50">{user.email}</div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(roleType).bg}`}>
                    {getRoleBadge(roleType).label}
                  </span>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(roleType === 'admin' || roleType === 'instructor' || roleType === 'content_manager') && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCreateCourse();
                      }}
                      className="py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Create Course</span>
                    </button>
                  )}
                  {(roleType === 'admin' || roleType === 'content_manager') && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openCreateBlog();
                      }}
                      className="py-2.5 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 flex items-center justify-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>New Blog</span>
                    </button>
                  )}
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to Dashboard</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 text-white/70 text-xs hover:text-white"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#1f1f33] text-white text-xs font-medium border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-white text-[#181826] text-xs font-bold"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
