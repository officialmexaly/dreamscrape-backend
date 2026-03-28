import React, { useEffect, useState, useRef } from 'react';
interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
}
export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 800,
  className = ''
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let previousY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrollDirection(currentY > previousY ? 'down' : 'up');
      previousY = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -8% 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (isVisible || direction === 'none') {
      return 'translate3d(0, 0, 0)';
    }

    switch (direction) {
      case 'up':
        return scrollDirection === 'down' ? 'translate3d(0, 48px, 0)' : 'translate3d(0, -48px, 0)';
      case 'down':
        return scrollDirection === 'down' ? 'translate3d(0, -48px, 0)' : 'translate3d(0, 48px, 0)';
      case 'left':
        return scrollDirection === 'down' ? 'translate3d(48px, 0, 0)' : 'translate3d(-48px, 0, 0)';
      case 'right':
        return scrollDirection === 'down' ? 'translate3d(-48px, 0, 0)' : 'translate3d(48px, 0, 0)';
      default:
        return 'translate3d(0, 0, 0)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0.08,
        transform: getTransform(),
        transition: `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform'
      }}>
      
      {children}
    </div>);

}
