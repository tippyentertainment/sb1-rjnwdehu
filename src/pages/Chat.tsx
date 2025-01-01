import React from 'react';
import { ChatProvider } from '@/components/Chat/context/ChatContext';
import ChatInterface from '@/components/Chat/ChatInterface';

const Chat = () => {
  return (
    <div className="min-h-screen bg-background">
      <ChatProvider>
        <ChatInterface />
      </ChatProvider>
    </div>
  );
};

export default Chat;