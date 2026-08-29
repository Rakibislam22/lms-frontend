'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Award,
  Users,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import CourseModal from './CourseModal';
import LessonManagerModal from './LessonManagerModal';
import QuizManagerModal from './QuizManagerModal';

export default function CourseManagementTab({ user, onOpenCreateCourse, coursesTrigger }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState(null);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const roleType = user?.role?.type || 'student';
  const isInstructor = roleType === 'instructor';

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/courses?populate=*&sort=createdAt:desc';
      if (isInstructor) {
        endpoint = `/api/courses?filters[owner][id][$eq]=${user.id}&populate=*&sort=createdAt:desc`;
      }

      const res = await api.get(endpoint);
      setCourses(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, roleType, coursesTrigger]);

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to permanently delete this course and its curriculum?')) {
      return;
    }

    try {
      await api.delete(`/api/courses/${courseId}`);
      await fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert(err.response?.data?.error?.message || 'Failed to delete course.');
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
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Course & Curriculum Management</h2>
          <p className="text-xs text-white/50 mt-0.5">
            {isInstructor
              ? 'Manage curricula, sequential lessons, and MCQ quizzes for courses you own.'
              : 'Full catalog control: create, edit, add lessons, and publish quizzes across all curricula.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => {
              setEditingCourse(null);
              setIsCourseModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 shrink-0"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>New Course</span>
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1f1f33]/40 border border-dashed border-white/10 space-y-3">
          <BookOpen className="w-8 h-8 text-white/30 mx-auto" />
          <p className="text-sm font-semibold text-white/70">No courses available.</p>
          <p className="text-xs text-white/40">Click &quot;New Course&quot; above to initiate a learning track.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const attrs = course.attributes || course;
            const lessonsCount = Array.isArray(attrs.lessons)
              ? attrs.lessons.length
              : attrs.lessons?.data?.length || 0;
            const enrollmentsCount = Array.isArray(attrs.enrollments)
              ? attrs.enrollments.length
              : attrs.enrollments?.data?.length || 0;
            const ownerName =
              attrs.owner?.username ||
              attrs.owner?.data?.attributes?.username ||
              (isInstructor ? user.username : 'Educator');

            return (
              <div
                key={course.id}
                className="p-5 rounded-2xl bg-[#1f1f33] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all space-y-4 shadow-lg group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10">
                      Curriculum
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsCourseModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/dashboard/courses/${course.id}`}>
                    <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors leading-snug cursor-pointer">
                      {attrs.title}
                    </h3>
                  </Link>

                  {attrs.description && (
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {attrs.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-white/50 pt-1">
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Layers className="w-3.5 h-3.5" />
                      <span>{lessonsCount} Lessons</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{enrollmentsCount} Students</span>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-white/40 truncate">By {ownerName}</span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="px-3 py-1.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all flex items-center gap-1 shadow-sm"
                      title="Open full course hub with lessons, quizzes, and student roster"
                    >
                      <span>Open Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => setSelectedCourseForLessons(course)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center gap-1"
                      title="Add or edit course lessons"
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    </button>

                    <button
                      onClick={() => setSelectedCourseForQuiz(course)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold text-xs border border-purple-500/30 transition-colors flex items-center gap-1"
                      title="Build MCQ Quiz with auto-grading"
                    >
                      <Award className="w-3.5 h-3.5 text-purple-300" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Edit/Create Modal */}
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        course={editingCourse}
        onSaved={fetchCourses}
      />

      {/* Lesson Manager Modal */}
      <LessonManagerModal
        isOpen={!!selectedCourseForLessons}
        onClose={() => setSelectedCourseForLessons(null)}
        course={selectedCourseForLessons}
        onLessonsUpdated={fetchCourses}
      />

      {/* Quiz Manager Modal */}
      <QuizManagerModal
        isOpen={!!selectedCourseForQuiz}
        onClose={() => setSelectedCourseForQuiz(null)}
        course={selectedCourseForQuiz}
        onQuizSaved={fetchCourses}
      />
    </div>
  );
}

