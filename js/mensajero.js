document.addEventListener("DOMContentLoaded", () => {
  const panelLista = document.querySelector(".panel__lista");
  const listaGrid = document.querySelector(".lista-grid");
  const progresoTexto = document.querySelector(".progreso__texto span:first-child");
  const progresoPendiente = document.querySelector(".progreso__pendiente");
  const progresoBarraFill = document.querySelector(".progreso__barra-fill");
  const progresoEstado = document.querySelector(".progreso__estado");
  const finalizadosTitulo = document.querySelector(".finalizados__titulo");

  // Instancias de los modales de Bootstrap
  const modalActualizarEstadoEl = document.getElementById("modal-actualizar-estado");
  const modalEntregarEl = document.getElementById("modal-entregar");
  let modalActualizarEstado;
  let modalEntregar;
  if (modalActualizarEstadoEl) modalActualizarEstado = new bootstrap.Modal(modalActualizarEstadoEl);
  if (modalEntregarEl) modalEntregar = new bootstrap.Modal(modalEntregarEl);

  let shipments = [];

  // URL de la API (Variable de entorno para desarrollo)
  const API_URL = "http://localhost:8080/api/v1/route/d1000001-0001-4000-8000-000000000001/orders";
  const API_URL_UPDATE = "http://localhost:8080/api/v1/orderStatus";
  const API_URL_DELIVERY = "http://localhost:8080/api/v1/delivery";
  // URL de la API (Comentada para producción)
  // const API_URL = "https://tu-dominio.com/api/v1/route/d1000001-0001-4000-8000-000000000001/orders";
  // const API_URL_UPDATE = "https://tu-dominio.com/api/v1/orders";
  // const API_URL_DELIVERY = "https://tu-dominio.com/api/v1/delivery";

  async function fetchShipments() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }
  }

  /**
   * Traduce el estado del backend (inglés) a español para la UI.
   */
  function traducirEstado(status) {
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
      <div class="tarjeta" data-id="${order.order ? order.order.id : order.id}">
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
    const recipientPhone = order.recipient ? (order.recipient.phone || "") : "";
    const rutaDestino = order.route ? `${order.route.origin} → ${order.route.destination}` : "";

    // Solo la primera tarjeta tiene el encabezado azul de "Próxima parada"
    const headerHTML = esPrimera
      ? `<div class="tarjeta__top-azul">
            <span><span class="material-symbols-outlined">navigation</span> Próxima parada</span>
            <span>${rutaDestino}</span>
         </div>`
      : "";

    return `
      <div class="tarjeta ${esPrimera ? "tarjeta--activa" : ""}" data-id="${order.order ? order.order.id : order.id}">
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
            Remitente: ${order.sender.firstName} ${order.sender.lastName} - Tel: ${order.sender.phone}
          </div>
          
          <!-- Botones de Utilidad -->
          <div class="tarjeta__botones">
            <button class="tarjeta__btn-ir">
              <span class="material-symbols-outlined">navigation</span> Navegar
            </button>
            <a href="${recipientPhone ? `tel:${recipientPhone}` : '#'}" class="tarjeta__btn-tel" title="${recipientPhone ? `Llamar a ${recipientName}: ${recipientPhone}` : 'Sin teléfono de destinatario'}" data-phone="${recipientPhone}">
              <span class="material-symbols-outlined">call</span>
            </a>
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
    const estadosPendientes = ["PENDING", "ASSIGNED"];
    const pendientes = shipments.filter(s => estadosPendientes.includes(s.status));
    const entregados = shipments.filter(s => !estadosPendientes.includes(s.status));


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

    actualizarDriverInfo();
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
    // Evento de clic en el botón de teléfono (destinatario)
    document.querySelectorAll('.tarjeta__btn-tel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phone = btn.getAttribute('data-phone');
        if (!phone || phone === '#' || phone === 'undefined') {
          e.preventDefault();
          Swal.fire({
            icon: 'info',
            title: 'Teléfono',
            text: 'No se encontró el número de teléfono del destinatario (persona que recibe).'
          });
        }
      });
    });

    // Abrir Google Maps al hacer clic en Navegar
    document.querySelectorAll('.tarjeta__btn-ir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        const orderId = tarjeta.getAttribute('data-id');
        const shipment = shipments.find(s => (s.order && s.order.id === orderId) || s.id === orderId);
        
        if (shipment && shipment.recipient) {
          const address = `${shipment.recipient.address || ''}, ${shipment.recipient.city || ''}`;
          const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
          window.open(url, '_blank');
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Navegación',
            text: 'No se encontró una dirección válida para este pedido.'
          });
        }
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

        try {
          const response = await fetch(`${API_URL_UPDATE}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: `Estado actualizado a ${traducirEstado(status)}`
          });
          modalActualizarEstado.hide();
          
          const shipment = shipments.find(s => (s.order && s.order.id === orderId) || s.id === orderId);
          if (shipment) {
            // Se actualiza el estado localmente, si es 'DELIVERED', pasará automáticamente a la columna de completados.
            // Para forzar que siempre pase a completados según la solicitud, puedes descomentar la siguiente línea:
            // shipment.status = "DELIVERED";
            shipment.status = status;
          }
          renderTarjetas();

        } catch (error) {
          console.error("Error actualizando estado:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el estado.'
          });
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

        try {
          const response = await fetch(API_URL_DELIVERY, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          Swal.fire({
            icon: 'success',
            title: '¡Entregado!',
            text: `Entrega registrada a nombre de ${receiverName}`
          });
          modalEntregar.hide();
          
          const shipment = shipments.find(s => (s.order && s.order.id === orderId) || s.id === orderId);
          if (shipment) shipment.status = "DELIVERED";
          renderTarjetas();

        } catch (error) {
          console.error("Error registrando entrega:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al registrar la entrega.'
          });
        }
      });
    }
  }

  /**
   * Actualiza el nombre del repartidor y sus iniciales en el panel superior.
   */
  function actualizarDriverInfo() {
    if (!shipments || shipments.length === 0) return;
    const sample = shipments[0];
    const driverName = sample.driverName || sample.driver?.name || sample.order?.driverName || sample.assignedDriver || sample.route?.driverName;
    
    if (driverName) {
      const choferEl = document.querySelector(".panel__chofer");
      const avatarEl = document.querySelector(".panel__avatar");
      if (choferEl) choferEl.textContent = driverName;
      if (avatarEl) {
        const initials = driverName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        avatarEl.textContent = initials;
      }
    }
  }

  /**
   * Actualiza la barra de progreso y contadores del panel lateral.
   */
  function actualizarProgreso() {
    const total = shipments.length;
    const estadosPendientes = ["PENDING", "ASSIGNED"];
    const completadosCount = shipments.filter((s) => !estadosPendientes.includes(s.status)).length;
    const pendientesCount = total - completadosCount;
    const porcentaje = total > 0 ? Math.round((completadosCount / total) * 100) : 0;

    if (progresoTexto) progresoTexto.textContent = `${porcentaje}% completado`;
    if (progresoPendiente) progresoPendiente.textContent = `${pendientesCount} pendientes`;
    if (progresoBarraFill) progresoBarraFill.style.width = `${porcentaje}%`;
    if (progresoEstado) progresoEstado.textContent = `${completadosCount}/${total} entregados`;
  }

  // Inicializar la aplicación
  async function init() {
    inicializarEventosModales();
    shipments = await fetchShipments();
    renderTarjetas();
  }

  init();
});