import { aiClient } from '../ai/geminiClient';
import { SYSTEM_PROMPT, buildTurnPrompt } from '../ai/prompts';
import { StoryState } from '../types/StoryState';
import { Type } from '@google/genai';

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
    // Attempt to parse the JSON response
    // Sometimes the model might wrap it in markdown code blocks
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanedText) as AIResponse;
  } catch (error) {
    console.error("Failed to parse AI response as JSON:", error, responseText);
    throw new Error("AI 回應格式錯誤，無法解析為 JSON");
  }
};

export const updateStoryState = (currentState: StoryState, aiResponse: AIResponse): StoryState => {
  const newNpcMemories = { ...currentState.npcMemories };
  
  if (aiResponse.memories) {
    for (const [npc, memories] of Object.entries(aiResponse.memories)) {
      if (!newNpcMemories[npc]) {
        newNpcMemories[npc] = [];
      }
      newNpcMemories[npc] = [...newNpcMemories[npc], ...memories];
    }
  }

  return {
    ...currentState,
    currentLocation: aiResponse.state.currentLocation || currentState.currentLocation,
    currentChapter: aiResponse.state.currentChapter || currentState.currentChapter,
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

export const processUserAction = async (state: StoryState, action: string): Promise<{ text: string, newState: StoryState }> => {
  const prompt = buildTurnPrompt(state, action);
  
  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            story: { type: Type.STRING, description: "故事敘述" },
            dialogue: { type: Type.STRING, description: "NPC對話" },
            state: {
              type: Type.OBJECT,
              properties: {
                currentLocation: { type: Type.STRING },
                currentChapter: { type: Type.INTEGER },
                npcRelationship: { 
                  type: Type.OBJECT, 
                  description: "NPC名稱對應關係變化數值",
                  additionalProperties: { type: Type.INTEGER }
                },
                questState: { 
                  type: Type.OBJECT,
                  description: "任務名稱對應任務狀態描述",
                  additionalProperties: { type: Type.STRING }
                }
              },
              required: ["currentLocation", "currentChapter", "npcRelationship", "questState"]
            },
            memories: {
              type: Type.OBJECT,
              additionalProperties: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          },
          required: ["story", "dialogue", "state"]
        }
      }
    });
    
    const responseText = response.text || '';
    const parsedResponse = parseAIResponse(responseText);
    const newState = updateStoryState(state, parsedResponse);
    
    // Combine story and dialogue for the chat UI
    const combinedText = parsedResponse.dialogue 
      ? `${parsedResponse.story}\n\n"${parsedResponse.dialogue}"`
      : parsedResponse.story;
      
    return { text: combinedText, newState };
  } catch (error) {
    console.error("Error generating story:", error);
    throw error;
  }
};
