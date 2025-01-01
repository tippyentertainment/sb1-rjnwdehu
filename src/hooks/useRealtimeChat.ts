import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UIMessage } from '@/types/chat';
import { useMessageFetching } from './chat/useMessageFetching';
import { transformToUIMessage, transformDatabaseMessage } from './chat/messageTransformers';

export const useRealtimeChat = (chatId: string, chatType: 'direct' | 'group') => {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { fetchMessages, isLoading } = useMessageFetching(chatId, chatType);

  useEffect(() => {
    if (!chatId) return;

    console.log('Initializing real-time chat for:', { chatId, chatType });

    const loadInitialMessages = async () => {
      const initialMessages = await fetchMessages();
      setMessages(initialMessages);
    };

    loadInitialMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence sync event received');
        setIsConnected(true);
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch the complete message with sender details
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (error) {
            console.error('Error fetching new message details:', error);
            return;
          }

          const transformedMessage = transformToUIMessage({
            ...transformDatabaseMessage(newMessage),
            sender: newMessage.sender
          });

          setMessages(prev => [...prev, transformedMessage]);
          
          // Show notification for new messages
          const { data: { user } } = await supabase.auth.getUser();
          if (newMessage.sender_id !== user?.id) {
            toast({
              title: "New message",
              description: `${newMessage.sender.full_name}: ${newMessage.content.substring(0, 50)}${newMessage.content.length > 50 ? '...' : ''}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up chat subscription');
      channel.unsubscribe();
    };
  }, [chatId, chatType, toast]);

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${chatId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      return {
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const sendMessage = async (content: string, metadata?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      console.log('Sending message:', { content, metadata, chatId, chatType });

      const { error } = await supabase
        .from('messages')
        .insert({
          content,
          chat_id: chatId,
          chat_type: chatType,
          sender_id: user.id,
          metadata
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Please try again",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    handleFileUpload
  };
};