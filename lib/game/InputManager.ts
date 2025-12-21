import { InputKey } from '../types';

export class InputManager {
    private keys: Set<string> = new Set();
    private bindings: Record<string, InputKey> = {
        'ArrowUp': 'UP',
        'w': 'UP',
        'ArrowDown': 'DOWN',
        's': 'DOWN',
        'ArrowLeft': 'LEFT',
        'a': 'LEFT',
        'ArrowRight': 'RIGHT',
        'd': 'RIGHT',
        ' ': 'SHOOT',
        'r': 'SKILL_1', // Rocket
        't': 'SKILL_2', // Smart Rocket
        'e': 'SKILL_3', // Laser
        'Escape': 'PAUSE',
        'p': 'PAUSE',
    };

    constructor() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    attach() {
        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', this.handleKeyDown);
            window.addEventListener('keyup', this.handleKeyUp);
        }
    }

    detach() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('keyup', this.handleKeyUp);
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        this.keys.add(e.key);
    }

    private handleKeyUp(e: KeyboardEvent) {
        this.keys.delete(e.key);
    }

    isPressed(action: InputKey): boolean {
        for (const [key, boundAction] of Object.entries(this.bindings)) {
            if (boundAction === action && this.keys.has(key)) {
                return true;
            }
        }
        return false;
    }
}
