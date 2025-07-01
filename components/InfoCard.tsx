import React from 'react';

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
    fullWidth?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, fullWidth = false }) => {
    return (
        <div className={`bg-slate-900/60 backdrop-blur-md border border-cyan-400/20 rounded-xl shadow-lg shadow-cyan-900/10 ${fullWidth ? 'w-full' : ''}`}>
            <h3 className="font-jet-brains text-cyan-300 px-4 py-3 border-b border-cyan-400/20 text-base">
                {title}
            </h3>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
};

export default InfoCard;
