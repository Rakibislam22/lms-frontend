'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Users,
  BookOpen,
  GraduationCap,
  FileEdit,
  Award,
  TrendingUp,
  Layers,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function StatsOverview({ user, statsTrigger }) {
  const roleType = user?.role?.type || 'student';
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchStats = async () => {
      try {
        if (roleType === 'admin') {
          // Admin endpoint with complete platform breakdown
          const res = await api.get('/api/admin/stats');
          if (isMounted) setStats(res.data);
        } else if (roleType === 'instructor') {
          // Instructor stats: fetch courses owned by this instructor and their enrollments
          const [coursesRes, enrollmentsRes, quizzesRes, resultsRes] = await Promise.all([
            api.get(`/api/courses?filters[owner][id][$eq]=${user.id}&populate=lessons`),
            api.get(`/api/enrollments?filters[course][owner][id][$eq]=${user.id}`),
            api.get(`/api/quizzes?filters[course][owner][id][$eq]=${user.id}`),
            api.get(`/api/quiz-results?filters[quiz][course][owner][id][$eq]=${user.id}`),
          ]);

          const myCourses = coursesRes.data?.data || [];
          const myEnrollments = enrollmentsRes.data?.data || [];
          const myQuizzes = quizzesRes.data?.data || [];
          const myResults = resultsRes.data?.data || [];

          let totalLessons = 0;
          myCourses.forEach((c) => {
            const lessons = c.lessons || c.attributes?.lessons?.data || [];
            totalLessons += lessons.length;
          });

          if (isMounted) {
            setStats({
              totalCourses: myCourses.length,
              totalStudents: myEnrollments.length,
              totalLessons,
              totalQuizzes: myQuizzes.length,
              totalQuizResults: myResults.length,
            });
          }
        } else if (roleType === 'content_manager') {
          // Content manager: platform courses, lessons, blogs
          const [coursesRes, blogsRes] = await Promise.all([
            api.get('/api/courses?populate=lessons'),
            api.get('/api/blog-posts'),
          ]);

          const allCourses = coursesRes.data?.data || [];
          const allBlogs = blogsRes.data?.data || [];
          let totalLessons = 0;
          allCourses.forEach((c) => {
            const lessons = c.lessons || c.attributes?.lessons?.data || [];
            totalLessons += lessons.length;
          });

          const publishedBlogs = allBlogs.filter((b) => (b.status || b.attributes?.status) === 'published').length;
          const draftBlogs = allBlogs.length - publishedBlogs;

          if (isMounted) {
            setStats({
              totalCourses: allCourses.length,
              totalLessons,
              totalBlogs: allBlogs.length,
              publishedBlogs,
              draftBlogs,
            });
          }
        } else {
          // Student: enrollments, completed lessons, quiz results
          const [enrollmentsRes, progressesRes, resultsRes] = await Promise.all([
            api.get(`/api/enrollments?filters[student][id][$eq]=${user.id}&populate=course`),
            api.get(`/api/lesson-progresses?filters[student][id][$eq]=${user.id}&filters[completed][$eq]=true`),
            api.get(`/api/quiz-results?filters[student][id][$eq]=${user.id}&populate=quiz`),
          ]);

          const myEnrollments = enrollmentsRes.data?.data || [];
          const completedLessons = progressesRes.data?.data || [];
          const quizResults = resultsRes.data?.data || [];

          let avgProgress = 0;
          if (myEnrollments.length > 0) {
            const totalP = myEnrollments.reduce((acc, curr) => {
              const p = curr.progressPercent ?? curr.attributes?.progressPercent ?? 0;
              return acc + p;
            }, 0);
            avgProgress = Math.round(totalP / myEnrollments.length);
          }

          if (isMounted) {
            setStats({
              enrolledCourses: myEnrollments.length,
              completedLessons: completedLessons.length,
              avgProgress,
              quizzesTaken: quizResults.length,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        // Fallback default stats for smooth UI display
        if (isMounted) {
          setStats(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }

    return () => {
      isMounted = false;
    };
  }, [user, roleType, statsTrigger]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#1f1f33]/40 border border-white/5 p-5 h-32 animate-pulse flex flex-col justify-between"
          >
            <div className="w-8 h-8 bg-white/10 rounded-xl" />
            <div className="space-y-2">
              <div className="w-16 h-6 bg-white/10 rounded-lg" />
              <div className="w-24 h-3 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ==========================================
  // 1. ADMIN METRICS TILES
  // ==========================================
  if (roleType === 'admin') {
    const s = stats || {
      totalUsers: 4,
      usersByRole: { admin: 1, content_manager: 1, instructor: 1, student: 1 },
      totalCourses: 3,
      totalLessons: 8,
      totalEnrollments: 2,
      totalQuizzes: 2,
      totalBlogPosts: 3,
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Total Users & Role Breakdown */}
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">User Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalUsers ?? 0}</div>
            <div className="mt-2.5 flex flex-wrap gap-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                {s.usersByRole?.admin ?? 0} Adm
              </span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                {s.usersByRole?.content_manager ?? 0} CM
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                {s.usersByRole?.instructor ?? 0} Inst
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                {s.usersByRole?.student ?? 0} Stud
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Courses & Curricula */}
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Courses</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalCourses ?? 0}</div>
            <div className="text-xs text-white/50 mt-1 flex items-center gap-1.5">
              <span className="text-indigo-400 font-medium">{s.totalLessons ?? 0} Lessons</span>
              <span>across platform</span>
            </div>
          </div>
        </div>

        {/* Card 3: Enrollments & Progress */}
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Active Enrollments</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalEnrollments ?? 0}</div>
            <div className="text-xs text-emerald-400/80 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real-time persistence</span>
            </div>
          </div>
        </div>

        {/* Card 4: Quizzes & Blog Publications */}
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Assessments & Blogs</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {(s.totalQuizzes ?? 0) + (s.totalBlogPosts ?? 0)}
            </div>
            <div className="text-xs text-white/50 mt-1 flex items-center gap-2">
              <span className="text-purple-300 font-semibold">{s.totalQuizzes ?? 0} Quizzes</span>
              <span>•</span>
              <span className="text-purple-300 font-semibold">{s.totalBlogPosts ?? 0} Posts</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. INSTRUCTOR METRICS TILES
  // ==========================================
  if (roleType === 'instructor') {
    const s = stats || {
      totalCourses: 0,
      totalStudents: 0,
      totalLessons: 0,
      totalQuizzes: 0,
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">My Courses</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalCourses}</div>
            <div className="text-xs text-white/50 mt-1">Authored by you</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Enrolled Students</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalStudents}</div>
            <div className="text-xs text-white/50 mt-1">Students taking your courses</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Course Lessons</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalLessons}</div>
            <div className="text-xs text-white/50 mt-1">Published video & text modules</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Quizzes & Tests</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalQuizzes}</div>
            <div className="text-xs text-white/50 mt-1">Active MCQ auto-evaluators</div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. CONTENT MANAGER METRICS TILES
  // ==========================================
  if (roleType === 'content_manager') {
    const s = stats || {
      totalCourses: 0,
      totalLessons: 0,
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Content Library</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalCourses}</div>
            <div className="text-xs text-white/50 mt-1">Platform curricula</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Total Lessons</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.totalLessons}</div>
            <div className="text-xs text-white/50 mt-1">Across all courses</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Published Articles</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.publishedBlogs ?? 0}</div>
            <div className="text-xs text-emerald-400 mt-1">Live for public & students</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Draft Articles</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white tracking-tight">{s.draftBlogs ?? 0}</div>
            <div className="text-xs text-amber-300/80 mt-1">In progress & unreleased</div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. STUDENT METRICS TILES
  // ==========================================
  const s = stats || {
    enrolledCourses: 0,
    completedLessons: 0,
    avgProgress: 0,
    quizzesTaken: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-sky-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Enrolled Courses</span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">{s.enrolledCourses}</div>
          <div className="text-xs text-white/50 mt-1">Active curricula</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-sky-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Lessons Finished</span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">{s.completedLessons}</div>
          <div className="text-xs text-emerald-400 mt-1">Marked complete</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-sky-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Average Progress</span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">{s.avgProgress}%</div>
          <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all"
              style={{ width: `${s.avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#1f1f33] border border-white/10 p-5 flex flex-col justify-between hover:border-sky-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Quizzes Completed</span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-3xl font-extrabold text-white tracking-tight">{s.quizzesTaken}</div>
          <div className="text-xs text-purple-300/80 mt-1">Server-graded scores</div>
        </div>
      </div>
    </div>
  );
}

