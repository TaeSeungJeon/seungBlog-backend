import useScrollFadeIn from '../hooks/useScrollFadeIn';

const SEUNG_BLOG_IMG = 'blogMain.png'
const CINEMA_TALK_IMG = 'cinemaTalk.png'

const PROJECTS = [
    {
        title: 'Seung Blog',
        description: 'Spring Boot + React로 만든 개인 포트폴리오 블로그. GitHub API 연동, JWT 인증 구현.',
        image: SEUNG_BLOG_IMG,
        stack: ['Spring Boot', 'React', 'TypeScript', 'GitHub API', '...'],
        github: 'https://github.com/TaeSeungJeon/seung-backend',
        demo: null,
        notion: 'https://www.notion.so/Seung-Blog-3345853a763f80f99a3ed9c85453b270',
        status: 'in progress',
    },
    {
        title: 'Cinema-Talk Middle Project',
        description: '대덕 인재개발원 중간 프로젝트 1조 PL',
        image: CINEMA_TALK_IMG,
        stack: ['Java', 'Oracle DB', 'Servlet MVC', 'JSP', 'HTML', 'CSS', 'JavaScript', '...'],
        github: null,
        notion: 'https://www.notion.so/Cinema-Talk-3335853a763f80d3869ded50062845af',
        demo: 'https://taeseungjeon.github.io/SeungBlog/?code=fc05f54f547124bf1f38#/posts/MiddlePj-CinemaTalk.md',
        status: 'done',
    },
];

function PlaygroundPage() {
    const title = useScrollFadeIn(0);
    const list = useScrollFadeIn(150);

    return (
        <div className="space-y-12 pt-10">

            <section
                ref={title.ref}
                className={`fade-up ${title.isVisible ? 'visible' : ''} space-y-2`}>
                <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Playground
                </p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Projects
                </h1>
                <p className="text-m text-gray-400 dark:text-gray-500">
                    직접 만들어본 프로젝트들입니다.
                </p>
            </section>

            <section
                ref={list.ref}
                className={`fade-up ${list.isVisible ? 'visible' : ''} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
                {PROJECTS.map((project) => (
                    <div
                        key={project.title}
                        className="group flex flex-col rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">

                        {/* 이미지 영역 - 세로 비율로 상단 고정 */}
                        {project.image ? (
                            <div className="w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={project.image}
                                    alt={`${project.title} 미리보기`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        ) : (
                            // 이미지 없을 때 빈 플레이스홀더
                            <div
                                className="w-full aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-300 dark:text-gray-600 text-sm">No Image</span>
                            </div>
                        )}

                        {/* 텍스트 영역 */}
                        <div className="flex flex-col flex-1 p-5 space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {project.title}
                                    </h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        project.status === 'in progress'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                    }`}>
                                        {project.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {project.stack.map((tech) => (
                                    <span
                                        key={tech}
                                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            {/* 링크 - 하단 고정 */}
                            <div className="flex items-center gap-4 pt-1 mt-auto">
                                {project.github && (
                                    <a href={project.github}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        github ↗
                                    </a>
                                )}
                                {project.demo && (
                                    <a href={project.demo}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        Posts ↗
                                    </a>
                                )}
                                {project.notion && (
                                    <a href={project.notion}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        notion ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </section>

        </div>
    );
}

export default PlaygroundPage;