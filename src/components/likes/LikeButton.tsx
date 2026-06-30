import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';
import { useState } from 'react';

import { useLikes } from '../../lib/hooks/useLikes';
import { cn } from '../../lib/likes/cn';
import { MAX_LIKES_PER_USER } from '../../lib/likes/constants';
import { Heart } from './Heart';

interface LikeButtonProps {
  postId: string;
  initialCount?: number;
  className?: string;
  enabled?: boolean;
}

function AnimatedDigit({ digit, direction }: { digit: string; direction: 'up' | 'down' }) {
  return (
    <div
      className="relative inline-flex h-[1em] w-[0.6em] items-center justify-center overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: direction === 'up' ? '100%' : '-100%', filter: 'blur(4px)' }}
          animate={{ y: '0%', filter: 'blur(0px)' }}
          exit={{ y: direction === 'up' ? '-100%' : '100%', filter: 'blur(4px)' }}
          transition={{
            duration: 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="absolute leading-none"
          style={{
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const [[prevValue, direction], setState] = useState<[number, 'up' | 'down']>([value, 'up']);

  if (value !== prevValue) {
    setState([value, value > prevValue ? 'up' : 'down']);
  }

  const digits = String(value).split('');

  return (
    <span className="inline-flex leading-none tabular-nums">
      {digits.map((digit, i) => (
        <AnimatedDigit key={digits.length - 1 - i} digit={digit} direction={direction} />
      ))}
    </span>
  );
}

function generateParticles(intensity: number) {
  const count = Math.floor(8 + intensity * 10);
  const baseSpread = 40 + intensity * 30;
  const baseSize = 6 + intensity * 6;
  const baseDuration = 0.5 + intensity * 0.3;

  return Array.from({ length: count }, () => ({
    angle: Math.random() * Math.PI * 2,
    distance: baseSpread * (0.7 + Math.random() * 0.6),
    size: baseSize * (0.6 + Math.random() * 0.6),
    duration: baseDuration * (0.8 + Math.random() * 0.4),
  }));
}

export function LikeButton({
  postId,
  initialCount = 0,
  className,
  enabled = true,
}: LikeButtonProps) {
  const { count, userLikes, canLike, isLoading, addLike, removeLike } = useLikes(
    postId,
    initialCount,
    enabled,
  );
  const [isShaking, setIsShaking] = useState(false);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  const [particleKey, setParticleKey] = useState(0);

  const buttonScale = useMotionValue(1);
  const buttonSpring = useSpring(buttonScale, { stiffness: 400, damping: 25 });

  const heartScale = useMotionValue(1);
  const heartSpring = useSpring(heartScale, { stiffness: 500, damping: 15, mass: 0.5 });

  const handleClick = async () => {
    if (isLoading) return;

    if (!canLike) {
      setIsShaking(true);
      heartScale.set(1.2);
      setTimeout(() => {
        setIsShaking(false);
        heartScale.set(1);
      }, 500);
      return;
    }

    const intensity = (userLikes + 1) / MAX_LIKES_PER_USER;
    setParticles(generateParticles(intensity));
    setParticleKey((k) => k + 1);

    buttonScale.set(1.02);
    setTimeout(() => buttonScale.set(1), 100);

    heartScale.set(1.18 + intensity * 0.15);
    setTimeout(() => heartScale.set(1), 150);

    await addLike();
  };

  const handlePointerDown = () => {
    buttonScale.set(0.97);
    heartScale.set(0.88);
  };

  const handlePointerUp = () => {
    if (!isShaking) {
      buttonScale.set(1);
      heartScale.set(1);
    }
  };

  const handleContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading || userLikes <= 0) return;

    buttonScale.set(0.98);
    heartScale.set(0.9);
    setTimeout(() => {
      buttonScale.set(1);
      heartScale.set(1);
    }, 100);

    await removeLike();
  };

  const isFilled = userLikes > 0;
  const fillProgress = userLikes / MAX_LIKES_PER_USER;

  const heartColor = isFilled
    ? `hsl(0, ${70 + fillProgress * 30}%, ${55 - fillProgress * 10}%)`
    : undefined;

  return (
    <motion.div
      style={{ scale: buttonSpring }}
      animate={isShaking ? { x: [0, -4.5, 4.5, -4.5, 4.5, -2.7, 2.7, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        disabled={isLoading}
        className={cn(
          'inline-flex h-7 cursor-pointer items-center justify-center gap-1 rounded-full border-0 pr-2.5 pl-2 font-medium whitespace-nowrap select-none',
          'bg-white text-neutral-600 shadow-sm ring-[0.5px] ring-black/10 hover:bg-neutral-100',
          'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-100',
          'dark:bg-neutral-800 dark:text-neutral-400 dark:ring-white/10 dark:hover:bg-neutral-700',
          isFilled &&
            'text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400',
          className,
        )}
        aria-label={`Like this. Current likes: ${count}. You've liked ${userLikes} times.`}
        style={isFilled ? { color: heartColor } : undefined}
      >
        <div className="relative">
          <motion.div style={{ scale: heartSpring }}>
            <Heart size={20} className="fill-current transition-all" />
          </motion.div>

          <AnimatePresence>
            {particles.length > 0 && (
              <motion.div
                key={particleKey}
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {particles.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 rounded-full bg-red-400"
                    style={{ width: p.size, height: p.size }}
                    initial={{
                      x: '-50%',
                      y: '-50%',
                      scale: 1,
                      opacity: 1,
                      filter: 'blur(0px)',
                    }}
                    animate={{
                      x: `calc(-50% + ${Math.cos(p.angle) * p.distance}px)`,
                      y: `calc(-50% + ${Math.sin(p.angle) * p.distance}px)`,
                      scale: 0,
                      opacity: 0,
                      filter: `blur(${Math.round(p.distance / 12)}px)`,
                    }}
                    transition={{ duration: p.duration, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="-translate-x-px translate-y-px leading-none">
          <AnimatedNumber value={count} />
        </span>
      </button>
    </motion.div>
  );
}

export default LikeButton;
