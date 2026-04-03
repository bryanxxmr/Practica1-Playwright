/**
 * Test Credentials Configuration
 * 
 * Credenciales para tests de OrangeHRM
 * Las credenciales se cargan desde variables de entorno para mantenerlas seguras:
 * - Nunca se exponen en el código fuente
 * - Pueden cambiar por entorno (local vs CI/CD)
 * - En GitHub Actions, usar secrets para valores reales
 * 
 * Configuración en diferentes entornos:
 * 
 * LOCAL:
 * - .env archivo (nunca commitar)
 * - TEST_USERNAME=admin
 * - TEST_PASSWORD=admin123
 * 
 * GITHUB ACTIONS (CI/CD):
 * - Settings → Secrets and variables → Actions
 * - TEST_USERNAME = (tu usuario)
 * - TEST_PASSWORD = (tu contraseña)
 */

export interface TestCredentials {
    username: string;
    password: string;
}

/**
 * Obtener credenciales de prueba desde variables de entorno
 * Si no están definidas, usa valores por defecto (solo para local/demo)
 */
export const getTestCredentials = (): TestCredentials => {
    return {
        username: process.env.TEST_USERNAME || 'admin',
        password: process.env.TEST_PASSWORD || 'admin123',
    };
};

// Exportar instancia singleton
export const TEST_CREDENTIALS = getTestCredentials();

/**
 * Función de validación (opcional - para verificar que las credenciales están configuradas)
 */
export const validateCredentials = (): boolean => {
    const creds = getTestCredentials();
    const isConfigured = process.env.TEST_USERNAME !== undefined &&
        process.env.TEST_PASSWORD !== undefined;

    if (isConfigured) {
        console.log('✅ Credenciales de test configuradas desde variables de entorno');
    } else {
        console.warn('⚠️  Usando credenciales por defecto (no configuradas en variables de entorno)');
    }

    return creds.username && creds.password ? true : false;
};
