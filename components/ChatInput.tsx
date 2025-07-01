import React, { useState, useRef, FormEvent, useEffect } from 'react';
import { SendIcon } from './icons';

interface ChatInputProps {
  onSend: (prompt: string, useGoogleSearch: boolean) => void;
  isLoading: boolean;
  onClear: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, onClear }) => {
  const [prompt, setPrompt] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [prompt]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSend(prompt, useGoogleSearch);
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="p-4 rounded-xl bg-slate-900/70 backdrop-blur-lg border-2 border-cyan-400/30 focus-within:border-cyan-400/80 transition-all duration-300 shadow-2xl shadow-cyan-500/10">
        <form onSubmit={handleSubmit} className="flex items-start gap-4">
            <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter query..."
            className="flex-1 bg-transparent text-base md:text-lg text-white placeholder-cyan-200/50 resize-none focus:outline-none font-inter max-h-48"
            rows={1}
            disabled={isLoading}
            />
            <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="p-2 rounded-full text-cyan-300 bg-cyan-900/50 hover:bg-cyan-700/70 disabled:bg-slate-700 disabled:text-slate-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 self-end"
            >
            <SendIcon className="w-6 h-6" />
            </button>
        </form>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-cyan-400/20">
            <div className="flex items-center gap-3">
                <label htmlFor="google-search" className={`flex items-center gap-2 text-sm cursor-pointer font-jet-brains transition-colors ${useGoogleSearch ? 'text-cyan-300' : 'text-slate-300 hover:text-cyan-200'}`}>
                    <input
                        type="checkbox"
                        id="google-search"
                        checked={useGoogleSearch}
                        onChange={(e) => setUseGoogleSearch(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-700 border-slate-500 text-cyan-500 focus:ring-cyan-600 focus:ring-offset-slate-900"
                    />
                    Search recent events
                </label>
            </div>
            <button
            onClick={onClear}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors duration-200 font-jet-brains"
            >
            [ Clear Session ]
            </button>
        </div>
        </div>
    </div>
  );
};

export default ChatInput;