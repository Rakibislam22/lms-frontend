'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  FileEdit,
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import BlogModal from './BlogModal';
import { toast } from 'react-toastify';
import { confirmDelete } from '@/lib/alerts';

export default function BlogManagementTab({ user, onOpenCreateBlog }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPost, setEditingPost] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/blog-posts?populate=*&sort=createdAt:desc');
      setPosts(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleToggleStatus = async (post) => {
    const currentStatus = post.status || post.attributes?.status || 'draft';
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';

    setTogglingId(post.id);
    try {
      await api.put(`/api/blog-posts/${post.id}`, {
        data: {
          status: nextStatus,
        },
      });
      toast.success(`Article ${nextStatus === 'published' ? 'published' : 'saved as draft'}!`);
      await fetchPosts();
    } catch (err) {
      console.error('Failed to toggle blog status:', err);
      toast.error('Failed to update article status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePost = async (postId) => {
    const isConfirmed = await confirmDelete({
      title: 'Delete Article?',
      text: 'Are you sure you want to permanently delete this blog post? This cannot be undone.',
      confirmText: 'Yes, delete article',
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/api/blog-posts/${postId}`);
      toast.success('Blog post deleted successfully.');
      await fetchPosts();
    } catch (err) {
      console.error('Failed to delete blog post:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete post.');
    }
  };

  const filteredPosts = posts.filter((p) => {
    const attrs = p.attributes || p;
    const title = attrs.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const status = attrs.status || 'draft';

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Editorial & Blog Studio</h2>
          <p className="text-xs text-white/50 mt-0.5">
            Manage tech publications. Drafts are confidential; published posts are public.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => {
              setEditingPost(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 shrink-0"
          >
            <Plus className="w-4 h-4 text-purple-600" />
            <span>Write Article</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { key: 'all', label: 'All Articles', count: posts.length },
          {
            key: 'published',
            label: 'Published',
            count: posts.filter((p) => (p.status || p.attributes?.status) === 'published').length,
          },
          {
            key: 'draft',
            label: 'Drafts',
            count: posts.filter((p) => (p.status || p.attributes?.status) !== 'published').length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${statusFilter === tab.key
              ? 'bg-white text-[#181826] shadow-sm'
              : 'bg-[#1f1f33] text-white/70 hover:text-white border border-white/5'
              }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab.key ? 'bg-black/10 text-[#181826]' : 'bg-white/10 text-white/60'
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Posts List / Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1f1f33]/40 border border-dashed border-white/10">
          <FileEdit className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white/70">No blog posts found.</p>
          <p className="text-xs text-white/40 mt-1">Click &quot;Write Article&quot; to craft a technical guide or post.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const attrs = post.attributes || post;
            const isPublished = attrs.status === 'published';
            const authorName = attrs.author?.username || attrs.author?.data?.attributes?.username || 'Editorial';
            const date = attrs.createdAt
              ? new Date(attrs.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              : 'Recent';

            return (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-[#1f1f33] border border-white/10 flex flex-col justify-between hover:border-purple-500/30 transition-all space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${isPublished
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                      />
                      <span>{isPublished ? 'Published' : 'Draft'}</span>
                    </span>

                    <span className="text-[11px] text-white/40">{date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {attrs.title}
                  </h3>

                  {attrs.body && (
                    <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                      {attrs.body}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/50 text-[11px]">By {authorName}</span>

                  <div className="flex items-center gap-2">
                    {/* 1-Click Status Toggle */}
                    <button
                      onClick={() => handleToggleStatus(post)}
                      disabled={togglingId === post.id}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${isPublished
                        ? 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30'
                        }`}
                      title={isPublished ? 'Convert to Draft' : 'Publish Article'}
                    >
                      {togglingId === post.id
                        ? 'Updating...'
                        : isPublished
                          ? 'Set to Draft'
                          : 'Publish Now'}
                    </button>

                    <Link
                      href={`/blog/${post.documentId || post.id}`}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      title="View article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      title="Edit article"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit/Create Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={editingPost}
        onSaved={fetchPosts}
      />
    </div>
  );
}

