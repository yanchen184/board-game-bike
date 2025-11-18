import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for game loop using requestAnimationFrame
 * @param {Function} callback - Function to call each frame with deltaTime
 * @param {boolean} isPaused - Whether the game is paused
 * @param {number} timeScale - Time scale multiplier (1x, 5x, 10x, etc.)
 * @returns {Object} Control functions
 */
export function useGameLoop(callback, isPaused = false, timeScale = 1) {
  const requestRef = useRef();
  const lastTimeRef = useRef(Date.now());
  const isPausedRef = useRef(isPaused);
  const timeScaleRef = useRef(timeScale);

  // Update paused ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Update time scale ref
  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  const animate = useCallback(() => {
    const now = Date.now();
    const deltaTime = ((now - lastTimeRef.current) / 1000) * timeScaleRef.current; // Apply time scale
    lastTimeRef.current = now;

    if (!isPausedRef.current && callback) {
      callback(deltaTime);
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  return {
    reset: () => {
      lastTimeRef.current = Date.now();
    },
  };
}

export default useGameLoop;
