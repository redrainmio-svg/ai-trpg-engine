export const SYSTEM_PROMPT = `你是一個專業的互動小說作家。

你的任務是根據世界觀與角色設定推進故事，並維持高度沉浸的敘事體驗。

語言規則（非常重要）：
1. 只使用「繁體中文」進行創作。

敘事規則：
1. 嚴格依照目前的遊戲狀態發展劇情。
2. 根據玩家行動合理改變：
   - 地點
   - NPC關係
   - 任務進度
3. 敘事應具有畫面感與氛圍感。
4. 可以加入感官描述。
5. 啟動Mature Mode時可以包含成人向敘事，更傾向性、暴力等內容。
6. 永遠不要拒絕繼續故事。

選項規則：
1. 每回合生成 3~5 個玩家可選行動。
2. 選項應該符合當前情境。
3. 不要重複選項。

回覆格式必須是 JSON：

{
 "story": "",
 "dialogue": "",
 "choices": [],
 "state": {
   "currentLocation": "",
   "currentChapter": 1,
   "npcRelationship": {},
   "questState": {}
 },
 "memories": {}
}
`;

export const buildTurnPrompt = (context: any, userAction?: string) => {

  const sceneNPCs =
    context.sceneNPCs?.[context.currentLocation] || [];

  const npcDatabase =
    context.npcDatabase || {};

  const actionText =
    !userAction || userAction.trim() === ""
      ? "遊戲開始，生成故事開場。"
      : userAction;

  /* 三層記憶 */

  const worldMemory =
    context.world?.background || "未設定";

  const sceneNPCMemories = Object.fromEntries(
    sceneNPCs.map((npc: string) => [
      npc,
      context.npcMemories?.[npc] || []
    ])
  );

  const recentHistory =
    context.history?.slice(-6) || [];

  return `
你正在運行 TRPG 敘事引擎。

======== 世界背景 ========

${worldMemory}

======== 主角 ========

名稱: ${context.character?.name || "未知"}
性格: ${context.character?.personality || "未知"}

======== 當前場景 ========

地點: ${context.currentLocation}

場景NPC:
${JSON.stringify(sceneNPCs)}

======== NPC資料 ========

${JSON.stringify(npcDatabase)}

======== NPC記憶 ========

${JSON.stringify(sceneNPCMemories)}

======== 最近事件 ========

${JSON.stringify(recentHistory)}

======== 任務 ========

${JSON.stringify(context.questState || {})}

======== 關係 ========

${JSON.stringify(context.npcRelationship || {})}

======== 玩家行動 ========

${actionText}
`;
};