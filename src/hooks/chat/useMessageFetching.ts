import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Message, UIMessage } from '@/types/chat';
import { transformToUIMessage, transformDatabaseMessage } from './messageTransformers';

export const useMessageFetching = (chatId: string, chatType: 'direct' | 'group') => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async (): Promise<UIMessage[]> => {
    try {
      console.log('Fetching messages for:', { chatId, chatType });
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(*)
        `)
        .eq('chat_id', chatId)
        .eq('chat_type', chatType)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('Messages loaded:', data);
      
      const messages = data.map(msg => transformToUIMessage({
        ...transformDatabaseMessage(msg),
        sender: msg.sender
      }));

      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Please try again later",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchMessages,
    isLoading
  };
};