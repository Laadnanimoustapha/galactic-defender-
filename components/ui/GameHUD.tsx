import React from 'react';
import { GameState } from '@/lib/game/types';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Heart, Crosshair, Skull, Timer, Rocket, Shield, Target } from 'lucide-react';
import { GameConfig } from '@/lib/game/config';

interface GameHUDProps {
    state: GameState;
}

function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function getCooldownPct(lastUsed: number, cooldownMs: number): number {
    const elapsed = Date.now() - lastUsed;
    return Math.min(100, (elapsed / cooldownMs) * 100);
}

export const GameHUD: React.FC<GameHUDProps> = ({ state }) => {
    const rocketCd = getCooldownPct(state.lastRocketTime, GameConfig.PLAYER.INITIAL_RATES.ROCKET);
    const homingCd = getCooldownPct(state.lastSpecialTime, 2000);
    const shieldCd = getCooldownPct(state.lastShieldTime, GameConfig.PLAYER.INITIAL_RATES.SHIELD);

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none p-4 md:p-6 font-sans">
            {/* Top Left: Score & Health */}
            <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2">
                <Card className="bg-black/70 backdrop-blur-md border border-cyan-500/30 px-4 py-3 rounded-xl shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                    <div className="flex items-center gap-3 text-white font-bold text-lg">
                        <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-xs">SCORE</Badge>
                        <span className="font-mono tracking-wider">{state.score.toLocaleString()}</span>
                    </div>
                </Card>

                {state.combo > 1 && (
                    <div className="text-yellow-400 font-black text-xl animate-pulse ml-2 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">
                        {state.combo}x COMBO
                    </div>
                )}

                <div className={`flex gap-2 mt-1 ${state.health === 1 ? 'animate-pulse' : ''}`}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                            key={i}
                            className={`w-7 h-7 transition-all duration-300 ${i < state.health
                                ? state.health === 1
                                    ? 'fill-red-500 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)] scale-110'
                                    : 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                : 'text-white/20'
                                }`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-1 text-white/50">
                    <Skull className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono">{state.totalKills}</span>
                    <Timer className="w-3.5 h-3.5 ml-2" />
                    <span className="text-xs font-mono">{formatTime(state.timeSurvived)}</span>
                </div>
            </div>

            {/* Top Center: Wave */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-6 flex flex-col items-center gap-1">
                <Badge variant="secondary" className="px-5 py-2 text-xl font-black tracking-widest uppercase bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors">
                    WAVE {state.wave}
                </Badge>
                <div className="w-28 mt-1">
                    <Progress value={(state.waveKills / state.waveKillsRequired) * 100} className="h-1.5 border border-white/10 bg-black/50" />
                </div>
                <span className="text-[10px] text-white/40 font-mono">{state.waveKills}/{state.waveKillsRequired} KILLS</span>
            </div>

            {/* Top Right: Energy + Cooldowns */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 mb-0.5">
                    <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    <span className="text-xs text-cyan-400 font-mono font-bold tracking-widest">ENERGY</span>
                </div>
                <div className="w-48 md:w-64">
                    <Progress value={state.energy} className="h-3 border border-cyan-500/30 bg-black/50" />
                </div>

                {/* Skill Cooldowns */}
                <div className="flex gap-3 mt-2">
                    <CooldownIndicator label="R" icon={<Rocket className="w-3 h-3" />} pct={rocketCd} color="text-orange-400" />
                    <CooldownIndicator label="T" icon={<Target className="w-3 h-3" />} pct={homingCd} color="text-green-400" />
                    <CooldownIndicator label="E" icon={<Shield className="w-3 h-3" />} pct={shieldCd} color="text-cyan-400" />
                </div>
            </div>

            {/* Boss Health Bar */}
            {state.bossActive && (
                <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 w-72 md:w-96 flex flex-col items-center gap-1">
                    <span className="text-xs text-red-400 font-mono font-bold tracking-widest uppercase">⚠ BOSS ⚠</span>
                    <div className="w-full h-3 bg-black/60 border border-red-500/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            style={{ width: `${(state.bossHealth / state.bossMaxHealth) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* High Score */}
            {state.highScore > 0 && (
                <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                    <span className="text-xs text-white/30 font-mono">HI: {state.highScore.toLocaleString()}</span>
                </div>
            )}
        </div>
    );
};

const CooldownIndicator = ({ label, icon, pct, color }: { label: string; icon: React.ReactNode; pct: number; color: string }) => {
    const ready = pct >= 100;
    return (
        <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${ready ? 'opacity-100 scale-110' : 'opacity-50 scale-100'}`}>
            <div className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono transition-all duration-300 ${ready
                ? `${color} border-current shadow-[0_0_12px_currentColor] animate-[skill-ready_0.6s_ease-out]`
                : 'text-white/30 border-white/20'
                }`}>
                <span>{label}</span>
                {!ready && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                            cx="18" cy="18" r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray={`${pct} 100`}
                            className={color}
                            opacity={0.6}
                        />
                    </svg>
                )}
            </div>
            <div className={`${ready ? color : 'text-white/20'}`}>{icon}</div>
        </div>
    );
};
