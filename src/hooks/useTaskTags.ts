import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Tag } from '@/types/chat';

export const useTaskTags = (organizationId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['tags', organizationId],
    queryFn: async () => {
      try {
        if (!organizationId) {
          console.log('No organization ID provided to useTaskTags hook');
          return [];
        }

        const { data: tags, error } = await supabase
          .from('tags')
          .select('*')
          .eq('organization_id', organizationId)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching tags:', error);
          throw error;
        }

        console.log('Fetched tags:', tags);
        return tags.map((tag): Tag => ({
          id: tag.id,
          name: tag.name,
          color: tag.color
        }));
      } catch (error) {
        console.error('Error in useTaskTags hook:', error);
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!organizationId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });
};