import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

export const Chat: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
        <p className="text-gray-600">Interact with your AI assistant</p>
      </div>
      
      <ChatInterface />
    </div>
  );
};