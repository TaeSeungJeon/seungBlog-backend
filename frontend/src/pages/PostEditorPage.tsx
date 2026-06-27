import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getPost, createPost, updatePost } from '../api/postApi';
import type { AuthState, PostRequest } from '../types';

const OWNER = 'TaeSeungJeon';
const CATEGORIES = ['Dev', 'Etc.'];

interface PostEditorPageProps {
    auth: AuthState;
}

function PostEditorPage({ auth }: PostEditorPageProps) {
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(filename);

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');           // 신규 작성 시 파일명(URL)
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [content, setContent] = useState('');

    const [tab, setTab] = useState<'write' | 'preview'>('write');
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 수정 모드: 기존 글 불러와 채우기
    useEffect(() => {
        if (isEdit && filename) {
            getPost(filename)
                .then((post) => {
                    setTitle(post.title ?? '');
                    setCategory(post.category || CATEGORIES[0]);
                    setDate(post.date ?? '');
                    setDescription(post.description ?? '');
                    setContent(post.content ?? '');
                })
                .catch(() => setError('글을 불러오지 못했습니다.'))
                .finally(() => setIsLoading(false));
        }
    }, [isEdit, filename]);

    // 관리자 본인만 접근 가능
    if (auth.username !== OWNER) {
        return (
            <div className="pt-20 text-center space-y-4">
                <p className="text-gray-400 dark:text-gray-500">접근 권한이 없습니다.</p>
                <Link to="/posts" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    ← 목록으로
                </Link>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!title.trim()) { setError('제목을 입력하세요.'); return; }
        if (!content.trim()) { setError('본문을 입력하세요.'); return; }

        setError('');
        setIsSubmitting(true);
        try {
            const req: PostRequest = {
                title: title.trim(),
                category,
                date: date.trim() || undefined,
                description: description.trim() || undefined,
                content,
            };

            let saved;
            if (isEdit && filename) {
                saved = await updatePost(filename, req);
            } else {
                saved = await createPost({ ...req, filename: slug.trim() || undefined });
            }
            navigate(`/posts/${saved.filename}`);
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(message || '저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 pt-10">
                <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
        );
    }

    const inputClass =
        'w-full px-4 py-2.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors';

    return (
        <div className="space-y-8 pt-10">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? '글 수정' : '새 글 작성'}
                </h1>
                <Link
                    to={isEdit && filename ? `/posts/${filename}` : '/posts'}
                    className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    취소
                </Link>
            </div>

            {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-4 py-2.5">
                    {error}
                </p>
            )}

            {/* 메타 입력 */}
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`${inputClass} text-base font-medium`}
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputClass}
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputClass}
                        title="비우면 오늘 날짜로 저장됩니다"
                    />

                    {!isEdit && (
                        <input
                            type="text"
                            placeholder="파일명(선택, URL)"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className={inputClass}
                            title="비우면 제목으로 자동 생성됩니다"
                        />
                    )}
                </div>

                <input
                    type="text"
                    placeholder="한 줄 설명(선택)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                />
            </div>

            {/* 본문 - 작성/미리보기 탭 */}
            <div className="space-y-3">
                <div className="flex gap-1 border-b border-gray-100 dark:border-gray-800">
                    {(['write', 'preview'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-sm px-4 py-2 -mb-px border-b-2 transition-colors ${
                                tab === t
                                    ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium'
                                    : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            {t === 'write' ? '작성' : '미리보기'}
                        </button>
                    ))}
                </div>

                {tab === 'write' ? (
                    <textarea
                        placeholder="마크다운으로 작성하세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={20}
                        className={`${inputClass} font-mono leading-relaxed resize-y`}
                    />
                ) : (
                    <div className="min-h-[20rem] px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg prose prose-gray dark:prose-invert max-w-none">
                        {content.trim()
                            ? <ReactMarkdown>{content}</ReactMarkdown>
                            : <p className="text-sm text-gray-400 dark:text-gray-500 not-prose">미리보기할 내용이 없습니다.</p>}
                    </div>
                )}
            </div>

            {/* 저장 */}
            <div className="flex justify-end gap-2">
                <Link
                    to={isEdit && filename ? `/posts/${filename}` : '/posts'}
                    className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    취소
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="px-5 py-2 text-sm text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? '저장 중...' : isEdit ? '수정 완료' : '발행'}
                </button>
            </div>
        </div>
    );
}

export default PostEditorPage;
