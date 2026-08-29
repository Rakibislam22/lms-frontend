'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('jwt');
        if (token) {
            api.get('/api/users/me?populate=role').then(res => setUser(res.data)).catch(() => Cookies.remove('jwt')).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        try {
            Cookies.remove('jwt');
            const res = await api.post('/api/auth/local', { identifier, password });
            Cookies.set('jwt', res.data.jwt, { expires: 7 });
            const me = await api.get('/api/users/me?populate=role');
            setUser(me.data);
            return me.data;
        }
        catch (error) {
            console.log("Login error:", error.response?.data);
            throw error;
        }
    };

    const register = async (username, email, password, role = 'student') => {
        Cookies.remove('jwt');
        const res = await api.post('/api/auth/local/register', { username, email, password, role });
        Cookies.set('jwt', res.data.jwt, { expires: 7 });
        const me = await api.get('/api/users/me?populate=role');
        setUser(me.data);
        return me.data;
    };

    const logout = () => { Cookies.remove('jwt'); setUser(null); };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
