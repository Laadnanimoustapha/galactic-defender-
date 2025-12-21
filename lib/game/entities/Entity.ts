import { Entity as IEntity } from '../types';

export abstract class Entity implements IEntity {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean = true;

    constructor(x: number, y: number, width: number, height: number) {
        this.id = crypto.randomUUID();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    abstract update(dt: number): void;
    abstract draw(ctx: CanvasRenderingContext2D): void;

    intersects(other: Entity): boolean {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }
}
