import { Entity } from './Entity';
import { GameConfig } from '../config';
import { EnemyType } from '../types';

export class Enemy extends Entity {
    type: EnemyType;
    health: number;
    maxHealth: number;
    speed: number;
    points: number;
    shootTimer: number = 0;
    shootInterval: number;
    private canShoot: boolean;

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
        const speedPerMs = (this.speed * 60) / 1000;
        this.y += speedPerMs * dt;

        if (this.canShoot) {
            this.shootTimer += 1;
        }
    }

    shouldShoot(): boolean {
        if (!this.canShoot) return false;
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
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        if (this.type === 'boss') {
            this.drawBoss(ctx, cx, cy);
        } else if (this.type === 'fast') {
            this.drawFast(ctx, cx, cy);
        } else if (this.type === 'tank') {
            this.drawTank(ctx, cx, cy);
        } else {
            this.drawBasic(ctx, cx, cy);
        }

        if (this.health < this.maxHealth && this.maxHealth > 2) {
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

    private drawBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 20;
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

        ctx.fillStyle = "#ffaaaa";
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();

        const pulse = Math.sin(Date.now() * 0.005) * 5 + 10;
        ctx.strokeStyle = "rgba(255, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 20 + pulse, 0, Math.PI * 2);
        ctx.stroke();
    }

    private drawFast(ctx: CanvasRenderingContext2D, cx: number, _cy: number) {
        ctx.shadowColor = "#FFFF00";
        ctx.shadowBlur = 10;
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
    }

    private drawTank(ctx: CanvasRenderingContext2D, cx: number, _cy: number) {
        ctx.shadowColor = "#00ff00";
        ctx.shadowBlur = 10;
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

        ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
    }

    private drawBasic(ctx: CanvasRenderingContext2D, cx: number, _cy: number) {
        ctx.shadowColor = "#ff8800";
        ctx.shadowBlur = 10;
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

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 2, this.y + 5, 4, 4);
    }
}
