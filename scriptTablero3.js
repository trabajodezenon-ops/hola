// scriptTablero3.js - Funcionalidad específica para mapa.php
import { generarMapaInteractivo } from './graficasTablero3.js';
import { verificarSesion } from './verificarSesion.js';
import { mostrarAlertaGotica } from './alertasGoticas.js';
import { obtenerDatosAPI } from './apiService.js';

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!verificarSesion()) {
        return;
    }
    
    const btnGenerar = document.getElementById('btnGenerar');
    
    btnGenerar.addEventListener('click', async function() {
        await generarMapaConFiltro();
    });
});

// Función para generar mapa con el filtro actual
async function generarMapaConFiltro() {
    // Obtener los valores de los campos (SOLO FECHAS)
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
    await procesarDatosParaMapa(fechaInicio, fechaTermino);
}

// Función para procesar los datos para el mapa
async function procesarDatosParaMapa(fechaInicio, fechaTermino) {
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
            console.log('Datos obtenidos para mapa:', resultado.data);
            
            // Usar todos los datos (sin filtrar por tipo)
            const datosFiltrados = resultado.data.Items;
            
            // Generar el mapa con los datos
            generarMapaInteractivo(datosFiltrados);
            
            mostrarAlertaGotica('Mapa generado correctamente', 'success');
            
        } else {
            mostrarError(resultado.message || 'Error al obtener datos');
            mostrarAlertaGotica(resultado.message || 'Error al obtener datos', 'error');
        }

    } catch (error) {
        // Restaurar botón en caso de error
        const btnGenerar = document.getElementById('btnGenerar');
        btnGenerar.innerHTML = '<i class="bi bi-geo-alt me-1"></i>Generar Mapa';
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
            Cargando datos y generando mapa...
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

// Función global para generar mapa (para uso desde otros scripts)
window.generarMapaConFiltro = generarMapaConFiltro;