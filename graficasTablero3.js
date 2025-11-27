// graficasTablero3.js - Mapa interactivo para mapa.php

// Variables globales para el mapa
let map;
let markersCluster;
let heatLayer;
let currentMarkers = [];
let currentData = [];

// Coordenadas por defecto (León, Guanajuato)
const DEFAULT_CENTER = [21.125, -101.686];
const DEFAULT_ZOOM = 12;

// Función principal que debe ser exportada
export function generarMapaInteractivo(items, filtroSeleccionado) {
    console.log('=== GENERAR MAPA INTERACTIVO INICIADO ===');
    console.log('Items recibidos:', items);
    
    // Validar que Leaflet esté disponible
    if (typeof L === 'undefined') {
        console.error('Leaflet no está cargado correctamente');
        mostrarError('Error: Leaflet no se cargó correctamente. Verifica tu conexión a internet.');
        return;
    }

    // Filtrar items que tienen coordenadas válidas (no vacías, no cero, y numéricas)
    const itemsConCoordenadasValidas = items.filter(item => {
        const lat = item.latitud_r;
        const lng = item.longitud_r;
        
        // Verificar que no estén vacíos, no sean cero, y sean números válidos
        return lat && 
               lng && 
               lat !== '0' && 
               lng !== '0' && 
               lat !== 0 && 
               lng !== 0 &&
               !isNaN(parseFloat(lat)) && 
               !isNaN(parseFloat(lng)) &&
               parseFloat(lat) !== 0 && 
               parseFloat(lng) !== 0;
    });

    console.log('Items con coordenadas válidas:', itemsConCoordenadasValidas);
    console.log('Items filtrados (sin coordenadas válidas):', items.length - itemsConCoordenadasValidas.length);

    // Validar que hay datos con coordenadas válidas
    if (!itemsConCoordenadasValidas || itemsConCoordenadasValidas.length === 0) {
        mostrarMensajeSinDatos(filtroSeleccionado);
        return;
    }

    try {
        // Procesar datos para el mapa (usando solo los items con coordenadas válidas)
        const datosProcesados = procesarDatosParaMapa(itemsConCoordenadasValidas);
        
        // Generar contenedor para el mapa
        const resultadoDiv = document.getElementById('resultados');
        const tituloFiltro = filtroSeleccionado ? ` - ${filtroSeleccionado}` : '';
        
        resultadoDiv.innerHTML = `
            <div class="row">
                <div class="col-12 mb-3">
                    <div class="map-stats">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <div class="stat-number" id="totalIncidentes">${items.length}</div>
                                    <div class="stat-label">Total Reportes</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <div class="stat-number" id="incidentesMapeados">${datosProcesados.incidentesMapeados}</div>
                                    <div class="stat-label">Con Coordenadas Válidas</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <div class="stat-number" id="zonasCriticas">${datosProcesados.zonasCriticas}</div>
                                    <div class="stat-label">Zonas Críticas</div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="stat-card">
                                    <div class="stat-number" id="avgDensidad">${datosProcesados.avgDensidad}</div>
                                    <div class="stat-label">Densidad Promedio</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="map-filters">
                        <div class="row">
                            <div class="col-md-8">
                                <h6 class="text-white mb-3">
                                    <i class="bi bi-sliders me-2"></i>Controles del Mapa
                                </h6>
                                <div class="btn-group" role="group">
                                    <button type="button" class="heatmap-toggle active" id="btnModoNormal">
                                        <i class="bi bi-geo me-1"></i>Modo Normal
                                    </button>
                                    <button type="button" class="heatmap-toggle" id="btnModoCalor">
                                        <i class="bi bi-thermometer me-1"></i>Mapa de Calor
                                    </button>
                                    <button type="button" class="heatmap-toggle" id="btnModoCluster">
                                        <i class="bi bi-collection me-1"></i>Agrupamiento
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h6 class="text-white mb-3">
                                    <i class="bi bi-info-circle me-2"></i>Leyenda
                                </h6>
                                <div class="legend">
                                    <div class="legend-item">
                                        <div class="legend-color" style="background-color: #FF6B6B;"></div>
                                        <span>Alta Densidad</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color" style="background-color: #FFA726;"></div>
                                        <span>Media Densidad</span>
                                    </div>
                                    <div class="legend-item">
                                        <div class="legend-color" style="background-color: #4ECDC4;"></div>
                                        <span>Baja Densidad</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-12">
                    <div class="map-container">
                        <div id="map"></div>
                        <div class="map-controls">
                            <button class="btn btn-sm btn-dark mb-2" id="btnResetView">
                                <i class="bi bi-compass me-1"></i>Centrar Mapa
                            </button>
                            <button class="btn btn-sm btn-dark" id="btnLocateMe">
                                <i class="bi bi-geo me-1"></i>Mi Ubicación
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h6 class="card-title mb-0">
                                <i class="bi bi-list-ul me-2"></i>Top 5 Colonias con Más Incidentes
                            </h6>
                        </div>
                        <div class="card-body">
                            <div id="topColonias">
                                ${datosProcesados.topColoniasHTML}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header bg-warning text-white">
                            <h6 class="card-title mb-0">
                                <i class="bi bi-clock me-2"></i>Distribución por Tipo de Fuga
                            </h6>
                        </div>
                        <div class="card-body">
                            <div id="distribucionTipos">
                                ${datosProcesados.distribucionTiposHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Inicializar mapa si no existe
        if (!map) {
            inicializarMapa();
        } else {
            // Limpiar mapa existente
            limpiarMapa();
        }

        // Agregar marcadores al mapa (solo los que tienen coordenadas válidas)
        agregarMarcadoresAlMapa(datosProcesados.incidentesConCoordenadas);

        // Configurar event listeners para los controles del mapa
        configurarControlesMapa();

    } catch (error) {
        console.error('Error al generar mapa:', error);
        mostrarError('Error al generar el mapa: ' + error.message);
    }
}

// Función para procesar datos para el mapa
function procesarDatosParaMapa(items) {
    // Ahora todos los items ya tienen coordenadas válidas, pero hacemos una verificación adicional
    const incidentesConCoordenadas = items.filter(item => {
        const lat = parseFloat(item.latitud_r);
        const lng = parseFloat(item.longitud_r);
        return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    // Calcular estadísticas
    const estadisticas = calcularEstadisticas(items, incidentesConCoordenadas);
    
    // Generar HTML para gráficas adicionales
    const topColoniasHTML = generarTopColoniasHTML(items);
    const distribucionTiposHTML = generarDistribucionTiposHTML(items);

    return {
        ...estadisticas,
        incidentesConCoordenadas,
        topColoniasHTML,
        distribucionTiposHTML
    };
}

// Calcular estadísticas
function calcularEstadisticas(datosTotales, datosMapeados) {
    const totalIncidentes = datosTotales.length;
    const incidentesMapeados = datosMapeados.length;
    
    // Calcular zonas críticas (áreas con más de 5 incidentes)
    const zonasCriticas = new Set();
    datosMapeados.forEach(incidente => {
        const densidad = calcularDensidad(datosMapeados, 
            parseFloat(incidente.latitud_r), 
            parseFloat(incidente.longitud_r)
        );
        if (densidad >= 5) {
            zonasCriticas.add(incidente.colonia || 'Sin colonia');
        }
    });
    
    // Calcular densidad promedio
    const densidadPromedio = datosMapeados.length > 0 ? 
        datosMapeados.reduce((sum, incidente) => 
            sum + calcularDensidad(datosMapeados, 
                parseFloat(incidente.latitud_r), 
                parseFloat(incidente.longitud_r)
            ), 0) / datosMapeados.length : 0;

    return {
        totalIncidentes,
        incidentesMapeados,
        zonasCriticas: zonasCriticas.size,
        avgDensidad: densidadPromedio.toFixed(1)
    };
}

// Inicializar el mapa
function inicializarMapa() {
    map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);

    // Inicializar cluster de marcadores
    markersCluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true
    });
}

// Agregar marcadores al mapa
function agregarMarcadoresAlMapa(incidentes) {
    incidentes.forEach(incidente => {
        const lat = parseFloat(incidente.latitud_r);
        const lng = parseFloat(incidente.longitud_r);
        
        // Verificación final de coordenadas válidas
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
            console.warn('Coordenadas inválidas encontradas después del filtrado:', incidente);
            return; // Saltar este incidente
        }

        // Determinar color basado en la densidad
        const densidad = calcularDensidad(incidentes, lat, lng);

        // Crear marcador personalizado
        const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: getColorByDensidad(densidad),
            color: '#FFFFFF',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Popup informativo
        const popupContent = crearPopupContent(incidente, densidad);
        marker.bindPopup(popupContent);
        
        currentMarkers.push(marker);
        markersCluster.addLayer(marker);
    });

    // Agregar cluster al mapa (modo normal por defecto)
    map.addLayer(markersCluster);

    // Ajustar vista para mostrar todos los marcadores
    if (incidentes.length > 0) {
        const group = new L.featureGroup(currentMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Calcular densidad de incidentes en un área
function calcularDensidad(incidentes, lat, lng, radioKm = 1) {
    return incidentes.filter(incidente => {
        const incLat = parseFloat(incidente.latitud_r);
        const incLng = parseFloat(incidente.longitud_r);
        
        // Verificar que las coordenadas sean válidas
        if (isNaN(incLat) || isNaN(incLng) || incLat === 0 || incLng === 0) {
            return false;
        }
        
        const distancia = calcularDistancia(lat, lng, incLat, incLng);
        return distancia <= radioKm;
    }).length;
}

// Calcular distancia entre dos puntos (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Obtener color basado en densidad
function getColorByDensidad(densidad) {
    if (densidad > 10) return '#FF6B6B';
    if (densidad > 5) return '#FFA726';
    return '#4ECDC4';
}

// Crear contenido del popup
function crearPopupContent(incidente, densidad) {
    return `
        <div class="custom-popup">
            <div class="popup-header">
                <div class="popup-title">${incidente.tag_desc || 'Incidente'}</div>
            </div>
            <div class="popup-info">
                <strong>Colonia:</strong> ${incidente.colonia || 'No especificada'}
            </div>
            <div class="popup-info">
                <strong>Calle:</strong> ${incidente.calle || 'No especificada'}
            </div>
            <div class="popup-info">
                <strong>Concepto:</strong> ${incidente.concepto_descripcion || 'No especificado'}
            </div>
            <div class="popup-info">
                <strong>Fecha:</strong> ${incidente.fecha_ejecucion || 'No especificada'}
            </div>
            <div class="popup-info">
                <strong>Densidad en zona:</strong> ${densidad} incidentes
            </div>
        </div>
    `;
}

// Configurar controles del mapa
function configurarControlesMapa() {
    // Modos del mapa
    document.getElementById('btnModoNormal').addEventListener('click', () => cambiarModoMapa('normal'));
    document.getElementById('btnModoCalor').addEventListener('click', () => cambiarModoMapa('calor'));
    document.getElementById('btnModoCluster').addEventListener('click', () => cambiarModoMapa('cluster'));

    // Controles de navegación
    document.getElementById('btnResetView').addEventListener('click', centrarMapa);
    document.getElementById('btnLocateMe').addEventListener('click', ubicarUsuario);
}

// Cambiar modo del mapa
function cambiarModoMapa(modo) {
    // Actualizar botones
    document.querySelectorAll('.heatmap-toggle').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btnModo${modo.charAt(0).toUpperCase() + modo.slice(1)}`).classList.add('active');

    // Limpiar capas actuales
    if (markersCluster) map.removeLayer(markersCluster);
    if (heatLayer) map.removeLayer(heatLayer);

    switch (modo) {
        case 'normal':
            if (currentMarkers.length > 0) {
                markersCluster = L.markerClusterGroup();
                currentMarkers.forEach(marker => markersCluster.addLayer(marker));
                map.addLayer(markersCluster);
            }
            break;
            
        case 'calor':
            if (currentMarkers.length > 0) {
                const heatPoints = currentMarkers.map(marker => 
                    [marker.getLatLng().lat, marker.getLatLng().lng, 0.5]
                );
                heatLayer = L.heatLayer(heatPoints, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    gradient: {
                        0.4: 'blue',
                        0.6: 'cyan',
                        0.7: 'lime',
                        0.8: 'yellow',
                        1.0: 'red'
                    }
                }).addTo(map);
            }
            break;
            
        case 'cluster':
            if (currentMarkers.length > 0) {
                map.addLayer(markersCluster);
            }
            break;
    }
}

// Centrar mapa
function centrarMapa() {
    map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
}

// Ubicar usuario
function ubicarUsuario() {
    if (!navigator.geolocation) {
        mostrarAlerta('La geolocalización no es soportada por este navegador', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 15);
            
            // Agregar marcador de ubicación
            L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup('¡Estás aquí!')
                .openPopup();
        },
        (error) => {
            mostrarAlerta('No se pudo obtener tu ubicación', 'error');
        }
    );
}

// Limpiar mapa
function limpiarMapa() {
    if (markersCluster) {
        map.removeLayer(markersCluster);
        markersCluster.clearLayers();
    }
    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }
    currentMarkers = [];
}

// Generar HTML para top colonias
function generarTopColoniasHTML(datos) {
    const coloniasCount = {};
    datos.forEach(item => {
        const colonia = item.colonia || 'Sin colonia';
        coloniasCount[colonia] = (coloniasCount[colonia] || 0) + 1;
    });

    const topColonias = Object.entries(coloniasCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topColonias.length === 0) {
        return '<p class="text-muted text-center">No hay datos de colonias</p>';
    }

    return topColonias.map(([colonia, count]) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <span class="small">${colonia}</span>
            <span class="badge bg-danger">${count}</span>
        </div>
    `).join('');
}

// Generar HTML para distribución de tipos
function generarDistribucionTiposHTML(datos) {
    const tiposCount = {};
    datos.forEach(item => {
        const tipo = item.tag_desc || 'Sin tipo';
        tiposCount[tipo] = (tiposCount[tipo] || 0) + 1;
    });

    const tipos = Object.entries(tiposCount)
        .sort((a, b) => b[1] - a[1]);

    if (tipos.length === 0) {
        return '<p class="text-muted text-center">No hay datos de tipos</p>';
    }

    return tipos.map(([tipo, count]) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
            <span class="small">${tipo}</span>
            <span class="badge bg-warning">${count}</span>
        </div>
    `).join('');
}

// Función para mostrar mensaje sin datos
function mostrarMensajeSinDatos(filtroSeleccionado) {
    const resultadoDiv = document.getElementById('resultados');
    const mensajeFiltro = filtroSeleccionado ? `para ${filtroSeleccionado}` : '';
    
    resultadoDiv.innerHTML = `
        <div class="alert alert-warning text-center">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Sin datos con coordenadas válidas
            </h5>
            <p class="mb-0">No se encontraron registros con coordenadas válidas ${mensajeFiltro} en el período seleccionado.</p>
            <small class="text-muted">Los reportes sin coordenadas o con coordenadas en cero no se muestran en el mapa.</small>
        </div>
    `;
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="alert alert-danger text-center">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Error
            </h5>
            <p class="mb-0">${mensaje}</p>
        </div>
    `;
}

// Función global para mostrar alertas
function mostrarAlerta(mensaje, tipo = 'info') {
    if (window.mostrarAlerta) {
        window.mostrarAlerta(mensaje, tipo);
    } else {
        console.log(`${tipo}: ${mensaje}`);
    }
}