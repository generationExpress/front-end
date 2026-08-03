// Orden fijo de los 3 estados posibles. Se usa para decidir qué
// pasos del timeline van "completed" / "present" / sin clase.
const STATUS_ORDER = ["pendiente", "en-transito", "entregado"];

const STATUS_META = {
  "pendiente": { label: "Pendiente", icon: "bi-hourglass-split" },
  "en-transito": { label: "En tránsito", icon: "bi-truck" },
  "entregado": { label: "Entregado", icon: "bi-check-circle" }
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

  const data = await getTrackingData(trackingNumber);

  if (!data) {
    showNotFound({ trackingNumber });
    return;
  }

  renderTracking(data);
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
async function getTrackingData(trackingNumber) {
  const cacheKey = `tracking:${trackingNumber.toUpperCase()}`;
  const cached = sessionStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  const data = await TrackingAPI.fetchTracking(trackingNumber);

  if (data) {
    sessionStorage.setItem(cacheKey, JSON.stringify(data));
  }

  return data;
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

  const receivedByRow = document.getElementById("detailReceivedByRow");
  if (data.status === "entregado" && data.receivedBy) {
    receivedByRow.classList.remove("is-hidden");
    document.getElementById("detailReceivedBy").textContent = data.receivedBy;
  } else {
    receivedByRow.classList.add("is-hidden");
  }
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