export interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  email?: string;
  status?: 'online' | 'offline' | 'busy';
  isOnline?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type?: 'group';
  avatar?: string;
  unreadCount?: number;
  mentioned?: boolean;
  description?: string;
  memberCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  created_at?: string;
  created_by?: string;
  organization_id?: string;
  is_private?: boolean;
  has_file_vault?: boolean;
  channel_members?: ChannelMember[];
  subscriptionStatus?: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  is_muted?: boolean;
  created_at?: string;
  is_blocked?: boolean;
  blocked_at?: string | null;
  blocked_by?: string | null;
  subscription_status?: string;
}

export interface DirectMessageUser {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  unreadCount: number;
  mentioned: boolean;
  title: string;
  email: string;
  timezone: string;
  lastMessage: string;
  lastMessageTime: string;
  isSelf?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  organization_id?: string;
  created_at?: string;
  created_by?: string;
}

export interface OrganizationMember {
  user_id: string;
  profiles: {
    id: string;
    email: string | null;
    username: string | null;
    avatar_url: string | null;
    full_name: string | null;
    status: string | null;
    title: string | null;
  };
}

export interface Organization {
  id: string;
  name: string;
  userRole?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageUser {
  name: string;
  avatar: string;
  status?: 'online' | 'busy' | 'offline';
}

export interface UIMessage {
  id: number;
  user: MessageUser;
  content: string;
  timestamp: string;
  gif?: string;
  attachments?: string[];
  replyTo?: number;
  reactions: Record<string, Reaction>;
  replies?: UIMessage[];
  mentions?: string[];
  mentionNotifications?: {
    userId: string;
    read: boolean;
    notifiedAt: string;
  }[];
  canDelete?: boolean;
}

export interface DatabaseMessage {
  id: string;
  content: string;
  sender_id: string;
  chat_id: string;
  chat_type: 'direct' | 'group';
  created_at: string;
  metadata?: {
    gif?: string;
    attachments?: string[];
    replyTo?: string;
    mentions?: string[];
    reactions?: Record<string, Reaction>;
  };
}

export interface Message {
  id: number;
  content: string;
  sender_id: string;
  sender: {
    id: string;
    full_name: string;
    avatar_url: string;
    status?: 'online' | 'busy' | 'offline';
  };
  chat_id: string;
  chat_type: 'direct' | 'group';
  created_at: string;
  metadata?: {
    gif?: string;
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    mentions?: string[];
  };
  reactions: Record<string, Reaction>;
  replies?: Message[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface MessageReply {
  id: number;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
}

export interface UrlPreview {
  title: string;
  description: string;
  image: string;
}

export interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
  attachments?: string[];
  reactions: MessageReaction[];
  replies?: MessageReply[];
  urlPreview?: UrlPreview;
}