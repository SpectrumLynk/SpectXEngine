/**
 * AI Agent Runtime
 * System.json: ai_system.agent_role = "governed_system_actor"
 */

import { logger } from '@web-kernel/core';
import { complianceValidator } from './governance/json-validator';
import { changeProtocol, type ChangeRequest } from './change-protocol';

export class AgentRuntime {
    async executeFileOperation(
        operation: 'read' | 'modify' | 'create' | 'delete',
        path: string,
        content?: string
    ): Promise<{ success: boolean; error?: string }> {
        // Check compliance
        if (!complianceValidator.canPerformOperation(operation)) {
            const error = `Operation '${operation}' is not allowed by system.json`;
            logger.error('File operation denied', undefined, { operation, path });
            return { success: false, error };
        }

        logger.info('File operation authorized', { operation, path });

        // In production, this would perform actual file operations
        return { success: true };
    }

    async proposeChange(request: ChangeRequest): Promise<{
        approved: boolean;
        violations: string[];
    }> {
        // Validate against change protocol
        const validation = changeProtocol.validateChangeRequest(request);

        if (!validation.valid) {
            // Rollback on violation
            await changeProtocol.rollback(request.changes);

            return {
                approved: false,
                violations: validation.violations,
            };
        }

        // Check for forbidden practices
        for (const practice of complianceValidator.getForbiddenPractices()) {
            if (request.description.toLowerCase().includes(practice.replace(/_/g, ' '))) {
                logger.error('Change request contains forbidden practice', undefined, {
                    practice,
                });
                return {
                    approved: false,
                    violations: [`Forbidden practice detected: ${practice}`],
                };
            }
        }

        logger.info('Change request approved', {
            filesChanged: request.changes.length,
        });

        return {
            approved: true,
            violations: [],
        };
    }

    generateReport(request: ChangeRequest): string {
        return changeProtocol.generateChangeReport(request);
    }
}

export const agentRuntime = new AgentRuntime();
