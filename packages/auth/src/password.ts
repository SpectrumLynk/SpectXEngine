/**
 * Password utilities with bcrypt
 */

import bcrypt from 'bcryptjs';
import { logger } from '@web-kernel/core';

const SALT_ROUNDS = 12;

export class PasswordService {
    async hash(password: string): Promise<string> {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        logger.debug('Password hashed');
        return hash;
    }

    async verify(password: string, hash: string): Promise<boolean> {
        const isValid = await bcrypt.compare(password, hash);
        logger.debug('Password verification', { success: isValid });
        return isValid;
    }

    validateStrength(password: string): {
        valid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

export const passwordService = new PasswordService();
