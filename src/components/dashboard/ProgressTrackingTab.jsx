'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  TrendingUp,
  Search,
  CheckCircle2,
  Award,
  Users,
  BookOpen,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function ProgressTrackingTab({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const roleType = user?.role?.type || 'student';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend automatically applies role permissions:
      // Instructors only receive enrollments & quiz results for their own courses
      const [enrollmentsRes, resultsRes] = await Promise.all([
        api.get('/api/enrollments?populate=*&sort=updatedAt:desc'),
        api.get('/api/quiz-results?populate=*&sort=createdAt:desc'),
      ]);

      setEnrollments(enrollmentsRes.data?.data || []);
      setQuizResults(resultsRes.data?.data || []);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEnrollments = enrollments.filter((enr) => {
    const attrs = enr.attributes || enr;
    const studentName =
      attrs.student?.username ||
      attrs.student?.data?.attributes?.username ||
      attrs.student?.email ||
      '';
    const courseTitle =
      attrs.course?.title ||
      attrs.course?.data?.attributes?.title ||
      '';

    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Student Progress & Learning Analytics</h2>
          <p className="text-xs text-white/50 mt-0.5">
            Real-time enrollment completion percentages and auto-graded quiz score audit log.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student or course..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Progress Cards / Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1f1f33]/40 border border-dashed border-white/10">
          <TrendingUp className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white/70">No student enrollments found.</p>
          <p className="text-xs text-white/40 mt-1">When students enroll and complete lessons, their metrics populate here.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold">Enrolled Course</th>
                  <th className="py-3.5 px-4 font-semibold">Course Completion %</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Assessment Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnrollments.map((enr) => {
                  const attrs = enr.attributes || enr;
                  const student = attrs.student?.data?.attributes || attrs.student || {};
                  const course = attrs.course?.data?.attributes || attrs.course || {};
                  const progressPercent = attrs.progressPercent ?? 0;

                  // Find quiz results for this student in this course
                  const matchingResults = quizResults.filter((qr) => {
                    const qrAttrs = qr.attributes || qr;
                    const sId = qrAttrs.student?.id || qrAttrs.student?.data?.id;
                    const cId = qrAttrs.quiz?.course?.id || qrAttrs.quiz?.data?.attributes?.course?.data?.id;
                    return sId === student.id && cId === course.id;
                  });

                  return (
                    <tr key={enr.id} className="hover:bg-white/5 transition-colors">
                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 font-bold flex items-center justify-center text-xs">
                            {student.username?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-white">{student.username || 'Student'}</div>
                            <div className="text-[11px] text-white/40">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white/90">{course.title || 'Course'}</div>
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4">
                        <div className="w-48 space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-white">{progressPercent}%</span>
                            <span className="text-white/40">
                              {progressPercent === 100 ? 'Completed ✓' : 'In Progress'}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-[#181826] rounded-full overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100
                                  ? 'bg-emerald-400'
                                  : 'bg-gradient-to-r from-indigo-500 to-sky-400'
                                }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Quiz Result */}
                      <td className="py-3.5 px-4 text-right">
                        {matchingResults.length > 0 ? (
                          <div className="inline-flex flex-col items-end gap-0.5">
                            {matchingResults.map((r, rIdx) => {
                              const rAttrs = r.attributes || r;
                              return (
                                <span
                                  key={r.id || rIdx}
                                  className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                                >
                                  Score: {rAttrs.score}/{rAttrs.totalQuestions} (
                                  {Math.round(
                                    ((rAttrs.score || 0) / (rAttrs.totalQuestions || 1)) * 100
                                  )}
                                  %)
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-white/30 text-[11px]">No quiz taken</span>
                        )}
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
  );
}

