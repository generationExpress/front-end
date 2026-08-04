/**
 * tracking-api.js
 * ------------------------------------------------------------------
 * Simula la petición al backend para consultar una orden de envío.
 * Se incluye como <script> normal (sin type="module") en ambas
 * páginas y expone todo bajo el namespace global `TrackingAPI`.
 *
 * Cuando exista el endpoint real (algo como
 * GET /api/orders/tracking/{trackingNumber}), lo único que hay que
 * reemplazar es el cuerpo de `fetchTracking`: en vez de buscar en
 * MOCK_DATABASE, hacer el fetch de verdad y devolver `response.json()`
 * (o `null` si el backend responde 404). La forma en que
 * rastreo.js y rastreo_detalle.js consumen la función —una Promise
 * que resuelve con el JSON de la orden o con `null`— no cambia.
 * ------------------------------------------------------------------
 */
(function (global) {
  "use strict";

  const SIMULATED_DELAY_MS = 900;

  // "Base de datos" de prueba, con la misma forma que devuelve el
  // backend real. Agrega/edita órdenes aquí para probar los
  // distintos estados mientras no exista la conexión real.
  const MOCK_DATABASE = {

    // ASSIGNED + un registro IN_TRANSIT en el historial -> en tránsito
    "TRK-2026-0002": {
      "id": "048f30aa-7f8a-46a0-9fac-c7b9d1b03ac0",
      "trackingNumber": "TRK-2026-0002",
      "weightKg": 25.50,
      "status": "ASSIGNED",
      "requestDate": "2026-08-01T18:55:00.647",
      "assignedDate": null,
      "estimatedDeliveryDate": "2026-08-10T10:00:00.000-05:00",
      "totalCost": 85000.00,
      "driver": {
        "id": "20aebb9a-ceca-4ede-87ef-ddca9cefbd62",
        "license": "A2",
        "available": true,
        "user": {
          "id": "d3839e54-5477-494f-97bb-2dd21ee1b6c4",
          "firstName": "Rigoberto",
          "lastName": "Miranda",
          "email": "rigoberto.miranda@example.com",
          "role": "ADMIN",
          "createdAt": "2026-07-31T11:20:28.602-05:00"
        }
      },
      "sender": {
        "id": "460cc3cc-48a5-416a-8aac-a733e2f19609",
        "firstName": "Juan",
        "lastName": "Perez",
        "documentNumber": "1234567890",
        "email": "juan.perez@gmail.com",
        "phone": "3001234567",
        "address": "Calle 10 # 20-30",
        "city": "Medellin",
        "shippingPersonType": "SENDER"
      },
      "recipient": {
        "id": "9a1e056d-f426-4dbe-b12c-99edc1ed695e",
        "firstName": "Maria",
        "lastName": "Gomez",
        "documentNumber": "9876543210",
        "email": "maria.gomez@gmail.com",
        "phone": "3019876543",
        "address": "Carrera 50 # 40-20",
        "city": "Bogota",
        "shippingPersonType": "RECIPIENT"
      },
      "statusHistory": [
        {
          "id": "0ed9c4eb-5076-4fd7-bb13-0a62dcded340",
          "shipmentStatus": "IN_TRANSIT",
          "updatedAt": "2026-08-01T23:56:24.097133",
          "observations": "El pedido salió del centro de distribución y está en camino."
        }
      ],
      "route": {
        "id": "bab5fc74-3f1f-48dd-930e-f4e0ea547c17",
        "origin": "Medellín, Antioquia",
        "destination": "Bogotá, Cundinamarca",
        "estimatedTimeMinutes": 480,
        "createdAt": "2026-08-02T15:40:55.662766"
      },
      "delivery": null
    },

    // Recién creada, todavía sin conductor ni ruta -> pendiente
    "TRK-2026-0001": {
      "id": "111f30aa-7f8a-46a0-9fac-c7b9d1b03ac1",
      "trackingNumber": "TRK-2026-0001",
      "weightKg": 4.20,
      "status": "PENDING",
      "requestDate": "2026-08-03T09:10:00.000",
      "assignedDate": null,
      "estimatedDeliveryDate": "2026-08-09T10:00:00.000-05:00",
      "totalCost": 32000.00,
      "driver": null,
      "sender": {
        "id": "222cc3cc-48a5-416a-8aac-a733e2f19610",
        "firstName": "Laura",
        "lastName": "Ramírez",
        "documentNumber": "1029384756",
        "email": "laura.ramirez@gmail.com",
        "phone": "3111234567",
        "address": "Av. Siempre Viva 742",
        "city": "Villavicencio",
        "shippingPersonType": "SENDER"
      },
      "recipient": {
        "id": "333e056d-f426-4dbe-b12c-99edc1ed6960",
        "firstName": "Carlos",
        "lastName": "Torres",
        "documentNumber": "1122334455",
        "email": "carlos.torres@gmail.com",
        "phone": "3129876543",
        "address": "Calle 8 # 12-40",
        "city": "Villavicencio",
        "shippingPersonType": "RECIPIENT"
      },
      "statusHistory": [],
      "route": null,
      "delivery": null
    },

    // Ciclo completo: PENDING -> ASSIGNED -> IN_TRANSIT -> DELIVERED
    "TRK-2026-0003": {
      "id": "222f30aa-7f8a-46a0-9fac-c7b9d1b03ac2",
      "trackingNumber": "TRK-2026-0003",
      "weightKg": 12.80,
      "status": "DELIVERED",
      "requestDate": "2026-07-28T08:00:00.000",
      "assignedDate": "2026-07-28T10:00:00.000",
      "estimatedDeliveryDate": "2026-07-30T18:00:00.000-05:00",
      "totalCost": 54000.00,
      "driver": {
        "id": "30aebb9a-ceca-4ede-87ef-ddca9cefbd63",
        "license": "B1",
        "available": true,
        "user": {
          "id": "e4839e54-5477-494f-97bb-2dd21ee1b6c5",
          "firstName": "Andrés",
          "lastName": "López",
          "email": "andres.lopez@example.com",
          "role": "DRIVER",
          "createdAt": "2026-07-20T11:20:28.602-05:00"
        }
      },
      "sender": {
        "id": "460cc3cc-48a5-416a-8aac-a733e2f19611",
        "firstName": "Sofía",
        "lastName": "Castro",
        "documentNumber": "1234567891",
        "email": "sofia.castro@gmail.com",
        "phone": "3001234568",
        "address": "Calle 45 # 12-10",
        "city": "Cali",
        "shippingPersonType": "SENDER"
      },
      "recipient": {
        "id": "9a1e056d-f426-4dbe-b12c-99edc1ed6961",
        "firstName": "Pedro",
        "lastName": "Ríos",
        "documentNumber": "9876543211",
        "email": "pedro.rios@gmail.com",
        "phone": "3019876544",
        "address": "Carrera 20 # 30-15",
        "city": "Cartagena",
        "shippingPersonType": "RECIPIENT"
      },
      "statusHistory": [
        {
          "id": "1ed9c4eb-5076-4fd7-bb13-0a62dcded341",
          "shipmentStatus": "ASSIGNED",
          "updatedAt": "2026-07-28T10:00:00.000",
          "observations": "Se asignó un conductor a la orden."
        },
        {
          "id": "2ed9c4eb-5076-4fd7-bb13-0a62dcded342",
          "shipmentStatus": "IN_TRANSIT",
          "updatedAt": "2026-07-28T15:30:00.000",
          "observations": "El pedido salió del centro de distribución y está en camino."
        },
        {
          "id": "3ed9c4eb-5076-4fd7-bb13-0a62dcded343",
          "shipmentStatus": "DELIVERED",
          "updatedAt": "2026-07-30T17:45:00.000",
          "observations": "Entrega confirmada por el destinatario."
        }
      ],
      "route": {
        "id": "cab5fc74-3f1f-48dd-930e-f4e0ea547c18",
        "origin": "Cali, Valle del Cauca",
        "destination": "Cartagena, Bolívar",
        "estimatedTimeMinutes": 600,
        "createdAt": "2026-07-28T09:00:00.000"
      },
      "delivery": {
        "id": "delv-0001-4ede-87ef-ddca9cefbd64",
        "deliveredAt": "2026-07-30T17:45:00.000",
        "receiverName": "Pedro Ríos",
        "deliveryPhoto": null
      }
    }
  };

  /**
   * Simula una petición de red para obtener los datos de una orden.
   * @param {string} trackingNumber
   * @returns {Promise<object|null>} resuelve con el JSON de la orden
   *   tal como lo devuelve el backend, o con `null` si la guía no
   *   existe. No usa `reject`: "no encontrado" es una respuesta
   *   válida del servidor (equivalente a un 404), no un error de
   *   red, así que quien la use no necesita un try/catch aparte
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