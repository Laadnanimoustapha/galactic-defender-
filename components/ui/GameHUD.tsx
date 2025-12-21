import React from 'react';
import { GameState } from '@/lib/game/types';

interface GameHUDProps {
    state: GameState;
}

export const GameHUD: React.FC<GameHUDProps> = ({ state }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none p-6 font-sans">
            {/* Top Left: Score & Health */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
                <div className="bg-background/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 text-foreground font-bold text-xl">
                        <span className="text-accent">SCORE</span>
                        <span>{state.score.toLocaleString()}</span>
                    </div>
                    {state.combo > 1 && (
                        <div className="text-yellow-400 font-black text-2xl animate-pulse mt-1">
                            {state.combo}x COMBO
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-8 h-8 rounded-full border-2 border-white/20 transition-all ${i < state.health ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-transparent opacity-30'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Top Center: Wave/Level */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <div className="bg-background/80 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-2xl font-black text-white tracking-widest uppercase">
                    WAVE {state.wave}
                </div>
            </div>

            {/* Top Right: Energy Bar */}
            <div className="absolute top-6 right-6">
                <div className="w-64 h-6 bg-black/50 rounded-full overflow-hidden border border-white/20">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${state.energy}%` }}
                    />
                </div>
                <div className="text-right text-xs mt-1 text-cyan-400 font-mono">ENERGY SYSTEM</div>
            </div>

            {/* Bottom Center: Controls Hint */}
            {state.isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <div className="text-4xl font-black text-white tracking-wider animate-pulse">
                        PAUSED
                    </div>
                </div>
            )}
        </div>
    );
};
