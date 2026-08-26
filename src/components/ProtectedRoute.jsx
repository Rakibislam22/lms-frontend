'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/login');
            else if (allowedRoles && !allowedRoles.includes(user.role.type)) router.push('/');
        }
    }, [user, loading]);

    if (loading || !user) return <p>Loading...</p>;
    if (allowedRoles && !allowedRoles.includes(user.role.type)) return null;
    return children;
}
