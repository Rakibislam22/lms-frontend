import Link from 'next/link';
import { Sparkles, Github, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#141420] text-white/70 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px] shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-[#181826] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">LearnSphere</span>
            </Link>
            <p className="text-sm text-white/50 max-w-sm leading-relaxed">
              A minimalist, high-impact Learning Management System built for seamless course progression,
              instant auto-graded assessments, and secure role-based workspaces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Next.js 16 + Strapi 5 Powered</span>
              </div>
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
              <li><Link href="/#features" className="hover:text-white transition-colors">Platform Features</Link></li>
              <li><Link href="/#roles" className="hover:text-white transition-colors">Role Permissions</Link></li>
              <li><Link href="/#blog" className="hover:text-white transition-colors">Tech Blog</Link></li>
            </ul>
          </div>

          {/* Column 3: Roles & Access */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Roles & Workspaces</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-1.5 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>Student Experience</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Instructor Studio</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>Content Manager</span>
              </li>
              <li className="flex items-center gap-1.5 text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Administrator Dashboard</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Account */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/my-courses" className="hover:text-white transition-colors">Enrolled Courses</Link></li>
              <li className="pt-2">
                <a
                  href="http://localhost:1337/documentation/v1.0.0"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Strapi API Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom separator and copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} LearnSphere LMS. Built for the Junior Software Engineer Project Round.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> & precision
            </span>
            <span className="text-white/20">•</span>
            <span>Railway + Vercel Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

