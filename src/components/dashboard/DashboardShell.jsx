'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
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

  // Sync tab with URL search parameter or custom tab-switch event
  useEffect(() => {
    const checkTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    };

    checkTab();

    const handleSwitchTab = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };

    window.addEventListener('switch-dashboard-tab', handleSwitchTab);
    window.addEventListener('popstate', checkTab);
    return () => {
      window.removeEventListener('switch-dashboard-tab', handleSwitchTab);
      window.removeEventListener('popstate', checkTab);
    };
  }, []);

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
          { key: 'courses', label: 'All Courses & Hubs', shortLabel: 'Courses', icon: BookOpen },
          { key: 'users', label: 'Users & Roles', shortLabel: 'Users', icon: Users },
          { key: 'blogs', label: 'Tech Blog & Publications', shortLabel: 'Blogs', icon: FileEdit },
          { key: 'progress', label: 'Student Progress Analytics', shortLabel: 'Analytics', icon: TrendingUp },
        ];
      case 'content_manager':
        return [
          { key: 'courses', label: 'Course Library', shortLabel: 'Courses', icon: BookOpen },
          { key: 'blogs', label: 'Tech Blog & Publications', shortLabel: 'Blogs', icon: FileEdit },
          { key: 'progress', label: 'Student Progress Analytics', shortLabel: 'Analytics', icon: TrendingUp },
        ];
      case 'instructor':
        return [
          { key: 'courses', label: 'My Courses & Curricula', shortLabel: 'My Courses', icon: BookOpen },
          { key: 'progress', label: 'Enrolled Student Analytics', shortLabel: 'Analytics', icon: TrendingUp },
        ];
      case 'student':
      default:
        return [
          { key: 'my-learning', label: 'My Learning & Enrolled Courses', shortLabel: 'My Learning', icon: Award },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <div className="relative min-h-screen bg-[#181826] text-white pb-24">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-violet-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-8">
        {/* 1. Primary Focal Section: Dynamic Role Stats Overview (Welcome Card Removed) */}
        <StatsOverview user={user} statsTrigger={combinedTrigger} />

        {/* 2. Segmented Workspace Tabs Navigation (Responsive Dashboard Navbar) */}
        {tabs.length > 1 && (
          <div className="border-b border-white/10 pb-4 mb-8">
            <nav
              aria-label="Dashboard Workspace Tabs"
              className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mb-1"
            >
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 select-none ${isActive
                        ? 'bg-white text-[#181826] shadow-lg shadow-white/10'
                        : 'bg-[#1f1f33] text-white/70 hover:text-white hover:bg-[#262640] border border-white/5'
                      }`}
                  >
                    <TabIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#181826]' : 'text-white/50'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* 3. Active Workspace Content */}
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
