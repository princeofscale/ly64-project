import { useState, useCallback } from 'react';

const STORAGE_KEY = 'theory-progress-v1';

function loadStudied(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

function saveStudied(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export function useTheoryProgress() {
  const [studied, setStudied] = useState<Set<string>>(loadStudied);

  const toggleTopic = useCallback((topicId: string) => {
    setStudied(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      saveStudied(next);
      return next;
    });
  }, []);

  const isStudied = useCallback(
    (topicId: string) => studied.has(topicId),
    [studied],
  );

  const getProgress = useCallback(
    (topicIds: string[]) => ({
      studied: topicIds.filter(id => studied.has(id)).length,
      total: topicIds.length,
    }),
    [studied],
  );

  return { toggleTopic, isStudied, getProgress };
}
