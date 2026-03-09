/**
 * Simple confetti animation using CSS animations
 * No external dependencies - pure DOM manipulation
 */

export function triggerConfetti() {
  const confettiContainer = document.createElement('div');
  confettiContainer.id = 'confetti-container';
  confettiContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
  `;

  document.body.appendChild(confettiContainer);

  const colors = ['#a855f7', '#0ea5e9', '#f59e0b', '#ec4899', '#10b981'];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 1;
    const rotate = Math.random() * 360;

    confetti.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background: ${color};
      border-radius: 50%;
      left: ${left}%;
      top: -10px;
      opacity: 1;
      animation: confetti-fall ${duration}s linear ${delay}s forwards;
      transform: rotate(${rotate}deg);
    `;

    confettiContainer.appendChild(confetti);
  }

  // Add keyframe animation if not already exists
  if (!document.querySelector('style[data-confetti]')) {
    const style = document.createElement('style');
    style.setAttribute('data-confetti', 'true');
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Clean up after animation
  setTimeout(() => {
    confettiContainer.remove();
  }, 3500);
}

export function triggerSuccessPulse(element: HTMLElement) {
  element.style.animation = 'none';
  // Trigger reflow
  setTimeout(() => {
    element.style.animation = 'pulse 0.5s ease-in-out';
  }, 10);
}
