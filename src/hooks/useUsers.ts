import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/types/task';

export const useUsers = (organizationId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['users', organizationId],
    queryFn: async () => {
      try {
        if (!organizationId) {
          console.log('No organization ID provided to useUsers hook');
          return [];
        }

        // First get organization members
        const { data: members, error: membersError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', organizationId);

        if (membersError) {
          console.error('Error fetching members:', membersError);
          throw membersError;
        }

        if (!members?.length) {
          console.log('No members found for organization:', organizationId);
          return [];
        }

        const userIds = members.map(member => member.user_id);

        // Then get the actual user profiles
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          throw usersError;
        }

        console.log('Fetched users:', users);

        // Map the profiles to include all required User properties
        const mappedUsers: User[] = users?.map(user => ({
          id: user.id,
          username: user.username || '',
          full_name: user.full_name || '',
          avatar_url: user.avatar_url || `https://avatar.vercel.sh/${user.username || 'user'}.png`,
          organization_name: user.organization_name,
          organization_role: user.organization_role,
          title: user.title,
          bio: user.bio,
          status: user.status || 'offline',
          is_online: user.is_online || false,
          organization_id: user.organization_id,
          updated_at: user.updated_at || new Date().toISOString(),
          created_at: user.created_at || new Date().toISOString(),
          name: user.username || user.full_name || 'Unknown User',
          avatar: user.avatar_url || `https://avatar.vercel.sh/${user.username || 'user'}.png`,
          isOnline: user.is_online || false
        })) || [];

        console.log('Mapped users:', mappedUsers);
        return mappedUsers;
      } catch (error) {
        console.error('Error in useUsers hook:', error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!organizationId,
  });
};