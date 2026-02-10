type SoundName = 'shoot' | 'rocket' | 'explosion' | 'shield' | 'powerup' | 'hit' | 'game_over' | 'wave_clear' | 'homing';

export class SoundManager {
    private ctx: AudioContext | null = null;
    private muted: boolean = false;
    private volume: number = 0.3;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.ctx) {
            try {
                this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch {
                return null;
            }
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    play(name: SoundName) {
        if (this.muted) return;
        const ctx = this.getContext();
        if (!ctx) return;

        switch (name) {
            case 'shoot': this.playShoot(ctx); break;
            case 'rocket': this.playRocket(ctx); break;
            case 'explosion': this.playExplosion(ctx); break;
            case 'shield': this.playShield(ctx); break;
            case 'powerup': this.playPowerup(ctx); break;
            case 'hit': this.playHit(ctx); break;
            case 'game_over': this.playGameOver(ctx); break;
            case 'wave_clear': this.playWaveClear(ctx); break;
            case 'homing': this.playHoming(ctx); break;
        }
    }

    private playShoot(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    }

    private playRocket(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    }

    private playExplosion(ctx: AudioContext) {
        const bufferSize = ctx.sampleRate * 0.3;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        source.connect(filter).connect(gain).connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    private playShield(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
    }

    private playPowerup(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }

    private playHit(ctx: AudioContext) {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        source.connect(gain).connect(ctx.destination);
        source.start(ctx.currentTime);
    }

    private playGameOver(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.0);
        gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.0);
    }

    private playWaveClear(ctx: AudioContext) {
        [523, 659, 784].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
            osc.connect(gain).connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
    }

    private playHoming(ctx: AudioContext) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
    }

    toggleMute() {
        this.muted = !this.muted;
    }

    isMuted(): boolean {
        return this.muted;
    }

    setVolume(v: number) {
        this.volume = Math.max(0, Math.min(1, v));
    }
}

export const soundManager = new SoundManager();
