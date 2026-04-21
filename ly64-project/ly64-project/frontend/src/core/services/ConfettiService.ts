import confetti from 'canvas-confetti';

export type ConfettiPreset = 'success' | 'achievement' | 'celebration' | 'fireworks' | 'stars';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
}

class ConfettiServiceClass {
  private defaults: ConfettiOptions = {
    particleCount: 100,
    spread: 70,
    startVelocity: 30,
    decay: 0.95,
    gravity: 1,
    ticks: 200,
    origin: { x: 0.5, y: 0.5 },
  };

  private colors = {
    default: ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
    gold: ['#ffd700', '#ffb700', '#ffa500', '#ff8c00', '#fff8dc'],
    success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    rainbow: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8f00ff'],
  };

  fire(options?: ConfettiOptions): void {
    confetti({
      ...this.defaults,
      ...options,
      colors: options?.colors || this.colors.default,
    });
  }

  preset(type: ConfettiPreset): void {
    switch (type) {
      case 'success':
        this.successBurst();
        break;
      case 'achievement':
        this.achievementUnlock();
        break;
      case 'celebration':
        this.fullCelebration();
        break;
      case 'fireworks':
        this.fireworks();
        break;
      case 'stars':
        this.starShower();
        break;
    }
  }

  successBurst(): void {
    const end = Date.now() + 500;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: this.colors.success,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: this.colors.success,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  achievementUnlock(): void {
    const duration = 1500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: this.colors.gold,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: this.colors.gold,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: this.colors.gold,
        startVelocity: 45,
        gravity: 0.8,
        scalar: 1.2,
      });
    }, 300);
  }

  fullCelebration(): void {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors: this.colors.rainbow,
      });
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors: this.colors.rainbow,
      });
    }, 250);
  }

  fireworks(): void {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: randomInRange(50, 100),
        startVelocity: randomInRange(25, 55),
        spread: randomInRange(50, 70),
        origin: {
          x: randomInRange(0.2, 0.8),
          y: randomInRange(0.3, 0.7),
        },
        colors: this.colors.rainbow,
        gravity: randomInRange(0.8, 1.2),
      });
    }, 300);
  }

  starShower(): void {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: this.colors.gold,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['circle'],
      });

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        shapes: ['circle'],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }

  scoreBasedCelebration(score: number): void {
    if (score >= 90) {
      this.fullCelebration();
    } else if (score >= 80) {
      this.achievementUnlock();
    } else if (score >= 70) {
      this.successBurst();
    } else if (score >= 60) {
      this.fire({
        particleCount: 50,
        spread: 60,
        colors: this.colors.success,
      });
    }
  }

  reset(): void {
    confetti.reset();
  }
}

export const ConfettiService = new ConfettiServiceClass();
