/**
 * TOTP (Time-based One-Time Password) implementation
 * System.json: mfa.supported_methods includes "totp"
 */

import { authenticator } from 'otplib';
import { logger } from '@web-kernel/core';

export class TOTPService {
    generateSecret(): string {
        return authenticator.generateSecret();
    }

    generateQRCodeUrl(email: string, secret: string): string {
        return authenticator.keyuri(email, 'Web Kernel', secret);
    }

    verifyToken(token: string, secret: string): boolean {
        try {
            const isValid = authenticator.verify({ token, secret });
            logger.info('TOTP verification', { success: isValid });
            return isValid;
        } catch (error) {
            logger.error('TOTP verification error', error as Error);
            return false;
        }
    }

    // Generate backup codes for recovery
    generateBackupCodes(count = 10): string[] {
        const codes: string[] = [];
        for (let i = 0; i < count; i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            codes.push(code);
        }
        logger.info('Backup codes generated', { count });
        return codes;
    }

    verifyBackupCode(code: string, backupCodes: string[]): boolean {
        return backupCodes.includes(code.toUpperCase());
    }
}

export const totpService = new TOTPService();
