// Asegurar que el DOM esté listo
let id = 1;

document.addEventListener('DOMContentLoaded', () => {
    
    const solicitud = document.getElementById('form-solicitud');
    const tabla = document.getElementById('tabla-solicitudes');

    // Validación de seguridad para evitar errores en consola
    if (!solicitud) {
        console.error("No se encontró el formulario con el ID 'form-solicitud'");
        return;
    }

    solicitud.addEventListener('submit', (event) => {
        // 1. Evitamos que la página se recargue
        event.preventDefault();

        // 2. Capturamos los datos del formulario
        const formData = new FormData(solicitud);

        // 3. Convertir FormData a un objeto plano de JS
        const datosObjeto = Object.fromEntries(formData);

        // 4. Conversión del peso a tipo numérico flotante
        if (datosObjeto.weight) {
            datosObjeto.weight = parseFloat(datosObjeto.weight);
        }

        // Calcular el valor del envío
        const valor = calcularValor(datosObjeto.weight, datosObjeto.type_shipping, datosObjeto.origin, datosObjeto.destination);
        
        // LE PASAMOS LA TABLA COMO PARÁMETRO PARA QUE LA FUNCIÓN PUEDA USARLA
        ingresarSolicitud(tabla, id, datosObjeto.type_shipping, datosObjeto.contact_name, datosObjeto.origin, datosObjeto.destination, datosObjeto.weight, valor);
        
        id++; 
        
        // Opcional: Resetea el formulario para que quede limpio tras agregar la fila
        solicitud.reset();
    });
});

function calcularValor(peso, tipo, origen, destino) {
    const valorNacional = 5000;
    const valorInternacional = 50000;
    const valorExpress = 10000;
    const valorKg = 1000;
    const recargoNacional = 5000;

    if (tipo === "Nacional") {
        if (origen === destino) {
            return valorNacional + (valorKg * peso); 
        } else {
            return valorNacional + recargoNacional + (valorKg * peso);
        }
    } else if (tipo === "Internacional") {
        return valorInternacional + (valorKg * peso);
    } else if (tipo === "Express") {
        return valorNacional + valorExpress + (peso * valorKg);
    } else {
        return 0;
    }
}

// RECIBE LA TABLA AQUÍ
function ingresarSolicitud(tablaElemento, id, tipo, cliente, origen, destino, peso, valor) {
    if (!tablaElemento) return; // Validación por seguridad

    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${id}</td>
        <td>${tipo}</td>
        <td>${cliente}</td>
        <td>${origen}</td>
        <td>${destino}</td>
        <td>${peso} kg</td>
        <td>$${valor.toLocaleString('es-CO')}</td>
    `;

 
    // Ahora usamos el parámetro recibido localmente
    tablaElemento.appendChild(fila);
}