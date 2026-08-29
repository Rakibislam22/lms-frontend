'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  Search,
  BookOpen,
  Clock,
  Calendar,
  ArrowRight,
  PlusCircle,
  FileEdit
} from 'lucide-react';

const TOPIC_TAGS = ['All', 'Platform', 'Engineering', 'Curriculum', 'Guides'];

export default function BlogPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const roleType = user?.role?.type || 'student';
  const canManageBlog = roleType === 'admin' || roleType === 'content_manager' || roleType === 'instructor';

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/blog-posts?populate=*&sort=createdAt:desc');
        const items = res.data?.data || [];
        setPosts(items);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Filter posts based on search query and topic
  const filteredPosts = posts.filter((post) => {
    const attrs = post.attributes || post;
    const title = (attrs.title || '').toLowerCase();
    const body = (attrs.body || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = title.includes(query) || body.includes(query);

    if (selectedTopic === 'All') return matchesSearch;
    return matchesSearch && (title.includes(selectedTopic.toLowerCase()) || body.includes(selectedTopic.toLowerCase()));
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const standardPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const getReadingTime = (text) => {
    if (!text) return '2 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <main className="min-h-screen bg-[#181826] text-white py-10 sm:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Header & Intro Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Knowledge Hub & Tech Insights</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              LearnSphere Engineering & Tech Blog
            </h1>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed">
              Explore in-depth articles, platform updates, educational architecture, and practical engineering guides authored by our curriculum leaders.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {canManageBlog && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all active:scale-95 shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write Article</span>
              </Link>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#1f1f33] border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Topic Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {TOPIC_TAGS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${selectedTopic === topic
                  ? 'bg-white text-[#181826] shadow-md shadow-white/10'
                  : 'bg-[#1f1f33] text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="space-y-8">
            <div className="w-full h-80 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center rounded-3xl bg-[#1f1f33]/60 border border-white/10 space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white">No Articles Found</h3>
            <p className="text-xs text-white/50 leading-relaxed">
              We couldn&apos;t find any blog posts matching your search criteria. Try a different search query or view all articles.
            </p>
            {(searchQuery || selectedTopic !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTopic('All');
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Featured Story Hero Card */}
            {featuredPost && (
              <div className="group relative rounded-3xl bg-gradient-to-br from-[#1f1f33] via-[#22223a] to-[#1a1a2e] border border-white/15 p-6 sm:p-10 overflow-hidden shadow-2xl hover:border-purple-500/30 transition-all">
                {/* Ambient Glow */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Featured Story
                      </span>
                      <span className="flex items-center gap-1 text-xs text-white/50">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featuredPost.attributes?.createdAt || featuredPost.createdAt)}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1 text-xs text-white/50">
                        <Clock className="w-3.5 h-3.5" />
                        {getReadingTime(featuredPost.attributes?.body || featuredPost.body)}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white group-hover:text-purple-200 transition-colors leading-tight">
                      <Link href={`/blog/${featuredPost.documentId || featuredPost.id}`}>
                        {featuredPost.attributes?.title || featuredPost.title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-white/70 line-clamp-3 leading-relaxed max-w-3xl">
                      {featuredPost.attributes?.body || featuredPost.body}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs">
                          {(featuredPost.attributes?.author?.username || featuredPost.author?.username || 'E').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {featuredPost.attributes?.author?.username || featuredPost.author?.username || 'Editorial Team'}
                          </div>
                          <div className="text-[10px] text-white/40">Curriculum & Engineering</div>
                        </div>
                      </div>

                      <Link
                        href={`/blog/${featuredPost.documentId || featuredPost.id}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md group-hover:gap-3"
                      >
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Visual Side Banner */}
                  <div className="lg:col-span-4">
                    {featuredPost.attributes?.coverImageUrl || featuredPost.coverImageUrl ? (
                      <div className="aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={featuredPost.attributes?.coverImageUrl || featuredPost.coverImageUrl}
                          alt={featuredPost.attributes?.title || featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video lg:aspect-square w-full rounded-2xl bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-transparent border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                          <FileEdit className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-white/70">Technical Architecture</span>
                        <span className="text-[11px] text-white/40">LearnSphere Publication</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Standard Articles Grid */}
            {standardPosts.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">All Recent Articles ({filteredPosts.length})</h3>
                  <span className="text-xs text-white/40">Chronologically Ordered</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardPosts.map((post) => {
                    const attrs = post.attributes || post;
                    const id = post.documentId || post.id;
                    const date = formatDate(attrs.createdAt);
                    const authorName = attrs.author?.username || attrs.author?.data?.attributes?.username || 'Editorial';
                    const readingTime = getReadingTime(attrs.body);

                    return (
                      <article
                        key={post.id}
                        className="group rounded-3xl bg-[#1f1f33] border border-white/10 overflow-hidden flex flex-col justify-between hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition-all"
                      >
                        {/* Card Header Image / Banner */}
                        {attrs.coverImageUrl ? (
                          <div className="aspect-video w-full overflow-hidden border-b border-white/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={attrs.coverImageUrl}
                              alt={attrs.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="h-28 w-full bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border-b border-white/5 p-4 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-purple-300 border border-white/10">
                              Article
                            </span>
                            <span className="text-[11px] text-white/40">{readingTime}</span>
                          </div>
                        )}

                        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[11px] text-white/40">
                              <span>{date}</span>
                              {attrs.coverImageUrl && <span>{readingTime}</span>}
                            </div>

                            <h4 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors leading-snug">
                              <Link href={`/blog/${id}`}>{attrs.title}</Link>
                            </h4>

                            <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                              {attrs.body}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white/5 text-white/80 border border-white/10 flex items-center justify-center font-bold text-[10px]">
                                {authorName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-[11px] text-white/60 truncate max-w-[120px]">
                                {authorName}
                              </span>
                            </div>

                            <Link
                              href={`/blog/${id}`}
                              className="text-white/80 font-bold group-hover:text-purple-300 inline-flex items-center gap-1 group-hover:gap-1.5 transition-all text-xs"
                            >
                              <span>Read</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
