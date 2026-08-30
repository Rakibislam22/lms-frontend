import Link from 'next/link';
import { Home, BookOpen, FileText, LayoutDashboard, Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#181826] text-white relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-600/10 blur-3xl pointer-events-none -z-10" />

      <div className="relative w-full max-w-xl text-center space-y-6">
        {/* Glowing 404 Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span className="font-mono tracking-wider text-rose-400">404</span>
          <span className="text-white/40">|</span>
          <span>Page Not Found</span>
        </div>

        {/* Large Decorative 404 Text */}
        <div className="relative select-none">
          <span className="text-8xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-[#1f1f33] border border-white/15 flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Lost in the Knowledge Sphere?
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed">
            The page or curriculum module you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95"
          >
            <Home className="w-4 h-4 text-[#181826]" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/courses"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1f1f33] text-white font-semibold text-xs border border-white/10 hover:bg-[#262640] hover:border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Explore Courses</span>
          </Link>
        </div>

        {/* Quick Navigation Cards */}
        <div className="pt-6 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <Link
            href="/dashboard"
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-300">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  My Dashboard
                </div>
                <div className="text-[10px] text-white/40">
                  Access enrolled courses & progress
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            href="/blog"
            className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/15 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Knowledge Blog
                </div>
                <div className="text-[10px] text-white/40">
                  Read latest articles & tutorials
                </div>
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </main>
  );
}
