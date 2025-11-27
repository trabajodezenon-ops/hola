// script.js - Funcionalidad común para ambos tableros
import { generarGraficas } from './graficas.js';
import { verificarSesion } from './verificarSesion.js';
import { mostrarAlertaGotica } from './alertasGoticas.js';

// Configuración - misma URL que tu servidor Express
const API_BASE_URL = 'http://localhost:3000';

// Función para obtener datos directamente del servidor
const obtenerDatosAPI = async (fechaInicio, fechaTermino) => {
    try {
        // Convertir formato de fecha de YYYY-MM-DD a DD/MM/YYYY
        const formatDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        };

        const datos = {
            fechaInicio: formatDate(fechaInicio),
            fechaTermino: formatDate(fechaTermino),
        };

        console.log('Enviando datos al servidor:', datos);

        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        return resultado;

    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
};

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!verificarSesion()) {
        return;
    }
    
    const btnGenerar = document.getElementById('btnGenerar');
    
    // Solo agregar el event listener si estamos en tablero.php
    if (btnGenerar && window.location.pathname.includes('tablero.php')) {
        btnGenerar.addEventListener('click', async function() {
            // Obtener los valores de los campos
            const fechaInicio = document.getElementById('fechaInicio').value;
            const fechaTermino = document.getElementById('fechaTermino').value;
            
            // Validar campos vacíos
            if (!fechaInicio || !fechaTermino) {
                mostrarAlertaGotica('Por favor, complete todos los campos', 'error');
                return;
            }
            
            // Validar que la fecha de inicio sea anterior a la de término
            if (new Date(fechaInicio) > new Date(fechaTermino)) {
                mostrarAlertaGotica('La fecha de inicio debe ser anterior a la fecha de término', 'error');
                return;
            }
            
            // Si todo está bien, procesar los datos
            await procesarDatos(fechaInicio, fechaTermino);
        });
    }
});

// Función para procesar los datos (solo para tablero.php)
async function procesarDatos(fechaInicio, fechaTermino) {
    try {
        // Mostrar mensaje de carga
        const btnGenerar = document.getElementById('btnGenerar');
        const originalText = btnGenerar.innerHTML;
        btnGenerar.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Cargando...';
        btnGenerar.disabled = true;

        // Limpiar resultados anteriores
        mostrarCargando();

        // Llamar a la función directamente
        const resultado = await obtenerDatosAPI(fechaInicio, fechaTermino);

        // Restaurar botón
        btnGenerar.innerHTML = originalText;
        btnGenerar.disabled = false;

        if (resultado.success && resultado.data.Success) {
            console.log('Datos obtenidos:', resultado.data);
            
            // Generar las gráficas con los datos
            generarGraficas(resultado.data.Items);
            
            mostrarAlertaGotica('Datos cargados y gráficas generadas correctamente', 'success');
            
        } else {
            mostrarError(resultado.message || 'Error al obtener datos');
            mostrarAlertaGotica(resultado.message || 'Error al obtener datos', 'error');
        }

    } catch (error) {
        // Restaurar botón en caso de error
        const btnGenerar = document.getElementById('btnGenerar');
        btnGenerar.innerHTML = '<i class="bi bi-graph-up me-2"></i>Generar Gráficas';
        btnGenerar.disabled = false;
        
        console.error('Error:', error);
        mostrarError(error.message);
        mostrarAlertaGotica('Error al procesar los datos: ' + error.message, 'error');
    }
}

// Función para mostrar estado de carga
function mostrarCargando() {
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="alert alert-info text-center" style="background: linear-gradient(135deg, #1E3A5F 0%, #0A1F3F 100%); border: 2px solid #C1121F; color: #E0E0E0;">
            <div class="spinner-border spinner-border-sm me-2" role="status" style="color: #C1121F;">
                <span class="visually-hidden">Cargando...</span>
            </div>
            Cargando datos y generando gráficas...
        </div>
    `;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="alert alert-danger text-center" style="background: linear-gradient(135deg, #2a0000 0%, #1a0000 100%); border: 2px solid #8b0000; color: #e0d3c1;">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Error
            </h5>
            <p class="mb-0">${mensaje}</p>
        </div>
    `;
}