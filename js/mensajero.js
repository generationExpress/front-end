document.addEventListener("DOMContentLoaded", () => {
  const panelLista = document.querySelector(".panel__lista");
  const listaGrid = document.querySelector(".lista-grid");
  const progresoTexto = document.querySelector(".progreso__texto span:first-child");
  const progresoPendiente = document.querySelector(".progreso__pendiente");
  const progresoBarraFill = document.querySelector(".progreso__barra-fill");
  const progresoEstado = document.querySelector(".progreso__estado");

  const modalCliente = document.querySelector(".modal-reparto__cliente");
  const modalTag = document.querySelector(".modal-reparto__tag-camino");
  const modalHora = document.querySelector(".modal-reparto__hora");
  const modalCalle = document.querySelector(".modal-reparto__calle");
  const modalCiudad = document.querySelector(".modal-reparto__ciudad");
  const modalAlerta = document.querySelector(".modal-reparto__alerta");
  const modalFilas = document.querySelectorAll(".modal-reparto__fila strong");
  const btnConfirmar = document.querySelector(".modal-reparto__btn-confirmar");

  function cargarShipments() {
    shipments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function guardarShipments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  }

  function getIconoEstado(status) {
    switch (status) {
      case "PENDING": return "Pendiente";
      case "ASSIGNED": return "Asignado";
      case "IN_TRANSIT": return "En tránsito";
      case "DELIVERED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      case "RESCHEDULED": return "Reprogramado";
      default: return status;
    }
  }

  /**
   * Retorna una clase CSS de Bootstrap para colorear el badge según el estado.
   */
  function getColorEstado(status) {
    switch (status) {
      case "PENDING": return "bg-warning text-dark";
      case "ASSIGNED": return "bg-info text-dark";
      case "IN_TRANSIT": return "bg-primary";
      case "DELIVERED": return "bg-success";
      case "CANCELLED": return "bg-danger";
      case "RESCHEDULED": return "bg-secondary";
      default: return "bg-dark";
    }
  }

  /**
   * Crea el HTML de una tarjeta grande para la grilla principal (pedidos entregados).
   * Al estar entregado, ya no muestra botones de acción.
   */
  function crearTarjetaHTML(order) {
    const recipientName = `${order.recipient.firstName} ${order.recipient.lastName}`;
    const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.totalCost);
    const orderDate = new Date(order.estimatedDeliveryDate).toLocaleDateString('es-CO');

    return `
      <div class="tarjeta" data-id="${order.id}">
        <div class="tarjeta__body">
          <div class="d-flex justify-content-between align-items-start">
            <h3 class="tarjeta__cliente">${recipientName}</h3>
            <span class="tarjeta__precio">${formattedPrice}</span>
          </div>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="material-symbols-outlined">calendar_today</span> ${orderDate}</span>
            <span><span class="material-symbols-outlined">package</span> ${order.weightKg} kg</span>
            <span><span class="material-symbols-outlined">confirmation_number</span> ${order.trackingNumber}</span>
          </div>
          <div class="tarjeta__alerta">
            <span class="material-symbols-outlined">info</span>
            Remitente: ${order.sender.firstName} ${order.sender.lastName} - Tel: ${order.sender.phone}
          </div>
          
          <div class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span class="badge ${getColorEstado(order.status)}">${traducirEstado(order.status)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Crea el HTML de una tarjeta para el panel lateral (pedidos pendientes).
   * @param {object} order - El pedido.
   * @param {boolean} esPrimera - Si es true, se muestra con el encabezado "Próxima parada".
   */
  function crearTarjetaPanelHTML(order, esPrimera) {
    const recipientName = `${order.recipient.firstName} ${order.recipient.lastName}`;
    const rutaDestino = order.route ? `${order.route.origin} → ${order.route.destination}` : "";

    // Solo la primera tarjeta tiene el encabezado azul de "Próxima parada"
    const headerHTML = esPrimera
      ? `<div class="tarjeta__top-azul">
            <span><span class="material-symbols-outlined">navigation</span> Próxima parada</span>
            <span>${rutaDestino}</span>
         </div>`
      : "";

    return `
      <div class="tarjeta ${esPrimera ? "tarjeta--activa" : ""}" data-id="${order.id}">
        ${headerHTML}
        <div class="tarjeta__body">
          <h3 class="tarjeta__cliente">${recipientName}</h3>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="badge ${getColorEstado(order.status)}">${traducirEstado(order.status)}</span></span>
            <span><span class="material-symbols-outlined">package</span> ${order.weightKg} kg</span>
          </div>
          <div class="tarjeta__alerta">
            <span class="material-symbols-outlined">warning</span>
            ${order.sender.firstName} ${order.sender.lastName} - Tel: ${order.sender.phone}
          </div>
          
          <!-- Botones de Utilidad -->
          <div class="tarjeta__botones">
            <button class="tarjeta__btn-ir" data-bs-toggle="modal" data-bs-target="#modal-detalle">
              <span class="material-symbols-outlined">navigation</span> Navegar
            </button>
            <button class="tarjeta__btn-tel">
              <span class="material-symbols-outlined">call</span>
            </button>
          </div>
          
          <!-- Botones de Acción de Estado -->
          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-sm btn-primary flex-grow-1 btn-actualizar-estado" data-status="${order.status}">
              Actualizar
            </button>
            <button class="btn btn-sm btn-success flex-grow-1 btn-entregar" data-receiver="${recipientName}">
              Entregar
            </button>
            </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza las tarjetas separando pendientes y entregados.
   * - Pendientes van en .panel__lista (panel lateral)
   * - Entregados van en .lista-grid (grilla principal derecha)
   */
  function renderTarjetas() {
    const pendientes = shipments.filter(s => s.status !== "DELIVERED");
    const entregados = shipments.filter(s => s.status === "DELIVERED");


    // Renderizar tarjetas entregadas en la grilla principal
    if (listaGrid) {
      listaGrid.innerHTML = entregados.length
        ? entregados.map(s => crearTarjetaHTML(s)).join("")
        : "<p class='text-muted text-center p-3'>No hay entregas completadas todavía.</p>";
    }

    // Renderizar tarjetas pendientes en el panel lateral
    if (panelLista) {
      panelLista.innerHTML = pendientes.length
        ? pendientes.map((s, index) => crearTarjetaPanelHTML(s, index === 0)).join("")
        : "<p class='text-center text-muted p-3'>🎉 ¡Todo entregado!</p>";
    }

    asignarEventosBotones();
    actualizarProgreso();
  }

  /**
   * Asigna los eventos click a los botones de cada tarjeta.
   * - "Actualizar estado" abre el modal con el estado actual preseleccionado.
   * - "Entregar" abre el modal con el nombre del destinatario prellenado.
   */
  function asignarEventosBotones() {
    // Abrir modal de actualizar estado
    document.querySelectorAll('.btn-actualizar-estado').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        const orderId = tarjeta.getAttribute('data-id');
        const currentStatus = btn.getAttribute('data-status');
        
        document.getElementById('estado-order-id').value = orderId;
        document.getElementById('estado-select-modal').value = currentStatus;
        document.getElementById('estado-observaciones').value = "";
        
        modalActualizarEstado.show();
      });
    });

    // Abrir modal de entregar
    document.querySelectorAll('.btn-entregar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        const orderId = tarjeta.getAttribute('data-id');
        const receiverName = btn.getAttribute('data-receiver');
        
        document.getElementById('entregar-order-id').value = orderId;
        document.getElementById('entregar-receptor').value = receiverName;
        document.getElementById('entregar-foto').value = "https://example.com/photos/delivery-001.jpg";
        
        modalEntregar.show();
      });
    });
  }

  /**
   * Inicializa los eventos de los modales (se ejecuta una sola vez).
   */
  function inicializarEventosModales() {
    // Enviar formulario Actualizar Estado
    const btnSubmitEstado = document.getElementById("btn-submit-estado");
    if (btnSubmitEstado) {
      btnSubmitEstado.addEventListener("click", async () => {
        const orderId = document.getElementById('estado-order-id').value;
        const status = document.getElementById('estado-select-modal').value;
        const observations = document.getElementById('estado-observaciones').value;

        const payload = {
          shipmentStatus: status,
          observations: observations,
          orderId: orderId
        };

        console.log("-> Realizando petición POST para actualizar estado:", JSON.stringify(payload, null, 2));

        try {
          // await window.ApiService.post('/api/shipments/status', payload);
          
          alert(`Estado actualizado a ${traducirEstado(status)}\nRevisa la consola para ver el JSON.`);
          modalActualizarEstado.hide();
          
          const shipment = shipments.find(s => s.id === orderId);
          if (shipment) shipment.status = status;
          renderTarjetas();

        } catch (error) {
          console.error("Error actualizando estado:", error);
          alert("Ocurrió un error al actualizar el estado.");
        }
      });
    }

    // Enviar formulario Entregar
    const btnSubmitEntrega = document.getElementById("btn-submit-entrega");
    if (btnSubmitEntrega) {
      btnSubmitEntrega.addEventListener("click", async () => {
        const orderId = document.getElementById('entregar-order-id').value;
        const receiverName = document.getElementById('entregar-receptor').value;
        const deliveryPhoto = document.getElementById('entregar-foto').value;

        const payload = {
          receiverName: receiverName,
          deliveryPhoto: deliveryPhoto,
          orderId: orderId
        };

        console.log("-> Realizando petición POST para procesar entrega:", JSON.stringify(payload, null, 2));

        try {
          // await window.ApiService.post('/api/shipments/deliver', payload);
          
          alert(`Entrega registrada a nombre de ${receiverName}\nRevisa la consola para ver el JSON.`);
          modalEntregar.hide();
          
          const shipment = shipments.find(s => s.id === orderId);
          if (shipment) shipment.status = "DELIVERED";
          renderTarjetas();

        } catch (error) {
          console.error("Error registrando entrega:", error);
          alert("Ocurrió un error al registrar la entrega.");
        }
      });
    }
  }

  /**
   * Actualiza la barra de progreso y contadores del panel lateral.
   */
  function actualizarProgreso() {
    const total = shipments.length;
    const entregados = shipments.filter((s) => s.status === "DELIVERED").length;
    const pendientes = total - entregados;
    const porcentaje = total > 0 ? Math.round((entregados / total) * 100) : 0;

    if (progresoTexto) progresoTexto.textContent = `${porcentaje}% completado`;
    if (progresoPendiente) progresoPendiente.textContent = `${pendientes} pendientes`;
    if (progresoBarraFill) progresoBarraFill.style.width = `${porcentaje}%`;
    if (progresoEstado) progresoEstado.textContent = `${entregados}/${total} entregados`;
  }

  // Inicializar la aplicación
  async function init() {
    inicializarEventosModales();
    shipments = await fetchShipments();
    renderTarjetas();
  }

  init();
});