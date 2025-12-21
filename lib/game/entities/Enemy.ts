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
        const centerX = this.x + this.width / 2;

        if (this.type === 'boss') {
            this.drawBoss(ctx);
        } else if (this.type === 'fast') {
            this.drawFast(ctx, centerX);
        } else if (this.type === 'tank') {
            this.drawTank(ctx);
        } else { // Basic
            this.drawBasic(ctx, centerX);
        }
    }

    private drawBoss(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
        ctx.fillStyle = "#ffff00";
        ctx.fillRect(this.x + 25, this.y + 25, this.width - 50, this.height - 50);
    }

    private drawFast(ctx: CanvasRenderingContext2D, centerX: number) {
        ctx.fillStyle = "#ffff00";
        ctx.beginPath();
        ctx.moveTo(centerX, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    private drawTank(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(this.x + 3, this.y + 5, this.width - 6, this.height - 10);
        ctx.fillStyle = "#004400";
        ctx.fillRect(this.x + this.width / 2 - 3, this.y + this.height - 8, 6, 8);
    }

    private drawBasic(ctx: CanvasRenderingContext2D, centerX: number) {
        ctx.fillStyle = "#ff8800";
        ctx.fillRect(this.x + 5, this.y + 3, this.width - 10, this.height - 6);
        ctx.fillStyle = "#0088ff";
        ctx.fillRect(this.x + 8, this.y, this.width - 16, 5);
    }
}
