'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'content_manager', 'instructor', 'student']}>
      <DashboardShell />
    </ProtectedRoute>
  );
}

