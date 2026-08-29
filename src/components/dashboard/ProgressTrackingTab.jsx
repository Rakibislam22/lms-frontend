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
  const [selectedStudentQuizData, setSelectedStudentQuizData] = useState(null);

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
                  <th className="py-3.5 px-4 font-semibold text-right">Average Quiz Score</th>
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

                  // Calculate aggregate statistics for this student in this course
                  const totalScore = matchingResults.reduce((acc, r) => {
                    const rAttrs = r.attributes || r;
                    return acc + (rAttrs.score ?? 0);
                  }, 0);
                  const totalPossible = matchingResults.reduce((acc, r) => {
                    const rAttrs = r.attributes || r;
                    return acc + (rAttrs.totalQuestions ?? 1);
                  }, 0);
                  const avgPercent = matchingResults.length > 0
                    ? Math.round((totalScore / (totalPossible || 1)) * 100)
                    : 0;
                  const isAvgPassed = avgPercent >= 50;
                  const attemptsCount = matchingResults.length;

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

                      {/* Average Quiz Score (Clickable to view all results) */}
                      <td className="py-3.5 px-4 text-right">
                        {attemptsCount > 0 ? (
                          <div className="inline-flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudentQuizData({
                                  student,
                                  course,
                                  results: matchingResults,
                                  totalScore,
                                  totalPossible,
                                  avgPercent,
                                  attemptsCount,
                                  isAvgPassed,
                                })
                              }
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm ${isAvgPassed
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                                }`}
                              title="Click to view all quiz results and detailed question audit"
                            >
                              <Award className="w-3.5 h-3.5 shrink-0" />
                              <span>Avg: {avgPercent}%</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-white/90">
                                {attemptsCount} {attemptsCount === 1 ? 'quiz' : 'quizzes'}
                              </span>
                              <Eye className="w-3.5 h-3.5 text-white/50" />
                            </button>
                            <span className="text-[10px] text-white/40 pr-0.5">
                              {totalScore} of {totalPossible} total marks
                            </span>
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

      {/* All Quiz Results Inspection Modal */}
      {selectedStudentQuizData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[#181826] border border-white/15 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">All Quiz Submissions & Performance History</h3>
                  <p className="text-[11px] text-white/50">
                    Student: <span className="text-white font-semibold">{selectedStudentQuizData.student?.username}</span> • Course:{' '}
                    <span className="text-white font-semibold">{selectedStudentQuizData.course?.title}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentQuizData(null)}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-[#1f1f33] border border-white/10 grid grid-cols-3 gap-3 text-center shrink-0">
              <div className="space-y-0.5">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Average Score</div>
                <div className={`text-base font-extrabold ${selectedStudentQuizData.isAvgPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedStudentQuizData.avgPercent}%
                </div>
              </div>
              <div className="space-y-0.5 border-x border-white/10 px-2">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Total Quizzes Taken</div>
                <div className="text-base font-extrabold text-white">
                  {selectedStudentQuizData.attemptsCount}
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-white/40 text-[10px] uppercase font-semibold">Cumulative Marks</div>
                <div className="text-base font-extrabold text-white">
                  {selectedStudentQuizData.totalScore} / {selectedStudentQuizData.totalPossible}
                </div>
              </div>
            </div>

            {/* List of All Results / Attempts */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/40 flex items-center justify-between">
                <span>Quiz Attempts Breakdown ({selectedStudentQuizData.results.length})</span>
                <span className="text-[10px] normal-case text-white/40">Chronological history</span>
              </div>

              {selectedStudentQuizData.results.map((r, rIdx) => {
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
                  ? new Date(rAttrs.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : 'N/A';

                return (
                  <div
                    key={r.id || rIdx}
                    className="p-4 rounded-2xl bg-[#1f1f33]/90 border border-white/10 space-y-3 shadow-md"
                  >
                    {/* Attempt Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Attempt #{selectedStudentQuizData.results.length - rIdx}
                          </span>
                          <span className="text-xs font-bold text-white">{quizTitle}</span>
                        </div>
                        <div className="text-[11px] text-white/40 mt-0.5">Submitted on: {formattedDate}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${isPassed
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                        >
                          Score: {score}/{total} ({percent}%) {isPassed ? '✓ Passed' : '✗ Needs Practice'}
                        </span>
                      </div>
                    </div>

                    {/* Question by Question Breakdown */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Submitted Question Answers:
                      </div>

                      {Array.isArray(fullQuiz?.questions) && fullQuiz.questions.length > 0 ? (
                        fullQuiz.questions.map((q, qIdx) => {
                          const studentAns = rAttrs.answers?.[qIdx];
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
                              key={qIdx}
                              className={`p-3 rounded-xl border text-xs space-y-1.5 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-white">
                                  Q{qIdx + 1}: {q.question}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'
                                    }`}
                                >
                                  {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                                </span>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-[11px]">
                                <div className="text-white/70">
                                  <span className="text-white/40">Student answer:</span>{' '}
                                  <span className={`font-semibold ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
                                    {studentAns !== undefined && studentAns !== null && studentAns !== '' ? String(studentAns) : '(None)'}
                                  </span>
                                </div>
                                {!isCorrect && correctAns && (
                                  <div className="text-emerald-400">
                                    <span className="text-white/40">Correct answer:</span>{' '}
                                    <span className="font-semibold">{correctAns}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : Array.isArray(rAttrs.answers) && rAttrs.answers.length > 0 ? (
                        rAttrs.answers.map((ans, aIdx) => (
                          <div key={aIdx} className="p-2.5 rounded-lg bg-white/5 text-[11px] flex items-center justify-between">
                            <span className="text-white/50">Question #{aIdx + 1}</span>
                            <span className="text-white font-semibold">{String(ans)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-white/40 text-[11px] italic">No question breakdown available for this attempt.</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedStudentQuizData(null)}
                className="px-4 py-2 rounded-xl bg-white text-[#181826] text-xs font-bold hover:bg-white/90 transition-all active:scale-95 shadow-md shadow-white/10"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
