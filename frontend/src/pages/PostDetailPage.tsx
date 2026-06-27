import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getPost } from '../api/postApi';
import { getComments, createComment, createReply, deleteComment, deleteReply } from '../api/commentApi';
import type { PostDetail, Comment, AuthState } from '../types';

interface CodeProps {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

interface PostDetailPageProps {
    auth: AuthState;
}

const OWNER = 'TaeSeungJeon';

function PostDetailPage({ auth }: PostDetailPageProps) {
    const { filename } = useParams<{ filename: string }>();
    const [post, setPost] = useState<PostDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        if (filename) {
            getPost(filename).then(setPost).finally(() => setIsLoading(false));
            getComments(filename).then(setComments);
        }
    }, [filename]);

    const handleCommentSubmit = async () => {
        if (!commentContent.trim() || !filename) return;
        setIsSubmitting(true);
        try {
            const newComment = await createComment(filename, commentContent);
            setComments(prev => [newComment, ...prev]);
            setCommentContent('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReplySubmit = async (commentId: number) => {
        if (!replyContent.trim() || !filename) return;
        setIsReplying(true);
        try {
            const updated = await createReply(filename, commentId, replyContent);
            setComments(prev => prev.map(c => c.id === commentId ? updated : c));
            setReplyingTo(null);
            setReplyContent('');
        } finally {
            setIsReplying(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!filename) return;
        await deleteComment(filename, commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    const handleDeleteReply = async (commentId: number) => {
        if (!filename) return;
        await deleteReply(filename, commentId);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, reply: null } : c));
    };

    const renderedContent = useMemo(() => (
        <ReactMarkdown
            components={{
                code({ inline, className, children }: CodeProps) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    if (inline || !language) {
                        return (
                            <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                            </code>
                        );
                    }
                    return (
                        <SyntaxHighlighter
                            language={language}
                            style={oneDark}
                            customStyle={{ borderRadius: '0.5rem', fontSize: '0.875rem', margin: '0' }}
                            showLineNumbers
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    );
                },
            }}
        >
            {post?.content ?? ''}
        </ReactMarkdown>
    ), [post?.content]);

    if (isLoading) {
        return (
            <div className="space-y-8 pt-10">
                <div className="space-y-4">
                    <div className="h-8 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="pt-10 text-center space-y-4">
                <p className="text-gray-400 dark:text-gray-500">글을 찾을 수 없습니다.</p>
                <Link to="/posts" className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    ← 목록으로
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-10 pt-10">
            <Link to="/posts" className="inline-flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                ← posts
            </Link>

            <div className="space-y-3 pb-8 border-b border-gray-100 dark:border-gray-800">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{post.title}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-400 dark:text-gray-500">
                    <span>{post.date}</span>
                    {post.description && (<><span>·</span><span>{post.description}</span></>)}
                </div>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none">
                {renderedContent}
            </div>

            <section className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    댓글
                    {comments.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({comments.length})</span>}
                </h2>

                {auth.isLoggedIn ? (
                    <div className="space-y-3">
                        <textarea
                            placeholder="댓글을 입력하세요"
                            value={commentContent}
                            onChange={e => setCommentContent(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors resize-none"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleCommentSubmit}
                                disabled={isSubmitting || !commentContent.trim()}
                                className="px-4 py-2 text-sm text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '작성 중...' : '댓글 작성'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 text-center space-y-3">
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                            GitHub 계정으로 로그인 후 댓글을 남길 수 있습니다.
                        </p>
                        <a
                            href={`https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=read:user`}
                            className="inline-block text-xs text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
                        >
                            GitHub로 로그인
                        </a>
                    </div>
                )}

                {comments.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                        첫 번째 댓글을 남겨보세요!
                    </p>
                ) : (
                    <div className="space-y-3">
                        {comments.map(comment => (
                            <div key={comment.id} className="group p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={comment.avatarUrl} alt={comment.author} className="w-7 h-7 rounded-full" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{comment.createdAt.slice(0, 10)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {auth.username === OWNER && !comment.reply && (
                                            <button
                                                onClick={() => { setReplyingTo(comment.id); setReplyContent(''); }}
                                                className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                            >
                                                답글
                                            </button>
                                        )}
                                        {(auth.username === comment.author || auth.username === OWNER) && (
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 dark:text-gray-300 pl-10 leading-relaxed">
                                    {comment.content}
                                </p>

                                {comment.reply && (
                                    <div className="ml-10 pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <img src={comment.reply.avatarUrl || `https://github.com/${OWNER}.png`} alt={OWNER} className="w-5 h-5 rounded-full" />
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                    {OWNER} · {comment.reply.createdAt.slice(0, 10)}
                                                </p>
                                            </div>
                                            {auth.username === OWNER && (
                                                <button
                                                    onClick={() => handleDeleteReply(comment.id)}
                                                    className="text-xs text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    삭제
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
                                            {comment.reply.content}
                                        </p>
                                    </div>
                                )}

                                {replyingTo === comment.id && (
                                    <div className="ml-10 space-y-2">
                                        <textarea
                                            placeholder="답글을 입력하세요"
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 text-sm bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setReplyingTo(null)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                                취소
                                            </button>
                                            <button
                                                onClick={() => handleReplySubmit(comment.id)}
                                                disabled={isReplying || !replyContent.trim()}
                                                className="px-3 py-1.5 text-xs text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-30"
                                            >
                                                {isReplying ? '작성 중...' : '답글 작성'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default PostDetailPage;
