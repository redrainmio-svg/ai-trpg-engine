import { Character } from './Character';
import { Message } from './Message';

export interface WorldSetting {
  name: string;
  background: string;
}

export interface StoryState {
  world: WorldSetting | null;
  character: Character | null;
  currentLocation: string;
  currentChapter: number;
  npcRelationship: Record<string, number>;
  questState: Record<string, string>;
  npcMemories: Record<string, string[]>;
  history: Message[];
  contentMode: "standard" | "mature";
}
