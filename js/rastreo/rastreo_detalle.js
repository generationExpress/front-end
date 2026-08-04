// Orden fijo de los 3 estados que se muestran en el timeline.
const STATUS_ORDER = ["pendiente", "en-transito", "entregado"];

const STATUS_META = {
  "pendiente": { label: "Pendiente", icon: "bi-hourglass-split" },
  "en-transito": { label: "En tránsito", icon: "bi-truck" },
  "entregado": { label: "Entregado", icon: "bi-check-circle" },
  "cancelado": { label: "Cancelado", icon: "bi-x-circle" }
};

// El backend maneja más estados (PENDING, ASSIGNED, IN_TRANSIT,
// DELIVERED, CANCELLED) de los que el timeline necesita distinguir.
// Este mapa los reduce a los 3 (+cancelado) que la UI conoce.
const SHIPMENT_STATUS_MAP = {
  PENDING: "pendiente",
  ASSIGNED: "pendiente",
  IN_TRANSIT: "en-transito",
  DELIVERED: "entregado",
  CANCELLED: "cancelado"
};

// Referencias a los 3 bloques que se alternan según el estado de la carga
const loadingState = document.getElementById("loadingState");
const notFoundState = document.getElementById("notFoundState");
const trackingContent = document.getElementById("trackingContent");

init();

async function init() {
  const trackingNumber = getTrackingNumberFromURL();

  if (!trackingNumber) {
    showNotFound({ noNumber: true });
    return;
  }

  showLoading();

  const order = await getOrderData(trackingNumber);

  if (!order) {
    showNotFound({ trackingNumber });
    return;
  }

  renderTracking(mapOrderToViewModel(order));
  showContent();
}

function getTrackingNumberFromURL() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("guia");
  return value ? value.trim() : "";
}

/**
 * Busca primero en sessionStorage (dejado ahí por rastreo.js al
 * navegar desde el buscador, para no repetir la petición). Si no
 * está —por ejemplo, si el usuario recargó la página o entró
 * directo con la URL— vuelve a pedirlo con TrackingAPI.
 */
async function getOrderData(trackingNumber) {
  const cacheKey = `tracking:${trackingNumber.toUpperCase()}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const order = await TrackingAPI.fetchTracking(trackingNumber);

  if (order) {
    sessionStorage.setItem(cacheKey, JSON.stringify(order));
  }

  return order;
}

/**
 * Traduce el JSON tal como lo entrega el backend a la forma que la
 * vista necesita para pintarse. Si el día de mañana el backend
 * cambia nombres de campos, este es el único lugar que hay que
 * tocar — el resto del archivo no sabe nada de la forma real del
 * JSON.
 */
function mapOrderToViewModel(order) {
  const status = resolveCurrentStatus(order);
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  const inTransitDate = findHistoryDate(history, "IN_TRANSIT");
  const deliveredDate = order.delivery
    ? order.delivery.deliveredAt
    : findHistoryDate(history, "DELIVERED");

  return {
    trackingNumber: order.trackingNumber,
    status,
    origin: order.route ? order.route.origin : "Por asignar",
    destination: order.route ? order.route.destination : "Por asignar",
    estimatedDelivery: order.estimatedDeliveryDate,
    receivedBy: order.delivery ? order.delivery.receiverName : null,
    weightKg: order.weightKg,
    totalCost: order.totalCost,
    sender: formatPersonName(order.sender),
    recipient: formatPersonName(order.recipient),
    driver: order.driver ? formatPersonName(order.driver.user) : null,
    timeline: [
      { step: "pendiente", label: "Pedido recibido", date: order.requestDate },
      { step: "en-transito", label: "En tránsito", date: inTransitDate },
      { step: "entregado", label: "Entregado", date: deliveredDate }
    ]
  };
}

/**
 * El estado "oficial" de la orden (order.status) refleja su estado
 * administrativo (ej. "ASSIGNED" = ya tiene conductor asignado),
 * que no siempre coincide con el estado más reciente del historial
 * de envío. Para el timeline usamos, en este orden de prioridad:
 * 1) si hay `delivery`, ya se entregó, sin importar lo demás.
 * 2) si hay historial, el registro más reciente por `updatedAt`.
 * 3) si no hay historial todavía, el `order.status` de la orden.
 */
function resolveCurrentStatus(order) {
  if (order.delivery) return "entregado";

  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];

  if (history.length > 0) {
    const latest = [...history].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )[0];
    return SHIPMENT_STATUS_MAP[latest.shipmentStatus] || "pendiente";
  }

  return SHIPMENT_STATUS_MAP[order.status] || "pendiente";
}

function findHistoryDate(history, shipmentStatus) {
  const entry = history.find((item) => item.shipmentStatus === shipmentStatus);
  return entry ? entry.updatedAt : null;
}

function formatPersonName(person) {
  if (!person) return null;
  return `${person.firstName} ${person.lastName}`.trim();
}

function renderTracking(data) {
  renderHeader(data);
  renderTimeline(data);
  renderDetails(data);
}

function renderHeader(data) {
  document.getElementById("trackingNumber").textContent = data.trackingNumber;

  const meta = STATUS_META[data.status];

  document.getElementById("trackingTimeline").dataset.status = data.status;
  document.getElementById("statusIcon").className = `bi ${meta.icon}`;
  document.getElementById("statusLabel").textContent = meta.label;
}

function renderTimeline(data) {
  const currentIndex = STATUS_ORDER.indexOf(data.status);

  document.querySelectorAll("#timelineContainer .step-container").forEach((li) => {
    const step = li.dataset.step;
    const stepIndex = STATUS_ORDER.indexOf(step);
    const stepData = data.timeline.find((item) => item.step === step);

    li.classList.remove("completed", "present");
    li.removeAttribute("aria-current");

    // Si la orden se canceló, no marcamos ningún paso futuro como
    // completado/actual más allá de donde se quedó.
    if (stepIndex < currentIndex) {
      li.classList.add("completed");
    } else if (stepIndex === currentIndex) {
      li.classList.add("present");
      li.setAttribute("aria-current", "step");
    }

    const dateEl = li.querySelector(".step-date");
    dateEl.textContent = stepData && stepData.date
      ? formatDateTime(stepData.date)
      : "Pendiente";
  });
}

function renderDetails(data) {
  document.getElementById("detailEstimatedDate").textContent =
    data.estimatedDelivery ? formatDateTime(data.estimatedDelivery) : "Por definir";

  document.getElementById("detailOrigin").textContent = data.origin || "—";
  document.getElementById("detailDestination").textContent = data.destination || "—";
  document.getElementById("detailSender").textContent = data.sender || "—";
  document.getElementById("detailRecipient").textContent = data.recipient || "—";
  document.getElementById("detailWeight").textContent = formatWeight(data.weightKg);
  document.getElementById("detailCost").textContent = formatCurrency(data.totalCost);

  toggleRow("detailReceivedByRow", data.status === "entregado" && !!data.receivedBy, () => {
    document.getElementById("detailReceivedBy").textContent = data.receivedBy;
  });

  toggleRow("detailDriverRow", !!data.driver, () => {
    document.getElementById("detailDriver").textContent = data.driver;
  });
}

function toggleRow(rowId, shouldShow, fillContent) {
  const row = document.getElementById(rowId);
  row.classList.toggle("is-hidden", !shouldShow);
  if (shouldShow) fillContent();
}

function formatWeight(weightKg) {
  if (weightKg === null || weightKg === undefined) return "—";
  return `${weightKg} kg`;
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDateTime(isoString) {
  const date = new Date(isoString);

  const formatted = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);

  // "24 oct 2026, 14:30" -> "24 Oct 2026, 14:30hrs"
  return formatted.replace(
    /^(\d{2}) (\w)(\w+)(.*)$/,
    (_, day, firstLetter, restOfMonth, rest) =>
      `${day} ${firstLetter.toUpperCase()}${restOfMonth}${rest}hrs`
  );
}

function showLoading() {
  loadingState.hidden = false;
  notFoundState.hidden = true;
  trackingContent.hidden = true;
}

function showNotFound({ trackingNumber, noNumber }) {
  loadingState.hidden = true;
  trackingContent.hidden = true;
  notFoundState.hidden = false;

  const messageEl = document.getElementById("notFoundMessage");
  const hintEl = document.getElementById("notFoundHint");

  if (noNumber) {
    messageEl.textContent = "No especificaste ningún número de guía para buscar.";
    hintEl.textContent = "Vuelve a la página de rastreo e ingresa tu número de guía.";
  } else {
    messageEl.innerHTML = `No encontramos ningún envío con la guía <strong>${escapeHTML(trackingNumber)}</strong>.`;
    hintEl.textContent = "Verifica el número e inténtalo de nuevo.";
  }
}

function showContent() {
  loadingState.hidden = true;
  notFoundState.hidden = true;
  trackingContent.hidden = false;
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}