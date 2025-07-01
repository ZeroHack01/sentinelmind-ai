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
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                // If there's anything left in the buffer, try to process it
                if (buffer.startsWith('data: ')) {
                    const jsonString = buffer.substring(6).trim();
                     if (jsonString) {
                         try {
                            yield JSON.parse(jsonString);
                        } catch(e) {
                            console.error("Failed to parse final SSE JSON chunk:", jsonString);
                        }
                    }
                }
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            
            // Process all complete "data: ...\n\n" messages in the buffer
            let boundary = buffer.indexOf('\n\n');
            while (boundary !== -1) {
                const message = buffer.substring(0, boundary);
                buffer = buffer.substring(boundary + 2); // 2 for '\n\n'

                if (message.startsWith('data: ')) {
                    const jsonString = message.substring(6).trim();
                    if (jsonString) {
                         try {
                            const parsed = JSON.parse(jsonString);
                            yield parsed;
                        } catch(e) {
                            console.error("Failed to parse SSE JSON chunk:", jsonString);
                        }
                    }
                }
                boundary = buffer.indexOf('\n\n');
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
