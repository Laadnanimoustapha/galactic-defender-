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

export class Starfield {
    private layers: StarLayer[] = [];
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
        // Only redraw offscreen every 3 frames for the nebula (static)
        if (this.frameCounter % 3 === 0) {
            this.needsRedraw = true;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Draw stars directly (they move every frame)
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

        // Draw nebula from offscreen buffer if available
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
            // Fallback: direct draw
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
}
