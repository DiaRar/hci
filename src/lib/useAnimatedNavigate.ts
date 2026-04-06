import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, type NavigateOptions, type To } from 'react-router-dom';

const DEFAULT_NAVIGATION_DELAY_MS = 180;

type AnimatedNavigateOptions = NavigateOptions & {
  delayMs?: number;
};

export function useAnimatedNavigate(defaultDelayMs = DEFAULT_NAVIGATION_DELAY_MS) {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (to: To, options?: AnimatedNavigateOptions) => {
      const { delayMs = defaultDelayMs, ...navigateOptions } = options ?? {};

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        navigate(to, navigateOptions);
      }, delayMs);
    },
    [defaultDelayMs, navigate],
  );
}

export { DEFAULT_NAVIGATION_DELAY_MS };
