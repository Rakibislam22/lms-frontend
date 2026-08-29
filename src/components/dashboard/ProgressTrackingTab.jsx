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
  Sparkles,
  Eye,
  X,
  Check,
  XCircle,
  HelpCircle
} from 'lucide-react';

export default function ProgressTrackingTab({ user }) {
  const [enrollments, setEnrollments] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultForDetails, setSelectedResultForDetails] = useState(null);

  const roleType = user?.role?.type || 'student';

  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend automatically applies role permissions:
      // Instructors only receive enrollments & quiz results for their own courses
      const [enrollmentsRes, resultsRes, quizzesRes] = await Promise.all([
        api.get('/api/enrollments?populate=*&sort=updatedAt:desc'),
        api.get('/api/quiz-results?populate=*&sort=createdAt:desc'),
        api.get('/api/quizzes?populate=*'),
      ]);

      setEnrollments(enrollmentsRes.data?.data || []);
      setQuizResults(resultsRes.data?.data || []);
      setQuizzes(quizzesRes.data?.data || []);
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

  // Map quiz ID/documentId to its parent course and quiz metadata
  const quizMap = {};
  quizzes.forEach((q) => {
    const cId = q.course?.id || q.attributes?.course?.data?.id;
    const cDocId = q.course?.documentId || q.attributes?.course?.data?.attributes?.documentId;
    const item = { id: cId, documentId: cDocId, quiz: q };
    if (q.id) quizMap[q.id] = item;
    if (q.documentId) quizMap[q.documentId] = item;
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
                  <th className="py-3.5 px-4 font-semibold text-right">Quiz Assessment Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEnrollments.map((enr) => {
                  const attrs = enr.attributes || enr;
                  const student = attrs.student?.data?.attributes || attrs.student || {};
                  const course = attrs.course?.data?.attributes || attrs.course || {};
                  const progressPercent = attrs.progressPercent ?? 0;

                  // Find quiz results for this student in this course using both direct and mapped relations
                  const matchingResults = quizResults.filter((qr) => {
                    const qrAttrs = qr.attributes || qr;
                    const sId = qrAttrs.student?.id || qrAttrs.student?.data?.id;
                    const sDocId = qrAttrs.student?.documentId || qrAttrs.student?.data?.attributes?.documentId;
                    const sUsername = qrAttrs.student?.username || qrAttrs.student?.data?.attributes?.username;

                    const quizRef = qrAttrs.quiz?.id || qrAttrs.quiz?.data?.id || (typeof qrAttrs.quiz === 'number' ? qrAttrs.quiz : null);
                    const quizDocRef = qrAttrs.quiz?.documentId || qrAttrs.quiz?.data?.attributes?.documentId || (typeof qrAttrs.quiz === 'string' ? qrAttrs.quiz : null);

                    const directCourseId = qrAttrs.quiz?.course?.id || qrAttrs.quiz?.data?.attributes?.course?.data?.id;
                    const directCourseDocId = qrAttrs.quiz?.course?.documentId || qrAttrs.quiz?.data?.attributes?.course?.data?.attributes?.documentId;

                    const mapped = (quizRef && quizMap[quizRef]) || (quizDocRef && quizMap[quizDocRef]);
                    const cId = directCourseId || mapped?.id;
                    const cDocId = directCourseDocId || mapped?.documentId;

                    const matchesStudent =
                      (sId && student.id && sId === student.id) ||
                      (sDocId && student.documentId && sDocId === student.documentId) ||
                      (sUsername && student.username && sUsername.toLowerCase() === student.username.toLowerCase());

                    const matchesCourse =
                      (cId && course.id && cId === course.id) ||
                      (cDocId && course.documentId && cDocId === course.documentId);

                    return Boolean(matchesStudent && matchesCourse);
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

                      {/* Quiz Details */}
                      <td className="py-3.5 px-4 text-right">
                        {matchingResults.length > 0 ? (
                          <div className="inline-flex flex-col items-end gap-2">
                            {matchingResults.map((r, rIdx) => {
                              const rAttrs = r.attributes || r;
                              const score = rAttrs.score ?? 0;
                              const total = rAttrs.totalQuestions ?? 1;
                              const percent = Math.round((score / total) * 100);
                              const isPassed = percent >= 50;
                              const quizRef = rAttrs.quiz?.id || rAttrs.quiz?.data?.id;
                              const quizDocRef = rAttrs.quiz?.documentId || rAttrs.quiz?.data?.attributes?.documentId;
                              const mappedQuiz = (quizRef && quizMap[quizRef]?.quiz) || (quizDocRef && quizMap[quizDocRef]?.quiz);
                              const fullQuiz = rAttrs.quiz?.questions ? rAttrs.quiz : mappedQuiz || rAttrs.quiz;
                              const quizTitle = fullQuiz?.title || rAttrs.quiz?.title || 'Assessment Quiz';
                              const formattedDate = rAttrs.createdAt
                                ? new Date(rAttrs.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : '';

                              return (
                                <div
                                  key={r.id || rIdx}
                                  className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 justify-end"
                                >
                                  <div className="text-right">
                                    <div className="text-[11px] font-semibold text-white/90 truncate max-w-[170px]" title={quizTitle}>
                                      {quizTitle}
                                    </div>
                                    {formattedDate && (
                                      <div className="text-[10px] text-white/40">{formattedDate}</div>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedResultForDetails({
                                        ...rAttrs,
                                        quiz: fullQuiz,
                                        quizTitle,
                                        studentName: student.username,
                                        courseTitle: course.title,
                                        isPassed,
                                        score,
                                        total,
                                        percent,
                                      })
                                    }
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                                      isPassed
                                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                    }`}
                                    title="Click to inspect question-by-question submission breakdown"
                                  >
                                    <Eye className="w-3 h-3 shrink-0" />
                                    <span>
                                      {score}/{total} ({percent}%)
                                    </span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-white/30 text-[11px] italic">No quiz taken</span>
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

      {/* Quiz Submission Details Inspection Modal */}
      {selectedResultForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#181826] border border-white/15 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Quiz Submission Assessment Details</h3>
                  <p className="text-[11px] text-white/50">
                    Student: <span className="text-white font-semibold">{selectedResultForDetails.studentName}</span> • Course:{' '}
                    <span className="text-white font-semibold">{selectedResultForDetails.courseTitle}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResultForDetails(null)}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Summary Metrics Banner */}
            <div className="p-3.5 rounded-2xl bg-[#1f1f33] border border-white/10 grid grid-cols-3 gap-3 text-center shrink-0">
              <div className="space-y-0.5">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Quiz Title</div>
                <div className="text-xs font-bold text-white truncate px-1" title={selectedResultForDetails.quizTitle}>
                  {selectedResultForDetails.quizTitle}
                </div>
              </div>
              <div className="space-y-0.5 border-x border-white/10 px-2">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Final Score</div>
                <div className="text-xs font-bold text-white">
                  {selectedResultForDetails.score} / {selectedResultForDetails.total} ({selectedResultForDetails.percent}%)
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Status</div>
                <div className={`text-xs font-bold ${selectedResultForDetails.isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedResultForDetails.isPassed ? 'Passed ✓' : 'Needs Practice'}
                </div>
              </div>
            </div>

            {/* Question by Question Audit Log */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                Question Breakdown & Student Answers
              </div>
              {Array.isArray(selectedResultForDetails.quiz?.questions) && selectedResultForDetails.quiz.questions.length > 0 ? (
                selectedResultForDetails.quiz.questions.map((q, idx) => {
                  const studentAns = selectedResultForDetails.answers?.[idx];
                  const correctAns =
                    q.correctAnswer ??
                    (Array.isArray(q.options) && q.correctIndex !== undefined
                      ? q.options[q.correctIndex]
                      : null);

                  let isCorrect = false;
                  if (studentAns !== undefined && studentAns !== null && correctAns !== undefined && correctAns !== null) {
                    const normStudent = String(studentAns).trim().toLowerCase();
                    const normCorrect = String(correctAns).trim().toLowerCase();
                    isCorrect = normStudent === normCorrect;
                    if (!isCorrect && Array.isArray(q.options)) {
                      const idxNum = parseInt(normStudent, 10);
                      if (!isNaN(idxNum) && q.options[idxNum]) {
                        isCorrect = String(q.options[idxNum]).trim().toLowerCase() === normCorrect;
                      }
                    }
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border space-y-2 ${
                        isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-xs text-white">
                          #{idx + 1}. {q.question}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 border ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-white/80">
                          <span className="text-white/40 text-[11px]">Submitted Answer:</span>
                          <span className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {studentAns !== undefined && studentAns !== null && studentAns !== '' ? String(studentAns) : '(No response)'}
                          </span>
                        </div>
                        {!isCorrect && correctAns && (
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <span className="text-white/40 text-[11px]">Correct Answer:</span>
                            <span className="font-semibold">{correctAns}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : Array.isArray(selectedResultForDetails.answers) && selectedResultForDetails.answers.length > 0 ? (
                selectedResultForDetails.answers.map((ans, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#1f1f33] border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">Question #{idx + 1}</span>
                    <span className="text-white font-bold">{String(ans)}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-white/40 text-xs">
                  No individual question submission logs recorded for this quiz attempt.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedResultForDetails(null)}
                className="px-4 py-2 rounded-xl bg-white text-[#181826] text-xs font-bold hover:bg-white/90 transition-all active:scale-95 shadow-md shadow-white/10"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

