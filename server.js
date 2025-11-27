// server.js
const express = require('express');
const axios = require('axios');
const https = require('https');

// Configuración - completa estos datos
const authEndpoint = '';
const authUsername = '';
const authPassword = '';
const base_url = '';

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Headers CORS
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Función principal para obtener datos
const obtenerDatosAPI = async (fechaInicio, fechaTermino) => {
    try {
        // 1. Obtener token de autenticación
        const tokenResponse = await axios.post(authEndpoint, 
            'grant_type=client_credentials',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(`${authUsername}:${authPassword}`).toString('base64')}`
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            }
        );

        const tokenData = tokenResponse.data;

        if (!tokenData.access_token) {
            throw new Error('No se pudo obtener access_token');
        }

        // 2. Hacer petición a la API con el token
        const params = {
            'fechaInicio': fechaInicio,
            'fechaFin': fechaTermino,
        };

        console.log('Parámetros enviados a API externa:', params);

        const apiResponse = await axios.get(base_url, {
            params: params,
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'systemFugas/1.0'
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            timeout: 30000
        });

        return {
            success: true,
            message: 'Datos obtenidos correctamente',
            data: apiResponse.data,
            token_info: {
                expires_in: tokenData.expires_in
            }
        };

    } catch (error) {
        console.error('Error en la API:', error);
        
        if (error.response) {
            throw {
                success: false,
                message: 'Error en la API',
                http_code: error.response.status,
                response: error.response.data
            };
        } else if (error.request) {
            throw {
                success: false,
                message: 'Error de conexión: ' + error.message
            };
        } else {
            throw {
                success: false,
                message: 'Error: ' + error.message
            };
        }
    }
};

// Rutas
app.get('/api/data', async (req, res) => {
    try {
        const { fechaInicio, fechaTermino } = req.query;
        const result = await obtenerDatosAPI(fechaInicio, fechaTermino);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const { fechaInicio, fechaTermino } = req.body;
        const result = await obtenerDatosAPI(fechaInicio, fechaTermino);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Servidor funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

module.exports = app;