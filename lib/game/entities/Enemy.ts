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

        if (type === 'boss') {
            const bossConfig = GameConfig.ENEMY.BOSS;
            this.speed = bossConfig.SPEED;
            this.shootInterval = 60;
        } else {
            const normalConfig = config as { SPEED_MIN: number, SPEED_MAX: number };
            const min = normalConfig.SPEED_MIN;
            const max = normalConfig.SPEED_MAX;
            this.speed = Math.random() * (max - min) + min;
            this.shootInterval = 120;
        }
    }

    update(dt: number): void {
        const speedPerMs = (this.speed * 60) / 1000;
        this.y += speedPerMs * dt;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;

        // Procedural Drawing
        if (this.type === 'boss') {
            this.drawBoss(ctx, cx, cy);
        } else if (this.type === 'fast') {
            this.drawFast(ctx, cx, cy);
        } else if (this.type === 'tank') {
            this.drawTank(ctx, cx, cy);
        } else { // Basic
            this.drawBasic(ctx, cx, cy);
        }
    }

    private drawBoss(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        ctx.shadowColor = "#ff0000";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#200505";
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;

        // Mothership Shape
        ctx.beginPath();
        ctx.moveTo(cx, this.y);
        ctx.lineTo(this.x + this.width, this.y + 30);
        ctx.lineTo(this.x + this.width - 20, this.y + this.height);
        ctx.lineTo(this.x + 20, this.y + this.height);
        ctx.lineTo(this.x, this.y + 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Core
        ctx.fillStyle = "#ffaaaa";
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    private drawFast(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        // Dart / Arrowhead Shape
        ctx.shadowColor = "#FFFF00";
        ctx.shadowBlur = 10;
        ctx.strokeStyle = "#FFFF00";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#1a1a00";

        ctx.beginPath();
        ctx.moveTo(cx, this.y + this.height);
        ctx.lineTo(this.x, this.y); // Top Left
        ctx.lineTo(cx, this.y + 10); // Center Notch
        ctx.lineTo(this.x + this.width, this.y); // Top Right
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    private drawTank(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        // Hexagon Fortress
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

        // Armor plating
        ctx.strokeRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
    }

    private drawBasic(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
        // Standard Drone (Inverted Triangle)
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

        // Eye
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 2, this.y + 5, 4, 4);
    }
}
