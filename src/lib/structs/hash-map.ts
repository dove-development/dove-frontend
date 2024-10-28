export interface Hashable {
    getHashCode(): string | number;
}

export class HashMap<K extends Hashable, V> {
    private readonly map: Map<string | number, [K, V]> = new Map();

    public get(key: K): V | undefined {
        return this.map.get(key.getHashCode())?.[1];
    }

    public insert(key: K, value: V): void {
        this.map.set(key.getHashCode(), [key, value]);
    }

    public remove(key: K): boolean {
        return this.map.delete(key.getHashCode());
    }

    public forEach(f: (value: V, key: K) => void): void {
        this.map.forEach(([key, value]) => f(value, key));
    }
}
