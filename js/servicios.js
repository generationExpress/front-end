// Carrusel de servicios de la landing (inicio.html).
// Antes se leía de localStorage (datos de un formulario de prueba);
// ahora son 4 servicios fijos que representan la oferta real de la
// empresa. Si en el futuro esto vuelve a ser dinámico, lo único que
// hay que cambiar es de dónde sale SERVICIOS_FIJOS (por ejemplo, un
// fetch a un endpoint), el render de abajo no necesita tocarse.

const IMAGES_BASE_PATH = "assets/images/servicios-inicio";

const SERVICIOS_FIJOS = [
  {
    nombre: "Envíos Locales",
    tipo: "Local",
    imagen: `${IMAGES_BASE_PATH}/servicio_camion.jpg`,
    caracteristicas: "Entrega el mismo día dentro de la ciudad, ideal para documentos y paquetes pequeños que no pueden esperar.",
    origen: "Bogotá",
    destino: "Bogotá",
    pesoKg: 2,
    valor: "$8.000"
  },
  {
    nombre: "Envíos Nacionales",
    tipo: "Nacional",
    imagen: `${IMAGES_BASE_PATH}/servicio_avion.jpg`,
    caracteristicas: "Cobertura en las principales ciudades del país, con seguimiento en tiempo real y entrega en 24-48 horas.",
    origen: "Medellín",
    destino: "Cali",
    pesoKg: 8,
    valor: "$18.000"
  },
  {
    nombre: "Envíos Internacionales",
    tipo: "Internacional",
    imagen: `${IMAGES_BASE_PATH}/servicio_barco.jpg`,
    caracteristicas: "Gestión aduanera incluida y cobertura en más de 40 países, con tiempos de tránsito de 3 a 7 días.",
    origen: "Bogotá, Colombia",
    destino: "Miami, Estados Unidos",
    pesoKg: 15,
    valor: "$185.000"
  },
  {
    nombre: "Envíos Express",
    tipo: "Express",
    imagen: `${IMAGES_BASE_PATH}/servicio_express.jpg`,
    caracteristicas: "Recogida en menos de 1 hora y entrega prioritaria el mismo día para envíos urgentes.",
    origen: "Bogotá",
    destino: "Bogotá",
    pesoKg: 3,
    valor: "$25.000"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("services-container");
  const leftBtn = document.getElementById("scroll-left");
  const rightBtn = document.getElementById("scroll-right");

  if (!container) {
    console.error("No se encontró el contenedor de servicios");
    return;
  }

  renderServicios(container);

  // Con 4 servicios fijos siempre hay contenido, así que las flechas
  // se muestran siempre (en mobile igual se ocultan por CSS).
  if (leftBtn && rightBtn) {
    leftBtn.classList.remove("d-none");
    rightBtn.classList.remove("d-none");

    leftBtn.addEventListener("click", () => {
      container.scrollBy({ left: -404, behavior: "smooth" });
    });

    rightBtn.addEventListener("click", () => {
      container.scrollBy({ left: 404, behavior: "smooth" });
    });
  }
});

function renderServicios(container) {
  SERVICIOS_FIJOS.forEach((servicio) => {
    container.appendChild(buildServiceCard(servicio));
  });
}

function buildServiceCard(servicio) {
  const tipoClase = servicio.tipo.toLowerCase();

  const card = document.createElement("div");
  card.className = "service-slide";

  card.innerHTML = `
    <div class="service-card">

      <div class="service-image-wrapper">
        <img src="${servicio.imagen}"
             class="service-image"
             alt="${servicio.nombre}">

        <span class="shipping-badge ${tipoClase}">
          ${servicio.tipo}
        </span>
      </div>

      <div class="service-body">

        <div class="service-section">
          <h6>${servicio.nombre}</h6>
          <p>${servicio.caracteristicas}</p>
        </div>

        <div class="service-section">
          <div class="location-grid">

            <div class="location-box origin">
              <small>
                <i class="bi bi-geo-alt-fill"></i>
                Origen
              </small>
              <strong>${servicio.origen}</strong>
            </div>

            <div class="location-box destination">
              <small>
                <i class="bi bi-geo-alt-fill"></i>
                Destino
              </small>
              <strong>${servicio.destino}</strong>
            </div>

          </div>
        </div>

        <div class="service-section">
          <div class="weight-box">
            <small>
              <i class="bi bi-box-fill"></i>
              Peso
            </small>
            <strong>${servicio.pesoKg} kg</strong>
          </div>
        </div>

        <div class="price-footer">
          <span>Valor del envío</span>
          <strong>${servicio.valor}</strong>
        </div>

      </div>
    </div>
  `;

  return card;
}