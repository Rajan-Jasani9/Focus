import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';

export const useSuggestions = () => {
  const tasks = useTaskStore((state) => state.tasks);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category).filter(Boolean));
    return Array.from(cats);
  }, [tasks]);

  const types = useMemo(() => {
    const typs = new Set(tasks.map((t) => t.type).filter(Boolean));
    return Array.from(typs);
  }, [tasks]);

  return { categories, types };
};
