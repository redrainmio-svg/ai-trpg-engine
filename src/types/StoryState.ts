import { Character } from './Character';
import { Message } from './Message';

/**
 * 世界設定
 */
export interface WorldSetting {
  name: string;
  background: string;
}

/**
 * NPC 資料
 */
export interface NPCProfile {
  name: string;
  role?: string;
  personality?: string;
  description?: string;
  location?: string;
}

/**
 * 故事狀態（AI TRPG 核心資料）
 */
export interface StoryState {

  /**
   * 世界設定
   */
  world: WorldSetting | null;

  /**
   * 玩家角色
   */
  character: Character | null;

  /**
   * 當前地點
   */
  currentLocation: string;

  /**
   * 當前章節
   */
  currentChapter: number;

  /**
   * NPC 好感度 / 關係
   */
  npcRelationship: Record<string, number>;

  /**
   * 任務進度
   */
  questState: Record<string, string>;

  /**
   * NPC 長期記憶（AI 使用）
   */
  npcMemories: Record<string, string[]>;

  /**
   * 場景 NPC 記錄
   */
  sceneNPCs: Record<string, string[]>;

  /**
   * NPC 資料庫（新增）
   * 保存 NPC 的詳細資料
   */
  npcDatabase: Record<string, NPCProfile>;

  /**
   * 聊天歷史
   */
  history: Message[];

  /**
   * 內容模式
   */
  contentMode: "standard" | "mature";
}

/**
 * 清空 AI 記憶
 */
export const clearStoryMemory = (state: StoryState): StoryState => {

  return {
    ...state,

    /**
     * 只清除 AI 記憶
     */
    npcMemories: {}
  };
};