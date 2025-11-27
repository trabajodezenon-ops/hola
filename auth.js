// auth.js - MEJORADO
import { mostrarAlertaGotica, limpiarAlertasGoticas } from './alertasGoticas.js';

// Lista de usuarios válidos (puedes expandir esta lista)
const USUARIOS_VALIDOS = ["USUARIOS"];

// Función para validar fortaleza de contraseña
function validarFortalezaContrasena(contrasena) {
    if (contrasena.length < 6) {
        return "La contraseña debe tener al menos 6 caracteres";
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(contrasena)) {
        return "La contraseña debe contener letras y números";
    }
    return null;
}

// Función para sanitizar entrada
function sanitizarEntrada(texto) {
    return texto.toString().trim().replace(/[<>]/g, '');
}

// Función para limitar intentos de login
let intentosLogin = 0;
const MAX_INTENTOS = 5;
const TIEMPO_BLOQUEO = 15 * 60 * 1000; // 15 minutos
let tiempoBloqueo = 0;

function estaBloqueado() {
    return intentosLogin >= MAX_INTENTOS && Date.now() < tiempoBloqueo;
}

function reiniciarIntentos() {
    intentosLogin = 0;
    tiempoBloqueo = 0;
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Verificar si está bloqueado
    if (estaBloqueado()) {
        const tiempoRestante = Math.ceil((tiempoBloqueo - Date.now()) / 60000);
        mostrarAlertaGotica(`Demasiados intentos fallidos. Espere ${tiempoRestante} minutos.`, 'error');
        loginForm.style.display = 'none';
        return;
    }

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        let User = document.getElementById('User').value;
        let Paswor = document.getElementById('Paswor').value;
        
        // Sanitizar entradas
        User = sanitizarEntrada(User);
        Paswor = sanitizarEntrada(Paswor);
        
        // Limpiar mensajes anteriores
        limpiarAlertasGoticas();
        
        let error = "";

        // Validar campos vacíos
        if (!User || !Paswor) {
            error = "Favor de llenar todos los campos";
            mostrarAlertaGotica(error, 'error');
            return;
        }

        // Validar usuario existente
        if (!USUARIOS_VALIDOS.includes(User)) {
            intentosLogin++;
            error = "Credenciales incorrectas";
            mostrarAlertaGotica(error, 'error');
            
            if (intentosLogin >= MAX_INTENTOS) {
                tiempoBloqueo = Date.now() + TIEMPO_BLOQUEO;
                mostrarAlertaGotica(`Demasiados intentos. Sistema bloqueado por 15 minutos.`, 'error');
                loginForm.style.display = 'none';
            }
            return;
        }

        // Validar fortaleza de contraseña
        const errorContrasena = validarFortalezaContrasena(Paswor);
        if (errorContrasena) {
            intentosLogin++;
            mostrarAlertaGotica(errorContrasena, 'error');
            return;
        }

        try {
            // Preparar datos para la petición
            const postdata = new URLSearchParams({
                'usuario': User,
                'clave': Paswor
            }).toString();

            // Timeout para la petición
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

            const response = await fetch('URL', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: postdata,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const respuesta = await response.json();
            const mensaje = respuesta.success;

            if (mensaje === "true") {
                // Reiniciar intentos en éxito
                reiniciarIntentos();
                
                // Guardar en sessionStorage
                sessionStorage.setItem('Usuario', User);
                sessionStorage.setItem('Complot', 'OkayHome');
                sessionStorage.setItem('LoginTime', Date.now().toString());
                
                mostrarAlertaGotica('¡Acceso concedido! Redirigiendo...', 'success');
                
                // Redirigir al formulario después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'tablero.php';
                }, 2000);
            } else {
                intentosLogin++;
                error = "Credenciales incorrectas";
                sessionStorage.setItem('Complot', 'FALSE');
                mostrarAlertaGotica(error, 'error');
                
                if (intentosLogin >= MAX_INTENTOS) {
                    tiempoBloqueo = Date.now() + TIEMPO_BLOQUEO;
                    mostrarAlertaGotica(`Demasiados intentos. Sistema bloqueado por 15 minutos.`, 'error');
                    loginForm.style.display = 'none';
                }
            }

        } catch (error) {
            intentosLogin++;
            if (error.name === 'AbortError') {
                mostrarAlertaGotica('Timeout: El servidor no respondió', 'error');
            } else {
                console.error('Error en la petición:', error);
                mostrarAlertaGotica('Error de conexión con el servidor', 'error');
            }
        }
    });
});