import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
// Note: In Vite, process.env.GEMINI_API_KEY is injected via vite.config.ts define
export const aiClient = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY as string 
});
