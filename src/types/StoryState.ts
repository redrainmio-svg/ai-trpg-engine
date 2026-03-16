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
   * 用於防止 AI 在同一場景隨機創造新角色
   *
   * 例：
   * {
   *   "酒館": ["卡爾", "莉亞"],
   *   "王城": ["艾德里安", "衛兵隊長"]
   * }
   */
  sceneNPCs: Record<string, string[]>;

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
 *
 * 用於：
 * 編輯 / 重生 / 回到這裡
 *
 * 注意：
 * sceneNPCs 不會清除
 * 因為它屬於世界資料
 */
export const clearStoryMemory = (state: StoryState): StoryState => {

  return {
    ...state,

    npcMemories: {},

    npcRelationship: {},

    questState: {}
  };
};