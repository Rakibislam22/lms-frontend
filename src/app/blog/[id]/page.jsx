'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Check,
  BookOpen,
  Edit2,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function BlogDetailPage() {
  const { id: postId } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const roleType = user?.role?.type || 'student';
  const canManageBlog = roleType === 'admin' || roleType === 'content_manager';

  useEffect(() => {
    if (!postId) return;

    const fetchPostDetails = async () => {
      setLoading(true);
      setError('');

      try {
        let postData = null;

        // 1. Try fetching by documentId first (Strapi 5 standard)
        try {
          const docRes = await api.get(`/api/blog-posts?filters[documentId][$eq]=${postId}&populate=*`);
          postData = docRes.data?.data?.[0] || null;
        } catch { }

        // 2. If not found by documentId, try numeric id filter
        if (!postData && !isNaN(Number(postId))) {
          try {
            const idRes = await api.get(`/api/blog-posts?filters[id][$eq]=${postId}&populate=*`);
            postData = idRes.data?.data?.[0] || null;
          } catch { }
        }

        // 3. Fallback direct path lookup
        if (!postData) {
          try {
            const directRes = await api.get(`/api/blog-posts/${postId}?populate=*`);
            postData = directRes.data?.data || null;
          } catch { }
        }

        if (!postData) {
          throw new Error('Blog post could not be located.');
        }

        setPost(postData);

        // Fetch related posts (excluding current post)
        try {
          const relRes = await api.get('/api/blog-posts?populate=*&sort=createdAt:desc&pagination[pageSize]=4');
          const allItems = relRes.data?.data || [];
          const others = allItems.filter((p) => p.id !== postData.id && p.documentId !== postData.documentId).slice(0, 3);
          setRelatedPosts(others);
        } catch (e) {
          console.warn('Failed to load related posts:', e);
        }
      } catch (err) {
        console.error('Failed to fetch blog post:', err);
        setError('This article could not be found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getReadingTime = (text) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const formatDate = (dateStr, options = { month: 'long', day: 'numeric', year: 'numeric' }) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', options);
    } catch {
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#181826] text-white py-16">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 space-y-6">
          <div className="w-32 h-6 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-3/4 h-12 rounded-xl bg-white/5 animate-pulse" />
          <div className="w-full h-80 rounded-3xl bg-white/5 animate-pulse" />
          <div className="space-y-3">
            <div className="w-full h-4 rounded bg-white/5 animate-pulse" />
            <div className="w-5/6 h-4 rounded bg-white/5 animate-pulse" />
            <div className="w-2/3 h-4 rounded bg-white/5 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#181826] text-white py-20">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Article Not Available</h2>
          <p className="text-xs text-white/50">{error || 'The requested article could not be loaded.'}</p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to All Articles</span>
          </Link>
        </div>
      </main>
    );
  }

  const attrs = post.attributes || post;
  const authorName = attrs.author?.username || attrs.author?.data?.attributes?.username || 'Editorial Team';
  const publishedDate = formatDate(attrs.createdAt);
  const readingTime = getReadingTime(attrs.body);
  const isDraft = attrs.status === 'draft';

  return (
    <main className="min-h-screen bg-[#181826] text-white pb-24">
      {/* Top Header Sticky Bar */}
      <div className="sticky top-18 z-40 bg-[#181826]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Articles</span>
          </Link>

          <div className="flex items-center gap-3">
            {isDraft && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Draft Preview
              </span>
            )}

            {canManageBlog && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1f1f33] text-white/80 hover:text-white border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all"
                title="Edit in Dashboard"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Dashboard Management</span>
              </Link>
            )}

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
              title="Copy link to article"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Content Container */}
      <article className="max-w-[900px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 space-y-8">
        {/* Article Meta Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Technical Article
            </span>
            <span className="flex items-center gap-1 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5" />
              {publishedDate}
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1 text-xs text-white/50">
              <Clock className="w-3.5 h-3.5" />
              {readingTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {attrs.title}
          </h1>

          {/* Author Byline */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-sm shadow-md">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{authorName}</span>
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-white/10 text-white/70">
                    Author
                  </span>
                </div>
                <div className="text-xs text-white/40">LearnSphere Engineering & Curriculum</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Cover Image */}
        {attrs.coverImageUrl ? (
          <div className="w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video max-h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attrs.coverImageUrl}
              alt={attrs.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full rounded-3xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-[#1f1f33] border border-white/10 p-8 sm:p-12 shadow-2xl flex items-center justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Technical Note</span>
              <div className="text-lg sm:text-xl font-bold text-white/90">Deep Dive & Analysis</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div className="py-4 text-white/85 text-base sm:text-lg leading-relaxed space-y-6 font-normal">
          {attrs.body ? (
            attrs.body.split(/\n\n+/).map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();

              // Markdown header # Heading
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="text-2xl sm:text-3xl font-extrabold text-white pt-6 pb-2 border-b border-white/10">
                    {trimmed.replace('# ', '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="text-xl sm:text-2xl font-bold text-white pt-4 pb-1">
                    {trimmed.replace('## ', '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="text-lg sm:text-xl font-bold text-purple-300 pt-3">
                    {trimmed.replace('### ', '')}
                  </h4>
                );
              }

              // Blockquote
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote
                    key={pIdx}
                    className="p-4 rounded-2xl bg-purple-500/10 border-l-4 border-purple-500 text-purple-200 italic my-4"
                  >
                    {trimmed.replace(/^>\s*/, '')}
                  </blockquote>
                );
              }

              // Code snippet block
              if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
                const codeContent = trimmed.replace(/^```[a-z]*\n?/, '').replace(/```$/, '');
                return (
                  <div key={pIdx} className="p-4 rounded-2xl bg-[#141420] border border-white/10 font-mono text-xs text-sky-300 overflow-x-auto my-4 shadow-inner">
                    <pre>{codeContent}</pre>
                  </div>
                );
              }

              // Standard body paragraph
              return (
                <p key={pIdx} className="leading-relaxed">
                  {trimmed}
                </p>
              );
            })
          ) : (
            <p className="text-white/40 italic">This article has no content recorded yet.</p>
          )}
        </div>

        {/* Article Author Footer Card */}
        <div className="pt-8 border-t border-white/10">
          <div className="p-6 rounded-3xl bg-[#1f1f33] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-extrabold text-xl shrink-0">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-white">Written by {authorName}</div>
                <p className="text-xs text-white/50 max-w-md leading-relaxed">
                  Contributing educator and platform architect at LearnSphere. Passionate about effective digital pedagogy, auto-grading reliability, and clear technical communication.
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md active:scale-95 shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share Article'}</span>
            </button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="pt-12 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-extrabold text-white">More from LearnSphere Blog</h3>
              <Link href="/blog" className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1">
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedPosts.map((rel) => {
                const rAttrs = rel.attributes || rel;
                const rId = rel.documentId || rel.id;
                const rAuthor = rAttrs.author?.username || rAttrs.author?.data?.attributes?.username || 'Editorial';
                const rDate = formatDate(rAttrs.createdAt, {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <Link
                    key={rel.id}
                    href={`/blog/${rId}`}
                    className="p-5 rounded-2xl bg-[#1f1f33] border border-white/10 hover:border-purple-500/30 transition-all space-y-3 flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-white/40">
                        <span>{rDate}</span>
                        <span>{getReadingTime(rAttrs.body)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors line-clamp-2 leading-snug">
                        {rAttrs.title}
                      </h4>
                      <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                        {rAttrs.body}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                      <span>By {rAuthor}</span>
                      <span className="text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                        Read →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
