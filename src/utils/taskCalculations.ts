export const calculateChecklistProgress = (checklist: any[] = []) => {
  if (!checklist || checklist.length === 0) {
    console.log('No checklist items found, returning default values');
    return {
      progress: 0,
      completedItems: 0,
      totalItems: 0
    };
  }

  const completedItems = checklist.filter(item => Boolean(item.completed)).length;
  const totalItems = checklist.length;
  const progress = Math.round((completedItems / totalItems) * 100);

  console.log('Calculated checklist progress:', {
    checklist,
    completedItems,
    totalItems,
    progress
  });

  return {
    progress,
    completedItems,
    totalItems
  };
};