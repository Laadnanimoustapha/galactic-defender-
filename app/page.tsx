"use client"

import { useEffect, useRef, useState } from "react"
import { GameEngine } from "@/lib/game/GameEngine"
import { InputManager } from "@/lib/game/InputManager"
import { GameState } from "@/lib/game/types"
import { GameHUD } from "@/components/ui/GameHUD"
import { MainMenu } from "@/components/ui/MainMenu"

export default function GalacticDefender() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<GameEngine | null>(null)
  const inputRef = useRef<InputManager | null>(null)

  // Minimal React state needed for UI switching
  const [isPlaying, setIsPlaying] = useState(false)
  const [engineState, setEngineState] = useState<GameState | null>(null)

  useEffect(() => {
    // 1. Setup Input
    const input = new InputManager();
    input.attach();
    inputRef.current = input;

    // 2. Setup Engine
    if (canvasRef.current) {
      const engine = new GameEngine(canvasRef.current, input);
      engineRef.current = engine;
    }

    // 3. Sync Engine State to React for UI (HUD)
    // In a real app we might use a subscription pattern or MobX/Zustand
    // For now, simple polling loop or callback in engine
    const syncInterval = setInterval(() => {
      if (engineRef.current) {
        setEngineState({ ...engineRef.current.state });

        // Sync Game Over state back to UI flow
        if (engineRef.current.state.isGameOver) {
          // handle game over UI trigger if needed
        }
      }
    }, 100); // 10fps UI update is enough

    return () => {
      input.detach();
      engineRef.current?.stop();
      clearInterval(syncInterval);
    }
  }, [])

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.start();
      setIsPlaying(true);
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#050810]">
      {/* Background Layer (CSS or Canvas, kept simple CSS for now as per plan/layers) */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#1a1f3a_0%,_#0f1729_50%,_#050810_100%)]" />

      {/* Stars Layer - simpler to just keep separate canvas or div stars if needed, 
          but for now GameEngine clears per frame. 
          Ideally Engine handles background or we have a separate background component. 
          Let's keep it simple: Engine draws everything for now, but background color is CSS. 
      */}

      {/* Main Game Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 block"
      />

      {/* UI Overlay Layer */}
      <div className="relative z-20">
        {!isPlaying && <MainMenu onStart={handleStartGame} />}

        {isPlaying && engineState && !engineState.isGameOver && (
          <GameHUD state={engineState} />
        )}

        {/* Simple Game Over Check */}
        {isPlaying && engineState?.isGameOver && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white">
            <h2 className="text-6xl font-black text-red-500 mb-4">CRITICAL FAILURE</h2>
            <p className="text-2xl mb-8">SCORE: {engineState.score}</p>
            <button
              onClick={handleStartGame}
              className="px-8 py-3 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform"
            >
              REBOOT SYSTEM
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
