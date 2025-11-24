// animacionesHighcharts.js - Animaciones personalizadas para Highcharts
(function (H) {
    const animateSVGPath = (svgElem, animation, callback = void 0) => {
        // Verificar que el elemento existe y es un path SVG
        if (!svgElem || !svgElem.element || svgElem.element.getTotalLength === undefined) {
            if (callback) callback();
            return;
        }
        
        try {
            const length = svgElem.element.getTotalLength();
            svgElem.attr({
                'stroke-dasharray': length,
                'stroke-dashoffset': length,
                opacity: 1
            });
            svgElem.animate({
                'stroke-dashoffset': 0
            }, animation, callback);
        } catch (error) {
            console.warn('Error en animación SVG:', error);
            if (callback) callback();
        }
    };

    // Solo aplicar animaciones a series de líneas, no a mapas
    const originalLineAnimate = H.seriesTypes.line.prototype.animate;
    H.seriesTypes.line.prototype.animate = function (init) {
        const series = this,
            animation = H.animObject(series.options.animation);
        
        // Solo animar si no es una serie de mapa
        if (!init && series.graph && !series.isMap) {
            animateSVGPath(series.graph, animation);
        } else {
            // Usar animación original para otros casos
            originalLineAnimate.call(this, init);
        }
    };

    H.addEvent(H.Axis, 'afterRender', function () {
        const axis = this,
            chart = axis.chart,
            animation = H.animObject(chart.renderer.globalAnimation);

        // No aplicar animaciones a ejes de mapas
        if (chart.hasLoadedMap) {
            return;
        }

        axis.axisGroup
            // Init
            .attr({
                opacity: 0,
                rotation: -3,
                scaleY: 0.9
            })

            // Animate
            .animate({
                opacity: 1,
                rotation: 0,
                scaleY: 1
            }, animation);
            
        if (axis.horiz) {
            axis.labelGroup
                // Init
                .attr({
                    opacity: 0,
                    rotation: 3,
                    scaleY: 0.5
                })

                // Animate
                .animate({
                    opacity: 1,
                    rotation: 0,
                    scaleY: 1
                }, animation);
        } else {
            axis.labelGroup
                // Init
                .attr({
                    opacity: 0,
                    rotation: 3,
                    scaleX: -0.5
                })

                // Animate
                .animate({
                    opacity: 1,
                    rotation: 0,
                    scaleX: 1
                }, animation);
        }

        if (axis.plotLinesAndBands) {
            axis.plotLinesAndBands.forEach(plotLine => {
                const animation = H.animObject(plotLine.options.animation);

                // Init
                plotLine.label.attr({
                    opacity: 0
                });

                // Animate
                if (plotLine.svgElem) {
                    animateSVGPath(
                        plotLine.svgElem,
                        animation,
                        function () {
                            plotLine.label.animate({
                                opacity: 1
                            });
                        }
                    );
                }
            });
        }
    });
}(Highcharts));