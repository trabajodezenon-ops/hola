// verificarSesion.js - MEJORADO
const TIEMPO_MAXIMO_SESION = 2 * 60 * 60 * 1000; // 2 horas

export function verificarSesion() {
    const usuario = sessionStorage.getItem('Usuario');
    const complot = sessionStorage.getItem('Complot');
    const loginTime = sessionStorage.getItem('LoginTime');
    
    // Verificar existencia de datos
    if (!usuario || complot !== 'OkayHome') {
        redirigirALogin();
        return false;
    }
    
    // Verificar timeout de sesión
    if (loginTime) {
        const tiempoTranscurrido = Date.now() - parseInt(loginTime);
        if (tiempoTranscurrido > TIEMPO_MAXIMO_SESION) {
            sessionStorage.clear();
            mostrarAlertaGotica('Sesión expirada', 'error');
            redirigirALogin();
            return false;
        }
        
        // Actualizar tiempo de sesión (opcional: renovar automáticamente)
        sessionStorage.setItem('LoginTime', Date.now().toString());
    }
    
    return true;
}

export function cerrarSesion() {
    sessionStorage.removeItem('Usuario');
    sessionStorage.removeItem('Complot');
    sessionStorage.removeItem('LoginTime');
    window.location.href = 'index.php';
}

function redirigirALogin() {
    // Usar replace para evitar que el usuario regrese con el botón back
    window.location.replace('index.php');
}

// Función para verificar sesión periódicamente
export function iniciarMonitorSesion() {
    setInterval(() => {
        if (!verificarSesion()) {
            mostrarAlertaGotica('Su sesión ha expirado', 'error');
        }
    }, 60000); // Verificar cada minuto
}