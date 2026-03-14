import React, { useState } from 'react';
import { Message } from '../types/Message';
import { motion } from 'motion/react';
import { Pencil, RotateCcw, CornerUpLeft } from 'lucide-react';

interface Props {
  message: Message;
  index: number;
  onEdit?: (index: number, newContent: string) => void;
  onRegenerate?: (index: number) => void;
  onRewind?: (index: number) => void;
}

export default function MessageBubble({
  message,
  index,
  onEdit,
  onRegenerate,
  onRewind
}: Props) {

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);

  if (isSystem) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-6">
        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  const handleSaveEdit = () => {
    if (onEdit) onEdit(index, editText);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-8`}
    >
      <div
        className={`relative group max-w-[90%] sm:max-w-[80%] rounded-2xl px-6 py-5 shadow-sm ${
          isUser
            ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30 rounded-br-sm'
            : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-bl-sm font-serif text-base md:text-lg leading-relaxed tracking-wide shadow-lg shadow-black/20'
        }`}
      >
        {isUser && (
          <div className="text-xs text-indigo-400 mb-2 font-mono uppercase tracking-wider">
            你的行動
          </div>
        )}

        {/* 編輯模式 */}
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="bg-slate-900 border border-slate-700 rounded p-2 text-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />

            <button
              onClick={handleSaveEdit}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              確認修改
            </button>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-base md:text-lg">
            {message.content}
          </p>
        )}

        {/* 操作按鈕 */}
        {!editing && (
          <div className="absolute -bottom-6 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition">

            {/* 編輯玩家訊息 */}
            {isUser && onEdit && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400"
              >
                <Pencil size={14} />
                編輯
              </button>
            )}

            {/* 重新生成 AI */}
            {!isUser && onRegenerate && (
              <button
                onClick={() => onRegenerate(index)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400"
              >
                <RotateCcw size={14} />
                重生
              </button>
            )}

            {/* 回到這裡 */}
            {onRewind && (
              <button
                onClick={() => onRewind(index)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-400"
              >
                <CornerUpLeft size={14} />
                回到這裡
              </button>
            )}

          </div>
        )}

      </div>
    </motion.div>
  );
}