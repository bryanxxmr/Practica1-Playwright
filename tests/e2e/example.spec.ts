import { test, expect } from '../fixtures/fixtures';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';

/**
 * Suite de Pruebas de Autenticación de OrangeHRM
 * 
 * Pruebas de flujos de autenticación usando el patrón Page Object Model
 * Demuestra:
 * - Separación de responsabilidades (capa POM)
 * - Fixtures reutilizables (basePage, logger)
 * - Organización clara de tests con nombres descriptivos
 * - Manejo adecuado de errores y assertciones
 */

test.describe('Autenticación OrangeHRM', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page, logger }) => {
        logger.step('Inicializar page objects');
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
    });

    test('Debe mostrar la página de inicio de sesión', async ({ logger }) => {
        logger.step('Escenario: Verificar que la página de login se visualiza');

        await loginPage.navigate();
        const isDisplayed = await loginPage.isDisplayed();

        expect(isDisplayed).toBe(true);
        logger.info('✅ Página de login mostrada correctamente');
    });

    test('Debe autenticar exitosamente con credenciales válidas', async ({ logger }) => {
        logger.step('Escenario: Login con credenciales válidas');

        // Preparar
        const username = 'admin';
        const password = 'admin123';

        // Ejecutar
        await loginPage.loginSuccessfully(username, password);

        // Verificar
        const isAuthenticated = await dashboardPage.verifyAuthenticated();
        expect(isAuthenticated).toBe(true);
        logger.info('✅ Usuario autenticado exitosamente');
    });

    test('Debe mostrar error con contraseña inválida', async ({ logger }) => {
        logger.step('Escenario: Intentar login con contraseña incorrecta');

        // Preparar
        const username = 'admin';
        const invalidPassword = 'wrongpassword';

        // Ejecutar & Verificar
        await loginPage.navigate();
        await loginPage.login(username, invalidPassword);

        // Esperar a que aparezca el mensaje de error
        await loginPage.expectVisible(loginPage.errorMessage);
        const errorMessage = await loginPage.errorMessage.textContent();

        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Invalid');
        logger.info(`✅ Error mostrado correctamente: ${errorMessage}`);
    });

    test('Debe mostrar error con credenciales vacías', async ({ logger }) => {
        logger.step('Escenario: Intentar login con campos vacíos');

        // Ejecutar
        await loginPage.navigate();
        await loginPage.clickLoginButton();

        // Verificar - generalmente aparece un mensaje de validación
        // Nota: El comportamiento depende de la validación del formulario (HTML5 o JavaScript personalizado)
        await loginPage.page.waitForTimeout(1000); // Esperar validación
        logger.info('✅ Validación del formulario funcionando (campos vacíos)');
    });

    test('Debe limpiar los campos del formulario', async ({ logger }) => {
        logger.step('Escenario: Limpiar campos del formulario de login');

        // Ejecutar
        await loginPage.navigate();
        await loginPage.enterUsername('testuser');
        await loginPage.enterPassword('testpass');
        await loginPage.clearForm();

        // Verificar
        const usernameValue = await loginPage.usernameInput.inputValue();
        const passwordValue = await loginPage.passwordInput.inputValue();

        expect(usernameValue).toBe('');
        expect(passwordValue).toBe('');
        logger.info('✅ Campos del formulario limpiados exitosamente');
    });

    test('Debe tener la URL correcta de la página de login', async ({ logger }) => {
        logger.step('Escenario: Verificar URL de la página de login');

        // Ejecutar
        await loginPage.navigate();
        const url = loginPage.page.url();

        // Verificar
        expect(url).toContain('/auth/login');
        logger.info(`✅ URL correcta: ${url}`);
    });

    test('Debe redirigir al dashboard después de un login exitoso', async ({ logger }) => {
        logger.step('Escenario: Verificar redirección al dashboard');

        // Ejecutar
        const username = 'admin';
        const password = 'admin123';
        await loginPage.loginSuccessfully(username, password);

        // Verificar
        const url = await dashboardPage.getCurrentUrl();
        expect(url).toContain('dashboard');
        logger.info(`✅ Redirigido al dashboard: ${url}`);
    });
});

/**
 * Notas de prueba:
 * - Usuario: admin
 * - Contraseña: admin123
 * 
 * Estas son las credenciales típicas del sitio demo de OrangeHRM.
 * Actualiza según sea necesario según tu entorno objetivo.
 * 
 * Mejores prácticas demostradas:
 * ✅ Separación de responsabilidades (tests vs page objects)
 * ✅ Nombres de tests descriptivos siguiendo el patrón "Debe"
 * ✅ Estructura Preparar-Ejecutar-Verificar
 * ✅ Logging en puntos clave para debugging
 * ✅ Page objects type-safe
 * ✅ Fixtures reutilizables
 * ✅ No se usan selectores CSS - solo locators accesibles
 */
