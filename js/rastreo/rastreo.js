const trackingInput = document.getElementById("tracking-input");
const btn = document.getElementById("tracking-button");
const form = document.querySelector("#tracking-form");
const errorMessage = document.getElementById("tracking-error");

const BUTTON_DEFAULT_TEXT = btn.textContent;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const trackingNumber = trackingInput.value.trim();

  if (!validateTrackingNumber(trackingNumber)) {
    showError("Ingresa un número de guía para poder rastrear tu envío.");
    return;
  }

  hideError();
  setLoading(true);

  try {
    const data = await TrackingAPI.fetchTracking(trackingNumber);

    if (!data) {
      showError("No encontramos ningún envío con esa guía. Verifica el número e intenta de nuevo.");
      return;
    }

    // Guardamos la respuesta para que rastreo_detalle.js no tenga
    // que volver a pedirla al backend apenas cargue la página.
    sessionStorage.setItem(
      `tracking:${data.trackingNumber}`,
      JSON.stringify(data)
    );

    navigateTo(data.trackingNumber);

  } catch (error) {
    // Error real de red/servidor, distinto de "guía no encontrada".
    console.error("Error al consultar el rastreo:", error);
    showError("Ocurrió un problema al consultar tu envío. Intenta de nuevo en unos segundos.");

  } finally {
    setLoading(false);
  }
});

// Al volver a escribir, quitamos el mensaje de error para no dejarlo
// pegado mientras el usuario corrige el número.
trackingInput.addEventListener("input", hideError);

function validateTrackingNumber(trackingNumber) {
  return trackingNumber.length > 0;
}

function navigateTo(trackingNumber) {
  // rastreo.html y rastreo_detalle.html viven en la misma carpeta
  // (ambos usan "../assets" y "../js" como base), así que el link
  // es relativo al mismo directorio, sin "../pages/".
  const url = new URL("rastreo_detalle.html", window.location.href);
  url.searchParams.set("guia", trackingNumber);
  window.location.href = url.toString();
}

function setLoading(isLoading) {
  btn.disabled = isLoading;
  trackingInput.disabled = isLoading;
  btn.textContent = isLoading ? "Buscando..." : BUTTON_DEFAULT_TEXT;
}

function showError(message) {
  trackingInput.setAttribute("aria-invalid", "true");
  trackingInput.classList.add("is-invalid");
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  trackingInput.removeAttribute("aria-invalid");
  trackingInput.classList.remove("is-invalid");
  errorMessage.hidden = true;
}