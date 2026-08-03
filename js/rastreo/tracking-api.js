/**
 * tracking-api.js
 * ------------------------------------------------------------------
 * Simula la petición al backend para consultar una guía de envío.
 * Se incluye como <script> normal (sin type="module") en ambas
 * páginas y expone todo bajo el namespace global `TrackingAPI`.
 *
 * Cuando exista el backend real, lo único que hay que reemplazar es
 * el cuerpo de `fetchTracking`: en vez de buscar en MOCK_DATABASE,
 * hacer un `fetch('/api/tracking/' + trackingNumber)`. La forma en
 * que rastreo.js y rastreo_detalle.js consumen la función (una
 * Promise que resuelve con los datos o con `null`) no cambia.
 * ------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  const SIMULATED_DELAY_MS = 900;

  // "Base de datos" de prueba. Agrega/edita guías aquí para probar
  // los distintos estados mientras no exista el backend real.
  const MOCK_DATABASE = {
    "TRK-556465464665": {
      trackingNumber: "TRK-556465464665",
      status: "en-transito", // "pendiente" | "en-transito" | "entregado"
      origin: "Bogotá, Colombia",
      destination: "Medellín, Colombia",
      estimatedDelivery: "2026-10-24T14:30:00",
      receivedBy: null,
      timeline: [
        { step: "pendiente", label: "Pedido recibido", date: "2026-10-22T08:15:00" },
        { step: "en-transito", label: "En tránsito", date: "2026-10-23T19:40:00" },
        { step: "entregado", label: "Entregado", date: null }
      ]
    },
    "TRK-985632147": {
      trackingNumber: "TRK-985632147",
      status: "pendiente",
      origin: "Cali, Colombia",
      destination: "Cartagena, Colombia",
      estimatedDelivery: "2026-10-27T12:00:00",
      receivedBy: null,
      timeline: [
        { step: "pendiente", label: "Pedido recibido", date: "2026-10-25T09:00:00" },
        { step: "en-transito", label: "En tránsito", date: null },
        { step: "entregado", label: "Entregado", date: null }
      ]
    },
    "TRK-112233445": {
      trackingNumber: "TRK-112233445",
      status: "entregado",
      origin: "Barranquilla, Colombia",
      destination: "Bucaramanga, Colombia",
      estimatedDelivery: "2026-10-20T16:00:00",
      receivedBy: "Maria Gonzalez",
      timeline: [
        { step: "pendiente", label: "Pedido recibido", date: "2026-10-18T10:20:00" },
        { step: "en-transito", label: "En tránsito", date: "2026-10-19T15:05:00" },
        { step: "entregado", label: "Entregado", date: "2026-10-20T16:00:00" }
      ]
    }
  };

  /**
   * Simula una petición de red para obtener los datos de una guía.
   * @param {string} trackingNumber
   * @returns {Promise<object|null>} resuelve con los datos del envío,
   *   o con `null` si la guía no existe. No usa `reject`: "no
   *   encontrado" es una respuesta válida del servidor, no un error
   *   de red, así que quien la use no necesita un try/catch aparte
   *   para ese caso.
   */
  function fetchTracking(trackingNumber) {
    const normalized = String(trackingNumber || "").trim().toUpperCase();

    return new Promise((resolve) => {
      setTimeout(() => {
        const data = MOCK_DATABASE[normalized] || null;
        resolve(data ? structuredClone(data) : null);
      }, SIMULATED_DELAY_MS);
    });
  }

  global.TrackingAPI = { fetchTracking };
})(window);