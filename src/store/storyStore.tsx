import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { StoryState } from '../types/StoryState';

interface StoryContextType {
  state: StoryState;
  setState: React.Dispatch<React.SetStateAction<StoryState>>;
  saveGame: () => void;
  loadGame: () => void;
  newGame: () => void;
}

const initialState: StoryState = {
  world: null,
  character: null,
  currentLocation: '起始之地',
  currentChapter: 1,
  npcRelationship: {},
  questState: {},
  npcMemories: {},
  history: [],
  contentMode: "standard",
};

export const StoryContext = createContext<StoryContextType | undefined>(undefined);

export const StoryProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoryState>(() => {
    try {
      const saved = localStorage.getItem('ai_story_save');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse save game", e);
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('ai_story_save', JSON.stringify(state));
  }, [state]);

  const saveGame = () => {
    localStorage.setItem('ai_story_save', JSON.stringify(state));
  };

  const loadGame = () => {
    try {
      const saved = localStorage.getItem('ai_story_save');
      if (saved) {
        setState(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load game", e);
    }
  };

  const newGame = () => {
    localStorage.removeItem('ai_story_save');
    setState(initialState);
  };

  // Auto load on mount
  useEffect(() => {
    loadGame();
  }, []);

  return (
    <StoryContext.Provider value={{ state, setState, saveGame, loadGame, newGame }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStoryStore = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStoryStore must be used within a StoryProvider');
  }
  return context;
};
