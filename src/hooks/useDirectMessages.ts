import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DirectMessageUser } from '@/types/chat';

interface DirectMessagesError {
  message: string;
}

export const useDirectMessages = () => {
  const [directMessages, setDirectMessages] = useState<DirectMessageUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DirectMessagesError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDirectMessages = async () => {
      try {
        console.log('Fetching direct messages...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          setError({ message: 'No authenticated user found' });
          setLoading(false);
          return;
        }

        console.log('Authenticated user:', user.id);

        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (currentUserError) {
          console.error('Error fetching current user profile:', currentUserError);
          throw currentUserError;
        }

        if (!currentUserProfile) {
          console.error('Current user profile not found');
          setError({ message: 'Current user profile not found' });
          setLoading(false);
          return;
        }

        console.log('Current user profile:', currentUserProfile);

        const { data: orgMember, error: orgError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (orgError) {
          console.error('Error fetching organization:', orgError);
          throw orgError;
        }

        if (!orgMember?.organization_id) {
          console.error('No organization found for user');
          setError({ message: 'No organization found' });
          setLoading(false);
          return;
        }

        console.log('Organization ID:', orgMember.organization_id);

        const { data: members, error: membersError } = await supabase
          .from('organization_members')
          .select(`
            user_id,
            profiles (
              id,
              full_name,
              avatar_url,
              email,
              title,
              status
            )
          `)
          .eq('organization_id', orgMember.organization_id)
          .neq('user_id', user.id);

        if (membersError) {
          console.error('Error fetching organization members:', membersError);
          throw membersError;
        }

        console.log('Raw members data:', members);

        if (!members || members.length === 0) {
          console.log('No other members found in organization');
          setDirectMessages([{
            id: currentUserProfile.id,
            name: `${currentUserProfile.full_name || 'You'} (You)`,
            avatar: currentUserProfile.avatar_url || `https://avatar.vercel.sh/${currentUserProfile.full_name || 'user'}.png`,
            online: currentUserProfile.status === 'online',
            unreadCount: 0,
            mentioned: false,
            title: currentUserProfile.title || 'You',
            email: currentUserProfile.email || '',
            timezone: 'UTC',
            lastMessage: "",
            lastMessageTime: "",
            isSelf: true
          }]);
          setLoading(false);
          return;
        }

        const formattedDMs: DirectMessageUser[] = [
          {
            id: currentUserProfile.id,
            name: `${currentUserProfile.full_name || 'You'} (You)`,
            avatar: currentUserProfile.avatar_url || `https://avatar.vercel.sh/${currentUserProfile.full_name || 'user'}.png`,
            online: currentUserProfile.status === 'online',
            unreadCount: 0,
            mentioned: false,
            title: currentUserProfile.title || 'You',
            email: currentUserProfile.email || '',
            timezone: 'UTC',
            lastMessage: "",
            lastMessageTime: "",
            isSelf: true
          },
          ...(members || []).map(member => {
            console.log('Processing member:', member);
            if (!member.profiles || !member.profiles[0]) {
              console.warn('Member has no profile:', member);
              return null;
            }
            
            return {
              id: member.profiles[0]?.id || '',
              name: member.profiles[0]?.full_name || 'Unknown User',
              avatar: member.profiles[0]?.avatar_url || `https://avatar.vercel.sh/${member.profiles[0]?.full_name || 'user'}.png`,
              online: member.profiles[0]?.status === 'online',
              unreadCount: 0,
              mentioned: false,
              title: member.profiles[0]?.title || 'Team Member',
              email: member.profiles[0]?.email || '',
              timezone: 'UTC',
              lastMessage: "",
              lastMessageTime: "",
              isSelf: false
            };
          }).filter(Boolean) as DirectMessageUser[]
        ];

        console.log('Formatted direct messages:', formattedDMs);
        setDirectMessages(formattedDMs);
        setError(null);
      } catch (error) {
        console.error('Error fetching direct messages:', error);
        setError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
        toast({
          title: "Error loading contacts",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDirectMessages();
  }, [toast]);

  return { directMessages, loading, error };
};