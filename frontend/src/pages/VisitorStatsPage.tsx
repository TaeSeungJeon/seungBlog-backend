import { useEffect, useState } from 'react';
import { getVisitorStats } from '../api/visitorApi';
import type { AuthState, VisitorStats } from '../types';

interface Props {
    auth: AuthState;
}

const ADMIN_USERNAME = 'TaeSeungJeon';

function VisitorStatsPage({ auth }: Props) {
    const [stats, setStats] = useState<VisitorStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!auth.isLoggedIn || auth.username !== ADMIN_USERNAME) {
            setLoading(false);
            setError('접근 권한이 없습니다.');
            return;
        }
        getVisitorStats()
            .then(setStats)
            .catch(() => setError('통계를 불러올 수 없습니다.'))
            .finally(() => setLoading(false));
    }, [auth]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <p className="text-gray-400 dark:text-gray-500">불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center py-20">
                <p className="text-gray-400 dark:text-gray-500">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const entries = Object.entries(stats.dailyCounts); // 이미 내림차순 정렬됨
    const dailyTotals = entries.map(([date, users]) => ({
        date,
        total: Object.values(users).reduce((a, b) => a + b, 0),
        users,
    }));
    const maxTotal = Math.max(...dailyTotals.map(d => d.total), 1);

    return (
        <div className="space-y-12">

            <section>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">방문자 통계</h1>
                <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">최근 30일 · 매 5분 업데이트</p>
            </section>

            {/* 요약 */}
            <section className="grid grid-cols-3 gap-4">
                {[
                    { label: '오늘', value: stats.todayViews },
                    { label: '이번 주', value: stats.weekViews },
                    { label: '누적', value: stats.totalViews },
                ].map(({ label, value }) => (
                    <div key={label} className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">views</p>
                    </div>
                ))}
            </section>

            {/* 바 차트 */}
            <section className="space-y-3">
                <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    최근 30일
                </h2>
                <div className="flex items-end gap-1 h-24">
                    {[...dailyTotals].reverse().map(({ date, total }) => (
                        <div key={date} className="flex-1 flex flex-col items-center group">
                            <div
                                className="w-full bg-blue-400 dark:bg-blue-500 rounded-t-sm group-hover:bg-blue-500 dark:group-hover:bg-blue-400 transition-colors"
                                style={{ height: `${(total / maxTotal) * 100}%`, minHeight: total > 0 ? '2px' : '0' }}
                                title={`${date}: ${total}회`}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-300 dark:text-gray-700">
                    <span>{dailyTotals[dailyTotals.length - 1]?.date ?? ''}</span>
                    <span>{dailyTotals[0]?.date ?? ''}</span>
                </div>
            </section>

            {/* 날짜별 상세 */}
            <section className="space-y-3">
                <h2 className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    날짜별 기록
                </h2>
                <div className="space-y-1">
                    {dailyTotals.map(({ date, total, users }) => (
                        <div key={date} className="py-3 border-b border-gray-100 dark:border-gray-800 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{date}</span>
                                <span className="text-sm text-gray-400 dark:text-gray-500">{total}회</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(users).map(([user, count]) => (
                                    <span key={user} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        {user} {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default VisitorStatsPage;
