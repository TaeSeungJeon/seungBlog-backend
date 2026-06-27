import axios from 'axios';
import { isTokenExpired } from '../utils/jwt';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 - JWT 토큰 자동 첨부 + 만료 감지
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
        if (isTokenExpired(token)) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('avatarUrl');
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(new Error('TOKEN_EXPIRED'));
        }
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// 응답 인터셉터 - 서버에서 401 반환 시 강제 로그아웃
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('username');
            localStorage.removeItem('avatarUrl');
            window.dispatchEvent(new Event('auth:logout'));
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;