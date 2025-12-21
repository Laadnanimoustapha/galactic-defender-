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
            // Homing logic 
            const desiredAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

            // Smooth steering really needs "current angle", but instant turn for now is fun
            this.vx = Math.cos(desiredAngle);
            this.vy = Math.sin(desiredAngle);

            this.x += this.vx * speedPerMs * dt;
            this.y += this.vy * speedPerMs * dt;
        } else {
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
            if (this.vx !== 0) {
                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                ctx.rotate(angle + Math.PI / 2);
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
                ctx.restore();
            } else {
                ctx.fillRect(this.x, this.y, this.width, this.height);
            }
        } else if (this.type === 'rocket' || this.type === 'smart_rocket') {
            // Detailed Missile Draw
            const cx = this.x + this.width / 2;
            const cy = this.y + this.height / 2;

            ctx.strokeStyle = this.type === 'smart_rocket' ? '#00ff00' : '#ffaa00';
            ctx.lineWidth = 1;
            ctx.fillStyle = '#ffffff';

            // Body
            ctx.beginPath();
            ctx.moveTo(cx, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height - 5);
            ctx.lineTo(cx, this.y + this.height);
            ctx.lineTo(this.x, this.y + this.height - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Thruster
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(cx, this.y + this.height, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}
