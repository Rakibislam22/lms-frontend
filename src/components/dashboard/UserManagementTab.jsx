'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  Users,
  Search,
  Shield,
  Filter,
  Check,
  AlertCircle,
  Clock,
  ArrowUpDown,
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function UserManagementTab({ currentUser, onRoleUpdated }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users?populate=role');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, targetRole) => {
    if (!userId || !targetRole) return;
    setUpdatingUserId(userId);
    setFeedback(null);

    try {
      await api.put(`/api/users/${userId}/role`, {
        role: targetRole,
      });

      setFeedback({
        type: 'success',
        message: `Role successfully updated to "${targetRole}"!`,
      });

      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
              ...u,
              role: {
                ...u.role,
                type: targetRole,
                name: targetRole,
              },
            }
            : u
        )
      );

      if (onRoleUpdated) onRoleUpdated();
    } catch (err) {
      console.error('Failed to change user role:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.error?.message || 'Failed to update user role.',
      });
    } finally {
      setUpdatingUserId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const roleBadgeStyle = (roleType) => {
    switch (roleType) {
      case 'admin':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'content_manager':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'instructor':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-sky-500/10 text-sky-300 border-sky-500/30';
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (roleFilter === 'all') return matchesSearch;
    return matchesSearch && u.role?.type === roleFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Platform User Management</h2>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Assign and modify platform roles: Admin, Content Manager, Instructor, and Student.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search username or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1f1f33] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        {[
          { key: 'all', label: 'All Users', count: users.length },
          { key: 'admin', label: 'Admins', count: users.filter((u) => u.role?.type === 'admin').length },
          {
            key: 'content_manager',
            label: 'Content Managers',
            count: users.filter((u) => u.role?.type === 'content_manager').length,
          },
          {
            key: 'instructor',
            label: 'Instructors',
            count: users.filter((u) => u.role?.type === 'instructor').length,
          },
          { key: 'student', label: 'Students', count: users.filter((u) => u.role?.type === 'student').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${roleFilter === tab.key
                ? 'bg-white text-[#181826] shadow-sm'
                : 'bg-[#1f1f33] text-white/70 hover:text-white border border-white/5'
              }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${roleFilter === tab.key ? 'bg-black/10 text-[#181826]' : 'bg-white/10 text-white/60'
                }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in ${feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Users Table / Grid */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#1f1f33]/40 border border-dashed border-white/10">
          <Users className="w-8 h-8 text-white/30 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white/70">No users found.</p>
          <p className="text-xs text-white/40 mt-1">Try adjusting your search query or role filter.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#1f1f33] border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/50 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">User Details</th>
                  <th className="py-3.5 px-4 font-semibold">Current Role</th>
                  <th className="py-3.5 px-4 font-semibold">Registered</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Assign New Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => {
                  const currentRole = u.role?.type || 'student';
                  const isCurrentSessionUser = u.id === currentUser?.id;

                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center text-xs">
                            {u.username?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{u.username}</span>
                              {isCurrentSessionUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-normal">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-white/40">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${roleBadgeStyle(
                            currentRole
                          )}`}
                        >
                          {currentRole}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-white/50 text-[11px]">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                          : 'Recent'}
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {updatingUserId === u.id ? (
                            <div className="flex items-center gap-1.5 text-indigo-300 text-xs">
                              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                              <span>Saving...</span>
                            </div>
                          ) : (
                            <select
                              value={currentRole}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl bg-[#181826] border border-white/15 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer hover:border-white/30 transition-colors"
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="content_manager">Content Manager</option>
                              <option value="admin">Administrator</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

