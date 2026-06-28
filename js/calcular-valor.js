// Asegurar que el DOM esté listo
let listaSolicitudes = [];
let id = 1;

const formulario = document.querySelector(".contact-form");
const tabla = document.getElementById('tabla-solicitudes');

function guardarSolicitud(event) {
    // 1. Evitamos que la página se recargue
    event.preventDefault();

    const tipoEnvio = document.getElementById("type_shipping").value;
    const origen = document.getElementById("origin").value;
    const destino = document.getElementById("destination").value;
    const pesoInput = document.getElementById("weight").value;
    
    // 4. Conversión del peso a tipo numérico flotante
    const peso = parseFloat(pesoInput) || 0;
    
    const nombreContacto = document.getElementById("contact_name") ? document.getElementById("contact_name").value : "";
    const telefono = document.getElementById("phone") ? document.getElementById("phone").value : "";
    const caracteristicas = document.getElementById("characteristics") ? document.getElementById("characteristics").value : "";
    const imagen = document.getElementById("image") ? document.getElementById("image").value : "";

    // Calcular el valor del envío
    const valor = calcularValor(peso, tipoEnvio, origen, destino);

    const nuevaSolicitud = {
        id: id,
        tipoEnvio: tipoEnvio,
        origen: origen,
        destino: destino,
        peso: peso,
        nombreContacto: nombreContacto,
        telefono: telefono,
        caracteristicas: caracteristicas,
        imagen: imagen,
        valor: valor
    };

    listaSolicitudes.push(nuevaSolicitud);

    if (tabla) {
        const fila = document.createElement('tr');
        const urlImagen = nuevaSolicitud.imagen || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=150';

        fila.innerHTML = `
            <td>${nuevaSolicitud.id}</td>
            <td>${nuevaSolicitud.tipoEnvio}</td>
            <td>${nuevaSolicitud.caracteristicas}</td>
            <td>${nuevaSolicitud.origen}</td>
            <td>${nuevaSolicitud.destino}</td>
            <td>${nuevaSolicitud.peso} kg</td>
            <td>$${nuevaSolicitud.valor.toLocaleString('es-CO')}</td>
            <td>
                <img src="${urlImagen}" alt="Preview" class="img-thumbnail" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            </td>
        `;
        tabla.appendChild(fila);
    }

    id++;

    // Resetea el formulario para que quede limpio tras agregar la fila
    formulario.reset();
}

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

/*
// LE PASAMOS LA TABLA COMO PARÁMETRO PARA QUE LA FUNCIÓN PUEDA USARLA
// RECIBE LA TABLA AQUÍ
function ingresarSolicitud(tablaElemento, id, tipo, caracteristicas, origen, destino, peso, valor) {
    if (!tablaElemento) return; // Validación por seguridad

    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${id}</td>
        <td>${tipo}</td>
        <td>${caracteristicas}</td>
        <td>${origen}</td>
        <td>${destino}</td>
        <td>${peso} kg</td>
        <td>$${valor.toLocaleString('es-CO')}</td>
    `;

    // Ahora usamos el parámetro recibido localmente
    tablaElemento.appendChild(fila);
}
*/

if (formulario) {
    formulario.addEventListener("submit", guardarSolicitud);
}