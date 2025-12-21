export class SoundManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private muted: boolean = false;

    constructor() {
        // In a real implementation, we would load discrete files.
        // For this refactor, we prepare the structure.
        // this.load('shoot', '/sounds/shoot.mp3');
        // this.load('explode', '/sounds/explode.mp3');
    }

    load(name: string, path: string) {
        if (typeof window === 'undefined') return;
        const audio = new Audio(path);
        this.sounds.set(name, audio);
    }

    play(name: string) {
        if (this.muted) return;
        const sound = this.sounds.get(name);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.warn('Audio play failed', e));
        }
    }

    toggleMute() {
        this.muted = !this.muted;
    }
}

// Singleton instance
export const soundManager = new SoundManager();
