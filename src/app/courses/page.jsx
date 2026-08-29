'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  Users,
  LayoutDashboard
} from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isStudent = user?.role?.type === 'student';

  const loadData = async () => {
    setLoading(true);
    try {
      const coursesRes = await api.get('/api/courses?populate=*&sort=createdAt:desc');
      setCourses(coursesRes.data?.data || []);

      if (user && isStudent) {
        const enrollmentsRes = await api.get(
          `/api/enrollments?filters[student][id][$eq]=${user.id}&populate=course`
        );
        const ids = (enrollmentsRes.data?.data || []).map((e) => e.course?.id);
        setEnrolledIds(ids);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!isStudent) {
      alert('Only students can enroll in courses per platform access rules.');
      return;
    }

    setEnrollingId(courseId);
    try {
      await api.post('/api/enrollments', {
        data: {
          student: user.id,
          course: courseId,
          progressPercent: 0,
        },
      });
      router.push(`/dashboard/courses/${courseId}`);
    } catch (err) {
      console.error('Enrollment failed:', err);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const attrs = c.attributes || c;
    const title = attrs.title || '';
    const desc = attrs.description || '';
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <main className="min-h-screen bg-[#181826] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Curriculum Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Courses & Curricula
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">
              Browse interactive tracks featuring video lessons, documentation, and instant server-evaluated MCQ quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {user && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#1f1f33]/40 border border-dashed border-white/10 space-y-3">
            <BookOpen className="w-10 h-10 text-white/30 mx-auto" />
            <h3 className="text-base font-bold text-white">No courses match your query</h3>
            <p className="text-xs text-white/50">Try clearing your search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const attrs = course.attributes || course;
              const isEnrolled = enrolledIds.includes(course.id);
              const lessonsCount = Array.isArray(attrs.lessons)
                ? attrs.lessons.length
                : attrs.lessons?.data?.length || 0;
              const ownerName =
                attrs.owner?.username ||
                attrs.owner?.data?.attributes?.username ||
                'Educator';

              return (
                <div
                  key={course.id}
                  className="rounded-2xl bg-[#1f1f33] border border-white/10 p-6 flex flex-col justify-between hover:border-white/20 transition-all group shadow-xl"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-white/5 text-white/80 border border-white/10">
                        Course
                      </span>

                      {isEnrolled && (
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Enrolled</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                      {attrs.title}
                    </h3>

                    {attrs.description && (
                      <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                        {attrs.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-white/50 pt-2">
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{lessonsCount} Modules</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-4">
                    <span className="text-xs text-white/40">By {ownerName}</span>

                    {isEnrolled ? (
                      <Link
                        href={`/dashboard/courses/${course.id}`}
                        className="px-4 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all flex items-center gap-1.5 shadow-sm shadow-white/10"
                      >
                        <span>Learn Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollingId === course.id}
                        className="px-4.5 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {enrollingId === course.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-[#181826] border-t-transparent rounded-full animate-spin" />
                            <span>Enrolling...</span>
                          </>
                        ) : (
                          <>
                            <span>Enroll Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
