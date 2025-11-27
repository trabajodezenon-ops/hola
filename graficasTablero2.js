// graficasTablero2.js - Gráficas específicas para tablero2.php

// Función principal que debe ser exportada
export function generarGraficasDetalle(items, filtroSeleccionado) {
    console.log('=== GENERAR GRÁFICAS DETALLE INICIADO ===');
    console.log('Items recibidos:', items);
    
    // Validar que Highcharts esté disponible
    if (typeof Highcharts === 'undefined') {
        console.error('Highcharts no está cargado correctamente');
        mostrarError('Error: Highcharts no se cargó correctamente. Verifica tu conexión a internet.');
        return;
    }

    // Validar que hay datos
    if (!items || items.length === 0) {
        mostrarMensajeSinDatos(filtroSeleccionado);
        return;
    }

    try {
        // Procesar datos para las gráficas
        const datosProcesados = procesarDatosDetalleNuevos(items);
        
        // Generar contenedores para las gráficas
        const resultadoDiv = document.getElementById('resultados');
        const tituloFiltro = filtroSeleccionado ? ` - ${filtroSeleccionado}` : ' - Todas las colonias';
        
        resultadoDiv.innerHTML = `
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="card border-primary">
                        <div class="card-header bg-primary text-white">
                            <h4 class="card-title mb-0">
                                <i class="bi bi-bar-chart-line me-2"></i>Análisis Detallado${tituloFiltro}
                            </h4>
                        </div>
                    </div>
                </div>
                
                <!-- Donut 3D de Conceptos -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-pie-chart-fill me-2"></i>Distribución 3D por Concepto
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaDonutConceptos" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Donut 3D de Tags -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-pie-chart-fill me-2"></i>Distribución 3D por Tipo de Fuga
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaDonutTags" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Pareto de Calles -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-warning text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Calles
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaParetoCalles" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Range Selector -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-danger text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-graph-up me-2"></i>Evolución Temporal
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaRangeSelector" style="height: 400px;"></div>
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
        generarDonut3DConceptos(datosProcesados.donutConceptos, 'graficaDonutConceptos');
        generarDonut3DTags(datosProcesados.donutTags, 'graficaDonutTags');
        generarParetoCalles(datosProcesados.paretoCalles, 'graficaParetoCalles');
        generarRangeSelectorDetalle(datosProcesados.datosTemporales, 'graficaRangeSelector');
        
    } catch (error) {
        console.error('Error al generar gráficas:', error);
        mostrarError('Error al generar las gráficas: ' + error.message);
    }
}

// Función para procesar datos para las nuevas gráficas
function procesarDatosDetalleNuevos(items) {
    const conteoConceptos = {};
    const conteoTags = {};
    const conteoCalles = {};
    const datosPorFecha = {};

    items.forEach(item => {
        const concepto = item.concepto_descripcion || 'Sin concepto';
        const tag = item.tag_desc || 'Sin tipo';
        const calle = item.calle || 'Sin calle';
        
        // Procesar fecha_ejecucion
        const fecha = procesarFecha(item.fecha_ejecucion);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        // Contar para gráficas
        conteoConceptos[concepto] = (conteoConceptos[concepto] || 0) + 1;
        conteoTags[tag] = (conteoTags[tag] || 0) + 1;
        conteoCalles[calle] = (conteoCalles[calle] || 0) + 1;
        
        // Agrupar por fecha para range selector
        if (!datosPorFecha[fechaKey]) {
            datosPorFecha[fechaKey] = 0;
        }
        datosPorFecha[fechaKey]++;
    });

    // Convertir a arrays para gráficas
    const donutConceptos = Object.entries(conteoConceptos)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 10); // Top 10

    const donutTags = Object.entries(conteoTags)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 10); // Top 10

    const datosCalles = Object.entries(conteoCalles)
        .map(([name, y]) => ({ name, y }))
        .sort((a, b) => b.y - a.y);

    // Calcular Pareto de calles
    const paretoCalles = calcularDatosPareto(datosCalles);

    // Preparar datos temporales
    const fechas = Object.keys(datosPorFecha).sort();
    const datosTemporales = fechas.map(fecha => [
        new Date(fecha).getTime(),
        datosPorFecha[fecha]
    ]);

    return {
        donutConceptos,
        donutTags,
        paretoCalles,
        datosTemporales,
        dias: fechas
    };
}

// ========== DONUT 3D DE CONCEPTOS ==========
function generarDonut3DConceptos(datos, contenedorId) {
    generarDonut3DGenerico(datos, contenedorId, 'Distribución por Concepto');
}

// ========== DONUT 3D DE TAGS ==========
function generarDonut3DTags(datos, contenedorId) {
    generarDonut3DGenerico(datos, contenedorId, 'Distribución por Tipo de Fuga');
}

function generarDonut3DGenerico(datos, contenedorId, titulo) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                },
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
            plotOptions: {
                pie: {
                    innerSize: 100,
                    depth: 45,
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                        style: {
                            color: '#000000',
                            textOutline: 'none',
                            fontSize: '11px'
                        }
                    },
                    showInLegend: true
                }
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} reportes)',
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
            },
            series: [{
                name: 'Reportes',
                data: datos,
                colors: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
                ]
            }],
            credits: {
                enabled: false
            }
        });
    } catch (error) {
        console.error('Error al generar Donut 3D:', error);
        mostrarErrorGrafica(contenedorId, 'Donut 3D');
    }
}

// ========== PARETO DE CALLES ==========
function generarParetoCalles(datos, contenedorId) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF'
            },
            title: {
                text: 'Pareto de Calles',
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
        console.error('Error al generar Pareto de calles:', error);
        mostrarErrorGrafica(contenedorId, 'Pareto');
    }
}

// ========== RANGE SELECTOR DETALLE ==========
function generarRangeSelectorDetalle(datos, contenedorId) {
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
                    type: 'all',
                    text: 'Todo'
                }]
            },
            title: {
                text: 'Evolución Temporal de Reportes',
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
                type: 'line',
                color: '#C1121F',
                lineWidth: 2,
                marker: {
                    enabled: false
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

// Funciones auxiliares
function procesarFecha(fechaString) {
    if (!fechaString) return new Date();
    
    try {
        if (typeof fechaString === 'string' && fechaString.includes('/')) {
            const partes = fechaString.split('/');
            if (partes.length === 3) {
                const dia = parseInt(partes[0], 10);
                const mes = parseInt(partes[1], 10) - 1;
                const anio = parseInt(partes[2], 10);
                return new Date(anio, mes, dia);
            }
        }
        
        const fecha = new Date(fechaString);
        return isNaN(fecha.getTime()) ? new Date() : fecha;
    } catch (error) {
        return new Date();
    }
}

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

function mostrarMensajeSinDatos(filtroSeleccionado) {
    const resultadoDiv = document.getElementById('resultados');
    const mensajeFiltro = filtroSeleccionado ? `para ${filtroSeleccionado}` : '';
    
    resultadoDiv.innerHTML = `
        <div class="alert alert-warning text-center">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Sin datos
            </h5>
            <p class="mb-0">No se encontraron registros ${mensajeFiltro} en el período seleccionado.</p>
        </div>
    `;
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