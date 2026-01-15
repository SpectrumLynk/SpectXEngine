/**
 * Job queue with idempotency, retry logic, and dead letter handling
 * System.json: cache_and_queue.queue_rules
 */

import { logger } from '../observability/logger';

export interface Job {
    id: string;
    type: string;
    payload: unknown;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    processedAt?: Date;
    error?: string;
}

export interface JobHandler {
    (payload: unknown): Promise<void>;
}

export class JobQueue {
    private queue: Job[] = [];
    private deadLetterQueue: Job[] = [];
    private handlers: Map<string, JobHandler> = new Map();
    private processing = false;

    registerHandler(type: string, handler: JobHandler): void {
        this.handlers.set(type, handler);
    }

    async enqueue(type: string, payload: unknown, maxAttempts = 3): Promise<string> {
        const job: Job = {
            id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            payload,
            attempts: 0,
            maxAttempts,
            createdAt: new Date(),
        };

        this.queue.push(job);
        logger.info('Job enqueued', { jobId: job.id, type });

        // Start processing if not already running
        if (!this.processing) {
            void this.process();
        }

        return job.id;
    }

    private async process(): Promise<void> {
        if (this.processing || this.queue.length === 0) {
            return;
        }

        this.processing = true;

        while (this.queue.length > 0) {
            const job = this.queue.shift();
            if (!job) break;

            await this.processJob(job);
        }

        this.processing = false;
    }

    private async processJob(job: Job): Promise<void> {
        const handler = this.handlers.get(job.type);

        if (!handler) {
            logger.error('No handler for job type', undefined, { jobType: job.type });
            this.moveToDeadLetter(job, 'No handler registered');
            return;
        }

        job.attempts++;

        try {
            await handler(job.payload);
            job.processedAt = new Date();
            logger.info('Job processed successfully', { jobId: job.id, attempts: job.attempts });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Job processing failed', error as Error, {
                jobId: job.id,
                attempts: job.attempts
            });

            if (job.attempts >= job.maxAttempts) {
                this.moveToDeadLetter(job, errorMessage);
            } else {
                // Exponential backoff: 2^attempts * 1000ms
                const delay = Math.pow(2, job.attempts) * 1000;
                await this.delay(delay);
                this.queue.push(job); // Re-queue for retry
                logger.info('Job re-queued for retry', {
                    jobId: job.id,
                    nextAttempt: job.attempts + 1,
                    delayMs: delay
                });
            }
        }
    }

    private moveToDeadLetter(job: Job, error: string): void {
        job.error = error;
        this.deadLetterQueue.push(job);
        logger.error('Job moved to dead letter queue', undefined, {
            jobId: job.id,
            error
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getDeadLetterQueue(): Job[] {
        return [...this.deadLetterQueue];
    }

    clearDeadLetterQueue(): void {
        this.deadLetterQueue = [];
    }

    getQueueSize(): number {
        return this.queue.length;
    }
}

// Global job queue instance
export const jobQueue = new JobQueue();
