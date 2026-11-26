export function showCustomAlert(message, type = 'warning', title = 'Thông báo') {
    const container = document.getElementById('custom-alert-container');
    
    let iconClass = 'fa-circle-exclamation warning';
    if (type === 'success') iconClass = 'fa-circle-check success';
    if (type === 'error') iconClass = 'fa-circle-xmark error';

    container.innerHTML = `
        <div class="custom-alert-overlay" id="custom-alert-overlay">
            <div class="custom-alert-box">
                <div class="alert-icon ${type}"><i class="fa-solid ${iconClass}"></i></div>
                <h3 class="alert-title">${title}</h3>
                <p class="alert-message">${message}</p>
            </div>
        </div>
    `;

    setTimeout(() => {
        const overlay = document.getElementById('custom-alert-overlay');
        if (overlay) overlay.classList.add('show');
    }, 10);

    setTimeout(() => {
        const overlay = document.getElementById('custom-alert-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 400); 
        }
    }, 3000);
}