import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocalState } from './useLocalState';
import type { Comment } from '@/types/task';
import _ from 'lodash';

export const useTaskComments = (taskId: string) => {
  const queryClient = useQueryClient();

  const syncToDatabase = async (comments: Comment[]) => {
    console.log('Syncing comments to database:', comments);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('task_comments')
      .upsert(
        comments.map(comment => ({
          ...comment,
          updated_at: new Date().toISOString(),
          user_id: user.id
        }))
      );

    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: ['taskComments', taskId] });
  };

  const query = useQuery({
    queryKey: ['taskComments', taskId],
    queryFn: async () => {
      console.log('Fetching comments for task:', taskId);
      try {
        const [commentsResponse, usersResponse] = await Promise.all([
          supabase
            .from('task_comments')
            .select(`
              id,
              content,
              created_at,
              user_id,
              metadata,
              user:profiles(*)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('*')
        ]);

        if (commentsResponse.error) throw commentsResponse.error;
        if (usersResponse.error) throw usersResponse.error;

        // Remove duplicates using lodash
        const uniqueComments = _.uniqBy(commentsResponse.data, comment => 
          `${comment.id}-${comment.content}`
        );

        return {
          comments: uniqueComments,
          users: usersResponse.data
        };
      } catch (error) {
        console.error('Error in useTaskComments:', error);
        throw error;
      }
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const {
    localData: comments,
    updateLocalData: setComments,
    isDirty,
    syncToDatabase: sync
  } = useLocalState(query.data?.comments || [], syncToDatabase);

  return {
    comments,
    users: query.data?.users || [],
    isLoading: query.isLoading,
    error: query.error,
    isDirty,
    updateComments: setComments,
    syncToDatabase: sync
  };
};