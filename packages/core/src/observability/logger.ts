/**
 * Structured logger implementation
 * Complies with system.json observability requirements
 * - error_codes_mandatory: true
 * - emoji_usage: forbidden
 * - format: json_only
 */

import { ErrorCode } from '../errors/error-codes';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface LogContext {
    service?: string;
    userId?: string;
    requestId?: string;
    correlationId?: string;
    errorCode?: ErrorCode;
    [key: string]: unknown;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    error?: string;
    stack?: string;
}

class Logger {
    private context: LogContext = {};

    constructor(defaultContext?: LogContext) {
        if (defaultContext) {
            this.context = defaultContext;
        }
    }

    setContext(context: LogContext): void {
        this.context = { ...this.context, ...context };
    }

    clearContext(): void {
        this.context = {};
    }

    private log(
        level: LogLevel,
        message: string,
        additionalContext?: LogContext,
        error?: Error
    ): void {
        // Enforce no emojis (system.json: emoji_usage = "forbidden")
        const cleanMessage = this.removeEmojis(message);

        const entry: LogEntry = {
            level,
            message: cleanMessage,
            timestamp: new Date().toISOString(),
            context: { ...this.context, ...additionalContext },
        };

        if (error) {
            entry.error = error.message;
            entry.stack = error.stack;
        }

        // Validate error code presence for error/warn levels
        if (
            (level === LogLevel.ERROR || level === LogLevel.WARN) &&
            !entry.context?.errorCode
        ) {
            console.warn(
                'Warning: Error code missing for error/warn log. This violates system.json rules.'
            );
        }

        // Filter sensitive data before logging
        const sanitized = this.sanitize(entry);

        // Output to appropriate stream (JSON only)
        const output = JSON.stringify(sanitized);
        if (level === LogLevel.ERROR) {
            console.error(output);
        } else if (level === LogLevel.WARN) {
            console.warn(output);
        } else {
            // eslint-disable-next-line no-console
            console.log(output);
        }
    }

    private removeEmojis(text: string): string {
        // Remove all emoji characters
        return text.replace(
            /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
            ''
        );
    }

    private sanitize(entry: LogEntry): LogEntry {
        // Remove sensitive fields (passwords, tokens, secrets)
        const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];
        const sanitized = { ...entry };

        if (sanitized.context) {
            sensitiveKeys.forEach((key) => {
                if (key in sanitized.context!) {
                    delete sanitized.context![key];
                }
            });
        }

        return sanitized;
    }

    debug(message: string, context?: LogContext): void {
        this.log(LogLevel.DEBUG, message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log(LogLevel.INFO, message, context);
    }

    warn(message: string, errorCode: ErrorCode, context?: LogContext): void {
        this.log(LogLevel.WARN, message, { ...context, errorCode });
    }

    error(message: string, errorCode: ErrorCode, error?: Error, context?: LogContext): void {
        this.log(LogLevel.ERROR, message, { ...context, errorCode }, error);
    }

    child(context: LogContext): Logger {
        return new Logger({ ...this.context, ...context });
    }
}

// Global logger instance
export const logger = new Logger({ service: 'web-kernel' });

export function createLogger(context: LogContext): Logger {
    return new Logger(context);
}
