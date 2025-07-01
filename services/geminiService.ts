import type { Message } from '../types';

export async function* streamChatResponse(
    messages: Message[], 
    systemInstruction: string,
    useGoogleSearch: boolean
): AsyncGenerator<{ textChunk?: string; sources?: { title: string; uri: string }[] }, void, undefined> {

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                systemInstruction,
                useGoogleSearch,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        if (!response.body) {
            throw new Error('Response body is null');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            // SSE format sends data in "data: { ... }\n\n" blocks.
            const lines = chunk.split('\n\n').filter(line => line.trim());
            for (const line of lines) {
                 if (line.startsWith('data: ')) {
                    const jsonString = line.substring(6);
                    if (jsonString) {
                         try {
                            const parsed = JSON.parse(jsonString);
                            yield parsed;
                        } catch(e) {
                            console.error("Failed to parse SSE JSON chunk:", jsonString);
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.error("Frontend service error:", e);
        if (e instanceof Error) {
            throw new Error(`Service Error: ${e.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the backend service.");
    }
}