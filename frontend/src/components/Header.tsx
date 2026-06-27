import {Link, useLocation} from 'react-router-dom';
import type {AuthState} from "../types";
import axiosInstance from '../api/axiosInstance';

const LOGIN_ICON = 'gitIcon.png';
const ADMIN_USERNAME = 'TaeSeungJeon';

interface HeaderProps {
    isDark: boolean;
    onToggle: () => void;
    auth: AuthState;
    onLogout: () => void;
}

const NAV_ITEMS = [
    {path: '/about', label: 'about'},
    {path: '/posts', label: 'posts'},
    {path: '/playground', label: 'playground'},
    {path: '/guestbook', label: 'guestbook'},
];

function Header({isDark, onToggle, auth, onLogout}: HeaderProps) {
    const location = useLocation();

    // OAuth CSRF 방어: 로그인 시작마다 일회용 state 발급 후 sessionStorage에 보관
    const handleGithubLogin = () => {
        const state = crypto.randomUUID();
        sessionStorage.setItem('oauth_state', state);
        const url = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=read:user,user:email&state=${state}`;
        window.location.href = url;
    };

    const handleClearCache = async () => {
        await axiosInstance.delete('/api/posts/cache/clear');
        window.location.reload();
    };

    return (
        <header
            className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

                {/* 로고 */}
                <Link
                    to="/"
                    className="text-lg font-bold text-gray-900 dark:text-white hover:opacity-70 transition-opacity"
                >
                    Tae-seung
                </Link>

                {/* 네비게이션 + 토글 */}
                <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto min-w-0">
                    <nav className="flex items-center gap-3 sm:gap-5 shrink-0">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`text-xs sm:text-sm whitespace-nowrap transition-colors ${
                                    location.pathname === item.path
                                        ? 'text-gray-900 dark:text-white font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* 로그인/로그아웃 */}
                    {auth.isLoggedIn ? (
                        <div className="flex items-center gap-2">

                            <img
                                src={auth.avatarUrl}
                                alt={auth.username}
                                className="w-6 h-6 rounded-full"
                            />

                            <button
                                onClick={onLogout}
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                가지마세요..
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleGithubLogin} className="shrink-0" aria-label="GitHub 로그인">
                            <img
                                src={LOGIN_ICON}
                                alt="GitHub 로그인"
                                className="w-10 h-10"
                            />
                        </button>
                    )}

                    {/* 다크모드 토글 */}
                    <button
                        onClick={onToggle}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="테마 전환"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {auth.username === ADMIN_USERNAME && (
                        <>
                            <Link
                                to="/stats"
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                title="방문자 통계"
                            >
                                📊
                            </Link>
                            <button
                                onClick={handleClearCache}
                                className="text-xs text-blue-400 hover:text-blue-600 transition-colors"
                                title="캐시 초기화"
                            >
                                전송!!🚀
                            </button>
                        </>
                    )}

                </div>

            </div>
        </header>
    );
}

export default Header;