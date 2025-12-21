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

        // Movement with Delta Time (speed * dt * 60 to normalize to 60fps baseline scale if needed, 
        // but usually speed is pixels/frame. To use dt (ms), speed should be pixels/ms)
        // GameConfig.PLAYER.SPEED is 5 (pixels per frame at 60fps).
        // 5 * 60 = 300 pixels per second.
        // distance = speedMin * dt.
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
        // Placeholder drawing (Triangle ship)
        // In future this will use ResourceManager to draw a Sprite
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.moveTo(centerX, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();

        // Engine flame
        ctx.fillStyle = "#ffaa00";
        ctx.beginPath();
        ctx.moveTo(centerX - 5, this.y + this.height);
        ctx.lineTo(centerX + 5, this.y + this.height);
        ctx.lineTo(centerX, this.y + this.height + (Math.random() * 10 + 5)); // Flickering effect
        ctx.closePath();
        ctx.fill();
    }
}
