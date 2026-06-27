import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import AboutPage from './pages/AboutPage';
import GuestbookPage from './pages/GuestbookPage';
import PlaygroundPage from './pages/PlaygroundPage';
import CallbackPage from './pages/CallbackPage';
import type { AuthState } from './types';
import { isTokenExpired } from './utils/jwt';
import VisitorStatsPage from './pages/VisitorStatsPage';
import { recordVisit } from './api/visitorApi';

function App() {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved ? saved === 'dark' : true;
    });

    const [auth, setAuth] = useState<AuthState>(() => {
        const token = localStorage.getItem('accessToken');
        const username = localStorage.getItem('username');
        const avatarUrl = localStorage.getItem('avatarUrl');
        return {
            isLoggedIn: !!token,
            username: username ?? '',
            avatarUrl: avatarUrl ?? '',
        };
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // axiosInstance에서 발생하는 만료/401 이벤트 구독
    useEffect(() => {
        const handleLogout = () => {
            setAuth({ isLoggedIn: false, username: '', avatarUrl: '' });
        };
        window.addEventListener('auth:logout', handleLogout);
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, []);

    useEffect(() => {
        const checkTokenOnFocus = () => {
            const token = localStorage.getItem('accessToken');
            if (token && isTokenExpired(token)) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');
                localStorage.removeItem('avatarUrl');
                setAuth({ isLoggedIn: false, username: '', avatarUrl: '' });
            }
        };
        window.addEventListener('focus', checkTokenOnFocus);
        return () => window.removeEventListener('focus', checkTokenOnFocus);
    }, []);

    useEffect(() => {
        recordVisit();
    }, []);

    const handleLogin = (username: string, avatarUrl: string, token: string) => {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('username', username);
        localStorage.setItem('avatarUrl', avatarUrl);
        setAuth({ isLoggedIn: true, username, avatarUrl });
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        localStorage.removeItem('avatarUrl');
        setAuth({ isLoggedIn: false, username: '', avatarUrl: '' });
    };

    return (
        <HashRouter>
            <div className="min-h-screen bg-stone-200 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
                <Header
                    isDark={isDark}
                    onToggle={() => setIsDark(!isDark)}
                    auth={auth}
                    onLogout={handleLogout}
                />
                <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/posts" element={<PostsPage />} />
                        <Route path="/posts/:filename" element={<PostDetailPage auth={auth} />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/guestbook" element={<GuestbookPage auth={auth} />} />
                        <Route path="/playground" element={<PlaygroundPage />} />
                        <Route path="/callback" element={<CallbackPage onLogin={handleLogin} />} />
                        <Route path="/stats" element={<VisitorStatsPage auth={auth} />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
}

export default App;