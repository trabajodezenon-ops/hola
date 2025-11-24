// apiService.js
const API_BASE_URL = 'http://localhost:3000';

export const obtenerDatosAPI = async (fechaInicio, fechaTermino) => {
    try {
        // Convertir formato de fecha de YYYY-MM-DD a DD/MM/YYYY
        const formatDate = (dateString) => {
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        };

        const datos = {
            fechaInicio: formatDate(fechaInicio),
            fechaTermino: formatDate(fechaTermino),
        };

        console.log('Enviando datos al servidor:', datos);

        const response = await fetch(`${API_BASE_URL}/api/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const resultado = await response.json();
        return resultado;

    } catch (error) {
        console.error('Error en apiService:', error);
        throw error;
    }
};