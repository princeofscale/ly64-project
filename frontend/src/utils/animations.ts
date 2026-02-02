/**
 * Animation Utilities - Framer Motion variants
 * Reusable animation configurations
 */

import type { Variants } from 'framer-motion';

// Page transition animations
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Card entrance animation
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// List item animation
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// Scale pop animation
export const scalePopVariants: Variants = {
  initial: {
    scale: 0,
  },
  animate: {
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// Slide in from right
export const slideInRightVariants: Variants = {
  initial: {
    x: 100,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Fade in animation
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// Alias for fadeIn
export const fadeIn = fadeInVariants;

// Slide up animation
export const slideUpVariants: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Alias for slideUp
export const slideUp = slideUpVariants;

// Scale in animation
export const scaleInVariants: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

// Alias for scaleIn
export const scaleIn = scaleInVariants;

// Bounce in animation (for achievements)
export const bounceInVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
  },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
    },
  },
};

// Progress bar animation
export const progressBarVariants: Variants = {
  initial: {
    width: 0,
  },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: {
      duration: 1,
      ease: 'easeOut',
    },
  }),
};

// Shake animation (for errors)
export const shakeVariants: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.4,
    },
  },
};

// Pulse animation (for notifications)
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 1,
    },
  },
};

// Hover lift animation
export const hoverLiftVariants: Variants = {
  initial: {},
  hover: {
    y: -5,
    transition: {
      duration: 0.2,
    },
  },
};

// Counter animation helper
export const animateCounter = (
  start: number,
  end: number,
  duration: number = 1000
): Promise<number> => {
  return new Promise(resolve => {
    const startTime = Date.now();
    const range = end - start;

    const updateCounter = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + range * eased);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        resolve(end);
      }

      return current;
    };

    updateCounter();
  });
};
