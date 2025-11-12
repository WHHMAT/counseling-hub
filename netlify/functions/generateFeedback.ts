import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, systemInstruction, userContent } = body;

    if (!prompt && (!systemInstruction || !userContent)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt or systemInstruction/userContent is required' }),
      };
    }

    // FIX: Updated to use process.env.API_KEY as per the coding guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let finalPrompt;

    if (systemInstruction && userContent) {
      // For structured requests (like from SmartGoalTool), combine them into a single prompt.
      // This is more stable than using the systemInstruction config for complex tasks.
      finalPrompt = `${systemInstruction}\n\n---\n\n${userContent}`;
    } else {
      // For simple requests, use the prompt directly.
      finalPrompt = prompt;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: finalPrompt,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ feedback: response.text }),
    };
  } catch (error) {
    console.error('Error generating feedback:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate feedback' }),
    };
  }
};

export { handler };