import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===== AI API =====
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, systemPrompt } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      systemInstruction: systemPrompt
    });

    const result = await model.generateContent(prompt);

    res.json({
      text: result.response.text()
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});