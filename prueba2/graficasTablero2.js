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
        const datosProcesados = procesarDatosDetalle(items);
        
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
                
                <!-- Donut 3D de Tipos de Fuga -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-pie-chart-fill me-2"></i>Distribución 3D por Tipo de Fuga
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaDonut3D" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Gráfica de Líneas Animada -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-graph-up me-2"></i>Evolución Diaria por Tipo de Tarea
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaLineasAnimada" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Pareto de Tipos -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-warning text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Tipos de Fuga
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaParetoTipos" style="height: 400px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Gráfico 3D de Cilindro por Concepto -->
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-danger text-white">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-bar-chart-fill me-2"></i>Distribución 3D por Concepto
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="graficaCilindro3D" style="height: 400px;"></div>
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
                            Tipos de fuga diferentes: <strong>${datosProcesados.tiposFuga.length}</strong> |
                            Período analizado: <strong>${datosProcesados.dias.length} días</strong>
                        </small>
                    </div>
                </div>
            </div>
        `;

        // Generar todas las gráficas
        generarDonut3D(datosProcesados.tiposFuga, 'graficaDonut3D');
        generarLineasAnimada(datosProcesados.datosPorDia, 'graficaLineasAnimada');
        generarParetoTipos(datosProcesados.tiposPareto, 'graficaParetoTipos');
        generarCilindro3D(datosProcesados.datosConceptos, 'graficaCilindro3D');
        
    } catch (error) {
        console.error('Error al generar gráficas:', error);
        mostrarError('Error al generar las gráficas: ' + error.message);
    }
}

// Función para mostrar mensaje cuando no hay datos
function mostrarMensajeSinDatos(filtroSeleccionado) {
    const resultadoDiv = document.getElementById('resultados');
    const mensajeFiltro = filtroSeleccionado ? `para ${filtroSeleccionado}` : '';
    
    resultadoDiv.innerHTML = `
        <div class="alert alert-warning text-center">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Sin datos
            </h5>
            <p class="mb-0">No se encontraron registros ${mensajeFiltro} en el período seleccionado.</p>
            <hr>
            <small class="mb-0">Intente con otras fechas o seleccione una colonia/macro diferente.</small>
        </div>
    `;
}

// Función mejorada para procesar los datos para las gráficas detalladas
function procesarDatosDetalle(items) {
    const conteoTiposFuga = {};
    const datosPorDia = {};
    const datosConceptos = {};
    const tiposSet = new Set();
    let fechasInvalidas = 0;

    // Función auxiliar para validar y parsear fechas en formato español
    function parsearFecha(fechaString) {
        if (!fechaString) {
            return new Date(); // Fecha actual si no hay fecha
        }
        
        try {
            // Intentar parsear fecha en formato DD/MM/YYYY
            if (typeof fechaString === 'string' && fechaString.includes('/')) {
                const partes = fechaString.split('/');
                if (partes.length === 3) {
                    const dia = parseInt(partes[0], 10);
                    const mes = parseInt(partes[1], 10) - 1; // Los meses en JS van de 0 a 11
                    const anio = parseInt(partes[2], 10);
                    
                    // Validar que los números sean válidos
                    if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio) &&
                        dia >= 1 && dia <= 31 &&
                        mes >= 0 && mes <= 11 &&
                        anio >= 2000 && anio <= 2100) {
                        
                        const fecha = new Date(anio, mes, dia);
                        
                        // Verificar si la fecha es válida y coincide con los componentes
                        if (fecha.getDate() === dia && 
                            fecha.getMonth() === mes && 
                            fecha.getFullYear() === anio) {
                            return fecha;
                        }
                    }
                }
            }
            
            // Si no es formato DD/MM/YYYY, intentar parsear normalmente
            const fecha = new Date(fechaString);
            
            // Verificar si la fecha es válida
            if (isNaN(fecha.getTime())) {
                fechasInvalidas++;
                console.warn('Fecha inválida encontrada:', fechaString);
                return new Date(); // Fecha actual como fallback
            }
            
            return fecha;
        } catch (error) {
            fechasInvalidas++;
            console.warn('Error al parsear fecha:', fechaString, error);
            return new Date(); // Fecha actual como fallback
        }
    }

    // Procesar cada item
    items.forEach(item => {
        const tipoFuga = String(item.tag_desc || 'Sin tipo especificado');
        const concepto = String(item.concepto_descripcion || 'Sin concepto especificado');
        
        // Usar fecha_ejecucion en lugar de fecha_creacion con validación mejorada
        const fecha = item.fecha_ejecucion ? parsearFecha(item.fecha_ejecucion) : 
                        (item.fecha_creacion ? parsearFecha(item.fecha_creacion) : new Date());
        
        // Formatear la fecha de manera segura
        let dia;
        try {
            dia = fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (error) {
            // Si falla toISOString(), usar formato manual
            const year = fecha.getFullYear();
            const month = String(fecha.getMonth() + 1).padStart(2, '0');
            const day = String(fecha.getDate()).padStart(2, '0');
            dia = `${year}-${month}-${day}`;
        }

        // Contar por tipo de fuga
        conteoTiposFuga[tipoFuga] = (conteoTiposFuga[tipoFuga] || 0) + 1;
        
        // Contar por concepto_descripcion
        datosConceptos[concepto] = (datosConceptos[concepto] || 0) + 1;
        
        // Agrupar por día y tipo (usando fecha_ejecucion)
        if (!datosPorDia[dia]) {
            datosPorDia[dia] = {};
        }
        datosPorDia[dia][tipoFuga] = (datosPorDia[dia][tipoFuga] || 0) + 1;
        tiposSet.add(tipoFuga);
    });

    // Mostrar advertencia si hay fechas inválidas
    if (fechasInvalidas > 0) {
        console.warn(`Se encontraron ${fechasInvalidas} fechas inválidas. Se usó la fecha actual como fallback.`);
    }

    // Convertir a arrays para Highcharts
    const datosTiposFuga = Object.entries(conteoTiposFuga).map(([tipo, cantidad]) => ({
        name: tipo,
        y: cantidad
    })).sort((a, b) => b.y - a.y);

    // Preparar datos para gráfica de conceptos (3D Cylinder)
    const datosConceptosArray = Object.entries(datosConceptos).map(([concepto, cantidad]) => ({
        name: concepto,
        y: cantidad
    })).sort((a, b) => b.y - a.y);

    // Preparar datos para gráfica de líneas por día (fecha_ejecucion)
    const dias = Object.keys(datosPorDia).sort();
    const seriesPorTipo = {};
    
    tiposSet.forEach(tipo => {
        seriesPorTipo[tipo] = {
            name: tipo,
            data: dias.map(dia => datosPorDia[dia][tipo] || 0)
        };
    });

    // Calcular datos Pareto
    const tiposPareto = calcularDatosPareto(datosTiposFuga);

    return {
        tiposFuga: datosTiposFuga,
        datosPorDia: {
            dias: dias,
            series: Object.values(seriesPorTipo)
        },
        tiposPareto: tiposPareto,
        datosConceptos: datosConceptosArray,
        dias: dias,
        fechasInvalidas: fechasInvalidas
    };
}

// Función para calcular datos Pareto
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

// ========== DONUT 3D ==========
function generarDonut3D(datos, contenedorId) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                },
                backgroundColor: '#FFFFFF',
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Distribución por Tipo de Fuga',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Vista 3D - Donut',
                style: {
                    color: '#333333'
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
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b> ({point.y} fugas)',
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000'
            },
            series: [{
                name: 'Fugas',
                data: datos,
                colors: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
                    '#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D',
                    '#99B898', '#FECEAB', '#FF847C', '#E84A5F', '#2A363B'
                ]
            }],
            credits: {
                enabled: false
            },
            exporting: {
                enabled: true
            }
        });
    } catch (error) {
        console.error('Error al generar Donut 3D:', error);
        mostrarErrorGrafica(contenedorId, 'Donut 3D');
    }
}

// ========== GRÁFICA DE LÍNEAS ANIMADA (MODIFICADA) ==========
function generarLineasAnimada(datos, contenedorId) {
    try {
        // Formatear las fechas para mejor presentación
        const diasFormateados = datos.dias.map(dia => {
            try {
                const fecha = new Date(dia);
                if (isNaN(fecha.getTime())) {
                    return dia; // Devolver el string original si la fecha es inválida
                }
                return fecha.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch (error) {
                console.warn('Error al formatear fecha:', dia, error);
                return dia; // Devolver el string original en caso de error
            }
        });

        // Calcular estadísticas para la gráfica
        const totalPorDia = datos.dias.map((dia, index) => {
            return datos.series.reduce((sum, serie) => sum + (serie.data[index] || 0), 0);
        });

        const maxTotal = Math.max(...totalPorDia);
        const diaConMasReportes = datos.dias[totalPorDia.indexOf(maxTotal)];
        
        let fechaMaxima = 'N/A';
        try {
            const fechaMax = new Date(diaConMasReportes);
            if (!isNaN(fechaMax.getTime())) {
                fechaMaxima = fechaMax.toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        } catch (error) {
            fechaMaxima = diaConMasReportes;
        }

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'spline',
                backgroundColor: '#FFFFFF',
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Evolución Diaria de Reportes por Tipo de Tarea',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: `Fecha con más reportes: ${fechaMaxima} (${maxTotal} reportes)`,
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                categories: diasFormateados,
                title: {
                    text: 'Fecha de Ejecución',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    rotation: -45,
                    style: {
                        color: '#000000',
                        fontSize: '10px'
                    }
                },
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
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
                },
                min: 0,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)',
                plotLines: maxTotal > 0 ? [{
                    color: '#C1121F',
                    width: 2,
                    value: maxTotal,
                    dashStyle: 'dash',
                    label: {
                        text: `Máximo: ${maxTotal}`,
                        align: 'right',
                        style: {
                            color: '#C1121F',
                            fontWeight: 'bold'
                        }
                    }
                }] : []
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000',
                formatter: function() {
                    let tooltip = `<b>${this.x}</b><br/>`;
                    let totalDia = 0;
                    
                    this.points.forEach(point => {
                        tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: <b>${point.y}</b><br/>`;
                        totalDia += point.y;
                    });
                    
                    tooltip += `<hr style="margin: 5px 0;"/>`;
                    tooltip += `<strong>Total del día: ${totalDia} reportes</strong>`;
                    
                    return tooltip;
                }
            },
            plotOptions: {
                series: {
                    animation: {
                        duration: 1000
                    },
                    marker: {
                        enabled: true,
                        radius: 4,
                        symbol: 'circle'
                    },
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 4,
                            halo: {
                                size: 5,
                                opacity: 0.25
                            }
                        }
                    }
                }
            },
            series: datos.series.map((serie, index) => ({
                ...serie,
                animation: {
                    defer: index * 200 // Animación escalonada más rápida
                }
            })),
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                itemStyle: {
                    color: '#000000',
                    fontSize: '11px'
                },
                itemHoverStyle: {
                    color: '#333333'
                },
                navigation: {
                    activeColor: '#3E576F',
                    animation: true,
                    arrowSize: 12
                }
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: true
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 768
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        },
                        xAxis: {
                            labels: {
                                rotation: -45,
                                fontSize: '9px'
                            }
                        }
                    }
                }, {
                    condition: {
                        maxWidth: 480
                    },
                    chartOptions: {
                        legend: {
                            enabled: false
                        },
                        xAxis: {
                            labels: {
                                rotation: -90,
                                fontSize: '8px'
                            }
                        },
                        yAxis: {
                            title: {
                                text: null
                            }
                        }
                    }
                }]
            }
        });

        // Agregar información adicional debajo de la gráfica
        setTimeout(() => {
            const contenedor = document.getElementById(contenedorId);
            const infoDiv = document.createElement('div');
            infoDiv.className = 'mt-2';
            infoDiv.innerHTML = `
                <div class="alert alert-light border">
                    <small>
                        <i class="bi bi-info-circle me-1"></i>
                        <strong>Resumen:</strong> 
                        Período analizado: <strong>${datos.dias.length} días</strong> | 
                        Total de reportes: <strong>${totalPorDia.reduce((a, b) => a + b, 0)}</strong> |
                        Tipos de tarea: <strong>${datos.series.length}</strong>
                    </small>
                </div>
            `;
            contenedor.parentNode.insertBefore(infoDiv, contenedor.nextSibling);
        }, 100);

    } catch (error) {
        console.error('Error al generar gráfica de líneas animada:', error);
        mostrarErrorGrafica(contenedorId, 'Gráfica de Evolución Diaria');
    }
}

// ========== PARETO DE TIPOS ==========
function generarParetoTipos(datos, contenedorId) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                zoomType: 'xy',
                backgroundColor: '#FFFFFF',
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Análisis Pareto - Tipos de Fuga',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Frecuencia y porcentaje acumulado',
                style: {
                    color: '#333333'
                }
            },
            xAxis: [{
                categories: datos.map(item => item.name),
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: {
                        color: '#000000',
                        fontSize: '10px'
                    }
                },
                lineColor: '#000000'
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'Cantidad',
                    style: {
                        color: Highcharts.getOptions().colors[1],
                        fontWeight: 'bold'
                    }
                },
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
            }, { // Secondary yAxis
                title: {
                    text: 'Porcentaje Acumulado',
                    style: {
                        color: Highcharts.getOptions().colors[0],
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true,
                max: 100,
                lineColor: '#000000'
            }],
            tooltip: {
                shared: true,
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000',
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
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 120,
                verticalAlign: 'top',
                y: 100,
                floating: true,
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'rgba(255,255,255,0.8)',
                borderColor: '#CCCCCC',
                borderWidth: 1,
                itemStyle: {
                    color: '#000000'
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
            },
            exporting: {
                enabled: true
            }
        });
    } catch (error) {
        console.error('Error al generar Pareto de tipos:', error);
        mostrarErrorGrafica(contenedorId, 'Pareto');
    }
}

// ========== GRÁFICO 3D DE CILINDRO POR CONCEPTO ==========
function generarCilindro3D(datos, contenedorId) {
    try {
        // Verificar si hay datos
        if (!datos || datos.length === 0) {
            document.getElementById(contenedorId).innerHTML = `
                <div class="alert alert-info text-center" style="margin: 20px;">
                    <i class="bi bi-info-circle me-2"></i>
                    No hay datos de conceptos disponibles para generar el gráfico 3D.
                </div>
            `;
            return;
        }

        // Limitar a los primeros 15 conceptos para mejor visualización
        const datosLimitados = datos.slice(0, 15);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                options3d: {
                    enabled: true,
                    alpha: 15,
                    beta: 15,
                    depth: 50,
                    viewDistance: 25
                },
                backgroundColor: '#FFFFFF',
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Distribución por Concepto',
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Gráfico 3D de cilindro - Agrupado por descripción de concepto',
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                labels: {
                    rotation: -45,
                    style: {
                        color: '#000000',
                        fontSize: '10px'
                    }
                },
                title: {
                    text: 'Conceptos',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                lineColor: '#000000'
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Registros',
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
            },
            tooltip: {
                headerFormat: '<span style="font-size: 13px"><b>{point.key}</b></span><br/>',
                pointFormat: 'Cantidad: <b>{point.y}</b>',
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000'
            },
            plotOptions: {
                column: {
                    depth: 25,
                    colorByPoint: true,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y}',
                        style: {
                            color: '#000000',
                            textOutline: 'none',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }
                    },
                    borderColor: '#000000',
                    borderWidth: 1
                }
            },
            series: [{
                name: 'Conceptos',
                data: datosLimitados,
                colors: [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
                    '#F8B195', '#F67280', '#C06C84', '#6C5B7B', '#355C7D'
                ]
            }],
            legend: {
                enabled: false
            },
            credits: {
                enabled: false
            },
            exporting: {
                enabled: true
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        xAxis: {
                            labels: {
                                rotation: -90
                            }
                        }
                    }
                }]
            }
        });
    } catch (error) {
        console.error('Error al generar gráfico 3D de cilindro:', error);
        mostrarErrorGrafica(contenedorId, 'Gráfico 3D de Cilindro');
    }
}

// Función para mostrar error en una gráfica específica
function mostrarErrorGrafica(contenedorId, tipoGrafica) {
    const contenedor = document.getElementById(contenedorId);
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="alert alert-danger text-center" style="margin: 20px;">
                <h6 class="alert-heading">
                    <i class="bi bi-exclamation-triangle me-2"></i>Error en ${tipoGrafica}
                </h6>
                <p class="mb-0">No se pudo generar la gráfica. Intente nuevamente.</p>
            </div>
        `;
    }
}

// Función para mostrar errores generales
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