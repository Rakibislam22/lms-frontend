'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function InstructorRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null;
}

export default function InstructorPage() {
  return (
    <ProtectedRoute allowedRoles={['instructor', 'content_manager', 'admin']}>
      <InstructorRedirect />
    </ProtectedRoute>
  );
}

