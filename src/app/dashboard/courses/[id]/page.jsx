'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LessonManagerModal from '@/components/dashboard/LessonManagerModal';
import QuizManagerModal from '@/components/dashboard/QuizManagerModal';
import QuizRunnerModal from '@/components/dashboard/QuizRunnerModal';
import CourseModal from '@/components/dashboard/CourseModal';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { confirmDelete } from '@/lib/alerts';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Circle,
  Play,
  FileText,
  Award,
  Users,
  PlusCircle,
  Edit3,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(ytRegex);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function CourseDetailPage({ params }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useAuth();
  const router = useRouter();

  const roleType = user?.role?.type || 'student';
  const isStudent = roleType === 'student';

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [quizResults, setQuizResults] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Modals for Educator
  const [isLessonManagerOpen, setIsLessonManagerOpen] = useState(false);
  const [isQuizManagerOpen, setIsQuizManagerOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);

  // Modal for Student Quiz Runner
  const [activeQuizToRun, setActiveQuizToRun] = useState(null);

  // Active Educator Tab
  const [educatorTab, setEducatorTab] = useState('curriculum'); // 'curriculum' | 'quizzes' | 'students'

  const fetchAllData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Fetch Course details (supports Strapi 5 numeric id and documentId)
      let courseData = null;
      const isNumeric = /^\d+$/.test(String(courseId));

      if (isNumeric) {
        const filterRes = await api.get(`/api/courses?filters[id][$eq]=${courseId}&populate=*`);
        courseData = filterRes.data?.data?.[0] || null;
      } else {
        try {
          const directRes = await api.get(`/api/courses/${courseId}?populate=*`);
          courseData = directRes.data?.data || null;
        } catch (err) {
          if (err.response?.status === 404) {
            const filterRes = await api.get(`/api/courses?filters[documentId][$eq]=${courseId}&populate=*`);
            courseData = filterRes.data?.data?.[0] || null;
          } else {
            throw err;
          }
        }
      }

      // Fallback lookup if not yet found
      if (!courseData) {
        try {
          const filterRes = await api.get(`/api/courses?filters[documentId][$eq]=${courseId}&populate=*`);
          courseData = filterRes.data?.data?.[0] || null;
        } catch { }
      }

      if (!courseData) {
        throw new Error('Course not found');
      }

      setCourse(courseData);
      const actualCourseId = courseData.id;

      // 2. Fetch Lessons for this course
      const lessonsRes = await api.get(
        `/api/lessons?filters[course][id][$eq]=${actualCourseId}&sort=order:asc`
      );
      const fetchedLessons = lessonsRes.data?.data || [];
      setLessons(fetchedLessons);

      if (fetchedLessons.length > 0 && !activeLesson) {
        setActiveLesson(fetchedLessons[0]);
      }

      // 3. Fetch Quizzes for this course
      const quizzesRes = await api.get(
        `/api/quizzes?filters[course][id][$eq]=${actualCourseId}&populate=*`
      );
      setQuizzes(quizzesRes.data?.data || []);

      if (isStudent && user) {
        // 4. Fetch Student Enrollment
        let userEnrollment = null;
        try {
          const enrollRes = await api.get(
            `/api/enrollments?filters[student][id][$eq]=${user.id}&filters[course][id][$eq]=${actualCourseId}&populate=*`
          );
          userEnrollment = enrollRes.data?.data?.[0] || null;

          if (!userEnrollment && courseData.documentId) {
            const enrollByDocRes = await api.get(
              `/api/enrollments?filters[student][id][$eq]=${user.id}&filters[course][documentId][$eq]=${courseData.documentId}&populate=*`
            );
            userEnrollment = enrollByDocRes.data?.data?.[0] || null;
          }
        } catch (e) {
          console.warn('Failed to fetch enrollment:', e);
        }
        setEnrollment(userEnrollment);

        // 5. Fetch Student Lesson Progresses with full population
        let userLessonProgresses = [];
        try {
          const progRes = await api.get(
            `/api/lesson-progresses?filters[student][id][$eq]=${user.id}&populate=*`
          );
          userLessonProgresses = progRes.data?.data || [];
        } catch (err) {
          console.warn('Failed to fetch lesson progresses from API:', err);
        }

        const completed = new Set();
        const currentCourseLessonIds = new Set(fetchedLessons.map((l) => l.id));

        // Populate from server records
        userLessonProgresses.forEach((p) => {
          const attrs = p.attributes || p;
          const isComp = attrs.completed === true || attrs.isCompleted === true;
          if (isComp) {
            const lData = attrs.lesson?.data?.attributes || attrs.lesson?.data || attrs.lesson;
            const lId = lData?.id ?? (typeof lData === 'number' ? lData : null);

            if (lId && (currentCourseLessonIds.has(lId) || currentCourseLessonIds.size === 0)) {
              completed.add(lId);
            }
          }
        });

        // Also check localStorage cache fallback
        const cacheKey = `learnsphere_completed_${user.id}_${actualCourseId}`;
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) {
              parsed.forEach((id) => {
                if (currentCourseLessonIds.has(id)) {
                  completed.add(id);
                }
              });
            }
          }
        } catch { }

        // Keep local cache clean with only verified course lesson IDs
        const validIds = fetchedLessons.filter((l) => completed.has(l.id)).map((l) => l.id);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(validIds));
        } catch { }

        setCompletedLessonIds(completed);

        // 6. Fetch Student Quiz Results
        const resultsRes = await api.get(
          `/api/quiz-results?filters[student][id][$eq]=${user.id}&filters[quiz][course][id][$eq]=${actualCourseId}&populate=*`
        );
        setQuizResults(resultsRes.data?.data || []);
      } else if (!isStudent) {
        // 7. For Educator: Fetch Enrolled Students for this course
        try {
          const enrollmentsRes = await api.get(
            `/api/enrollments?filters[course][id][$eq]=${actualCourseId}&populate=student`
          );
          setEnrolledStudents(enrollmentsRes.data?.data || []);
        } catch {
          // If forbidden, continue gracefully
        }
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId && user) {
      fetchAllData();
    }
  }, [courseId, user]);

  // Educator: Delete Course
  const handleDeleteCurrentCourse = async () => {
    const isConfirmed = await confirmDelete({
      title: 'Delete Course?',
      text: 'Are you sure you want to permanently delete this course and its entire curriculum? This cannot be undone.',
      confirmText: 'Yes, delete course',
    });
    if (!isConfirmed) return;

    try {
      const targetId = course?.documentId || course?.id || courseId;
      await api.delete(`/api/courses/${targetId}`);
      toast.success('Course deleted successfully.');
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to delete course:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete course.');
    }
  };

  // Student: Toggle Lesson Completion
  const handleToggleLessonComplete = async (lessonId) => {
    if (!user || !course) return;
    const actualCourseId = course.id;
    const isCurrentlyDone = completedLessonIds.has(lessonId);
    const nextStatus = !isCurrentlyDone;

    // Optimistically update local completed set
    const nextCompleted = new Set(completedLessonIds);
    if (nextStatus) {
      nextCompleted.add(lessonId);
    } else {
      nextCompleted.delete(lessonId);
    }
    setCompletedLessonIds(nextCompleted);

    // Save strictly valid course lesson IDs to local cache
    const validIds = lessons.filter((l) => nextCompleted.has(l.id)).map((l) => l.id);
    const cacheKey = `learnsphere_completed_${user.id}_${actualCourseId}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(validIds));
    } catch { }

    // Calculate new percentage based on completed lessons
    const newPct = lessons.length > 0 ? Math.min(100, Math.round((validIds.length / lessons.length) * 100)) : 0;

    // Optimistically update enrollment state
    if (enrollment) {
      setEnrollment((prev) => ({
        ...prev,
        progressPercent: newPct,
        attributes: {
          ...(prev?.attributes || {}),
          progressPercent: newPct,
        },
      }));
    }

    setSavingProgress(true);
    try {
      // 1. Post lesson progress to Strapi
      await api.post('/api/lesson-progresses', {
        data: {
          student: user.id,
          lesson: lessonId,
          completed: nextStatus,
        },
      });

      // 2. Ensure enrollment exists or update its percentage
      if (enrollment) {
        const enrollId = enrollment.documentId || enrollment.id;
        try {
          await api.put(`/api/enrollments/${enrollId}`, {
            data: { progressPercent: newPct },
          });
        } catch { }
      } else {
        try {
          const newEnrRes = await api.post('/api/enrollments', {
            data: {
              student: user.id,
              course: actualCourseId,
              progressPercent: newPct,
            },
          });
          if (newEnrRes.data?.data) {
            setEnrollment(newEnrRes.data.data);
          }
        } catch { }
      }

      // 3. Refresh enrollment from server
      const enrollRes = await api.get(
        `/api/enrollments?filters[student][id][$eq]=${user.id}&filters[course][id][$eq]=${actualCourseId}&populate=*`
      );
      if (enrollRes.data?.data?.[0]) {
        setEnrollment(enrollRes.data.data[0]);
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Student: Self-Enroll if not yet enrolled
  const handleEnrollNow = async () => {
    if (!course) return;
    const actualCourseId = course.id;
    try {
      setSavingProgress(true);
      await api.post('/api/enrollments', {
        data: {
          student: user.id,
          course: actualCourseId,
          progressPercent: 0,
        },
      });
      await fetchAllData();
    } catch (err) {
      console.error('Failed to enroll:', err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleCloseQuizModal = (result) => {
    if (result && activeQuizToRun) {
      const enrichedResult = {
        ...result,
        quiz: activeQuizToRun,
      };
      setQuizResults((prev) => {
        const filtered = prev.filter(
          (r) =>
            (r.attributes?.quiz?.id || r.quiz?.id || (typeof r.quiz === 'number' ? r.quiz : null)) !== activeQuizToRun.id &&
            (r.attributes?.quiz?.documentId || r.quiz?.documentId) !== activeQuizToRun.documentId
        );
        return [enrichedResult, ...filtered];
      });
      // Fetch fresh data in the background silently without unmounting the UI
      fetchAllData(true);
    }
    setActiveQuizToRun(null);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-sm text-white/50 font-medium tracking-wide">Loading course material...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Course Not Found</h2>
          <p className="text-sm text-white/50">This course could not be located or you lack permissions to view it.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const courseAttrs = course.attributes || course;

  const completedLessonsCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;

  const calculatedPercent = lessons.length > 0
    ? Math.min(100, Math.round((completedLessonsCount / lessons.length) * 100))
    : 0;

  const progressPercent = calculatedPercent;

  const currentLessonIdx = lessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIdx > 0 ? lessons[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx < lessons.length - 1 ? lessons[currentLessonIdx + 1] : null;
  const isLessonDone = activeLesson ? completedLessonIds.has(activeLesson.id) : false;

  const activeLessonAttrs = activeLesson ? activeLesson.attributes || activeLesson : null;
  const youtubeEmbed = activeLessonAttrs?.videoUrl
    ? getYouTubeEmbedUrl(activeLessonAttrs.videoUrl)
    : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#181826] text-white pb-20">
        {/* Top Sticky Navigation Bar */}
        <div className="sticky top-18 z-40 bg-[#181826]/90 backdrop-blur-md ">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                  {courseAttrs.title}
                </h2>
                <span className="text-[11px] text-white/50">
                  {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'} • {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
                </span>
              </div>
            </div>

            {/* Right Header Status / Action */}
            {isStudent ? (
              enrollment ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-[#1f1f33] px-3.5 py-1.5 rounded-xl border border-white/10">
                    <div className="w-24 sm:w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{progressPercent}%</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleEnrollNow}
                  disabled={savingProgress}
                  className="px-4 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
                >
                  Enroll to Start Learning
                </button>
              )
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLessonManagerOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Add Lesson</span>
                </button>

                <button
                  onClick={() => setIsQuizManagerOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1f1f33] text-white font-medium text-xs border border-white/10 hover:bg-[#262640] transition-all"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage Quiz</span>
                </button>

                <button
                  onClick={() => setIsEditCourseOpen(true)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                  title="Edit Course Metadata"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleDeleteCurrentCourse}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VIEW A: STUDENT LEARNING STUDIO */}
        {isStudent ? (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {!enrollment ? (
              <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/70 border border-white/10 space-y-4 max-w-2xl mx-auto my-12 backdrop-blur-xl">
                <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Enroll to Access Curriculum</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  {courseAttrs.description || 'Join this course to unlock structured video lessons, track your progress sequentially, and take auto-graded quizzes.'}
                </p>
                <button
                  onClick={handleEnrollNow}
                  disabled={savingProgress}
                  className="px-6 py-3 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-lg shadow-white/10"
                >
                  {savingProgress ? 'Enrolling...' : 'Enroll in Course (Free)'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 1. Left Viewport: Active Lesson Material (Cols 8) */}
                <div className="lg:col-span-8 space-y-6">
                  {activeLesson ? (
                    <>
                      {/* Video Player Box */}
                      <div className="rounded-3xl bg-[#1f1f33] border border-white/10 overflow-hidden shadow-2xl">
                        {youtubeEmbed ? (
                          <div className="aspect-video w-full">
                            <iframe
                              src={youtubeEmbed}
                              title={activeLessonAttrs.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-full border-0"
                            />
                          </div>
                        ) : activeLessonAttrs?.videoUrl ? (
                          <div className="aspect-video w-full bg-black">
                            <video
                              src={activeLessonAttrs.videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="p-12 text-center space-y-3 bg-gradient-to-br from-[#1f1f33] to-[#262640]">
                            <Play className="w-12 h-12 text-indigo-400/50 mx-auto" />
                            <h4 className="text-base font-bold text-white">Lecture Notes & Guide</h4>
                            <p className="text-xs text-white/50 max-w-md mx-auto">
                              This lesson is a text and concept reading session. Review the lecture notes below.
                            </p>
                          </div>
                        )}

                        {/* Lesson Header & Controls Bar */}
                        <div className="p-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                              Lesson {activeLessonAttrs?.order || currentLessonIdx + 1} of {lessons.length}
                            </span>
                            <h2 className="text-lg sm:text-xl font-extrabold text-white">
                              {activeLessonAttrs?.title}
                            </h2>
                          </div>

                          {/* Complete Lesson Toggle Button */}
                          <button
                            onClick={() => handleToggleLessonComplete(activeLesson.id)}
                            disabled={savingProgress}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 shrink-0 ${isLessonDone
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white text-[#181826] hover:bg-white/90 shadow-white/10'
                              }`}
                          >
                            {isLessonDone ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span>Completed ✓</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4 text-[#181826]" />
                                <span>Mark Complete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Lesson Notes & Content */}
                      <div className="p-6 rounded-3xl bg-[#1f1f33]/60 border border-white/10 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/70 uppercase tracking-wider">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>Lecture Notes & Details</span>
                        </div>
                        <div className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line font-sans">
                          {activeLessonAttrs?.content || 'No extra notes provided for this lesson.'}
                        </div>
                      </div>

                      {/* Bottom Navigation Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        {prevLesson ? (
                          <button
                            onClick={() => setActiveLesson(prevLesson)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous: {prevLesson.attributes?.title || prevLesson.title}</span>
                          </button>
                        ) : <div />}

                        {nextLesson ? (
                          <button
                            onClick={() => setActiveLesson(nextLesson)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
                          >
                            <span>Next: {nextLesson.attributes?.title || nextLesson.title}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : quizzes.length > 0 ? (
                          <button
                            onClick={() => setActiveQuizToRun(quizzes[0])}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#181826] text-xs font-bold shadow-md transition-all"
                          >
                            <Award className="w-4 h-4" />
                            <span>Take Course Assessment</span>
                          </button>
                        ) : <div />}
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/60 border border-dashed border-white/10">
                      <BookOpen className="w-10 h-10 text-white/30 mx-auto mb-2" />
                      <h4 className="text-base font-bold text-white">No lessons in this course yet</h4>
                      <p className="text-xs text-white/50">The instructor has not added any lessons to this course.</p>
                    </div>
                  )}
                </div>

                {/* 2. Right Viewport: Curriculum Navigation Drawer (Cols 4) */}
                <div className="lg:col-span-4 space-y-5">
                  <div className="rounded-3xl bg-[#1f1f33]/70 border border-white/10 p-5 backdrop-blur-xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-sky-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Course Curriculum</h3>
                      </div>
                      <span className="text-xs font-mono text-white/50">
                        {completedLessonsCount}/{lessons.length} Done
                      </span>
                    </div>

                    {/* Lesson Index List */}
                    <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                      {lessons.map((lesson, idx) => {
                        const lAttrs = lesson.attributes || lesson;
                        const isDone = completedLessonIds.has(lesson.id);
                        const isSelected = activeLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${isSelected
                              ? 'bg-indigo-500/20 text-white border-indigo-500/50 shadow-md shadow-indigo-500/10'
                              : isDone
                                ? 'bg-[#181826] text-white/80 border-white/5 hover:border-white/15'
                                : 'bg-[#181826] text-white/60 border-white/5 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center font-mono text-[10px] text-white/50 shrink-0">
                                {idx + 1}
                              </span>
                              <span className="font-medium line-clamp-1">{lAttrs.title}</span>
                            </div>

                            <div className="shrink-0">
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-white/20" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quizzes Segment in Sidebar */}
                    {quizzes.length > 0 && (
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                          <Award className="w-4 h-4" />
                          <span>Assessments & Quizzes</span>
                        </div>

                        {quizzes.map((quiz) => {
                          const qAttrs = quiz.attributes || quiz;
                          const previousResult = quizResults.find(
                            (r) =>
                              (r.attributes?.quiz?.id || r.quiz?.id || (typeof r.quiz === 'number' ? r.quiz : null)) === quiz.id ||
                              (r.attributes?.quiz?.documentId || r.quiz?.documentId) === quiz.documentId
                          );
                          const prevScore = previousResult
                            ? previousResult.attributes?.score ?? previousResult.score ?? null
                            : null;
                          const prevTotal = previousResult
                            ? previousResult.attributes?.totalQuestions ?? previousResult.totalQuestions ?? null
                            : null;

                          return (
                            <div
                              key={quiz.id}
                              className="p-3.5 rounded-xl bg-[#181826] border border-amber-500/20 flex items-center justify-between gap-3"
                            >
                              <div>
                                <div className="text-xs font-bold text-white">{qAttrs.title}</div>
                                {prevScore !== null ? (
                                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                                    Last Score: {prevScore}/{prevTotal} ({Math.round((prevScore / (prevTotal || 1)) * 100)}%)
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-white/40 mt-0.5">Auto-graded evaluation</div>
                                )}
                              </div>

                              <button
                                onClick={() => setActiveQuizToRun(quiz)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-[#181826] font-bold text-xs shrink-0 transition-all"
                              >
                                {prevScore !== null ? 'Retake' : 'Start'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW B: EDUCATOR (INSTRUCTOR / ADMIN / CONTENT MANAGER) WORKSPACE */
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
            {/* Educator Subtabs (Responsive Navigation) */}
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mb-1">
                <button
                  onClick={() => setEducatorTab('curriculum')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${educatorTab === 'curriculum'
                    ? 'bg-white text-[#181826]'
                    : 'bg-[#1f1f33] text-white/60 hover:text-white border border-white/5'
                    }`}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Curriculum & Lessons ({lessons.length})</span>
                  <span className="sm:hidden">Curriculum ({lessons.length})</span>
                </button>

                <button
                  onClick={() => setEducatorTab('quizzes')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${educatorTab === 'quizzes'
                    ? 'bg-white text-[#181826]'
                    : 'bg-[#1f1f33] text-white/60 hover:text-white border border-white/5'
                    }`}
                >
                  <Award className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">MCQ Quizzes ({quizzes.length})</span>
                  <span className="sm:hidden">Quizzes ({quizzes.length})</span>
                </button>

                <button
                  onClick={() => setEducatorTab('students')}
                  className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${educatorTab === 'students'
                    ? 'bg-white text-[#181826]'
                    : 'bg-[#1f1f33] text-white/60 hover:text-white border border-white/5'
                    }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Enrolled Students ({enrolledStudents.length})</span>
                  <span className="sm:hidden">Students ({enrolledStudents.length})</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CURRICULUM */}
            {educatorTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/60">
                    Construct the course syllabus. Lessons will be presented sequentially to enrolled students.
                  </p>
                  <button
                    onClick={() => setIsLessonManagerOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add New Lesson</span>
                  </button>
                </div>

                {lessons.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/60 border border-dashed border-white/10 space-y-3">
                    <Layers className="w-10 h-10 text-white/30 mx-auto" />
                    <h4 className="text-base font-bold text-white">No lessons in this course yet</h4>
                    <p className="text-xs text-white/50 max-w-sm mx-auto">
                      Click the &quot;Add New Lesson&quot; button above to begin structuring lessons and video lectures.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, idx) => {
                      const lAttrs = lesson.attributes || lesson;
                      return (
                        <div
                          key={lesson.id}
                          className="p-4 rounded-2xl bg-[#1f1f33] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs text-white/70 shrink-0">
                              #{idx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-white">{lAttrs.title}</h4>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/40 mt-1">
                                {lAttrs.videoUrl ? (
                                  <span className="text-indigo-400 flex items-center gap-1">
                                    <Play className="w-3 h-3" /> Video Attached
                                  </span>
                                ) : (
                                  <span className="text-white/40">Text Lecture Only</span>
                                )}
                                <span>•</span>
                                <span>Order: {lAttrs.order || idx + 1}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setIsLessonManagerOpen(true)}
                              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold border border-white/10 transition-all"
                            >
                              Manage in Curriculum
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: MCQ QUIZZES */}
            {educatorTab === 'quizzes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-white/60">
                    Create multiple-choice auto-graded assessments for students to evaluate their mastery.
                  </p>
                  <button
                    onClick={() => setIsQuizManagerOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#181826] font-bold text-xs transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Create New Quiz</span>
                  </button>
                </div>

                {quizzes.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/60 border border-dashed border-white/10 space-y-3">
                    <Award className="w-10 h-10 text-amber-400/40 mx-auto" />
                    <h4 className="text-base font-bold text-white">No quizzes attached to this course</h4>
                    <p className="text-xs text-white/50 max-w-sm mx-auto">
                      Assess student understanding by creating auto-evaluated MCQ tests with questions and answer keys.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => {
                      const qAttrs = quiz.attributes || quiz;
                      const questionsList = Array.isArray(qAttrs.questions)
                        ? qAttrs.questions
                        : qAttrs.questions?.data || [];

                      return (
                        <div
                          key={quiz.id}
                          className="p-5 rounded-2xl bg-[#1f1f33] border border-white/10 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                                Assessment
                              </span>
                              <h4 className="text-base font-bold text-white mt-0.5">{qAttrs.title}</h4>
                            </div>
                            <button
                              onClick={() => setIsQuizManagerOpen(true)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold"
                            >
                              Edit Questions
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-white/50 pt-2 border-t border-white/5">
                            <span>{questionsList.length} Questions</span>
                            <span>•</span>
                            <span>Immediate auto-scoring</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ENROLLED STUDENTS */}
            {educatorTab === 'students' && (
              <div className="space-y-4">
                <p className="text-xs text-white/60">
                  Track the real-time completion percentages of learners enrolled in this specific course.
                </p>

                {enrolledStudents.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl bg-[#1f1f33]/60 border border-dashed border-white/10 space-y-3">
                    <Users className="w-10 h-10 text-white/30 mx-auto" />
                    <h4 className="text-base font-bold text-white">No student enrollments yet</h4>
                    <p className="text-xs text-white/50">Students will appear here once they register and enroll in this course.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#1f1f33] border border-white/10 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-white/60 border-b border-white/10 font-bold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="px-5 py-3">Student</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Course Completion</th>
                            <th className="px-5 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {enrolledStudents.map((enrollmentItem) => {
                            const eAttrs = enrollmentItem.attributes || enrollmentItem;
                            const student = eAttrs.student?.data?.attributes || eAttrs.student || {};
                            const pct = eAttrs.progressPercent ?? 0;

                            return (
                              <tr key={enrollmentItem.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-3.5 font-bold text-white">
                                  {student.username || 'Student'}
                                </td>
                                <td className="px-5 py-3.5 text-white/60 font-mono">
                                  {student.email || 'N/A'}
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                    <span className="font-bold text-white">{pct}%</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pct >= 100
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    }`}>
                                    {pct >= 100 ? 'Finished' : 'In Progress'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modals for Educator Management */}
        <LessonManagerModal
          isOpen={isLessonManagerOpen}
          onClose={() => setIsLessonManagerOpen(false)}
          course={course}
          onLessonsUpdated={fetchAllData}
        />

        <QuizManagerModal
          isOpen={isQuizManagerOpen}
          onClose={() => setIsQuizManagerOpen(false)}
          course={course}
          onQuizzesUpdated={fetchAllData}
        />

        <CourseModal
          isOpen={isEditCourseOpen}
          onClose={() => setIsEditCourseOpen(false)}
          course={course}
          onSaved={fetchAllData}
        />

        {/* Student Quiz Runner Modal */}
        {activeQuizToRun && (
          <QuizRunnerModal
            isOpen={!!activeQuizToRun}
            onClose={handleCloseQuizModal}
            quiz={activeQuizToRun}
            studentId={user?.id}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

