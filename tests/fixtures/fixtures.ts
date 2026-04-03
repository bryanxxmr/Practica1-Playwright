import { test as base, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { Logger } from '@utils/logger';

/**
 * Custom test fixtures for Playwright
 * Provides page objects and utilities to all tests
 * 
 * Usage in tests:
 * test('example', async ({ page, basePage }) => {
 *   await basePage.goto('/');
 * });
 */

type PageObjectFixtures = {
    basePage: BasePage;
    logger: typeof Logger;
};

export const test = base.extend<PageObjectFixtures>({
    logger: async ({ }, use) => {
        // Provide logger to all tests
        await use(Logger);
    },

    basePage: async ({ page }, use) => {
        // Provide base page object to all tests
        const basePage = new BasePage(page);
        Logger.info('BasePage fixture initialized');
        await use(basePage);
    },
});

export { expect } from '@playwright/test';
