export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp?: string;
  read: boolean;
  type: 'message' | 'group' | 'task' | 'run' | 'scope' | 'comment' | 'tag' | 'mention' | 'assignment' | 'access_request_approved' | 'ticket_assignment' | 'ticket_update';
  sender?: {
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  reference?: {
    id: string;
    type: string;
    name?: string;
  };
  metadata?: {
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
  };
}