// auth.js - Actualizar para usar las nuevas funciones de alertas
import { mostrarAlertaGotica, limpiarAlertasGoticas } from './alertasGoticas.js';

document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay parámetros de error en la URL al cargar la página
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        mostrarAlertaGotica(decodeURIComponent(error), 'error');
    }

    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const User = document.getElementById('User').value;
        const Paswor = document.getElementById('Paswor').value;
        
        // Limpiar mensajes anteriores
        limpiarAlertasGoticas();
        
        const usuarios = ["usuarios"];
        let error = "";

        // Validar campos vacíos
        if (!User || !Paswor) {
            error = "Favor de llenar los campos";
            mostrarAlertaGotica(error, 'error');
            return;
        }

        // Validar usuario existente
        if (!usuarios.includes(User)) {
            error = "Este usuario no tiene acceso a este sistema";
            mostrarAlertaGotica(error, 'error');
            return;
        }

        try {
            // Preparar datos para la petición
            const postdata = new URLSearchParams({
                'usuario': User,
                'clave': Paswor
            }).toString();

            // Hacer la petición POST - REEMPLAZA LA URL CON TU ENDPOINT REAL
            const response = await fetch('URL_VERIFICACIONJ', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: postdata
            });

            const respuesta = await response.json();
            const mensaje = respuesta.success;

            if (mensaje === "true") {
                // Guardar en sessionStorage
                sessionStorage.setItem('Usuario', User);
                sessionStorage.setItem('Complot', 'OkayHome');
                
                mostrarAlertaGotica('¡Acceso concedido! Redirigiendo...', 'success');
                
                // Redirigir al formulario después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'tablero.php';
                }, 2000);
            } else {
                error = "Contraseña incorrecta";
                sessionStorage.setItem('Complot', 'FALSE');
                mostrarAlertaGotica(error, 'error');
                
                // Redirigir a index.php con el error después de 3 segundos
                setTimeout(() => {
                    window.location.href = `index.php?error=${encodeURIComponent(error)}`;
                }, 3000);
            }

        } catch (error) {
            console.error('Error en la petición:', error);
            mostrarAlertaGotica('Error de conexión con el servidor', 'error');
        }
    });
});