// alertasGoticas.js - Funciones para mostrar alertas estilo gótico

export function mostrarAlertaGotica(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer') || crearContenedorAlertas();
    
    const alertClass = type === 'error' ? 'alert-gothic-error' : 
                      type === 'success' ? 'alert-gothic-success' : 'alert-gothic';
    
    const iconClass = type === 'error' ? 'gothic-icon gothic-skull' : 
                     type === 'success' ? 'gothic-icon gothic-rose' : 'gothic-icon gothic-rose';
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert-gothic ${alertClass}`;
    alertDiv.innerHTML = `
        <div class="gothic-content">
            <div class="${iconClass}"></div>
            <div class="gothic-message">${message}</div>
        </div>
        <button type="button" class="gothic-close">
            <div class="gothic-cross">†</div>
        </button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Animación de entrada
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);
    
    // Auto-eliminar después de 5 segundos
    const autoRemove = setTimeout(() => {
        removerAlertaGotica(alertDiv);
    }, 5000);
    
    // Cerrar al hacer click en la X
    const closeBtn = alertDiv.querySelector('.gothic-close');
    closeBtn.addEventListener('click', function() {
        clearTimeout(autoRemove);
        removerAlertaGotica(alertDiv);
    });
}

function crearContenedorAlertas() {
    const container = document.createElement('div');
    container.id = 'alertContainer';
    container.className = 'gothic-alert-container';
    document.body.appendChild(container);
    return container;
}

export function removerAlertaGotica(alertDiv) {
    alertDiv.classList.remove('show');
    alertDiv.classList.add('hide');
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 300);
}

export function limpiarAlertasGoticas() {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        const alerts = alertContainer.querySelectorAll('.alert-gothic');
        alerts.forEach(alert => {
            removerAlertaGotica(alert);
        });
    }
}