/**
 * Rate limiting with adaptive throttling
 * System.json: authentication_and_security.rate_limiting
 */

import { logger } from '../observability/logger';

export interface RateLimitConfig {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Max requests per window
    adaptive: boolean; // Enable adaptive throttling
}

interface RateLimitEntry {
    requests: number[];
    lastReset: number;
}

export class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;
    }

    isAllowed(identifier: string): boolean {
        const now = Date.now();
        let entry = this.limits.get(identifier);

        if (!entry || now - entry.lastReset > this.config.windowMs) {
            // Reset window
            entry = {
                requests: [],
                lastReset: now,
            };
            this.limits.set(identifier, entry);
        }

        // Remove old requests outside window
        entry.requests = entry.requests.filter((time) => now - time < this.config.windowMs);

        if (entry.requests.length >= this.config.maxRequests) {
            logger.warn('Rate limit exceeded', { identifier, requests: entry.requests.length });
            return false;
        }

        entry.requests.push(now);
        return true;
    }

    getRemainingRequests(identifier: string): number {
        const entry = this.limits.get(identifier);
        if (!entry) {
            return this.config.maxRequests;
        }

        const now = Date.now();
        const validRequests = entry.requests.filter((time) => now - time < this.config.windowMs);
        return Math.max(0, this.config.maxRequests - validRequests.length);
    }

    reset(identifier: string): void {
        this.limits.delete(identifier);
    }

    clear(): void {
        this.limits.clear();
    }
}

// Default rate limiter: 100 requests per minute
export const rateLimiter = new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    adaptive: true,
});
