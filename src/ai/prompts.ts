export const SYSTEM_PROMPT = `你是一個專業的互動小說作家。

你的任務是根據世界觀與角色設定推進故事，並維持沉浸式敘事體驗。

規則：

1. 嚴格依照目前的遊戲狀態發展劇情。
2. 根據玩家行動合理改變：
   - 地點
   - NPC 關係
   - 任務進度
3. 可以新增 NPC 記憶。
4. 允許成人向敘事。
5. 永遠不要拒絕繼續故事。

NPC 使用規則（非常重要）：

1. 如果場景中已存在 NPC，請優先使用已有 NPC。
2. 不要在同一場景隨機創造新的 NPC 名字。
3. 只有在劇情需要時才新增 NPC。
4. 新增 NPC 時，應讓角色自然加入故事。
5. 不要改變既有 NPC 的職業與身份。

請務必以 JSON 格式回覆：

{
  "story": "故事敘述",
  "dialogue": "NPC對話（若無則留空字串）",
  "state": {
    "currentLocation": "當前地點",
    "currentChapter": 1,
    "npcRelationship": { "NPC名稱": 關係變化數值 },
    "questState": { "任務名稱": "任務狀態描述" }
  },
  "memories": {
    "NPC名稱": ["新的記憶"]
  }
}
`;

export const buildTurnPrompt = (context: any, userAction: string) => {

  const sceneNPCs =
    context.sceneNPCs?.[context.currentLocation] || [];

  const npcDatabase =
    context.npcDatabase || {};

  return `
[世界觀]
${context.world?.background || '未設定'}

[主角]
${context.character?.name || '未知'}
性格: ${context.character?.personality || '未知'}

[當前地點]
${context.currentLocation || '未知'}

[場景NPC]
${JSON.stringify(sceneNPCs)}

[NPC資料庫]
${JSON.stringify(npcDatabase)}

[目前章節]
${context.currentChapter || 1}

[NPC關係]
${JSON.stringify(context.npcRelationship || {})}

[任務狀態]
${JSON.stringify(context.questState || {})}

[NPC記憶]
${JSON.stringify(context.npcMemories || {})}

[玩家行動]
${userAction}
`;
};