import { Entity } from './Entity';

export class Projectile extends Entity {
    speed: number;
    vx: number = 0;
    vy: number = 0;
    damage: number;
    color: string;
    type: 'bullet' | 'rocket' | 'smart_rocket' | 'laser';
    target?: Entity;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        speed: number,
        damage: number,
        color: string = "#ff4444",
        type: 'bullet' | 'rocket' | 'smart_rocket' | 'laser' = 'bullet'
    ) {
        super(x, y, width, height);
        this.speed = speed;
        this.damage = damage;
        this.color = color;
        this.type = type;
    }

    update(dt: number): void {
        const speedPerMs = (this.speed * 60) / 1000;

        if (this.type === 'smart_rocket' && this.target && this.target.active) {
            // Homing logic (Steering)
            const desiredAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

            // Just set velocity for now, simple homing
            this.vx = Math.cos(desiredAngle);
            this.vy = Math.sin(desiredAngle);

            this.x += this.vx * speedPerMs * dt;
            this.y += this.vy * speedPerMs * dt;

            // Correct rotation visual later
        } else {
            // Linear Movement
            // If vx/vy are set, use them. If 0, assume standard up (-y)
            if (this.vx === 0 && this.vy === 0) {
                this.y -= speedPerMs * dt;
            } else {
                this.x += this.vx * speedPerMs * dt;
                this.y += this.vy * speedPerMs * dt;
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;

        if (this.type === 'bullet') {
            const angle = Math.atan2(this.vy, this.vx);
            if (this.vx !== 0) { // Rotate check
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(angle + Math.PI / 2); // Adjust so UP is 0
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else if (this.type === 'rocket' || this.type === 'smart_rocket') {
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
            ctx.fillRect(this.x + 2, this.y + this.height, this.width - 4, 10);
        }
    }
}
