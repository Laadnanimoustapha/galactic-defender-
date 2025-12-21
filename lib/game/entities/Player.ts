import { Entity } from './Entity';
import { GameConfig } from '../config';
import { InputManager } from '../InputManager';

export class Player extends Entity {
    speed: number;

    constructor(canvasWidth: number, canvasHeight: number) {
        const { WIDTH, HEIGHT, SPEED } = GameConfig.PLAYER;
        super(
            canvasWidth / 2 - WIDTH / 2,
            canvasHeight - HEIGHT - 50,
            WIDTH,
            HEIGHT
        );
        this.speed = SPEED;
    }

    update(dt: number, input?: InputManager, canvasWidth?: number, canvasHeight?: number): void {
        if (!input || !canvasWidth || !canvasHeight) return;

        // GameConfig.PLAYER.SPEED is 5 (pixels per frame at 60fps).
        const speedPerMs = (this.speed * 60) / 1000;
        const moveAmount = speedPerMs * dt;

        if (input.isPressed('LEFT')) {
            this.x = Math.max(0, this.x - moveAmount);
        }
        if (input.isPressed('RIGHT')) {
            this.x = Math.min(canvasWidth - this.width, this.x + moveAmount);
        }
        if (input.isPressed('UP')) {
            this.y = Math.max(0, this.y - moveAmount);
        }
        if (input.isPressed('DOWN')) {
            this.y = Math.min(canvasHeight - this.height, this.y + moveAmount);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const cx = this.x + this.width / 2;
        // const cy = this.y + this.height / 2;

        // 1. Engine Trails (Dynamic)
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ffaa00";
        ctx.fillStyle = `rgba(255, 170, 0, ${Math.random() * 0.5 + 0.5})`;
        ctx.beginPath();
        ctx.moveTo(cx - 8, this.y + this.height - 5);
        ctx.lineTo(cx + 8, this.y + this.height - 5);
        ctx.lineTo(cx, this.y + this.height + (Math.random() * 20 + 10)); // Variable flame length
        ctx.fill();

        // 2. Main Ship Body (Sleek Fighter)
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00ffff";
        ctx.fillStyle = "#02040a"; // Dark hull filling
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Nose
        ctx.moveTo(cx, this.y);
        // Right Wing
        ctx.lineTo(this.x + this.width, this.y + this.height);
        // Right Engine Cutout
        ctx.lineTo(cx + 10, this.y + this.height - 10);
        // Center Engine Output
        ctx.lineTo(cx, this.y + this.height - 5);
        // Left Engine Cutout
        ctx.lineTo(cx - 10, this.y + this.height - 10);
        // Left Wing
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();

        ctx.fill();
        ctx.stroke();

        // 3. Cockpit / Core
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(cx, this.y + 15);
        ctx.lineTo(cx + 3, this.y + 25);
        ctx.lineTo(cx - 3, this.y + 25);
        ctx.fill();

        // 4. Wing Details (Accents)
        ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(cx + 15, this.y + 35);
        ctx.lineTo(cx + 15, this.y + 15); // Wing guns
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - 15, this.y + 35);
        ctx.lineTo(cx - 15, this.y + 15);
        ctx.stroke();
    }
}
