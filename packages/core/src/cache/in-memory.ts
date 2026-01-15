/**
 * In-memory cache implementation with automatic fallback
 * System.json: cache_and_queue.default_mode = "in_process"
 */

export interface CacheOptions {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum number of items
}

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

export class InMemoryCache {
    private store: Map<string, CacheEntry<unknown>> = new Map();
    private maxSize: number;

    constructor(options: CacheOptions = {}) {
        this.maxSize = options.maxSize || 1000;
    }

    set<T>(key: string, value: T, ttl = 3600000): void {
        // Default 1 hour TTL
        // Evict oldest if at capacity
        if (this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey) {
                this.store.delete(firstKey);
            }
        }

        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttl,
        });
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            return null;
        }

        // Check expiration
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return entry.value;
    }

    has(key: string): boolean {
        return this.get(key) !== null;
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }

    size(): number {
        return this.store.size;
    }

    // Clean expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}

// Global cache instance
export const cache = new InMemoryCache({ maxSize: 1000 });

// Periodic cleanup
if (typeof setInterval !== 'undefined') {
    setInterval(() => cache.cleanup(), 60000); // Every minute
}
