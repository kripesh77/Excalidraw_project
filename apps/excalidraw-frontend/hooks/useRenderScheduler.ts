"use client";

import { useCallback, useRef } from "react";

export function useRenderScheduler(render: () => void) {
  const rafRef = useRef<number | null>(null);

  const schedule = useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  return schedule;
}
