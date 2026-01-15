/**
 * Example API route demonstrating error codes and request tracing
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, ErrorCode } from '@web-kernel/core';
import { db } from '@web-kernel/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
    const requestId = request.headers.get('x-request-id');
    const correlationId = request.headers.get('x-correlation-id');

    // Create request-scoped logger
    const reqLogger = logger.child({ requestId, correlationId });

    try {
        reqLogger.info('Health check requested');

        // Check database health
        const dbHealthy = await db.healthCheck();

        if (!dbHealthy) {
            reqLogger.error(
                'Database health check failed',
                ErrorCode.SYS_HEALTH_CHECK_FAILED
            );

            return NextResponse.json(
                {
                    status: 'unhealthy',
                    errorCode: ErrorCode.SYS_HEALTH_CHECK_FAILED,
                    components: { database: 'unhealthy' },
                },
                { status: 503 }
            );
        }

        reqLogger.info('Health check passed');

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {
                database: 'healthy',
                server: 'healthy',
            },
        });
    } catch (error) {
        reqLogger.error(
            'Health check endpoint error',
            ErrorCode.API_ENDPOINT_NOT_FOUND,
            error as Error
        );

        return NextResponse.json(
            {
                status: 'error',
                errorCode: ErrorCode.API_ENDPOINT_NOT_FOUND,
            },
            { status: 500 }
        );
    }
}
