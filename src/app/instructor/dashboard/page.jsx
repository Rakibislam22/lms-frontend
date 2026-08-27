'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function InstructorDashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}

export default function InstructorDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'content_manager', 'admin']}>
      <InstructorDashboardRedirect />
    </ProtectedRoute>
  );
}

