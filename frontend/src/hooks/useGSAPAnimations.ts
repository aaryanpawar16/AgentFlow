import { useEffect } from 'react';
import { gsap } from 'gsap';

export const useGSAPAnimations = () => {
  useEffect(() => {
    // Global cursor trail effect
    const cursor = document.createElement('div');
    cursor.className = 'fixed w-4 h-4 bg-blue-400 rounded-full pointer-events-none z-50 mix-blend-difference';
    document.body.appendChild(cursor);

    const moveCursor = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX - 8,
        y: e.clientY - 8,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  const animateOnClick = (element: HTMLElement) => {
    gsap.to(element, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  };

  const glowEffect = (element: HTMLElement, color: string = 'blue') => {
    gsap.to(element, {
      boxShadow: `0 0 30px rgba(${color === 'blue' ? '59, 130, 246' : color === 'purple' ? '147, 51, 234' : '20, 184, 166'}, 0.8)`,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const removeGlow = (element: HTMLElement) => {
    gsap.to(element, {
      boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  return {
    animateOnClick,
    glowEffect,
    removeGlow
  };
};