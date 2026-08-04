// rutas.js - Lógica interactiva para la Vista de Rutas

document.addEventListener("DOMContentLoaded", () => {
    initFilters();
    initDetailModal();
    initNewRouteForm();
});

// Estructura de datos completa relacionada a la db:
// routes -> orders -> drivers, vehicles, shipping_person (remitente/destinatario), orders_status_history, deliveries
const routesData = [
    {
        id: "RUT-001",
        tracking: "LOG-2024-001",
        origin: "Madrid",
        destination: "Barcelona",
        estimated_time: "5h 45m",
        estimated_time_minutes: 345,
        created_at: "2024-01-15",
        status: "IN_TRANSIT",
        status_text: "En Tránsito",
        status_badge: "badge-in-transit",
        status_icon: "bi-truck",
        driver: {
            id: 1,
            name: "Carlos García",
            initials: "CG",
            avatar_bg: "#059669",
            license: "C+E",
            phone: "+34 612 345 678"
        },
        vehicle: {
            plate: "1234-ABC",
            model: "Mercedes-Benz Sprinter 316",
            brand: "Mercedes-Benz"
        },
        sender: {
            name: "Electrónica Sur S.L.",
            city: "Madrid",
            address: "Calle Alcalá 120",
            phone: "+34 912 345 678",
            email: "envios@electronicasur.es"
        },
        recipient: {
            name: "TechStore Barcelona",
            city: "Barcelona",
            address: "Av. Diagonal 450",
            phone: "+34 934 567 890",
            email: "logistica@techstore.es"
        },
        order_details: {
            assigned_date: "2024-01-15 08:30",
            estimated_delivery_date: "2024-01-15 14:15",
            weight_kg: 2500,
            total_cost: 450.00
        },
        status_history: [
            { status: "PENDING", title: "Pedido Creado", date: "2024-01-15 07:00", notes: "Pedido registrado en el sistema." },
            { status: "ASSIGNED", title: "Asignado a Conductor", date: "2024-01-15 08:30", notes: "Ruta asignada a Carlos García (1234-ABC)." },
            { status: "IN_TRANSIT", title: "En Tránsito", date: "2024-01-15 09:15", notes: "Vehículo salió de centro logístico Madrid." }
        ],
        delivery_evidence: null
    },
    {
        id: "RUT-002",
        tracking: "LOG-2024-002",
        origin: "Valencia",
        destination: "Sevilla",
        estimated_time: "4h 40m",
        estimated_time_minutes: 280,
        created_at: "2024-01-14",
        status: "DELIVERED",
        status_text: "Entregado",
        status_badge: "badge-delivered",
        status_icon: "bi-check-circle",
        driver: {
            id: 2,
            name: "Ana Martínez",
            initials: "AM",
            avatar_bg: "#2563eb",
            license: "C",
            phone: "+34 623 456 789"
        },
        vehicle: {
            plate: "5678-DEF",
            model: "Volkswagen Crafter 35",
            brand: "Volkswagen"
        },
        sender: {
            name: "Moda Levante S.A.",
            city: "Valencia",
            address: "Calle Colón 45",
            phone: "+34 963 111 222",
            email: "contacto@modalevante.com"
        },
        recipient: {
            name: "Boutique Sevilla",
            city: "Sevilla",
            address: "Calle Sierpes 12",
            phone: "+34 954 333 444",
            email: "recepcion@boutiquesevilla.es"
        },
        order_details: {
            assigned_date: "2024-01-14 06:00",
            estimated_delivery_date: "2024-01-14 11:00",
            weight_kg: 1800,
            total_cost: 380.00
        },
        status_history: [
            { status: "PENDING", title: "Pedido Creado", date: "2024-01-14 05:00", notes: "Pedido registrado." },
            { status: "ASSIGNED", title: "Asignado", date: "2024-01-14 06:00", notes: "Asignado a Ana Martínez." },
            { status: "IN_TRANSIT", title: "En Tránsito", date: "2024-01-14 06:45", notes: "Salió de Valencia." },
            { status: "DELIVERED", title: "Entregado", date: "2024-01-14 11:20", notes: "Entregado y firmado correctamente." }
        ],
        delivery_evidence: {
            received_by: "Manuel Ramos (Encargado)",
            delivery_date: "2024-01-14 11:20",
            notes: "Sin observaciones, empaque intacto.",
            signature_received: true
        }
    },
    {
        id: "RUT-003",
        tracking: "LOG-2024-003",
        origin: "Bilbao",
        destination: "Zaragoza",
        estimated_time: "2h 50m",
        estimated_time_minutes: 170,
        created_at: "2024-01-16",
        status: "PENDING",
        status_text: "Pendiente",
        status_badge: "badge-pending",
        status_icon: "bi-clock",
        driver: {
            id: 3,
            name: "Miguel López",
            initials: "ML",
            avatar_bg: "#059669",
            license: "C+E",
            phone: "+34 634 567 890"
        },
        vehicle: {
            plate: "9012-GHI",
            model: "Iveco Daily 35S14",
            brand: "Iveco"
        },
        sender: {
            name: "Industrias del Norte",
            city: "Bilbao",
            address: "Polígono Gran Vía 80",
            phone: "+34 944 555 666",
            email: "despacho@industriasnorte.es"
        },
        recipient: {
            name: "Almacenes Ebro",
            city: "Zaragoza",
            address: "Av. Cesáreo Alierta 30",
            phone: "+34 976 777 888",
            email: "bodega@almacenesebro.es"
        },
        order_details: {
            assigned_date: "2024-01-16 09:00",
            estimated_delivery_date: "2024-01-16 13:00",
            weight_kg: 3200,
            total_cost: 290.00
        },
        status_history: [
            { status: "PENDING", title: "Pedido Creado", date: "2024-01-16 08:30", notes: "En espera de carga." }
        ],
        delivery_evidence: null
    },
    {
        id: "RUT-004",
        tracking: "LOG-2024-004",
        origin: "Málaga",
        destination: "Granada",
        estimated_time: "1h 40m",
        estimated_time_minutes: 100,
        created_at: "2024-01-14",
        status: "CANCELLED",
        status_text: "Retrasada",
        status_badge: "badge-cancelled",
        status_icon: "bi-exclamation-triangle",
        driver: {
            id: 4,
            name: "Laura Sánchez",
            initials: "LS",
            avatar_bg: "#7c3aed",
            license: "C",
            phone: "+34 645 678 901"
        },
        vehicle: {
            plate: "3456-JKL",
            model: "Ford Transit Custom",
            brand: "Ford"
        },
        sender: {
            name: "Importaciones Málaga",
            city: "Málaga",
            address: "Puerto Comercial s/n",
            phone: "+34 952 888 999",
            email: "logistica@importmalaga.es"
        },
        recipient: {
            name: "Distribuciones Granada",
            city: "Granada",
            address: "Camino de Ronda 102",
            phone: "+34 958 123 456",
            email: "compras@distribucionesgranada.es"
        },
        order_details: {
            assigned_date: "2024-01-14 10:00",
            estimated_delivery_date: "2024-01-14 12:00",
            weight_kg: 1500,
            total_cost: 210.00
        },
        status_history: [
            { status: "PENDING", title: "Pedido Creado", date: "2024-01-14 09:30", notes: "Registrado." },
            { status: "ASSIGNED", title: "Asignado", date: "2024-01-14 10:00", notes: "Asignado a Laura Sánchez." },
            { status: "CANCELLED", title: "Retraso por Avería", date: "2024-01-14 11:15", notes: "Problema mecánico en N-340 km 112." }
        ],
        delivery_evidence: null
    }
];

function initFilters() {
    const searchInput = document.getElementById("search-input");
    const statusSelect = document.getElementById("filter-status");
    const driverSelect = document.getElementById("filter-driver");
    const tableRows = document.querySelectorAll("#routes-table-body tr");

    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedStatus = statusSelect ? statusSelect.value : "ALL";
        const selectedDriver = driverSelect ? driverSelect.value : "ALL";

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

function initDetailModal() {
    const modalEl = document.getElementById("route-detail-modal");
    if (!modalEl) return;

    document.querySelectorAll(".btn-view-detail").forEach(btn => {
        btn.addEventListener("click", () => {
            const routeId = btn.getAttribute("data-route-id");
            const data = routesData.find(r => r.id === routeId);
            if (!data) return;

            // Llenar información en el modal de detalle
            document.getElementById("detail-route-id").textContent = data.id;
            document.getElementById("detail-tracking").textContent = data.tracking;
            document.getElementById("detail-origin").textContent = data.origin;
            document.getElementById("detail-destination").textContent = data.destination;
            document.getElementById("detail-estimated-time").textContent = data.estimated_time;
            document.getElementById("detail-created-at").textContent = data.created_at;

            // Status badge
            const statusContainer = document.getElementById("detail-status-container");
            statusContainer.innerHTML = `<span class="badge ${data.status_badge} fs-6 px-3 py-2"><i class="bi ${data.status_icon} me-1"></i>${data.status_text}</span>`;

            // Pedido info
            document.getElementById("detail-weight").textContent = `${data.order_details.weight_kg.toLocaleString()} kg`;
            document.getElementById("detail-cost").textContent = `€${data.order_details.total_cost.toFixed(2)}`;
            document.getElementById("detail-assigned-date").textContent = data.order_details.assigned_date;
            document.getElementById("detail-delivery-date").textContent = data.order_details.estimated_delivery_date;

            // Conductor
            document.getElementById("detail-driver-avatar").style.backgroundColor = data.driver.avatar_bg;
            document.getElementById("detail-driver-avatar").textContent = data.driver.initials;
            document.getElementById("detail-driver-name").textContent = data.driver.name;
            document.getElementById("detail-driver-license").textContent = `Licencia: ${data.driver.license}`;
            document.getElementById("detail-driver-phone").textContent = data.driver.phone;

            // Vehículo
            document.getElementById("detail-vehicle-plate").textContent = data.vehicle.plate;
            document.getElementById("detail-vehicle-model").textContent = data.vehicle.model;

            // Remitente
            document.getElementById("detail-sender-name").textContent = data.sender.name;
            document.getElementById("detail-sender-city").textContent = data.sender.city;
            document.getElementById("detail-sender-phone").textContent = data.sender.phone;
            document.getElementById("detail-sender-address").textContent = data.sender.address;

            // Destinatario
            document.getElementById("detail-recipient-name").textContent = data.recipient.name;
            document.getElementById("detail-recipient-city").textContent = data.recipient.city;
            document.getElementById("detail-recipient-phone").textContent = data.recipient.phone;
            document.getElementById("detail-recipient-address").textContent = data.recipient.address;

            // Historial de estados (Timeline)
            const timelineContainer = document.getElementById("detail-timeline");
            timelineContainer.innerHTML = data.status_history.map((h, i) => `
                <div class="timeline-item ${i === data.status_history.length - 1 ? 'active' : 'completed'}">
                    <div class="timeline-dot"></div>
                    <div class="fw-bold text-dark mb-1" style="font-size:0.9rem;">${h.title}</div>
                    <div class="timeline-date mb-1"><i class="bi bi-clock me-1"></i>${h.date}</div>
                    <div class="text-muted small">${h.notes}</div>
                </div>
            `).join("");

            // Evidencia de entrega
            const evidenceBox = document.getElementById("detail-evidence-box");
            if (data.delivery_evidence) {
                evidenceBox.innerHTML = `
                    <div class="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3">
                        <div class="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                            <i class="bi bi-patch-check-fill fs-5"></i> Entrega Confirmada
                        </div>
                        <div class="row g-2 text-dark small">
                            <div class="col-6"><strong>Recibido por:</strong> ${data.delivery_evidence.received_by}</div>
                            <div class="col-6"><strong>Fecha/Hora:</strong> ${data.delivery_evidence.delivery_date}</div>
                            <div class="col-12 mt-1"><strong>Observaciones:</strong> ${data.delivery_evidence.notes}</div>
                        </div>
                    </div>
                `;
            } else {
                evidenceBox.innerHTML = `
                    <div class="p-3 bg-light text-muted rounded-3 text-center small">
                        <i class="bi bi-info-circle me-1"></i> Evidencia de entrega no disponible (envío aún en proceso).
                    </div>
                `;
            }

            // Mostrar el modal
            const bsModal = new bootstrap.Modal(modalEl);
            bsModal.show();
        });
    });
}

function initNewRouteForm() {
    const form = document.getElementById("new-route-form");
    const saveBtn = document.getElementById("btn-save-route");
    if (!form || !saveBtn) return;

    saveBtn.addEventListener("click", () => {
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        const modalEl = document.getElementById("modal-new-route");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        form.reset();
        form.classList.remove("was-validated");

        alert("¡Ruta creada exitosamente!");
    });
}
