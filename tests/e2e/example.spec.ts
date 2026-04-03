import { test, expect } from '../fixtures/fixtures';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { TEST_CREDENTIALS } from '@config/testCredentials';

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

        // Ejecutar - usar credenciales desde .env en lugar de hardcodear
        await loginPage.loginSuccessfully(TEST_CREDENTIALS.username, TEST_CREDENTIALS.password);

        // Verificar
        const isAuthenticated = await dashboardPage.verifyAuthenticated();
        expect(isAuthenticated).toBe(true);
        logger.info('✅ Usuario autenticado exitosamente');
    });

    test('Debe mostrar error con contraseña inválida', async ({ logger }) => {
        logger.step('Escenario: Intentar login con contraseña incorrecta');

        // Preparar - credenciales desde .env + contraseña inválida
        const invalidPassword = 'wrongpassword';

        // Ejecutar & Verificar
        await loginPage.navigate();
        await loginPage.login(TEST_CREDENTIALS.username, invalidPassword);

        // Obtener mensaje de error usando método POM
        const errorMessage = await loginPage.getErrorMessage();

        expect(errorMessage).toBeTruthy();
        expect(errorMessage).toContain('Invalid');
        logger.info(`✅ Error mostrado correctamente: ${errorMessage}`);
    });

    test('Debe mostrar error con credenciales vacías', async ({ logger }) => {
        logger.step('Escenario: Intentar login con campos vacíos');

        // Ejecutar
        await loginPage.navigate();
        await loginPage.clickLoginButton();

        // Verificar - esperar validación mediante método POM en lugar de waitForTimeout
        await loginPage.waitForFormValidation();
        logger.info('✅ Validación del formulario funcionando (campos vacíos)');
    });

    test('Debe limpiar los campos del formulario', async ({ logger }) => {
        logger.step('Escenario: Limpiar campos del formulario de login');

        // Ejecutar
        await loginPage.navigate();
        await loginPage.enterUsername('testuser');
        await loginPage.enterPassword('testpass');
        await loginPage.clearForm();

        // Verificar - usar métodos POM en lugar de acceso directo
        const usernameValue = await loginPage.getUsernameValue();
        const passwordValue = await loginPage.getPasswordValue();

        expect(usernameValue).toBe('');
        expect(passwordValue).toBe('');
        logger.info('✅ Campos del formulario limpiados exitosamente');
    });

    test('Debe tener la URL correcta de la página de login', async ({ logger }) => {
        logger.step('Escenario: Verificar URL de la página de login');

        // Ejecutar
        await loginPage.navigate();
        const url = await loginPage.getPageUrl();

        // Verificar
        expect(url).toContain('/auth/login');
        logger.info(`✅ URL correcta: ${url}`);
    });

    test('Debe redirigir al dashboard después de un login exitoso', async ({ logger }) => {
        logger.step('Escenario: Verificar redirección al dashboard');

        // Ejecutar - usar credenciales desde .env
        await loginPage.loginSuccessfully(TEST_CREDENTIALS.username, TEST_CREDENTIALS.password);

        // Verificar
        const url = await dashboardPage.getCurrentUrl();
        expect(url).toContain('dashboard');
        logger.info(`✅ Redirigido al dashboard: ${url}`);
    });
});

/**
 * Notas de prueba:
 * 
 * CREDENCIALES:
 * - Las credenciales se cargan desde variables de entorno (process.env)
 * - Ver src/config/testCredentials.ts para más detalles
 * - Local: usar archivo .env (NUNCA commitar)
 * - CI/CD: usar GitHub Secrets → Settings → Actions
 * 
 * CONFIGURACIÓN:
 * - TEST_USERNAME: usuario de prueba (por defecto: admin)
 * - TEST_PASSWORD: contraseña de prueba (por defecto: admin123)
 * 
 * Mejores prácticas demostradas:
 * ✅ Separación de responsabilidades (tests vs page objects)
 * ✅ Nombres de tests descriptivos siguiendo el patrón "Debe"
 * ✅ Estructura Preparar-Ejecutar-Verificar
 * ✅ Logging en puntos clave para debugging
 * ✅ Page objects type-safe
 * ✅ Credenciales seguras via variables de entorno
 * ✅ Fixtures reutilizables
 * ✅ POM encapsulation 100% aplicado
 */