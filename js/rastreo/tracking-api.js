/**
 * tracking-api.js
 * ------------------------------------------------------------------
 * Hace la petición real al backend para consultar una orden de envío
 * por número de guía. Se incluye como <script> normal (sin
 * type="module") en las páginas de rastreo, y expone todo bajo el
 * namespace global `TrackingAPI`.
 *
 * La interfaz pública (`TrackingAPI.fetchTracking(trackingNumber)`)
 * es la misma que tenía la versión simulada, así que rastreo.js y
 * rastreo_detalle.js no necesitan ningún cambio.
 * ------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  // Cuando se despliegue a producción, este es el único valor que
  // hay que cambiar (o convertirlo en variable de entorno/config si
  // el proyecto llega a tener un paso de build).
  const API_BASE_URL = "http://localhost:8080/api/v1";

  /**
   * Consulta la orden asociada a un número de guía.
   * @param {string} trackingNumber
   * @returns {Promise<object|null>} resuelve con el JSON de la orden
   *   tal como lo devuelve el backend, o con `null` si el backend
   *   responde 404 (guía no encontrada — es una respuesta válida,
   *   no un error). Para cualquier otro problema (servidor caído,
   *   error 500, respuesta inesperada, sin conexión) la Promise se
   *   rechaza, para que quien la use pueda distinguir "no existe" de
   *   "algo falló" y mostrar un mensaje distinto en cada caso.
   */
  async function fetchTracking(trackingNumber) {
    const normalized = String(trackingNumber || "").trim().toUpperCase();
    const url = `${API_BASE_URL}/order/rastreo/${encodeURIComponent(normalized)}`;

    let response;
    try {
      response = await fetch(url);
    } catch (networkError) {
      throw new Error(
        `No se pudo conectar con el servidor de rastreo (${networkError.message})`
      );
    }

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`El servidor respondió con un error (${response.status})`);
    }

    return response.json();
  }

  global.TrackingAPI = { fetchTracking };
})(window);