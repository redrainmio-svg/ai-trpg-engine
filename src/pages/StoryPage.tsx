import React, { useState, useRef, useEffect } from 'react';
import { useStoryStore } from '../store/storyStore';
import ChatBox from '../components/ChatBox';
import MessageBubble from '../components/MessageBubble';
import StoryPanel from '../components/StoryPanel';
import { processUserAction } from '../engine/storyEngine';
import { Loader2, Save, Check, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { downloadSave, loadSaveFile } from '../lib/saveSystem';

export default function StoryPage() {

  const { state, setState } = useStoryStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.history, isLoading]);

  // ===== 存檔 =====
  const handleSave = () => {

    const worldName = state.worldName || "ai-trpg-world";

    downloadSave(worldName, state);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // ===== 讀檔 =====
  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLoadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    try {

      const data = await loadSaveFile(file);

      setState(data.state);

    } catch (err) {

      alert("存檔讀取失敗");

      console.error(err);
    }
  };

  // ===== 玩家輸入 =====
  const handleSendMessage = async (content: string) => {

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: Date.now()
    };

    const updatedState = {
      ...state,
      history: [...state.history, userMsg]
    };

    setState(updatedState);

    setIsLoading(true);

    try {

      const { text, newState } = await processUserAction(updatedState, content);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model' as const,
        content: text,
        timestamp: Date.now()
      };

      setState({
        ...newState,
        history: [...newState.history, aiMsg]
      });

    } catch (error) {

      console.error(error);

      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'system' as const,
        content: '命運的紡線暫時斷裂，請稍後再試。',
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        history: [...prev.history, errorMsg]
      }));

    } finally {

      setIsLoading(false);
    }
  };

  return (

    <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-indigo-500/30">

      {/* 左側狀態面板 */}
      <StoryPanel />

      {/* 右側主要互動區 */}
      <div className="flex-1 flex flex-col h-full relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10">

        {/* 頂部工具列 */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 z-20 pointer-events-none">

          {/* 存檔 */}
          <button
            onClick={handleSave}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-700/50 backdrop-blur-sm transition-all shadow-lg"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">已儲存</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">下載存檔</span>
              </>
            )}
          </button>

          {/* 讀檔 */}
          <button
            onClick={handleLoadClick}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full border border-slate-700/50 backdrop-blur-sm transition-all shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">讀取存檔</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleLoadFile}
            style={{ display: "none" }}
          />

        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-20 scroll-smooth custom-scrollbar">

          <div className="max-w-full md:max-w-7xl mx-auto px-4 md:px-6">

            {state.history.length === 0 ? (

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-slate-500 mt-32"
              >
                <div className="w-16 h-16 mx-auto border border-slate-800 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">✨</span>
                </div>

                <p className="text-xl font-serif text-slate-300 mb-3">
                  故事即將展開...
                </p>

                <p className="text-sm text-slate-500">
                  請在下方輸入你的第一個行動，例如：「環顧四周」或「推開眼前那扇沉重的木門」。
                </p>
              </motion.div>

            ) : (

              state.history.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))

            )}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-indigo-400 text-sm mt-6 mb-4"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-serif italic tracking-wide">
                  命運正在編織新的篇章...
                </span>
              </motion.div>
            )}

            <div ref={messagesEndRef} className="h-4" />

          </div>

        </div>

        <ChatBox
          onSendMessage={handleSendMessage}
          disabled={isLoading}
        />

      </div>

    </div>

  );
}