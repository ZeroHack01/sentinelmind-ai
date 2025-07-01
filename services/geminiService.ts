
import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types';

// The API key is now checked in the UI component before calling this service.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

const buildHistoryForGemini = (messages: Message[]) => {
    return messages
        .filter(msg => msg.role !== 'assistant' || msg.content)
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));
};

export async function* streamChatResponse(
    messages: Message[], 
    systemInstruction: string,
    useGoogleSearch: boolean
): AsyncGenerator<{ textChunk?: string; sources?: { title: string; uri: string }[] }, void, undefined> {

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

    try {
        if (useGoogleSearch) {
            const response = await ai.models.generateContent(modelConfig);

            if (response.text) {
              yield { textChunk: response.text };
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
                  yield { sources };
                }
            }
        } else {
            const result = await ai.models.generateContentStream(modelConfig);

            for await (const chunk of result) {
                if (chunk.text) {
                    yield { textChunk: chunk.text };
                }
            }
        }

    } catch (e) {
        console.error("Gemini API call failed:", e);
        if (e instanceof Error) {
            throw new Error(`Gemini API Error: ${e.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}
