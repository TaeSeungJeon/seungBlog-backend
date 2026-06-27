import { useEffect, useRef, useState } from 'react';

function useScrollFadeIn(delay: number = 0) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                    observer.unobserve(element);
                }
            },
            {
                threshold: 0.05,
                rootMargin: '0px 0px -30px 0px',
            }
        );

        // 페이지 로드 직후 이미 보이는 요소 처리
        const rect = element.getBoundingClientRect();
        const isAlreadyVisible = rect.top < window.innerHeight * 0.7;

        if (isAlreadyVisible) {
            setTimeout(() => setIsVisible(true), delay);
        } else {
            observer.observe(element);
        }

        return () => observer.disconnect();
    }, [delay]);

    return { ref, isVisible };
}

export default useScrollFadeIn;