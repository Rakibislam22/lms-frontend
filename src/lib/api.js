import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({ baseURL: process.env.NEXT_STRAPI_URL || 'http://localhost:1337' });

api.interceptors.request.use((config) => {
    const isAuthEndpoint = config.url?.includes('/api/auth/local');
    const token = Cookies.get('jwt');
    if (token && !isAuthEndpoint) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
