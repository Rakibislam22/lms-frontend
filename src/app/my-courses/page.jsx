'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function MyCoursesContent() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        api
            .get(`/api/enrollments?filters[student][id][$eq]=${user.id}&populate=course`)
            .then((res) => setEnrollments(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    if (loading) return <p className="p-6">Loading...</p>;

    return (
        <main className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <Link href="/courses" className="underline text-sm">Browse more</Link>
            </div>
            {enrollments.length === 0 && (
                <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
            )}
            <div className="grid gap-4">
                {enrollments.map((enr) => (
                    <Link
                        key={enr.id}
                        href={`/courses/${enr.course.id}`}
                        className="border rounded p-4 block hover:bg-gray-50"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-semibold">{enr.course?.title}</h2>
                            <span className="text-sm text-gray-600">{enr.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded h-2">
                            <div
                                className="bg-black h-2 rounded"
                                style={{ width: `${enr.progressPercent}%` }}
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </main>
    );
}

export default function MyCoursesPage() {
    return (
        <ProtectedRoute allowedRoles={['student']}>
            <MyCoursesContent />
        </ProtectedRoute>
    );
}
