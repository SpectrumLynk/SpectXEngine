/**
 * Runtime Bootstrap System
 * System.json: runtime.startup.auto_bootstrap with pre-start checks
 */

import { logger, ErrorCode } from '@web-kernel/core';
import { db } from '@web-kernel/db';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface BootstrapConfig {
    runMigrations: boolean;
    requireHealthChecks: boolean;
    gracefulShutdown: boolean;
}

export class RuntimeBootstrap {
    private isShuttingDown = false;

    async start(config: BootstrapConfig = { runMigrations: true, requireHealthChecks: true, gracefulShutdown: true }): Promise<void> {
        logger.info('Starting runtime bootstrap', {
            runMigrations: config.runMigrations,
            requireHealthChecks: config.requireHealthChecks,
        });

        try {
            // 1. Environment Validation
            await this.validateEnvironment();

            // 2. Database Connection
            await this.connectDatabase();

            // 3. Database Migration (automatic per system.json)
            if (config.runMigrations) {
                await this.runDatabaseMigrations();
            }

            // 4. Health Checks
            if (config.requireHealthChecks) {
                await this.performHealthChecks();
            }

            // 5. Initialize Services
            await this.initializeServices();

            // 6. Setup Graceful Shutdown
            if (config.gracefulShutdown) {
                this.setupGracefulShutdown();
            }

            logger.info('Runtime bootstrap completed successfully');
        } catch (error) {
            logger.error(
                'Runtime bootstrap failed',
                ErrorCode.SYS_STARTUP_FAILED,
                error as Error
            );
            throw error;
        }
    }

    private async validateEnvironment(): Promise<void> {
        logger.info('Validating environment variables');

        const required = [
            'DATABASE_URL',
            'JWT_SECRET',
            'NODE_ENV',
        ];

        const missing = required.filter((key) => !process.env[key]);

        if (missing.length > 0) {
            const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
            logger.error(
                'Environment validation failed',
                ErrorCode.SYS_CONFIG_INVALID,
                error,
                { missing }
            );
            throw error;
        }

        // Validate JWT secret length
        if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
            const error = new Error('JWT_SECRET must be at least 32 characters');
            logger.error(
                'JWT secret too short',
                ErrorCode.SYS_CONFIG_INVALID,
                error
            );
            throw error;
        }

        logger.info('Environment validation passed');
    }

    private async connectDatabase(): Promise<void> {
        logger.info('Connecting to database');

        try {
            await db.connect();
            logger.info('Database connected successfully');
        } catch (error) {
            logger.error(
                'Database connection failed',
                ErrorCode.SYS_DB_CONNECTION_FAILED,
                error as Error
            );
            throw error;
        }
    }

    private async runDatabaseMigrations(): Promise<void> {
        logger.info('Running database migrations');

        try {
            // Run Prisma migrations automatically
            const { stdout, stderr } = await execAsync(
                'cd packages/db && npx prisma migrate deploy',
                { cwd: process.cwd() }
            );

            if (stderr && !stderr.includes('No pending migrations')) {
                logger.warn('Migration warnings', ErrorCode.SYS_DB_MIGRATION_FAILED, {
                    warnings: stderr,
                });
            }

            logger.info('Database migrations completed', {
                output: stdout.trim(),
            });
        } catch (error) {
            logger.error(
                'Database migration failed',
                ErrorCode.SYS_DB_MIGRATION_FAILED,
                error as Error
            );
            throw error;
        }
    }

    private async performHealthChecks(): Promise<void> {
        logger.info('Performing health checks');

        const checks = [
            { name: 'Database', check: () => db.healthCheck() },
        ];

        for (const { name, check } of checks) {
            try {
                const healthy = await check();
                if (!healthy) {
                    throw new Error(`${name} health check failed`);
                }
                logger.info(`${name} health check passed`);
            } catch (error) {
                logger.error(
                    `${name} health check failed`,
                    ErrorCode.SYS_HEALTH_CHECK_FAILED,
                    error as Error,
                    { component: name }
                );
                throw error;
            }
        }

        logger.info('All health checks passed');
    }

    private async initializeServices(): Promise<void> {
        logger.info('Initializing services');

        // Initialize service components
        const services = [
            'HTTP Server',
            'API Router',
            'Agent Runtime',
            'Job Scheduler',
            'Cache Layer',
            'Observability',
        ];

        for (const service of services) {
            logger.info(`Initializing ${service}`);
            // Service initialization happens automatically via Next.js
        }

        logger.info('All services initialized');
    }

    private setupGracefulShutdown(): void {
        const shutdown = async (signal: string): Promise<void> => {
            if (this.isShuttingDown) {
                return;
            }

            this.isShuttingDown = true;
            logger.info('Graceful shutdown initiated', { signal });

            try {
                // Close database connections
                await db.disconnect();
                logger.info('Database disconnected');

                // Additional cleanup can be added here

                logger.info('Graceful shutdown completed');
                process.exit(0);
            } catch (error) {
                logger.error(
                    'Graceful shutdown failed',
                    ErrorCode.SYS_GRACEFUL_SHUTDOWN_FAILED,
                    error as Error
                );
                process.exit(1);
            }
        };

        // Handle termination signals
        process.on('SIGTERM', () => void shutdown('SIGTERM'));
        process.on('SIGINT', () => void shutdown('SIGINT'));

        logger.info('Graceful shutdown handlers registered');
    }
}

// Singleton instance
export const bootstrap = new RuntimeBootstrap();
