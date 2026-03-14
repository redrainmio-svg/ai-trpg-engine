export async function generateAIResponse(
  prompt: string,
  systemPrompt: string
) {
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
    throw new Error("AI request failed");
  }

  const data = await response.json();

  return data.text;
}