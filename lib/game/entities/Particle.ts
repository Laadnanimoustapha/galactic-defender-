import { Entity } from './Entity';

export class Particle extends Entity {
    vx: number = 0;
    vy: number = 0;
    life: number = 1.0; // 1.0 = 100%
    decay: number = 0.02;
    color: string = "#ffffff";
    size: number = 2;

    constructor(x: number, y: number) {
        super(x, y, 0, 0); // Size handled dynamically
    }

    // Initialize reusing the object
    spawn(x: number, y: number, vx: number, vy: number, color: string, size: number, decay: number) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.decay = decay;
        this.life = 1.0;
        this.active = true;
    }

    update(dt: number) {
        // Particles usually move in "frames" logic in simple engines, 
        // but let's try to stick to dt.
        // normalize: vx is pixels/frame @ 60fps
        const speedScale = (60 / 1000) * dt;

        this.x += this.vx * speedScale;
        this.y += this.vy * speedScale;

        // Drag/Friction
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.life -= this.decay * speedScale;
        if (this.life <= 0) {
            this.active = false;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}
