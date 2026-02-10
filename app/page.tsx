"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameEngine } from "@/lib/game/GameEngine"
import { InputManager } from "@/lib/game/InputManager"
import { GameState } from "@/lib/game/types"
import { GameHUD } from "@/components/ui/GameHUD"
import { MainMenu } from "@/components/ui/MainMenu"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Skull, Timer, Zap, Swords } from "lucide-react"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function GalacticDefender() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const inputRef = useRef<InputManager | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [engineState, setEngineState] = useState<GameState | null>(null)
  const [waveAnnouncement, setWaveAnnouncement] = useState<number | null>(null)
  const lastAnnouncedWave = useRef<number>(1)

  useEffect(() => {
    const input = new InputManager();
    input.attach();
    inputRef.current = input;

    if (canvasRef.current) {
      const engine = new GameEngine(canvasRef.current, input);
      engineRef.current = engine;
    }

    const syncInterval = setInterval(() => {
      if (engineRef.current) {
        const newState = { ...engineRef.current.state };
        setEngineState(newState);

        if (newState.wave > lastAnnouncedWave.current && !newState.isGameOver) {
          lastAnnouncedWave.current = newState.wave;
          setWaveAnnouncement(newState.wave);
          setTimeout(() => setWaveAnnouncement(null), 2500);
        }
      }
    }, 100);

    return () => {
      input.detach();
      engineRef.current?.stop();
      clearInterval(syncInterval);
    }
  }, [])

  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setIsPlaying(true);
      lastAnnouncedWave.current = 1;
      setWaveAnnouncement(null);
    }
  }, [])

  const handleResume = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  }, [])

  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame])

  const handleQuit = useCallback(() => {
    setIsPlaying(false);
    if (engineRef.current) {
      engineRef.current.stop();
    }
  }, [])

  const isNewHighScore = engineState?.isGameOver && engineState.score === engineState.highScore && engineState.score > 0;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050810]">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#1a1f3a_0%,_#0f1729_50%,_#050810_100%)]" />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block"
      />

      <div className="relative z-20">
        {!isPlaying && (
          <MainMenu
            onStart={handleStartGame}
            highScore={engineState?.highScore}
          />
        )}

        {isPlaying && engineState && !engineState.isGameOver && !engineState.isPaused && (
          <GameHUD state={engineState} />
        )}

        {/* Wave Announcement */}
        {waveAnnouncement && isPlaying && !engineState?.isGameOver && (
          <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
              <div className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]"
                style={{ animation: 'pulse 1s ease-in-out infinite' }}>
                WAVE {waveAnnouncement}
              </div>
              <div className="text-lg md:text-2xl text-cyan-300/70 font-mono tracking-[0.4em] uppercase">
                Incoming
              </div>
            </div>
          </div>
        )}

        {/* Pause Menu */}
        {isPlaying && engineState?.isPaused && !engineState?.isGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <Card className="max-w-sm w-full bg-black/80 border-cyan-500/40 shadow-[0_0_40px_-12px_rgba(6,182,212,0.4)]">
              <CardHeader className="text-center">
                <CardTitle className="text-5xl font-black text-cyan-400 tracking-wider drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                  PAUSED
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={handleResume}
                  className="w-full h-12 text-lg font-bold bg-cyan-950/50 border border-cyan-500/50 text-cyan-100 hover:bg-cyan-900/60 hover:border-cyan-400 transition-all"
                >
                  RESUME
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full h-12 text-lg font-bold border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  RESTART
                </Button>
                <Button
                  onClick={handleQuit}
                  variant="ghost"
                  className="w-full h-10 text-sm text-white/40 hover:text-red-400 hover:bg-red-950/20 transition-all"
                >
                  QUIT TO MENU
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Game Over */}
        {isPlaying && engineState?.isGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <Card className={`max-w-md w-full bg-black/80 border-red-500/50 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)] ${isNewHighScore ? 'border-yellow-500/60 shadow-[0_0_60px_-12px_rgba(234,179,8,0.5)]' : ''}`}>
              <CardHeader className="text-center pb-2">
                <CardTitle className={`text-5xl md:text-6xl font-black drop-shadow-lg ${isNewHighScore
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500'
                  : 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                  }`}>
                  {isNewHighScore ? '★ NEW RECORD ★' : 'CRITICAL FAILURE'}
                </CardTitle>
                <CardDescription className="text-3xl text-white/90 font-mono mt-3 font-bold">
                  {engineState.score.toLocaleString()}
                </CardDescription>
                {isNewHighScore && (
                  <div className="text-sm text-yellow-400/70 font-mono mt-1 animate-pulse">
                    NEW HIGH SCORE!
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <StatCard icon={<Swords className="w-4 h-4 text-orange-400" />} label="WAVE" value={engineState.wave.toString()} />
                  <StatCard icon={<Skull className="w-4 h-4 text-red-400" />} label="KILLS" value={engineState.totalKills.toString()} />
                  <StatCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="MAX COMBO" value={`${engineState.maxCombo}x`} />
                  <StatCard icon={<Timer className="w-4 h-4 text-cyan-400" />} label="TIME" value={formatTime(engineState.timeSurvived)} />
                </div>

                {engineState.highScore > 0 && !isNewHighScore && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-white/30">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono">BEST: {engineState.highScore.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-center gap-3 pt-4">
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="px-8 h-12 bg-white text-black font-bold text-lg rounded-full hover:scale-105 transition-transform hover:bg-white/90"
                >
                  PLAY AGAIN
                </Button>
                <Button
                  onClick={handleQuit}
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 border-white/20 text-white/60 hover:text-white hover:bg-white/10 rounded-full"
                >
                  MENU
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3 border border-white/5">
      {icon}
      <div className="flex flex-col">
        <span className="text-[10px] text-white/40 font-mono tracking-wider">{label}</span>
        <span className="text-lg font-bold text-white font-mono">{value}</span>
      </div>
    </div>
  );
}
