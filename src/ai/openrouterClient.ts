export async function generateAIResponse(
  prompt: string,
  systemPrompt: string,
  model: string = "deepseek/deepseek-chat-v3",
  maxTokens: number = 600
): Promise<string> {

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-trpg-engine.run.app",
        "X-Title": "AI TRPG Engine",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        top_p: 0.9,
        presence_penalty: 0.4,
        frequency_penalty: 0.4,
        max_tokens: maxTokens,
      }),
    }
  );

  const data = await response.json();

  // 🔥 這行很重要（避免 undefined）
  return data.choices?.[0]?.message?.content || "";
}