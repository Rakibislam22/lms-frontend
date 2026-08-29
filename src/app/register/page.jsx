'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  GraduationCap,
  BookOpen,
  FileEdit,
  ShieldCheck
} from 'lucide-react';

const SIGNUP_ROLES = [
  {
    type: 'student',
    title: 'Student',
    desc: 'Enroll in courses, complete lessons & take quizzes',
    icon: GraduationCap,
    activeBg: 'bg-sky-500/10',
    activeBorder: 'border-sky-500/40',
    ringColor: 'ring-sky-500/30',
    iconActive: 'bg-sky-500/20 text-sky-300',
    radioActive: 'border-sky-400 bg-sky-500',
  },
  {
    type: 'instructor',
    title: 'Instructor',
    desc: 'Create courses, publish lessons & build quizzes',
    icon: BookOpen,
    activeBg: 'bg-indigo-500/10',
    activeBorder: 'border-indigo-500/40',
    ringColor: 'ring-indigo-500/30',
    iconActive: 'bg-indigo-500/20 text-indigo-300',
    radioActive: 'border-indigo-400 bg-indigo-500',
  },
  {
    type: 'content_manager',
    title: 'Content Manager',
    desc: 'Author technical articles & publish blog insights',
    icon: FileEdit,
    activeBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500/40',
    ringColor: 'ring-purple-500/30',
    iconActive: 'bg-purple-500/20 text-purple-300',
    radioActive: 'border-purple-400 bg-purple-500',
  },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password, selectedRole);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleObj = SIGNUP_ROLES.find((r) => r.type === selectedRole) || SIGNUP_ROLES[0];

  return (
    <main className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#181826] text-white">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1f1f33]/80 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="text-center space-y-2 mb-6">
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
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-white/50">
            Choose your learning or educator role and start exploring LearnSphere
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selector (Student, Instructor, Content Manager - Without Admin) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SIGNUP_ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.type;
                return (
                  <button
                    key={r.type}
                    type="button"
                    onClick={() => setSelectedRole(r.type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${isSelected
                        ? `${r.activeBg} ${r.activeBorder} ring-1 ${r.ringColor}`
                        : 'bg-[#181826] border-white/10 hover:border-white/20 text-white/70'
                      }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center ${isSelected ? r.iconActive : 'bg-white/5 text-white/60'
                          }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? r.radioActive : 'border-white/20'
                          }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/90'}`}>
                        {r.title}
                      </div>
                      <div className="text-[10px] text-white/40 leading-tight mt-0.5">
                        {r.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181826] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181826] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-1.5">
              Password (Min 6 Characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181826] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Role Policy Notice */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5 text-[11px] text-white/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Joining as <strong className="text-white">{selectedRoleObj.title}</strong>. Administrator accounts are restricted and managed internally.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 rounded-xl bg-white text-[#181826] font-bold text-xs hover:bg-white/90 transition-all shadow-md shadow-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#181826] border-t-transparent rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Get Started as {selectedRoleObj.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-white/50">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-white hover:text-indigo-300 underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
