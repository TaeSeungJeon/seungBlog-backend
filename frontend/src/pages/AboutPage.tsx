import useScrollFadeIn from '../hooks/useScrollFadeIn';

const PROFILE_IMAGE2 = 'me.jpg';

const SKILLS = {
    Backend: ['Java', 'Spring Boot', 'Spring MVC', 'Servlet', 'Oracle DB', '...'],
    Frontend: ['React', 'TypeScript', 'Vite', 'CSS', 'Tailwind CSS', 'HTML', 'JSP', '...'],
    DevOps: ['Git', 'GitHub', 'Oracle Cloud','...'],
};

const EXPERIENCES = [
    {
        period: '2026.04',
        title: 'Spring-Boot & React 개인 블로그 배포',
        description: '역량강화 개인 플레이그라운드 프로젝트 설계, 구현, 배포 진행',
    },
    {
        period: '2026.02.28',
        title: 'Cinema-Talk 영화 커뮤니티 프로젝트 참여',
        description: '중간 프로젝트 1조 PL / 게시판 front, back, db 구현 담당',
    },
    {
        period: '2025.12 ~ 2026.~07',
        title: '전자정부 Framework & React(AWS)기반 풀-스택 과정',
        description: '대덕 인재개발원 25년 14기 / java, spring, ts, node js 등',
    },
];

const EDUCATION = [
    {
        period: '2016.03 ~ 2018.02',
        title: '대구 과학대학교',
        description: '제 24대 대의원회 호텔관광과 학회장'
    }
]

const OTHER = [
    {
        period: '2026 ~',
        title: '(주)코드베일리',
        description: '백오피스(Back-office) 프로그램 제작 / AI 활용 개발 역량 학습'
    },
    {
        period: '2023 ~ 2025',
        title: '오뎅오색 대전 노은역점 운영',
        description: '오뎅바 운영 자영업 경험'
    },
    {
        period: '2020 ~ 2024',
        title: '부동산 중개 업무',
        description: '원, 투룸 임대로 시작해 상가 임대 중개 업무 경험'
    },
]

function AboutPage() {
    const intro = useScrollFadeIn(0);
    const skills = useScrollFadeIn(150);
    const exp = useScrollFadeIn(300);
    const education = useScrollFadeIn(450);
    const other = useScrollFadeIn(550);

    return (
        <div className="space-y-20 pt-10">

            <section
                ref={intro.ref}
                className={`fade-up ${intro.isVisible ? 'visible' : ''} space-y-6`}
            >
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                    {/* 프로필 이미지 */}
                    <div className="shrink-0">
                        <div
                            className="w-50 h-75 flex items-center justify-center ">
                            <img
                                src={PROFILE_IMAGE2}
                                alt="프로필 image"
                                className="w-40 sm:w-auto max-w-[200px]"
                            />
                        </div>
                    </div>

                    {/* 텍스트 */}
                    <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                TaeSeung Jeon
                            </h1>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-300">
                                전 태승
                            </h1>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
                            Java와 Spring Boot, DB 등 백엔드를 기반으로 역량 강화를 위해 <br/>
                            React를 더해 풀스텍 개발을 공부하고 있는 직접 만들고, 부수고, <br/>
                            넘어지면서 배우는 걸 좋아하는 슈퍼루키 신입 개발자 전태승입니다.<br/>
                            이 블로그는 인재로 거듭날 성장과정 기록의 공간입니다.
                        </p>
                        <div className="flex flex-col gap-2">
                            {[
                                {
                                    label: 'GitHub.',
                                    href: 'https://github.com/TaeSeungJeon',
                                    value: 'github.com/TaeSeungJeon'
                                },
                                {label: 'Email.', href: 'mailto:xoxoxx832@gmail.com', value: 'xoxoxx832@gmail.com'},
                                {label: 'Portfolio.', href: `${import.meta.env.BASE_URL}portfolio.png`, value: '포트폴리오 보기'},
                                {label: 'Address.', value: 'DaeJeon, South Korea'},

                            ].map((contact) => (
                                <div key={contact.label} className="flex items-center gap-4 text-sm">
                                    <span className="w-12 text-gray-400 dark:text-gray-500 shrink-0">
                                      {contact.label}
                                    </span>

                                    <a href={contact.href}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {contact.value}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <hr color="gray 200" className="border-gray-200 dark:border-gray-800"/>
            </section>

            <section
                ref={skills.ref}
                className={`fade-up ${skills.isVisible ? 'visible' : ''} space-y-6`}>
                <h2 className="text-s font-medium text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    Skills
                </h2>
                <div className="space-y-4">
                    {Object.entries(SKILLS).map(([category, skillList]) => (
                        <div key={category} className="flex gap-4">
              <span className="text-sm text-gray-400 dark:text-gray-500 w-20 shrink-0 pt-0.5">
                {category}
              </span>
                            <div className="flex flex-wrap gap-2">
                                {skillList.map((skill) => (
                                    <span
                                        key={skill}
                                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                                      {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section ref={exp.ref}
                     className={`fade-up ${exp.isVisible ? 'visible' : ''} space-y-6`}>
                <hr color="gray 200" className="border-gray-200 dark:border-gray-900"/>
                <h2 className="text-s font-medium text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    DEV Experience
                </h2>
                <div className="space-y-6">
                    {EXPERIENCES.map((item) => (
                        <div key={item.title} className="flex gap-4">
              <span className="text-sm text-gray-400 dark:text-gray-500 w-22 shrink-0 pt-0.5">
                {item.period}
              </span>
                            <div className="space-y-1">
                                <p className="text-m font-medium text-gray-900 dark:text-white">
                                    {item.title}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section ref={education.ref}
                     className={`fade-up ${education.isVisible ? 'visible' : ''} space-y-6`}>
                <hr color="gray 200" className="border-gray-200 dark:border-gray-900"/>
                <h2 className="text-s font-medium text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    EDUCATION
                </h2>
                <div className="space-y-6">
                    {EDUCATION.map((item) => (
                        <div key={item.title} className="flex gap-4">
              <span className="text-sm text-gray-400 dark:text-gray-500 w-22 shrink-0 pt-0.5">
                {item.period}
              </span>
                            <div className="space-y-1">
                                <p className="text-m font-medium text-gray-900 dark:text-white">
                                    {item.title}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section ref={other.ref}
                     className={`fade-up ${other.isVisible ? 'visible' : ''} space-y-6`}>
                <hr color="gray 200" className="border-gray-200 dark:border-gray-900"/>
                <h2 className="text-s font-medium text-gray-400 dark:text-gray-300 uppercase tracking-widest">
                    CAREER
                </h2>
                <div className="space-y-6">
                    {OTHER.map((item) => (
                        <div key={item.title} className="flex gap-4">
              <span className="text-sm text-gray-400 dark:text-gray-500 w-22 shrink-0 pt-0.5">
                {item.period}
              </span>
                            <div className="space-y-1">
                                <p className="text-m font-medium text-gray-900 dark:text-white">
                                    {item.title}
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

export default AboutPage;