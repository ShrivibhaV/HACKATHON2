/**
 * COGNIX Pillar 3 — Cognitive Overload Detection
 * Tracks idle time and rapid scroll, triggers micro-break interventions.
 */

export interface CognitiveSignals {
  idleMs: number;
  scrollVelocity: number; // px/sec
  backScrollCount: number;
  isOverloaded: boolean;
}

export class CognitiveMonitor {
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastScrollY = 0;
  private lastScrollTime = Date.now();
  private backScrollCount = 0;
  private onIdle?: () => void;
  private onRapidScroll?: () => void;
  private idleThresholdMs: number;

  constructor(options: {
    onIdle?: () => void;
    onRapidScroll?: () => void;
    idleThresholdMs?: number;
  }) {
    this.onIdle = options.onIdle;
    this.onRapidScroll = options.onRapidScroll;
    this.idleThresholdMs = options.idleThresholdMs ?? 10000;
  }

  private resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      this.onIdle?.();
    }, this.idleThresholdMs);
  }

  handleScroll = () => {
    const now = Date.now();
    const currentY = window.scrollY;
    const deltaTime = now - this.lastScrollTime;
    const deltaY = currentY - this.lastScrollY;

    if (deltaTime > 0) {
      const velocity = Math.abs(deltaY) / deltaTime * 1000; // px/sec
      if (velocity > 1200 && deltaY > 0) {
        this.onRapidScroll?.();
      }
    }

    // Back-scroll detection
    if (deltaY < -80) {
      this.backScrollCount += 1;
    }

    this.lastScrollY = currentY;
    this.lastScrollTime = now;
    this.resetIdleTimer();
  };

  handleActivity = () => {
    this.resetIdleTimer();
  };

  start() {
    if (typeof window === 'undefined') return;
    this.resetIdleTimer();
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('mousemove', this.handleActivity, { passive: true });
    window.addEventListener('keydown', this.handleActivity, { passive: true });
    window.addEventListener('touchstart', this.handleActivity, { passive: true });
  }

  stop() {
    if (typeof window === 'undefined') return;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('mousemove', this.handleActivity);
    window.removeEventListener('keydown', this.handleActivity);
    window.removeEventListener('touchstart', this.handleActivity);
  }
}
