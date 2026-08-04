document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const successMessage = document.getElementById('successMessage');

    if (!form || !successMessage) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const correoIngresado = document.getElementById('correo').value.trim();
        const contrasena = document.getElementById('contrasena').value.trim();

        const usuario = {
            correo: correoIngresado,
            telefono: contrasena
        };

        const drivers = JSON.parse(localStorage.getItem('drivers')) || [];

        const driverEncontrado = drivers.find(driver => driver.email === correoIngresado);

        if (driverEncontrado) {
            localStorage.setItem('loginData', JSON.stringify(usuario));
            localStorage.setItem('driverActual', JSON.stringify(driverEncontrado));

            successMessage.textContent = '¡Bienvenido! Redirigiendo...';
            successMessage.style.display = 'block';
            successMessage.style.color = 'green';

            setTimeout(() => {
                window.location.href = '../pages/mensajero.html';
            }, 1000);
        } else {
            successMessage.textContent = 'Correo no encontrado. Verifique que sea un conductor registrado.';
            successMessage.style.display = 'block';
            successMessage.style.color = 'red';
        }
    });
});
