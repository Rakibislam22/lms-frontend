'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  Award,
  Clock,
  Sparkles,
  Search,
  ArrowRight,
  Check,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function StudentWorkspace({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizResults, setQuizResults] = useState([]);
  const [lessonProgresses, setLessonProgresses] = useState([]);

  const fetchEnrollmentsAndResults = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [enrRes, qrRes, progRes] = await Promise.all([
        api.get(`/api/enrollments?filters[student][id][$eq]=${user.id}&populate[course][populate]=*&sort=updatedAt:desc`),
        api.get(`/api/quiz-results?filters[student][id][$eq]=${user.id}&populate=quiz&sort=createdAt:desc`),
        api.get(`/api/lesson-progresses?filters[student][id][$eq]=${user.id}&populate=*`),
      ]);

      setEnrollments(enrRes.data?.data || []);
      setQuizResults(qrRes.data?.data || []);
      setLessonProgresses(progRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load student learning data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentsAndResults();
  }, [user]);

  // Derive verified completed lesson IDs set from server records
  const completedLessonIdSet = new Set();
  (lessonProgresses || []).forEach((p) => {
    const attrs = p.attributes || p;
    if (attrs.completed === true || attrs.isCompleted === true) {
      const l = attrs.lesson?.data?.attributes || attrs.lesson?.data || attrs.lesson;
      if (l?.id) completedLessonIdSet.add(l.id);
      if (l?.documentId) completedLessonIdSet.add(l.documentId);
      if (typeof l === 'number') completedLessonIdSet.add(l);
    }
  });

  return (
    <div className="space-y-8">
      {/* 1. Spotlight Banner: Continue Most Recent Course */}
      {enrollments.length > 0 && (() => {
        const topEnr = enrollments[0];
        const topCourse = topEnr.course?.data?.attributes || topEnr.course || {};
        const topCourseId = topEnr.course?.id || topEnr.course?.data?.id || topCourse.id;
        let pct = topEnr.progressPercent ?? topEnr.attributes?.progressPercent ?? 0;
        const topCourseLessons = Array.isArray(topCourse.lessons)
          ? topCourse.lessons
          : topCourse.lessons?.data || [];
        const topLessonsCount = topCourseLessons.length;

        const topDoneCount = topCourseLessons.filter(
          (l) => completedLessonIdSet.has(l.id) || (l.documentId && completedLessonIdSet.has(l.documentId))
        ).length;

        if (topLessonsCount > 0 && topDoneCount > 0) {
          pct = Math.max(pct, Math.min(100, Math.round((topDoneCount / topLessonsCount) * 100)));
        }

        if (typeof window !== 'undefined' && user?.id && topCourseId) {
          try {
            const cached = localStorage.getItem(`learnsphere_completed_${user.id}_${topCourseId}`);
            if (cached) {
              const ids = JSON.parse(cached);
              if (Array.isArray(ids) && topLessonsCount > 0) {
                const calculated = Math.min(100, Math.round((ids.length / topLessonsCount) * 100));
                pct = Math.max(pct, calculated);
              }
            }
          } catch {}
        }

        return (
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/40 via-[#1f1f33] to-[#181826] border border-white/15 p-6 sm:p-8 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resume Active Curriculum</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {topCourse.title || 'Enrolled Course'}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 max-w-xl line-clamp-2">
                  {topCourse.description || 'Open the learning material studio to watch video lectures, review notes, and complete quizzes.'}
                </p>
              </div>

              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">{pct}%</div>
                  <div className="text-[11px] text-white/50">Completed</div>
                </div>

                <Link
                  href={`/dashboard/courses/${topCourseId}`}
                  className="px-5 py-3 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-lg shadow-white/10 flex items-center gap-2 active:scale-95"
                >
                  <PlayCircle className="w-4 h-4 text-indigo-600" />
                  <span>Open Learning Material</span>
                </Link>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. All Enrolled Courses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">My Enrolled Courses</h3>
            <p className="text-xs text-white/50">
              Click any course card to open the complete learning material in a dedicated nested page.
            </p>
          </div>
          <Link
            href="/courses"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse More Courses</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/40 border border-dashed border-white/10 space-y-4">
            <BookOpen className="w-10 h-10 text-white/30 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-white">You haven&apos;t enrolled in any courses yet</h4>
              <p className="text-xs text-white/50 max-w-sm mx-auto mt-1">
                Explore our catalog to enroll in guided paths, video lessons, and interactive quizzes.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
            >
              <span>Explore Course Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enr) => {
              const course = enr.course?.data?.attributes || enr.course || {};
              const courseId = enr.course?.id || enr.course?.data?.id || course.id;
              let progressPercent = enr.progressPercent ?? enr.attributes?.progressPercent ?? 0;
              const courseLessons = Array.isArray(course.lessons)
                ? course.lessons
                : course.lessons?.data || [];
              const lessonsCount = courseLessons.length;

              const doneCount = lessonsCount > 0
                ? courseLessons.filter(
                    (l) => completedLessonIdSet.has(l.id) || (l.documentId && completedLessonIdSet.has(l.documentId))
                  ).length
                : 0;

              if (lessonsCount > 0 && doneCount > 0) {
                progressPercent = Math.max(
                  progressPercent,
                  Math.min(100, Math.round((doneCount / lessonsCount) * 100))
                );
              }

              if (typeof window !== 'undefined' && user?.id && courseId) {
                try {
                  const cached = localStorage.getItem(`learnsphere_completed_${user.id}_${courseId}`);
                  if (cached) {
                    const ids = JSON.parse(cached);
                    if (Array.isArray(ids) && lessonsCount > 0) {
                      const calculated = Math.min(100, Math.round((ids.length / lessonsCount) * 100));
                      progressPercent = Math.max(progressPercent, calculated);
                    }
                  }
                } catch { }
              }

              return (
                <div
                  key={enr.id}
                  className="group rounded-2xl bg-[#1f1f33] border border-white/10 hover:border-white/20 p-5 sm:p-6 transition-all shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        Active Track
                      </span>
                      {progressPercent === 100 && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {course.title || 'Untitled Course'}
                    </h4>

                    {course.description && (
                      <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>

                  {/* Progress bar info & Open Learning Material button */}
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40 text-[11px]">Completion</span>
                        <span className="font-bold text-white">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#181826] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100
                              ? 'bg-emerald-400'
                              : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                            }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-white/40 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-white/30" />
                        <span>{lessonsCount} {lessonsCount === 1 ? 'Lesson' : 'Lessons'}</span>
                      </span>

                      <Link
                        href={`/dashboard/courses/${courseId}`}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-sm group-hover:shadow-white/10"
                      >
                        <span>Open Learning Material</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Quiz Score History */}
      {quizResults.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Assessment Results</h3>
            <p className="text-xs text-white/50">Your server-graded quiz submissions and persistent score history.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quizResults.map((result) => {
              const rAttrs = result.attributes || result;
              const quiz = rAttrs.quiz?.data?.attributes || rAttrs.quiz || {};
              const score = rAttrs.score ?? 0;
              const total = rAttrs.totalQuestions ?? 1;
              const percent = Math.round((score / (total || 1)) * 100);

              return (
                <div
                  key={result.id}
                  className="p-4 rounded-2xl bg-[#1f1f33] border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white line-clamp-1">{quiz.title || 'Course Quiz'}</span>
                    <span className="text-emerald-400 font-bold">{percent}%</span>
                  </div>
                  <div className="text-[11px] text-white/50 flex items-center justify-between">
                    <span>Score: {score} of {total}</span>
                    <span>Passed ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
