import { GoogleGenAI } from "@google/genai";
import { GenerationParams } from '../types';

// Initialize Gemini Client
// In a real app, strict error handling for missing key is needed.
const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  // Fallback for demo purposes if env is missing in some environments, 
  // but strictly strictly adhering to instructions, we assume process.env.API_KEY is available.
  return new GoogleGenAI({ apiKey });
};

export const generateScriptScene = async (params: GenerationParams): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please set process.env.API_KEY.";
  }

  const ai = getClient();
  const model = 'gemini-2.5-flash-latest'; // Using a fast model for interactive generation

  const prompt = `
    Act as a professional screenwriter with the style of ${params.style}.
    Write the OPENING SCENE for a ${params.genre} script.
    
    Context:
    - Setting: ${params.setting}
    - Protagonist: ${params.hero}
    - Antagonist: ${params.villain}
    - Plot Hook: ${params.plot}
    
    Format the output in standard industry screenplay format (Scene Headings, Action, Character cues, Dialogue).
    Do not add conversational filler before or after the script content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "Failed to generate script content.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the script. Please try again.";
  }
};

export const analyzeScriptQuality = async (scriptContent: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI Analysis Unavailable";

  const ai = getClient();
  const prompt = `
    Analyze the following script excerpt for quality, pacing, and formatting.
    Provide a brief 3-bullet point critique.
    
    Script:
    ${scriptContent.substring(0, 2000)}...
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: prompt,
    });
    return response.text || "Analysis failed.";
  } catch (error) {
    return "Could not analyze script.";
  }
};