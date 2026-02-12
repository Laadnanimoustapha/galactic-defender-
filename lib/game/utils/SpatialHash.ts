export class SpatialHash<T extends { x: number; y: number; width: number; height: number }> {
    private cellSize: number;
    private grid: Map<string, T[]> = new Map();

    constructor(cellSize: number = 100) {
        this.cellSize = cellSize;
    }

    clear() {
        this.grid.clear();
    }

    private key(col: number, row: number): string {
        return `${col},${row}`;
    }

    insert(entity: T) {
        const minCol = Math.floor(entity.x / this.cellSize);
        const maxCol = Math.floor((entity.x + entity.width) / this.cellSize);
        const minRow = Math.floor(entity.y / this.cellSize);
        const maxRow = Math.floor((entity.y + entity.height) / this.cellSize);

        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const k = this.key(col, row);
                if (!this.grid.has(k)) this.grid.set(k, []);
                this.grid.get(k)!.push(entity);
            }
        }
    }

    getNearby(entity: T): T[] {
        const seen = new Set<T>();
        const result: T[] = [];

        const minCol = Math.floor(entity.x / this.cellSize);
        const maxCol = Math.floor((entity.x + entity.width) / this.cellSize);
        const minRow = Math.floor(entity.y / this.cellSize);
        const maxRow = Math.floor((entity.y + entity.height) / this.cellSize);

        for (let col = minCol; col <= maxCol; col++) {
            for (let row = minRow; row <= maxRow; row++) {
                const items = this.grid.get(this.key(col, row));
                if (items) {
                    for (const item of items) {
                        if (item !== entity && !seen.has(item)) {
                            seen.add(item);
                            result.push(item);
                        }
                    }
                }
            }
        }

        return result;
    }
}
