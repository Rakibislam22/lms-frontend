'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else if (allowedRoles && !allowedRoles.includes(user.role?.type)) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading || !user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
                    <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-sm text-white/50 font-medium tracking-wide">Authenticating session...</div>
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role?.type)) {
        return null;
    }

    return children;
}
