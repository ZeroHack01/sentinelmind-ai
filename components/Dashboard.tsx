import React from 'react';
import { INTEL_MATRIX_DATA } from '../constants';
import InfoCard from './InfoCard';
import ThreatMap from './ThreatMap';
import { IntelRow } from '../types';

interface DashboardProps {
    onPromptSelect: (prompt: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPromptSelect }) => {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Left Column / Main Section --- */}
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Global Threat Analysis" fullWidth>
                        <ThreatMap />
                    </InfoCard>
                    <InfoCard title="Intel Matrix: Core Directives">
                         <div className="flex flex-col font-jet-brains space-y-6">
                            {INTEL_MATRIX_DATA.map((row: IntelRow, rowIndex: number) => (
                                <div key={rowIndex} className="grid grid-cols-[auto,1fr] gap-4 items-start">
                                    <div className="text-right text-cyan-300 text-sm font-semibold pt-3 whitespace-nowrap pr-4 border-r-2 border-cyan-400/30">
                                        {row.category}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {row.cells.map((cell, cellIndex) => (
                                        <button
                                            key={cellIndex}
                                            onClick={() => onPromptSelect(cell.prompt)}
                                            className="relative text-left p-3 overflow-hidden rounded-md bg-slate-800/50 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-400/50 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <p className="relative z-10 text-sm text-slate-200 group-hover:text-cyan-200 transition-colors">{cell.title}</p>
                                            <p className="relative z-10 text-xs text-slate-400 mt-1 opacity-70 group-hover:opacity-90 transition-opacity">Execute query...</p>
                                        </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </InfoCard>
                </div>

                {/* --- Right Column / Status Section --- */}
                <div className="space-y-6">
                    <InfoCard title="System Status">
                        <div className="space-y-3 font-jet-brains text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">AI Core:</span>
                                <span className="text-green-400 font-bold flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    ONLINE
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Threat Intel Feed:</span>
                                <span className="text-green-400">Connected</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-slate-300">Global Threat Level:</span>
                                <span className="text-orange-400 font-bold">ELEVATED</span>
                            </div>
                        </div>
                    </InfoCard>
                    <InfoCard title="Recent Vulnerabilities (Illustrative)">
                         <ul className="space-y-2 font-jet-brains text-xs text-slate-400">
                           <li className="flex items-center gap-2">
                             <span className="text-red-500">●</span>
                             <span>CVE-2024-XXXX: Kernel Panic</span>
                           </li>
                           <li className="flex items-center gap-2">
                             <span className="text-red-500">●</span>
                             <span>CVE-2024-YYYY: RCE Exploit</span>
                           </li>
                            <li className="flex items-center gap-2">
                             <span className="text-orange-500">●</span>
                             <span>CVE-2024-ZZZZ: XSS Vulnerability</span>
                           </li>
                         </ul>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;