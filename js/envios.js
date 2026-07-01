 document.addEventListener('DOMContentLoaded', () => {

            // Referencia al botón de guardar y al formulario
            const btnGuardar = document.getElementById('btn-guardar-envio');
            const form = document.getElementById('shipping-form');

            btnGuardar.addEventListener('click', () => {

                // checkValidity() revisa todos los campos "required" del formulario.
                // Devuelve false si alguno está vacío o con formato incorrecto.
                const esValido = form.checkValidity();

                // "was-validated" activa los estilos de Bootstrap:
                //  - borde verde + ✓ en campos correctos
                //  - borde rojo + mensaje .invalid-feedback en campos incorrectos
                form.classList.add('was-validated');

                if (!esValido) {
                    // El formulario tiene errores → Bootstrap ya muestra los mensajes.
                    // No hacemos nada más, el usuario debe corregir los campos.
                    return;
                }

                // ── FORMULARIO VÁLIDO ──
                // Recopilamos los valores de cada campo por su ID
                const nuevoEnvio = {
                    cliente:          document.getElementById('input-cliente').value,
                    telefono:         document.getElementById('input-telefono').value,
                    origen:           document.getElementById('input-origen').value,
                    destino:          document.getElementById('input-destino').value,
                    peso:             document.getElementById('input-peso').value,
                    estado:           document.getElementById('input-estado').value,
                    entregaEstimada:  document.getElementById('input-entrega').value,
                    vehiculo:         document.getElementById('input-vehiculo').value,
                };

                // TODO: Reemplaza este console.log con tu llamada al backend, por ejemplo:
                // fetch('/api/envios', { method: 'POST', body: JSON.stringify(nuevoEnvio) })
                //   .then(res => res.json())
                //   .then(data => { /* manejar respuesta */ });
                console.log('Nuevo envío registrado:', nuevoEnvio);

                // Cerrar el modal usando la instancia de Bootstrap
                const modalEl = document.getElementById('form-shipping');
                const modalInstancia = bootstrap.Modal.getInstance(modalEl);
                modalInstancia.hide();

                // Limpiar el formulario y quitar los estilos de validación para la próxima vez
                form.reset();
                form.classList.remove('was-validated');
            });

            // Limpiar la validación visual cuando se cierra el modal sin guardar
            // para que la próxima vez que abra aparezca limpio
            document.getElementById('form-shipping').addEventListener('hidden.bs.modal', () => {
                form.reset();
                form.classList.remove('was-validated');
            });
        });