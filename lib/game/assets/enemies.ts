import { EnemyType } from '../types';

const ENEMY_SVGS: Record<EnemyType, string> = {
    basic: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#ff6600" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 10h4v4h-4zm0 0L6.5 6.5M9.96 6A3.5 3.5 0 1 0 6 9.96m8 .04l3.5-3.5m.5 3.46A3.5 3.5 0 1 0 14.04 6M14 14l3.5 3.5m-3.46.5A3.5 3.5 0 1 0 18 14.04M10 14l-3.5 3.5M6 14.04A3.5 3.5 0 1 0 9.96 18"/></svg>`,

    fast: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="#00e5ff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 20v-9m2-4a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4zm.12-3.12L16 2"/><path d="M21 21a4 4 0 0 0-3.81-4M21 5a4 4 0 0 1-3.55 3.97M22 13h-4M3 21a4 4 0 0 1 3.81-4M3 5a4 4 0 0 0 3.55 3.97M6 13H2M8 2l1.88 1.88M9 7.13V6a3 3 0 1 1 6 0v1.13"/></g></svg>`,

    tank: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="#00ff88" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zm-8-5v4m0 4h.01"/></svg>`,

    boss: `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path fill="#ff0044" d="M128 16C70.65 16 24 60.86 24 116c0 34.1 18.27 66 48 84.28V216a16 16 0 0 0 16 16h8a4 4 0 0 0 4-4v-27.73a8.17 8.17 0 0 1 7.47-8.25a8 8 0 0 1 8.53 8v28a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-27.75a8.17 8.17 0 0 1 7.47-8.25a8 8 0 0 1 8.53 8v28a4 4 0 0 0 4 4h8a16 16 0 0 0 16-16v-15.74C213.73 182 232 150.1 232 116c0-55.14-46.65-100-104-100M92 152a20 20 0 1 1 20-20a20 20 0 0 1-20 20m72 0a20 20 0 1 1 20-20a20 20 0 0 1-20 20"/></svg>`,
};

const imageCache: Map<EnemyType, HTMLImageElement> = new Map();
let initialized = false;

export function initEnemySVGs(): Promise<void> {
    if (initialized) return Promise.resolve();

    const promises = (Object.keys(ENEMY_SVGS) as EnemyType[]).map(type => {
        return new Promise<void>((resolve) => {
            const img = new Image();
            const blob = new Blob([ENEMY_SVGS[type]], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                imageCache.set(type, img);
                URL.revokeObjectURL(url);
                resolve();
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve();
            };
            img.src = url;
        });
    });

    return Promise.all(promises).then(() => { initialized = true; });
}

export function getEnemyImage(type: EnemyType): HTMLImageElement | undefined {
    return imageCache.get(type);
}

export const ENEMY_GLOW_COLORS: Record<EnemyType, string> = {
    basic: '#ff6600',
    fast: '#00e5ff',
    tank: '#00ff88',
    boss: '#ff0044',
};
