import React from 'react';

interface MainMenuProps {
    onStart: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl text-foreground font-sans p-4">

            {/* Hero Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-pulse text-center leading-tight">
                GALACTIC<br />DEFENDER
            </h1>

            <p className="max-w-md text-center text-muted-foreground mb-12 text-lg">
                defend the galaxy against the endless void using advanced weaponry and reflex-based combat.
            </p>

            {/* Start Button */}
            <button
                onClick={onStart}
                className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-50 bg-[url('/noise.png')] mix-blend-overlay" />
                <span className="relative text-xl font-bold text-white tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">
                    ENGAGE SYSTEMS
                </span>
            </button>

            {/* Controls Grid */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm text-center">
                <ControlKey k="WASD" label="MOVE" />
                <ControlKey k="SPACE" label="SHOOT" />
                <ControlKey k="R" label="ROCKET" />
                <ControlKey k="ESC" label="PAUSE" />
            </div>

        </div>
    );
};

const ControlKey = ({ k, label }: { k: string, label: string }) => (
    <div className="flex flex-col items-center gap-2">
        <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-md font-mono text-cyan-300 font-bold">
            {k}
        </span>
        <span className="text-xs text-muted-foreground font-semibold tracking-wider">{label}</span>
    </div>
);
