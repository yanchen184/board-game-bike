import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for game loop using requestAnimationFrame
 * @param {Function} callback - Function to call each frame with deltaTime
 * @param {boolean} isPaused - Whether the game is paused
 * @returns {Object} Control functions
 */
export function useGameLoop(callback, isPaused = false) {
  const requestRef = useRef();
  const lastTimeRef = useRef(Date.now());
  const isPausedRef = useRef(isPaused);

  // Update paused ref
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const animate = useCallback(() => {
    const now = Date.now();
    const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
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
