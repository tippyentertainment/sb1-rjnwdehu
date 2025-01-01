import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Channel, ChannelMember } from '@/types/chat';

interface ChannelsError {
  message: string;
}

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ChannelsError | null>(null);
  const { toast } = useToast();

  const fetchChannels = async () => {
    try {
      console.log('Fetching channels...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        setError({ message: 'No authenticated user' });
        setLoading(false);
        return;
      }

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
        console.log('No organization found for user');
        setError({ message: 'No organization found' });
        setLoading(false);
        return;
      }

      console.log('Fetching channels for organization:', orgMember.organization_id);

      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select(`
          *,
          channel_members (
            id,
            channel_id,
            user_id,
            role,
            subscription_status
          )
        `)
        .eq('organization_id', orgMember.organization_id);

      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
        setError({ message: channelsError.message });
        throw channelsError;
      }

      console.log('Channels data received:', channelsData);

      if (!channelsData) {
        setChannels([]);
        setLoading(false);
        return;
      }

      const formattedChannels: Channel[] = channelsData.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type || 'group',
        avatar: `https://avatar.vercel.sh/${channel.name}.png`,
        unreadCount: 0,
        mentioned: false,
        description: channel.description || `Channel for ${channel.name}`,
        memberCount: channel.channel_members?.length || 0,
        lastMessage: "",
        lastMessageTime: new Date(channel.created_at).toLocaleString(),
        created_at: channel.created_at,
        created_by: channel.created_by || undefined,
        organization_id: channel.organization_id || undefined,
        is_private: channel.is_private || false,
        channel_members: channel.channel_members as ChannelMember[] || [],
        subscriptionStatus: channel.channel_members?.[0]?.subscription_status
      }));

      console.log('Formatted channels:', formattedChannels);
      setChannels(formattedChannels);
      setError(null);
    } catch (error) {
      console.error('Error in fetchChannels:', error);
      setError({ message: error instanceof Error ? error.message : 'An unknown error occurred' });
      toast({
        title: "Error loading channels",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [toast]);

  return { channels, loading, error, refetch: fetchChannels };
};