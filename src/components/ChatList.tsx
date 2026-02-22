import React, { memo, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { Terminal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatListProps {
  messages: Message[];
  isLoading: boolean;
  copyToClipboard: (text: string) => void;
  downloadCode: (code: string, lang: string) => void;
}

const ChatList = memo(({ messages, isLoading, copyToClipboard, downloadCode }: ChatListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
      {messages.map((msg, idx) => (
        <ChatMessage 
          key={idx} 
          msg={msg} 
          copyToClipboard={copyToClipboard} 
          downloadCode={downloadCode} 
        />
      ))}
      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-4 max-w-4xl mx-auto"
        >
          <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0 animate-pulse">
            <Sparkles className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-center gap-1 h-8">
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </motion.div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default ChatList;
