import { Entity } from './Entity';
import { GameConfig } from '../config';
import { EnemyType } from '../types';
import { getEnemyImage, ENEMY_GLOW_COLORS } from '../assets/enemies';

export class Enemy extends Entity {
    type: EnemyType;
    health: number;
    maxHealth: number;
    speed: number;
    points: number;
    shootTimer: number = 0;
    shootInterval: number;
    private canShoot: boolean;

    // Death animation state
    deathTimer: number = 0;
    isDying: boolean = false;
    private deathDuration: number = 200;

    constructor(x: number, type: EnemyType = 'basic') {
        const config = type === 'boss' ? GameConfig.ENEMY.BOSS :
            type === 'tank' ? GameConfig.ENEMY.TANK :
                type === 'fast' ? GameConfig.ENEMY.FAST :
                    GameConfig.ENEMY.BASIC;

        super(x, -config.HEIGHT, config.WIDTH, config.HEIGHT);

        this.type = type;
        this.health = config.HEALTH;
        this.maxHealth = config.HEALTH;
        this.points = config.POINTS;
        this.canShoot = type === 'boss' || type === 'tank' || (type === 'basic' && Math.random() > 0.6);

        if (type === 'boss') {
            const bossConfig = GameConfig.ENEMY.BOSS;
            this.speed = bossConfig.SPEED;
            this.shootInterval = 40;
        } else if (type === 'tank') {
            this.speed = Math.random() * (1.5 - 0.5) + 0.5;
            this.shootInterval = 80;
        } else if (type === 'fast') {
            this.speed = Math.random() * (5 - 3) + 3;
            this.shootInterval = 0;
            this.canShoot = false;
        } else {
            const normalConfig = config as { SPEED_MIN: number; SPEED_MAX: number };
            this.speed = Math.random() * (normalConfig.SPEED_MAX - normalConfig.SPEED_MIN) + normalConfig.SPEED_MIN;
            this.shootInterval = 100 + Math.random() * 60;
        }
    }

    update(dt: number): void {
        if (this.isDying) {
            this.deathTimer += dt;
            if (this.deathTimer >= this.deathDuration) {
                this.active = false;
                this.isDying = false;
            }
            return;
        }

        const speedPerMs = (this.speed * 60) / 1000;
        this.y += speedPerMs * dt;

        if (this.canShoot) {
            this.shootTimer += 1;
        }
    }

    startDeathAnimation() {
        this.isDying = true;
        this.deathTimer = 0;
    }

    shouldShoot(): boolean {
        if (!this.canShoot || this.isDying) return false;
        if (this.shootTimer >= this.shootInterval && this.y > 20) {
            this.shootTimer = 0;
            return true;
        }
        return false;
    }

    getShootData(playerX: number, playerY: number): { x: number; y: number; vx: number; vy: number } {
        const cx = this.x + this.width / 2;
        const bottom = this.y + this.height;

        if (this.type === 'boss') {
            return { x: cx, y: bottom, vx: 0, vy: 1 };
        }

        const dx = playerX - cx;
        const dy = playerY - bottom;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return { x: cx, y: bottom, vx: 0, vy: 1 };

        return {
            x: cx,
            y: bottom,
            vx: dx / dist,
            vy: dy / dist,
        };
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const glowColor = ENEMY_GLOW_COLORS[this.type];
        const img = getEnemyImage(this.type);

        ctx.save();

        // Death animation: scale up + fade out
        if (this.isDying) {
            const progress = this.deathTimer / this.deathDuration;
            const scale = 1 + progress * 0.8;
            const alpha = 1 - progress;

            ctx.globalAlpha = alpha;
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
        }

        // Glow halo
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = this.type === 'boss' ? 25 : 12;

        if (img) {
            // SVG-based rendering
            ctx.drawImage(img, this.x, this.y, this.width, this.height);

            // Boss pulsing aura
            if (this.type === 'boss' && !this.isDying) {
                const pulse = Math.sin(Date.now() * 0.005) * 5 + 10;
                ctx.strokeStyle = `rgba(255, 0, 68, 0.3)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 2 + pulse, 0, Math.PI * 2
                );
                ctx.stroke();
            }
        } else {
            // Fallback: geometric shapes (original drawing)
            this.drawFallback(ctx);
        }

        ctx.restore();

        // Health bar (outside save/restore for death animation)
        if (!this.isDying && this.health < this.maxHealth && this.maxHealth > 2) {
            this.drawHealthBar(ctx);
        }
    }

    private drawHealthBar(ctx: CanvasRenderingContext2D) {
        const barWidth = this.width;
        const barHeight = 3;
        const barX = this.x;
        const barY = this.y - 6;
        const pct = this.health / this.maxHealth;

        ctx.fillStyle = 'rgba(255,0,0,0.6)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = pct > 0.5 ? '#00ff00' : pct > 0.25 ? '#ffaa00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * pct, barHeight);
    }

    private drawFallback(ctx: CanvasRenderingContext2D) {
        const cx = this.x + this.width / 2;

        if (this.type === 'boss') {
            ctx.fillStyle = "#200505";
            ctx.strokeStyle = "#ff0000";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, this.y);
            ctx.lineTo(this.x + this.width, this.y + 30);
            ctx.lineTo(this.x + this.width - 20, this.y + this.height);
            ctx.lineTo(this.x + 20, this.y + this.height);
            ctx.lineTo(this.x, this.y + 30);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'fast') {
            ctx.strokeStyle = "#FFFF00";
            ctx.lineWidth = 2;
            ctx.fillStyle = "#1a1a00";
            ctx.beginPath();
            ctx.moveTo(cx, this.y + this.height);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(cx, this.y + 10);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else if (this.type === 'tank') {
            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;
            ctx.fillStyle = "#001a00";
            ctx.beginPath();
            ctx.moveTo(cx, this.y);
            ctx.lineTo(this.x + this.width, this.y + 10);
            ctx.lineTo(this.x + this.width, this.y + this.height - 10);
            ctx.lineTo(cx, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height - 10);
            ctx.lineTo(this.x, this.y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.strokeStyle = "#ff8800";
            ctx.fillStyle = "#1a0a00";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y);
            ctx.lineTo(cx, this.y + this.height);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}
