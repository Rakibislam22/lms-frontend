'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useState, useEffect, useRef } from 'react';
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
  Award,
  GraduationCap
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { openCreateCourse, openCreateBlog } = useModal();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const roleType = user?.role?.type || 'student';
  const isDashboardPage = pathname === '/dashboard';

  const roleConfig = {
    admin: {
      label: 'Admin',
      title: 'Administrator Command Hub',
      badge: 'Admin • Root Governance',
      badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      avatarClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500/30',
      icon: Shield,
    },
    content_manager: {
      label: 'Content Mgr',
      title: 'Content Curation Studio',
      badge: 'Content Manager • Editorial',
      badgeClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
      avatarClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/30',
      icon: FileEdit,
    },
    instructor: {
      label: 'Instructor',
      title: 'Instructor Studio',
      badge: 'Instructor • Educator',
      badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      avatarClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-500/30',
      icon: BookOpen,
    },
    student: {
      label: 'Student',
      title: 'Student Learning Center',
      badge: 'Student • Learner',
      badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
      avatarClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-lg shadow-sky-500/20 ring-1 ring-sky-500/30',
      icon: Award,
    },
  };

  const currentRole = roleConfig[roleType] || roleConfig.student;
  const RoleIcon = currentRole.icon;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileMenuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#181826]/95 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/25'
        : 'bg-[#181826]/80 backdrop-blur-sm border-b border-white/5'
        }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* 1. Brand Logo (Left) */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group shrink-0">
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
          </div>

          {/* 2. Middle Navigation Links (All Courses & Blog Centered) */}
          <nav className="hidden md:flex items-center justify-center gap-1 lg:gap-2">
            
            <Link href="/" className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${pathname === '/' ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/5'}`}>
                Home
            </Link>
            
            <Link
              href="/courses"
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${pathname === '/courses'
                ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
            >
              All Courses
            </Link>
            <Link
              href="/blog"
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                pathname === '/blog' || pathname.startsWith('/blog/')
                  ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* 3. Right Action Hub (Responsive) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {loading ? (
              <div className="w-24 sm:w-32 h-9 bg-white/5 rounded-xl animate-pulse" />
            ) : user ? (
              <>
                {/* Desktop Action Buttons */}
                <div className="hidden md:flex items-center gap-2.5">
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
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
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
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
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1f1f33] text-white/90 font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
                    >
                      <Search className="w-3.5 h-3.5 text-sky-400" />
                      <span>Browse Courses</span>
                    </Link>
                  )}

                  {/* Dashboard Link - Hidden when arrived on /dashboard */}
                  {!isDashboardPage && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#262640] text-white font-semibold text-xs border border-white/15 hover:bg-[#2e2e4e] transition-all"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Dashboard</span>
                    </Link>
                  )}
                </div>

                {/* 3. Role-Styled Profile Logo Icon Only (Visible on Desktop & Mobile) */}
                <div className="relative pl-1 sm:border-l sm:border-white/10" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all duration-200 select-none shadow-md ${currentRole.avatarClass
                      } ${profileMenuOpen
                        ? 'scale-105 ring-2 ring-white/30 brightness-110'
                        : 'hover:scale-105 hover:brightness-110 active:scale-95'
                      }`}
                    title={`Profile: ${user.username} (${currentRole.label})`}
                    aria-label="View profile details"
                  >
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </button>

                  {/* Profile Details Pop-Up Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-88 rounded-3xl bg-[#1f1f33]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-2xl z-50 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Top User Card */}
                      <div className="flex items-start gap-3.5 pb-3.5 border-b border-white/10">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-base border shrink-0 shadow-md ${currentRole.avatarClass}`}
                        >
                          {user.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {user.username}
                            </h4>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 inline-flex items-center gap-1 ${currentRole.badgeClass}`}
                            >
                              <RoleIcon className="w-2.5 h-2.5" />
                              <span>{currentRole.label}</span>
                            </span>
                          </div>
                          <p className="text-xs text-white/50 truncate font-mono">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Role Hub & Live Session Bar (short paragraph removed) */}
                      <div className="p-3 rounded-2xl bg-[#181826]/70 border border-white/5 flex items-center justify-between text-xs">
                        <span className="font-bold text-white/90">{currentRole.title}</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live Session Active
                        </span>
                      </div>

                      {/* Contextual Links */}
                      <div className="space-y-1 pt-0.5">
                        {roleType === 'student' && (
                          <Link
                            href="/my-courses"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                              <span>My Enrolled Courses</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/40" />
                          </Link>
                        )}

                        {roleType === 'content_manager' && (
                          <>
                            <Link
                              href="/dashboard?tab=courses"
                              onClick={() => {
                                setProfileMenuOpen(false);
                                window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: 'courses' }));
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                <span>Courses Library</span>
                              </span>
                              <ArrowRight className="w-3 h-3 text-white/40" />
                            </Link>

                            <Link
                              href="/dashboard?tab=blogs"
                              onClick={() => {
                                setProfileMenuOpen(false);
                                window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: 'blogs' }));
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <FileEdit className="w-3.5 h-3.5 text-purple-400" />
                                <span>Blog & Publications</span>
                              </span>
                              <ArrowRight className="w-3 h-3 text-white/40" />
                            </Link>
                          </>
                        )}

                        {roleType === 'instructor' && (
                          <Link
                            href="/dashboard?tab=courses"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: 'courses' }));
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                          >
                            <span className="flex items-center gap-2 font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                              <span>My Courses</span>
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/40" />
                          </Link>
                        )}

                        {roleType === 'admin' && (
                          <>
                            <Link
                              href="/dashboard?tab=courses"
                              onClick={() => {
                                setProfileMenuOpen(false);
                                window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: 'courses' }));
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                                <span>All Courses</span>
                              </span>
                              <ArrowRight className="w-3 h-3 text-white/40" />
                            </Link>

                            <Link
                              href="/dashboard?tab=blogs"
                              onClick={() => {
                                setProfileMenuOpen(false);
                                window.dispatchEvent(new CustomEvent('switch-dashboard-tab', { detail: 'blogs' }));
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 text-xs text-white/80 hover:text-white transition-colors"
                            >
                              <span className="flex items-center gap-2 font-medium">
                                <FileEdit className="w-3.5 h-3.5 text-rose-400" />
                                <span>All Blogs</span>
                              </span>
                              <ArrowRight className="w-3 h-3 text-white/40" />
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Integrated Logout Button inside Profile Pop-Up */}
                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-all shadow-sm active:scale-95"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out of Account</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
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

            {/* Mobile menu toggle */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-[#1f1f33] text-white/80 hover:text-white border border-white/10"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
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
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/5 flex items-center justify-between"
            >
              <span>All Courses</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                pathname === '/blog' || pathname.startsWith('/blog/')
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Blog</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/40" />
            </Link>
          </nav>

          <div className="pt-3 border-t border-white/10">
            {user ? (
              <div className="space-y-3">
                {/* Mobile Profile Card with Role Color */}
                <div className="p-4 rounded-2xl bg-[#1f1f33] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border ${currentRole.avatarClass}`}
                      >
                        {user.username?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{user.username}</div>
                        <div className="text-[10px] text-white/50">{user.email}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border ${currentRole.badgeClass}`}
                    >
                      {currentRole.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-white/70 pt-1 border-t border-white/5">
                    <span>{currentRole.title}</span>
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
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

                {/* Dashboard button in mobile drawer - hidden on /dashboard */}
                {!isDashboardPage && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Go to Dashboard</span>
                  </Link>
                )}

                {/* Mobile Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20 transition-all"
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
