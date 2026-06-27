import {useEffect, useState} from 'react';
import {
    getGuestbook,
    createGuestbook,
    deleteGuestbook,
    createGuestbookReply,
    deleteGuestbookReply
} from '../api/guestbookApi';
import type {GuestbookItem, AuthState} from '../types';
import useScrollFadeIn from '../hooks/useScrollFadeIn';

interface GuestbookPageProps {
    auth: AuthState;
}

const OWNER = 'TaeSeungJeon';

function GuestbookPage({auth}: GuestbookPageProps) {
    const [items, setItems] = useState<GuestbookItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const form = useScrollFadeIn(0);
    const list = useScrollFadeIn(150);

    useEffect(() => {
        getGuestbook()
            .then(setItems)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) return;
        setIsSubmitting(true);
        try {
            const newItem = await createGuestbook(title, content);
            setItems((prev) => [newItem, ...prev]);
            setTitle('');
            setContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        await deleteGuestbook(id);
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const handleReplySubmit = async (id: number) => {
        if (!replyContent.trim()) return;
        setIsReplying(true);
        try {
            const updated = await createGuestbookReply(id, replyContent);
            setItems((prev) => prev.map((item) => item.id === id ? updated : item));
            setReplyingTo(null);
            setReplyContent('');
        } finally {
            setIsReplying(false);
        }
    };

    const handleDeleteReply = async (id: number) => {
        await deleteGuestbookReply(id);
        setItems((prev) => prev.map((item) => item.id === id ? {...item, reply: null} : item));
    };

    return (
        <div className="space-y-16 pt-10">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    👋반가워요👋
                </h1>
                <p className="text-m text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    여러분의 인사가 응원이 됩니다 호호!
                </p>
            </div>

            {auth.isLoggedIn && (
                <section ref={form.ref} className={`fade-up ${form.isVisible ? 'visible' : ''} space-y-4`}>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                        />
                        <textarea
                            placeholder="내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                            className="px-4 py-2 text-sm text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '작성 중...' : '작성하기'}
                        </button>
                    </div>
                </section>
            )}

            {!auth.isLoggedIn && (
                <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center space-y-3">
                    <p className="text-md text-gray-400 dark:text-gray-500">
                        GitHub 계정으로 로그인 후 방명록을 남길 수 있습니다.
                    </p>
                    <a
                        href={`https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=read:user,user:email`}
                        className="inline-block text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
                    >
                        GitHub로 로그인
                    </a>
                </div>
            )}

            <section ref={list.ref} className={`fade-up ${list.isVisible ? 'visible' : ''} space-y-4`}>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i}
                                 className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                                <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
                                <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"/>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 py-10 text-center">
                        아직 작성된 글이 없습니다. 첫 번째 글을 남겨보세요!
                    </p>
                ) : (
                    items.map((item) => (
                        <div key={item.id}
                             className="group p-5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors space-y-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <img src={item.avatarUrl} alt={item.author} className="w-7 h-7 rounded-full"/>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.author}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.createdAt.slice(0, 10)}</p>
                                    </div>
                                </div>
                                <div
                                    className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                    {auth.username === OWNER && !item.reply && (
                                        <button
                                            onClick={() => {
                                                setReplyingTo(item.id);
                                                setReplyContent('');
                                            }}
                                            className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                        >
                                            답글
                                        </button>
                                    )}
                                    {auth.isLoggedIn && (auth.username === item.author || auth.username === OWNER) && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1 pl-10">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.content}</p>
                            </div>

                            {item.reply && (
                                <div className="ml-10 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={item.reply.avatarUrl || `https://github.com/${OWNER}.png`}
                                                 alt={OWNER} className="w-5 h-5 rounded-full"/>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {OWNER} · {item.reply.createdAt.slice(0, 10)}
                                            </p>
                                        </div>
                                        {auth.username === OWNER && (
                                            <button
                                                onClick={() => handleDeleteReply(item.id)}
                                                className="text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pl-7">
                                        {item.reply.content}
                                    </p>
                                </div>
                            )}

                            {replyingTo === item.id && (
                                <div className="ml-10 space-y-2">
                                    <textarea
                                        placeholder="답글을 입력하세요"
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setReplyingTo(null)}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                            취소
                                        </button>
                                        <button
                                            onClick={() => handleReplySubmit(item.id)}
                                            disabled={isReplying || !replyContent.trim()}
                                            className="px-3 py-1.5 text-xs text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30"
                                        >
                                            {isReplying ? '작성 중...' : '답글 작성'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

export default GuestbookPage;
