import { generateAIResponse } from "../ai/geminiClient";
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

    console.error("Failed to parse AI response as JSON:", error, responseText);

    throw new Error("AI 回應格式錯誤，無法解析為 JSON");
  }
};

export const updateStoryState = (
  currentState: StoryState,
  aiResponse: AIResponse
): StoryState => {

  const newNpcMemories = { ...currentState.npcMemories };

  if (aiResponse.memories) {
    for (const [npc, memories] of Object.entries(aiResponse.memories)) {

      if (!newNpcMemories[npc]) {
        newNpcMemories[npc] = [];
      }

      newNpcMemories[npc] = [
        ...newNpcMemories[npc],
        ...memories
      ];
    }
  }

  return {

    ...currentState,

    currentLocation:
      aiResponse.state.currentLocation ||
      currentState.currentLocation,

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

    npcMemories: newNpcMemories
  };
};

export const processUserAction = async (
  state: StoryState,
  action: string
): Promise<{ text: string; newState: StoryState }> => {

  const prompt = buildTurnPrompt(state, action);

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

    return {
      text: combinedText,
      newState
    };

  } catch (error) {

    console.error("Error generating story:", error);

    throw error;
  }
};

/* =============================
   🔧 新增：清空 AI 記憶的 helper
   ============================= */

export const resetStoryMemory = (state: StoryState): StoryState => {

  return {
    ...state,

    npcMemories: {},

    npcRelationship: {},

    questState: {}
  };
};