'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

function CoursesContent() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [coursesRes, enrollmentsRes] = await Promise.all([
                api.get('/api/courses'),
                api.get(`/api/enrollments?filters[student][id][$eq]=${user.id}&populate=course`),
            ]);
            setCourses(coursesRes.data.data);
            const ids = enrollmentsRes.data.data.map((e) => e.course?.id);
            setEnrolledIds(ids);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const handleEnroll = async (courseId) => {
        setEnrollingId(courseId);
        try {
            await api.post('/api/enrollments', {
                data: { student: user.id, course: courseId, progressPercent: 0 },
            });
            setEnrolledIds((prev) => [...prev, courseId]);
        } catch (err) {
            alert('Enroll failed: ' + (err.response?.data?.error?.message || 'try again'));
        } finally {
            setEnrollingId(null);
        }
    };

    if (loading) return <p className="p-6">Loading courses...</p>;

    return (
        <main className="max-w-3xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Browse Courses</h1>
                <Link href="/my-courses" className="underline text-sm">My Courses</Link>
            </div>
            {courses.length === 0 && <p className="text-gray-500">No courses available yet.</p>}
            <div className="grid gap-4">
                {courses.map((course) => {
                    const isEnrolled = enrolledIds.includes(course.id);
                    return (
                        <div key={course.id} className="border rounded p-4 flex justify-between items-center">
                            <div>
                                <h2 className="font-semibold">{course.title}</h2>
                                <p className="text-sm text-gray-600">{course.description}</p>
                            </div>
                            {isEnrolled ? (
                                <span className="text-green-600 text-sm font-medium">Enrolled</span>
                            ) : (
                                <button
                                    onClick={() => handleEnroll(course.id)}
                                    disabled={enrollingId === course.id}
                                    className="bg-black text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                >
                                    {enrollingId === course.id ? 'Enrolling...' : 'Enroll'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    );
}

export default function CoursesPage() {
    return (
        <ProtectedRoute allowedRoles={['student']}>
            <CoursesContent />
        </ProtectedRoute>
    );
}
