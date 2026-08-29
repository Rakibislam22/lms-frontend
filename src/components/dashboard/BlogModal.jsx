'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import useScrollLock from '@/hooks/useScrollLock';
import { X, FileEdit, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export default function BlogModal({ isOpen, onClose, post, onSaved }) {
  useScrollLock(isOpen);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (post) {
      const attrs = post.attributes || post;
      setTitle(attrs.title || '');
      setBody(attrs.body || '');
      setCoverImageUrl(attrs.coverImageUrl || '');
      setStatus(attrs.status || 'draft');
    } else {
      setTitle('');
      setBody('');
      setCoverImageUrl('');
      setStatus('draft');
    }
    setError('');
  }, [post, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!post;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        data: {
          title: title.trim(),
          body: body.trim(),
          coverImageUrl: coverImageUrl.trim(),
          status,
        },
      };

      if (isEdit) {
        await api.put(`/api/blog-posts/${post.id}`, payload);
        toast.success('Article updated successfully! ✍️');
      } else {
        await api.post('/api/blog-posts', payload);
        toast.success('Article published successfully! ✍️');
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save blog post:', err);
      const errMsg = err.response?.data?.error?.message || 'Failed to save blog post. Verify permissions.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#181826] border border-white/15 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isEdit ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h3>
              <p className="text-xs text-white/50">
                Draft vs Published workflow • Only published posts are visible to the public
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
          <div className="my-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Full-Stack RBAC Architecture in Next.js"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Cover Image URL (Optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
                Publication Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="draft">Draft (Confidential / Unpublished)</option>
                <option value="published">Published (Live for Public & Students)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Article Body Content (Markdown / Text)
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your article markdown, technical guides, code snippets, and explanations here..."
              className="w-full px-4 py-3 rounded-xl bg-[#1f1f33] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 resize-none font-mono"
            />
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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>{isEdit ? 'Update Article' : 'Publish / Save Article'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

