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

      /* 新 NPC 自動建立資料庫 */
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

/* ===== 新增：生成遊戲開場 ===== */

export const startStory = async (
  state: StoryState
): Promise<{ text: string; newState: StoryState }> => {

  const prompt = buildTurnPrompt(state, "");

  const responseText = await generateAIResponse(
    prompt,
    SYSTEM_PROMPT
  );

  const parsedResponse = parseAIResponse(responseText);

  const newState = updateStoryState(state, parsedResponse);

  const combinedText = parsedResponse.dialogue
    ? `${parsedResponse.story}\n\n"${parsedResponse.dialogue}"`
    : parsedResponse.story;

  return {
    text: combinedText,
    newState
  };
};

/* ===== 玩家行動處理 ===== */

export const processUserAction = async (
  state: StoryState,
  action: string
): Promise<{ text: string; newState: StoryState }> => {

  const prompt = buildTurnPrompt(state, action);

  const responseText = await generateAIResponse(
    prompt,
    SYSTEM_PROMPT
  );

  const parsedResponse = parseAIResponse(responseText);

  const newState = updateStoryState(state, parsedResponse);

  const combinedText = parsedResponse.dialogue
    ? `${parsedResponse.story}\n\n"${parsedResponse.dialogue}"`
    : parsedResponse.story;

  return {
    text: combinedText,
    newState
  };
};

export const resetStoryMemory = (state: StoryState): StoryState => {

  return {
    ...state,
    npcMemories: {}
  };
};