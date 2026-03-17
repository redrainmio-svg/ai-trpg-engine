import { generateAIResponse } from "../ai/openrouterClient";
import { SYSTEM_PROMPT, buildTurnPrompt } from "../ai/prompts";
import { StoryState } from "../types/StoryState";

/* ============================= */
/* 🔥 模型選擇（成本優化核心） */
/* ============================= */

function chooseModel(state: StoryState, action: string): string {

  // 開場 → 高品質
  if (!state.history || state.history.length < 2) {
    return "deepseek/deepseek-chat-v3";
  }

  // 成人內容
  if (state.contentMode === "mature") {
    return "deepseek/deepseek-chat-v3";
  }

  // 關鍵事件
  if (action.includes("戰鬥") || action.includes("高潮") || action.includes("重要")) {
    return "deepseek/deepseek-chat-v3";
  }

  // 預設 → 省錢模型
  return "mistralai/mistral-small-creative";
}

/* ============================= */
/* 🔥 動態 tokens 控制 */
/* ============================= */

function getMaxTokens(action: string): number {

  if (action.includes("戰鬥")) return 300;
  if (action.includes("對話")) return 400;
  if (action.includes("情色")) return 1200;

  return 600;
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

  if (newText.trim() === last.trim()) return true;
  if (similarity(newText, last) > 0.8) return true;

  return false;
}

/* ============================= */
/* JSON 解析 */
/* ============================= */

export const parseAIResponse = (responseText: string) => {
  try {

    const cleanedText = responseText
      .replace(/```json\n?|\n?```/g, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {

    console.error("JSON parse error:", error);
    throw new Error("AI JSON parse error");

  }
};

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
/* AI 呼叫統一入口 */
/* ============================= */

async function callAI(state: StoryState, action: string, prompt: string) {

  const model = chooseModel(state, action);
  const maxTokens = getMaxTokens(action);

  console.log("🧠 使用模型:", model, "tokens:", maxTokens);

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

    try {

      const responseText = await callAI(state, "", prompt);

      const parsed = parseAIResponse(responseText);

      const newState = updateStoryState(state, parsed);

      const text = parsed.dialogue
        ? `${parsed.story}\n\n"${parsed.dialogue}"`
        : parsed.story;

      if (!isLooping(text, [])) {
        return { text, newState };
      }

    } catch (e) {
      console.warn("Start retry:", e);
    }

    retry++;
  }

  return {
    text: "故事的開端似乎受到干擾，但新的命運正在展開……",
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

    try {

      const responseText = await callAI(state, action, prompt);

      const parsed = parseAIResponse(responseText);

      const newState = updateStoryState(state, parsed);

      const text = parsed.dialogue
        ? `${parsed.story}\n\n"${parsed.dialogue}"`
        : parsed.story;

      if (!isLooping(text, state.history)) {
        return { text, newState };
      }

      console.warn("⚠️ loop detected, retry...");

    } catch (e) {

      console.warn("retry:", e);

    }

    retry++;
  }

  return {
    text: "局勢突然發生劇烈變化，一個新的事件打破了僵局。",
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