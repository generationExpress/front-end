document.addEventListener("DOMContentLoaded", () => {

  const API_URL = "http://localhost:8080/api/v1"; // ajusta host/puerto si cambia

  // ===================== ELEMENTOS: FORMULARIO (crear/editar) =====================

  const form = document.getElementById("shipping-form");
  const btnSave = document.getElementById("btn-save-shipping");
  const modal = document.getElementById("form-shipping");
  const modalTitleText = document.getElementById("modal-title-text");

  const trackingInput = document.getElementById("sender-tracking-number");
  const senderCityInput = document.getElementById("sender-city");
  const recipientCityInput = document.getElementById("recipient-city");
  const weightInput = document.getElementById("package-weight");
  const estimatedDeliveryInput = document.getElementById("estimated-delivery");
  const totalCostInput = document.getElementById("total-cost");

  // ===================== ELEMENTOS: TABLA =====================

  const tableBody = document.getElementById("orders-table-body");
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");

  // ===================== ELEMENTOS: MODAL DETALLE =====================

  const detailModalEl = document.getElementById("order-detail-modal");
  const detailBody = document.getElementById("order-detail-body");
  const detailTracking = document.getElementById("detail-tracking");

  // Estado en memoria: guardamos la última lista de órdenes cargada,
  // para no repetir peticiones al filtrar/buscar y para tener los datos
  // completos disponibles al abrir "editar" o "ver detalle".
  let currentOrders = [];
  // Modo del formulario: null = crear, string = id de la orden en edición.
  let editingOrderId = null;

  // ===================== TRADUCCIÓN DE ESTADOS =====================

  const STATUS_LABELS = {
    PENDING: { text: "Pendiente", badgeClass: "bg-warning bg-opacity-10 text-warning", icon: "bi-clock" },
    ASSIGNED: { text: "Asignado", badgeClass: "bg-info bg-opacity-10 text-info", icon: "bi-person-check" },
    IN_TRANSIT: { text: "En Tránsito", badgeClass: "bg-primary bg-opacity-10 text-primary", icon: "bi-truck" },
    DELIVERED: { text: "Entregado", badgeClass: "bg-success bg-opacity-10 text-success", icon: "bi-check-circle" },
    CANCELLED: { text: "Cancelado", badgeClass: "bg-danger bg-opacity-10 text-danger", icon: "bi-x-circle" },
  };

  function statusInfo(status) {
    return STATUS_LABELS[status] ?? { text: status, badgeClass: "bg-light text-dark", icon: "bi-question-circle" };
  }

  // ===================== EVENTOS =====================

  btnSave.addEventListener("click", saveShipping);
  modal.addEventListener("hidden.bs.modal", resetForm);
  modal.addEventListener("show.bs.modal", () => {
    // Solo genera un tracking/fecha nuevos si estamos CREANDO,
    // no si el modal se abrió para editar (eso lo hace openEditModal).
    if (editingOrderId === null) {
      trackingInput.value = generateTrackingNumber();
      recalculateAutomaticFields();
    }
  });

  [senderCityInput, recipientCityInput, weightInput].forEach(input => {
    input.addEventListener("input", recalculateAutomaticFields);
  });

  searchInput.addEventListener("input", renderTable);
  statusFilter.addEventListener("change", renderTable);

  loadDrivers();
  loadOrders();

  // ===================== CARGA DE ÓRDENES =====================

  async function loadOrders() {
    try {
      // size=100 para traer "todas" en una sola página; ajusta si tu volumen crece mucho
      // y necesitas paginación real en la tabla.
      const response = await fetch(`${API_URL}/order?page=0&size=100`);

      if (!response.ok) {
        console.error("No se pudieron cargar los envíos:", response.status);
        return;
      }

      const data = await response.json();
      currentOrders = data.content;

      renderKpis(currentOrders);
      renderTable();

    } catch (err) {
      console.error("Error de red al cargar envíos:", err);
    }
  }

  // ===================== KPIs =====================

  function renderKpis(orders) {
    const total = orders.length;
    const inTransit = orders.filter(o => o.status === "IN_TRANSIT").length;
    const delivered = orders.filter(o => o.status === "DELIVERED").length;
    const pending = orders.filter(o => o.status === "PENDING").length;

    // "Retrasados" no es un status propio del backend (no existe ese valor en el enum
    // según lo que hemos visto). Lo calculamos aquí como: no entregado/cancelado
    // Y la fecha estimada de entrega ya pasó.
    const now = new Date();
    const delayed = orders.filter(o => {
      if (o.status === "DELIVERED" || o.status === "CANCELLED") return false;
      return new Date(o.estimatedDeliveryDate) < now;
    }).length;

    document.getElementById("kpi-total").textContent = total;
    document.getElementById("kpi-transit").textContent = inTransit;
    document.getElementById("kpi-delivered").textContent = delivered;
    document.getElementById("kpi-pending").textContent = pending;
    document.getElementById("kpi-delayed").textContent = delayed;
  }

  // ===================== TABLA: RENDER + FILTROS =====================

  function renderTable() {
    const search = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = currentOrders.filter(order => {
      const matchesStatus = !statusValue || order.status === statusValue;

      if (!search) return matchesStatus;

      const haystack = [
        order.trackingNumber,
        order.sender?.firstName,
        order.sender?.lastName,
        order.recipient?.firstName,
        order.recipient?.lastName,
        order.driver?.user?.firstName,
        order.driver?.user?.lastName,
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = haystack.includes(search);

      return matchesStatus && matchesSearch;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="9" class="text-center text-muted py-4">
            No se encontraron envíos con esos criterios.
          </td>
        </tr>`;
      return;
    }

    filtered.forEach(order => {
      tableBody.appendChild(buildOrderRow(order));
    });
  }

  function buildOrderRow(order) {
    const tr = document.createElement("tr");
    const status = statusInfo(order.status);

    const driverName = order.driver
      ? `${order.driver.user.firstName} ${order.driver.user.lastName}`
      : `<span class="text-muted">Sin asignar</span>`;

    const driverLicense = order.driver
      ? `<span class="badge bg-light text-dark border px-2 py-1">${order.driver.license}</span>`
      : "";

    const deliveryDate = order.estimatedDeliveryDate
      ? new Date(order.estimatedDeliveryDate).toLocaleDateString("es-CO")
      : "-";

    tr.innerHTML = `
      <td><a href="#" class="fw-bold text-primary text-decoration-none view-order-btn">${order.trackingNumber}</a></td>
      <td>
        <div class="fw-bold text-dark">${order.sender.firstName} ${order.sender.lastName}</div>
        <div class="text-muted small">${order.sender.phone}</div>
      </td>
      <td>${order.sender.city} <i class="bi bi-chevron-right mx-1 small text-muted"></i> ${order.recipient.city}</td>
      <td>${driverName}</td>
      <td>${driverLicense}</td>
      <td>${Number(order.weightKg).toFixed(2)}<br>kg</td>
      <td><span class="badge badge-soft ${status.badgeClass} fw-bold"><i class="bi ${status.icon} me-1"></i> ${status.text}</span></td>
      <td class="text-muted">${deliveryDate}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary border-0 rounded-circle action-btn mx-1 view-order-btn" title="Ver detalle">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-success border-0 rounded-circle action-btn mx-1 edit-order-btn" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger border-0 rounded-circle action-btn mx-1 delete-order-btn" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    // Conectamos los botones de esta fila con la orden correspondiente (closure).
    tr.querySelectorAll(".view-order-btn").forEach(btn =>
      btn.addEventListener("click", (e) => { e.preventDefault(); openDetailModal(order); })
    );
    tr.querySelector(".edit-order-btn").addEventListener("click", () => openEditModal(order));
    tr.querySelector(".delete-order-btn").addEventListener("click", () => deleteOrder(order));

    return tr;
  }

  // ===================== ACCIÓN: VER DETALLE =====================

  function openDetailModal(order) {
    const status = statusInfo(order.status);
    detailTracking.textContent = order.trackingNumber;

    detailBody.innerHTML = `
      <div class="row g-3">
        <div class="col-md-6">
          <h6 class="fw-bold text-primary"><i class="bi bi-person-fill me-2"></i>Remitente</h6>
          <p class="mb-1">${order.sender.firstName} ${order.sender.lastName}</p>
          <p class="mb-1 text-muted small">${order.sender.documentNumber}</p>
          <p class="mb-1 text-muted small">${order.sender.phone} · ${order.sender.email}</p>
          <p class="mb-0 text-muted small">${order.sender.address}, ${order.sender.city}</p>
        </div>
        <div class="col-md-6">
          <h6 class="fw-bold text-success"><i class="bi bi-person-check-fill me-2"></i>Destinatario</h6>
          <p class="mb-1">${order.recipient.firstName} ${order.recipient.lastName}</p>
          <p class="mb-1 text-muted small">${order.recipient.documentNumber}</p>
          <p class="mb-1 text-muted small">${order.recipient.phone} · ${order.recipient.email}</p>
          <p class="mb-0 text-muted small">${order.recipient.address}, ${order.recipient.city}</p>
        </div>
        <div class="col-12"><hr></div>
        <div class="col-md-3">
          <div class="text-muted small">Estado</div>
          <span class="badge badge-soft ${status.badgeClass} fw-bold"><i class="bi ${status.icon} me-1"></i> ${status.text}</span>
        </div>
        <div class="col-md-3">
          <div class="text-muted small">Peso</div>
          <div class="fw-bold">${Number(order.weightKg).toFixed(2)} kg</div>
        </div>
        <div class="col-md-3">
          <div class="text-muted small">Costo total</div>
          <div class="fw-bold">$${Number(order.totalCost).toFixed(2)}</div>
        </div>
        <div class="col-md-3">
          <div class="text-muted small">Entrega estimada</div>
          <div class="fw-bold">${new Date(order.estimatedDeliveryDate).toLocaleDateString("es-CO")}</div>
        </div>
        <div class="col-12">
          <div class="text-muted small">Conductor</div>
          <div class="fw-bold">${order.driver ? `${order.driver.user.firstName} ${order.driver.user.lastName} (${order.driver.license})` : "Sin asignar"}</div>
        </div>
        ${order.statusHistory && order.statusHistory.length > 0 ? `
          <div class="col-12">
            <hr>
            <h6 class="fw-bold text-dark mb-2">Historial</h6>
            <ul class="list-unstyled mb-0">
              ${order.statusHistory.map(h => `
                <li class="mb-2 small">
                  <span class="fw-bold">${statusInfo(h.shipmentStatus).text}</span>
                  <span class="text-muted"> — ${new Date(h.updatedAt).toLocaleString("es-CO")}</span>
                  ${h.observations ? `<div class="text-muted">${h.observations}</div>` : ""}
                </li>
              `).join("")}
            </ul>
          </div>
        ` : ""}
      </div>
    `;

    new bootstrap.Modal(detailModalEl).show();
  }

  // ===================== ACCIÓN: EDITAR =====================

  function openEditModal(order) {
    editingOrderId = order.id;
    modalTitleText.textContent = "Editar Envío";

    // Precarga remitente
    document.getElementById("sender-name").value = order.sender.firstName;
    document.getElementById("sender-last-name").value = order.sender.lastName;
    document.getElementById("sender-document").value = order.sender.documentNumber;
    document.getElementById("sender-phone").value = order.sender.phone;
    document.getElementById("sender-email").value = order.sender.email;
    document.getElementById("sender-address").value = order.sender.address;
    senderCityInput.value = order.sender.city;

    // Precarga destinatario
    document.getElementById("recipient-firstname").value = order.recipient.firstName;
    document.getElementById("recipient-last-name").value = order.recipient.lastName;
    document.getElementById("recipient-document").value = order.recipient.documentNumber;
    document.getElementById("recipient-phone").value = order.recipient.phone;
    document.getElementById("recipient-email").value = order.recipient.email;
    document.getElementById("recipient-address").value = order.recipient.address;
    recipientCityInput.value = order.recipient.city;

    // Precarga pedido
    trackingInput.value = order.trackingNumber;
    weightInput.value = order.weightKg;
    estimatedDeliveryInput.value = order.estimatedDeliveryDate
      ? new Date(order.estimatedDeliveryDate).toISOString().split("T")[0]
      : "";
    totalCostInput.value = order.totalCost;

    const driverSelect = document.getElementById("assigned-driver");
    if (driverSelect && order.driver) {
      driverSelect.value = order.driver.id;
    }

    new bootstrap.Modal(modal).show();
  }

  // ===================== ACCIÓN: ELIMINAR =====================

  async function deleteOrder(order) {
    // NOTA IMPORTANTE: el OrderController actual no expone un endpoint DELETE.
    // No se puede eliminar de verdad hasta que se agregue @DeleteMapping("/{id}")
    // en el backend. Dejamos esto listo para conectar cuando exista.
    alert(
      `Eliminar el envío ${order.trackingNumber} todavía no está disponible: ` +
      `falta el endpoint DELETE en el backend.`
    );

    // Una vez exista el endpoint, sería algo así:
    /*
    if (!confirm(`¿Eliminar el envío ${order.trackingNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/order/${order.id}`, { method: "DELETE" });
      if (!response.ok) {
        console.error("No se pudo eliminar:", response.status);
        alert("No se pudo eliminar el envío.");
        return;
      }
      await loadOrders(); // recarga tabla y KPIs
    } catch (err) {
      console.error("Error de red al eliminar:", err);
      alert("No se pudo conectar con el servidor.");
    }
    */
  }

  // ===================== CARGA DE CONDUCTORES =====================

  async function loadDrivers() {
    const driverSelect = document.getElementById("assigned-driver");

    if (!driverSelect) {
      console.error('No se encontró el elemento con id="assigned-driver".');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/driver?page=0&size=50`);

      if (!response.ok) {
        console.error("No se pudieron cargar los conductores:", response.status);
        return;
      }

      const data = await response.json();

      data.content
        .filter(driver => driver.available)
        .forEach(driver => {
          const option = document.createElement("option");
          option.value = driver.id;
          option.textContent = `${driver.user.firstName} ${driver.user.lastName} (${driver.license})`;
          driverSelect.appendChild(option);
        });

    } catch (err) {
      console.error("Error de red al cargar conductores:", err);
    }
  }

  // ===================== CÁLCULOS AUTOMÁTICOS =====================

  function generateTrackingNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `TRK-${timestamp}-${random}`;
  }

  function calculateEstimatedDelivery(senderCity, recipientCity) {
    const sameCity = senderCity.toLowerCase() === recipientCity.toLowerCase();
    const daysToAdd = sameCity ? 1 : 3;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  }

  function calculateTotalCost(weightKg, senderCity, recipientCity) {
    const baseRate = 10000.00; // tarifa base en pesos colombianos

    let weightSurcharge = 0;
    if (weightKg > 10) {
      weightSurcharge = 0.80;
    } else if (weightKg > 2) {
      weightSurcharge = 0.20;
    }

    const sameCity = senderCity.toLowerCase() === recipientCity.toLowerCase();
    const citySurcharge = sameCity ? 0 : 0.80;

    const total = baseRate * (1 + weightSurcharge + citySurcharge);
    return Number(total.toFixed(2));
  }

  function recalculateAutomaticFields() {
    const senderCity = senderCityInput.value.trim();
    const recipientCity = recipientCityInput.value.trim();
    const weight = Number(weightInput.value) || 0;

    if (senderCity && recipientCity) {
      estimatedDeliveryInput.value = calculateEstimatedDelivery(senderCity, recipientCity);
    }

    if (senderCity && recipientCity && weight > 0) {
      totalCostInput.value = calculateTotalCost(weight, senderCity, recipientCity);
    }
  }

  // ===================== GUARDAR (CREAR o EDITAR) =====================

  async function saveShipping() {

    const isValid = form.checkValidity();
    form.classList.add("was-validated");

    if (!isValid) {
      return;
    }

    const orderRequest = getFormData();
    const isEditing = editingOrderId !== null;

    const url = isEditing ? `${API_URL}/order/${editingOrderId}` : `${API_URL}/order`;
    const method = isEditing ? "PUT" : "POST";

    try {
      btnSave.disabled = true;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error al guardar el envío:", error);
        alert("No se pudo guardar el envío. Revisa los datos e intenta de nuevo.");
        return;
      }

      await response.json();
      bootstrap.Modal.getInstance(modal).hide();

      await loadOrders(); // refresca tabla y KPIs con los datos actualizados

    } catch (err) {
      console.error("Error de red:", err);
      alert("No se pudo conectar con el servidor.");
    } finally {
      btnSave.disabled = false;
    }
  }

  function getFormData() {
    const driverSelect = document.getElementById("assigned-driver");

    return {
      trackingNumber: trackingInput.value.trim(),
      weightKg: Number(weightInput.value),
      status: document.getElementById("shipping-status").value,
      estimatedDeliveryDate: estimatedDeliveryInput.value,
      totalCost: Number(totalCostInput.value),
      driverId: driverSelect.value,

      sender: {
        firstName: document.getElementById("sender-name").value.trim(),
        lastName: document.getElementById("sender-last-name").value.trim(),
        documentNumber: document.getElementById("sender-document").value.trim(),
        phone: document.getElementById("sender-phone").value.trim(),
        email: document.getElementById("sender-email").value.trim(),
        address: document.getElementById("sender-address").value.trim(),
        city: senderCityInput.value.trim(),
        shippingPersonType: "SENDER",
      },
      recipient: {
        firstName: document.getElementById("recipient-firstname").value.trim(),
        lastName: document.getElementById("recipient-last-name").value.trim(),
        documentNumber: document.getElementById("recipient-document").value.trim(),
        phone: document.getElementById("recipient-phone").value.trim(),
        email: document.getElementById("recipient-email").value.trim(),
        address: document.getElementById("recipient-address").value.trim(),
        city: recipientCityInput.value.trim(),
        shippingPersonType: "RECIPIENT",
      },
    };
  }

  // ===================== RESET =====================

  function resetForm() {
    form.reset();
    form.classList.remove("was-validated");
    editingOrderId = null;
    modalTitleText.textContent = "Nuevo Envío";

    const driverSelect = document.getElementById("assigned-driver");
    driverSelect.innerHTML = '<option value="">Seleccionar...</option>';
    loadDrivers();
  }
});