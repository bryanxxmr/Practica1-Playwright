import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/logger';

/**
 * DashboardPage - OrangeHRM Dashboard/Home
 * 
 * Represents the main page after successful login
 * Verifies user is authenticated and can access dashboard features
 */
export class DashboardPage extends BasePage {
    // ===== Locators =====
    readonly mainHeading: Locator = this.page.locator('[role="heading"]').first();
    readonly userMenuButton: Locator = this.page.locator('[role="button"]').filter({ hasText: /profile|logout/i }).first();
    readonly logoutButton: Locator = this.page.getByRole('link', { name: /logout/i });
    readonly dashboardContent: Locator = this.page.locator('[role="main"]');

    constructor(page: Page) {
        super(page);
    }

    /**
     * Check if dashboard is loaded (verify we're logged in)
     */
    async isLoaded(): Promise<boolean> {
        Logger.step('Verify dashboard is loaded');
        try {
            await this.dashboardContent.waitFor({ state: 'visible', timeout: 5000 });
            Logger.info('Dashboard loaded successfully');
            return true;
        } catch {
            Logger.warn('Dashboard not loaded');
            return false;
        }
    }

    /**
     * Get the main heading text (usually username or "Dashboard")
     */
    async getMainHeadingText(): Promise<string | null> {
        Logger.step('Get main heading text');
        const text = await this.getText(this.mainHeading);
        Logger.info(`Main heading: ${text}`);
        return text;
    }

    /**
     * Click on user menu (usually top-right profile icon/name)
     */
    async clickUserMenu(): Promise<void> {
        Logger.step('Click user menu');
        await this.userMenuButton.click();
    }

    /**
     * Logout by clicking logout button
     */
    async logout(): Promise<void> {
        Logger.step('Perform logout');
        await this.clickUserMenu();
        await this.logoutButton.click();

        // Wait to be redirected to login page
        Logger.step('Wait for redirect to login page');
        await this.page.waitForURL('**/auth/login', { timeout: 5000 });
        Logger.info('Successfully logged out');
    }

    /**
     * Get URL of current dashboard page
     */
    async getCurrentUrl(): Promise<string> {
        Logger.step('Get current dashboard URL');
        const url = this.page.url();
        Logger.info(`Current URL: ${url}`);
        return url;
    }

    /**
     * Verify user is authenticated (by checking dashboard content is visible)
     */
    async verifyAuthenticated(): Promise<boolean> {
        Logger.step('Verify user is authenticated');
        const isLoaded = await this.isLoaded();
        if (!isLoaded) {
            throw new Error('User is not authenticated - dashboard not loaded');
        }
        Logger.info('User is authenticated');
        return true;
    }
}
