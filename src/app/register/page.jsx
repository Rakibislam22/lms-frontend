'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // New accounts get the default role configured in Strapi
            // (Settings -> Users & Permissions -> Advanced Settings -> Default role -> set to "student")
            await register(username, email, password);
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-sm mx-auto mt-16 p-6 border rounded">
            <h1 className="text-2xl font-bold mb-6">Register</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                    required
                    minLength={6}
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white rounded py-2 disabled:opacity-50"
                >
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
            <p className="text-sm text-gray-600 mt-4">
                Already have an account? <Link href="/login" className="underline">Login</Link>
            </p>
            <p className="text-xs text-gray-400 mt-2">
                New accounts are registered as Students. Instructors/Content Managers are promoted by an Admin.
            </p>
        </main>
    );
}
