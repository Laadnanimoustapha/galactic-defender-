import { GameConfig } from './config';
import { InputManager } from './InputManager';
import { GameState, PowerUpType } from './types';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Projectile } from './entities/Projectile';
import { Particle } from './entities/Particle';
import { PowerUp } from './entities/PowerUp';
import { Starfield } from './entities/Starfield';
import { ObjectPool } from './utils/ObjectPool';
import { soundManager } from './SoundManager';
import { initEnemySVGs } from './assets/enemies';
import { SpatialHash } from './utils/SpatialHash';

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private input: InputManager;
    private lastTime: number = 0;
    private animationId: number = 0;
    private gameStartTime: number = 0;

    player: Player | null = null;
    enemies: Enemy[] = [];
    projectilePool: ObjectPool<Projectile>;
    enemyProjectilePool: ObjectPool<Projectile>;
    particlePool: ObjectPool<Particle>;
    powerUpPool: ObjectPool<PowerUp>;
    starfield: Starfield;

    private shakeIntensity: number = 0;
    private shakeDuration: number = 0;
    private spatialHash: SpatialHash<{ x: number; y: number; width: number; height: number; _ref?: any }> = new SpatialHash(100);

    state: GameState = this.createInitialState();

    private isShieldActive: boolean = false;
    private lastShotTime: number = 0;
    private lastRocketTime: number = 0;
    private lastShieldTime: number = 0;
    private lastSpecialTime: number = 0;
    private waveTransitionTimer: number = 0;
    private comboTimer: number = 0;
    private lastPauseToggle: number = 0;

    constructor(canvas: HTMLCanvasElement, input: InputManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.input = input;

        this.projectilePool = new ObjectPool<Projectile>(
            () => new Projectile(0, 0, 0, 0, 0, 0),
            (p) => { p.active = true; p.vx = 0; p.vy = 0; p.target = undefined; }
        );

        this.enemyProjectilePool = new ObjectPool<Projectile>(
            () => new Projectile(0, 0, 0, 0, 0, 0),
            (p) => { p.active = true; p.vx = 0; p.vy = 0; p.target = undefined; }
        );

        this.particlePool = new ObjectPool<Particle>(
            () => new Particle(0, 0),
            (p) => { p.active = true; }
        );

        this.powerUpPool = new ObjectPool<PowerUp>(
            () => new PowerUp(0, 0, 'health'),
            (p) => { p.active = true; }
        );

        this.starfield = new Starfield(canvas.width || window.innerWidth, canvas.height || window.innerHeight);

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        window.addEventListener('resize', this.resize);
        this.resize();

        initEnemySVGs();
    }

    private createInitialState(): GameState {
        return {
            score: 0,
            health: 3,
            energy: 100,
            level: 1,
            wave: 1,
            combo: 0,
            maxCombo: 0,
            isGameOver: false,
            isPaused: false,
            highScore: this.loadHighScore(),
            totalKills: 0,
            waveKills: 0,
            waveKillsRequired: 8,
            waveCountdown: 0,
            isWaveTransition: false,
            timeSurvived: 0,
            bossHealth: 0,
            bossMaxHealth: 0,
            bossActive: false,
            lastShotTime: 0,
            lastRocketTime: 0,
            lastShieldTime: 0,
            lastSpecialTime: 0,
        };
    }

    private loadHighScore(): number {
        if (typeof window === 'undefined') return 0;
        try {
            return parseInt(localStorage.getItem('galactic_defender_highscore') || '0', 10);
        } catch { return 0; }
    }

    private saveHighScore(score: number) {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('galactic_defender_highscore', score.toString());
        } catch { /* ignore */ }
    }

    init() {
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.enemies = [];
        this.projectilePool.clear();
        this.enemyProjectilePool.clear();
        this.particlePool.clear();
        this.powerUpPool.clear();

        this.isShieldActive = false;
        this.lastShotTime = 0;
        this.lastRocketTime = 0;
        this.lastShieldTime = 0;
        this.lastSpecialTime = 0;
        this.waveTransitionTimer = 0;
        this.comboTimer = 0;
        this.shakeIntensity = 0;
        this.shakeDuration = 0;

        this.state = this.createInitialState();
        this.gameStartTime = Date.now();
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

    togglePause() {
        if (this.state.isGameOver) return;
        this.state.isPaused = !this.state.isPaused;
    }

    restart() {
        this.start();
    }

    quit() {
        this.stop();
        this.state.isGameOver = true;
    }

    private loop(timestamp: number) {
        const dt = Math.min(timestamp - this.lastTime, 50);
        this.lastTime = timestamp;

        if (this.input.isPressed('PAUSE')) {
            const now = Date.now();
            if (now - this.lastPauseToggle > 300) {
                this.lastPauseToggle = now;
                this.togglePause();
            }
        }

        if (!this.state.isPaused && !this.state.isGameOver) {
            this.update(dt);
            this.state.timeSurvived = (Date.now() - this.gameStartTime) / 1000;
        }

        this.starfield.update(this.state.isPaused ? 0 : dt);
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }

    private update(dt: number) {
        if (!this.player) return;

        this.player.update(dt, this.input, this.canvas.width, this.canvas.height);
        this.state.energy = Math.min(100, this.state.energy + 0.05 * (dt / 16));

        this.comboTimer += dt;
        if (this.comboTimer > 3000 && this.state.combo > 0) {
            this.state.combo = 0;
        }

        if (this.state.isWaveTransition) {
            this.waveTransitionTimer -= dt;
            this.state.waveCountdown = Math.ceil(this.waveTransitionTimer / 1000);
            if (this.waveTransitionTimer <= 0) {
                this.state.isWaveTransition = false;
                this.state.waveCountdown = 0;
            }
            this.updateProjectiles(dt);
            this.updateParticles(dt);
            this.updatePowerUps(dt);
            return;
        }

        this.handleShooting(dt);
        this.updateProjectiles(dt);
        this.updateEnemyProjectiles(dt);
        this.spawnEnemies();
        this.updateEnemies(dt);
        this.updateParticles(dt);
        this.updatePowerUps(dt);
        this.checkCollisions();
        this.checkWaveProgression();

        this.state.lastShotTime = this.lastShotTime;
        this.state.lastRocketTime = this.lastRocketTime;
        this.state.lastShieldTime = this.lastShieldTime;
        this.state.lastSpecialTime = this.lastSpecialTime;
    }

    private handleShooting(dt: number) {
        if (!this.player) return;

        if (this.input.isPressed('SHOOT')) {
            const now = Date.now();
            if (now - this.lastShotTime > GameConfig.PLAYER.INITIAL_RATES.SHOOT) {
                this.spawnBullet(this.player.x + this.player.width / 2 - 2, this.player.y, 0, -1);
                if (this.state.score > 500) {
                    this.spawnBullet(this.player.x, this.player.y + 10, -0.2, -0.9);
                    this.spawnBullet(this.player.x + this.player.width, this.player.y + 10, 0.2, -0.9);
                }
                this.lastShotTime = now;
                soundManager.play('shoot');
            }
        }

        if (this.input.isPressed('SKILL_2')) {
            const now = Date.now();
            if (now - this.lastSpecialTime > 2000 && this.state.energy >= 30) {
                this.state.energy -= 30;
                this.lastSpecialTime = now;
                const target = this.enemies.find(e => e.active);
                const p = this.projectilePool.get();
                p.x = this.player.x + this.player.width / 2;
                p.y = this.player.y;
                p.width = 8;
                p.height = 8;
                p.speed = 5;
                p.damage = 20;
                p.color = '#00ff00';
                p.type = 'smart_rocket';
                p.target = target;
                soundManager.play('homing');
            }
        }

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
                soundManager.play('rocket');
            }
        }

        if (this.input.isPressed('SKILL_3')) {
            const now = Date.now();
            if (now - this.lastShieldTime > GameConfig.PLAYER.INITIAL_RATES.SHIELD && this.state.energy >= 25) {
                this.state.energy -= 25;
                this.lastShieldTime = now;
                this.isShieldActive = true;
                soundManager.play('shield');
                setTimeout(() => this.isShieldActive = false, 5000);
            }
        }
    }

    private updateProjectiles(dt: number) {
        this.projectilePool.getActive().forEach(p => p.update(dt));
        const activeProjectiles = [...this.projectilePool.getActive()];
        activeProjectiles.forEach(p => {
            if (p.x < -50 || p.x > this.canvas.width + 50 || p.y < -50 || p.y > this.canvas.height + 50 || !p.active) {
                p.active = false;
                this.projectilePool.release(p);
            }
        });
    }

    private updateEnemyProjectiles(dt: number) {
        this.enemyProjectilePool.getActive().forEach(p => {
            const speedPerMs = (3 * 60) / 1000;
            p.x += p.vx * speedPerMs * dt;
            p.y += p.vy * speedPerMs * dt;
        });
        const activeEnemyBullets = [...this.enemyProjectilePool.getActive()];
        activeEnemyBullets.forEach(p => {
            if (p.x < -50 || p.x > this.canvas.width + 50 || p.y < -50 || p.y > this.canvas.height + 50) {
                p.active = false;
                this.enemyProjectilePool.release(p);
            }
        });
    }

    private spawnEnemies() {
        const waveDifficulty = Math.min(this.state.wave, 15);
        const spawnRate = Math.min(0.04, 0.008 + waveDifficulty * 0.002);

        if (Math.random() < spawnRate) {
            let type = 'basic';
            const rand = Math.random();
            const bossThreshold = this.state.wave >= 3 ? 0.995 : 2;
            const tankThreshold = 0.95 - waveDifficulty * 0.01;
            const fastThreshold = 0.8 - waveDifficulty * 0.015;

            if (rand > bossThreshold) type = 'boss';
            else if (rand > tankThreshold) type = 'tank';
            else if (rand > fastThreshold) type = 'fast';

            const enemy = new Enemy(Math.random() * (this.canvas.width - 50), type as any);
            this.enemies.push(enemy);

            if (type === 'boss') {
                this.state.bossActive = true;
                this.state.bossHealth = enemy.health;
                this.state.bossMaxHealth = enemy.maxHealth;
            }
        }
    }

    private updateEnemies(dt: number) {
        if (!this.player) return;

        this.enemies.forEach(e => {
            e.update(dt);
            if (e.type === 'basic') {
                e.x += Math.sin(e.y * 0.02) * 2;
            }
            if (e.type === 'fast' && this.player) {
                if (e.x < this.player.x) e.x += 1;
                else e.x -= 1;
            }

            if (e.shouldShoot() && this.player) {
                const shootData = e.getShootData(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2
                );
                this.spawnEnemyBullet(shootData.x, shootData.y, shootData.vx, shootData.vy);
            }

            if (e.type === 'boss' && e.active) {
                this.state.bossHealth = e.health;
            }
        });

        this.enemies = this.enemies.filter(e => (e.y < this.canvas.height + 50) && (e.active || e.isDying));

        const hasBoss = this.enemies.some(e => e.type === 'boss' && e.active);
        if (!hasBoss && this.state.bossActive) {
            this.state.bossActive = false;
        }
    }

    private updateParticles(dt: number) {
        this.particlePool.getActive().forEach(p => p.update(dt));
        const activeParticles = [...this.particlePool.getActive()];
        activeParticles.forEach(p => {
            if (!p.active) this.particlePool.release(p);
        });
    }

    private updatePowerUps(dt: number) {
        if (!this.player) return;
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;

        this.powerUpPool.getActive().forEach(p => {
            p.update(dt);

            // Magnetism: drift toward player within 80px
            const dx = px - (p.x + p.width / 2);
            const dy = py - (p.y + p.height / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80 && dist > 0) {
                const pull = (1 - dist / 80) * 3;
                p.x += (dx / dist) * pull;
                p.y += (dy / dist) * pull;
            }

            if (p.intersects(this.player!)) {
                p.active = false;
                this.collectPowerUp(p);
            }
        });
        const activePU = [...this.powerUpPool.getActive()];
        activePU.forEach(p => {
            if (!p.active) this.powerUpPool.release(p);
        });
    }

    private collectPowerUp(pu: PowerUp) {
        soundManager.play('powerup');
        switch (pu.type) {
            case 'health':
                this.state.health = Math.min(3, this.state.health + 1);
                this.spawnExplosion(pu.x + 10, pu.y + 10, '#ff4444', 8);
                break;
            case 'energy':
                this.state.energy = Math.min(100, this.state.energy + 30);
                this.spawnExplosion(pu.x + 10, pu.y + 10, '#00e5ff', 8);
                break;
            case 'score_bonus':
                this.state.score += 250;
                this.spawnExplosion(pu.x + 10, pu.y + 10, '#ffd700', 8);
                break;
        }
    }

    private spawnBullet(x: number, y: number, vx: number = 0, vy: number = -1) {
        const p = this.projectilePool.get();
        p.x = x;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.width = 4;
        p.height = 10;
        p.speed = 8;
        p.damage = 1;
        p.color = '#ff4444';
        p.type = 'bullet';
    }

    private spawnEnemyBullet(x: number, y: number, vx: number, vy: number) {
        const p = this.enemyProjectilePool.get();
        p.x = x - 3;
        p.y = y;
        p.vx = vx;
        p.vy = vy;
        p.width = 6;
        p.height = 6;
        p.speed = 3;
        p.damage = 1;
        p.color = '#ff3333';
        p.type = 'bullet';
    }

    private checkCollisions() {
        const activeProjectiles = this.projectilePool.getActive();
        for (const bullet of activeProjectiles) {
            if (!bullet.active) continue;
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                if (bullet.intersects(enemy)) {
                    enemy.health -= bullet.damage;
                    bullet.active = false;
                    this.spawnExplosion(bullet.x, bullet.y, "#ffaa00", 3);

                    if (enemy.health <= 0) {
                        enemy.startDeathAnimation();
                        this.state.score += enemy.points;
                        this.state.combo += 1;
                        this.comboTimer = 0;
                        if (this.state.combo > this.state.maxCombo) {
                            this.state.maxCombo = this.state.combo;
                        }
                        this.state.totalKills += 1;
                        this.state.waveKills += 1;

                        const particleCount = enemy.type === 'boss' ? 40 : enemy.type === 'tank' ? 25 : 15;
                        const color = enemy.type === 'boss' ? '#ff0000' : enemy.type === 'tank' ? '#00ff00' : '#ff8800';
                        this.spawnExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, color, particleCount);
                        soundManager.play('explosion');

                        if (enemy.type === 'boss') {
                            this.triggerShake(12, 400);
                        }

                        this.maybeDropPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type);
                    }
                }
            }
        }

        if (this.player && !this.isShieldActive) {
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                if (enemy.intersects(this.player) && !enemy.isDying) {
                    this.damagePlayer();
                    enemy.active = false;
                    this.spawnExplosion(enemy.x, enemy.y, "#ffffff", 20);
                }
            }

            const enemyBullets = this.enemyProjectilePool.getActive();
            for (const bullet of enemyBullets) {
                if (!bullet.active) continue;
                if (bullet.intersects(this.player)) {
                    bullet.active = false;
                    this.enemyProjectilePool.release(bullet);
                    this.damagePlayer();
                    this.spawnExplosion(bullet.x, bullet.y, "#ff3333", 5);
                }
            }
        }
    }

    private damagePlayer() {
        this.state.health -= 1;
        this.state.combo = 0;
        this.triggerShake(8, 250);
        soundManager.play('hit');

        if (this.state.health <= 0) {
            this.state.isGameOver = true;
            soundManager.play('game_over');
            if (this.state.score > this.state.highScore) {
                this.state.highScore = this.state.score;
                this.saveHighScore(this.state.score);
            }
        }
    }

    private checkWaveProgression() {
        if (this.state.waveKills >= this.state.waveKillsRequired) {
            this.state.wave += 1;
            this.state.waveKills = 0;
            this.state.waveKillsRequired = Math.floor(8 + this.state.wave * 3);
            this.state.isWaveTransition = true;
            this.waveTransitionTimer = 3000;
            this.state.waveCountdown = 3;
            soundManager.play('wave_clear');
        }
    }

    private maybeDropPowerUp(x: number, y: number, enemyType: string) {
        let dropChance = 0.12;
        if (enemyType === 'tank') dropChance = 0.25;
        if (enemyType === 'boss') dropChance = 1.0;

        if (Math.random() < dropChance) {
            const types: PowerUpType[] = ['health', 'energy', 'score_bonus'];
            const weights = this.state.health < 2 ? [0.5, 0.3, 0.2] : [0.15, 0.45, 0.4];
            const rand = Math.random();
            let cumulative = 0;
            let chosenType: PowerUpType = 'score_bonus';
            for (let i = 0; i < types.length; i++) {
                cumulative += weights[i];
                if (rand < cumulative) {
                    chosenType = types[i];
                    break;
                }
            }
            const pu = this.powerUpPool.get();
            pu.spawn(x - 10, y, chosenType);
        }
    }

    private triggerShake(intensity: number, duration: number) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
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
        const ctx = this.ctx;
        ctx.save();

        if (this.shakeDuration > 0) {
            const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            ctx.translate(offsetX, offsetY);
            this.shakeDuration -= 16;
            this.shakeIntensity *= 0.95;
            if (this.shakeDuration <= 0) {
                this.shakeIntensity = 0;
            }
        }

        ctx.clearRect(-20, -20, this.canvas.width + 40, this.canvas.height + 40);

        this.starfield.draw(ctx);

        ctx.shadowBlur = 10;

        if (this.player && this.isShieldActive) {
            const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
            ctx.shadowColor = "#00ffff";
            ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width + 10, 0, Math.PI * 2
            );
            ctx.stroke();

            ctx.strokeStyle = `rgba(0, 255, 255, ${pulse * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                this.player.width + 16, 0, Math.PI * 2
            );
            ctx.stroke();
        }

        this.player?.draw(ctx);

        this.projectilePool.getActive().forEach(p => {
            ctx.shadowColor = p.color;
            p.draw(ctx);
        });

        this.enemyProjectilePool.getActive().forEach(p => {
            ctx.shadowColor = '#ff3333';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 1, 0, Math.PI * 2);
            ctx.fill();
        });

        this.enemies.forEach(e => {
            e.draw(ctx);
        });

        this.powerUpPool.getActive().forEach(p => {
            p.draw(ctx);
        });

        // Batch particles by color to minimize fillStyle swaps
        const particlesByColor = new Map<string, Particle[]>();
        this.particlePool.getActive().forEach(p => {
            if (!particlesByColor.has(p.color)) particlesByColor.set(p.color, []);
            particlesByColor.get(p.color)!.push(p);
        });
        particlesByColor.forEach((particles, color) => {
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            for (const p of particles) {
                p.draw(ctx);
            }
        });

        // Low-health red vignette pulse
        if (this.state.health === 1 && !this.state.isGameOver) {
            const pulse = (Math.sin(Date.now() * 0.004) + 1) * 0.15 + 0.1;
            const grad = ctx.createRadialGradient(
                this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.25,
                this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * 0.75
            );
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(1, `rgba(255, 0, 0, ${pulse})`);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.starfield.resize(this.canvas.width, this.canvas.height);
    }
}
