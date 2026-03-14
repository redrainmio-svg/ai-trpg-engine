import React, { useState } from 'react';
import { useStoryStore } from '../store/storyStore';
import { Globe } from 'lucide-react';

export default function WorldPage({ onNext }: { onNext: () => void }) {
  const { setState } = useStoryStore();
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');

  const handleSave = () => {
    setState(prev => ({ ...prev, world: { name, background } }));
    onNext();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">第一步：設定世界觀</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">世界名稱</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="例如：賽博龐克新東京"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">背景設定</label>
            <textarea 
              value={background} 
              onChange={e => setBackground(e.target.value)}
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all h-40 resize-none"
              placeholder="描述這個世界的規則、歷史與現狀..."
            />
          </div>
          <button 
            onClick={handleSave}
            disabled={!name || !background}
            className="w-full py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-4"
          >
            下一步：建立角色
          </button>
        </div>
      </div>
    </div>
  );
}
