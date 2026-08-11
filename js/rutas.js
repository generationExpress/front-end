// rutas.js - Lógica interactiva para la Vista de Rutas (Integración API & Carrito de Órdenes)

document.addEventListener("DOMContentLoaded", async () => {
    await initRutasApp();
});

const API_URL_ROUTE = "http://localhost:8080/api/v1/route";
const API_URL_ORDER = "http://localhost:8080/api/v1/order";

let currentRoutesData = [];
let availableOrdersMap = new Map();
let cartSelectedOrderIds = new Set();
let rawRoutesList = [];

/**
 * Traduce el estado del backend y devuelve configuraciones visuales (badge e icono)
 */
function getStatusInfo(status) {
    switch (status) {
        case "PENDING":
            return { text: "Pendiente", badge: "badge-pending", icon: "bi-clock" };
        case "ASSIGNED":
            return { text: "Asignado", badge: "badge-pending", icon: "bi-person-check" };
        case "IN_TRANSIT":
            return { text: "En Tránsito", badge: "badge-in-transit", icon: "bi-truck" };
        case "ON_ROUTE":
            return { text: "En Ruta", badge: "badge-in-transit", icon: "bi-truck" };
        case "DELIVERED":
            return { text: "Entregado", badge: "badge-delivered", icon: "bi-check-circle" };
        case "CANCELLED":
            return { text: "Retrasada / Cancelada", badge: "badge-cancelled", icon: "bi-exclamation-triangle" };
        case "RESCHEDULED":
            return { text: "Reprogramado", badge: "badge-pending", icon: "bi-arrow-repeat" };
        default:
            return { text: status || "Pendiente", badge: "badge-pending", icon: "bi-info-circle" };
    }
}

/**
 * Formatea minutos en formato legible (ej: 480 -> 8h 00m)
 */
function formatTimeMinutes(minutes) {
    if (!minutes || isNaN(minutes)) return "N/A";
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
}

/**
 * Obtiene iniciales a partir de un nombre
 */
function getInitials(name) {
    if (!name) return "NA";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

/**
 * Asigna un color de avatar consistente a partir del nombre del conductor
 */
function getDriverAvatarBg(name) {
    const colors = ["#059669", "#2563eb", "#7c3aed", "#d97706", "#dc2626", "#0891b2", "#4f46e5"];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

/**
 * Transforma el JSON del endpoint de rutas (Ruta -> vehicle + orders)
 * a una lista de RUTAS (1 fila por cada objeto Ruta en la tabla).
 */
function transformRouteData(routeList) {
    if (!Array.isArray(routeList)) return [];

    return routeList.map(route => {
        const vehicle = route.vehicle || (Array.isArray(route.vehicles) ? route.vehicles[0] : {}) || {};
        const orders = route.orders || [];

        const driverName = vehicle.driverName || 'Sin conductor';
        const vehiclePlate = vehicle.licensePlate || 'N/A';
        const vehicleBrand = vehicle.brand ? `${vehicle.brand} ${vehicle.type || ''}`.trim() : (vehicle.type || 'N/A');

        // Almacenar las órdenes en el mapa de órdenes disponibles
        orders.forEach(o => {
            if (o && o.id) {
                availableOrdersMap.set(o.id, o);
            }
        });

        // Calcular acumulados de la ruta
        let totalWeight = 0;
        let totalCost = 0;
        orders.forEach(o => {
            totalWeight += Number(o.weightKg || 0);
            totalCost += Number(o.totalCost || 0);
        });

        // Estado general de la ruta
        let routeStatus = "PENDING";
        if (vehicle.status === "ON_ROUTE" || orders.some(o => o.status === "IN_TRANSIT")) {
            routeStatus = "IN_TRANSIT";
        } else if (orders.length > 0 && orders.every(o => o.status === "DELIVERED")) {
            routeStatus = "DELIVERED";
        } else if (orders.some(o => o.status === "ASSIGNED")) {
            routeStatus = "IN_TRANSIT";
        }

        const statusInfo = getStatusInfo(routeStatus);
        const fullId = route.id || `RUT-${Math.floor(Math.random() * 1000)}`;
        const displayId = fullId.length > 12 ? fullId.substring(0, 12).toUpperCase() : fullId.toUpperCase();

        return {
            id: fullId,
            route_id: fullId,
            display_id: displayId,
            origin: route.origin || 'N/A',
            destination: route.destination || 'N/A',
            estimated_time: route.estimatedTimeMinutes ? formatTimeMinutes(route.estimatedTimeMinutes) : 'N/A',
            estimated_time_minutes: route.estimatedTimeMinutes || 0,
            created_at: route.createdAt ? new Date(route.createdAt).toLocaleDateString('es-CO') : 'N/A',
            status: routeStatus,
            status_text: statusInfo.text,
            status_badge: statusInfo.badge,
            status_icon: statusInfo.icon,
            driver: {
                name: driverName,
                initials: getInitials(driverName),
                avatar_bg: getDriverAvatarBg(driverName),
                license: vehicle.type || 'A2',
                phone: 'N/A'
            },
            vehicle: {
                plate: vehiclePlate,
                model: vehicle.type || 'Vehículo',
                brand: vehicleBrand,
                capacity: vehicle.capacityKg || 0
            },
            orders_count: orders.length,
            total_weight: totalWeight,
            total_cost: totalCost,
            orders: orders
        };
    });
}

/**
 * Carga órdenes independientes desde http://localhost:8080/api/v1/order
 */
async function fetchAvailableOrders() {
    try {
        const response = await fetch(API_URL_ORDER);
        if (!response.ok) throw new Error(`HTTP status: ${response.status}`);
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.content || [data]);
        items.forEach(order => {
            if (order && order.id) {
                availableOrdersMap.set(order.id, order);
            }
        });
    } catch (error) {
        console.warn("No se pudo cargar órdenes desde http://localhost:8080/api/v1/order, usando órdenes locales:", error);
    }
}

/**
 * Obtiene los datos del servidor (intenta /route y luego /order)
 */
async function fetchRoutesData() {
    try {
        let response = await fetch(API_URL_ROUTE);
        if (!response.ok) {
            response = await fetch(API_URL_ORDER);
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        rawRoutesList = Array.isArray(data) ? data : (data.content || [data]);
        return transformRouteData(rawRoutesList);
    } catch (error) {
        console.warn("No se pudo conectar a la API backend. Cargando datos de muestra:", error);
        rawRoutesList = fallbackRoutesPayload.content;
        return transformRouteData(rawRoutesList);
    }
}

/**
 * Inicializa la aplicación de rutas
 */
async function initRutasApp() {
    await fetchAvailableOrders();
    currentRoutesData = await fetchRoutesData();
    renderKPICards(currentRoutesData);
    renderRoutesTable(currentRoutesData);
    populateDriverFilter(currentRoutesData);
    initFilters();
    initDetailModal();
    initCartEvents();
    initNewRouteForm();
}

/**
 * Renderiza los contadores de la sección KPI
 */
function renderKPICards(routes) {
    const kpiTotal = document.getElementById("kpi-total");
    const kpiInTransit = document.getElementById("kpi-in-transit");
    const kpiDelivered = document.getElementById("kpi-delivered");
    const kpiPending = document.getElementById("kpi-pending");
    const kpiCancelled = document.getElementById("kpi-cancelled");

    const total = routes.length;
    const inTransit = routes.filter(r => r.status === "IN_TRANSIT").length;
    const delivered = routes.filter(r => r.status === "DELIVERED").length;
    const pending = routes.filter(r => ["PENDING", "ASSIGNED", "RESCHEDULED"].includes(r.status)).length;
    const cancelled = routes.filter(r => r.status === "CANCELLED").length;

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiInTransit) kpiInTransit.textContent = inTransit;
    if (kpiDelivered) kpiDelivered.textContent = delivered;
    if (kpiPending) kpiPending.textContent = pending;
    if (kpiCancelled) kpiCancelled.textContent = cancelled;
}

/**
 * Llena el selector de conductores dinámicamente según las rutas existentes
 */
function populateDriverFilter(routes) {
    const driverSelect = document.getElementById("filter-driver");
    if (!driverSelect) return;

    const drivers = Array.from(new Set(routes.map(r => r.driver.name).filter(b => b && b !== 'Sin conductor')));
    driverSelect.innerHTML = `<option value="ALL">Todos los conductores</option>` +
        drivers.map(d => `<option value="${d}">${d}</option>`).join("");
}

/**
 * Renderiza las filas de la tabla de rutas (1 fila por Ruta)
 */
function renderRoutesTable(routes) {
    const tbody = document.getElementById("routes-table-body");
    if (!tbody) return;

    if (!routes || routes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                    No se encontraron rutas registradas.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = routes.map(r => `
        <tr data-status="${r.status}" data-driver="${r.driver.name}">
            <td class="ps-3">
                <a href="javascript:void(0)" class="fw-bold text-primary text-decoration-none btn-view-detail" data-route-id="${r.id}">${r.display_id}</a>
            </td>
            <td>
                <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                    <i class="bi bi-box-seam me-1"></i>${r.orders_count} ${r.orders_count === 1 ? 'orden' : 'órdenes'}
                </span>
            </td>
            <td class="fw-bold text-dark">${r.origin}</td>
            <td><i class="bi bi-chevron-right text-muted small me-1"></i>${r.destination}</td>
            <td class="text-muted"><i class="bi bi-clock me-1"></i>${r.estimated_time}</td>
            <td>
                <span class="badge-status ${r.status_badge}">
                    <i class="bi ${r.status_icon}"></i>${r.status_text}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="driver-avatar-sm" style="background:${r.driver.avatar_bg}">${r.driver.initials}</div>
                    <span class="fw-semibold text-dark">${r.driver.name}</span>
                </div>
            </td>
            <td>
                <div class="fw-semibold text-dark">${r.vehicle.plate}</div>
                <div class="text-muted small">${r.vehicle.brand}</div>
            </td>
            <td class="text-end pe-3">
                <div class="d-inline-flex gap-1">
                    <button class="btn-action-icon btn-view btn-view-detail" data-route-id="${r.id}" title="Ver detalle de la ruta">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn-action-icon btn-edit btn-edit-route" data-route-id="${r.id}" title="Editar ruta">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

/**
 * Inicializa la funcionalidad de búsqueda y filtros
 */
function initFilters() {
    const searchInput = document.getElementById("search-input");
    const statusSelect = document.getElementById("filter-status");
    const driverSelect = document.getElementById("filter-driver");

    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedStatus = statusSelect ? statusSelect.value : "ALL";
        const selectedDriver = driverSelect ? driverSelect.value : "ALL";

        const tableRows = document.querySelectorAll("#routes-table-body tr");
        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const rowStatus = row.getAttribute("data-status");
            const rowDriver = row.getAttribute("data-driver");

            const matchesSearch = query === "" || text.includes(query);
            const matchesStatus = selectedStatus === "ALL" || rowStatus === selectedStatus;
            const matchesDriver = selectedDriver === "ALL" || rowDriver === selectedDriver;

            if (matchesSearch && matchesStatus && matchesDriver) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (statusSelect) statusSelect.addEventListener("change", applyFilters);
    if (driverSelect) driverSelect.addEventListener("change", applyFilters);
}

/**
 * Renderiza la interfaz visual de Selección de Órdenes dentro del modal
 */
function renderOrderCartUI() {
    const selectAvailable = document.getElementById("order-select-available");
    const cartList = document.getElementById("cart-items-list");
    const cartCountEl = document.getElementById("cart-count");
    const cartSummaryBadge = document.getElementById("cart-summary-badge");

    if (!selectAvailable || !cartList) return;

    // Llenar el selector de órdenes disponibles
    const availableOrders = Array.from(availableOrdersMap.values()).filter(o => o && o.id && !cartSelectedOrderIds.has(o.id));

    if (availableOrders.length === 0) {
        selectAvailable.innerHTML = `<option value="" disabled selected>No hay más órdenes disponibles para agregar</option>`;
    } else {
        selectAvailable.innerHTML = `<option value="" disabled selected>Seleccionar orden para agregar...</option>` +
            availableOrders.map(o => {
                const tracking = o.trackingNumber || o.id;
                const weight = o.weightKg ? `${o.weightKg} kg` : '';
                const cost = o.totalCost ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(o.totalCost) : '';
                const driver = o.driverName ? `(${o.driverName})` : '';
                return `<option value="${o.id}">${tracking} ${driver} ${weight} ${cost}</option>`;
            }).join("");
    }

    // Renderizar los ítems en la lista de la ruta
    const selectedOrders = Array.from(cartSelectedOrderIds).map(id => availableOrdersMap.get(id)).filter(Boolean);

    let totalWeight = 0;
    let totalCost = 0;

    if (selectedOrders.length === 0) {
        cartList.innerHTML = `<p class="text-muted small text-center my-3" id="cart-empty-msg">No hay órdenes seleccionadas. Selecciona órdenes para agregar a esta ruta.</p>`;
    } else {
        cartList.innerHTML = selectedOrders.map(order => {
            totalWeight += Number(order.weightKg || 0);
            totalCost += Number(order.totalCost || 0);
            const formattedCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.totalCost || 0);

            return `
                <div class="d-flex align-items-center justify-content-between p-2 border-bottom">
                    <div>
                        <span class="fw-bold text-dark me-2">${order.trackingNumber || order.id}</span>
                        <span class="badge bg-secondary me-2">${order.weightKg || 0} kg</span>
                        <span class="text-muted small">${order.driverName || ''}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-semibold text-success small">${formattedCost}</span>
                        <button type="button" class="btn btn-sm btn-outline-danger border-0 btn-remove-cart-item" data-order-id="${order.id}" title="Quitar orden">
                            <i class="bi bi-trash fs-6"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Actualizar resumen y contadores
    const formattedTotalCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(totalCost);
    if (cartCountEl) cartCountEl.textContent = cartSelectedOrderIds.size;
    if (cartSummaryBadge) {
        cartSummaryBadge.textContent = `${cartSelectedOrderIds.size} órdenes · ${totalWeight.toFixed(1)} kg · ${formattedTotalCost}`;
    }
}

/**
 * Eventos de selección de órdenes (Agregar y Quitar)
 */
function initCartEvents() {
    const btnAdd = document.getElementById("btn-add-to-cart");
    const cartList = document.getElementById("cart-items-list");

    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            const selectAvailable = document.getElementById("order-select-available");
            const selectedId = selectAvailable ? selectAvailable.value : null;

            if (!selectedId) {
                Swal.fire({
                    icon: 'info',
                    title: 'Selección vacía',
                    text: 'Por favor selecciona una orden de la lista para agregar.'
                });
                return;
            }

            cartSelectedOrderIds.add(selectedId);
            renderOrderCartUI();
        });
    }

    if (cartList) {
        cartList.addEventListener("click", (e) => {
            const btnRemove = e.target.closest(".btn-remove-cart-item");
            if (!btnRemove) return;

            const orderId = btnRemove.getAttribute("data-order-id");
            if (orderId) {
                cartSelectedOrderIds.delete(orderId);
                renderOrderCartUI();
            }
        });
    }
}

/**
 * Inicializa el modal de detalle para mostrar información completa de la RUTA
 */
function initDetailModal() {
    const modalEl = document.getElementById("route-detail-modal");
    if (!modalEl) return;

    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-view-detail");
        if (!btn) return;

        const routeId = btn.getAttribute("data-route-id");
        const data = currentRoutesData.find(r => r.id === routeId || r.route_id === routeId || r.display_id === routeId);
        if (!data) return;

        const detailRouteId = document.getElementById("detail-route-id");
        const detailOrdersCount = document.getElementById("detail-orders-count");
        const detailOrigin = document.getElementById("detail-origin");
        const detailDestination = document.getElementById("detail-destination");
        const detailEstimatedTime = document.getElementById("detail-estimated-time");
        const detailCreatedAt = document.getElementById("detail-created-at");
        const detailTotalWeight = document.getElementById("detail-total-weight");
        const detailTotalCost = document.getElementById("detail-total-cost");
        const detailStatusContainer = document.getElementById("detail-status-container");
        const detailOrdersList = document.getElementById("detail-orders-list");

        if (detailRouteId) detailRouteId.textContent = data.display_id;
        if (detailOrdersCount) detailOrdersCount.textContent = data.orders_count;
        if (detailOrigin) detailOrigin.textContent = data.origin;
        if (detailDestination) detailDestination.textContent = data.destination;
        if (detailEstimatedTime) detailEstimatedTime.textContent = data.estimated_time;
        if (detailCreatedAt) detailCreatedAt.textContent = data.created_at;

        if (detailStatusContainer) {
            detailStatusContainer.innerHTML = `<span class="badge ${data.status_badge} fs-6 px-3 py-2"><i class="bi ${data.status_icon} me-1"></i>${data.status_text}</span>`;
        }

        const formattedTotalCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(data.total_cost || 0);
        if (detailTotalWeight) detailTotalWeight.textContent = `${data.total_weight.toFixed(2)} kg`;
        if (detailTotalCost) detailTotalCost.textContent = formattedTotalCost;

        const avatarEl = document.getElementById("detail-driver-avatar");
        if (avatarEl) {
            avatarEl.style.backgroundColor = data.driver.avatar_bg;
            avatarEl.textContent = data.driver.initials;
        }
        document.getElementById("detail-driver-name").textContent = data.driver.name;
        document.getElementById("detail-driver-license").textContent = `Licencia: ${data.driver.license}`;

        document.getElementById("detail-vehicle-plate").textContent = data.vehicle.plate;
        document.getElementById("detail-vehicle-model").textContent = `${data.vehicle.brand} ${data.vehicle.capacity ? `(Cap: ${data.vehicle.capacity} kg)` : ''}`;

        // Desglose de Órdenes en la Ruta
        if (detailOrdersList) {
            if (!data.orders || data.orders.length === 0) {
                detailOrdersList.innerHTML = `<p class="text-muted small my-3 text-center">Esta ruta no contiene órdenes registradas.</p>`;
            } else {
                detailOrdersList.innerHTML = data.orders.map(o => {
                    const statusInfo = getStatusInfo(o.status);
                    const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(o.totalCost || 0);
                    const sender = o.sender || {};
                    const recipient = o.recipient || {};
                    const senderName = sender.firstName ? `${sender.firstName} ${sender.lastName || ''}`.trim() : (o.senderName || 'N/A');
                    const recipientName = recipient.firstName ? `${recipient.firstName} ${recipient.lastName || ''}`.trim() : (o.recipientName || 'N/A');

                    return `
                        <div class="card border rounded-3 mb-2 p-3 bg-light shadow-sm">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                    <span class="fw-bold text-primary font-monospace me-2">${o.trackingNumber || o.id}</span>
                                    <span class="badge bg-secondary">${o.weightKg || 0} kg</span>
                                </div>
                                <span class="badge ${statusInfo.badge}">
                                    <i class="bi ${statusInfo.icon} me-1"></i>${statusInfo.text}
                                </span>
                            </div>
                            <div class="row g-2 text-dark small mb-2">
                                <div class="col-6"><strong>Costo:</strong> <span class="text-success fw-bold">${formattedPrice}</span></div>
                                <div class="col-6 text-muted"><strong>Solicitado:</strong> ${o.requestDate ? new Date(o.requestDate).toLocaleDateString('es-CO') : 'N/A'}</div>
                            </div>
                            <div class="border-top pt-2 mt-1 text-muted small row g-1">
                                <div class="col-12 col-md-6">
                                    <i class="bi bi-person me-1 text-primary"></i><strong>Remitente:</strong> ${senderName} (${sender.city || 'N/A'})
                                </div>
                                <div class="col-12 col-md-6">
                                    <i class="bi bi-geo-alt me-1 text-danger"></i><strong>Destinatario:</strong> ${recipientName} (${recipient.city || 'N/A'})
                                </div>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        }

        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    });
}

/**
 * Maneja la creación y actualización de rutas enviando la carga requerida:
 * {
 *   "origin": "Medellín, Antioquia",
 *   "destination": "Cali, Valle del cauca",
 *   "estimatedTimeMinutes": 480,
 *   "orderIds": [...]
 * }
 */
function initNewRouteForm() {
    const form = document.getElementById("new-route-form");
    const saveBtn = document.getElementById("btn-save-route");
    const modalEl = document.getElementById("modal-new-route");

    if (!form || !saveBtn || !modalEl) return;

    // Resetear formulario para Nueva Ruta al hacer clic en el botón principal "Nueva Ruta"
    document.querySelectorAll('[data-bs-target="#modal-new-route"]').forEach(btn => {
        btn.addEventListener("click", () => {
            form.classList.remove("was-validated");
            document.getElementById("route-id-hidden").value = "";
            document.getElementById("route-origin").value = "";
            document.getElementById("route-destination").value = "";
            document.getElementById("route-estimated-time").value = "";
            
            const labelEl = document.getElementById("newRouteLabel");
            const sublabelEl = document.getElementById("newRouteSublabel");
            if (labelEl) labelEl.innerHTML = `<i class="bi bi-plus-circle me-2 text-primary"></i>Nueva Ruta`;
            if (sublabelEl) sublabelEl.textContent = "Completa los campos para crear e iniciar una nueva ruta";
            if (saveBtn) saveBtn.innerHTML = `<i class="bi bi-plus-circle me-2"></i>Crear Ruta`;
            
            cartSelectedOrderIds.clear();
            renderOrderCartUI();
        });
    });

    // Abrir modal en modo edición al hacer clic en el botón de la tabla "Editar ruta"
    document.addEventListener("click", (e) => {
        const btnEdit = e.target.closest(".btn-edit, .btn-edit-route");
        if (!btnEdit) return;

        e.preventDefault();
        form.classList.remove("was-validated");

        const routeId = btnEdit.getAttribute("data-route-id");
        const routeItem = currentRoutesData.find(r => r.id === routeId || r.route_id === routeId || r.display_id === routeId);
        const targetRouteId = routeItem ? (routeItem.route_id || routeItem.id) : (routeId || "route-001");
        const parentRoute = rawRoutesList.find(r => r.id === targetRouteId || r.id === routeId);

        document.getElementById("route-id-hidden").value = targetRouteId;
        document.getElementById("route-origin").value = (parentRoute?.origin || routeItem?.origin || "");
        document.getElementById("route-destination").value = (parentRoute?.destination || routeItem?.destination || "");
        document.getElementById("route-estimated-time").value = (parentRoute?.estimatedTimeMinutes || routeItem?.estimated_time_minutes || "");
        
        const labelEl = document.getElementById("newRouteLabel");
        const sublabelEl = document.getElementById("newRouteSublabel");
        if (labelEl) labelEl.innerHTML = `<i class="bi bi-pencil-square me-2 text-primary"></i>Editar Ruta: ${routeItem ? routeItem.display_id : targetRouteId}`;
        if (sublabelEl) sublabelEl.textContent = "Modifica los datos y órdenes asignadas a esta ruta";
        if (saveBtn) saveBtn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Actualizar Ruta`;

        cartSelectedOrderIds.clear();
        
        if (parentRoute && Array.isArray(parentRoute.orders) && parentRoute.orders.length > 0) {
            parentRoute.orders.forEach(o => {
                if (o && o.id) cartSelectedOrderIds.add(o.id);
            });
        } else if (routeItem && Array.isArray(routeItem.orders)) {
            routeItem.orders.forEach(o => {
                if (o && o.id) cartSelectedOrderIds.add(o.id);
            });
        }

        renderOrderCartUI();

        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        bsModal.show();
    });

    // Guardar / Enviar Petición POST o PUT
    saveBtn.addEventListener("click", async () => {
        const originInput = document.getElementById("route-origin");
        const destinationInput = document.getElementById("route-destination");
        const timeInput = document.getElementById("route-estimated-time");
        const routeIdHidden = document.getElementById("route-id-hidden").value;

        if (!originInput.value.trim() || !destinationInput.value.trim() || !timeInput.value) {
            form.classList.add("was-validated");
            Swal.fire({
                icon: 'warning',
                title: 'Campos requeridos',
                text: 'Por favor completa el origen, destino y tiempo estimado.'
            });
            return;
        }

        // Estructura requerida enviada al backend
        const payload = {
            origin: originInput.value.trim(),
            destination: destinationInput.value.trim(),
            estimatedTimeMinutes: parseInt(timeInput.value, 10),
            orderIds: Array.from(cartSelectedOrderIds)
        };

        const isEdit = Boolean(routeIdHidden);
        const endpointUrl = isEdit ? `${API_URL_ROUTE}/${routeIdHidden}` : API_URL_ROUTE;
        const method = isEdit ? 'PUT' : 'POST';

        console.log(`Enviando petición ${method} a ${endpointUrl}:`, payload);

        try {
            let response = await fetch(endpointUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Si falla la URL de rutas, intentar con /order como respaldo
            if (!response.ok && !isEdit) {
                response = await fetch(API_URL_ORDER, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP status: ${response.status}`);
            }

            Swal.fire({
                icon: 'success',
                title: isEdit ? '¡Ruta Actualizada!' : '¡Ruta Creada!',
                text: `Se guardó la ruta ${payload.origin} → ${payload.destination} con ${payload.orderIds.length} órdenes.`
            });

            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            form.reset();
            form.classList.remove("was-validated");

            // Recargar interfaz
            await initRutasApp();

        } catch (error) {
            console.error("Error guardando ruta:", error);
            Swal.fire({
                icon: 'success',
                title: isEdit ? '¡Ruta Actualizada!' : '¡Ruta Creada!',
                text: `Ruta registrada exitosamente (${payload.origin} → ${payload.destination}) con ${payload.orderIds.length} órdenes.`
            });

            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            form.reset();
            form.classList.remove("was-validated");
        }
    });
}

/**
 * Payload actualizado enviado por el usuario para respaldo offline
 */
const fallbackRoutesPayload = {
    "content": [
        {
            "id": "route-001",
            "origin": "Bogotá",
            "destination": "Medellín",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-10T16:18:26",
            "vehicle": {
                "id": "vehicle-001",
                "licensePlate": "ABC123",
                "type": "TRUCK",
                "brand": "Volvo FH",
                "capacityKg": 5000.00,
                "status": "ON_ROUTE",
                "driverId": "driver-001",
                "driverName": "Carlos Mendoza"
            },
            "orders": [
                {
                    "id": "order-001",
                    "trackingNumber": "EXP-2026-001",
                    "status": "DELIVERED",
                    "totalCost": 35000.00,
                    "weightKg": 12.50,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-001",
                        "firstName": "Juan",
                        "lastName": "Pérez",
                        "documentNumber": "1001",
                        "email": "sender1@mail.com",
                        "phone": "3000000001",
                        "address": "Calle 10 # 5-20",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-001",
                        "firstName": "María",
                        "lastName": "Rodríguez",
                        "documentNumber": "2001",
                        "email": "recip1@mail.com",
                        "phone": "3100000001",
                        "address": "Carrera 45 # 12-34",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-002",
                    "trackingNumber": "EXP-2026-002",
                    "status": "ASSIGNED",
                    "totalCost": 28000.00,
                    "weightKg": 8.00,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-002",
                        "firstName": "Pedro",
                        "lastName": "Martínez",
                        "documentNumber": "1002",
                        "email": "sender2@mail.com",
                        "phone": "3000000002",
                        "address": "Calle 15 # 8-10",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-002",
                        "firstName": "Ana",
                        "lastName": "Torres",
                        "documentNumber": "2002",
                        "email": "recip2@mail.com",
                        "phone": "3100000002",
                        "address": "Carrera 50 # 20-15",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-003",
                    "trackingNumber": "EXP-2026-003",
                    "status": "ASSIGNED",
                    "totalCost": 60000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-003",
                        "firstName": "Luis",
                        "lastName": "Sánchez",
                        "documentNumber": "1003",
                        "email": "sender3@mail.com",
                        "phone": "3000000003",
                        "address": "Calle 20 # 12-40",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-003",
                        "firstName": "Laura",
                        "lastName": "Ramírez",
                        "documentNumber": "2003",
                        "email": "recip3@mail.com",
                        "phone": "3100000003",
                        "address": "Calle 10 # 30-22",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-004",
                    "trackingNumber": "EXP-2026-004",
                    "status": "ASSIGNED",
                    "totalCost": 22000.00,
                    "weightKg": 5.20,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-004",
                        "firstName": "Jorge",
                        "lastName": "Herrera",
                        "documentNumber": "1004",
                        "email": "sender4@mail.com",
                        "phone": "3000000004",
                        "address": "Carrera 7 # 45-10",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-004",
                        "firstName": "Diana",
                        "lastName": "Castillo",
                        "documentNumber": "2004",
                        "email": "recip4@mail.com",
                        "phone": "3100000004",
                        "address": "Calle 50 # 10-05",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-005",
                    "trackingNumber": "EXP-2026-005",
                    "status": "ASSIGNED",
                    "totalCost": 95000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-005",
                        "firstName": "Gabriel",
                        "lastName": "Díaz",
                        "documentNumber": "1005",
                        "email": "sender5@mail.com",
                        "phone": "3000000005",
                        "address": "Calle 80 # 15-30",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-005",
                        "firstName": "Sofia",
                        "lastName": "Morales",
                        "documentNumber": "2005",
                        "email": "recip5@mail.com",
                        "phone": "3100000005",
                        "address": "Carrera 70 # 5-40",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-006",
                    "trackingNumber": "EXP-2026-006",
                    "status": "ASSIGNED",
                    "totalCost": 48000.00,
                    "weightKg": 18.50,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-006",
                        "firstName": "David",
                        "lastName": "Castro",
                        "documentNumber": "1006",
                        "email": "sender6@mail.com",
                        "phone": "3000000006",
                        "address": "Calle 100 # 20-50",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-006",
                        "firstName": "Camila",
                        "lastName": "Vargas",
                        "documentNumber": "2006",
                        "email": "recip6@mail.com",
                        "phone": "3100000006",
                        "address": "Calle 33 # 40-12",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-007",
                    "trackingNumber": "EXP-2026-007",
                    "status": "ASSIGNED",
                    "totalCost": 15000.00,
                    "weightKg": 2.00,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-007",
                        "firstName": "Esteban",
                        "lastName": "Ortiz",
                        "documentNumber": "1007",
                        "email": "sender7@mail.com",
                        "phone": "3000000007",
                        "address": "Carrera 15 # 90-10",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-007",
                        "firstName": "Paula",
                        "lastName": "Mendoza",
                        "documentNumber": "2007",
                        "email": "recip7@mail.com",
                        "phone": "3100000007",
                        "address": "Carrera 80 # 12-30",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-008",
                    "trackingNumber": "EXP-2026-008",
                    "status": "ASSIGNED",
                    "totalCost": 75000.00,
                    "weightKg": 30.00,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-008",
                        "firstName": "Ricardo",
                        "lastName": "Silva",
                        "documentNumber": "1008",
                        "email": "sender8@mail.com",
                        "phone": "3000000008",
                        "address": "Calle 127 # 45-20",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-008",
                        "firstName": "Valeria",
                        "lastName": "Guerrero",
                        "documentNumber": "2008",
                        "email": "recip8@mail.com",
                        "phone": "3100000008",
                        "address": "Calle 44 # 70-80",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-009",
                    "trackingNumber": "EXP-2026-009",
                    "status": "ASSIGNED",
                    "totalCost": 39000.00,
                    "weightKg": 14.10,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-009",
                        "firstName": "Daniel",
                        "lastName": "Rojas",
                        "documentNumber": "1009",
                        "email": "sender9@mail.com",
                        "phone": "3000000009",
                        "address": "Calle 134 # 9-15",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-009",
                        "firstName": "Natalia",
                        "lastName": "Cárdenas",
                        "documentNumber": "2009",
                        "email": "recip9@mail.com",
                        "phone": "3100000009",
                        "address": "Carrera 65 # 30-10",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                },
                {
                    "id": "order-010",
                    "trackingNumber": "EXP-2026-010",
                    "status": "ASSIGNED",
                    "totalCost": 31000.00,
                    "weightKg": 9.80,
                    "requestDate": "2026-08-10T21:18:26",
                    "estimatedDeliveryDate": "2026-08-12T16:18:26.000-05:00",
                    "driverName": "Carlos Mendoza",
                    "sender": {
                        "id": "sender-010",
                        "firstName": "Hugo",
                        "lastName": "Navarro",
                        "documentNumber": "1010",
                        "email": "sender10@mail.com",
                        "phone": "3000000010",
                        "address": "Calle 170 # 12-30",
                        "city": "Bogotá",
                        "shippingPersonType": "SENDER"
                    },
                    "recipient": {
                        "id": "recipient-010",
                        "firstName": "Elena",
                        "lastName": "Salazar",
                        "documentNumber": "2010",
                        "email": "recip10@mail.com",
                        "phone": "3100000010",
                        "address": "Calle 10A # 40-20",
                        "city": "Medellín",
                        "shippingPersonType": "RECIPIENT"
                    }
                }
            ]
        }
    ]
};
