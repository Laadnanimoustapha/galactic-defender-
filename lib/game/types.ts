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
}

export type InputKey = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'SHOOT' | 'SKILL_1' | 'SKILL_2' | 'SKILL_3' | 'PAUSE';
