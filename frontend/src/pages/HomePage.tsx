import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getPosts} from '../api/postApi';
import type {Post} from '../types';
import useScrollFadeIn from '../hooks/useScrollFadeIn';

const PROFILE_IMAGE = 'itsme.png';

const RECENT_PROJECTS = [
    {
        title: '승 블로그 Front-end',
        description: 'Spring Boot + React + Vite 승 블로그 등장!',
        stack: ['Spring Boot', 'React', 'GitHub API'],
        github: 'https://github.com/TaeSeungJeon/SeungBlog',
        status: 'done',
    },
    {
        title: '승 블로그 Back-end',
        description: '영업 비밀이라 알려주기 싫은데~~~',
        stack: ['Spring Boot', 'React', 'GitHub API'],
        github: 'https://github.com/TaeSeungJeon/seungBlog-backend',
        status: /*'in progress'*/'done',
    },
    {
        title: '중간 프로젝트 영화 커뮤니티 Cinema-Talk !',
        description: '대덕 인재개발원 영화 커뮤니티 주제 5인 1조 PL:전태승',
        stack: ['Java', 'Oracle DB', 'Servlet MVC', 'JSP', 'HTML', 'CSS', 'JavaScript', '...'],
        github: 'https://taeseungjeon.github.io/SeungBlog/#/posts/MiddlePj-CinemaTalk.md',
        demo: null,
        status: 'done',
    },
];

const PIXED_POSTS = [
    {
        title: '서버가 아무것도 저장을 하지 않는다고? WAS & JWT ',
        description: 'WAS와 JWT의 정의, 사용 방법 그리고 둘이 만났을 때 어떤 환경이 만들어지는가',
        link: 'https://taeseungjeon.github.io/SeungBlog/#/posts/WASandJWT.md',
        demo: null,
    },
    {
        title: '커넥션 풀, 왜필요한가? 그리고 HikariCP 알고 쓰자! 光',
        description: 'JDBC 학습중이라면 히카리는 듣고 가자!',
        link: 'https://taeseungjeon.github.io/SeungBlog/#/posts/HikariCP.md',
        demo: null,
    },
]

// 각 자리에서 반복할 단어 목록
const WORDS_LINE1 = ['백엔드', 'React', 'Java', 'Spring Boot'];
const WORDS_LINE2 = ['전태승', 'TaeSeung', 'Seung'];

const TYPING_SPEED = 80;
const DELETING_SPEED = 70;
const PAUSE_TIME = 1400;


function useTypewriter(words: string[]) {
    const [text, setText] = useState('');
    const [wordIndex, setWordIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex % words.length];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting) {
            if (text.length < currentWord.length) {
                timeout = setTimeout(() => {
                    setText(currentWord.slice(0, text.length + 1));
                }, TYPING_SPEED);
            } else {
                timeout = setTimeout(() => setIsDeleting(true), PAUSE_TIME);
            }
        } else {
            if (text.length > 0) {
                timeout = setTimeout(() => {
                    setText(currentWord.slice(0, text.length - 1));
                }, DELETING_SPEED);
            } else {
                setIsDeleting(false);
                setWordIndex((prev) => prev + 1);
            }
        }

        return () => clearTimeout(timeout);
    }, [text, isDeleting, wordIndex, words]);

    return text;
}

function HomePage() {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const intro = useScrollFadeIn(0);
    const pixedPost = useScrollFadeIn(100);
    const recentPost = useScrollFadeIn(200);
    const projects = useScrollFadeIn(300);


    const line1Text = useTypewriter(WORDS_LINE1);
    const line2Text = useTypewriter(WORDS_LINE2);

    useEffect(() => {
        getPosts().then((posts) => setRecentPosts(posts.slice(0, 3)));
    }, []);

    return (
        <div className="space-y-20">

            {/* 인트로 섹션 */}
            <section
                ref={intro.ref}
                className={`fade-up ${intro.isVisible ? 'visible' : ''} pt-10`}
            >
                <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-6 sm:gap-8">

                    {/* 텍스트 */}
                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                안녕하세요!
                            </p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                <span className="text-blue-500 dark:text-blue-400">{line1Text}</span>
                                <span className="animate-pulse text-blue-500 dark:text-blue-400">|</span>
                                를 좋아하는
                            </p>
                            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                                개발자{' '}
                                <span className="text-blue-500 dark:text-blue-500">{line2Text}</span>
                                <span className="animate-pulse text-blue-500 dark:text-blue-400">|</span>
                                입니다.
                            </p>
                        </div>
                        <p className="text-m text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
                            영써티 영써티 하는데 영써티라고 놀리지 마세요!
                            <br/>
                            남자는 써티부터 아니겠써티까 하하하하!!
                        </p>
                        <div className="flex items-center gap-6">
                            {[
                                {label: 'github', href: 'https://github.com/TaeSeungJeon'},
                                /*{label: ' blog', href: 'https://github.com/TaeSeungJeon/TaeSeung-Blog'},*/
                                /*{label: ' velog', href: 'https://velog.io/@xoxo832/posts'},*/
                                {label: ' Notion', href: 'https://www.notion.so/It-xT-3345853a763f80f99a3ed9c85453b270'},

                            ].map((link) => (
                                <a key={link.label}
                                   href={link.href}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-sm text-gray-400 dark:text-white hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:-translate-y-0.5"
                                >
                                    {link.label} ↗
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 프로필 이미지 */}
                    <div className="shrink-0">
                        {PROFILE_IMAGE ? (
                            <img
                                src={PROFILE_IMAGE}
                                alt="프로필"
                                className="w-40 sm:w-60 h-auto mx-auto"
                            />
                        ) : (
                            <div
                                className="w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                                <span className="text-3xl">👨‍💻</span>
                            </div>
                        )}
                    </div>
                </div>
                <hr color="gray 200" className="border-gray-200 dark:border-gray-800"/>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Java와 Spring Boot, DB 백엔드를 중심으로, React를 더해 풀스텍 개발을 공부하고 있는
                    <br/>
                    직접 만들고, 부수고, 넘어지면서 배우는 걸 좋아하는 슈퍼루키 신입 개발자 전태승입니다.
                    <br/>
                    이 블로그가 그 기록의 공간입니다.
                </p>
                <Link to="/about"
                      className="inline-block text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    About me ↗
                </Link>
            </section>

            {/* 게시글 픽스 */}
            <section ref={pixedPost.ref} className={`fade-up ${pixedPost.isVisible ? 'visible' : ''} space-y-6`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-m font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Pixed posts
                    </h2>
                    <Link to="/Posts"
                          className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        all posts →
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {PIXED_POSTS.map((post) => (

                        <a key={post.title}
                           href={post.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="group p-5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5 block space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {post.title}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                  ↗
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                {post.description}
                            </p>
                        </a>
                    ))}
                </div>
            </section>


            {/* 최근 포스트 */}
            <section ref={recentPost.ref} className={`fade-up ${recentPost.isVisible ? 'visible' : ''} space-y-6`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-m font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Recent Posts
                    </h2>
                    <Link to="/posts"
                        className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" >
                        all posts →
                    </Link>
                </div>
                <div className="space-y-1">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.filename}
                            to={`/posts/${post.filename}`}
                            className="group flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200" >
                            <div className="space-y-1">
                                <p className="text-lg font-medium text-gray-900 dark:text-white group-hover:translate-x-1 transition-transform duration-200">
                                    {post.title}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">
                                    {post.description}
                                </p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-6 group-hover:opacity-70 transition-opacity">
                              {post.date}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>


            {/* 최근 프로젝트 */}
            <section ref={projects.ref} className={`fade-up ${projects.isVisible ? 'visible' : ''} space-y-6`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-m font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                        Recent Projects
                    </h2>
                    <Link to="/playground"
                        className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        all projects →
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {RECENT_PROJECTS.map((project) => (

                        <a key={project.title}
                           href={project.github}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="group p-5 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5 block space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                                        {project.title}
                                    </p>
                                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                                        project.status === 'in progress'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                  ↗
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {project.stack.map((tech) => (
                                    <span key={tech}
                                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                      {tech}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default HomePage;