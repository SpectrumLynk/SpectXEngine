/**
 * Application startup entry point
 * Runs bootstrap before Next.js server starts
 */

import { bootstrap } from '@web-kernel/core';

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        // Run bootstrap on server startup
        await bootstrap.start({
            runMigrations: process.env.NODE_ENV === 'production',
            requireHealthChecks: true,
            gracefulShutdown: true,
        });
    }
}
