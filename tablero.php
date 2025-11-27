<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard de Fugas</title>
    <!-- Bootstrap CSS -->
    <link href="cdns/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="estiloTablero.css">
    
    <!-- HIGHCHARTS STOCK - DEBE IR PRIMERO -->
    <script src="https://code.highcharts.com/stock/highstock.js"></script>
    <script src="https://code.highcharts.com/stock/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/stock/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/stock/modules/accessibility.js"></script>
    
    <!-- ESTILOS GÓTICOS PARA ALERTAS -->
    <style>
        .highcharts-data-label tspan { 
            font-weight: bold; 
        }
        .card { margin-bottom: 20px; }
        #resultados { min-height: 300px; }
        
        /* Alertas estilo gótico - Homologadas */
        .gothic-alert-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        }

        .alert-gothic {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #C1121F;
            border-left: 6px solid #C1121F;
            color: #e0d3c1;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.7);
            font-family: 'Georgia', 'Times New Roman', serif;
            position: relative;
            transform: translateX(400px);
            opacity: 0;
            transition: all 0.3s ease-in-out;
            max-width: 350px;
        }

        .alert-gothic.show {
            transform: translateX(0);
            opacity: 1;
        }

        .alert-gothic.hide {
            transform: translateX(400px);
            opacity: 0;
        }

        .alert-gothic-error {
            border-left-color: #8b0000;
            border-color: #660000;
            background: linear-gradient(135deg, #2a0000 0%, #1a0000 100%);
        }

        .alert-gothic-success {
            border-left-color: #1E3A5F;
            border-color: #0A1F3F;
            background: linear-gradient(135deg, #001a33 0%, #00264d 100%);
        }

        .gothic-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .gothic-icon {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
        }

        .gothic-skull {
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0d3c1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-5 6c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>') no-repeat center;
        }

        .gothic-rose {
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e0d3c1"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>') no-repeat center;
        }

        .gothic-message {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }

        .gothic-close {
            background: none;
            border: none;
            color: #e0d3c1;
            cursor: pointer;
            padding: 5px;
            position: absolute;
            top: 8px;
            right: 8px;
            font-size: 16px;
            transition: color 0.3s ease;
        }

        .gothic-close:hover {
            color: #C1121F;
        }

        .gothic-cross {
            font-family: 'Georgia', serif;
            font-weight: bold;
        }

        .alert-gothic::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 1px solid rgba(193, 18, 31, 0.3);
            border-radius: 8px;
            pointer-events: none;
        }
        
        /* Botón cerrar sesión */
        .btn-logout {
            background: linear-gradient(135deg, #C1121F 0%, #a50e18 100%);
            color: #FFFFFF;
            border: 2px solid #E0E0E0;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-left: 10px;
            font-size: 12px;
        }
        
        .btn-logout:hover {
            background: linear-gradient(135deg, #a50e18 0%, #8a0c15 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(193, 18, 31, 0.4);
        }
        
        .user-info {
            color: #E0E0E0;
            font-size: 12px;
            margin-right: 10px;
        }

        /* Estilos para los filtros en el nav - MÁS COMPACTOS */
        .nav-filters {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .nav-filters .filter-group {
            display: flex;
            flex-direction: column;
        }

        .nav-filters label {
            color: #E0E0E0;
            font-size: 10px;
            margin-bottom: 2px;
            font-weight: 500;
        }

        .nav-filters .form-control {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #E0E0E0;
            border: 1px solid #C1121F;
            border-radius: 4px;
            padding: 4px 8px;
            width: 120px;
            font-size: 11px;
            height: 28px;
            transition: all 0.3s ease;
        }

        .nav-filters .form-control:focus {
            border-color: #E0E0E0;
            box-shadow: 0 0 6px rgba(193, 18, 31, 0.5);
            background: linear-gradient(135deg, #2a2a2a 0%, #3d3d3d 100%);
            color: #E0E0E0;
            outline: none;
        }

        /* Icono calendario en blanco */
        .nav-filters input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
            width: 12px;
            height: 12px;
        }

        .nav-filters input[type="date"]::-moz-calendar-picker-indicator {
            filter: invert(1);
        }

        .btn-generar-nav {
            background: linear-gradient(135deg, #C1121F 0%, #a50e18 100%);
            color: #FFFFFF;
            border: 1px solid #E0E0E0;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            transition: all 0.3s ease;
            margin-top: 14px;
            white-space: nowrap;
            font-size: 11px;
            height: 28px;
        }

        .btn-generar-nav:hover {
            background: linear-gradient(135deg, #a50e18 0%, #8a0c15 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(193, 18, 31, 0.4);
        }

        .btn-generar-nav:disabled {
            background: linear-gradient(135deg, #666 0%, #888 100%);
            border-color: #999;
            transform: none;
            box-shadow: none;
        }

        /* Responsive para nav filters */
        @media (max-width: 1200px) {
            .nav-filters {
                gap: 6px;
            }
            
            .nav-filters .form-control {
                width: 110px;
            }
        }

        @media (max-width: 992px) {
            .nav-filters {
                justify-content: center;
                margin-top: 8px;
            }
        }

        /* Eliminar el contenedor de filtros original */
        .filters-container {
            display: none;
        }

        /* Estilos para controles de tamaño en gráficas Stock */
        .size-controls {
            display: flex;
            gap: 5px;
            align-items: center;
        }

        .size-btn {
            padding: 4px 8px;
            font-size: 12px;
        }

        /* Estilos para el menú desplegable de navegación - MÁS COMPACTO */
        .nav-menu {
            margin-right: 15px;
        }

        .nav-menu .dropdown-toggle {
            background: linear-gradient(135deg, #1E3A5F 0%, #0A1F3F 100%);
            color: #E0E0E0;
            border: 1px solid #C1121F;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            transition: all 0.3s ease;
            width: 32px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .nav-menu .dropdown-toggle::after {
            margin-left: 0;
        }

        .nav-menu .dropdown-toggle:hover {
            background: linear-gradient(135deg, #2A4A7F 0%, #1A3A6F 100%);
            border-color: #E0E0E0;
            transform: translateY(-2px);
        }

        .nav-menu .dropdown-menu {
            background: linear-gradient(135deg, #1E3A5F 0%, #0A1F3F 100%);
            border: 1px solid #C1121F;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            min-width: 120px;
        }

        .nav-menu .dropdown-item {
            color: #E0E0E0;
            padding: 6px 10px;
            font-size: 11px;
            transition: all 0.3s ease;
        }

        .nav-menu .dropdown-item:hover {
            background: linear-gradient(135deg, #2A4A7F 0%, #1A3A6F 100%);
            color: #FFFFFF;
        }

        .nav-menu .dropdown-item.active {
            background: linear-gradient(135deg, #C1121F 0%, #a50e18 100%);
            color: #FFFFFF;
            font-weight: bold;
        }

        /* Indicador de página activa */
        .page-indicator {
            font-size: 9px;
            color: #FFFFFF;
            font-weight: bold;
            margin-left: 4px;
            background: rgba(255, 255, 255, 0.2);
            padding: 1px 4px;
            border-radius: 2px;
        }

        /* Layout mejorado para la barra de navegación */
        #barraPrincipal .container-fluid {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        }

        .nav-left-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .nav-center-section {
            display: flex;
            align-items: center;
            flex: 1;
            justify-content: center;
        }

        .nav-right-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Logo más compacto */
        #barraPrincipal img#logo {
            height: 35px;
            filter: brightness(0) invert(1);
        }
    </style>
</head>
<body>
    <!-- Contenedor para alertas flotantes -->
    <div id="alertContainer" class="gothic-alert-container"></div>
    
    <nav class="navbar navbar-expand-lg" id="barraPrincipal">
        <div class="container-fluid">
            <!-- Sección izquierda: Logo y Menú -->
            <div class="nav-left-section">
                <img src="imag-icons/LogoBlanco.png" alt="LOGO" id="logo">
                
                <!-- Menú desplegable de navegación -->
                <div class="nav-menu">
                    <div class="dropdown">
                        <button class="btn dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-layout-split"></i>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li>
                                <a class="dropdown-item active" href="tablero.php">
                                    <i class="bi bi-bar-chart me-2"></i>General
                                    <span class="page-indicator">Actual</span>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="tablero2.php">
                                    <i class="bi bi-bar-chart-line me-2"></i>Detalle
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" href="mapa.php">
                                    <i class="bi bi-bar-chart-line me-2"></i>Mapa Interactivo
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- Sección central: Filtros -->
            <div class="nav-center-section">
                <div class="nav-filters">
                    <div class="filter-group">
                        <label for="fechaInicio">
                            <i class="bi bi-calendar-event me-1"></i>Inicio
                        </label>
                        <input type="date" id="fechaInicio" name="fechaInicio" class="form-control">
                    </div>
                    
                    <div class="filter-group">
                        <label for="fechaTermino">
                            <i class="bi bi-calendar-check me-1"></i>Término
                        </label>
                        <input type="date" id="fechaTermino" name="fechaTermino" class="form-control">
                    </div>
                    
                    <button type="button" class="btn btn-generar-nav" id="btnGenerar">
                        <i class="bi bi-graph-up me-1"></i>Generar Graficas
                    </button>
                </div>
            </div>

            <!-- Sección derecha: Usuario y Cerrar Sesión -->
            <div class="nav-right-section">
                <span class="user-info">
                    <i class="bi bi-person-circle me-1"></i>
                    <span id="userName">Usuario</span>
                </span>
                <button type="button" class="btn btn-logout" id="btnLogout">
                    <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <!-- Contenedor para resultados -->
        <div id="resultados">
            <div class="alert alert-info text-center" style="background: linear-gradient(135deg, #1E3A5F 0%, #0A1F3F 100%); border: 2px solid #C1121F; color: #E0E0E0;">
                <i class="bi bi-bar-chart-fill me-2"></i>
                Complete los filtros y haga clic en "Generar Gráficas" para visualizar los datos
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Scripts de verificación de sesión y funcionalidad -->
    <script type="module">
        // Importar módulos
        import { verificarSesion, cerrarSesion } from './verificarSesion.js';
        import { mostrarAlertaGotica, limpiarAlertasGoticas } from './alertasGoticas.js';

        // Verificar sesión al cargar
        document.addEventListener('DOMContentLoaded', function() {
            if (!verificarSesion()) {
                mostrarAlertaGotica('Sesión no válida. Redirigiendo al login...', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            // Mostrar nombre de usuario
            const usuario = sessionStorage.getItem('Usuario');
            if (usuario) {
                document.getElementById('userName').textContent = usuario;
            }

            // Botón cerrar sesión
            document.getElementById('btnLogout').addEventListener('click', function() {
                mostrarAlertaGotica('Cerrando sesión...', 'success');
                setTimeout(() => {
                    cerrarSesion();
                }, 1500);
            });

            // Establecer fechas por defecto (últimos 30 días)
            const today = new Date();
            const lastMonth = new Date();
            lastMonth.setDate(today.getDate() - 30);

            document.getElementById('fechaInicio').valueAsDate = lastMonth;
            document.getElementById('fechaTermino').valueAsDate = today;

            // Mostrar mensaje de bienvenida
            setTimeout(() => {
                mostrarAlertaGotica(`Bienvenido ${usuario || 'Usuario '}`, 'success');
            }, 500);

            // Detectar página actual y resaltar en el menú
            const currentPage = window.location.pathname.split('/').pop();
            const menuItems = document.querySelectorAll('.dropdown-item');
            
            menuItems.forEach(item => {
                // Remover clase active de todos los items
                item.classList.remove('active');
                
                // Verificar si este item corresponde a la página actual
                const itemHref = item.getAttribute('href');
                if (itemHref === currentPage) {
                    item.classList.add('active');
                    
                    // Agregar indicador "Actual" si no existe
                    if (!item.querySelector('.page-indicator')) {
                        const indicator = document.createElement('span');
                        indicator.className = 'page-indicator';
                        indicator.textContent = 'Actual';
                        item.appendChild(indicator);
                    }
                } else {
                    // Remover indicador de otros items
                    const existingIndicator = item.querySelector('.page-indicator');
                    if (existingIndicator) {
                        existingIndicator.remove();
                    }
                }
            });
        });

        // Función global para mostrar alertas (para uso en otros scripts)
        window.mostrarAlerta = function(mensaje, tipo = 'info') {
            mostrarAlertaGotica(mensaje, tipo);
        };

        // Función global para limpiar alertas
        window.limpiarAlertas = function() {
            limpiarAlertasGoticas();
        };
    </script>
    
    <!-- Tu archivo JS principal -->
    <script type="module" src="script.js"></script>
</body>
</html>