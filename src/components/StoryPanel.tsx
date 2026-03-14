import React from 'react';
import { useStoryStore } from '../store/storyStore';
import { Map, BookOpen, User, Users, Target, Scroll, ShieldAlert } from 'lucide-react';

export default function StoryPanel() {
  const { state } = useStoryStore();

  return (
    <div className="hidden md:flex w-64 bg-slate-950 text-slate-300 p-5 flex-col gap-6 h-full overflow-y-auto border-r border-slate-800/80 custom-scrollbar">
      
      <div className="pb-5 border-b border-slate-800/50">
        <h2 className="text-xl font-serif text-slate-100 flex items-center gap-2 mb-2">
          <Scroll className="w-5 h-5 text-indigo-400" />
          {state.world?.name || '未知世界'}
        </h2>
        <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md bg-slate-900 border border-slate-800 w-fit">
          <ShieldAlert className={`w-3.5 h-3.5 ${state.contentMode === 'mature' ? 'text-rose-400' : 'text-emerald-400'}`} />
          <span className={state.contentMode === 'mature' ? 'text-rose-400' : 'text-emerald-400'}>
            {state.contentMode === 'mature' ? 'Mature Mode' : 'Standard Mode'}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-indigo-400/80 mb-3">
          <Map className="w-4 h-4" />
          <h3 className="text-xs uppercase font-bold tracking-widest">當前地點</h3>
        </div>
        <p className="font-medium text-lg text-slate-200">{state.currentLocation}</p>
      </div>
      
      <div>
        <div className="flex items-center gap-2 text-indigo-400/80 mb-3">
          <BookOpen className="w-4 h-4" />
          <h3 className="text-xs uppercase font-bold tracking-widest">劇情進度</h3>
        </div>
        <p className="font-medium text-lg text-slate-200">第 {state.currentChapter} 章</p>
      </div>

      {state.character && (
        <div>
          <div className="flex items-center gap-2 text-indigo-400/80 mb-3">
            <User className="w-4 h-4" />
            <h3 className="text-xs uppercase font-bold tracking-widest">角色狀態</h3>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80">
            <p className="font-bold text-lg text-indigo-300 mb-1">{state.character.name}</p>
            <p className="text-sm text-slate-400 leading-relaxed">{state.character.personality}</p>
          </div>
        </div>
      )}

      {Object.keys(state.npcRelationship).length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-indigo-400/80 mb-3">
            <Users className="w-4 h-4" />
            <h3 className="text-xs uppercase font-bold tracking-widest">NPC 關係</h3>
          </div>
          <div className="space-y-2 bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
            {Object.entries(state.npcRelationship).map(([npc, score]) => (
              <div key={npc} className="flex justify-between items-center text-sm">
                <span className="text-slate-300">{npc}</span>
                <span className={`font-mono font-medium ${score > 0 ? 'text-emerald-400' : score < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                  {score > 0 ? `+${score}` : score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(state.questState).length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-indigo-400/80 mb-3">
            <Target className="w-4 h-4" />
            <h3 className="text-xs uppercase font-bold tracking-widest">任務狀態</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(state.questState).map(([quest, status]) => (
              <div key={quest} className="text-sm bg-slate-900/50 rounded-xl p-4 border border-slate-800/50 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/50"></div>
                <p className="font-bold text-indigo-200 mb-1.5">{quest}</p>
                <p className="text-slate-400 leading-snug">{status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
