// verificarSesion.js
export function verificarSesion() {
    const usuario = sessionStorage.getItem('Usuario');
    const complot = sessionStorage.getItem('Complot');
    
    if (!usuario || complot !== 'OkayHome') {
        // Redirigir al login si no hay sesión válida
        window.location.href = 'index.php';
        return false;
    }
    return true;
}

export function cerrarSesion() {
    sessionStorage.removeItem('Usuario');
    sessionStorage.removeItem('Complot');
    window.location.href = 'index.php';
}