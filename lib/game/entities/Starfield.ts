interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    brightness: number;
    twinklePhase: number;
    twinkleSpeed: number;
}

interface StarLayer {
    stars: Star[];
    color: string;
}

interface Planet {
    x: number;
    y: number;
    radius: number;
    speed: number;
    baseColor: string;
    ringColor: string | null;
    hasRing: boolean;
    craterPhase: number;
    glowColor: string;
    glowSize: number;
}

export class Starfield {
    private layers: StarLayer[] = [];
    private planets: Planet[] = [];
    private width: number;
    private height: number;
    private time: number = 0;

    private offscreenCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
    private offscreenCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
    private needsRedraw: boolean = true;
    private frameCounter: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.initLayers();
        this.initPlanets();
        this.createOffscreen();
    }

    private createOffscreen() {
        try {
            if (typeof OffscreenCanvas !== 'undefined') {
                this.offscreenCanvas = new OffscreenCanvas(this.width, this.height);
                this.offscreenCtx = this.offscreenCanvas.getContext('2d');
            }
        } catch {
            this.offscreenCanvas = null;
            this.offscreenCtx = null;
        }
    }

    private initLayers() {
        this.layers = [
            this.createLayer(80, 0.3, 0.8, 'rgba(100, 130, 200,'),
            this.createLayer(50, 1.0, 1.5, 'rgba(180, 200, 255,'),
            this.createLayer(25, 2.0, 2.5, 'rgba(255, 255, 255,'),
        ];
    }

    private initPlanets() {
        const PLANET_PALETTES = [
            { base: '#4a2a6b', glow: 'rgba(120, 60, 180, 0.15)', ring: '#7b4fad' },  // Purple gas giant
            { base: '#2a4a3b', glow: 'rgba(40, 120, 80, 0.12)', ring: null },         // Dark green rocky
            { base: '#6b3a2a', glow: 'rgba(180, 80, 40, 0.1)', ring: '#8b5a3a' },     // Rusty Mars-like
            { base: '#1a3a5a', glow: 'rgba(30, 80, 160, 0.15)', ring: null },         // Deep blue ice
            { base: '#5a4a1a', glow: 'rgba(160, 140, 40, 0.1)', ring: '#8a7a3a' },    // Golden Saturn-like
        ];

        this.planets = [];
        const planetCount = 2 + Math.floor(Math.random() * 2); // 2–3 planets

        for (let i = 0; i < planetCount; i++) {
            const palette = PLANET_PALETTES[Math.floor(Math.random() * PLANET_PALETTES.length)];
            this.planets.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 20 + Math.random() * 40,
                speed: 0.05 + Math.random() * 0.08,
                baseColor: palette.base,
                ringColor: palette.ring,
                hasRing: palette.ring !== null && Math.random() > 0.3,
                craterPhase: Math.random() * Math.PI * 2,
                glowColor: palette.glow,
                glowSize: 1.5 + Math.random() * 0.5,
            });
        }
    }

    private createLayer(count: number, sizeMin: number, sizeMax: number, colorBase: string): StarLayer {
        const stars: Star[] = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * (sizeMax - sizeMin) + sizeMin,
                speed: (sizeMax - sizeMin + 0.5) * 0.4 + Math.random() * 0.3,
                brightness: Math.random() * 0.5 + 0.5,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.003 + 0.001,
            });
        }
        return { stars, color: colorBase };
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.initLayers();
        this.initPlanets();
        this.createOffscreen();
        this.needsRedraw = true;
    }

    update(dt: number) {
        this.time += dt;
        this.frameCounter++;

        for (const layer of this.layers) {
            for (const star of layer.stars) {
                star.y += star.speed * (dt / 16);
                star.twinklePhase += star.twinkleSpeed * dt;
                if (star.y > this.height) {
                    star.y = -star.size;
                    star.x = Math.random() * this.width;
                }
            }
        }

        // Planets drift very slowly downward
        for (const planet of this.planets) {
            planet.y += planet.speed * (dt / 16);
            if (planet.y - planet.radius > this.height) {
                planet.y = -planet.radius * 2;
                planet.x = Math.random() * this.width;
            }
        }

        if (this.frameCounter % 3 === 0) {
            this.needsRedraw = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw stars
        for (const layer of this.layers) {
            for (const star of layer.stars) {
                const twinkle = (Math.sin(star.twinklePhase) + 1) * 0.25 + 0.5;
                const alpha = star.brightness * twinkle;
                ctx.fillStyle = `${layer.color} ${alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw planets (behind everything else, very subtle)
        for (const planet of this.planets) {
            this.drawPlanet(ctx, planet);
        }

        // Draw nebula from offscreen buffer
        if (this.offscreenCtx && this.offscreenCanvas) {
            if (this.needsRedraw) {
                this.offscreenCtx.clearRect(0, 0, this.width, this.height);
                const nebulaGrad = this.offscreenCtx.createRadialGradient(
                    this.width * 0.7, this.height * 0.3, 0,
                    this.width * 0.7, this.height * 0.3, this.width * 0.4
                );
                nebulaGrad.addColorStop(0, 'rgba(80, 20, 120, 0.04)');
                nebulaGrad.addColorStop(0.5, 'rgba(20, 60, 140, 0.02)');
                nebulaGrad.addColorStop(1, 'transparent');
                this.offscreenCtx.fillStyle = nebulaGrad;
                this.offscreenCtx.fillRect(0, 0, this.width, this.height);
                this.needsRedraw = false;
            }
            ctx.drawImage(this.offscreenCanvas as any, 0, 0);
        } else {
            const nebulaGrad = ctx.createRadialGradient(
                this.width * 0.7, this.height * 0.3, 0,
                this.width * 0.7, this.height * 0.3, this.width * 0.4
            );
            nebulaGrad.addColorStop(0, 'rgba(80, 20, 120, 0.04)');
            nebulaGrad.addColorStop(0.5, 'rgba(20, 60, 140, 0.02)');
            nebulaGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nebulaGrad;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    private drawPlanet(ctx: CanvasRenderingContext2D, planet: Planet) {
        ctx.save();
        ctx.globalAlpha = 0.35; // Planets are subtle background elements

        // Atmospheric glow
        const glow = ctx.createRadialGradient(
            planet.x, planet.y, planet.radius * 0.8,
            planet.x, planet.y, planet.radius * planet.glowSize
        );
        glow.addColorStop(0, planet.glowColor);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius * planet.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Planet body
        const bodyGrad = ctx.createRadialGradient(
            planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, 0,
            planet.x, planet.y, planet.radius
        );
        bodyGrad.addColorStop(0, this.lightenColor(planet.baseColor, 30));
        bodyGrad.addColorStop(0.7, planet.baseColor);
        bodyGrad.addColorStop(1, this.darkenColor(planet.baseColor, 40));
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Surface detail bands
        ctx.globalAlpha = 0.12;
        for (let i = 0; i < 3; i++) {
            const bandY = planet.y - planet.radius * 0.5 + (planet.radius * 0.5 * i);
            const bandWidth = Math.sqrt(planet.radius * planet.radius - Math.pow(bandY - planet.y, 2)) * 2;
            if (bandWidth > 0) {
                ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                ctx.fillRect(planet.x - bandWidth / 2, bandY, bandWidth, planet.radius * 0.12);
            }
        }

        // Ring (if applicable)
        if (planet.hasRing && planet.ringColor) {
            ctx.globalAlpha = 0.25;
            ctx.strokeStyle = planet.ringColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(planet.x, planet.y, planet.radius * 1.8, planet.radius * 0.35, 0.3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.strokeStyle = this.lightenColor(planet.ringColor, 20);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(planet.x, planet.y, planet.radius * 2.0, planet.radius * 0.4, 0.3, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    private lightenColor(hex: string, amount: number): string {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
        return `rgb(${r},${g},${b})`;
    }

    private darkenColor(hex: string, amount: number): string {
        const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
        const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
        const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
        return `rgb(${r},${g},${b})`;
    }
}
