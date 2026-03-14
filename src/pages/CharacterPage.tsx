import React, { useState } from 'react';
import { useStoryStore } from '../store/storyStore';
import { UserPlus } from 'lucide-react';

export default function CharacterPage({ onNext }: { onNext: () => void }) {
  const { setState } = useStoryStore();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [background, setBackground] = useState('');

  const handleSave = () => {
    setState(prev => ({ 
      ...prev, 
      character: { name, personality, background, inventory: [] } 
    }));
    onNext();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">第二步：建立角色</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">角色名稱</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="例如：亞瑟"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">性格特徵</label>
            <input 
              type="text" 
              value={personality} 
              onChange={e => setPersonality(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="例如：機智、衝動、冷靜"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">角色背景</label>
            <textarea 
              value={background} 
              onChange={e => setBackground(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-32 resize-none"
              placeholder="描述這個角色的過去..."
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={!name || !personality || !background}
            className="w-full py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-4"
          >
            完成設定，開始故事
          </button>
        </div>
      </div>
    </div>
  );
}
