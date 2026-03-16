import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===== OpenRouter API =====
app.post("/api/generate", async (req, res) => {
  try {

    const { prompt, systemPrompt } = req.body;

    if (!prompt || !systemPrompt) {
      return res.status(400).json({
        error: "Missing prompt or systemPrompt"
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY");

      return res.status(500).json({
        error: "Server configuration error",
        detail: "OPENROUTER_API_KEY not set"
      });
    }

    console.log("Sending request to OpenRouter...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai-trpg-engine.run.app",
          "X-Title": "AI TRPG Engine"
        },
        body: JSON.stringify({
          model: "nousresearch/hermes-3-llama-3.1-70b",
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

    // ===== OpenRouter錯誤處理 =====
    if (!response.ok) {

      const text = await response.text();

      console.error("OpenRouter request failed:", text);

      return res.status(500).json({
        error: "OpenRouter request failed",
        detail: text
      });
    }

    const data = await response.json();

    console.log("OpenRouter response received");

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {

      console.error("Invalid OpenRouter response:", data);

      return res.status(500).json({
        error: "Invalid AI response",
        detail: data
      });
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