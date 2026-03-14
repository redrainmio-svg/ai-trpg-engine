import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ===== Gemini =====
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===== AI API =====
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-pro",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);

    const text = result.response.text();

    res.json({
      text
    });

  } catch (error) {
    console.error("AI generation failed:", error);
    res.status(500).json({
      error: "AI generation failed"
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