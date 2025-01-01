export const getProgressColor = (progress: number): string => {
  if (progress <= 20) {
    return 'rgb(59, 130, 246)'; // Light blue
  } else if (progress <= 40) {
    return 'rgb(234, 179, 8)';  // Yellow
  } else if (progress <= 60) {
    return 'rgb(251, 191, 36)'; // Amber
  } else if (progress <= 80) {
    return 'rgb(249, 115, 22)'; // Orange
  } else {
    return 'rgb(34, 197, 94)';  // Green
  }
};