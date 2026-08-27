'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import DashboardHeader from './DashboardHeader';
import StatsOverview from './StatsOverview';
import CourseManagementTab from './CourseManagementTab';
import UserManagementTab from './UserManagementTab';
import BlogManagementTab from './BlogManagementTab';
import ProgressTrackingTab from './ProgressTrackingTab';
import StudentWorkspace from './StudentWorkspace';
import {
  BookOpen,
  Users,
  FileEdit,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';

export default function DashboardShell() {
  const { user } = useAuth();
  const { refreshCount, openCreateCourse, openCreateBlog } = useModal();
  const roleType = user?.role?.type || 'student';

  // Default active tab based on role
  const defaultTab = roleType === 'student' ? 'my-learning' : 'courses';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Local refresh trigger
  const [localTrigger, setLocalTrigger] = useState(0);

  const refreshAll = () => {
    setLocalTrigger((prev) => prev + 1);
  };

  const combinedTrigger = localTrigger + refreshCount;

  // Define allowable tabs by role
  const getTabsForRole = () => {
    switch (roleType) {
      case 'admin':
        return [
          { key: 'courses', label: 'All Courses & Hubs', icon: BookOpen },
          { key: 'users', label: 'Users & Roles', icon: Users },
          { key: 'blogs', label: 'Tech Blog & Publications', icon: FileEdit },
          { key: 'progress', label: 'Student Progress Analytics', icon: TrendingUp },
        ];
      case 'content_manager':
        return [
          { key: 'courses', label: 'Course Library', icon: BookOpen },
          { key: 'blogs', label: 'Tech Blog & Publications', icon: FileEdit },
          { key: 'progress', label: 'Student Progress Analytics', icon: TrendingUp },
        ];
      case 'instructor':
        return [
          { key: 'courses', label: 'My Courses & Curricula', icon: BookOpen },
          { key: 'progress', label: 'Enrolled Student Analytics', icon: TrendingUp },
        ];
      case 'student':
      default:
        return [
          { key: 'my-learning', label: 'My Learning & Enrolled Courses', icon: Award },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="relative min-h-screen bg-[#181826] text-white pb-24">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* 1. Header greeting & role banner (action buttons moved to Navbar, Matrix removed) */}
        <DashboardHeader user={user} />

        {/* 2. Primary Focal Section: Dynamic Role Stats Overview */}
        <StatsOverview user={user} statsTrigger={combinedTrigger} />

        {/* 3. Segmented Workspace Tabs Navigation */}
        {tabs.length > 1 && (
          <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${
                    isActive
                      ? 'bg-white text-[#181826] shadow-lg shadow-white/10'
                      : 'bg-[#1f1f33] text-white/70 hover:text-white hover:bg-[#262640] border border-white/5'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 ${isActive ? 'text-[#181826]' : 'text-white/50'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Active Workspace Content */}
        <div className="relative">
          {/* Student Tab */}
          {activeTab === 'my-learning' && (
            <StudentWorkspace user={user} onProgressUpdated={refreshAll} />
          )}

          {/* Courses Tab (Admin, Content Manager, Instructor) */}
          {activeTab === 'courses' && (
            <CourseManagementTab
              user={user}
              onOpenCreateCourse={openCreateCourse}
              coursesTrigger={combinedTrigger}
            />
          )}

          {/* User Management Tab (Admin Only) */}
          {activeTab === 'users' && roleType === 'admin' && (
            <UserManagementTab currentUser={user} onRoleUpdated={refreshAll} />
          )}

          {/* Blog Publications Tab (Admin & Content Manager) */}
          {activeTab === 'blogs' && (roleType === 'admin' || roleType === 'content_manager') && (
            <BlogManagementTab
              user={user}
              onOpenCreateBlog={openCreateBlog}
            />
          )}

          {/* Progress Tracking Tab (Admin, Content Manager, Instructor) */}
          {activeTab === 'progress' && roleType !== 'student' && (
            <ProgressTrackingTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}
