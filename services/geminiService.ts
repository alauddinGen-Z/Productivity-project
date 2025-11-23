import { GoogleGenAI } from "@google/genai";

export const simplifyTask = async (taskTitle: string): Promise<string[]> => {
  // Initialize inside the function to ensure we grab the latest environment variable
  // and handle cases where it might not be set immediately at module load time.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return ["Please configure your API Key in settings.", "Manually break down this task."];
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The user has a vague task: "${taskTitle}". 
      Break this down into 3-5 concrete, immediate, small actionable steps (Swiss Cheese method) to get started. 
      Return ONLY the steps as a JSON array of strings.`,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Error:", error);
    // Fallback logic to ensure UI doesn't break
    return ["Brainstorm immediate next step", "Set a timer for 5 minutes", "Just open the file/tool"];
  }
};

export const analyzeFeynman = async (concept: string, explanation: string): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I am using the Feynman Technique to learn: "${concept}".
      Here is my explanation: "${explanation}".
      
      Please act as a compassionate tutor. 
      1. Identify any gaps in my logic.
      2. Simplify the language further (eliminate jargon).
      3. Provide a simple analogy to make it stick.
      Keep the response concise (under 150 words).`,
    });
    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Unable to analyze at this moment. Please try again later.";
  }
};