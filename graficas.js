// graficas.js - MODIFICADO para tablero.php
export function generarGraficas(items) {
    console.log('=== GENERAR GRÁFICAS INICIADO ===');
    
    // Validar que Highcharts esté disponible
    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts no está cargado correctamente');
        mostrarError('Error: Highcharts no se cargó correctamente.');
        return;
    }

    // Validar que hay datos
    if (!items || items.length === 0) {
        mostrarError('No hay datos para mostrar');
        return;
    }

    // Procesar datos para las nuevas gráficas
    const datosProcesados = procesarDatosNuevos(items);
    
    // Generar contenedores para las nuevas gráficas
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="row">
            <!-- ========== SECCIÓN PARETOS ========== -->
            <div class="col-12 mb-4">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h4 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Análisis Pareto
                        </h4>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Conceptos -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Conceptos
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoConceptos" style="height: 400px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Tags -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Tipos de Fuga
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoTags" style="height: 400px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Colonias -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header bg-warning text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Colonias
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoColonias" style="height: 400px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Calles -->
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Calles
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoCalles" style="height: 400px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- ========== SECCIÓN RANGE SELECTOR ========== -->
            <div class="col-12 mb-4">
                <div class="card border-secondary">
                    <div class="card-header bg-secondary text-white">
                        <h4 class="card-title mb-0">
                            <i class="bi bi-calendar-range me-2"></i>Evolución Temporal
                        </h4>
                    </div>
                </div>
            </div>
            
            <!-- Range Selector con Data Grouping -->
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="card-header bg-dark text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-graph-up me-2"></i>Evolución por Fecha de Ejecución
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="rangeSelector" style="height: 500px;"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <div class="alert alert-secondary">
                    <small>
                        <i class="bi bi-info-circle me-1"></i>
                        Total de registros: <strong>${items.length}</strong> | 
                        Período analizado: <strong>${datosProcesados.dias.length} días</strong>
                    </small>
                </div>
            </div>
        </div>
    `;

    // Generar todas las gráficas
    generarParetoConceptos(datosProcesados.paretoConceptos, 'paretoConceptos');
    generarParetoTags(datosProcesados.paretoTags, 'paretoTags');
    generarParetoColonias(datosProcesados.paretoColonias, 'paretoColonias');
    generarParetoCalles(datosProcesados.paretoCalles, 'paretoCalles');
    generarRangeSelector(datosProcesados.datosTemporales, 'rangeSelector');
}

// Función para procesar datos para las nuevas gráficas
function procesarDatosNuevos(items) {
    const conteoConceptos = {};
    const conteoTags = {};
    const conteoColonias = {};
    const conteoCalles = {};
    const datosPorFecha = {};

    items.forEach(item => {
        const concepto = item.concepto_descripcion || 'Sin concepto';
        const tag = item.tag_desc || 'Sin tipo';
        const colonia = item.colonia || 'Sin colonia';
        const calle = item.calle || 'Sin calle';
        
        // Procesar fecha_ejecucion
        const fecha = procesarFecha(item.fecha_ejecucion);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        // Contar para Pareto
        conteoConceptos[concepto] = (conteoConceptos[concepto] || 0) + 1;
        conteoTags[tag] = (conteoTags[tag] || 0) + 1;
        conteoColonias[colonia] = (conteoColonias[colonia] || 0) + 1;
        conteoCalles[calle] = (conteoCalles[calle] || 0) + 1;
        
        // Agrupar por fecha para range selector
        if (!datosPorFecha[fechaKey]) {
            datosPorFecha[fechaKey] = 0;
        }
        datosPorFecha[fechaKey]++;
    });

    // Convertir a arrays y ordenar
    const datosConceptos = Object.entries(conteoConceptos)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y);

    const datosTags = Object.entries(conteoTags)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y);

    const datosColonias = Object.entries(conteoColonias)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y);

    const datosCalles = Object.entries(conteoCalles)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y);

    // Calcular datos Pareto
    const paretoConceptos = calcularDatosPareto(datosConceptos);
    const paretoTags = calcularDatosPareto(datosTags);
    const paretoColonias = calcularDatosPareto(datosColonias);
    const paretoCalles = calcularDatosPareto(datosCalles);

    // Preparar datos temporales para range selector
    const fechas = Object.keys(datosPorFecha).sort();
    const datosTemporales = fechas.map(fecha => [
        new Date(fecha).getTime(),
        datosPorFecha[fecha]
    ]);

    return {
        paretoConceptos,
        paretoTags,
        paretoColonias,
        paretoCalles,
        datosTemporales,
        dias: fechas
    };
}

// Función para procesar fecha_ejecucion
function procesarFecha(fechaString) {
    if (!fechaString) return new Date();
    
    try {
        // Intentar parsear fecha en formato DD/MM/YYYY
        if (typeof fechaString === 'string' && fechaString.includes('/')) {
            const partes = fechaString.split('/');
            if (partes.length === 3) {
                const dia = parseInt(partes[0], 10);
                const mes = parseInt(partes[1], 10) - 1;
                const anio = parseInt(partes[2], 10);
                return new Date(anio, mes, dia);
            }
        }
        
        // Intentar parsear normalmente
        const fecha = new Date(fechaString);
        return isNaN(fecha.getTime()) ? new Date() : fecha;
    } catch (error) {
        return new Date();
    }
}

// ========== GRÁFICAS PARETO ==========
function generarParetoConceptos(datos, contenedorId) {
    generarParetoGenerico(datos, contenedorId, 'Pareto de Conceptos');
}

function generarParetoTags(datos, contenedorId) {
    generarParetoGenerico(datos, contenedorId, 'Pareto de Tipos de Fuga');
}

function generarParetoColonias(datos, contenedorId) {
    generarParetoGenerico(datos, contenedorId, 'Pareto de Colonias');
}

function generarParetoCalles(datos, contenedorId) {
    generarParetoGenerico(datos, contenedorId, 'Pareto de Calles');
}

function generarParetoGenerico(datos, contenedorId, titulo) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF'
            },
            title: {
                text: titulo,
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            xAxis: {
                categories: datos.map(item => item.name),
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: {
                        color: '#000000',
                        fontSize: '10px'
                    }
                }
            },
            yAxis: [{
                title: {
                    text: 'Cantidad',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                }
            }, {
                title: {
                    text: 'Porcentaje Acumulado',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#000000'
                    }
                },
                opposite: true,
                max: 100
            }],
            tooltip: {
                shared: true,
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                formatter: function() {
                    let tooltip = '<b>' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        if (point.series.name === 'Cantidad') {
                            tooltip += '<span style="color:' + point.color + '">●</span> ' + point.series.name + ': <b>' + point.y + '</b><br/>';
                        } else {
                            tooltip += '<span style="color:' + point.color + '">●</span> ' + point.series.name + ': <b>' + point.y.toFixed(1) + '%</b><br/>';
                        }
                    });
                    return tooltip;
                }
            },
            series: [{
                name: 'Porcentaje Acumulado',
                type: 'spline',
                yAxis: 1,
                data: datos.map(item => item.porcentajeAcumulado),
                tooltip: {
                    valueSuffix: '%'
                },
                color: '#E74C3C',
                lineWidth: 3,
                marker: {
                    enabled: false
                }
            }, {
                name: 'Cantidad',
                type: 'column',
                data: datos.map(item => item.y),
                color: '#3498DB'
            }],
            credits: {
                enabled: false
            }
        });
    } catch (error) {
        console.error('Error al generar Pareto:', error);
        mostrarErrorGrafica(contenedorId, 'Pareto');
    }
}

// ========== RANGE SELECTOR CON DATA GROUPING ==========
function generarRangeSelector(datos, contenedorId) {
    try {
        Highcharts.stockChart(contenedorId, {
            rangeSelector: {
                selected: 1,
                buttons: [{
                    type: 'day',
                    count: 7,
                    text: '7d'
                }, {
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'ytd',
                    text: 'YTD'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1y'
                }, {
                    type: 'all',
                    text: 'Todo'
                }]
            },
            title: {
                text: 'Evolución de Reportes por Fecha de Ejecución',
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Número de Reportes',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                }
            },
            tooltip: {
                valueDecimals: 0,
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
            },
            series: [{
                name: 'Reportes',
                data: datos,
                type: 'areaspline',
                color: '#C1121F',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(193, 18, 31, 0.3)'],
                        [1, 'rgba(193, 18, 31, 0.1)']
                    ]
                },
                dataGrouping: {
                    enabled: true,
                    groupPixelWidth: 20
                }
            }],
            credits: {
                enabled: false
            },
            chart: {
                backgroundColor: '#FFFFFF'
            }
        });
    } catch (error) {
        console.error('Error al generar Range Selector:', error);
        mostrarErrorGrafica(contenedorId, 'Range Selector');
    }
}

// Funciones auxiliares (mantener las existentes)
function calcularDatosPareto(datos) {
    let total = datos.reduce((sum, item) => sum + item.y, 0);
    let acumulado = 0;
    
    return datos.map(item => {
        acumulado += item.y;
        return {
            name: item.name,
            y: item.y,
            porcentaje: (item.y / total) * 100,
            porcentajeAcumulado: (acumulado / total) * 100
        };
    });
}

function mostrarErrorGrafica(contenedorId, tipoGrafica) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" style="margin: 20px;">
                <h6 class="alert-heading">
                    <i class="bi bi-exclamation-triangle me-2"></i>Error en ${tipoGrafica}
                </h6>
                <p class="mb-0">No se pudo generar la gráfica.</p>
            </div>
        `;
    }
}

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