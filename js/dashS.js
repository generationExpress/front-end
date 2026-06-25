let listaSolicitudes = [];
let contadorID = 1; 

const formulario = document.querySelector(".contact-form");
const cuerpoTabla = document.getElementById('cuerpo-tabla');

function guardarSolicitud(evento) {
    evento.preventDefault(); 
    console.log("hola");
    
    const tipoEnvio = document.getElementById("type_shipping").value;
    const origen = document.getElementById("origin").value;
    const destino = document.getElementById("destination").value;
    const peso = document.getElementById("weight").value;
    const nombreContacto = document.getElementById("contact_name").value;
    const telefono = document.getElementById("phone").value;

    console.log(tipoEnvio);
    console.log(origen);
    console.log(destino);
    console.log(peso);
    console.log(nombreContacto);
    console.log(telefono);
    

    const nuevaSolicitud = {
        id: contadorID,
        tipoEnvio: tipoEnvio,
        origen: origen,
        destino: destino,
        peso: peso,
        nombreContacto: nombreContacto,
        telefono: telefono
    };

    console.log(nuevaSolicitud);
    

    listaSolicitudes.push(nuevaSolicitud);
    console.log(listaSolicitudes);
    

    if(cuerpoTabla) {
        const nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `
            <td>${nuevaSolicitud.id}</td>
            <td>${nuevaSolicitud.tipoEnvio}</td>
            <td>${nuevaSolicitud.peso}kg</td>
            <td>${nuevaSolicitud.origen}</td>
            <td>${nuevaSolicitud.destino}</td>
            <td>${nuevaSolicitud.nombreContacto}</td>
            <td>${nuevaSolicitud.telefono}</td>
            <td></td>
        `;
        cuerpoTabla.appendChild(nuevaFila);
    }
    contadorID++;
    formulario.reset();
}

formulario.addEventListener("submit", guardarSolicitud);