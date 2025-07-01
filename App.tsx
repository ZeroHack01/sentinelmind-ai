
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from './types';
import { streamChatResponse } from './services/geminiService';
import PlexusBackground from './components/PlexusBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { AIAvatar } from './components/icons';
import { SENTINELMIND_SYSTEM_PROMPT } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading) {
      setMessages([
        {
          role: 'assistant',
          content: '`SENTINELMIND ONLINE. AWAITING DIRECTIVE.`',
          id: Date.now(),
        },
      ]);
    }
  }, [isLoading, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (prompt: string, useGoogleSearch: boolean) => {
    if (isLoading || !prompt.trim()) return;

    setError(null);
    setIsLoading(true);

    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt,
    };

    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);

    // Add a placeholder for the assistant's response
    const assistantMessageId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', isLoading: true },
    ]);

    try {
      const stream = streamChatResponse(currentMessages, SENTINELMIND_SYSTEM_PROMPT, useGoogleSearch);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, content: fullResponse, isLoading: false } : msg
          )
        );
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`A critical system error occurred: ${errorMessage}`);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId)); // Remove placeholder on error
    } finally {
      setIsLoading(false);
      // Final update to remove isLoading flag from the message
       setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, isLoading: false } : msg
          )
        );
    }
  }, [isLoading, messages]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };


  return (
    <div className="relative w-screen h-screen bg-[#030610] text-white flex flex-col overflow-hidden">
      <PlexusBackground />
      <header className="relative w-full p-4 text-center border-b border-cyan-400/20 bg-slate-900/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 font-jet-brains tracking-wider">
          🛡️ SentinelMind AI Expert
        </h1>
        <p className="text-sm text-slate-400 font-jet-brains mt-1">
          Relentlessly Guarding Your Digital Frontier
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
         {error && (
            <div className="flex items-start gap-4">
               <div className="flex-shrink-0"><AIAvatar /></div>
                <div className="w-full max-w-4xl p-4 rounded-xl border border-red-500/50 bg-red-900/30">
                    <p className="text-red-300 font-jet-brains">{error}</p>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </main>
      
      <div className="w-full px-4 pb-4 bg-transparent z-10">
         <ChatInput onSend={handleSend} isLoading={isLoading} onClear={clearChat} />
      </div>
    </div>
  );
};

export default App;
