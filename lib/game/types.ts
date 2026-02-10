export interface Vector2D {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Entity extends Vector2D, Size {
    id: string;
    active: boolean;
    update(dt: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

export type EnemyType = 'basic' | 'fast' | 'tank' | 'boss';

export type PowerUpType = 'health' | 'energy' | 'score_bonus';

export interface GameState {
    score: number;
    health: number;
    energy: number;
    level: number;
    wave: number;
    combo: number;
    maxCombo: number;
    isGameOver: boolean;
    isPaused: boolean;
    highScore: number;
    totalKills: number;
    waveKills: number;
    waveKillsRequired: number;
    waveCountdown: number;
    isWaveTransition: boolean;
    timeSurvived: number;
    bossHealth: number;
    bossMaxHealth: number;
    bossActive: boolean;
    lastShotTime: number;
    lastRocketTime: number;
    lastShieldTime: number;
    lastSpecialTime: number;
}

export type InputKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SHOOT' | 'SKILL_1' | 'SKILL_2' | 'SKILL_3' | 'PAUSE';
