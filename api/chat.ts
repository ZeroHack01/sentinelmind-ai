import { GoogleGenAI } from "@google/genai";

// This is a Vercel Edge Function, which is fast and efficient.
export const config = {
  runtime: 'edge',
};

// Redefining types here to make the API endpoint self-contained.
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const buildHistoryForGemini = (messages: Message[]) => {
    return messages
        .filter(msg => msg.role !== 'assistant' || msg.content)
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { messages, systemInstruction, useGoogleSearch } = await req.json();
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const history = buildHistoryForGemini(messages.slice(0, -1));
    const userPrompt = messages[messages.length - 1].content;

    const modelConfig = {
      model: "gemini-2.5-flash-preview-04-17",
      contents: [...history, { role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemInstruction,
        ...(useGoogleSearch && { tools: [{ googleSearch: {} }] }),
      },
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (useGoogleSearch) {
            const response = await ai.models.generateContent(modelConfig);

            if (response.text) {
              const textChunkPayload = { textChunk: response.text };
              controller.enqueue(`data: ${JSON.stringify(textChunkPayload)}\n\n`);
            }

            const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks?.length) {
              const sources = groundingMetadata.groundingChunks
                .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
                .map(chunk => ({
                  uri: chunk.web!.uri!,
                  title: chunk.web!.title!,
                }));
              if (sources.length > 0) {
                const sourcesPayload = { sources };
                controller.enqueue(`data: ${JSON.stringify(sourcesPayload)}\n\n`);
              }
            }
          } else {
            const result = await ai.models.generateContentStream(modelConfig);
            for await (const chunk of result) {
              if (chunk.text) {
                const payload = { textChunk: chunk.text };
                controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
              }
            }
          }
          controller.close();
        } catch (error) {
           console.error("Error during Gemini API call:", error);
           const errorMessage = error instanceof Error ? error.message : "Unknown API error";
           controller.error(new Error(errorMessage));
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Error in handler:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
