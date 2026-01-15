/**
 * WebAuthn (Passkeys) implementation
 * System.json: mfa.supported_methods includes "webauthn_passkeys"
 */

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { logger } from '@web-kernel/core';

const RP_NAME = 'Web Kernel';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

export class WebAuthnService {
    async generateRegistrationOptions(userId: string, email: string) {
        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: userId,
            userName: email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
            },
        });

        logger.info('WebAuthn registration options generated', { userId });
        return options;
    }

    async verifyRegistration(
        response: RegistrationResponseJSON,
        expectedChallenge: string
    ) {
        try {
            const verification = await verifyRegistrationResponse({
                response,
                expectedChallenge,
                expectedOrigin: ORIGIN,
                expectedRPID: RP_ID,
            });

            logger.info('WebAuthn registration verified', { verified: verification.verified });
            return verification;
        } catch (error) {
            logger.error('WebAuthn registration verification failed', error as Error);
            throw error;
        }
    }

    async generateAuthenticationOptions(allowCredentials: { id: string }[]) {
        const options = await generateAuthenticationOptions({
            rpID: RP_ID,
            allowCredentials: allowCredentials.map((cred) => ({
                id: cred.id,
                type: 'public-key',
            })),
            userVerification: 'preferred',
        });

        logger.info('WebAuthn authentication options generated');
        return options;
    }

    async verifyAuthentication(
        response: AuthenticationResponseJSON,
        expectedChallenge: string,
        credentialPublicKey: Uint8Array,
        credentialCounter: number
    ) {
        try {
            const verification = await verifyAuthenticationResponse({
                response,
                expectedChallenge,
                expectedOrigin: ORIGIN,
                expectedRPID: RP_ID,
                authenticator: {
                    credentialPublicKey,
                    credentialID: response.id,
                    counter: credentialCounter,
                },
            });

            logger.info('WebAuthn authentication verified', { verified: verification.verified });
            return verification;
        } catch (error) {
            logger.error('WebAuthn authentication verification failed', error as Error);
            throw error;
        }
    }
}

export const webauthnService = new WebAuthnService();
