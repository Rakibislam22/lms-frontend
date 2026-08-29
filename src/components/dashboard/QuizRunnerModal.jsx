'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import useScrollLock from '@/hooks/useScrollLock';
import {
  X,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export default function QuizRunnerModal({ isOpen, onClose, quiz, onCompleted, onQuizSubmitted }) {
  useScrollLock(isOpen);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const quizAttrs = quiz?.attributes || quiz;
  const questions = Array.isArray(quizAttrs?.questions) ? quizAttrs.questions : [];

  useEffect(() => {
    if (isOpen) {
      setCurrentIdx(0);
      setAnswers({});
      setResult(null);
      setError('');
    }
  }, [isOpen, quiz]);

  if (!isOpen || !quiz) return null;

  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const selectedOption = answers[currentIdx];

  const handleSelectOption = (opt) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIdx]: opt,
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if any question was left unanswered
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < totalQ) {
      if (!confirm(`You answered ${answeredCount} of ${totalQ} questions. Submit anyway?`)) {
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      // Backend expects answers array or object matching question indices
      const answersArray = questions.map((_, i) => answers[i] ?? '');

      const targetQuizId = quiz.id ?? quiz.documentId;
      const res = await api.post('/api/quiz-results', {
        data: {
          quiz: targetQuizId,
          answers: answersArray,
        },
      });

      const resData = res.data?.data || res.data;
      setResult(resData);
    } catch (err) {
      console.error('Quiz submission failed:', err);
      setError(err.response?.data?.error?.message || 'Failed to evaluate quiz submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (result) {
      if (onCompleted) onCompleted(result);
      if (onQuizSubmitted) onQuizSubmitted(result);
    }
    if (onClose) onClose(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#181826] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {quizAttrs?.title || 'Interactive Assessment'}
              </h3>
              <p className="text-xs text-white/50">
                Instant server-side grading • Verified against secure database answer keys
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* RESULT VIEW */}
        {result ? (
          <div className="py-4 text-center space-y-5 overflow-y-auto pr-1">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10 animate-bounce">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Auto-Grading Complete!
              </span>
              <h4 className="text-2xl sm:text-3xl font-extrabold text-white">
                Your Score: {result.score ?? result.attributes?.score ?? 0} /{' '}
                {result.totalQuestions ?? result.attributes?.totalQuestions ?? totalQ}
              </h4>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                Your submission was evaluated automatically by the server-side grading engine and has been permanently stored in your student record.
              </p>
            </div>
            {(() => {
              const scoreVal = result.score ?? result.attributes?.score ?? 0;
              const totalVal = result.totalQuestions ?? result.attributes?.totalQuestions ?? totalQ;
              const safeTotal = totalVal > 0 ? totalVal : 1;
              const percent = Math.round((scoreVal / safeTotal) * 100);
              const isPassed = percent >= 50;
              return (
                <div className="p-4 rounded-xl bg-[#1f1f33] border border-white/10 max-w-sm mx-auto flex items-center justify-around text-xs">
                  <div>
                    <div className="text-white/40">Percentage</div>
                    <div className="text-lg font-bold text-white">{percent}%</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div>
                    <div className="text-white/40">Status</div>
                    <div className={`text-lg font-bold ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isPassed ? 'Passed ✓' : 'Needs Practice'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Answer Breakdown Review */}
            <div className="text-left space-y-2 pt-2 border-t border-white/10 max-h-52 overflow-y-auto pr-1">
              <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                Question Breakdown
              </div>
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const correctAns =
                  q.correctAnswer ??
                  (Array.isArray(q.options) && q.correctIndex !== undefined ? q.options[q.correctIndex] : null);
                const isCorrect =
                  userAns &&
                  correctAns &&
                  String(userAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase();

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white truncate">
                        Q{idx + 1}: {q.question}
                      </span>
                      <span className={`font-bold shrink-0 ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70">
                      Your selection: <span className="text-white font-medium">{userAns || 'No Answer'}</span>
                    </div>
                    {!isCorrect && correctAns && (
                      <div className="text-[11px] text-emerald-400">
                        Correct option: <span className="font-semibold">{correctAns}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* QUIZ QUESTIONS STEPR VIEW */
          <div className="py-4 space-y-5">
            {/* Progress Stepper Bar */}
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="font-semibold text-white">
                Question {currentIdx + 1} of {totalQ}
              </span>
              <span className="text-sky-400 font-mono">
                {Math.round(((currentIdx + 1) / totalQ) * 100)}% Completed
              </span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            {currentQ ? (
              <div className="p-5 rounded-2xl bg-[#1f1f33] border border-white/10 space-y-4">
                <h4 className="text-base font-bold text-white leading-relaxed">
                  {currentQ.question}
                </h4>

                <div className="space-y-2.5 pt-2">
                  {(currentQ.options || []).map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    // Match either by option text or option index
                    const isSelected =
                      selectedOption === opt || selectedOption === String(optIdx);

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-3 ${isSelected
                          ? 'bg-sky-500/20 border-sky-500/60 text-white shadow-md shadow-sky-500/10'
                          : 'bg-[#181826] border-white/10 text-white/80 hover:bg-white/5 hover:border-white/20'
                          }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${isSelected
                            ? 'bg-sky-500 text-white border-sky-400'
                            : 'bg-white/5 text-white/50 border-white/10'
                            }`}
                        >
                          {letter}
                        </div>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-white/40">
                No questions found in this quiz.
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIdx < totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Grading...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Submit & Auto-Grade</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

