import { useCallback, useRef } from 'react';

/**
 * Hook para throttle de funciones
 * Útil para limitar la frecuencia de llamadas (ej: WebSocket cursor updates)
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 100
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  ) as T;
}
