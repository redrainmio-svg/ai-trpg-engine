import React, { useEffect, useState } from 'react';
import { Sparkles, Play, RotateCcw, ShieldAlert } from 'lucide-react';
import { useStoryStore } from '../store/storyStore';

export default function HomePage({ onNext, onContinue }: { onNext: () => void, onContinue: () => void }) {
  const [hasSave, setHasSave] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [contentMode, setContentMode] = useState<"standard" | "mature">("standard");
  const { newGame, setState } = useStoryStore();

  useEffect(() => {
    const saved = localStorage.getItem('ai_story_save');
    if (saved) {
      setHasSave(true);
    }
  }, []);

  const handleNewGame = () => {
    if (!agreed) return;
    newGame();
    setState(prev => ({ ...prev, contentMode }));
    onNext();
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 overflow-hidden">
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-100 max-w-2xl w-full text-center max-h-[95vh] flex flex-col">
        <div className="shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-2 sm:mb-4 tracking-tight">AI 互動小說生成器</h1>
          <p className="text-base sm:text-lg text-slate-500 mb-4 sm:mb-6 leading-relaxed">
            打造專屬於你的世界觀與角色，讓 AI 帶領你展開一場獨一無二的冒險。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1 sm:pr-2 mb-4 sm:mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-6 mb-6 text-left">
            <div className="flex items-center gap-2 text-amber-600 mb-3 font-bold">
              <ShieldAlert className="w-5 h-5" />
              免責聲明
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              本應用程式生成的所有故事、角色、事件與對話均為虛構內容，
              由 AI 自動生成，僅供娛樂用途。
              任何與現實人物、事件或組織的相似之處均屬巧合。
              使用者需自行判斷生成內容的適當性。
            </p>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0"
              />
              <span className="text-sm font-medium text-slate-700">我已閱讀並同意</span>
            </label>
          </div>

          <div className="mb-2 text-left">
            <label className="block text-sm font-bold text-slate-700 mb-3">內容模式</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className={`flex-1 flex items-center p-3 sm:p-4 border rounded-xl cursor-pointer transition-colors ${contentMode === 'standard' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="contentMode" 
                  value="standard" 
                  checked={contentMode === 'standard'}
                  onChange={() => setContentMode('standard')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-slate-900">Standard Mode</span>
                  <span className="block text-xs text-slate-500 mt-0.5">預設模式，適合一般大眾</span>
                </div>
              </label>
              <label className={`flex-1 flex items-center p-3 sm:p-4 border rounded-xl cursor-pointer transition-colors ${contentMode === 'mature' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input 
                  type="radio" 
                  name="contentMode" 
                  value="mature" 
                  checked={contentMode === 'mature'}
                  onChange={() => setContentMode('mature')}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-slate-900">Mature Mode</span>
                  <span className="block text-xs text-slate-500 mt-0.5">允許成人向或暴力劇情</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          {hasSave && (
            <button 
              onClick={onContinue}
              className="px-8 py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-lg w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              繼續遊戲
            </button>
          )}
          <button 
            onClick={handleNewGame}
            disabled={!agreed}
            className={`px-8 py-4 font-medium rounded-xl transition-colors shadow-sm text-lg w-full sm:w-auto flex items-center justify-center gap-2 ${
              !agreed
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : hasSave 
                  ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {hasSave ? <RotateCcw className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            開始新遊戲
          </button>
        </div>
      </div>
    </div>
  );
}
