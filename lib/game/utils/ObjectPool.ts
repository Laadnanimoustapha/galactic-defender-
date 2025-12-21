export class ObjectPool<T> {
    private active: T[] = [];
    private reserve: T[] = [];
    private createFn: () => T;
    private resetFn: (item: T) => void;

    constructor(createFn: () => T, resetFn: (item: T) => void, initialSize: number = 0) {
        this.createFn = createFn;
        this.resetFn = resetFn;

        for (let i = 0; i < initialSize; i++) {
            this.reserve.push(this.createFn());
        }
    }

    get(): T {
        let item = this.reserve.pop();
        if (!item) {
            item = this.createFn();
        }
        this.resetFn(item);
        this.active.push(item);
        return item;
    }

    release(item: T) {
        const index = this.active.indexOf(item);
        if (index > -1) {
            this.active.splice(index, 1);
            this.reserve.push(item);
        }
    }

    getActive(): T[] {
        return this.active;
    }

    clear() {
        // Move all active back to reserve
        this.reserve.push(...this.active);
        this.active = [];
    }
}
