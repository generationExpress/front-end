document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form");

  if (form) {
    form.addEventListener("submit", function (event) {
      let isValid = true;
      let errorMessage = "";

      const nombre = form.querySelector('[name="nombre"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const asunto = form.querySelector('[name="asunto"]').value.trim();
      const mensaje = form.querySelector('[name="mensaje"]').value.trim();

      if (nombre.length < 3) {
        isValid = false;
        errorMessage += "El nombre debe tener al menos 3 caracteres.\n";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        isValid = false;
        errorMessage += "Por favor, ingresa un correo electrónico válido.\n";
      }


      if (asunto.length < 5) {
        isValid = false;
        errorMessage += "El asunto debe tener al menos 5 caracteres.\n";
      }

      
      if (mensaje.length < 10) {
        isValid = false;
        errorMessage += "El mensaje debe tener al menos 10 caracteres.\n";
      }

      if (!isValid) {
        event.preventDefault();
        Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: errorMessage,
          confirmButtonColor: '#198754'
        });
      }
    });
  }
});
