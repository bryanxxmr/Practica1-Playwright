import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object that encapsulates common interactions
 * All page objects should extend this class
 * 
 * Principles:
 * - Locators are readonly properties (defined in subclasses)
 * - Methods represent user actions (not assertions)
 * - Type-safe: all methods have clear return types
 * - Error messages include context for debugging
 */
export class BasePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a URL relative to baseURL in playwright.config.ts
     * @param path - Path relative to baseURL (e.g., '/login', '/products')
     */
    async goto(path: string): Promise<void> {
        await this.page.goto(path);
    }

    /**
     * Fill a form field by label text (accessible name)
     * @param label - Label text visible to users
     * @param value - Text to enter in the field
     */
    async fillFieldByLabel(label: string, value: string): Promise<void> {
        const field = this.page.getByLabel(label);
        await field.fill(value);
    }

    /**
     * Click a button by accessible name (best practice)
     * @param buttonName - Button text or aria-label
     */
    async clickButton(buttonName: string): Promise<void> {
        await this.page.getByRole('button', { name: buttonName }).click();
    }

    /**
     * Fill a text input by placeholder
     * @param placeholder - Placeholder attribute
     * @param value - Text to enter
     */
    async fillFieldByPlaceholder(placeholder: string, value: string): Promise<void> {
        const field = this.page.getByPlaceholder(placeholder);
        await field.fill(value);
    }

    /**
     * Select an option from a dropdown by text
     * @param labelText - Dropdown label
     * @param optionText - Option text to select
     */
    async selectOption(labelText: string, optionText: string): Promise<void> {
        const select = this.page.getByLabel(labelText);
        await select.selectOption(optionText);
    }

    /**
     * Click an element by its visible text
     * @param text - Text to click
     */
    async clickByText(text: string): Promise<void> {
        await this.page.getByText(text).click();
    }

    /**
     * Wait for an element to be visible (user-facing timeout)
     * @param locator - Element to wait for
     * @param timeout - Max wait time in milliseconds (default: 5000)
     */
    async expectVisible(locator: Locator, timeout: number = 5000): Promise<void> {
        try {
            await locator.waitFor({ state: 'visible', timeout });
        } catch (error) {
            throw new Error(`Element not visible within ${timeout}ms: ${locator}`);
        }
    }

    /**
     * Wait for an element to be hidden
     * @param locator - Element to wait for
     * @param timeout - Max wait time in milliseconds (default: 5000)
     */
    async expectHidden(locator: Locator, timeout: number = 5000): Promise<void> {
        try {
            await locator.waitFor({ state: 'hidden', timeout });
        } catch (error) {
            throw new Error(`Element did not hide within ${timeout}ms: ${locator}`);
        }
    }

    /**
     * Wait for URL to match (useful after navigation)
     * @param urlPattern - URL pattern or exact URL
     * @param timeout - Max wait time in milliseconds (default: 5000)
     */
    async waitForURL(urlPattern: string | RegExp, timeout: number = 5000): Promise<void> {
        try {
            await this.page.waitForURL(urlPattern, { timeout });
        } catch (error) {
            throw new Error(`URL did not match pattern ${urlPattern} within ${timeout}ms`);
        }
    }

    /**
     * Get text content of an element
     * @param locator - Element to get text from
     * @returns Text content or null if not found
     */
    async getText(locator: Locator): Promise<string | null> {
        return await locator.textContent();
    }

    /**
     * Check if an element is visible
     * @param locator - Element to check
     * @returns true if visible, false otherwise
     */
    async isVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible();
    }

    /**
     * Check if an element is enabled (not disabled)
     * @param locator - Element to check
     * @returns true if enabled, false otherwise
     */
    async isEnabled(locator: Locator): Promise<boolean> {
        return await locator.isEnabled();
    }

    /**
     * Reload the current page
     */
    async reload(): Promise<void> {
        await this.page.reload();
    }

    /**
     * Take a screenshot for debugging
     * @param filename - Optional filename for the screenshot
     */
    async takeScreenshot(filename?: string): Promise<void> {
        await this.page.screenshot({
            path: filename || `screenshots/${new Date().getTime()}.png`,
        });
    }

    /**
     * Get attribute value from an element
     * @param locator - Element to get attribute from
     * @param attributeName - Attribute name (e.g., 'href', 'data-testid')
     * @returns Attribute value or null
     */
    async getAttribute(locator: Locator, attributeName: string): Promise<string | null> {
        return await locator.getAttribute(attributeName);
    }

    /**
     * Focus on an element
     * @param locator - Element to focus
     */
    async focus(locator: Locator): Promise<void> {
        await locator.focus();
    }

    /**
     * Hover over an element (useful for tooltips, dropdowns)
     * @param locator - Element to hover
     */
    async hover(locator: Locator): Promise<void> {
        await locator.hover();
    }

    /**
     * Clear a text field (select all and delete)
     * @param locator - Input field to clear
     */
    async clearField(locator: Locator): Promise<void> {
        await locator.clear();
    }

    /**
     * Wait for page load state
     * @param state - 'load', 'domcontentloaded', 'networkidle'
     */
    async waitForPageLoad(state: 'load' | 'domcontentloaded' | 'networkidle' = 'load'): Promise<void> {
        await this.page.waitForLoadState(state);
    }
}
