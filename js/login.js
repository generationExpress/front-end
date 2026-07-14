document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const successMessage = document.getElementById('successMessage');

    if (!form || !successMessage) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const usuario = {
            nombre: document.getElementById('nombre').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            telefono: document.getElementById('telefono').value.trim()
        };

        localStorage.setItem('loginData', JSON.stringify(usuario));

        successMessage.textContent = 'Datos guardados correctamente en el almacenamiento local.';
        successMessage.style.display = 'block';
    });
});
