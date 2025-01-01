import { format } from 'date-fns';
import { Message, UIMessage, DatabaseMessage } from '@/types/chat';

export const transformDatabaseMessage = (dbMessage: DatabaseMessage): Message => {
  return {
    id: parseInt(dbMessage.id),
    content: dbMessage.content,
    sender_id: dbMessage.sender_id,
    sender: {
      id: dbMessage.sender_id,
      full_name: '', // Will be populated from join
      avatar_url: '',
      status: 'offline'
    },
    chat_id: dbMessage.chat_id,
    chat_type: dbMessage.chat_type,
    created_at: dbMessage.created_at,
    metadata: {
      gif: dbMessage.metadata?.gif,
      attachments: dbMessage.metadata?.attachments?.map(attachment => {
        if (typeof attachment === 'string') {
          return {
            name: attachment.split('/').pop() || '',
            url: attachment,
            type: 'unknown',
            size: 0
          };
        }
        return attachment;
      }),
      mentions: dbMessage.metadata?.mentions
    },
    reactions: dbMessage.metadata?.reactions || {},
    replies: []
  };
};

export const transformToUIMessage = (message: Message): UIMessage => {
  return {
    id: message.id,
    user: {
      name: message.sender.full_name,
      avatar: message.sender.avatar_url,
      status: message.sender.status || 'offline'
    },
    content: message.content,
    timestamp: format(new Date(message.created_at), 'HH:mm'),
    gif: message.metadata?.gif,
    attachments: message.metadata?.attachments?.map(a => a.url),
    reactions: message.reactions || {},
    replies: message.replies?.map(transformToUIMessage),
    mentions: message.metadata?.mentions
  };
};