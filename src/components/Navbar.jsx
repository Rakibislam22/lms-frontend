'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  ShieldCheck,
  FileText,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleBadge = (roleType) => {
    switch (roleType) {
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

  const getDashboardLink = () => {
    if (!user) return '/courses';
    const type = user.role?.type;
    if (type === 'admin') return '/admin';
    if (type === 'instructor') return '/instructor';
    if (type === 'content_manager') return '/courses';
    return '/my-courses';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-[#181826]/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20'
          : 'bg-transparent border-b border-white/5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <div className="w-full h-full bg-[#181826] rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">LearnSphere</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70 border border-white/10">LMS</span>
              </div>
              <span className="text-[11px] text-white/40 -mt-0.5 tracking-wide">Next-Gen Education</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1f1f33]/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <Link
              href="/courses"
              className="px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              Explore Courses
            </Link>
            <Link
              href="/#features"
              className="px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/#roles"
              className="px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              Roles Matrix
            </Link>
            <Link
              href="/#blog"
              className="px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-white/5 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* User details badge */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1f1f33] border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">{user.username}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full border inline-block mt-0.5 ${getRoleBadge(user.role?.type).bg}`}>
                      {getRoleBadge(user.role?.type).label}
                    </span>
                  </div>
                </div>

                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#181826] font-semibold text-sm hover:bg-white/90 transition-all shadow-md shadow-white/10"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-white text-[#181826] text-sm font-semibold hover:bg-white/90 transition-all shadow-md shadow-white/10 hover:shadow-white/20"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#1f1f33] text-white/80 hover:text-white border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5"
            >
              Explore Courses
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5"
            >
              Features
            </Link>
            <Link
              href="/#roles"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5"
            >
              Roles Matrix
            </Link>
            <Link
              href="/#blog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5"
            >
              Blog
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#1f1f33] border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {user.username?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{user.username}</div>
                      <div className="text-xs text-white/50">{user.email}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadge(user.role?.type).bg}`}>
                    {getRoleBadge(user.role?.type).label}
                  </span>
                </div>
                <Link
                  href={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-[#181826] font-semibold text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-white/80 text-sm hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-[#1f1f33] text-white text-sm font-medium border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-lg bg-white text-[#181826] text-sm font-semibold"
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

