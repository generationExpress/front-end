const STORAGE_KEY = "drivers";

// Variables globales para mantener los valores actuales de los filtros
let currentStatusFilter = "todos";
let currentSearchQuery = "";

// Inicialización de Event Listeners cuando el DOM está listo
document.addEventListener("DOMContentLoaded", () => {
  setupFilterEvents();
  fetchDrivers();
});

// Configuración de los eventos para los botones y la barra de búsqueda
function setupFilterEvents() {
  const filterBtns = document.querySelectorAll(".filter-tabs .btn");
  const searchInput = document.querySelector('input[placeholder*="Buscar"]');

  // Evento para pestañas de filtro (estado)
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentStatusFilter = btn.dataset.filter?.toLowerCase() || "todos";
      applyFilters();
    });
  });

  // Evento para la barra de búsqueda por texto
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearchQuery = searchInput.value.toLowerCase().trim();
      applyFilters();
    });
  }
}

// Función que aplica ambos filtros simultáneamente a las tarjetas renderizadas
function applyFilters() {
  const cards = document.querySelectorAll("#drivers-grid .driver-card");

  cards.forEach((card) => {
    const cardStatus = card.dataset.status?.toLowerCase() || "";
    const cardText = card.textContent.toLowerCase();

    // Comprobar coincidencia con filtro de estado
    const matchesStatus =
      currentStatusFilter === "todos" || cardStatus === currentStatusFilter;

    // Comprobar coincidencia con búsqueda por texto
    const matchesSearch =
      currentSearchQuery === "" || cardText.includes(currentSearchQuery);

    // Mostrar sólo si cumple ambas condiciones
    if (matchesStatus && matchesSearch) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("driver-form");
  const btnSave = document.getElementById("btn-driver-save");
  const modalElement = document.getElementById("driver-modal");

  btnSave.addEventListener("click", () => {
    
    const name = document.getElementById("driver-name");
    const phone = document.getElementById("driver-phone");
    const email = document.getElementById("driver-email");
    
    name.setCustomValidity("");
    phone.setCustomValidity("");
    email.setCustomValidity("");

    if (name.value.trim().length < 10) {
      name.setCustomValidity("El nombre debe tener al menos 10 caracteres.");
    }

    if (!/^\d{10}$/.test(phone.value.trim())) {
      phone.setCustomValidity(
        "Ingrese un número de teléfono válido de 10 dígitos.",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setCustomValidity("Ingrese un correo electrónico válido.");
    }

    const isValid = form.checkValidity();

    form.classList.add("was-validated");

    if (!isValid) {
      form.reportValidity();
      return;
    }

    const driver = {
      name: document.getElementById("driver-name").value,
      license: document.getElementById("driver-license").value,
      phone: document.getElementById("driver-phone").value,
      email: document.getElementById("driver-email").value,
      assignedVehicle: document.getElementById("assigned-vehicle").value,
      status: document.getElementById("driver-status").value,
    };

    console.log("Driver:", driver);
    saveLocalStorage(driver);

    bootstrap.Modal.getInstance(modalElement).hide();

    form.reset();
    form.classList.remove("was-validated");
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
  });
});

function saveLocalStorage(driver) {
  const drivers = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  drivers.push(driver);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
}

function resetForm() {
  form.reset();

  // Eliminar los estilos de validación para que
  // al abrir nuevamente el modal aparezca limpio.
  form.classList.remove("was-validated");
}


document.addEventListener('DOMContentLoaded', () => {
    cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/driver');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        actualizarTarjetasKPI(data);

    } catch (error) {
        console.error('Error al obtener la información de los conductores:', error);
    }
}

function actualizarTarjetasKPI(data) {
    const conductores = data.content || [];

    const totalConductores = data.totalElements ?? conductores.length;

    const disponibles = conductores.filter(driver => driver.available === true).length;

    const enRuta = conductores.filter(driver => driver.available === false).length;

    // Renderizado en el DOM
    document.getElementById('total-conductores').textContent = totalConductores;
    document.getElementById('conductores-en-ruta').textContent = enRuta;
    document.getElementById('conductores-disponibles').textContent = disponibles;
}


const API_URL = 'http://localhost:8080/api/v1/driver';

async function fetchDrivers() {
  const container = document.getElementById("drivers-grid");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(data);
    
  
    let driversList = [];
    if (Array.isArray(data)) {
      driversList = data;
    } else if (Array.isArray(data.data)) {
      driversList = data.data;
    } else if (Array.isArray(data.content)) {
      driversList = data.content;
    }

    renderDrivers(driversList);
  } catch (error) {
    console.error("Error al obtener los datos de la API:", error);
    if (container) {
      container.innerHTML = `
        <div class="alert alert-danger w-100 text-center" role="alert">
          Ocurrió un error al cargar los datos de los conductores. Inténtalo de nuevo más tarde.
        </div>
      `;
    }
  }
}

// Única llamada al cargar el DOM (Llama a la API, no a una variable inexistente)
document.addEventListener("DOMContentLoaded", () => {
  fetchDrivers();
});

function getInitials(name = "") {
  if (!name) return "??";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function renderDrivers(driverList) {
  const container = document.getElementById("drivers-grid");

  if (!container) return;

  if (!Array.isArray(driverList) || driverList.length === 0) {
    container.innerHTML = `<div class="alert alert-info w-100 text-center">No se encontraron conductores.</div>`;
    return;
  }

  const cardsHTML = driverList
    .map((driver) => {
      const driverId = driver.id ?? '—';
      
      const user = driver.user;
      const firstName = user?.firstName ?? '';
      const lastName = user?.lastName ?? '';
      const driverName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : 'Sin Nombre';
      
      const driverLicense = driver.license ?? 'N/A';
      
      const isAvailable = driver.available ?? false;
      const driverStatus = isAvailable ? "disponible" : "no disponible";
      const driverStatusLabel = isAvailable ? "Disponible" : "No disponible";

      const driverRating = Number(driver.rating ?? 0);
      const driverVehicle = driver.vehicle ?? '—';
      const totalShipments = driver.totalShipments ?? 0;

      const initials = getInitials(driverName);
      const badgeClass = getBadgeClass(driverStatus);
      const vehicleClass = driverVehicle === "—" ? "text-muted" : "text-primary";

      return `
        <div class="driver-card p-4 shadow-sm" data-status="${driverStatus}">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="d-flex align-items-center gap-3">
              <div class="driver-avatar" style="background:${driver.avatarBg || '#e2e8f0'}; color:${driver.avatarColor || '#334155'};">
                ${initials}
              </div>
              <div>
                <div class="fw-bold text-dark mb-0" style="font-size:1rem;">${driverName}</div>
                <div class="text-muted" style="font-size:0.8rem;">${driverId}</div>
              </div>
            </div>
            <span class="badge rounded-pill ${badgeClass} px-3 py-2" style="font-size:0.78rem; font-weight:600;">
              ${driverStatusLabel}
            </span>
          </div>


          <div class="d-flex flex-column gap-2 mb-3">
            <div class="d-flex justify-content-between align-items-center">
              <span class="driver-stat-label">Licencia</span>
              <span class="driver-stat-value">${driverLicense}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="driver-stat-label">Vehículo</span>
              <span class="driver-stat-value ${vehicleClass}">${driverVehicle}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="driver-stat-label">Envíos totales</span>
              <span class="driver-stat-value">${totalShipments}</span>
            </div>
          </div>

          <hr class="my-3 text-muted opacity-25">
          <div class="d-flex gap-2">
            <button class="contact-btn" tel: title="Llamar"><a href="tel:+573001234567"><i class="bi bi-telephone"></i></a></button>
            <button class="contact-btn" title="Enviar correo" ${user?.email ? `onclick="location.href='mailto:${user.email}'"` : ''}>
              <i class="bi bi-envelope"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = cardsHTML;

  // Re-aplicar filtros existentes después de insertar las tarjetas generadas desde la API
  applyFilters();
}

// Opcional: Ajustar getBadgeClass para soportar "no disponible"
function getBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case "en-ruta":
    case "en_ruta":
      return "bg-primary bg-opacity-10 text-primary";
    case "disponible":
      return "bg-success bg-opacity-10 text-success";
    case "descanso":
    case "no disponible":
      return "bg-warning bg-opacity-10 text-warning";
    default:
      return "bg-secondary bg-opacity-10 text-secondary";
  }
}


async function loadVehiclesSelect() {
    const vehicleSelect = document.getElementById("assigned-vehicle");
    if (!vehicleSelect) return;

    vehicleSelect.innerHTML = '<option value="" disabled selected>Cargando vehículos...</option>';

    try {
        const response = await fetch("http://localhost:8080/api/v1/vehicle");
        if (!response.ok) throw new Error(`Error ${response.status}: No se obtuvieron los vehículos`);

        const data = await response.json();
        const vehiclesArray = data.content || (Array.isArray(data) ? data : []);

        vehicleSelect.innerHTML = '<option value="" selected>Sin vehículo asignado</option>';

        vehiclesArray.forEach(v => {
            const option = document.createElement("option");
            option.value = v.id;
            
            const brand = v.brand || "Vehículo";
            const plate = v.licensePlate || v.plate || "Sin placa";
            const type = v.type || "";

            option.textContent = `${brand} - ${plate}`;
            vehicleSelect.appendChild(option);
        });

    } catch (error) {
        console.error("Error al cargar lista de vehículos:", error);
        vehicleSelect.innerHTML = '<option value="" selected>Sin vehículo asignado (Error al cargar)</option>';
    }
}


// --- DIVIDIR NOMBRE COMPLETO EN NOMBRE Y APELLIDO ---
function splitFullName(fullName) {
    const trimmed = fullName.trim().replace(/\s+/g, " ");
    const firstSpaceIndex = trimmed.indexOf(" ");

    if (firstSpaceIndex === -1) {
        return {
            firstName: trimmed,
            lastName: "." // Valor por defecto si solo escriben un nombre
        };
    }

    return {
        firstName: trimmed.substring(0, firstSpaceIndex),
        lastName: trimmed.substring(firstSpaceIndex + 1)
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const btnDriverSave = document.getElementById("btn-driver-save");
    const driverForm = document.getElementById("driver-form");
    const driverModalElement = document.getElementById("driver-modal");

    if (driverModalElement) {
        driverModalElement.addEventListener("show.bs.modal", loadVehiclesSelect);
    }

    // --- FUNCIÓN DE TOAST ESTILIZADO SEGÚN TU DISEÑO ---
    function showFloatingAlert(title, message, type = "danger") {
        let container = document.getElementById("toast-alert-container");

        if (!container) {
            container = document.createElement("div");
            container.id = "toast-alert-container";
            // Posicionamiento superior centrado con prioridad z-index
            container.className = "position-fixed top-0 start-50 translate-middle-x mt-3";
            container.style.zIndex = "1090";
            container.style.width = "auto";
            container.style.minWidth = "320px";
            container.style.maxWidth = "550px";
            document.body.appendChild(container);
        }

        // estilos Toast
        const styles = {
            danger: {
                bg: "#FFF5F5",
                border: "#FEB2B2",
                titleColor: "#C53030",
                textColor: "#E53E3E",
                closeColor: "#E53E3E"
            },
            success: {
                bg: "#F0FFF4",
                border: "#9AE6B4",
                titleColor: "#22543D",
                textColor: "#2F855A",
                closeColor: "#2F855A"
            },
            warning: {
                bg: "#FFFFF0",
                border: "#FBD38D",
                titleColor: "#744210",
                textColor: "#DD6B20",
                closeColor: "#DD6B20"
            }
        };

        const config = styles[type] || styles.danger;
        const alertId = `alert-${Date.now()}`;

        container.innerHTML = `
            <div id="${alertId}" class="fade show d-flex align-items-center justify-content-between p-3 rounded-2 shadow-sm"
                 style="background-color: ${config.bg}; border: 1px solid ${config.border}; font-family: system-ui, -apple-system, sans-serif;">
                <div class="me-3 fs-6">
                    <strong style="color: ${config.titleColor}; fw-bold">${title}</strong>
                    <span style="color: ${config.textColor};">${message}</span>
                </div>
                <button type="button" class="btn p-0 border-0 fs-5 fw-bold ms-3" 
                        style="color: ${config.closeColor}; line-height: 1; background: transparent; cursor: pointer;" 
                        onclick="document.getElementById('${alertId}').remove();" aria-label="Close">
                    &times;
                </button>
            </div>
        `;

        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.classList.remove("show");
                setTimeout(() => alertElement.remove(), 150);
            }
        }, 1500);
    }

    function closeModal() {
        if (driverModalElement) {
            const modalInstance = bootstrap.Modal.getInstance(driverModalElement) || new bootstrap.Modal(driverModalElement);
            if (modalInstance) modalInstance.hide();
        }
    }

    if (btnDriverSave && driverForm) {
        btnDriverSave.addEventListener("click", async (e) => {
            e.preventDefault();

            if (!driverForm.checkValidity()) {
                driverForm.classList.add("was-validated");
                closeModal();
                showFloatingAlert("¡Atención!", "Por favor completa todos los campos requeridos.", "warning");
                return;
            }

            const rawFullName = document.getElementById("driver-fullname").value;
            const { firstName, lastName } = splitFullName(rawFullName);
            const defaultPassword = "Driver" + Math.floor(1000 + Math.random() * 9000);

            try {
                btnDriverSave.disabled = true;
                btnDriverSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

                const vehicleSelectElement = document.getElementById("assigned-vehicle");
                const selectedVehicleId = vehicleSelectElement ? vehicleSelectElement.value : null;

                const driverPayload = {
                    license: document.getElementById("driver-license").value,
                    available: document.getElementById("driver-available").value === "true",
                    user: {
                        firstName: firstName,
                        lastName: lastName,
                        email: document.getElementById("driver-email").value.trim(),
                        password: defaultPassword,
                        role: "DRIVER"
                    },
                    vehicleId: selectedVehicleId !== "" ? selectedVehicleId : null
                };

                const driverResponse = await fetch("http://localhost:8080/api/v1/driver", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(driverPayload)
                });

                if (!driverResponse.ok) {
                    const errorDriver = await driverResponse.json().catch(() => null);
                    throw new Error(errorDriver?.message || errorDriver?.errors?.join(", ") || `Error (${driverResponse.status})`);
                }

                if (typeof fetchDrivers === "function") await fetchDrivers();
                if (typeof cargarEstadisticas === "function") await cargarEstadisticas();

                driverForm.reset();
                driverForm.classList.remove("was-validated");

                closeModal();
                showFloatingAlert("¡Éxito!", "Conductor registrado correctamente.", "success");

            } catch (error) {
                console.error("Error en el registro:", error);
                closeModal();
                showFloatingAlert("¡Error!", error.message, "danger");
            } finally {
                btnDriverSave.disabled = false;
                btnDriverSave.innerHTML = '<i class="bi bi-check-circle me-2"></i> Registrar Conductor';
            }
        });
    }
});

