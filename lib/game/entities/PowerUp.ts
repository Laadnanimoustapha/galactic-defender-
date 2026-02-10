import { Entity } from './Entity';
import { PowerUpType } from '../types';

const POWERUP_CONFIG: Record<PowerUpType, { color: string; glowColor: string; symbol: string }> = {
    health: { color: '#ff4444', glowColor: '#ff0000', symbol: '♥' },
    energy: { color: '#00e5ff', glowColor: '#00bcd4', symbol: '⚡' },
    score_bonus: { color: '#ffd700', glowColor: '#ffaa00', symbol: '★' },
};

export class PowerUp extends Entity {
    type: PowerUpType;
    speed: number = 1.5;
    private floatPhase: number = Math.random() * Math.PI * 2;
    private pulsePhase: number = 0;
    private config: typeof POWERUP_CONFIG.health;

    constructor(x: number, y: number, type: PowerUpType) {
        super(x, y, 20, 20);
        this.type = type;
        this.config = POWERUP_CONFIG[type];
    }

    spawn(x: number, y: number, type: PowerUpType) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.config = POWERUP_CONFIG[type];
        this.active = true;
        this.floatPhase = Math.random() * Math.PI * 2;
        this.pulsePhase = 0;
    }

    update(dt: number): void {
        const speedPerMs = (this.speed * 60) / 1000;
        this.y += speedPerMs * dt;
        this.floatPhase += 0.004 * dt;
        this.pulsePhase += 0.006 * dt;

        if (this.y > 2000) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const floatOffset = Math.sin(this.floatPhase) * 3;
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const drawY = cy + floatOffset;

        ctx.save();

        ctx.shadowColor = this.config.glowColor;
        ctx.shadowBlur = 15 * pulse;

        ctx.strokeStyle = this.config.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 * pulse;
        ctx.beginPath();
        ctx.arc(cx, drawY, 14, 0, Math.PI * 2);
        ctx.stroke();

        ctx.globalAlpha = 0.15 * pulse;
        ctx.fillStyle = this.config.color;
        ctx.beginPath();
        ctx.arc(cx, drawY, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.fillStyle = this.config.color;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.symbol, cx, drawY);

        ctx.restore();
    }
}
