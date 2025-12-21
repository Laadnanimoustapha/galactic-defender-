import { GameConfig } from './config';
import { InputManager } from './InputManager';
import { GameState } from './types';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Particle } from './entities/Particle';
import { ObjectPool } from './utils/ObjectPool';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private input: InputManager;
    private lastTime: number = 0;
    private animationId: number = 0;

    // Game Entities
    player: Player | null = null;
    enemies: Enemy[] = [];
    projectilePool: ObjectPool<Projectile>;
    particlePool: ObjectPool<Particle>;

    // State
    state: GameState = {
        score: 0,
        health: 3,
        energy: 100,
        level: 1,
        wave: 1,
        combo: 0,
        maxCombo: 0,
        isGameOver: false,
        isPaused: false,
    };

    // Powerup Flags
    private isShieldActive: boolean = false;
    private isMagicActive: boolean = false;
    private lastShotTime: number = 0;
    private lastRocketTime: number = 0;
    private lastShieldTime: number = 0;

    constructor(canvas: HTMLCanvasElement, input: InputManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = input;

        this.projectilePool = new ObjectPool<Projectile>(
            () => new Projectile(0, 0, 0, 0, 0, 0),
            (p) => { p.active = true; }
        );

        this.particlePool = new ObjectPool<Particle>(
            () => new Particle(0, 0),
            (p) => { p.active = true; }
        );

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        window.addEventListener('resize', this.resize);
        this.resize();
    }

    init() {
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.enemies = [];
        this.projectilePool.clear();
        this.particlePool.clear();

        this.state = {
            score: 0,
            health: 3,
            energy: 100,
            level: 1,
            wave: 1,
            combo: 0,
            maxCombo: 0,
            isGameOver: false,
            isPaused: false,
        }
    }

    start() {
        this.init();
        this.lastTime = performance.now();
        this.loop(this.lastTime);
    }

    stop() {
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('resize', this.resize);
    }

    private loop(timestamp: number) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (!this.state.isPaused && !this.state.isGameOver) {
            this.update(dt);
        }

        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    private update(dt: number) {
        if (!this.player) return;

        this.player.update(dt, this.input, this.canvas.width, this.canvas.height);

        // Regenerate Energy
        this.state.energy = Math.min(100, this.state.energy + 0.05 * (dt / 16));

        // Shooting (Basic)
        if (this.input.isPressed('SHOOT')) {
            const now = Date.now();
            if (now - this.lastShotTime > GameConfig.PLAYER.INITIAL_RATES.SHOOT) {
                this.spawnBullet(this.player.x + this.player.width / 2 - 2, this.player.y);
                this.lastShotTime = now;
            }
        }

        // ROCKET (R)
        if (this.input.isPressed('SKILL_1')) {
            const now = Date.now();
            if (now - this.lastRocketTime > GameConfig.PLAYER.INITIAL_RATES.ROCKET && this.state.energy >= 20) {
                this.state.energy -= 20;
                this.lastRocketTime = now;
                const p = this.projectilePool.get();
                p.x = this.player.x + this.player.width / 2 - 6;
                p.y = this.player.y;
                p.width = 12;
                p.height = 20;
                p.speed = 6;
                p.damage = 10;
                p.color = '#ffaa00';
                p.type = 'rocket';
            }
        }

        // SHIELD (Q / E inferred as Skill 3)
        if (this.input.isPressed('SKILL_3')) {
            const now = Date.now();
            if (now - this.lastShieldTime > GameConfig.PLAYER.INITIAL_RATES.SHIELD && this.state.energy >= 25) {
                this.state.energy -= 25;
                this.lastShieldTime = now;
                this.isShieldActive = true;
                setTimeout(() => this.isShieldActive = false, 5000);
            }
        }

        // Update Projectiles
        this.projectilePool.getActive().forEach(p => p.update(dt));
        const activeProjectiles = [...this.projectilePool.getActive()];
        activeProjectiles.forEach(p => {
            if (p.y < -50 || p.y > this.canvas.height + 50 || !p.active) {
                p.active = false;
                this.projectilePool.release(p);
            }
        });

        // Spawn Enemies
        // Increasing difficulty
        if (Math.random() < 0.01 + (this.state.score / 50000)) {
            const type = Math.random() > 0.9 ? 'tank' : Math.random() > 0.7 ? 'fast' : 'basic';
            this.enemies.push(new Enemy(Math.random() * (this.canvas.width - 30), type as any));
        }

        // Update Enemies
        this.enemies.forEach(e => e.update(dt));
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height && e.active);

        // Update Particles
        this.particlePool.getActive().forEach(p => p.update(dt));
        const activeParticles = [...this.particlePool.getActive()];
        activeParticles.forEach(p => {
            if (!p.active) this.particlePool.release(p);
        });

        this.checkCollisions();
    }

    private spawnBullet(x: number, y: number) {
        const p = this.projectilePool.get();
        p.x = x;
        p.y = y;
        p.width = 4;
        p.height = 10;
        p.speed = 8;
        p.damage = 1;
        p.color = '#ff4444';
        p.type = 'bullet';
    }

    private checkCollisions() {
        // Bullets vs Enemies
        const activeProjectiles = this.projectilePool.getActive();
        for (const bullet of activeProjectiles) {
            if (!bullet.active) continue;

            for (const enemy of this.enemies) {
                if (bullet.intersects(enemy)) {
                    enemy.health -= bullet.damage;
                    bullet.active = false;

                    this.spawnExplosion(bullet.x, bullet.y, "#ffaa00", 3);

                    if (enemy.health <= 0) {
                        enemy.active = false;
                        this.state.score += enemy.points;
                        this.state.combo += 1; // Basic combo
                        this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, "#ff0000", 15);
                    }
                }
            }
        }

        // Enemy vs Player
        if (this.player && !this.isShieldActive) {
            for (const enemy of this.enemies) {
                if (enemy.intersects(this.player)) {
                    this.state.health -= 1;
                    this.state.combo = 0;
                    enemy.active = false;
                    this.spawnExplosion(enemy.x, enemy.y, "#ffffff", 20);

                    if (this.state.health <= 0) {
                        this.state.isGameOver = true;
                    }
                }
            }
        }
    }

    private spawnExplosion(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            const p = this.particlePool.get();
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            p.spawn(x, y, vx, vy, color, Math.random() * 3 + 1, 0.05);
        }
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Neon Glow Effect
        this.ctx.shadowBlur = 10;

        // Draw Shield
        if (this.player && this.isShieldActive) {
            this.ctx.shadowColor = "#00ffff";
            this.ctx.strokeStyle = "#00ffff";
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width, 0, Math.PI * 2
            );
            this.ctx.stroke();
        }

        this.player?.draw(this.ctx);

        this.projectilePool.getActive().forEach(p => {
            this.ctx.shadowColor = p.color;
            p.draw(this.ctx);
        });

        this.enemies.forEach(e => {
            this.ctx.shadowColor = "#ff0000";
            e.draw(this.ctx);
        });

        this.particlePool.getActive().forEach(p => {
            this.ctx.shadowColor = p.color;
            p.draw(this.ctx);
        });

        this.ctx.shadowBlur = 0;
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
