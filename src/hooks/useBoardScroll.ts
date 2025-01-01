import { useState, useRef } from 'react';

export const useBoardScroll = () => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't initiate scroll if we're clicking on a task card
    if ((e.target as HTMLElement).closest('.kanban-card')) {
      return;
    }

    if (!boardRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - boardRef.current.offsetLeft);
    setScrollLeft(boardRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !boardRef.current) return;

    // Set a flag to indicate we're actually scrolling
    if (!isScrolling) {
      setIsScrolling(true);
    }

    e.preventDefault();
    const x = e.pageX - boardRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    boardRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsScrolling(false);
  };

  return {
    boardRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isScrolling
  };
};