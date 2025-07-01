import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message } from './types';
import { streamChatResponse } from './services/geminiService';
import PlexusBackground from './components/PlexusBackground';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { AIAvatar, MenuIcon } from './components/icons';
import { SENTINELMIND_SYSTEM_PROMPT } from './constants';
import Dashboard from './components/Dashboard';

type View = 'dashboard' | 'chat';

const SentinelMind: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length === 0 && !isLoading && view === 'chat') {
      setMessages([
        {
          role: 'assistant',
          content: '`SENTINELMIND ONLINE. AWAITING DIRECTIVE.`',
          id: Date.now(),
        },
      ]);
    }
  }, [isLoading, messages.length, view]);

  useEffect(() => {
    if (view === 'chat') {
      scrollToBottom();
    }
  }, [messages, isLoading, view]);

  const handleSend = useCallback(async (prompt: string, useGoogleSearch: boolean) => {
    if (isLoading || !prompt.trim()) return;
    
    if (!process.env.API_KEY) {
        setError("`API_KEY` is not configured. Please set it up in your environment to communicate with the AI Core.");
        setIsLoading(false);
        return;
    }

    setError(null);
    setIsLoading(true);
    if (view === 'dashboard') {
      setView('chat');
    }

    const initialMessages: Message[] = messages.length > 0 ? messages : [{
          role: 'assistant',
          content: '`SENTINELMIND ONLINE. AWAITING DIRECTIVE.`',
          id: Date.now(),
        }];

    const newUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: prompt,
    };

    const currentMessages = [...initialMessages, newUserMessage];
    setMessages(currentMessages);

    const assistantMessageId = Date.now() + 1;
    setMessages(prev => [
      ...prev,
      { id: assistantMessageId, role: 'assistant', content: '', isLoading: true },
    ]);

    try {
      const stream = streamChatResponse(currentMessages, SENTINELMIND_SYSTEM_PROMPT, useGoogleSearch);
      let fullResponse = '';
      
      for await (const chunk of stream) {
        if (chunk.textChunk) {
            fullResponse += chunk.textChunk;
        }
        
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: fullResponse, 
                isLoading: true,
                sources: chunk.sources ? chunk.sources : msg.sources 
              } 
            : msg
          )
        );
      }

    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`A critical system error occurred: ${errorMessage}`);
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
       setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId ? { ...msg, isLoading: false } : msg
          )
        );
    }
  }, [isLoading, messages, view]);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
  };
  
  const handlePromptSelect = (prompt: string) => {
    handleSend(prompt, false);
  }

  return (
    <div className="relative w-screen h-screen bg-[#030610] text-white flex flex-col overflow-hidden">
      <PlexusBackground />
      
      <header className="relative w-full p-4 text-center border-b border-cyan-400/20 bg-slate-900/50 backdrop-blur-sm z-20 flex-shrink-0">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300 font-jet-brains tracking-wider">
          🛡️ SentinelMind AI Expert
        </h1>
        <p className="text-sm text-slate-400 font-jet-brains mt-1">
          Relentlessly Guarding Your Digital Frontier
        </p>
         <div className="absolute top-1/2 -translate-y-1/2 right-4">
            <button 
              onClick={() => setView(v => v === 'chat' ? 'dashboard' : 'chat')}
              className="px-4 py-2 font-jet-brains text-sm rounded-md bg-slate-800/70 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-900/50 hover:border-cyan-400/70 transition-all"
            >
              {view === 'chat' ? 'Dashboard' : 'Chat View'}
            </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto transition-opacity duration-500">
        {view === 'dashboard' ? (
          <Dashboard onPromptSelect={handlePromptSelect} />
        ) : (
          <main className="h-full p-4 md:p-6 scroll-smooth">
            <div className="mx-auto max-w-4xl w-full h-full flex flex-col">
              <div className="flex-1 space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {error && (
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(0,255,255,0.5)]">
                        <AIAvatar />
                      </div>
                      <div className="w-full max-w-4xl p-5 rounded-xl border border-red-500/50 bg-red-900/30">
                          <p className="text-red-300 font-jet-brains">{error}</p>
                      </div>
                    </div>
                )}
              </div>
              <div ref={chatEndRef} />
            </div>
          </main>
        )}
      </div>
      
       {view === 'chat' && (
         <div className="w-full p-4 bg-transparent z-10 flex-shrink-0">
           <ChatInput onSend={handleSend} isLoading={isLoading} onClear={clearChat} />
        </div>
       )}
    </div>
  );
};

export default SentinelMind;