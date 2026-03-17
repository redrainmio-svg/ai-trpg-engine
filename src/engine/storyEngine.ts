import { generateAIResponse } from "../ai/openrouterClient";
import { SYSTEM_PROMPT, buildTurnPrompt } from "../ai/prompts";
import { StoryState } from "../types/StoryState";

export interface AIResponse {
  story: string;
  dialogue: string;
  state: {
    currentLocation: string;
    currentChapter: number;
    npcRelationship: Record<string, number>;
    questState: Record<string, string>;
  };
  memories?: Record<string, string[]>;
}

/* ============================= */
/* 🔥 防循環系統 */
/* ============================= */

function similarity(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let same = 0;

  for (let i = 0; i < len; i++) {
    if (a[i] === b[i]) same++;
  }

  return same / Math.max(a.length, b.length);
}

function isLooping(newText: string, history: any[]): boolean {
  if (!history || history.length === 0) return false;

  const last = history[history.length - 1]?.content || "";

  if (!last) return false;

  // 完全重複
  if (newText.trim() === last.trim()) return true;

  // 高相似
  if (similarity(newText, last) > 0.8) return true;

  return false;
}

/* ============================= */
/* JSON 解析 */
/* ============================= */

export const parseAIResponse = (responseText: string): AIResponse => {
  try {

    const cleanedText = responseText
      .replace(/```json\n?|\n?```/g, "")
      .trim();

    return JSON.parse(cleanedText) as AIResponse;

  } catch (error) {

    console.error("Failed to parse AI response:", error);
    throw new Error("AI JSON parse error");

  }
};

/* ============================= */
/* 更新狀態 */
/* ============================= */

export const updateStoryState = (
  currentState: StoryState,
  aiResponse: AIResponse
): StoryState => {

  const newNpcMemories = { ...currentState.npcMemories };
  const sceneNPCs = { ...currentState.sceneNPCs };
  const npcDatabase = { ...currentState.npcDatabase };

  const currentLocation =
    aiResponse.state.currentLocation ||
    currentState.currentLocation;

  if (!sceneNPCs[currentLocation]) {
    sceneNPCs[currentLocation] = [];
  }

  if (aiResponse.memories) {

    for (const [npc, memories] of Object.entries(aiResponse.memories)) {

      if (!newNpcMemories[npc]) {
        newNpcMemories[npc] = [];
      }

      newNpcMemories[npc] = [
        ...newNpcMemories[npc],
        ...memories
      ];

      if (!sceneNPCs[currentLocation].includes(npc)) {
        sceneNPCs[currentLocation].push(npc);
      }

      if (!npcDatabase[npc]) {
        npcDatabase[npc] = {
          name: npc,
          location: currentLocation
        };
      }

    }

  }

  return {

    ...currentState,

    currentLocation,

    currentChapter:
      aiResponse.state.currentChapter ||
      currentState.currentChapter,

    npcRelationship: {
      ...currentState.npcRelationship,
      ...aiResponse.state.npcRelationship
    },

    questState: {
      ...currentState.questState,
      ...aiResponse.state.questState
    },

    npcMemories: newNpcMemories,

    sceneNPCs,

    npcDatabase
  };
};

/* ============================= */
/* 開場（防loop版） */
/* ============================= */

export const startStory = async (
  state: StoryState
): Promise<{ text: string; newState: StoryState }> => {

  const prompt = buildTurnPrompt(state, "");

  let retry = 0;

  while (retry < 3) {

    try {

      const responseText = await generateAIResponse(
        prompt,
        SYSTEM_PROMPT
      );

      const parsedResponse = parseAIResponse(responseText);

      const newState = updateStoryState(state, parsedResponse);

      const combinedText = parsedResponse.dialogue
        ? `${parsedResponse.story}\n\n"${parsedResponse.dialogue}"`
        : parsedResponse.story;

      if (!isLooping(combinedText, [])) {
        return { text: combinedText, newState };
      }

    } catch (e) {
      console.warn("StartStory retry:", e);
    }

    retry++;
  }

  /* fallback */
  return {
    text: "故事的開端似乎被某種力量干擾，但新的命運正在展開……",
    newState: state
  };
};

/* ============================= */
/* 玩家行動（防loop版） */
/* ============================= */

export const processUserAction = async (
  state: StoryState,
  action: string
): Promise<{ text: string; newState: StoryState }> => {

  const prompt = buildTurnPrompt(state, action);

  let retry = 0;

  while (retry < 3) {

    try {

      const responseText = await generateAIResponse(
        prompt,
        SYSTEM_PROMPT
      );

      const parsedResponse = parseAIResponse(responseText);

      const newState = updateStoryState(state, parsedResponse);

      const combinedText = parsedResponse.dialogue
        ? `${parsedResponse.story}\n\n"${parsedResponse.dialogue}"`
        : parsedResponse.story;

      // 🔥 防循環
      if (!isLooping(combinedText, state.history)) {
        return { text: combinedText, newState };
      }

      console.warn("⚠️ 偵測到循環，重新生成...");

    } catch (e) {

      console.warn("Process retry:", e);

    }

    retry++;
  }

  /* fallback 防卡死 */
  return {
    text: "局勢突然發生變化，一個突如其來的事件打破了原本的循環。",
    newState: {
      ...state,
      currentChapter: state.currentChapter + 1
    }
  };
};

/* ============================= */
/* 重置記憶 */
/* ============================= */

export const resetStoryMemory = (state: StoryState): StoryState => {

  return {
    ...state,
    npcMemories: {}
  };

};