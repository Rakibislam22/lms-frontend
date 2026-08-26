'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Shield,
  Users,
  Award,
  ArrowRight,
  FileEdit,
  GraduationCap,
  Layers,
  Clock,
  ChevronRight,
  Star,
  Check,
  Flame,
  Search
} from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  // Interactive state for hero preview mockup
  const [previewCompleted, setPreviewCompleted] = useState(false);

  useEffect(() => {
    // Fetch published courses
    api.get('/api/courses?populate=*&pagination[limit]=3')
      .then(res => {
        const data = res.data?.data || [];
        setCourses(data);
      })
      .catch(() => {})
      .finally(() => setCoursesLoading(false));

    // Fetch published blog posts
    api.get('/api/blog-posts?filters[status][$eq]=published&populate=*&pagination[limit]=3&sort=createdAt:desc')
      .then(res => {
        const data = res.data?.data || [];
        setPosts(data);
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, []);

  // Fallback demo courses if the database is initially empty
  const fallbackCourses = [
    {
      id: 'demo-1',
      attributes: {
        title: 'Full-Stack Next.js 16 & Strapi 5 Architecture',
        description: 'Master building scalable full-stack applications with Next.js App Router, Strapi headless CMS, and secure role-based access control.',
        category: 'Web Development',
        level: 'Intermediate',
        duration: '6 Lessons • 2 Quizzes',
        ownerName: 'Alex Rivers',
      }
    },
    {
      id: 'demo-2',
      attributes: {
        title: 'Cloud Deployment & DevOps on Railway & Vercel',
        description: 'Deploy production-ready headless architectures with persistent databases, environment configuration, and continuous deployment.',
        category: 'DevOps & Cloud',
        level: 'All Levels',
        duration: '4 Lessons • 1 Quiz',
        ownerName: 'Sarah Chen',
      }
    },
    {
      id: 'demo-3',
      attributes: {
        title: 'Advanced RBAC & Security in Modern Web Apps',
        description: 'Implement ironclad 4-role permission matrices, server-side policy guards, and token authentication without security leaks.',
        category: 'Cybersecurity',
        level: 'Advanced',
        duration: '5 Lessons • 2 Quizzes',
        ownerName: 'Marcus Vance',
      }
    }
  ];

  // Fallback demo blog posts
  const fallbackPosts = [
    {
      id: 'post-1',
      title: 'Architecting Clean RBAC in Strapi 5 Without Security Leaks',
      snippet: 'How to combine route policies, content API permissions, and controller overrides to enforce strict multi-tier access.',
      date: 'Aug 26, 2026',
      readTime: '5 min read',
      author: 'Rakib Islam',
      tag: 'Engineering'
    },
    {
      id: 'post-2',
      title: 'Why Instant Quiz Auto-Grading Belongs on the Server',
      snippet: 'Preventing client-side inspection vulnerabilities by evaluating MCQ submissions against secure database keys.',
      date: 'Aug 25, 2026',
      readTime: '4 min read',
      author: 'Content Team',
      tag: 'Security'
    },
    {
      id: 'post-3',
      title: 'Real-Time Progress Tracking: Accurate Percentage Calculations',
      snippet: 'Computing and persisting granular student progress across multiple modules and refreshes without client drift.',
      date: 'Aug 24, 2026',
      readTime: '6 min read',
      author: 'Education Lead',
      tag: 'Architecture'
    }
  ];

  const displayedCourses = courses.length > 0 ? courses : fallbackCourses;

  return (
    <main className="relative overflow-hidden bg-[#181826] text-white">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[800px] -left-[200px] w-[500px] h-[500px] bg-sky-500/5 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -right-[200px] w-[600px] h-[600px] bg-indigo-500/5 blur-3xl pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1f1f33] border border-white/10 text-xs font-medium text-white/90 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>The Modern Headless Learning Management System</span>
            <span className="text-white/30">|</span>
            <span className="text-indigo-300 font-semibold flex items-center gap-1">
              v1.0 Ready <ChevronRight className="w-3 h-3 inline" />
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Master High-Impact Skills with{' '}
            <span className="bg-gradient-to-r from-white via-white/90 to-indigo-200 bg-clip-text text-transparent underline decoration-indigo-500/50 decoration-4 underline-offset-8">
              Guided Paths & Quizzes
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            A unified learning platform built with Next.js and Strapi 5. Featuring sequential video lessons, 
            instant server-side auto-graded quizzes, persistent progress tracking, and 4 dedicated role workspaces.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {!loading && user ? (
              <Link
                href="/courses"
                className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#181826] font-bold text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#181826] font-bold text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/courses"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1f1f33] text-white/90 font-medium text-sm border border-white/10 hover:bg-[#262640] hover:text-white transition-all"
                >
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Browse Catalog</span>
                </Link>
              </>
            )}
            <Link
              href="#roles"
              className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-white/60 hover:text-white text-sm transition-colors"
            >
              <span>Explore Roles</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 grid grid-cols-3 gap-2 sm:gap-6 border-t border-white/5 max-w-xl mx-auto text-left">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-white/70">4-Tier RBAC</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-white/70">Instant Auto-Scores</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-xs text-white/70">Accurate Progress %</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HERO VISUAL MOCKUP: Interactive LMS Dashboard Preview */}
        {/* ======================================================== */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="relative rounded-2xl bg-[#1f1f33] border border-white/10 p-2 sm:p-4 shadow-2xl shadow-black/80">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs text-white/40 font-mono hidden sm:inline">learnsphere.app/courses/fullstack-nextjs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Sync Active
                </span>
              </div>
            </div>

            {/* Mockup Workspace Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Course Curriculum */}
              <div className="lg:col-span-4 bg-[#181826] rounded-xl p-3.5 border border-white/5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Course Modules</span>
                  <span className="text-[11px] font-mono text-indigo-300">
                    {previewCompleted ? '4/4 (100%)' : '3/4 (75%)'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. System Architecture</span>
                    </div>
                    <span className="text-[10px] text-white/40">12 min</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>2. 4-Role RBAC Implementation</span>
                    </div>
                    <span className="text-[10px] text-white/40">18 min</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs text-white/90">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3. Server-Side Auto-Grading</span>
                    </div>
                    <span className="text-[10px] text-white/40">15 min</span>
                  </div>

                  <div className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                    previewCompleted ? 'bg-white/5 border border-white/5 text-white/90' : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {previewCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                      )}
                      <span>4. Production Deployment</span>
                    </div>
                    <span className="text-[10px] text-indigo-300 font-medium">
                      {previewCompleted ? 'Done' : 'Now Playing'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar in Sidebar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1.5 text-white/60">
                    <span>Course Progress</span>
                    <span className="font-semibold text-white">
                      {previewCompleted ? '100%' : '75%'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500" 
                      style={{ width: previewCompleted ? '100%' : '75%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Player & Interactive Lesson Card */}
              <div className="lg:col-span-8 bg-[#181826] rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4">
                {/* Mock Player Header */}
                <div className="relative aspect-video rounded-lg bg-gradient-to-br from-[#1b1b2d] to-[#12121c] border border-white/10 flex flex-col items-center justify-center p-6 text-center group overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-white/20 transition-all">
                    <PlayCircle className="w-8 h-8 text-white fill-white/20" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Lesson 4: Deploying Next.js to Vercel & Strapi to Railway</h4>
                  <p className="text-xs text-white/50 max-w-sm mt-1">Configuring production environment variables, database linkings, and live CORS configurations.</p>
                  
                  {/* Subtle video timeline bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full bg-indigo-500 w-3/4" />
                  </div>
                </div>

                {/* Bottom Bar with Interactive Complete Button & Quiz Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Quiz Passed: 5/5 (100%)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewCompleted(!previewCompleted)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      previewCompleted 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-white text-[#181826] hover:bg-white/90 shadow-md shadow-white/10'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{previewCompleted ? 'Completed ✓ (Click to reset)' : 'Mark Lesson as Complete'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PLATFORM METRICS / TRUST COUNTERS */}
      {/* ======================================================== */}
      <section className="py-12 border-y border-white/5 bg-[#141420]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">4 Roles</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Strict RBAC Matrix</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-300">100%</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Accurate Progress Tracking</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">Instant</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Server-Evaluated Quizzes</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">Zero</div>
              <div className="text-xs text-white/50 uppercase tracking-wider">Frontend Security Leaks</div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. USER ROLES ECOSYSTEM SECTION (The 4 Roles) */}
      {/* ======================================================== */}
      <section id="roles" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Role-Based Access Control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Four Tailored Workspaces. Zero Privilege Leaks.
          </h2>
          <p className="text-sm sm:text-base text-white/60">
            Every user experiences a tailored interface with strict server-side policy enforcement. 
            No client-side workarounds or hidden button spoofing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Role 1: Student */}
          <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-sky-400/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Student</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">Learner</span>
                </div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  Enrolls in courses, watches sequential lessons, marks lessons complete, and takes auto-graded quizzes.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/75">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>Browse catalog & self-enroll</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>Personal progress percentage</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>Take quizzes & view test scores</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/courses"
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center block transition-colors border border-white/5"
              >
                Browse Student View →
              </Link>
            </div>
          </div>

          {/* Role 2: Instructor */}
          <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-emerald-400/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Instructor</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Teacher</span>
                </div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  Creates and manages their own courses, uploads lessons, defines MCQ quizzes, and inspects student progress.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/75">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>CRUD own courses & lessons</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Create custom course quizzes</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Track enrolled students' progress</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/register"
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center block transition-colors border border-white/5"
              >
                Join as Instructor →
              </Link>
            </div>
          </div>

          {/* Role 3: Content Manager */}
          <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-purple-400/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileEdit className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Content Mgr</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">Curator</span>
                </div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  Curates platform-wide courses and lessons, writes tech articles, and manages Draft vs Published blog posts.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/75">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Platform-wide content CRUD</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>Draft vs Publish blog moderation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>View student progress metrics</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/#blog"
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center block transition-colors border border-white/5"
              >
                Explore Publications →
              </Link>
            </div>
          </div>

          {/* Role 4: Admin */}
          <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-rose-400/40 transition-all group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Administrator</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">Root</span>
                </div>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  Full platform governance. Manages users, promotes/changes roles, oversees all content, and reviews stats.
                </p>
              </div>

              <ul className="space-y-2 pt-2 border-t border-white/5 text-xs text-white/75">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Manage users & assign roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Total control over all courses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Live platform analytics & stats</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                href="/login"
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold text-center block transition-colors border border-white/5"
              >
                Admin Gateway →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. KEY DIFFERENTIATOR FEATURES SECTION */}
      {/* ======================================================== */}
      <section id="features" className="py-20 bg-[#141420] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Core & Differentiator Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built for Learning Efficacy & Integrity
            </h2>
            <p className="text-sm sm:text-base text-white/60">
              Engineered to handle real edge cases: progress persistence, automated grading, and draft content isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-[#181826] border border-white/10 p-7 space-y-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Persistent Progress Tracking</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                When a student completes a lesson, progress percentage is recalculated server-side and persisted in enrollment records. 
                Zero drift across devices and page refreshes.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-indigo-300">
                <span>3 of 5 lessons done = 60%</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-[#181826] border border-white/10 p-7 space-y-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Server-Side Auto-Grading</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                MCQ quiz submissions are verified against secure database keys on the backend. 
                Students receive automatic score results immediately on submit with complete tamper protection.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span>Instant Score Evaluation ✓</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-[#181826] border border-white/10 p-7 space-y-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <FileEdit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Draft vs Published Blog Engine</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Content managers and admins author rich blog posts with strict visibility control. 
                Drafts are kept confidential while published articles are accessible to students and the public.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-purple-300">
                <span>Safe Editorial Moderation ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. FEATURED COURSES SECTION */}
      {/* ======================================================== */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">Curated Catalog</div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Explore Available Courses</h2>
            <p className="text-sm text-white/60 mt-1">Structured learning curricula designed by verified educators.</p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-indigo-300 transition-colors shrink-0"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayedCourses.map((course) => {
            const id = course.id;
            const attrs = course.attributes || course;
            const title = attrs.title || 'Untitled Course';
            const description = attrs.description || 'Comprehensive curriculum with lessons, hands-on materials, and auto-graded assessments.';
            const category = attrs.category || 'Engineering';
            const duration = attrs.duration || 'Multi-Lesson Module';
            const ownerName = attrs.owner?.username || attrs.ownerName || 'Verified Educator';

            return (
              <div
                key={id}
                className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all group"
              >
                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded-md bg-white/5 text-white/80 border border-white/10">
                      {category}
                    </span>
                    <span className="text-xs text-white/40">{duration}</span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                    {title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                    {description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-center">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-white/70">{ownerName}</span>
                  </div>

                  <Link
                    href={`/courses`}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-[#181826] text-xs font-bold hover:bg-white/90 transition-colors shadow-sm"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. LATEST FROM THE BLOG */}
      {/* ======================================================== */}
      <section id="blog" className="py-20 bg-[#141420] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">Knowledge Base</div>
              <h2 className="text-3xl font-bold tracking-tight text-white">Latest from the Tech Blog</h2>
              <p className="text-sm text-white/60 mt-1">Articles and technical insights authored by content managers and admins.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(posts.length > 0 ? posts : fallbackPosts).map((post, idx) => {
              const id = post.id;
              const title = post.attributes?.title || post.title;
              const body = post.attributes?.body || post.snippet;
              const author = post.attributes?.author?.username || post.author || 'Editorial';
              const date = post.attributes?.createdAt 
                ? new Date(post.attributes.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : (post.date || 'Recent');

              return (
                <div
                  key={id || idx}
                  className="rounded-2xl bg-[#181826] border border-white/10 p-6 flex flex-col justify-between hover:border-purple-400/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span className="text-purple-400 font-medium">Article</span>
                      <span>{date}</span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors leading-snug">
                      {title}
                    </h3>

                    <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                      {body}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/50 mt-4">
                    <span>By {author}</span>
                    <span className="text-white/80 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. PRE-FOOTER CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#22223b] to-[#1a1a2e] border border-white/15 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          {/* Subtle Glow inside Banner */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Ready to Experience Clean, Structured Learning?
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Join as a student to enroll in interactive courses and track your progress, or register as an instructor to build your own curriculum.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-xl bg-white text-[#181826] font-bold text-sm hover:bg-white/90 transition-all shadow-lg shadow-white/10 hover:shadow-white/20"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-[#181826] text-white/90 font-semibold text-sm border border-white/15 hover:bg-white/5 transition-all"
              >
                Sign In to Workspace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
