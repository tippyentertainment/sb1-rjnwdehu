import { User } from '@/types/task';
import { toast } from '../components/ui/use-toast';

interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  sender: {
    name: string;
    avatar: string;
  };
  type?: 'mention' | 'reply' | 'general';
  mentionedIn?: {
    channelId?: string;
    messageId?: number;
  };
}

// Global notification state
let notifications: Notification[] = [];

// Subscribers for notification updates
const subscribers = new Set<(notifications: Notification[]) => void>();

export const subscribe = (callback: (notifications: Notification[]) => void) => {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
};

export const getNotifications = () => notifications;

export const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
  const newNotification = {
    ...notification,
    id: Math.random().toString(36).substr(2, 9),
    read: false,
  };
  
  notifications = [newNotification, ...notifications];
  subscribers.forEach(callback => callback(notifications));
  
  console.log('New notification added:', newNotification);

  // Show toast notification
  toast({
    title: notification.type === 'mention' ? "New mention" : "New notification",
    description: notification.message,
  });
};

export const notifyMentionedUser = (mentionedUser: User, commenterName: string, messageId?: number, channelId?: string) => {
  addNotification({
    message: `${commenterName} mentioned you in a message`,
    timestamp: new Date(),
    sender: {
      name: commenterName,
      avatar: `https://avatar.vercel.sh/${commenterName}.png`,
    },
    type: 'mention',
    mentionedIn: {
      messageId,
      channelId,
    }
  });

  console.log(`Notifying user ${mentionedUser.name} about mention from ${commenterName} in message ${messageId}`);
};