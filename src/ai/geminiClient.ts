export async function generateAIResponse(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      systemPrompt
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI request failed:", text);
    throw new Error("AI request failed");
  }

  const data = await response.json();

  if (!data || !data.text) {
    throw new Error("Invalid AI response");
  }

  return data.text;
}