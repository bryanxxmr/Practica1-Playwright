import { config } from '@config/config';

/**
 * Simple logger utility for test output
 * Can be extended to integrate with Allure, custom dashboards, etc.
 */
export class Logger {
    static info(message: string, data?: unknown): void {
        if (['debug', 'info'].includes(config.logLevel)) {
            console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    static debug(message: string, data?: unknown): void {
        if (config.logLevel === 'debug') {
            console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    static warn(message: string, data?: unknown): void {
        if (['debug', 'info', 'warn'].includes(config.logLevel)) {
            console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
        }
    }

    static error(message: string, error?: unknown): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }

    static step(stepName: string): void {
        this.info(`\n→ ${stepName}`);
    }
}
