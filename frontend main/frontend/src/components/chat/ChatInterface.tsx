import React, { useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { useDataSync } from '../../hooks/useDataSync';

export const ChatInterface: React.FC = () => {
  const { messages, sendMessage, isLoading } = useChat();
  const { results } = useDataSync();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if sync is complete
  const isSyncComplete = !!results;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isSyncComplete) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Chat Unavailable</h3>
          <p className="text-gray-600">
            Please complete data synchronization first to enable the AI chat interface.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding={false} className="h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">AI Business Assistant</h3>
        <p className="text-sm text-gray-600">Ask questions about your ecommerce data</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Start a conversation with your AI assistant</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">AI is typing...</div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 p-4">
        <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
      </div>
    </Card>
  );
};