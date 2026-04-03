---
name: playwright-page-object-model
description: "Use when designing or refactoring Page Object Model (POM) architectures for Playwright. Covers abstraction layers, locator strategy, test data separation, inheritance hierarchies, and SOLID principles."
---

# Playwright Page Object Model (POM) Mastery

This skill guides you through architecting scalable, maintainable Page Object Models for Playwright test suites using TypeScript, Python, or JavaScript.

## When to Use This Skill

- Designing a new test framework from scratch with POM structure
- Refactoring existing tests into Page Object layers
- Building reusable page abstractions for complex multi-page workflows
- Implementing base page classes with common interactions
- Separating test logic from UI locator logic
- Creating fixtures and test data factories for DRY tests
- Establishing team conventions for page object naming and organization
- Handling dynamic content, modals, navigation flows with POM

## Key Principles

1. **Separation of Concerns** — Page Objects encapsulate locators and interactions; tests focus on behavior
2. **Single Responsibility** — One page object = one logical page or component
3. **No Test Logic in PO** — Page objects return data; assertions stay in tests
4. **Explicit Locators** — `getByRole()`, `getByTestId()` preferred over CSS/XPath
5. **Reusable Methods** — Common interactions (login, fill form, click button) are public methods
6. **Type Safety** — Use TypeScript interfaces or Python type hints for method signatures
7. **Inheritance Over Duplication** — Base page classes for shared functionality
8. **Builder Pattern** — For complex multi-step flows (checkout, registration)

## TypeScript + Playwright Example

### Base Page Object
```typescript
import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL relative to baseURL in playwright.config.ts
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Fill and submit a form field by label
   */
  async fillFieldByLabel(label: string, value: string): Promise<void> {
    const field = this.page.getByLabel(label);
    await field.fill(value);
  }

  /**
   * Click a button by accessible name
   */
  async clickButton(buttonName: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonName }).click();
  }

  /**
   * Wait for locator and assert visibility
   */
  async expectVisible(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for locator to be hidden
   */
  async expectHidden(locator: Locator, timeout: number = 5000): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }
}
```

### Specific Page Object (Login)
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator = this.page.getByLabel('Email');
  readonly passwordInput: Locator = this.page.getByLabel('Password');
  readonly loginButton: Locator = this.page.getByRole('button', { name: /sign in/i });
  readonly errorMessage: Locator = this.page.locator('[role="alert"]');

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto('/login');
  }

  /**
   * Log in with email and password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Verify login error is displayed
   */
  async expectLoginError(expectedMessage: string): Promise<void> {
    await this.expectVisible(this.errorMessage);
    const message = await this.errorMessage.textContent();
    if (!message?.includes(expectedMessage)) {
      throw new Error(`Expected error "${expectedMessage}" but got "${message}"`);
    }
  }

  /**
   * Complete login flow with validation
   */
  async loginSuccessfully(email: string, password: string): Promise<void> {
    await this.navigate();
    await this.login(email, password);
    // After login, dashboard page should load
    await this.page.waitForURL('**/dashboard');
  }
}
```

### Test Using Page Object
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should successfully log in with valid credentials', async () => {
    await loginPage.loginSuccessfully('user@example.com', 'password123');
    const greeting = await dashboardPage.getWelcomeMessage();
    expect(greeting).toContain('Welcome');
  });

  test('should show error on invalid credentials', async () => {
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'wrongpass');
    await loginPage.expectLoginError('Invalid credentials');
  });
});
```

## Python + pytest Example

### Base Page
```python
from typing import Optional
from playwright.async_api import Page, Locator

class BasePage:
    def __init__(self, page: Page):
        self.page = page

    async def goto(self, path: str) -> None:
        """Navigate to a path relative to baseURL"""
        await self.page.goto(path)

    async def fill_field_by_label(self, label: str, value: str) -> None:
        """Find and fill a field by label text"""
        field = self.page.get_by_label(label)
        await field.fill(value)

    async def click_button(self, button_name: str) -> None:
        """Click button by accessible name"""
        await self.page.get_by_role("button", name=button_name).click()

    async def expect_visible(self, locator: Locator, timeout: int = 5000) -> None:
        """Wait for element to be visible"""
        await locator.wait_for(state="visible", timeout=timeout)

    async def expect_hidden(self, locator: Locator, timeout: int = 5000) -> None:
        """Wait for element to be hidden"""
        await locator.wait_for(state="hidden", timeout=timeout)
```

### Specific Page
```python
from playwright.async_api import Page, Locator
from pages.base_page import BasePage

class LoginPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)
        self.email_input: Locator = page.get_by_label("Email")
        self.password_input: Locator = page.get_by_label("Password")
        self.login_button: Locator = page.get_by_role("button", name="Sign in")
        self.error_message: Locator = page.locator('[role="alert"]')

    async def navigate(self) -> None:
        """Go to login page"""
        await self.goto("/login")

    async def login(self, email: str, password: str) -> None:
        """Fill and submit login form"""
        await self.email_input.fill(email)
        await self.password_input.fill(password)
        await self.login_button.click()

    async def login_successfully(self, email: str, password: str) -> None:
        """Complete login flow with wait for navigation"""
        await self.navigate()
        await self.login(email, password)
        await self.page.wait_for_url("**/dashboard")
```

### pytest Test
```python
import pytest
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage

@pytest.mark.asyncio
async def test_login_successfully(page):
    login_page = LoginPage(page)
    dashboard_page = DashboardPage(page)
    
    await login_page.login_successfully("user@example.com", "password123")
    greeting = await dashboard_page.get_welcome_message()
    assert "Welcome" in greeting

@pytest.mark.asyncio
async def test_login_with_invalid_credentials(page):
    login_page = LoginPage(page)
    
    await login_page.navigate()
    await login_page.login("user@example.com", "wrongpass")
    
    await login_page.expect_visible(login_page.error_message)
    error_text = await login_page.error_message.text_content()
    assert "Invalid credentials" in error_text
```

## Project Structure

```
tests/
├── pages/
│   ├── __init__.py
│   ├── base_page.ts           # Base class for all pages
│   ├── login_page.ts          # Login-specific PO
│   ├── dashboard_page.ts      # Dashboard-specific PO
│   └── checkout_page.ts       # Multi-step checkout PO
│
├── fixtures/
│   ├── test_data.ts           # Test data constants, factories
│   └── auth_fixtures.ts       # Pre-filled login state, storage snapshots
│
├── e2e/
│   ├── auth.spec.ts           # Authentication test suite
│   ├── checkout.spec.ts       # End-to-end checkout tests
│   └── user_profile.spec.ts   # User settings tests
│
└── playwright.config.ts       # Config with baseURL, projects, timeout
```

## Advanced Patterns

### Builder Pattern for Complex Flows
```typescript
export class CheckoutPageBuilder {
  constructor(private page: Page) {}

  async selectProduct(productName: string): Promise<this> {
    await this.page.getByText(productName).click();
    return this;
  }

  async setQuantity(qty: number): Promise<this> {
    const input = this.page.getByLabel('Quantity');
    await input.clear();
    await input.fill(String(qty));
    return this;
  }

  async addToCart(): Promise<this> {
    await this.page.getByRole('button', { name: 'Add to Cart' }).click();
    return this;
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }

  // Usage in test:
  // await new CheckoutPageBuilder(page)
  //   .selectProduct('Laptop')
  //   .setQuantity(2)
  //   .addToCart()
  //   .proceedToCheckout();
}
```

### Component Page Objects
For reusable UI components (modal, navbar, sidebar):
```typescript
export class ModalComponent extends BasePage {
  readonly title: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page, modalSelector: string = '[role="dialog"]') {
    super(page);
    const modal = page.locator(modalSelector);
    this.title = modal.locator('h2');
    this.closeButton = modal.getByRole('button', { name: 'Close' });
    this.confirmButton = modal.getByRole('button', { name: 'Confirm' });
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }
}
```

## SOLID Principles Applied

1. **S** (Single Responsibility): Each PO handles one page/component
2. **O** (Open/Closed): BasePage is open for extension, closed for modification
3. **L** (Liskov Substitution): Child POs extend BasePage without breaking contracts
4. **I** (Interface Segregation): Methods in PO are cohesive (login, not login + checkout)
5. **D** (Dependency Inversion): POs depend on BasePage abstraction, tests depend on POs

## Best Practices Checklist

- ✓ Use explicit locators (`getByRole`, `getByTestId`, `getByLabel`)
- ✓ Keep locators as readonly class properties
- ✓ Return data from PO methods; assertions in tests
- ✓ Use async/await everywhere; no synchronous waits
- ✓ Create base page for common methods (goto, click, fill)
- ✓ One PO per logical page or component
- ✓ Name methods as user actions (login, submit, navigate)
- ✓ Use type hints (TypeScript) or Python type annotations
- ✓ Avoid CSS/XPath in tests; locator logic stays in PO
- ✓ Error messages in PO include context (field name, expected value)

---

**Next Steps**: Combine POM with CI/CD workflows, add visual regression testing, or implement test data factories.
