import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatBoxProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatBox({ onSendMessage, disabled }: ChatBoxProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 p-4 bg-slate-950 border-t border-slate-800/50 z-50">
      <div className="relative max-w-7xl mx-auto flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="輸入你的下一步行動..."
          className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
        />
        <button 
          type="submit" 
          disabled={disabled || !input.trim()}
          className="absolute right-2 shrink-0 p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex items-center justify-center shadow-md"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </div>
    </form>
  );
}
