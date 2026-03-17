import React, { useState, useRef, useEffect } from 'react';
import { useStoryStore } from '../store/storyStore';
import ChatBox from '../components/ChatBox';
import MessageBubble from '../components/MessageBubble';
import StoryPanel from '../components/StoryPanel';
import { processUserAction, startStory } from '../engine/storyEngine';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { downloadSave, loadSaveFile } from '../lib/saveSystem';

/* ============================= */
/* 🔥 安全轉字串（核心） */
/* ============================= */

function safeContent(content: any): string {
  if (typeof content === 'string') return content;
  if (content === null || content === undefined) return "";
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

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

  /* ===== 自動生成開場 ===== */

  useEffect(() => {

    if (state.history.length > 0) return;

    const generateOpening = async () => {

      setIsLoading(true);

      try {

        const { text, newState } = await startStory(state);

        const aiMsg = {
          id: Date.now().toString(),
          role: 'model' as const,
          content: safeContent(text),
          timestamp: Date.now()
        };

        setState({
          ...newState,
          history: [aiMsg]
        });

      } catch (error) {

        console.error("Opening generation failed:", error);

      } finally {

        setIsLoading(false);

      }

    };

    generateOpening();

  }, []);

  /* ===== 清空 AI 記憶 ===== */

  const resetMemory = (baseState: any) => {

    return {
      ...baseState,
      npcMemories: {},
      npcRelationship: {},
      questState: {}
    };

  };

  /* ===== 存檔 ===== */

  const handleSave = () => {

    const worldName = state.world?.name || "ai-trpg-world";

    downloadSave(worldName, state);

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  /* ===== 讀檔 ===== */

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

  /* ===== 玩家輸入 ===== */

  const handleSendMessage = async (content: string) => {

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: safeContent(content),
      timestamp: Date.now()
    };

    const updatedState = {
      ...state,
      history: [...state.history, userMsg]
    };

    setState(updatedState);

    await generateAI(updatedState, content);
  };

  /* ===== AI生成 ===== */

  const generateAI = async (currentState: any, action: string) => {

    setIsLoading(true);

    try {

      const { text, newState } = await processUserAction(currentState, action);

      const aiMsg = {
        id: Date.now().toString(),
        role: 'model' as const,
        content: safeContent(text),
        timestamp: Date.now()
      };

      setState({
        ...newState,
        history: [...newState.history, aiMsg]
      });

    } catch (error) {

      console.error(error);

      const errorMsg = {
        id: Date.now().toString(),
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

  /* ===== 重新生成 ===== */

  const handleRegenerate = async (index: number) => {

    const history = [...state.history];

    if (index === 0) {

      const updatedState = resetMemory({
        ...state,
        history: []
      });

      setState(updatedState);

      setIsLoading(true);

      try {

        const { text, newState } = await startStory(updatedState);

        const aiMsg = {
          id: Date.now().toString(),
          role: 'model' as const,
          content: safeContent(text),
          timestamp: Date.now()
        };

        setState({
          ...newState,
          history: [aiMsg]
        });

      } finally {

        setIsLoading(false);

      }

      return;
    }

    const lastUser = history[index - 1];

    const trimmedHistory = history.slice(0, index);

    const updatedState = resetMemory({
      ...state,
      history: trimmedHistory
    });

    setState(updatedState);

    await generateAI(updatedState, safeContent(lastUser.content));
  };

  /* ===== 編輯訊息 ===== */

  const handleEdit = async (index: number, newContent: string) => {

    const newHistory = state.history.slice(0, index);

    const editedMsg = {
      ...state.history[index],
      content: safeContent(newContent)
    };

    newHistory.push(editedMsg);

    const updatedState = resetMemory({
      ...state,
      history: newHistory
    });

    setState(updatedState);

    await generateAI(updatedState, newContent);
  };

  /* ===== 回到這裡 ===== */

  const handleRewind = (index: number) => {

    const newHistory = state.history.slice(0, index + 1);

    const safeHistory = newHistory.map(msg => ({
      ...msg,
      content: safeContent(msg.content)
    }));

    const newState = resetMemory({
      ...state,
      history: safeHistory
    });

    setState(newState);
  };

  return (

    <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-indigo-500/30">

      <StoryPanel />

      <div className="flex-1 flex flex-col h-full relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-10">

        <div className="absolute top-4 right-6 flex gap-3 z-20">

          <button
            onClick={handleSave}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-sm shadow"
          >
            💾 存檔
          </button>

          <button
            onClick={handleLoadClick}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-sm shadow"
          >
            📂 讀檔
          </button>

          {isSaved && (
            <span className="text-emerald-400 text-xs flex items-center">
              已存檔
            </span>
          )}

        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleLoadFile}
          accept=".json"
          className="hidden"
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-20 scroll-smooth custom-scrollbar">

          <div className="max-w-full md:max-w-7xl mx-auto px-4 md:px-6">

            {/* 🔥 防炸 render */}
            {state.history
              .filter(msg => typeof msg.content === "string")
              .map((msg, i) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  index={i}
                  onEdit={handleEdit}
                  onRegenerate={handleRegenerate}
                  onRewind={handleRewind}
                />
              ))}

            {state.choices && state.choices.length > 0 && !isLoading && (
              <div className="flex flex-wrap gap-3 mt-6">
                {state.choices.map((choice: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(choice)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition"
                  >
                    {choice}
                  </button>
                ))}
              </div>
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