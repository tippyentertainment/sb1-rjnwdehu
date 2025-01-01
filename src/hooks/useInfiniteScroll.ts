import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollProps {
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
}

export const useInfiniteScroll = ({ 
  fetchMore, 
  hasMore, 
  threshold = 100 
}: UseInfiniteScrollProps) => {
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = async () => {
      if (loading || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const scrolledToBottom = scrollHeight - scrollTop - clientHeight < threshold;

      if (scrolledToBottom) {
        try {
          setLoading(true);
          await fetchMore();
        } catch (error) {
          console.error('Error fetching more items:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [fetchMore, hasMore, loading, threshold]);

  return {
    containerRef,
    loading
  };
};