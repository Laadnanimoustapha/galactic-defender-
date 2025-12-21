import { Entity } from './Entity';

export class Projectile extends Entity {
    speed: number;
    damage: number;
    color: string;
    // For specialized movement like Rockets
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
            // Homing logic
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            // Simple homing: just set velocity towards target.
            // In a real physics engine we would add force/steering behavior,
            // but for arcade feel, direct velocity setting is fine, maybe with some turn rate limit if needed.
            // Ensuring "turn rate" makes it feel more like a missile.
            // For now, let's just move DIRECTLY at it to match original behavior roughly

            this.x += Math.cos(angle) * speedPerMs * dt;
            this.y += Math.sin(angle) * speedPerMs * dt;
        } else {
            // Standard linear movement (UP usually for player bullets)
            this.y -= speedPerMs * dt;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;

        if (this.type === 'bullet') {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.type === 'rocket' || this.type === 'smart_rocket') {
            // Rocket shape
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width, 0, Math.PI * 2);
            ctx.fill();

            // Trail effect (simple)
            ctx.fillStyle = "rgba(255, 100, 0, 0.5)";
            ctx.fillRect(this.x + 2, this.y + this.height, this.width - 4, 10);
        }
    }
}
