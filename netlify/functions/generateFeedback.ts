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
        body: JSON.stringify({ error: 'Il prompt è richiesto.' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const generationRequest = {
        model: 'gemini-2.5-flash',
        contents: userContent || prompt,
        ...(systemInstruction && { config: { systemInstruction: systemInstruction } })
    };

    const response = await ai.models.generateContent(generationRequest);
    
    // Estrazione del testo robusta e controllo di sicurezza
    const feedbackText = response.candidates?.[0]?.content?.parts?.map(part => part.text).join('') ?? '';
    
    // Controlla se la risposta è stata bloccata per motivi di sicurezza
    if (!feedbackText && response.promptFeedback?.blockReason) {
        const blockMessage = `La tua richiesta è stata bloccata a causa delle policy di sicurezza (${response.promptFeedback.blockReason}). Prova a riformulare il tuo input.`;
        return {
          statusCode: 400,
          body: JSON.stringify({ error: blockMessage }),
        };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ feedback: feedbackText }),
    };
  } catch (error) {
    console.error('Error generating feedback:', error);
    
    // Migliorata la gestione degli errori per fornire un messaggio più specifico
    let errorMessage = 'Si è verificato un errore durante la comunicazione con il servizio AI. Riprova più tardi.';
    const errorString = (error as object)?.toString() || '';

    if (errorString.includes('API key') || errorString.includes('400') || errorString.includes('403')) {
        errorMessage = "La chiave API per Gemini non è valida o non è configurata correttamente. Potrebbe essere necessario verificarla nelle impostazioni di Netlify.";
    } else if (errorString.includes('timed out')) {
        errorMessage = "La richiesta ha impiegato troppo tempo a rispondere. Riprova."
    } else if (errorString.includes('503')) {
        errorMessage = "Il servizio AI è momentaneamente non disponibile. Riprova tra qualche minuto."
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};

export { handler };