export async function generateAIResponse(
  prompt: string,
  systemPrompt: string
): Promise<string> {

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nousresearch/hermes-4-70b",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 300
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error("OpenRouter request failed:", text);
    throw new Error("AI request failed");
  }

  const data = await response.json();

  if (!data?.choices?.[0]?.message?.content) {
    console.error("Invalid OpenRouter response:", data);
    throw new Error("Invalid AI response");
  }

  return data.choices[0].message.content;
}