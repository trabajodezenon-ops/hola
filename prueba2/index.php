<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Responsivo</title>
    <!-- Bootstrap CSS -->
    <link href="cdns/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="estiloIndex.css">
    <style>
        .gothic-alert-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        }

        .alert-gothic {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 2px solid #8b4513;
            border-left: 6px solid #8b4513;
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
            border-left-color: #006400;
            border-color: #004d00;
            background: linear-gradient(135deg, #002a00 0%, #001a00 100%);
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
            color: #8b4513;
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
            border: 1px solid rgba(139, 69, 19, 0.3);
            border-radius: 8px;
            pointer-events: none;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <!-- Contenedor para alertas flotantes -->
    <div id="alertContainer" class="gothic-alert-container"></div>
    
    <div class="container">
        <div class="row justify-content-center min-vh-100 align-items-center">
            <div class="col-md-6 col-lg-4">
                <!-- Tarjeta del login -->
                <div class="card shadow">
                    <div class="card-body p-4">
                        <div class="logo-container">
                            <img src="imag-icons/Logo.png" alt="Logo" class="logo">
                        </div>
                        <form id="loginForm">
                            <!-- Campo Usuario -->
                            <div class="mb-3 input-with-icon">
                                <i class="bi bi-person input-icon"></i>
                                <input type="text" class="form-control with-icon" id="User" placeholder="Tu usuario" required>
                            </div>
                            
                            <!-- Campo Contraseña -->
                            <div class="mb-3 input-with-icon">
                                <i class="bi bi-lock input-icon"></i>
                                <input type="password" class="form-control with-icon" id="Paswor" placeholder="Tu contraseña" required>
                            </div>
                            
                            <!-- Botón de login -->
                            <button type="submit" class="btn btn-primary w-100 mb-3">Iniciar Sesión</button>

                        </form>
                    </div>
                </div>                
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="auth.js" type="module"></script>
</body>
</html>