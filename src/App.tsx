import React, { useState } from 'react';
import { StoryProvider } from './store/storyStore';
import HomePage from './pages/HomePage';
import WorldPage from './pages/WorldPage';
import CharacterPage from './pages/CharacterPage';
import StoryPage from './pages/StoryPage';

type PageState = 'home' | 'world' | 'character' | 'story';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageState>('home');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {currentPage === 'home' && (
        <HomePage
          onNext={() => setCurrentPage('world')}
          onContinue={() => setCurrentPage('story')}
        />
      )}
      {currentPage === 'world' && <WorldPage onNext={() => setCurrentPage('character')} />}
      {currentPage === 'character' && <CharacterPage onNext={() => setCurrentPage('story')} />}
      {currentPage === 'story' && <div>Story Page</div>}
    </div>
  );
}

export default function App() {
  return (
    <StoryProvider>
      <AppContent />
    </StoryProvider>
  );
}
