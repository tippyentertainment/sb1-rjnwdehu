import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { type Notification } from '@/types/notification';
import { useToast } from '@/components/ui/use-toast';
import { notificationSound } from '@/utils/sound';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: Notification['type'];
  sender: {
    username: string;
    avatar_url: string;
    is_online: boolean;
  } | null;
  reference_id: string | null;
  reference_type: string | null;
  reference_name: string | null;
  metadata: {
    attachment?: {
      name: string;
      type: string;
      thumbnail?: string;
    };
    relatedMessages?: Array<{
      id: string;
      content: string;
      timestamp: string;
      sender: {
        name: string;
        avatar?: string;
      };
    }>;
  } | null;
}

// Keep track of notifications we've already played sounds for
const playedSounds = new Set<string>();
// Keep track of processed notification IDs to prevent duplicates
const processedNotifications = new Set<string>();

const formatNotification = (notification: any): Notification => ({
  id: notification.id,
  title: notification.title,
  message: notification.message,
  timestamp: new Date(notification.created_at).toLocaleString(),
  read: notification.read,
  type: notification.type,
  sender: notification.sender ? {
    name: notification.sender.username,
    avatar: notification.sender.avatar_url,
    isOnline: notification.sender.is_online
  } : undefined,
  reference: notification.reference_id ? {
    id: notification.reference_id,
    type: notification.reference_type || '',
    name: notification.reference_name || undefined
  } : undefined,
  metadata: notification.metadata || undefined
});

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications...');
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          console.log('No authenticated user found');
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            sender:sender_id(
              username,
              avatar_url,
              is_online
            )
          `)
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        if (data && mounted) {
          console.log('Received notifications:', data);
          const formattedNotifications = data
            .filter(notification => !processedNotifications.has(notification.id))
            .map(formatNotification);

          setNotifications(formattedNotifications);
          
          formattedNotifications.forEach(notification => {
            processedNotifications.add(notification.id);
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        if (mounted) {
          toast({
            title: "Error",
            description: "Failed to load notifications",
            variant: "destructive"
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      subscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, async (payload) => {
          console.log('Notification change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new;
            
            if (processedNotifications.has(newNotification.id)) {
              console.log('Duplicate notification detected, skipping:', newNotification.id);
              return;
            }

            const { data: senderData } = await supabase
              .from('profiles')
              .select('username, avatar_url, is_online')
              .eq('id', newNotification.sender_id)
              .single();

            const notificationWithSender = {
              ...newNotification,
              sender: senderData
            };

            // Special handling for approved access requests
            if (newNotification.type === 'access_request_approved') {
              toast({
                title: "Application Request Approved",
                description: `Your access request for ${newNotification.reference_name || 'the application'} has been approved`,
              });
            } else {
              toast({
                title: newNotification.title,
                description: newNotification.message,
              });
            }

            if (
              !notificationSound.isMuted() && 
              ['mention', 'assignment', 'access_request_approved'].includes(newNotification.type) &&
              !playedSounds.has(newNotification.id)
            ) {
              console.log('Playing notification sound for:', newNotification.type);
              notificationSound.play();
              playedSounds.add(newNotification.id);
            }

            processedNotifications.add(newNotification.id);
            
            setNotifications(prev => [formatNotification(notificationWithSender), ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(n => 
                n.id === payload.new.id 
                  ? { ...n, ...formatNotification(payload.new) }
                  : n
              )
            );
          }
        })
        .subscribe();

      console.log('Realtime subscription setup complete');
    };

    fetchNotifications();
    setupRealtimeSubscription();

    return () => {
      mounted = false;
      if (subscription) {
        console.log('Cleaning up notification subscription');
        subscription.unsubscribe();
      }
    };
  }, [toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true }
            : n
        )
      );

      console.log('Successfully marked notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      // Update local state immediately for better UX
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      console.log('Successfully marked all notifications as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive"
      });
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead
  };
};