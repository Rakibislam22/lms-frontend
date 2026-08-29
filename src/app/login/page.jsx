'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, ArrowRight, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#181826] text-white">
      <div className="relative w-full max-w-md rounded-3xl bg-[#1f1f33]/80 border border-white/10 p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-block group" title="LearnSphere Home">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px] mx-auto shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <div className="w-full h-full bg-[#181826] rounded-[15px] flex items-center justify-center p-2">
                <Image
                  src="/logo.png"
                  alt="LearnSphere Logo"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Welcome Back</h1>
          <p className="text-xs text-white/50">
            Sign in to access your role-synchronized workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin, instructor, or student email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181826] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181826] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#181826] border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In to Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/50">
          Don&rsquo;t have an account?{' '}
          <Link href="/register" className="font-semibold text-white hover:text-indigo-300 underline underline-offset-4">
            Register free
          </Link>
        </div>
      </div>
    </main>
  );
}
