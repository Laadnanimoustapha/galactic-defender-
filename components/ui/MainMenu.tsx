import React from 'react';
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Rocket, Shield, Crosshair, Target, Trophy } from 'lucide-react'

interface MainMenuProps {
    onStart: () => void;
    highScore?: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, highScore = 0 }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-2xl border-cyan-500/50 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)]">
                <CardHeader className="text-center space-y-4 pb-2">
                    <CardTitle className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-pulse tracking-tighter">
                        GALACTIC<br />DEFENDER
                    </CardTitle>
                    <CardDescription className="text-xl text-cyan-200/60 font-mono tracking-widest uppercase">
                        Sector 7 Needs You
                    </CardDescription>
                    {highScore > 0 && (
                        <div className="flex items-center justify-center gap-2 text-yellow-400/80">
                            <Trophy className="w-4 h-4" />
                            <span className="text-sm font-mono font-bold tracking-wider">
                                HIGH SCORE: {highScore.toLocaleString()}
                            </span>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="flex flex-col items-center gap-8 py-8">
                    <p className="max-w-md text-center text-muted-foreground text-lg">
                        Defend against the endless void using advanced weaponry and reflex-based combat.
                        Survive waves of increasingly dangerous enemies!
                    </p>

                    <Button
                        onClick={onStart}
                        size="lg"
                        className="group relative h-16 px-12 text-xl font-bold tracking-[0.2em] hover:tracking-[0.3em] transition-all overflow-hidden bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-500/50 hover:border-cyan-400"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10 text-cyan-100 group-hover:text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                            ENGAGE SYSTEMS
                        </span>
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-col gap-6 pt-4 border-t border-cyan-900/30">
                    <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <ControlBadge k="WASD" label="MOVE" />
                        <ControlBadge k="SPACE" label="SHOOT" />
                        <ControlBadge k="R" label="ROCKET (20)" icon={<Rocket className="w-3 h-3" />} />
                        <ControlBadge k="T" label="HOMING (30)" icon={<Target className="w-3 h-3" />} />
                        <ControlBadge k="E" label="SHIELD (25)" icon={<Shield className="w-3 h-3" />} />
                    </div>
                    <p className="text-[10px] text-center text-white/20 font-mono tracking-wider">
                        ESC TO PAUSE • ENEMIES SHOOT BACK • COLLECT POWER-UPS
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

const ControlBadge = ({ k, label, icon }: { k: string, label: string, icon?: React.ReactNode }) => (
    <div className="flex flex-col items-center gap-2 group">
        <Badge variant="outline" className="px-3 py-1 font-mono text-lg border-cyan-800 bg-cyan-950/30 group-hover:border-cyan-500 transition-colors">
            {k}
        </Badge>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold tracking-wider uppercase group-hover:text-cyan-400 transition-colors">
            {icon}
            {label}
        </div>
    </div>
);
