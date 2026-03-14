import React from 'react';
import { Message } from '../types/Message';
import { motion } from 'motion/react';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-6">
        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">{message.content}</span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-6 py-5 shadow-sm ${
        isUser 
          ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-br-sm' 
          : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-bl-sm font-serif text-base md:text-lg leading-relaxed tracking-wide shadow-lg shadow-black/20'
      }`}>
        {isUser && <div className="text-xs text-indigo-400 mb-2 font-mono uppercase tracking-wider">你的行動</div>}
        <p className="whitespace-pre-wrap text-base md:text-lg">{message.content}</p>
      </div>
    </motion.div>
  );
}
