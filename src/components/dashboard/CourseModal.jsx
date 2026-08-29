'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import useScrollLock from '@/hooks/useScrollLock';
import { X, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CourseModal({ isOpen, onClose, course, onSaved }) {
  useScrollLock(isOpen);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(course);

  useEffect(() => {
    if (course) {
      const attrs = course.attributes || course;
      setTitle(attrs.title || '');
      setDescription(attrs.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
    setError('');
  }, [course, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/api/courses/${course.id}`, {
          data: {
            title: title.trim(),
            description: description.trim(),
          },
        });
        toast.success('Course updated successfully! 🚀');
      } else {
        await api.post('/api/courses', {
          data: {
            title: title.trim(),
            description: description.trim(),
          },
        });
        toast.success('Course created successfully! 🚀');
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save course:', err);
      const errMsg = err.response?.data?.error?.message || 'Failed to save course. Please verify your permissions.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#181826] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEdit ? 'Edit Course Details' : 'Create New Course'}
              </h3>
              <p className="text-xs text-white/50">
                {isEdit ? 'Update curriculum title and syllabus description' : 'Add a new learning track to the platform'}
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

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack Development with Next.js 16"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Course Description & Syllabus Summary
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of what learners will master, lesson prerequisites, and topics covered..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isEdit ? 'Save Changes' : 'Create Course'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

