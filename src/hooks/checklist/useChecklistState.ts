import { useState, useEffect } from 'react';
import type { ChecklistItem } from '@/types/task';

interface UseChecklistStateProps {
  checklist: ChecklistItem[];
  onUpdate: (checklist: ChecklistItem[]) => void;
}

export const useChecklistState = ({ checklist, onUpdate }: UseChecklistStateProps) => {
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(checklist);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    console.log('Checklist updated in useChecklistState:', checklist);
    setLocalChecklist(checklist);
    calculateProgress(checklist);
  }, [checklist]);

  const calculateProgress = (items: ChecklistItem[]) => {
    if (!items?.length) {
      setProgress(0);
      return;
    }
    const completedItems = items.filter(item => item.completed).length;
    const progressValue = Math.round((completedItems / items.length) * 100);
    console.log('Calculated progress:', progressValue);
    setProgress(progressValue);
  };

  const updateLocalChecklist = (newChecklist: ChecklistItem[]) => {
    console.log('Updating local checklist:', newChecklist);
    setLocalChecklist(newChecklist);
    calculateProgress(newChecklist);
    onUpdate(newChecklist);
  };

  return {
    localChecklist,
    progress,
    updateLocalChecklist
  };
};