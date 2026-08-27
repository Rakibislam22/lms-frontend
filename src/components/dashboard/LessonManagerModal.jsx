'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  X,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Video,
  FileText,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function LessonManagerModal({ isOpen, onClose, course, onLessonsUpdated }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchLessons = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await api.get(
        `/api/lessons?filters[course][id][$eq]=${course.id}&sort=order:asc`
      );
      setLessons(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setVideoUrl('');
    setContent('');
    setOrder(lessons.length + 1);
    setEditingLessonId(null);
    setShowForm(false);
    setError('');
  };

  useEffect(() => {
    if (isOpen && course) {
      fetchLessons();
      resetForm();
    }
  }, [isOpen, course]);

  const handleEditClick = (lesson) => {
    const attrs = lesson.attributes || lesson;
    setTitle(attrs.title || '');
    setVideoUrl(attrs.videoUrl || '');
    setContent(attrs.content || '');
    setOrder(attrs.order || 1);
    setEditingLessonId(lesson.id);
    setShowForm(true);
    setError('');
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/api/lessons/${lessonId}`);
      await fetchLessons();
      if (onLessonsUpdated) onLessonsUpdated();
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      alert(err.response?.data?.error?.message || 'Failed to delete lesson.');
    }
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Lesson title is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        data: {
          title: title.trim(),
          videoUrl: videoUrl.trim(),
          content: content.trim(),
          order: Number(order) || 1,
          course: course.id,
        },
      };

      if (editingLessonId) {
        await api.put(`/api/lessons/${editingLessonId}`, payload);
      } else {
        await api.post('/api/lessons', payload);
      }

      resetForm();
      await fetchLessons();
      if (onLessonsUpdated) onLessonsUpdated();
    } catch (err) {
      console.error('Failed to save lesson:', err);
      setError(err.response?.data?.error?.message || 'Failed to save lesson.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#181826] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Lesson Curriculum Manager</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {lessons.length} Modules
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

        {/* Actions bar */}
        <div className="py-3 flex items-center justify-between shrink-0">
          <span className="text-xs text-white/60">
            {showForm
              ? editingLessonId
                ? 'Editing lesson details'
                : 'Adding a new sequential lesson'
              : 'Curriculum lesson sequence'}
          </span>

          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setOrder(lessons.length + 1);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lesson</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* Create / Edit Form */}
          {showForm && (
            <form onSubmit={handleSaveLesson} className="p-4 rounded-xl bg-[#1f1f33] border border-white/10 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-indigo-300">
                  {editingLessonId ? 'Edit Lesson #' + order : 'New Lesson #' + order}
                </span>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold uppercase text-white/70 mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Setting Up PostgreSQL & Connection Pooling"
                    className="w-full px-3 py-2 rounded-lg bg-[#181826] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-white/70 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#181826] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-white/70 mb-1">
                  Video URL (YouTube, Vimeo, MP4, or embed)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg bg-[#181826] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-white/70 mb-1">
                  Lesson Notes & Instructions (Text / Markdown)
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Key takeaways, code snippets, documentation references, exercises..."
                  className="w-full px-3 py-2 rounded-lg bg-[#181826] border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white/70 text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingLessonId ? 'Update Lesson' : 'Add Lesson'}
                </button>
              </div>
            </form>
          )}

          {/* Lessons List */}
          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : lessons.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/5 border border-dashed border-white/10">
              <Layers className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-sm font-semibold text-white/70">No lessons in this course yet.</p>
              <p className="text-xs text-white/40 mt-1">Click &quot;Add Lesson&quot; above to construct the curriculum.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => {
                const attrs = lesson.attributes || lesson;
                return (
                  <div
                    key={lesson.id}
                    className="p-3.5 rounded-xl bg-[#1f1f33] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold flex items-center justify-center shrink-0">
                        {attrs.order || 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {attrs.title}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/40 mt-0.5">
                          {attrs.videoUrl ? (
                            <span className="flex items-center gap-1 text-sky-400">
                              <Video className="w-3 h-3" />
                              <span>Video attached</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-white/40">
                              <FileText className="w-3 h-3" />
                              <span>Text guide</span>
                            </span>
                          )}

                          {attrs.content && (
                            <span className="truncate max-w-xs text-white/50">
                              • {attrs.content.slice(0, 45)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(lesson)}
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete lesson"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>Module updates synchronize across enrolled student progress trackers automatically.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white text-[#181826] font-semibold text-xs hover:bg-white/90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

