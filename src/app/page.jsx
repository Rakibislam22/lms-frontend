'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function Home() {
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/api/blog-posts?filters[status][$eq]=published&pagination[limit]=3&sort=createdAt:desc')
      .then(res => setPosts(res.data.data))
      .catch(() => { });
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <section className="text-center py-12">
        <h1 className="text-3xl font-bold">LMS Platform</h1>
        <p className="text-gray-600 mt-2">Courses, lessons, quizzes — all in one place.</p>
        {!loading && !user && (
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/login" className="px-4 py-2 bg-black text-white rounded">Login</Link>
            <Link href="/register" className="px-4 py-2 border rounded">Register</Link>
          </div>
        )}
        {!loading && user && (
          <Link href={user.role.type === 'student' ? '/courses' : '/instructor/dashboard'} className="mt-6 inline-block px-4 py-2 bg-black text-white rounded">
            Go to Dashboard
          </Link>
        )}
      </section>

      {posts.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Latest from the Blog</h2>
          <div className="grid gap-4">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.id}`} className="border rounded p-4 hover:bg-gray-50">
                <h3 className="font-medium">{post.attributes.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
