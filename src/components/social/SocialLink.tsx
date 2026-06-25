import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const SOCIAL_SPRING = {
  type: 'spring' as const,
  mass: 5,
  stiffness: 1600,
  damping: 100,
};

type SocialPlatform = 'github' | 'linkedin';

interface SocialLinkProps {
  href: string;
  label: string;
  platform: SocialPlatform;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    update();
    document.addEventListener('themechange', update);

    return () => {
      document.removeEventListener('themechange', update);
    };
  }, []);

  return isDark;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setPrefersReducedMotion(media.matches);
    };

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return prefersReducedMotion;
}

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === 'github') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-.88.28-1.5 0-2.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function SocialLink({ href, label, platform }: SocialLinkProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isDark = useIsDark();
  const prefersReducedMotion = usePrefersReducedMotion();

  const defaultColor = isDark ? '#ffffff' : '#333333';
  const hoverColor = isDark ? '#333333' : '#ffffff';
  const circleColor = isDark ? '#ffffff' : '#333333';
  const transition = prefersReducedMotion ? { duration: 0 } : SOCIAL_SPRING;

  return (
    <motion.a
      href={href}
      className="social-anchor"
      target="_blank"
      rel="me noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      animate={{
        color: hovered ? hoverColor : defaultColor,
        scale: pressed ? 0.8 : 1,
      }}
      transition={transition}
    >
      <span className="social-anchor-icon">
        <SocialIcon platform={platform} />
      </span>
      <motion.span
        className="social-anchor-circle"
        aria-hidden="true"
        style={{ backgroundColor: circleColor }}
        initial={false}
        animate={{
          scale: hovered ? 1.25 : 0.5,
          opacity: hovered ? 1 : 0,
        }}
        transition={transition}
      />
    </motion.a>
  );
}
