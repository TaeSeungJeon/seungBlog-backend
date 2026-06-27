import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../api/postApi';
import type { Post } from '../types';

const CATEGORIES = ['전체보기', 'Dev', 'Etc.'];

function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('전체보기');


    useEffect(() => {
        getPosts()
            .then(setPosts)
            .finally(() => setIsLoading(false));
    }, []);

    const filteredPosts = selectedCategory === '전체보기'
        ? posts
        : posts.filter((post) => post.category === selectedCategory);

    return (
        <div className="space-y-12">

            {/* 페이지 타이틀 */}
            <div className="space-y-2 pt-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Posts
                </h1>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                    {isLoading ? '...' : `${filteredPosts.length}개의 글`}
                </p>
            </div>

            {/* 카테고리 탭 */}
            <div className="flex gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                            selectedCategory === cat
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                                : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 글 목록 */}
            <section className="space-y-1">
                {isLoading ? (
                    <div className="space-y-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
                            >
                                <div className="space-y-2">
                                    <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                                <div className="h-3 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <p className="text-m text-gray-400 dark:text-gray-500 py-10 text-center">
                        아직 작성된 글이 없습니다.
                    </p>
                ) : (
                    filteredPosts.map((post) => (
                        <Link
                            key={post.filename}
                            to={`/posts/${post.filename}`}
                            className="group flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                        >
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform duration-200">
                                    {post.title}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {post.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-6">
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {post.category}
                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:opacity-70 transition-opacity">
                  {post.date}
                </span>
                            </div>
                        </Link>
                    ))
                )}
            </section>

        </div>
    );
}

export default PostsPage;