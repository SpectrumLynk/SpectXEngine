/**
 * Error codes for structured logging
 * System.json: observability.logging.error_codes_mandatory = true
 */

export enum ErrorCode {
    // System Errors (1000-1999)
    SYS_STARTUP_FAILED = 'SYS_1001',
    SYS_DB_CONNECTION_FAILED = 'SYS_1002',
    SYS_DB_MIGRATION_FAILED = 'SYS_1003',
    SYS_HEALTH_CHECK_FAILED = 'SYS_1004',
    SYS_GRACEFUL_SHUTDOWN_FAILED = 'SYS_1005',
    SYS_CONFIG_INVALID = 'SYS_1006',

    // Authentication Errors (2000-2999)
    AUTH_INVALID_CREDENTIALS = 'AUTH_2001',
    AUTH_TOKEN_EXPIRED = 'AUTH_2002',
    AUTH_TOKEN_INVALID = 'AUTH_2003',
    AUTH_MFA_REQUIRED = 'AUTH_2004',
    AUTH_MFA_INVALID = 'AUTH_2005',
    AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_2006',
    AUTH_SESSION_EXPIRED = 'AUTH_2007',
    AUTH_RATE_LIMIT_EXCEEDED = 'AUTH_2008',

    // Database Errors (3000-3999)
    DB_QUERY_FAILED = 'DB_3001',
    DB_TRANSACTION_FAILED = 'DB_3002',
    DB_CONSTRAINT_VIOLATION = 'DB_3003',
    DB_RECORD_NOT_FOUND = 'DB_3004',
    DB_DUPLICATE_ENTRY = 'DB_3005',

    // Validation Errors (4000-4999)
    VAL_INVALID_INPUT = 'VAL_4001',
    VAL_MISSING_FIELD = 'VAL_4002',
    VAL_INVALID_FORMAT = 'VAL_4003',
    VAL_OUT_OF_RANGE = 'VAL_4004',

    // API Errors (5000-5999)
    API_ENDPOINT_NOT_FOUND = 'API_5001',
    API_METHOD_NOT_ALLOWED = 'API_5002',
    API_REQUEST_TIMEOUT = 'API_5003',
    API_PAYLOAD_TOO_LARGE = 'API_5004',

    // AI/Governance Errors (6000-6999)
    AI_COMPLIANCE_VIOLATION = 'AI_6001',
    AI_FORBIDDEN_PRACTICE = 'AI_6002',
    AI_ARCHITECTURE_MUTATION = 'AI_6003',
    AI_CHANGE_PROTOCOL_VIOLATION = 'AI_6004',

    // Business Logic Errors (7000-7999)
    BIZ_OPERATION_FAILED = 'BIZ_7001',
    BIZ_INVALID_STATE = 'BIZ_7002',

    // External Service Errors (8000-8999)
    EXT_SERVICE_UNAVAILABLE = 'EXT_8001',
    EXT_SERVICE_TIMEOUT = 'EXT_8002',

    // Unknown/Generic
    UNKNOWN_ERROR = 'ERR_9999',
}

export interface ErrorDetails {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    userId?: string;
    requestId?: string;
    correlationId?: string;
}

export function createError(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
): ErrorDetails {
    return {
        code,
        message,
        details,
    };
}
