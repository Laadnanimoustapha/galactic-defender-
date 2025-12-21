import { GameConfig } from './config';
import { InputManager } from './InputManager';
import { GameState } from './types';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
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

    constructor(canvas: HTMLCanvasElement, input: InputManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = input;

        // Initialize Pool
        this.projectilePool = new ObjectPool<Projectile>(
            () => new Projectile(0, 0, 0, 0, 0, 0),
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

        // Shooting
        if (this.input.isPressed('SHOOT')) {
            const now = Date.now();
            if (now % 200 < 20) {
                const p = this.projectilePool.get();
                p.x = this.player.x + this.player.width / 2 - 2;
                p.y = this.player.y;
                p.width = 4;
                p.height = 10;
                p.speed = 8;
                p.damage = 1;
                p.color = '#ff4444';
                p.type = 'bullet';
            }
        }

        // Update Projectiles
        this.projectilePool.getActive().forEach(p => p.update(dt));

        // GC Projectiles
        // Note: .forEach() on the active array is safe if we don't mutate length during iteration, 
        // but release() mutates. So we filter or copy.
        const activeProjectiles = [...this.projectilePool.getActive()];
        activeProjectiles.forEach(p => {
            if (p.y < -50 || p.y > this.canvas.height + 50 || !p.active) {
                p.active = false;
                this.projectilePool.release(p);
            }
        });

        // Spawning Enemies
        if (Math.random() < 0.01) {
            this.enemies.push(new Enemy(Math.random() * (this.canvas.width - 30)));
        }

        this.enemies.forEach(e => e.update(dt));
        this.enemies = this.enemies.filter(e => e.y < this.canvas.height && e.active);

        this.checkCollisions();
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

                    if (enemy.health <= 0) {
                        enemy.active = false;
                        this.state.score += enemy.points;
                    }
                }
            }
        }

        // Enemy vs Player
        if (this.player) {
            for (const enemy of this.enemies) {
                if (enemy.intersects(this.player)) {
                    this.state.health -= 1;
                    enemy.active = false;
                }
            }
        }
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.player?.draw(this.ctx);
        this.projectilePool.getActive().forEach(p => p.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}
