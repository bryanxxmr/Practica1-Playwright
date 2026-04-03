import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { Logger } from '../utils/logger';

/**
 * LoginPage - Página de Acceso OrangeHRM
 * 
 * Maneja todas las interacciones y validaciones relacionadas con el login
 * Sigue el patrón POM: locators como propiedades readonly, métodos como acciones del usuario
 */
export class LoginPage extends BasePage {
    // ===== Localizadores =====
    // Usando selectores CSS para el formulario de login de OrangeHRM (más confiables que placeholder)
    readonly usernameInput: Locator = this.page.locator('input[name="username"]');
    readonly passwordInput: Locator = this.page.locator('input[name="password"]');
    // Selector robusto: busca el botón basándose en su posición en el formulario
    readonly loginButton: Locator = this.page.locator('button:has-text("Login")');
    readonly errorMessage: Locator = this.page.locator('[role="alert"]');
    readonly pageTitle: Locator = this.page.locator('h5').first();
    async navigate(): Promise<void> {
        Logger.step('Navigate to OrangeHRM login page');
        await this.goto('/web/index.php/auth/login');
        await this.page.waitForLoadState('load');
        Logger.info('Login page loaded successfully');
    }

    /**
     * Enter username in the username field
     * @param username - User's username or email
     */
    async enterUsername(username: string): Promise<void> {
        Logger.step(`Enter username: ${username}`);
        await this.usernameInput.fill(username);
    }

    /**
     * Enter password in the password field
     * @param password - User's password
     */
    async enterPassword(password: string): Promise<void> {
        Logger.step('Enter password');
        await this.passwordInput.fill(password);
    }

    /**
     * Click the login button
     */
    async clickLoginButton(): Promise<void> {
        Logger.step('Click login button');
        await this.loginButton.click();
    }

    /**
     * Perform login with username and password
     * Does NOT wait for navigation (use separate method for that)
     * @param username - User's username
     * @param password - User's password
     */
    async login(username: string, password: string): Promise<void> {
        Logger.step('Perform login action');
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    /**
     * Complete login flow and wait for dashboard
     * @param username - User's username
     * @param password - User's password
     */
    async loginSuccessfully(username: string, password: string): Promise<void> {
        Logger.step('Complete login flow');
        await this.navigate();
        await this.login(username, password);

        // Wait for dashboard to load (redirect after successful login)
        Logger.step('Wait for dashboard navigation');
        await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
        Logger.info('Successfully logged in');
    }

    /**
     * Verify error message is displayed
     * @param expectedMessage - Expected error message text
     */
    async verifyErrorMessage(expectedMessage: string): Promise<void> {
        Logger.step(`Verify error message: "${expectedMessage}"`);
        await this.expectVisible(this.errorMessage);

        const actualMessage = await this.errorMessage.textContent();
        if (!actualMessage?.includes(expectedMessage)) {
            throw new Error(
                `Expected error message to contain "${expectedMessage}" but got "${actualMessage}"`
            );
        }
        Logger.info(`Error message verified: ${actualMessage}`);
    }

    /**
     * Check if login page is displayed (verify we're on login page)
     * Verifies page is on login URL instead of relying on DOM elements
     */
    async isDisplayed(): Promise<boolean> {
        Logger.step('Check if login page is displayed');
        // Estrategia más robusta: verificar la URL en lugar de elementos DOM
        const url = this.page.url();
        const isLoginPage = url.includes('/auth/login') && !url.includes('/dashboard');
        Logger.info(`Login page visible: ${isLoginPage} (URL: ${url})`);
        return isLoginPage;
    }

    /**
     * Login with invalid credentials and verify error
     * @param username - Invalid username
     * @param password - Invalid password
     * @param expectedErrorMessage - Expected error message
     */
    async loginWithInvalidCredentials(
        username: string,
        password: string,
        expectedErrorMessage: string = 'Invalid credentials'
    ): Promise<void> {
        Logger.step('Attempt login with invalid credentials');
        await this.navigate();
        await this.login(username, password);
        await this.verifyErrorMessage(expectedErrorMessage);
    }

    /**
     * Clear all form fields
     */
    async clearForm(): Promise<void> {
        Logger.step('Clear login form');
        await this.clearField(this.usernameInput);
        await this.clearField(this.passwordInput);
    }
}
