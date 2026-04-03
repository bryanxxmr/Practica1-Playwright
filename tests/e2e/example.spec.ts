import { test, expect } from '../fixtures/fixtures';
import { Logger } from '@utils/logger';

/**
 * Example test suite demonstrating:
 * - Using custom fixtures (basePage, logger)
 * - Page Object Model pattern
 * - Clear test organization
 * - Meaningful assertions with error context
 */

test.describe('Example Test Suite', () => {
    test.beforeEach(async ({ basePage, logger }) => {
        logger.step('Navigate to application');
        await basePage.goto('/');
    });

    test('should load the homepage successfully', async ({ page, basePage, logger }) => {
        logger.step('Verify page title');
        const title = await page.title();
        expect(title).toBeTruthy();
        logger.info(`Page title: ${title}`);
    });

    test('should verify page is not empty', async ({ page, basePage, logger }) => {
        logger.step('Check page content');
        const bodyText = await page.locator('body').textContent();
        expect(bodyText).not.toBeNull();
        logger.info('Page loaded with content');
    });

    test('should wait for page load state', async ({ page, basePage, logger }) => {
        logger.step('Wait for page to be fully loaded');
        await basePage.waitForPageLoad('load');

        const isDisplayed = await basePage.isVisible(page.locator('body'));
        expect(isDisplayed).toBe(true);
        logger.info('Page is fully loaded and visible');
    });
});

/**
 * Next steps:
 * 1. Create specific Page Objects (LoginPage, DashboardPage, etc.)
 * 2. Add more test cases for your application workflows
 * 3. Use Logger.step() to create readable test reports
 * 4. Keep test logic separate from Page Object logic
 * 5. Use meaningful test names that describe behavior, not implementation
 */
