// graficas.js

// Función principal que debe ser exportada
export function generarGraficas(items) {
    console.log('=== GENERAR GRÁFICAS INICIADO ===');
    
    // Validar que Highcharts esté disponible
    if (typeof Highcharts === 'undefined' || typeof Highcharts.chart !== 'function') {
        console.error('Highcharts no está cargado correctamente');
        mostrarError('Error: Highcharts no se cargó correctamente. Verifica tu conexión a internet.');
        return;
    }

    // Validar que hay datos
    if (!items || items.length === 0) {
        mostrarError('No hay datos para mostrar');
        return;
    }

    // Procesar datos para las gráficas
    const datosProcesados = procesarDatos(items);
    
    // Generar contenedores para las gráficas en el nuevo orden
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="row">
            <!-- ========== SECCIÓN COLONIAS ========== -->
            <div class="col-12 mb-4">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h4 class="card-title mb-0">
                            <i class="bi bi-house-fill me-2"></i>Análisis por Colonias
                        </h4>
                    </div>
                </div>
            </div>
            
            <!-- Gráfica de colonias -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart me-2"></i>Fugas por Colonia
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="graficaColonias" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Colonias -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-line me-2"></i>Pareto de Colonias
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoColonias" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- ========== SECCIÓN MACROS ========== -->
            <div class="col-12 mb-4">
                <div class="card border-info">
                    <div class="card-header bg-info text-white">
                        <h4 class="card-title mb-0">
                            <i class="bi bi-diagram-3 me-2"></i>Análisis por Macros
                        </h4>
                    </div>
                </div>
            </div>
            
            <!-- Gráfica de macros -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart me-2"></i>Fugas por Macro
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="graficaMacros" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Macros -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-info text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Macros
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoMacros" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- ========== SECCIÓN TIPOS DE TAREA ========== -->
            <div class="col-12 mb-4">
                <div class="card border-success">
                    <div class="card-header bg-success text-white">
                        <h4 class="card-title mb-0">
                            <i class="bi bi-tags-fill me-2"></i>Análisis por Tipos de Tarea
                        </h4>
                    </div>
                </div>
            </div>
            
            <!-- Gráfica de tipos de fuga -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-pie-chart me-2"></i>Distribución por Tipo de Fuga
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="graficaTipos" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
            
            <!-- Pareto de Tipos de Tarea -->
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-header bg-success text-white">
                        <h5 class="card-title mb-0">
                            <i class="bi bi-bar-chart-steps me-2"></i>Pareto de Tipos de Tarea
                        </h5>
                    </div>
                    <div class="card-body" style="background-color: #FFFFFF; border-radius: 0 0 8px 8px;">
                        <div id="paretoTipos" style="height: 450px; min-width: 300px;"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3">
            <div class="col-12">
                <div class="alert alert-secondary">
                    <small>
                        <i class="bi bi-info-circle me-1"></i>
                        Total de registros procesados: <strong>${items.length}</strong> | 
                        Colonias diferentes: <strong>${datosProcesados.colonias.length}</strong> | 
                        Macros diferentes: <strong>${datosProcesados.macros.length}</strong> |
                        Tipos de fuga: <strong>${datosProcesados.tiposFuga.length}</strong>
                    </small>
                </div>
            </div>
        </div>
    `;

    // Generar todas las gráficas en el nuevo orden
    generarGraficaColonias(datosProcesados.colonias, 'graficaColonias');
    generarParetoColonias(datosProcesados.coloniasPareto, 'paretoColonias');
    generarGraficaMacros(datosProcesados.macros, 'graficaMacros');
    generarParetoMacros(datosProcesados.macrosPareto, 'paretoMacros');
    generarGraficaTiposFuga(datosProcesados.tiposFuga, 'graficaTipos');
    generarParetoTipos(datosProcesados.tiposPareto, 'paretoTipos');
}

// Función para procesar los datos
function procesarDatos(items) {
    const conteoColonias = {};
    const conteoTiposFuga = {};
    const conteoMacros = {};
    const detallesColonias = {};
    const detallesMacros = {};

    items.forEach(item => {
        const colonia = item.colonia || 'Sin colonia especificada';
        const tipoFuga = item.tag_desc || 'Sin tipo especificado';
        const calle = item.calle || 'Sin calle especificada';
        const macro = item.macro || 'Sin macro especificado';
        
        // Contar por colonia
        conteoColonias[colonia] = (conteoColonias[colonia] || 0) + 1;
        
        // Contar por tipo de fuga
        conteoTiposFuga[tipoFuga] = (conteoTiposFuga[tipoFuga] || 0) + 1;
        
        // Contar por macro
        conteoMacros[macro] = (conteoMacros[macro] || 0) + 1;
        
        // Agrupar detalles por colonia
        if (!detallesColonias[colonia]) {
            detallesColonias[colonia] = {
                tipos: {},
                calles: new Set(),
                totalFugas: 0
            };
        }
        detallesColonias[colonia].tipos[tipoFuga] = (detallesColonias[colonia].tipos[tipoFuga] || 0) + 1;
        detallesColonias[colonia].calles.add(calle);
        detallesColonias[colonia].totalFugas = conteoColonias[colonia];
        
        // Agrupar detalles por macro
        if (!detallesMacros[macro]) {
            detallesMacros[macro] = {
                tipos: {},
                colonias: new Set(),
                totalFugas: 0
            };
        }
        detallesMacros[macro].tipos[tipoFuga] = (detallesMacros[macro].tipos[tipoFuga] || 0) + 1;
        detallesMacros[macro].colonias.add(colonia);
        detallesMacros[macro].totalFugas = conteoMacros[macro];
    });

    // Convertir a arrays para Highcharts
    const datosColonias = Object.entries(conteoColonias).map(([colonia, cantidad]) => ({
        name: colonia,
        y: cantidad,
        detalles: detallesColonias[colonia]
    })).sort((a, b) => b.y - a.y);

    const datosTiposFuga = Object.entries(conteoTiposFuga).map(([tipo, cantidad]) => ({
        name: tipo,
        y: cantidad
    })).sort((a, b) => b.y - a.y);

    const datosMacros = Object.entries(conteoMacros).map(([macro, cantidad]) => ({
        name: `Macro ${macro}`,
        y: cantidad,
        macro: macro,
        detalles: detallesMacros[macro]
    })).sort((a, b) => b.y - a.y);

    // Calcular datos Pareto
    const coloniasPareto = calcularDatosPareto(datosColonias);
    const macrosPareto = calcularDatosPareto(datosMacros);
    const tiposPareto = calcularDatosPareto(datosTiposFuga);

    return {
        colonias: datosColonias,
        tiposFuga: datosTiposFuga,
        macros: datosMacros,
        coloniasPareto: coloniasPareto,
        macrosPareto: macrosPareto,
        tiposPareto: tiposPareto
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
            porcentajeAcumulado: (acumulado / total) * 100,
            detalles: item.detalles || {}
        };
    });
}

// ========== GRÁFICA DE COLONIAS ==========
function generarGraficaColonias(datos, contenedorId) {
    try {
        const cantidadColonias = datos.length;
        const configLabelsX = calcularConfiguracionLabelsX(cantidadColonias);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF',
                marginBottom: 150,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                scrollablePlotArea: {
                    minWidth: cantidadColonias * 60,
                    scrollPositionX: 0
                },
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Distribución de Fugas por Colonia',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: `Total de colonias: ${cantidadColonias} - Desplaza horizontalmente para ver todas`,
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Colonias',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '14',
                        color: '#000000'
                    }
                },
                labels: {
                    rotation: configLabelsX.rotation,
                    style: {
                        fontSize: '8px',
                        textOverflow: 'none',
                        whiteSpace: 'nowrap',
                        fontFamily: 'Arial, sans-serif',
                        color: '#000000'
                    },
                    align: 'right',
                    x: 0,
                    y: 10
                },
                lineColor: '#000000',
                lineWidth: 1,
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Fugas',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#000000'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                tickInterval: 1,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.2)'
            },
            legend: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                headerFormat: '<span style="font-size: 13px; font-weight: bold; color: #000000;">{point.key}</span><br/>',
                pointFormatter: function() {
                    let tooltip = `
                        <b style="color: #000000;">Total fugas:</b> ${this.y}<br/>
                        <b style="color: #000000;">Calles afectadas:</b> ${this.detalles.calles.size}<br/>
                        <br/>
                        <b style="color: #000000;">Desglose por tipo:</b><br/>
                        <table style="width: 100%; border-collapse: collapse;">
                    `;
                    
                    const tiposOrdenados = Object.entries(this.detalles.tipos)
                        .sort((a, b) => b[1] - a[1]);
                    
                    tiposOrdenados.forEach(([tipo, cantidad]) => {
                        tooltip += `
                            <tr>
                                <td style="padding: 2px 5px; border-bottom: 1px dotted #666; color: #000000;">${tipo}:</td>
                                <td style="padding: 2px 5px; text-align: right; font-weight: bold; border-bottom: 1px dotted #666; color: #000000;">${cantidad}</td>
                            </tr>
                        `;
                    });
                    
                    tooltip += '</table>';
                    return tooltip;
                },
                style: {
                    fontSize: '12px',
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000'
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    pointPadding: 0.1,
                    groupPadding: 0.1,
                    dataLabels: {
                        enabled: true,
                        inside: false,
                        align: 'center',
                        verticalAlign: 'top',
                        format: '{point.y}',
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'bold',
                            color: '#000000',
                            textOutline: 'none'
                        },
                        y: -25,
                        shadow: false
                    }
                }
            },
            series: [{
                name: 'Fugas',
                colorByPoint: true,
                data: datos,
                colors: [
                    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
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
        console.error('Error al generar gráfica de colonias:', error);
        mostrarError('Error al generar la gráfica: ' + error.message);
    }
}

// ========== PARETO DE COLONIAS ==========
function generarParetoColonias(datos, contenedorId) {
    try {
        const configLabelsX = calcularConfiguracionLabelsX(datos.length);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF',
                marginBottom: 150,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                scrollablePlotArea: {
                    minWidth: datos.length * 60,
                    scrollPositionX: 0
                },
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Análisis Pareto - Colonias',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Frecuencia de fugas y porcentaje acumulado - Desplaza horizontalmente para ver todas',
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Colonias',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    rotation: configLabelsX.rotation,
                    style: {
                        fontSize: '8px',
                        color: '#000000'
                    },
                    align: 'right',
                    x: 0,
                    y: 10
                },
                lineColor: '#000000'
            },
            yAxis: [{
                title: {
                    text: 'Cantidad de Fugas',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.2)'
            }, {
                title: {
                    text: 'Porcentaje Acumulado (%)',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                max: 100,
                opposite: true,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
            }],
            tooltip: {
                useHTML: true,
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                style: {
                    color: '#000000'
                },
                borderColor: '#000000',
                formatter: function() {
                    const punto = this.points[0].point;
                    let tooltip = `
                        <b style="color: #000000;">${punto.name}</b><br/>
                        <b style="color: #000000;">Total fugas:</b> ${punto.y}<br/>
                        <b style="color: #000000;">Porcentaje individual:</b> ${punto.porcentaje.toFixed(1)}%<br/>
                        <b style="color: #000000;">Porcentaje acumulado:</b> ${punto.porcentajeAcumulado.toFixed(1)}%<br/>
                        <b style="color: #000000;">Calles afectadas:</b> ${punto.detalles.calles.size}<br/>
                    `;
                    
                    if (punto.detalles.tipos && Object.keys(punto.detalles.tipos).length > 0) {
                        tooltip += `<br/><b style="color: #000000;">Desglose por tipo:</b><br/>
                                   <table style="width: 100%; border-collapse: collapse;">`;
                        
                        const tiposOrdenados = Object.entries(punto.detalles.tipos)
                            .sort((a, b) => b[1] - a[1]);
                        
                        tiposOrdenados.forEach(([tipo, cantidad]) => {
                            tooltip += `
                                <tr>
                                    <td style="padding: 2px 5px; border-bottom: 1px dotted #666; color: #000000;">${tipo}:</td>
                                    <td style="padding: 2px 5px; text-align: right; font-weight: bold; border-bottom: 1px dotted #666; color: #000000;">${cantidad}</td>
                                </tr>
                            `;
                        });
                        
                        tooltip += '</table>';
                    }
                    
                    return tooltip;
                }
            },
            series: [{
                name: 'Fugas',
                type: 'column',
                data: datos,
                color: '#3498DB',
                yAxis: 0
            }, {
                name: 'Porcentaje',
                type: 'scatter',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentaje
                })),
                color: '#2ECC71',
                marker: {
                    symbol: 'circle',
                    radius: 4
                },
                yAxis: 1
            }, {
                name: 'Acumulado',
                type: 'spline',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentajeAcumulado
                })),
                color: '#E74C3C',
                lineWidth: 3,
                marker: {
                    enabled: false
                },
                yAxis: 1
            }],
            credits: {
                enabled: false
            }
        });
        
    } catch (error) {
        console.error('Error al generar Pareto de colonias:', error);
    }
}

// ========== GRÁFICA DE BARRAS POR MACRO ==========
function generarGraficaMacros(datos, contenedorId) {
    try {
        const configLabelsX = calcularConfiguracionLabelsX(datos.length);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF',
                marginBottom: 100,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                scrollablePlotArea: {
                    minWidth: datos.length * 60,
                    scrollPositionX: 0
                },
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Distribución de Fugas por Macro',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: `Total de macros: ${datos.length} - Desplaza horizontalmente para ver todas`,
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Macros',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '8px',
                        color: '#000000'
                    }
                },
                labels: {
                    rotation: configLabelsX.rotation,
                    style: {
                        fontSize: '14px',
                        textOverflow: 'none',
                        whiteSpace: 'nowrap',
                        color: '#000000'
                    },
                    align: 'right',
                    x: 0,
                    y: 10
                },
                lineColor: '#000000'
            },
            yAxis: {
                title: {
                    text: 'Cantidad de Fugas',
                    style: {
                        fontWeight: 'bold',
                        fontSize: '14',
                        color: '#000000'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.2)'
            },
            legend: {
                enabled: false
            },
            tooltip: {
                useHTML: true,
                headerFormat: '<span style="font-size: 13px; font-weight: bold; color: #000000;">{point.key}</span><br/>',
                pointFormatter: function() {
                    let tooltip = `
                        <b style="color: #000000;">Total fugas:</b> ${this.y}<br/>
                        <b style="color: #000000;">Colonias afectadas:</b> ${this.detalles.colonias.size}<br/>
                        <br/>
                        <b style="color: #000000;">Desglose por tipo:</b><br/>
                        <table style="width: 100%; border-collapse: collapse;">
                    `;
                    
                    const tiposOrdenados = Object.entries(this.detalles.tipos)
                        .sort((a, b) => b[1] - a[1]);
                    
                    tiposOrdenados.forEach(([tipo, cantidad]) => {
                        tooltip += `
                            <tr>
                                <td style="padding: 2px 5px; border-bottom: 1px dotted #666; color: #000000;">${tipo}:</td>
                                <td style="padding: 2px 5px; text-align: right; font-weight: bold; border-bottom: 1px dotted #666; color: #000000;">${cantidad}</td>
                            </tr>
                        `;
                    });
                    
                    tooltip += '</table>';
                    return tooltip;
                },
                style: {
                    fontSize: '12px',
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000'
            },
            plotOptions: {
                column: {
                    borderWidth: 0,
                    pointPadding: 0.1,
                    groupPadding: 0.1,
                    dataLabels: {
                        enabled: true,
                        inside: false,
                        align: 'center',
                        verticalAlign: 'top',
                        format: '{point.y}',
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: 'bold',
                            color: '#000000',
                            textOutline: 'none'
                        },
                        y: -25,
                        shadow: false
                    }
                }
            },
            series: [{
                name: 'Fugas',
                colorByPoint: true,
                data: datos,
                colors: [
                    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
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
        console.error('Error al generar gráfica de macros:', error);
    }
}

// ========== PARETO DE MACROS ==========
function generarParetoMacros(datos, contenedorId) {
    try {
        const configLabelsX = calcularConfiguracionLabelsX(datos.length);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF',
                marginBottom: 100,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                scrollablePlotArea: {
                    minWidth: datos.length * 60,
                    scrollPositionX: 0
                },
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Análisis Pareto - Macros',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Frecuencia de fugas por macro y porcentaje acumulado - Desplaza horizontalmente para ver todas',
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Macros',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    rotation: configLabelsX.rotation,
                    style: {
                        fontSize: '8px',
                        color: '#000000'
                    },
                    align: 'right',
                    x: 0,
                    y: 10
                },
                lineColor: '#000000'
            },
            yAxis: [{
                title: {
                    text: 'Cantidad de Fugas',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.2)'
            }, {
                title: {
                    text: 'Porcentaje Acumulado (%)',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                max: 100,
                opposite: true,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
            }],
            tooltip: {
                useHTML: true,
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                style: {
                    color: '#000000'
                },
                borderColor: '#000000',
                formatter: function() {
                    const punto = this.points[0].point;
                    let tooltip = `
                        <b style="color: #000000;">${punto.name}</b><br/>
                        <b style="color: #000000;">Total fugas:</b> ${punto.y}<br/>
                        <b style="color: #000000;">Porcentaje individual:</b> ${punto.porcentaje.toFixed(1)}%<br/>
                        <b style="color: #000000;">Porcentaje acumulado:</b> ${punto.porcentajeAcumulado.toFixed(1)}%<br/>
                        <b style="color: #000000;">Colonias afectadas:</b> ${punto.detalles.colonias.size}<br/>
                    `;
                    
                    if (punto.detalles.tipos && Object.keys(punto.detalles.tipos).length > 0) {
                        tooltip += `<br/><b style="color: #000000;">Desglose por tipo:</b><br/>
                                   <table style="width: 100%; border-collapse: collapse;">`;
                        
                        const tiposOrdenados = Object.entries(punto.detalles.tipos)
                            .sort((a, b) => b[1] - a[1]);
                        
                        tiposOrdenados.forEach(([tipo, cantidad]) => {
                            tooltip += `
                                <tr>
                                    <td style="padding: 2px 5px; border-bottom: 1px dotted #666; color: #000000;">${tipo}:</td>
                                    <td style="padding: 2px 5px; text-align: right; font-weight: bold; border-bottom: 1px dotted #666; color: #000000;">${cantidad}</td>
                                </tr>
                            `;
                        });
                        
                        tooltip += '</table>';
                    }
                    
                    return tooltip;
                }
            },
            series: [{
                name: 'Fugas',
                type: 'column',
                data: datos,
                color: '#3498DB',
                yAxis: 0
            }, {
                name: 'Porcentaje',
                type: 'scatter',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentaje
                })),
                color: '#2ECC71',
                marker: {
                    symbol: 'circle',
                    radius: 4
                },
                yAxis: 1
            }, {
                name: 'Acumulado',
                type: 'spline',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentajeAcumulado
                })),
                color: '#E74C3C',
                lineWidth: 3,
                marker: {
                    enabled: false
                },
                yAxis: 1
            }],
            credits: {
                enabled: false
            }
        });
        
    } catch (error) {
        console.error('Error al generar Pareto de macros:', error);
    }
}

// ========== GRÁFICA DE TIPOS DE FUGA ==========
function generarGraficaTiposFuga(datos, contenedorId) {
    try {
        Highcharts.chart(contenedorId, {
            chart: {
                type: 'pie',
                backgroundColor: '#FFFFFF',
		marginBottom: 30,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                margin: [0, 0, 0, 0],
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Distribución por Tipo de Fuga',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: `Total de tipos: ${datos.length}`,
                style: {
                    color: '#333333'
                }
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y} fugas)',
                style: {
                    color: '#000000'
                },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#000000'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}',
                        distance: 30,
                        connectorWidth: 1,
                        connectorColor: '#000000',
                        style: {
                            fontWeight: 'bold',
                            color: '#000000',
                            textOutline: 'none',
                            fontSize: '11px'
                        }
                    },
                    showInLegend: false,
                    size: '85%'
                }
            },
            series: [{
                name: 'Fugas',
                colorByPoint: true,
                data: datos,
                colors: [
                    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
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
        console.error('Error al generar gráfica de tipos:', error);
    }
}

// ========== PARETO DE TIPOS DE TAREA ==========
function generarParetoTipos(datos, contenedorId) {
    try {
        const configLabelsX = calcularConfiguracionLabelsX(datos.length);

        Highcharts.chart(contenedorId, {
            chart: {
                type: 'column',
                backgroundColor: '#FFFFFF',
                marginBottom: 250,
                marginTop: 50,
                marginRight: 50,
                marginLeft: 50,
                height: 450,
                scrollablePlotArea: {
                    minWidth: datos.length * 60,
                    scrollPositionX: 0
                },
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            title: {
                text: 'Análisis Pareto - Tipos de Tarea',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#000000'
                }
            },
            subtitle: {
                text: 'Frecuencia por tipo de tarea y porcentaje acumulado - Desplaza horizontalmente para ver todas',
                style: {
                    color: '#333333'
                }
            },
            xAxis: {
                type: 'category',
                title: {
                    text: 'Tipos de Tarea',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    rotation: configLabelsX.rotation,
                    style: {
                        fontSize: '8px',
                        color: '#000000'
                    },
                    align: 'right',
                    x: 0,
                    y: 10
                },
                lineColor: '#000000'
            },
            yAxis: [{
                title: {
                    text: 'Cantidad de Fugas',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.2)'
            }, {
                title: {
                    text: 'Porcentaje Acumulado (%)',
                    style: {
                        fontWeight: 'bold',
                        color: '#000000'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#000000'
                    }
                },
                min: 0,
                max: 100,
                opposite: true,
                lineColor: '#000000',
                gridLineColor: 'rgba(0, 0, 0, 0.1)'
            }],
            tooltip: {
                useHTML: true,
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                style: {
                    color: '#000000'
                },
                borderColor: '#000000',
                formatter: function() {
                    const punto = this.points[0].point;
                    return `
                        <b style="color: #000000;">${punto.name}</b><br/>
                        <b style="color: #000000;">Total fugas:</b> ${punto.y}<br/>
                        <b style="color: #000000;">Porcentaje individual:</b> ${punto.porcentaje.toFixed(1)}%<br/>
                        <b style="color: #000000;">Porcentaje acumulado:</b> ${punto.porcentajeAcumulado.toFixed(1)}%<br/>
                    `;
                }
            },
            series: [{
                name: 'Fugas',
                type: 'column',
                data: datos,
                color: '#3498DB',
                yAxis: 0
            }, {
                name: 'Porcentaje',
                type: 'scatter',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentaje
                })),
                color: '#2ECC71',
                marker: {
                    symbol: 'circle',
                    radius: 4
                },
                yAxis: 1
            }, {
                name: 'Acumulado',
                type: 'spline',
                data: datos.map(item => ({
                    name: item.name,
                    y: item.porcentajeAcumulado
                })),
                color: '#E74C3C',
                lineWidth: 3,
                marker: {
                    enabled: false
                },
                yAxis: 1
            }],
            credits: {
                enabled: false
            }
        });
        
    } catch (error) {
        console.error('Error al generar Pareto de tipos:', error);
    }
}

// FUNCIÓN ESPECÍFICA PARA CÁLCULO DINÁMICO DE LABELS X
function calcularConfiguracionLabelsX(cantidadColonias) {
    let fontSize, marginBottom, rotation;
    
    if (cantidadColonias <= 10) {
        fontSize = '12px';
        marginBottom = 80;
        rotation = -90;
    } else if (cantidadColonias <= 20) {
        fontSize = '11px';
        marginBottom = 80;
        rotation = -90;
    } else if (cantidadColonias <= 30) {
        fontSize = '10px';
        marginBottom = 80;
        rotation = -90;
    } else if (cantidadColonias <= 40) {
        fontSize = '9px';
        marginBottom = 80;
        rotation = -90;
    } else {
        fontSize = '8px';
        marginBottom = 80;
        rotation = -45;
    }
    
    return { fontSize, marginBottom, rotation };
}

// Función para mostrar errores
function mostrarError(mensaje) {
    const resultadoDiv = document.getElementById('resultados');
    resultadoDiv.innerHTML = `
        <div class="alert alert-danger">
            <h5 class="alert-heading">
                <i class="bi bi-exclamation-triangle me-2"></i>Error
            </h5>
            <p class="mb-0">${mensaje}</p>
        </div>
    `;
}