import confetti from 'canvas-confetti';

/**
 * Safe Confetti trigger wrapper that handles iframe sandboxing and disables
 * worker threading to avoid canvas.getBoundingClientRect errors.
 */
export function triggerConfetti(options: confetti.Options = {}) {
  try {
    if (typeof window === 'undefined') return;

    // Use safe local animation without worker thread to prevent iframe canvas errors
    const safeOptions: confetti.Options = {
      disableForReducedMotion: true,
      ...options,
    };

    // Create a safe confetti instance configured with useWorker: false
    const fire = confetti.create(undefined, {
      resize: true,
      useWorker: false,
      disableForReducedMotion: true,
    });

    fire(safeOptions);
  } catch (err) {
    // Gracefully ignore any non-critical animation errors
    console.warn('[Safe Confetti note]:', err);
  }
}
