document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("services-container");
    const emptyState = document.getElementById("empty-services");

    // Validación de seguridad
    if (!container || !emptyState) {
        console.error("No se encontró el contenedor de servicios");
        return;
    }

    const solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

    console.log("Solicitudes cargadas:", solicitudes);

    if (solicitudes.length === 0) {
        emptyState.classList.remove("d-none");
        return;
    }

    solicitudes.forEach(servicio => {
        const tipoClase = servicio.type_shipping
            ? servicio.type_shipping.trim().toLowerCase()
            : "";

        const valor = calcularValor(
            Number(servicio.weight),
            servicio.type_shipping,
            servicio.origin,
            servicio.destination
        );


        const valorTexto = valor;

        const card = document.createElement("div");
        card.className = "col-lg-4 col-md-6 col-12";

        card.innerHTML = `
            <div class="service-card">
                
                <div class="service-image-wrapper">
                    <img src="${servicio.image || 'https://picsum.photos/400/300'}" 
                         class="service-image"
                         alt="Servicio de envío">

                    <span class="shipping-badge ${tipoClase}">
                        ${servicio.type_shipping || 'N/A'}
                    </span>
                </div>

                <div class="service-body">

                    <div class="service-section">
                        <h6>Características</h6>
                        <p>${servicio.characteristics || 'Sin descripción'}</p>
                    </div>

                    <div class="service-section">
                        <div class="location-grid">
                            
                            <div class="location-box origin">
                                <small>
                                    <i class="bi bi-geo-alt-fill"></i>
                                    Origen
                                </small>
                                <strong>${servicio.origin || 'N/A'}</strong>
                            </div>

                            <div class="location-box destination">
                                <small>
                                    <i class="bi bi-geo-alt-fill"></i>
                                    Destino
                                </small>
                                <strong>${servicio.destination || 'N/A'}</strong>
                            </div>

                        </div>
                    </div>

                    <div class="service-section">
                        <div class="weight-box">
                            <small>
                                <i class="bi bi-box-fill"></i>
                                Peso
                            </small>
                            <strong>${servicio.weight || 0} kg</strong>
                        </div>
                    </div>

                    <div class="price-footer">
                        <span>Valor del envío</span>
                        <strong>${valorTexto}</strong>
                    </div>

                </div>
            </div>
        `;

        container.appendChild(card);
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