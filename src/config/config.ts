import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Central configuration management
 * Type-safe environment variable access
 */
export const config = {
    // Base URLs
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    apiBaseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    environment: (process.env.ENVIRONMENT || 'staging') as 'staging' | 'production',

    // Test Credentials
    testUser: {
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123',
    },

    // Playwright Options
    debug: process.env.DEBUG === 'true',
    headless: process.env.HEADLESS !== 'false',
    slowMo: parseInt(process.env.SLOW_MO || '0', 10),
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),

    // Logging
    logLevel: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',

    // Derived properties
    isCI: process.env.CI === 'true',
    isProd: process.env.ENVIRONMENT === 'production',
};

/**
 * Validate configuration on startup
 */
export function validateConfig(): void {
    const requiredVars = ['BASE_URL'];

    for (const variable of requiredVars) {
        if (!process.env[variable]) {
            console.warn(`Warning: ${variable} env var is not set, using default value`);
        }
    }
}
