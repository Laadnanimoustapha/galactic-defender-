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
  private lastShotTime: number = 0;
  private lastRocketTime: number = 0;
  private lastShieldTime: number = 0;
  private lastSpecialTime: number = 0;

  constructor(canvas: HTMLCanvasElement, input: InputManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = input;

    this.projectilePool = new ObjectPool<Projectile>(
        () => new Projectile(0, 0, 0, 0, 0, 0), 
        (p) => { 
            p.active = true; 
            p.vx = 0; 
            p.vy = 0; 
            p.target = undefined;
        } 
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
     this.state.energy = Math.min(100, this.state.energy + 0.05 * (dt/16));

     // Shooting (Spread / Basic)
     if (this.input.isPressed('SHOOT')) {
        const now = Date.now();
        if (now - this.lastShotTime > GameConfig.PLAYER.INITIAL_RATES.SHOOT) { 
            this.spawnBullet(this.player.x + this.player.width/2 - 2, this.player.y, 0, -1);
            
            if (this.state.score > 500) { 
                 this.spawnBullet(this.player.x, this.player.y + 10, -0.2, -0.9);
                 this.spawnBullet(this.player.x + this.player.width, this.player.y + 10, 0.2, -0.9);
            }
            this.lastShotTime = now;
        }
     }

     // HOMING MISSILE (T / Skill 2)
     if (this.input.isPressed('SKILL_2')) {
         const now = Date.now();
         if (now - this.lastSpecialTime > 2000 && this.state.energy >= 30) {
             this.state.energy -= 30;
             this.lastSpecialTime = now;
             
             // Find Target
             const target = this.enemies.find(e => e.active);
             
             const p = this.projectilePool.get();
             p.x = this.player.x + this.player.width/2;
             p.y = this.player.y;
             p.width = 8;
             p.height = 8;
             p.speed = 5;
             p.damage = 20;
             p.color = '#00ff00';
             p.type = 'smart_rocket';
             p.target = target;
         }
     }

     // ROCKET (R)
     if (this.input.isPressed('SKILL_1')) {
         const now = Date.now();
         if (now - this.lastRocketTime > GameConfig.PLAYER.INITIAL_RATES.ROCKET && this.state.energy >= 20) {
             this.state.energy -= 20;
             this.lastRocketTime = now;
             const p = this.projectilePool.get();
             p.x = this.player.x + this.player.width/2 - 6;
             p.y = this.player.y;
             p.width = 12;
             p.height = 20;
             p.speed = 6;
             p.damage = 10;
             p.color = '#ffaa00';
             p.type = 'rocket';
         }
     }

     // SHIELD (Skill 3)
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
        if (p.x < 0 || p.x > this.canvas.width || p.y < -50 || p.y > this.canvas.height + 50 || !p.active) {
            p.active = false;
            this.projectilePool.release(p);
        }
     });

     // Spawn Enemies
     // CAP THE SPAWN RATE TO 5% per frame max to prevent lag
     const spawnRate = Math.min(0.05, 0.01 + (this.state.score / 50000));
     
     if (Math.random() < spawnRate) { 
         let type = 'basic';
         const rand = Math.random();
         if (rand > 0.95) type = 'tank';
         else if (rand > 0.8) type = 'fast';
         else if (rand > 0.995) type = 'boss'; 
         
         this.enemies.push(new Enemy(Math.random() * (this.canvas.width - 30), type as any));
     }

     // Update Enemies
     this.enemies.forEach(e => {
         e.update(dt);
         if (e.type === 'basic') {
             e.x += Math.sin(e.y * 0.02) * 2;
         }
         if (e.type === 'fast' && this.player) {
             if (e.x < this.player.x) e.x += 1;
             else e.x -= 1;
         }
     });
     
     this.enemies = this.enemies.filter(e => e.y < this.canvas.height && e.active);

     // Update Particles
     this.particlePool.getActive().forEach(p => p.update(dt));
     const activeParticles = [...this.particlePool.getActive()];
     activeParticles.forEach(p => {
         if (!p.active) this.particlePool.release(p);
     });

     this.checkCollisions();
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

  private checkCollisions() {
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
                      this.state.combo += 1; 
                      this.spawnExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, "#ff0000", 15);
                  }
              }
          }
      }

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
    this.ctx.shadowBlur = 10;
    
    if (this.player && this.isShieldActive) {
        this.ctx.shadowColor = "#00ffff";
        this.ctx.strokeStyle = "#00ffff";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x + this.player.width/2, 
            this.player.y + this.player.height/2, 
            this.player.width + 10, 0, Math.PI * 2
        );
        this.ctx.stroke();
    }
    
    this.player?.draw(this.ctx);
    
    // Batch projectiles to avoid context state switches if possible, 
    // but for now simple loop is fine.
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
