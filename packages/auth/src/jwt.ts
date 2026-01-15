/**
 * JWT authentication with token rotation
 * System.json: authentication.stateless_sessions, token_rotation
 */

import jwt from 'jsonwebtoken';
import { logger } from '@web-kernel/core';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = '7d'; // 7 days

export interface TokenPayload {
    userId: string;
    email: string;
    roles: string[];
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export class JWTService {
    generateTokenPair(payload: TokenPayload): TokenPair {
        const accessToken = jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'web-kernel',
            audience: 'web-kernel-api',
        });

        const refreshToken = jwt.sign(
            { userId: payload.userId, type: 'refresh' },
            JWT_SECRET,
            {
                expiresIn: REFRESH_TOKEN_EXPIRES_IN,
                issuer: 'web-kernel',
                audience: 'web-kernel-api',
            }
        );

        logger.info('JWT token pair generated', { userId: payload.userId });

        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    }

    verifyAccessToken(token: string): TokenPayload | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: 'web-kernel',
                audience: 'web-kernel-api',
            }) as TokenPayload;

            return decoded;
        } catch (error) {
            logger.warn('JWT verification failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return null;
        }
    }

    verifyRefreshToken(token: string): { userId: string } | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: 'web-kernel',
                audience: 'web-kernel-api',
            }) as { userId: string; type: string };

            if (decoded.type !== 'refresh') {
                return null;
            }

            return { userId: decoded.userId };
        } catch (error) {
            logger.warn('Refresh token verification failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return null;
        }
    }

    // Token rotation: generate new pair from valid refresh token
    rotateTokens(refreshToken: string, newPayload: TokenPayload): TokenPair | null {
        const verified = this.verifyRefreshToken(refreshToken);

        if (!verified || verified.userId !== newPayload.userId) {
            return null;
        }

        logger.info('Tokens rotated', { userId: newPayload.userId });
        return this.generateTokenPair(newPayload);
    }
}

export const jwtService = new JWTService();
