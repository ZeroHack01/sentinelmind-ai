import React from 'react';
import { INTEL_MATRIX_DATA } from '../constants';
import { CloseIcon } from './icons';

interface PromptLibraryProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onPromptSelect: (prompt: string) => void;
}

// Derive prompts here to bypass a potential module loading issue.
const DASHBOARD_PROMPTS = INTEL_MATRIX_DATA.flatMap(row => row.cells);

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, setIsOpen, onPromptSelect }) => {
    
    const handlePromptClick = (prompt: string) => {
        onPromptSelect(prompt);
        // Optionally close sidebar on mobile after selection
        if (window.innerWidth < 768) {
            setIsOpen(false);
        }
    }

    return (
        <aside
            className={`flex-shrink-0 bg-slate-900/60 backdrop-blur-md border-r border-cyan-400/20 transition-all duration-300 ease-in-out flex flex-col z-20 h-full ${
                isOpen ? 'w-full md:w-72 p-4' : 'w-0'
            }`}
            style={{ overflow: 'hidden' }}
        >
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
                <h2 className="font-jet-brains text-lg text-cyan-300">Intel Matrix</h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-cyan-300">
                    <CloseIcon />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto -mr-4 pr-3 space-y-2">
                {DASHBOARD_PROMPTS.map((item, index) => (
                    <button 
                        key={index} 
                        onClick={() => handlePromptClick(item.prompt)}
                        className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-cyan-900/50 border border-transparent hover:border-cyan-400/50 transition-all duration-200"
                    >
                        <p className="font-jet-brains text-sm text-slate-200">{item.title}</p>
                    </button>
                ))}
            </div>

            <div className="mt-4 text-xs text-slate-500 font-jet-brains flex-shrink-0">
                <p>Select a query to begin analysis.</p>
            </div>
        </aside>
    );
};

export default PromptLibrary;