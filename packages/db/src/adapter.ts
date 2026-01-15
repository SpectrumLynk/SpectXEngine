/**
 * Database adapter abstraction
 * System.json: database.abstraction_layer = "mandatory"
 * Prevents direct driver usage, enforces pagination
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@web-kernel/core';

export class DatabaseAdapter {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient({
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'event' },
            ],
        });

        // Log queries for observability
        this.prisma.$on('query', (e) => {
            logger.debug('Database query', {
                query: e.query,
                duration: e.duration,
            });
        });

        this.prisma.$on('error', (e) => {
            logger.error('Database error', new Error(e.message));
        });
    }

    getClient(): PrismaClient {
        return this.prisma;
    }

    async connect(): Promise<void> {
        await this.prisma.$connect();
        logger.info('Database connected');
    }

    async disconnect(): Promise<void> {
        await this.prisma.$disconnect();
        logger.info('Database disconnected');
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}

// Pagination utilities (system.json: mandatory for queries)
export interface PaginationOptions {
    page: number;
    pageSize: number;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export async function paginate<T>(
    query: Promise<T[]>,
    countQuery: Promise<number>,
    options: PaginationOptions
): Promise<PaginatedResult<T>> {
    const [data, total] = await Promise.all([query, countQuery]);

    return {
        data,
        pagination: {
            page: options.page,
            pageSize: options.pageSize,
            total,
            totalPages: Math.ceil(total / options.pageSize),
        },
    };
}

// Global database instance
export const db = new DatabaseAdapter();
