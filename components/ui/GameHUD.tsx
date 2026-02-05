import React from 'react';
import { GameState } from '@/lib/game/types';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Heart, Crosshair } from 'lucide-react';

interface GameHUDProps {
    state: GameState;
}

export const GameHUD: React.FC<GameHUDProps> = ({ state }) => {
    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none p-6 font-sans">
            {/* Top Left: Score & Health */}
            <div className="absolute top-6 left-6 flex flex-col gap-3">
                <Card className="bg-black/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                    <div className="flex items-center gap-3 text-white font-bold text-xl">
                        <Badge variant="outline" className="border-cyan-500 text-cyan-400">SCORE</Badge>
                        <span className="font-mono tracking-wider">{state.score.toLocaleString()}</span>
                    </div>
                </Card>

                {state.combo > 1 && (
                    <div className="text-yellow-400 font-black text-2xl animate-pulse ml-2 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                        {state.combo}x COMBO
                    </div>
                )}

                <div className="flex gap-2 mt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-8 h-8 transition-all duration-300 ${i < state.health
                                    ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                    : 'text-white/20'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Top Center: Wave/Level */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <Badge variant="secondary" className="px-6 py-2 text-2xl font-black tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                    WAVE {state.wave}
                </Badge>
            </div>

            {/* Top Right: Energy Bar */}
            <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    <span className="text-xs text-cyan-400 font-mono font-bold tracking-widest">ENERGY SYSTEM</span>
                </div>
                <div className="w-64">
                    <Progress value={state.energy} className="h-4 border border-cyan-500/30 bg-black/50" />
                </div>
            </div>

            {/* Bottom Center: Controls Hint */}
            {state.isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <div className="text-4xl font-black text-white tracking-wider animate-pulse flex flex-col items-center gap-4">
                        <span>PAUSED</span>
                        <div className="flex gap-4 text-sm font-normal text-muted-foreground">
                            <Badge variant="outline">ESC</Badge>
                            <span>TO RESUME</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
