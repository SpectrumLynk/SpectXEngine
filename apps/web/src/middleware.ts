/**
 * Request tracing middleware for Next.js
 * System.json: tracing.request_id_mandatory, correlation_id_mandatory, trace_all_requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { logger } from '@web-kernel/core';

export interface RequestContext {
    requestId: string;
    correlationId: string;
    userId?: string;
    method: string;
    path: string;
    userAgent?: string;
    ip?: string;
    startTime: number;
}

export function middleware(request: NextRequest): NextResponse {
    const startTime = Date.now();

    // Generate or extract IDs (mandatory per system.json)
    const requestId = request.headers.get('x-request-id') || randomUUID();
    const correlationId = request.headers.get('x-correlation-id') || randomUUID();

    // Extract user context if available
    const userId = request.headers.get('x-user-id') || undefined;

    const context: RequestContext = {
        requestId,
        correlationId,
        userId,
        method: request.method,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.ip || request.headers.get('x-forwarded-for') || undefined,
        startTime,
    };

    // Log incoming request
    logger.info('Incoming request', {
        requestId,
        correlationId,
        userId,
        method: context.method,
        path: context.path,
        userAgent: context.userAgent,
        ip: context.ip,
    });

    // Clone response and add tracing headers
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);
    response.headers.set('x-correlation-id', correlationId);

    // Log response (will be enhanced with actual response time in production)
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
        requestId,
        correlationId,
        duration,
        status: response.status,
    });

    return response;
}

// Configure middleware to run on all routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (*.png, *.jpg, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)).*)',
    ],
};
