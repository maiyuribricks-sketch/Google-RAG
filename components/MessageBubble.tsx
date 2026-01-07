import React from 'react';
import { User, Bot, Sparkles } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg 
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
          }`}>
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
            ${isUser 
              ? 'bg-blue-600 text-white rounded-br-none' 
              : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
            }`}>
            {message.isThinking ? (
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles size={16} className="animate-pulse" />
                <span className="font-medium">Thinking...</span>
              </div>
            ) : (
              message.text
            )}
          </div>
          <span className="text-[10px] text-slate-500 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
