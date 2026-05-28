import { createLogger, format, transports } from 'winston';
import * as Sentry from '@sentry/node';

// Create a logger instance only if we are in a Node.js environment
// to prevent crashes if this file is accidentally imported in Edge/Client
const isNodeEnv = typeof window === 'undefined' && typeof process !== 'undefined' && process.versions?.node;

export const logger = isNodeEnv ? createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        new transports.Console({
            format: format.simple(),
        }),
        new transports.File({
            filename: 'error.log',
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.json()
            ),
        }),
    ],
}) : {
    info: (...args: any[]) => console.log(...args),
    error: (...args: any[]) => console.error(...args),
    warn: (...args: any[]) => console.warn(...args),
};

if (isNodeEnv && process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 1.0,
    });
}

export function logError(error: Error, metadata?: any) {
    logger.error({ message: error.message, stack: error.stack, ...metadata });
    if (isNodeEnv && process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
    }
}

export function logAudit(actionType: string, actorId: string, targetType: string, targetId: string, metadata?: any) {
    logger.info({ action_type: actionType, actor_id: actorId, target_type: targetType, target_id: targetId, ...metadata });
}
