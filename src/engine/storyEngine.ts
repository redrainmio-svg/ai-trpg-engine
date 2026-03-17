import { generateAIResponse } from "../ai/openrouterClient";
import { SYSTEM_PROMPT, buildTurnPrompt } from "../ai/prompts";
import { StoryState } from "../types/StoryState";

/* ============================= */
/* 模型選擇 */
/* ============================= */

function chooseModel(state: StoryState, action: string): string {
  if (!state.history || state.history.length < 2) {
    return "deepseek/deepseek-chat-v3";
  }

  if (state.contentMode === "mature") {
    return "deepseek/deepseek-chat-v3";
  }

  if (action.includes("戰鬥") || action.includes("高潮") || action.includes("重要")) {
    return "deepseek/deepseek-chat-v3";
  }

  return "mistralai/mistral-small-creative";
}

/* ============================= */
/* 動態 tokens */
/* ============================= */

function getMaxTokens(action: string): number {
  if (action.includes("戰鬥")) return 400;
  if (action.includes("對話")) return 600;
  if (action.includes("情色")) return 1200;
  return 600;
}

/* ============================= */
/* 防循環 */
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

  if (newText.trim() === last.trim()) return true;
  if (similarity(newText, last) > 0.8) return true;

  return false;
}

/* ============================= */
/* 🔥 安全 JSON 解析 */
/* ============================= */

export const safeParseAIResponse = (responseText: string) => {
  try {
    let cleaned = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      story: parsed.story,
      dialogue: parsed.dialogue,
      state: parsed.state || {},
      memories: parsed.memories || {},
      choices: Array.isArray(parsed.choices) ? parsed.choices : []
    };

  } catch (error) {

    console.error("❌ JSON parse failed:", responseText);

    return {
      story: "世界線發生短暫錯亂，但很快恢復正常……",
      dialogue: "",
      state: {},
      memories: {},
      choices: []
    };

  }
};

/* ============================= */
/* 🔥 安全文字處理（核心修復） */
/* ============================= */

function safeText(story: any, dialogue: any): string {

  const safeStory =
    typeof story === "string"
      ? story
      : JSON.stringify(story ?? "");

  const safeDialogue =
    typeof dialogue === "string"
      ? dialogue
      : "";

  return safeDialogue
    ? `${safeStory}\n\n"${safeDialogue}"`
    : safeStory;
}

/* ============================= */
/* 更新狀態 */
/* ============================= */

export const updateStoryState = (
  currentState: StoryState,
  aiResponse: any
): StoryState => {

  const newNpcMemories = { ...currentState.npcMemories };
  const sceneNPCs = { ...currentState.sceneNPCs };
  const npcDatabase = { ...currentState.npcDatabase };

  const currentLocation =
    aiResponse.state?.currentLocation ||
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
        ...(memories as string[])
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
      aiResponse.state?.currentChapter ||
      currentState.currentChapter,
    npcRelationship: {
      ...currentState.npcRelationship,
      ...(aiResponse.state?.npcRelationship || {})
    },
    questState: {
      ...currentState.questState,
      ...(aiResponse.state?.questState || {})
    },
    npcMemories: newNpcMemories,
    sceneNPCs,
    npcDatabase
  };
}

/* ============================= */
/* AI 呼叫 */
/* ============================= */

async function callAI(state: StoryState, action: string, prompt: string) {

  const model = chooseModel(state, action);
  const maxTokens = getMaxTokens(action);

  console.log("🧠 model:", model, "tokens:", maxTokens);

  return generateAIResponse(
    prompt,
    SYSTEM_PROMPT,
    model,
    maxTokens
  );
}

/* ============================= */
/* 開場 */
/* ============================= */

export const startStory = async (state: StoryState) => {

  const prompt = buildTurnPrompt(state, "");

  let retry = 0;

  while (retry < 3) {

    const responseText = await callAI(state, "", prompt);
    const parsed = safeParseAIResponse(responseText);
    const newState = updateStoryState(state, parsed);

    const text = safeText(parsed.story, parsed.dialogue);

    if (!isLooping(text, [])) {
      return { text, newState };
    }

    retry++;
  }

  return {
    text: "故事的開端略顯混亂，但命運仍在推進……",
    newState: state
  };
};

/* ============================= */
/* 玩家行動 */
/* ============================= */

export const processUserAction = async (
  state: StoryState,
  action: string
) => {

  const prompt = buildTurnPrompt(state, action);

  let retry = 0;

  while (retry < 3) {

    const responseText = await callAI(state, action, prompt);
    const parsed = safeParseAIResponse(responseText);
    const newState = updateStoryState(state, parsed);

    const text = safeText(parsed.story, parsed.dialogue);

    if (!isLooping(text, state.history)) {
      return { text, newState };
    }

    console.warn("⚠️ loop detected, retry...");
    retry++;
  }

  return {
    text: "局勢忽然產生變化，一個新的契機打破了僵局。",
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