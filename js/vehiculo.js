// Función global de filtrado para que consulte el DOM actual
function filterVehicles() {
  const searchInput = document.querySelector('input[placeholder*="Buscar"]');
  const statusSelect = document.querySelector('.card-body select');
  
  // Consultamos los elementos dinámicos que existen EN ESTE MOMENTO en el DOM
  const vehicleCards = document.querySelectorAll('#vehicles-container .vehicle-item');

  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedStatus = statusSelect ? statusSelect.value.toLowerCase() : 'todos';

  vehicleCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    const cardStatus = (card.dataset.status || '').toLowerCase();

    const matchesSearch = !query || text.includes(query);
    const matchesStatus =
      selectedStatus === 'todos' ||
      cardStatus.includes(selectedStatus) ||
      text.includes(selectedStatus);

    if (matchesSearch && matchesStatus) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const btnGrid = document.getElementById("btn-grid");
  const btnList = document.getElementById("btn-list");
  const container = document.getElementById("vehicles-container");

  if (btnGrid && btnList && container) {
    btnGrid.addEventListener("click", () => {
      container.classList.remove("view-list");
      container.classList.add("view-grid");
      btnGrid.classList.add("active");
      btnList.classList.remove("active");
    });

    btnList.addEventListener("click", () => {
      container.classList.remove("view-grid");
      container.classList.add("view-list");
      btnList.classList.add("active");
      btnGrid.classList.remove("active");
    });
  }

  const searchInput = document.querySelector('input[placeholder*="Buscar"]');
  const statusSelect = document.querySelector('.card-body select');

  if (searchInput) {
    searchInput.addEventListener('input', filterVehicles);
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', filterVehicles);
  }
});


document.addEventListener("DOMContentLoaded", () => {
    const vehicleModal = document.getElementById("vehicle-modal");

    if (vehicleModal) {
        vehicleModal.addEventListener("show.bs.modal", loadDriversSelect);
    }
});

async function loadVehicles() {
    try {
        const response = await fetch("http://localhost:8080/api/v1/vehicle");
        if (!response.ok) throw new Error(`Error ${response.status}: No se pudo cargar la lista`);

        const data = await response.json();
        
        const vehiclesArray = data.content || (Array.isArray(data) ? data : []);

        renderVehicles(vehiclesArray);

    } catch (error) {
        console.error("Error al refrescar vehículos:", error);
    }
}



async function loadDriversSelect() {
    const driverSelect = document.getElementById("vehicle-driver");
    if (!driverSelect) return;

    driverSelect.innerHTML = '<option value="" disabled selected>Cargando conductores...</option>';

    try {
        const response = await fetch("http://localhost:8080/api/v1/driver");
        if (!response.ok) throw new Error(`Error ${response.status}: No se pudieron obtener los conductores`);

        const data = await response.json();
        const driversArray = data.content || (Array.isArray(data) ? data : []);

        driverSelect.innerHTML = '<option value="" selected>Sin conductor asignado</option>';

        driversArray.forEach(driver => {
            const option = document.createElement("option");
            option.value = driver.id; 

            const firstName = driver.user?.firstName || driver.firstName || "";
            const lastName = driver.user?.lastName || driver.lastName || "";
            
            const displayName = `${firstName} ${lastName}`.trim() 
                || driver.user?.username 
                || `Conductor #${driver.id}`;

            option.textContent = displayName;
            driverSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar conductores:", error);
        driverSelect.innerHTML = '<option value="" selected>Sin conductor asignado (Error al cargar)</option>';
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadVehicles();

    const modalElement = document.getElementById("vehicle-modal");
    if (modalElement) {
        modalElement.addEventListener("show.bs.modal", loadDriversSelect);
    }

    const btnSave = document.getElementById("btn-vehicle-save");
    const vehicleForm = document.getElementById("vehicle-form");

    if (btnSave && vehicleForm) {
        btnSave.addEventListener("click", async (e) => {
            e.preventDefault();

            if (!vehicleForm.checkValidity()) {
                vehicleForm.classList.add("was-validated");
                return;
            }

            const rawDriverId = document.getElementById("vehicle-driver").value;

            const vehicleData = {
                // id: document.getElementById("vehicle-id").value.trim() || null,
                brand: document.getElementById("vehicle-brand").value.trim(),
                licensePlate: document.getElementById("license-plate").value.trim().toUpperCase(),
                capacityKg: parseFloat(document.getElementById("vehicle-capacity").value),
                type: document.getElementById("vehicle-type").value,
                status: document.getElementById("vehicle-status").value,
                driverId: rawDriverId !== "" ? rawDriverId : null 
            };

            try {
                btnSave.disabled = true;
                btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...';

                const response = await fetch("http://localhost:8080/api/v1/vehicle", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(vehicleData)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    throw new Error(errorData?.message || `Error en el servidor: ${response.status}`);
                }

                await loadVehicles();

                vehicleForm.reset();
                vehicleForm.classList.remove("was-validated");

                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }

                alert("¡Vehículo registrado correctamente!");

            } catch (error) {
                console.error("Error al registrar el vehículo:", error);
                alert(`No se pudo registrar el vehículo: ${error.message}`);
            } finally {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="bi bi-check-circle me-2"></i> Registrar Vehículo';
            }
        });
    }
});


// Función para recalcular y actualizar los KPIs en el DOM
function updateVehicleMetrics(response) {
  // Extraemos la lista desde la propiedad content o fallback a un array vacío
  const vehicleList = Array.isArray(response) ? response : (response?.content || []);

  // Para el total, usamos totalElements si existe (útil en paginación) o la longitud de la lista
  const total = response?.totalElements ?? vehicleList.length;

  // Conteo filtrado sobre la lista real de vehículos (vehicleList)
  const available = vehicleList.filter(v => v.status === "AVAILABLE").length;
  const inRoute = vehicleList.filter(v => v.status === "ON_ROUTE" || v.status === "IN_ROUTE").length;
  const maintenance = vehicleList.filter(v => v.status === "MAINTENANCE" || v.status === "IN_MAINTENANCE").length;

  // Actualización de nodos en el DOM
  const totalEl = document.getElementById("kpi-total");
  const availableEl = document.getElementById("kpi-available");
  const inRouteEl = document.getElementById("kpi-in-route");
  const maintenanceEl = document.getElementById("kpi-maintenance");

  if (totalEl) totalEl.textContent = total;
  if (availableEl) availableEl.textContent = available;
  if (inRouteEl) inRouteEl.textContent = inRoute;
  if (maintenanceEl) maintenanceEl.textContent = maintenance;
}

async function fetchVehicles() {
  try {
    const response = await fetch("http://localhost:8080/api/v1/vehicle"); 
    if (!response.ok) throw new Error("Error al obtener los vehículos");

    const vehiclesData = await response.json();

    console.log("Datos recibidos:", vehiclesData);

    // Pasamos la respuesta completa a la función de métricas
    updateVehicleMetrics(vehiclesData);

    // Para renderizar la lista/tabla, asegúrate de pasar únicamente la lista de items:
    renderVehicles(vehiclesData.content);

  } catch (error) {
    console.error("Error al cargar las métricas de vehículos:", error);
  }
  filterVehicles();
}

// Cargar métricas al estar listo el DOM
document.addEventListener("DOMContentLoaded", fetchVehicles);

function renderVehicles(vehiclesArray) {
    const container = document.getElementById("vehicles-container");
    if (!container) return;

    if (!vehiclesArray || vehiclesArray.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-5 w-100">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                No se encontraron vehículos.
            </div>
        `;
        return;
    }
    
    container.innerHTML = vehiclesArray.map(vehicle => createVehicleItemHTML(vehicle)).join("");
}

function getStatusConfig(status) {
  switch (status?.toUpperCase()) {
    case "ON_ROUTE":
    case "EN RUTA":
      return {
        label: "En Ruta",
        dataStatus: "en ruta",
        badgeBg: "bg-primary",
        icon: "bi-truck",
        fuelColor: "bg-success"
      };
    case "AVAILABLE":
    case "DISPONIBLE":
      return {
        label: "Disponible",
        dataStatus: "disponible",
        badgeBg: "bg-success",
        icon: "bi-check-circle",
        fuelColor: "bg-success"
      };
    case "MAINTENANCE":
    case "IN_MAINTENANCE":
    case "MANTENIMIENTO":
      return {
        label: "Mantenimiento",
        dataStatus: "mantenimiento",
        badgeBg: "bg-warning",
        icon: "bi-tools",
        fuelColor: "bg-warning"
      };
    case "INACTIVE":
    case "INACTIVO":
    default:
      return {
        label: "Inactivo",
        dataStatus: "inactivo",
        badgeBg: "bg-secondary",
        icon: "bi-pause-circle",
        fuelColor: "bg-danger"
      };
  }
}

function createVehicleItemHTML(v) {
    const statusConfig = typeof getStatusConfig === "function" 
        ? getStatusConfig(v.status) 
        : { label: v.status || 'Activo', badgeBg: 'bg-success', icon: 'bi-check-circle', dataStatus: 'active' };
    
    
    const code = v.id ? `#${v.id}` : (v.internalId || "N/A");
    const model = v.brand || "Sin modelo";
    const plate = v.licensePlate || v.plate || "S/P";
    const typeYear = `${v.type || 'Vehículo'}`;
    const capacity = v.capacityKg ? `${Number(v.capacityKg).toLocaleString('es-ES')} kg` : "N/A";
    
    const firstName = v.driver?.user?.firstName || v.driver?.firstName || "";
    const lastName = v.driver?.user?.lastName || v.driver?.lastName || "";
    const driver = `${firstName} ${lastName}`.trim() || "—";

    return `
    <div class="vehicle-item" data-status="${statusConfig.dataStatus}">
        <div class="v-header-grid w-100 v-grid-only">
            <div class="v-icon ${statusConfig.badgeBg} bg-opacity-10 text-${statusConfig.badgeBg.replace('bg-', '')}">
                <i class="bi ${statusConfig.icon}"></i>
            </div>
            <span class="badge badge-soft ${statusConfig.badgeBg} bg-opacity-10 text-${statusConfig.badgeBg.replace('bg-', '')} px-3 py-2 rounded-pill">
                <i class="bi ${statusConfig.icon} me-1"></i> ${statusConfig.label}
            </span>
        </div>

        <div class="v-icon-container v-list-only">
            <div class="v-icon bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-truck"></i>
            </div>
        </div>

        <div class="v-main-info flex-column align-items-start">
            <div class="v-title-row d-flex align-items-center flex-wrap gap-1">
                <span class="fw-bold text-primary">${code}</span>
                <span class="text-muted small">·</span>
                <span class="fw-bold text-dark fs-5">${model}</span>
                <span class="badge bg-light text-muted border px-2 py-1 ms-2">${plate}</span>
            </div>

            <div class="v-meta-info v-list-only mt-1">
                <span>${typeYear}</span>
                <span>${capacity}</span>
            </div>
        </div>

        <div class="v-actions v-list-only">
            <span class="conductor-name">${driver}</span>
            <span class="badge badge-soft ${statusConfig.badgeBg} bg-opacity-10 text-${statusConfig.badgeBg.replace('bg-', '')} px-3 py-2 rounded-pill">
                <i class="bi ${statusConfig.icon} me-1"></i> ${statusConfig.label}
            </span>
        </div>

        <div class="v-meta-grid v-grid-only w-100">
            <div class="text-muted mb-3">${typeYear}</div>
            <div class="v-meta-row"><span>Capacidad</span><span class="v-meta-val">${capacity}</span></div>
            <div class="v-meta-row"><span>Conductor</span><span class="v-meta-val text-dark fw-bold">${driver}</span></div>
        </div>
    </div>
    `;
}