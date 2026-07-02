import { useState, useCallback, useRef } from "react";

interface UseRateLimitReturn {
  canSend: boolean;
  markSent: () => void;
}

export function useRateLimit(minIntervalMs: number): UseRateLimitReturn {
  const [canSend, setCanSend] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markSent = useCallback(() => {
    setCanSend(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setCanSend(true);
    }, minIntervalMs);
  }, [minIntervalMs]);

  return { canSend, markSent };
}
