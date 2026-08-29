'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  X,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Edit3,
  RotateCcw,
  Check
} from 'lucide-react';

export default function QuizManagerModal({ isOpen, onClose, course, onQuizSaved, onQuizzesUpdated }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '0',
    },
  ]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [fetchingExisting, setFetchingExisting] = useState(false);

  const fetchExistingQuizzes = async () => {
    if (!course) return;
    setFetchingExisting(true);
    try {
      const res = await api.get(`/api/quizzes?filters[course][id][$eq]=${course.id}`);
      setExistingQuizzes(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load existing quizzes:', err);
    } finally {
      setFetchingExisting(false);
    }
  };

  const resetToNew = () => {
    setEditingQuiz(null);
    setTitle(`${course?.title || course?.attributes?.title || 'Course'} - Assessment Quiz`);
    setQuestions([
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '0',
      },
    ]);
    setError('');
  };

  useEffect(() => {
    if (isOpen && course) {
      resetToNew();
      fetchExistingQuizzes();
    }
  }, [isOpen, course]);

  if (!isOpen || !course) return null;

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    const qAttrs = quiz.attributes || quiz;
    setTitle(qAttrs.title || '');

    let rawQuestions = qAttrs.questions;
    if (typeof rawQuestions === 'string') {
      try {
        rawQuestions = JSON.parse(rawQuestions);
      } catch {
        rawQuestions = [];
      }
    }

    const loadedQuestions = (Array.isArray(rawQuestions) ? rawQuestions : []).map((qItem, idx) => {
      const opts = Array.isArray(qItem.options) && qItem.options.length >= 2 ? [...qItem.options] : ['', '', '', ''];
      while (opts.length < 4) opts.push('');

      let correctIdx = '0';
      if (qItem.correctIndex !== undefined && qItem.correctIndex !== null) {
        correctIdx = String(qItem.correctIndex);
      } else if (qItem.correctAnswer !== undefined) {
        const found = opts.findIndex((o) => String(o).trim().toLowerCase() === String(qItem.correctAnswer).trim().toLowerCase());
        if (found >= 0) correctIdx = String(found);
      }

      return {
        id: qItem.id || idx + 1,
        question: qItem.question || '',
        options: opts,
        correctAnswer: correctIdx,
      };
    });

    setQuestions(
      loadedQuestions.length > 0
        ? loadedQuestions
        : [
          {
            id: 1,
            question: '',
            options: ['', '', '', ''],
            correctAnswer: '0',
          },
        ]
    );
    setError('');
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '0',
      },
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (questions.length === 1) return;
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
  };

  const handleQuestionTextChange = (idx, text) => {
    const updated = [...questions];
    updated[idx].question = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIdx, correctIdx) => {
    const updated = [...questions];
    updated[qIdx].correctAnswer = String(correctIdx);
    setQuestions(updated);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/api/quizzes/${quizId}`);
      if (editingQuiz && (editingQuiz.id === quizId || editingQuiz.documentId === quizId)) {
        resetToNew();
      }
      await fetchExistingQuizzes();
      if (onQuizSaved) onQuizSaved();
      if (onQuizzesUpdated) onQuizzesUpdated();
    } catch (err) {
      console.error('Failed to delete quiz:', err);
      alert('Failed to delete quiz.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question #${i + 1} text cannot be empty.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Question #${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty.`);
          return;
        }
      }
    }

    setLoading(true);
    setError('');

    try {
      // Map questions with correct option text and index for maximum server auto-grader compatibility
      const formattedQuestions = questions.map((q, idx) => {
        const correctIndex = parseInt(q.correctAnswer, 10) || 0;
        const correctOptionText = q.options[correctIndex] || '';
        return {
          id: idx + 1,
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          correctIndex,
          correctAnswer: correctOptionText.trim(),
        };
      });

      if (editingQuiz) {
        // Update existing quiz
        const targetId = editingQuiz.documentId || editingQuiz.id;
        await api.put(`/api/quizzes/${targetId}`, {
          data: {
            title: title.trim(),
            questions: formattedQuestions,
          },
        });
      } else {
        // Create new quiz
        await api.post('/api/quizzes', {
          data: {
            title: title.trim(),
            course: course.id,
            questions: formattedQuestions,
          },
        });
      }

      await fetchExistingQuizzes();
      if (onQuizSaved) onQuizSaved();
      if (onQuizzesUpdated) onQuizzesUpdated();
      resetToNew();
      onClose();
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setError(err.response?.data?.error?.message || 'Failed to save quiz. Verify your permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#181826] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {editingQuiz ? 'Edit MCQ Quiz' : 'MCQ Quiz & Auto-Grader Creator'}
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  {editingQuiz ? 'Edit Mode' : 'Instant Server Evaluation'}
                </span>
              </div>
              <p className="text-xs text-white/50 truncate max-w-md">
                Course: <span className="text-white font-medium">{course.title || course.attributes?.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Quizzes Alert */}
        {existingQuizzes.length > 0 && (
          <div className="my-3 p-3 rounded-xl bg-[#1f1f33] border border-white/10 shrink-0 space-y-2">
            <div className="text-xs font-semibold text-white/80">Existing Quizzes for this course:</div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
              {existingQuizzes.map((q) => {
                const qAttrs = q.attributes || q;
                const questionsCount = Array.isArray(qAttrs.questions) ? qAttrs.questions.length : 0;
                const isCurrentEdit = editingQuiz && (editingQuiz.id === q.id || editingQuiz.documentId === q.documentId);

                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${isCurrentEdit ? 'bg-purple-500/20 border border-purple-500/40' : 'bg-white/5'
                      }`}
                  >
                    <span className="text-white font-medium truncate max-w-[280px]">
                      {qAttrs.title} ({questionsCount} Questions)
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditQuiz(q)}
                        className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${isCurrentEdit
                            ? 'bg-purple-500 text-white'
                            : 'text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30'
                          }`}
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isCurrentEdit ? 'Editing' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuiz(q.documentId || q.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Edit Banner */}
        {editingQuiz && (
          <div className="mb-2 p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-purple-300" />
              <span className="text-white font-semibold">
                Editing: <span className="text-purple-200">{editingQuiz.title || editingQuiz.attributes?.title}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={resetToNew}
              className="text-[11px] text-purple-300 hover:text-white underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Cancel Edit (New Quiz)</span>
            </button>
          </div>
        )}

        {error && (
          <div className="my-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Questions Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-5 mt-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-white/70 mb-1.5">
              Quiz Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js Routing & Middleware Knowledge Check"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                MCQ Questions ({questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-500/30 transition-colors border border-purple-500/30"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-4 rounded-xl bg-[#1f1f33] border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Question #{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-white/40 hover:text-rose-400 text-xs transition-colors"
                      title="Remove question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  required
                  value={q.question}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  placeholder={`Enter question #${qIdx + 1}...`}
                  className="w-full px-3 py-2 rounded-lg bg-[#181826] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />

                <div className="space-y-2 pt-1">
                  <span className="text-[11px] text-white/50 block">
                    Options & Correct Answer (Select radio button for the correct option):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = q.correctAnswer === String(optIdx);

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${isCorrect
                            ? 'bg-purple-500/10 border-purple-500/50 text-white'
                            : 'bg-[#181826] border-white/5 text-white/80'
                            }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectAnswerChange(qIdx, optIdx)}
                            className="text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-white/50 w-4">{letter}.</span>
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${letter}`}
                            className="bg-transparent text-xs w-full focus:outline-none text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#181826] border-t-transparent rounded-full animate-spin" />
                  <span>Saving Quiz...</span>
                </>
              ) : editingQuiz ? (
                <>
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Update Quiz</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Publish Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

