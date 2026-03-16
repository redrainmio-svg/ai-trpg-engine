import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===== OpenRouter API =====
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
      throw new Error("OpenRouter request failed");
    }

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      console.error("Invalid OpenRouter response:", data);
      throw new Error("Invalid AI response");
    }

    res.json({
      text
    });

  } catch (error) {
    console.error("AI generation failed:", error);

    res.status(500).json({
      error: "AI generation failed",
      detail: error.message
    });
  }
});

// ===== Serve React build =====
const __dirname = new URL(".", import.meta.url).pathname;

app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist/index.html"));
});

// ===== Cloud Run Port =====
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});