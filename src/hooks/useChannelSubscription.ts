import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useChannelSubscription = (channelId: string) => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const requestSubscription = async () => {
    try {
      setIsSubscribing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          role: 'member',
          subscription_status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Subscription requested",
        description: "Channel administrators will review your request",
      });

      console.log('Channel subscription requested:', { channelId, userId: user.id });
    } catch (error) {
      console.error('Error requesting channel subscription:', error);
      toast({
        title: "Error",
        description: "Failed to request channel subscription",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return {
    requestSubscription,
    isSubscribing
  };
};