import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { UserAvatar, AIAvatar } from './icons';

interface ChatMessageProps {
  message: Message;
}

const CodeBlock: React.FC<{ node: any; inline?: boolean; className?: string; children: React.ReactNode & React.ReactNode[] }> = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeText = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return !inline && match ? (
        <div className="relative my-4 rounded-lg bg-[#0d1117]">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-700/50 rounded-t-lg">
                <span className="text-sm text-gray-300 font-jet-brains">{match[1]}</span>
                <button
                    onClick={handleCopy}
                    className="text-sm text-gray-300 font-jet-brains hover:text-cyan-300 transition-colors duration-200"
                >
                    {isCopied ? 'Copied!' : 'Copy code'}
                </button>
            </div>
            <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                customStyle={{ margin: 0, background: 'transparent' }}
                {...props}
            >
                {codeText}
            </SyntaxHighlighter>
        </div>
    ) : (
        <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-slate-700/50 text-cyan-300 font-jet-brains" {...props}>
            {children}
        </code>
    );
};


const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content, isLoading, sources } = message;
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 border-2 border-cyan-400/70 shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all ${isLoading ? 'animate-pulse' : ''}`}>
          <AIAvatar />
        </div>
      )}

      <div
        className={`w-full max-w-4xl p-5 rounded-xl border ${
          isUser
            ? 'bg-sky-900/40 border-sky-400/30'
            : 'bg-slate-800/60 backdrop-blur-md border-cyan-400/20'
        }`}
      >
        {isLoading && content.length === 0 ? (
           <div className="w-full h-6 flex items-center">
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:-0.3s]"></div>
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:-0.15s] mx-1"></div>
             <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
           </div>
        ) : (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({node, ...props}) => <h2 className="text-xl md:text-2xl font-bold font-jet-brains text-green-300 mt-6 mb-3 pb-2 border-b border-green-300/30" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg md:text-xl font-bold font-jet-brains text-green-300 mt-4 mb-2" {...props} />,
                strong: ({node, ...props}) => <strong className="text-cyan-300 font-bold font-jet-brains" {...props} />,
                p: ({node, ...props}) => <p className="text-base md:text-lg text-slate-100 opacity-90 leading-relaxed my-4" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 my-4 pl-4" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 my-4 pl-4" {...props} />,
                li: ({node, ...props}) => <li className="text-base md:text-lg" {...props} />,
                a: ({node, ...props}) => <a className="text-cyan-400 hover:text-cyan-200 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                code: CodeBlock,
              }}
            >
              {content + (isLoading && !sources ? '▌' : '')}
            </ReactMarkdown>

            {sources && sources.length > 0 && !isLoading && (
              <div className="mt-4 pt-4 border-t border-cyan-400/20">
                <h4 className="font-jet-brains text-sm text-slate-300 mb-2">Sources:</h4>
                <ul className="space-y-2">
                  {sources.map((source, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm truncate">
                       <span className="text-cyan-400">●</span>
                       <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-300 hover:underline truncate" title={source.title}>
                           {source.title}
                       </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 border-2 border-cyan-400/70">
          <UserAvatar />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;