document.addEventListener("DOMContentLoaded", () => {
  const panelLista = document.querySelector(".panel__lista");
  const listaGrid = document.querySelector(".lista-grid");
  const progresoTexto = document.querySelector(".progreso__texto span:first-child");
  const progresoPendiente = document.querySelector(".progreso__pendiente");
  const progresoBarraFill = document.querySelector(".progreso__barra-fill");
  const progresoEstado = document.querySelector(".progreso__estado");
  const finalizadosTitulo = document.querySelector(".finalizados__titulo");

  // Instancias de los modales de Bootstrap
  const modalActualizarEstadoEl = document.getElementById("modal-actualizar-estado");
  const modalEntregarEl = document.getElementById("modal-entregar");
  let modalActualizarEstado;
  let modalEntregar;
  if (modalActualizarEstadoEl) modalActualizarEstado = new bootstrap.Modal(modalActualizarEstadoEl);
  if (modalEntregarEl) modalEntregar = new bootstrap.Modal(modalEntregarEl);

  let shipments = [];

  // API mock response
  const mockApiData = [
    {
        "id": "e1000001-0001-4000-8000-000000000001",
        "trackingNumber": "TRK000001",
        "weightKg": 150.00,
        "status": "ASSIGNED",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
        "totalCost": 120000.00,
        "driver": {
            "id": "a1000001-0001-4000-8000-000000000001",
            "license": "C2",
            "available": true,
            "user": {
                "id": "11111111-1111-4111-8111-111111111111",
                "firstName": "Carlos",
                "lastName": "Gómez",
                "email": "carlos.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Carlos Gómez",
        "sender": {
            "id": "c1000001-0001-4000-8000-000000000001",
            "firstName": "Ana",
            "lastName": "Martínez",
            "documentNumber": "1010101010",
            "email": "ana@gmail.com",
            "phone": "3001234567",
            "address": "Cra 45 #10-20",
            "city": "Medellín",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000006-0006-4000-8000-000000000006",
            "firstName": "Pedro",
            "lastName": "Sánchez",
            "documentNumber": "6060606060",
            "email": "pedro@gmail.com",
            "phone": "3056789012",
            "address": "Calle 80 #25-10",
            "city": "Bogotá",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000001-0001-4000-8000-000000000001",
                "shipmentStatus": "ASSIGNED",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Pedido asignado",
                "order": {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000002-0002-4000-8000-000000000002",
        "trackingNumber": "TRK000002",
        "weightKg": 80.00,
        "status": "IN_TRANSIT",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
        "totalCost": 85000.00,
        "driver": {
            "id": "a1000002-0002-4000-8000-000000000002",
            "license": "C3",
            "available": true,
            "user": {
                "id": "22222222-2222-4222-8222-222222222222",
                "firstName": "Andrés",
                "lastName": "Martínez",
                "email": "andres.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Andrés Martínez",
        "sender": {
            "id": "c1000002-0002-4000-8000-000000000002",
            "firstName": "Lina",
            "lastName": "Rodríguez",
            "documentNumber": "2020202020",
            "email": "lina@gmail.com",
            "phone": "3012345678",
            "address": "Cra 20 #15-40",
            "city": "Cali",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000007-0007-4000-8000-000000000007",
            "firstName": "Jorge",
            "lastName": "Ruiz",
            "documentNumber": "7070707070",
            "email": "jorge@gmail.com",
            "phone": "3067890123",
            "address": "Av 30 #18-15",
            "city": "Barranquilla",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000002-0002-4000-8000-000000000002",
                "shipmentStatus": "IN_TRANSIT",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Pedido en tránsito",
                "order": {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000003-0003-4000-8000-000000000003",
        "trackingNumber": "TRK000003",
        "weightKg": 450.00,
        "status": "PENDING",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
        "totalCost": 230000.00,
        "driver": {
            "id": "a1000003-0003-4000-8000-000000000003",
            "license": "B2",
            "available": true,
            "user": {
                "id": "33333333-3333-4333-8333-333333333333",
                "firstName": "Miguel",
                "lastName": "Rodríguez",
                "email": "miguel.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Miguel Rodríguez",
        "sender": {
            "id": "c1000003-0003-4000-8000-000000000003",
            "firstName": "Diana",
            "lastName": "Moreno",
            "documentNumber": "3030303030",
            "email": "diana@gmail.com",
            "phone": "3023456789",
            "address": "Cra 70 #45-10",
            "city": "Bucaramanga",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000008-0008-4000-8000-000000000008",
            "firstName": "Felipe",
            "lastName": "García",
            "documentNumber": "8080808080",
            "email": "felipe@gmail.com",
            "phone": "3078901234",
            "address": "Calle 12 #5-60",
            "city": "Pereira",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000003-0003-4000-8000-000000000003",
                "shipmentStatus": "PENDING",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Esperando despacho",
                "order": {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000004-0004-4000-8000-000000000004",
        "trackingNumber": "TRK000004",
        "weightKg": 65.00,
        "status": "DELIVERED",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
        "totalCost": 95000.00,
        "driver": {
            "id": "a1000004-0004-4000-8000-000000000004",
            "license": "C1",
            "available": false,
            "user": {
                "id": "44444444-4444-4444-8444-444444444444",
                "firstName": "Juan",
                "lastName": "Pérez",
                "email": "juan.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Juan Pérez",
        "sender": {
            "id": "c1000004-0004-4000-8000-000000000004",
            "firstName": "Paula",
            "lastName": "Navarro",
            "documentNumber": "4040404040",
            "email": "paula@gmail.com",
            "phone": "3034567890",
            "address": "Cra 18 #90-12",
            "city": "Cartagena",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000009-0009-4000-8000-000000000009",
            "firstName": "Óscar",
            "lastName": "Mejía",
            "documentNumber": "9090909090",
            "email": "oscar@gmail.com",
            "phone": "3089012345",
            "address": "Calle 25 #30-40",
            "city": "Manizales",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000004-0004-4000-8000-000000000004",
                "shipmentStatus": "DELIVERED",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Entrega realizada",
                "order": {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": {
            "id": "g1000001-0001-4000-8000-000000000001",
            "deliveredAt": "2026-08-03T22:32:53",
            "receiverName": "Óscar Mejía",
            "deliveryPhoto": "delivery_ord004.jpg",
            "order": {
                "id": "e1000004-0004-4000-8000-000000000004",
                "trackingNumber": "TRK000004",
                "status": "DELIVERED",
                "totalCost": 95000.00,
                "weightKg": 65.00,
                "requestDate": "2026-08-04T03:31:58",
                "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                "driverName": "Juan Pérez"
            }
        }
    },
    {
        "id": "e1000005-0005-4000-8000-000000000005",
        "trackingNumber": "TRK000005",
        "weightKg": 300.00,
        "status": "ASSIGNED",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
        "totalCost": 180000.00,
        "driver": {
            "id": "a1000005-0005-4000-8000-000000000005",
            "license": "C2",
            "available": true,
            "user": {
                "id": "55555555-5555-4555-8555-555555555555",
                "firstName": "Laura",
                "lastName": "García",
                "email": "laura.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Laura García",
        "sender": {
            "id": "c1000005-0005-4000-8000-000000000005",
            "firstName": "Juliana",
            "lastName": "Ortiz",
            "documentNumber": "5050505050",
            "email": "juliana@gmail.com",
            "phone": "3045678901",
            "address": "Cra 9 #40-20",
            "city": "Santa Marta",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000010-0010-4000-8000-000000000010",
            "firstName": "Sergio",
            "lastName": "Jiménez",
            "documentNumber": "1001001001",
            "email": "sergio@gmail.com",
            "phone": "3090123456",
            "address": "Calle 50 #20-90",
            "city": "Ibagué",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000005-0005-4000-8000-000000000005",
                "shipmentStatus": "ASSIGNED",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Pedido asignado",
                "order": {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000006-0006-4000-8000-000000000006",
        "trackingNumber": "TRK000006",
        "weightKg": 40.00,
        "status": "PENDING",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
        "totalCost": 75000.00,
        "driver": {
            "id": "a1000006-0006-4000-8000-000000000006",
            "license": "B3",
            "available": true,
            "user": {
                "id": "66666666-6666-4666-8666-666666666666",
                "firstName": "David",
                "lastName": "López",
                "email": "david.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "David López",
        "sender": {
            "id": "c1000001-0001-4000-8000-000000000001",
            "firstName": "Ana",
            "lastName": "Martínez",
            "documentNumber": "1010101010",
            "email": "ana@gmail.com",
            "phone": "3001234567",
            "address": "Cra 45 #10-20",
            "city": "Medellín",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000007-0007-4000-8000-000000000007",
            "firstName": "Jorge",
            "lastName": "Ruiz",
            "documentNumber": "7070707070",
            "email": "jorge@gmail.com",
            "phone": "3067890123",
            "address": "Av 30 #18-15",
            "city": "Barranquilla",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000006-0006-4000-8000-000000000006",
                "shipmentStatus": "PENDING",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Esperando asignación",
                "order": {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000007-0007-4000-8000-000000000007",
        "trackingNumber": "TRK000007",
        "weightKg": 520.00,
        "status": "IN_TRANSIT",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
        "totalCost": 210000.00,
        "driver": {
            "id": "a1000007-0007-4000-8000-000000000007",
            "license": "C3",
            "available": false,
            "user": {
                "id": "77777777-7777-4777-8777-777777777777",
                "firstName": "Camilo",
                "lastName": "Hernández",
                "email": "camilo.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Camilo Hernández",
        "sender": {
            "id": "c1000002-0002-4000-8000-000000000002",
            "firstName": "Lina",
            "lastName": "Rodríguez",
            "documentNumber": "2020202020",
            "email": "lina@gmail.com",
            "phone": "3012345678",
            "address": "Cra 20 #15-40",
            "city": "Cali",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000008-0008-4000-8000-000000000008",
            "firstName": "Felipe",
            "lastName": "García",
            "documentNumber": "8080808080",
            "email": "felipe@gmail.com",
            "phone": "3078901234",
            "address": "Calle 12 #5-60",
            "city": "Pereira",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000007-0007-4000-8000-000000000007",
                "shipmentStatus": "IN_TRANSIT",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Vehículo en ruta",
                "order": {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000008-0008-4000-8000-000000000008",
        "trackingNumber": "TRK000008",
        "weightKg": 25.00,
        "status": "ASSIGNED",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
        "totalCost": 68000.00,
        "driver": {
            "id": "a1000008-0008-4000-8000-000000000008",
            "license": "C1",
            "available": true,
            "user": {
                "id": "88888888-8888-4888-888888888888",
                "firstName": "Sebastián",
                "lastName": "Torres",
                "email": "sebastian.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Sebastián Torres",
        "sender": {
            "id": "c1000003-0003-4000-8000-000000000003",
            "firstName": "Diana",
            "lastName": "Moreno",
            "documentNumber": "3030303030",
            "email": "diana@gmail.com",
            "phone": "3023456789",
            "address": "Cra 70 #45-10",
            "city": "Bucaramanga",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000009-0009-4000-8000-000000000009",
            "firstName": "Óscar",
            "lastName": "Mejía",
            "documentNumber": "9090909090",
            "email": "oscar@gmail.com",
            "phone": "3089012345",
            "address": "Calle 25 #30-40",
            "city": "Manizales",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000008-0008-4000-8000-000000000008",
                "shipmentStatus": "ASSIGNED",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Conductor asignado",
                "order": {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000009-0009-4000-8000-000000000009",
        "trackingNumber": "TRK000009",
        "weightKg": 650.00,
        "status": "PENDING",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
        "totalCost": 305000.00,
        "driver": {
            "id": "a1000009-0009-4000-8000-000000000009",
            "license": "B2",
            "available": true,
            "user": {
                "id": "99999999-9999-4999-8999-999999999999",
                "firstName": "Daniel",
                "lastName": "Ramírez",
                "email": "daniel.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Daniel Ramírez",
        "sender": {
            "id": "c1000004-0004-4000-8000-000000000004",
            "firstName": "Paula",
            "lastName": "Navarro",
            "documentNumber": "4040404040",
            "email": "paula@gmail.com",
            "phone": "3034567890",
            "address": "Cra 18 #90-12",
            "city": "Cartagena",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000010-0010-4000-8000-000000000010",
            "firstName": "Sergio",
            "lastName": "Jiménez",
            "documentNumber": "1001001001",
            "email": "sergio@gmail.com",
            "phone": "3090123456",
            "address": "Calle 50 #20-90",
            "city": "Ibagué",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [
            {
                "id": "f1000009-0009-4000-8000-000000000009",
                "shipmentStatus": "PENDING",
                "updatedAt": "2026-08-03T22:32:36",
                "observations": "Esperando despacho",
                "order": {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                }
            }
        ],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": null
    },
    {
        "id": "e1000010-0010-4000-8000-000000000010",
        "trackingNumber": "TRK000010",
        "weightKg": 95.00,
        "status": "DELIVERED",
        "requestDate": "2026-08-04T03:31:58",
        "assignedDate": "2026-08-03T22:31:58",
        "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
        "totalCost": 98000.00,
        "driver": {
            "id": "a1000001-0001-4000-8000-000000000001",
            "license": "C2",
            "available": true,
            "user": {
                "id": "11111111-1111-4111-8111-111111111111",
                "firstName": "Carlos",
                "lastName": "Gómez",
                "email": "carlos.driver@gmail.com",
                "role": "DRIVER",
                "createdAt": "2026-08-03T22:23:34.000-05:00"
            }
        },
        "driverName": "Carlos Gómez",
        "sender": {
            "id": "c1000005-0005-4000-8000-000000000005",
            "firstName": "Juliana",
            "lastName": "Ortiz",
            "documentNumber": "5050505050",
            "email": "juliana@gmail.com",
            "phone": "3045678901",
            "address": "Cra 9 #40-20",
            "city": "Santa Marta",
            "shippingPersonType": "SENDER"
        },
        "recipient": {
            "id": "c1000006-0006-4000-8000-000000000006",
            "firstName": "Pedro",
            "lastName": "Sánchez",
            "documentNumber": "6060606060",
            "email": "pedro@gmail.com",
            "phone": "3056789012",
            "address": "Calle 80 #25-10",
            "city": "Bogotá",
            "shippingPersonType": "RECIPIENT"
        },
        "statusHistory": [],
        "route": {
            "id": "d1000001-0001-4000-8000-000000000001",
            "origin": "Medellín",
            "destination": "Bogotá",
            "estimatedTimeMinutes": 480,
            "createdAt": "2026-08-03T22:30:06",
            "orders": [
                {
                    "id": "e1000001-0001-4000-8000-000000000001",
                    "trackingNumber": "TRK000001",
                    "status": "ASSIGNED",
                    "totalCost": 120000.00,
                    "weightKg": 150.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                },
                {
                    "id": "e1000002-0002-4000-8000-000000000002",
                    "trackingNumber": "TRK000002",
                    "status": "IN_TRANSIT",
                    "totalCost": 85000.00,
                    "weightKg": 80.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Andrés Martínez"
                },
                {
                    "id": "e1000003-0003-4000-8000-000000000003",
                    "trackingNumber": "TRK000003",
                    "status": "PENDING",
                    "totalCost": 230000.00,
                    "weightKg": 450.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-06T22:31:58.000-05:00",
                    "driverName": "Miguel Rodríguez"
                },
                {
                    "id": "e1000004-0004-4000-8000-000000000004",
                    "trackingNumber": "TRK000004",
                    "status": "DELIVERED",
                    "totalCost": 95000.00,
                    "weightKg": 65.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Juan Pérez"
                },
                {
                    "id": "e1000005-0005-4000-8000-000000000005",
                    "trackingNumber": "TRK000005",
                    "status": "ASSIGNED",
                    "totalCost": 180000.00,
                    "weightKg": 300.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-08T22:31:58.000-05:00",
                    "driverName": "Laura García"
                },
                {
                    "id": "e1000006-0006-4000-8000-000000000006",
                    "trackingNumber": "TRK000006",
                    "status": "PENDING",
                    "totalCost": 75000.00,
                    "weightKg": 40.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-07T22:31:58.000-05:00",
                    "driverName": "David López"
                },
                {
                    "id": "e1000007-0007-4000-8000-000000000007",
                    "trackingNumber": "TRK000007",
                    "status": "IN_TRANSIT",
                    "totalCost": 210000.00,
                    "weightKg": 520.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Camilo Hernández"
                },
                {
                    "id": "e1000008-0008-4000-8000-000000000008",
                    "trackingNumber": "TRK000008",
                    "status": "ASSIGNED",
                    "totalCost": 68000.00,
                    "weightKg": 25.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-04T22:31:58.000-05:00",
                    "driverName": "Sebastián Torres"
                },
                {
                    "id": "e1000009-0009-4000-8000-000000000009",
                    "trackingNumber": "TRK000009",
                    "status": "PENDING",
                    "totalCost": 305000.00,
                    "weightKg": 650.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-09T22:31:58.000-05:00",
                    "driverName": "Daniel Ramírez"
                },
                {
                    "id": "e1000010-0010-4000-8000-000000000010",
                    "trackingNumber": "TRK000010",
                    "status": "DELIVERED",
                    "totalCost": 98000.00,
                    "weightKg": 95.00,
                    "requestDate": "2026-08-04T03:31:58",
                    "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                    "driverName": "Carlos Gómez"
                }
            ]
        },
        "delivery": {
            "id": "g1000002-0002-4000-8000-000000000002",
            "deliveredAt": "2026-08-03T22:32:53",
            "receiverName": "Pedro Sánchez",
            "deliveryPhoto": "delivery_ord010.jpg",
            "order": {
                "id": "e1000010-0010-4000-8000-000000000010",
                "trackingNumber": "TRK000010",
                "status": "DELIVERED",
                "totalCost": 98000.00,
                "weightKg": 95.00,
                "requestDate": "2026-08-04T03:31:58",
                "estimatedDeliveryDate": "2026-08-05T22:31:58.000-05:00",
                "driverName": "Carlos Gómez"
            }
        }
    }
  ];

  async function fetchShipments() {
    try {
      // Uso real: return await window.ApiService.get('/api/shipments');
      return new Promise((resolve) => setTimeout(() => resolve(mockApiData), 300));
    } catch (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }
  }

  /**
   * Traduce el estado del backend (inglés) a español para la UI.
   */
  function traducirEstado(status) {
    switch (status) {
      case "PENDING": return "Pendiente";
      case "ASSIGNED": return "Asignado";
      case "IN_TRANSIT": return "En tránsito";
      case "DELIVERED": return "Entregado";
      case "CANCELLED": return "Cancelado";
      case "RESCHEDULED": return "Reprogramado";
      default: return status;
    }
  }

  /**
   * Retorna una clase CSS de Bootstrap para colorear el badge según el estado.
   */
  function getColorEstado(status) {
    switch (status) {
      case "PENDING": return "bg-warning text-dark";
      case "ASSIGNED": return "bg-info text-dark";
      case "IN_TRANSIT": return "bg-primary";
      case "DELIVERED": return "bg-success";
      case "CANCELLED": return "bg-danger";
      case "RESCHEDULED": return "bg-secondary";
      default: return "bg-dark";
    }
  }

  /**
   * Crea el HTML de una tarjeta grande para la grilla principal (pedidos entregados).
   * Al estar entregado, ya no muestra botones de acción.
   */
  function crearTarjetaHTML(order) {
    const recipientName = `${order.recipient.firstName} ${order.recipient.lastName}`;
    const formattedPrice = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(order.totalCost);
    const orderDate = new Date(order.estimatedDeliveryDate).toLocaleDateString('es-CO');

    return `
      <div class="tarjeta" data-id="${order.id}">
        <div class="tarjeta__body">
          <div class="d-flex justify-content-between align-items-start">
            <h3 class="tarjeta__cliente">${recipientName}</h3>
            <span class="tarjeta__precio">${formattedPrice}</span>
          </div>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="material-symbols-outlined">calendar_today</span> ${orderDate}</span>
            <span><span class="material-symbols-outlined">package</span> ${order.weightKg} kg</span>
            <span><span class="material-symbols-outlined">confirmation_number</span> ${order.trackingNumber}</span>
          </div>
          <div class="tarjeta__alerta">
            <span class="material-symbols-outlined">info</span>
            Remitente: ${order.sender.firstName} ${order.sender.lastName} - Tel: ${order.sender.phone}
          </div>
          
          <div class="mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span class="badge ${getColorEstado(order.status)}">${traducirEstado(order.status)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Crea el HTML de una tarjeta para el panel lateral (pedidos pendientes).
   * @param {object} order - El pedido.
   * @param {boolean} esPrimera - Si es true, se muestra con el encabezado "Próxima parada".
   */
  function crearTarjetaPanelHTML(order, esPrimera) {
    const recipientName = `${order.recipient.firstName} ${order.recipient.lastName}`;
    const rutaDestino = order.route ? `${order.route.origin} → ${order.route.destination}` : "";

    // Solo la primera tarjeta tiene el encabezado azul de "Próxima parada"
    const headerHTML = esPrimera
      ? `<div class="tarjeta__top-azul">
            <span><span class="material-symbols-outlined">navigation</span> Próxima parada</span>
            <span>${rutaDestino}</span>
         </div>`
      : "";

    return `
      <div class="tarjeta ${esPrimera ? "tarjeta--activa" : ""}" data-id="${order.id}">
        ${headerHTML}
        <div class="tarjeta__body">
          <h3 class="tarjeta__cliente">${recipientName}</h3>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="badge ${getColorEstado(order.status)}">${traducirEstado(order.status)}</span></span>
            <span><span class="material-symbols-outlined">package</span> ${order.weightKg} kg</span>
          </div>
          <div class="tarjeta__alerta">
            <span class="material-symbols-outlined">warning</span>
            ${order.sender.firstName} ${order.sender.lastName} - Tel: ${order.sender.phone}
          </div>
          
          <!-- Botones de Utilidad -->
          <div class="tarjeta__botones">
            <button class="tarjeta__btn-ir" data-bs-toggle="modal" data-bs-target="#modal-detalle">
              <span class="material-symbols-outlined">navigation</span> Navegar
            </button>
            <button class="tarjeta__btn-tel">
              <span class="material-symbols-outlined">call</span>
            </button>
          </div>
          
          <!-- Botones de Acción de Estado -->
          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-sm btn-primary flex-grow-1 btn-actualizar-estado" data-status="${order.status}">
              Actualizar
            </button>
            <button class="btn btn-sm btn-success flex-grow-1 btn-entregar" data-receiver="${recipientName}">
              Entregar
            </button>
            </div>
        </div>
      </div>
    `;
  }

  /**
   * Renderiza las tarjetas separando pendientes y entregados.
   * - Pendientes van en .panel__lista (panel lateral)
   * - Entregados van en .lista-grid (grilla principal derecha)
   */
  function renderTarjetas() {
    const pendientes = shipments.filter(s => s.status !== "DELIVERED");
    const entregados = shipments.filter(s => s.status === "DELIVERED");


    // Renderizar tarjetas entregadas en la grilla principal
    if (listaGrid) {
      listaGrid.innerHTML = entregados.length
        ? entregados.map(s => crearTarjetaHTML(s)).join("")
        : "<p class='text-muted text-center p-3'>No hay entregas completadas todavía.</p>";
    }

    // Renderizar tarjetas pendientes en el panel lateral
    if (panelLista) {
      panelLista.innerHTML = pendientes.length
        ? pendientes.map((s, index) => crearTarjetaPanelHTML(s, index === 0)).join("")
        : "<p class='text-center text-muted p-3'>🎉 ¡Todo entregado!</p>";
    }

    asignarEventosBotones();
    actualizarProgreso();
  }

  /**
   * Asigna los eventos click a los botones de cada tarjeta.
   * - "Actualizar estado" abre el modal con el estado actual preseleccionado.
   * - "Entregar" abre el modal con el nombre del destinatario prellenado.
   */
  function asignarEventosBotones() {
    // Abrir modal de actualizar estado
    document.querySelectorAll('.btn-actualizar-estado').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        const orderId = tarjeta.getAttribute('data-id');
        const currentStatus = btn.getAttribute('data-status');
        
        document.getElementById('estado-order-id').value = orderId;
        document.getElementById('estado-select-modal').value = currentStatus;
        document.getElementById('estado-observaciones').value = "";
        
        modalActualizarEstado.show();
      });
    });

    // Abrir modal de entregar
    document.querySelectorAll('.btn-entregar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta');
        const orderId = tarjeta.getAttribute('data-id');
        const receiverName = btn.getAttribute('data-receiver');
        
        document.getElementById('entregar-order-id').value = orderId;
        document.getElementById('entregar-receptor').value = receiverName;
        document.getElementById('entregar-foto').value = "https://example.com/photos/delivery-001.jpg";
        
        modalEntregar.show();
      });
    });
  }

  /**
   * Inicializa los eventos de los modales (se ejecuta una sola vez).
   */
  function inicializarEventosModales() {
    // Enviar formulario Actualizar Estado
    const btnSubmitEstado = document.getElementById("btn-submit-estado");
    if (btnSubmitEstado) {
      btnSubmitEstado.addEventListener("click", async () => {
        const orderId = document.getElementById('estado-order-id').value;
        const status = document.getElementById('estado-select-modal').value;
        const observations = document.getElementById('estado-observaciones').value;

        const payload = {
          shipmentStatus: status,
          observations: observations,
          orderId: orderId
        };

        console.log("-> Realizando petición POST para actualizar estado:", JSON.stringify(payload, null, 2));

        try {
          // await window.ApiService.post('/api/shipments/status', payload);
          
          alert(`Estado actualizado a ${traducirEstado(status)}\nRevisa la consola para ver el JSON.`);
          modalActualizarEstado.hide();
          
          const shipment = shipments.find(s => s.id === orderId);
          if (shipment) shipment.status = status;
          renderTarjetas();

        } catch (error) {
          console.error("Error actualizando estado:", error);
          alert("Ocurrió un error al actualizar el estado.");
        }
      });
    }

    // Enviar formulario Entregar
    const btnSubmitEntrega = document.getElementById("btn-submit-entrega");
    if (btnSubmitEntrega) {
      btnSubmitEntrega.addEventListener("click", async () => {
        const orderId = document.getElementById('entregar-order-id').value;
        const receiverName = document.getElementById('entregar-receptor').value;
        const deliveryPhoto = document.getElementById('entregar-foto').value;

        const payload = {
          receiverName: receiverName,
          deliveryPhoto: deliveryPhoto,
          orderId: orderId
        };

        console.log("-> Realizando petición POST para procesar entrega:", JSON.stringify(payload, null, 2));

        try {
          // await window.ApiService.post('/api/shipments/deliver', payload);
          
          alert(`Entrega registrada a nombre de ${receiverName}\nRevisa la consola para ver el JSON.`);
          modalEntregar.hide();
          
          const shipment = shipments.find(s => s.id === orderId);
          if (shipment) shipment.status = "DELIVERED";
          renderTarjetas();

        } catch (error) {
          console.error("Error registrando entrega:", error);
          alert("Ocurrió un error al registrar la entrega.");
        }
      });
    }
  }

  /**
   * Actualiza la barra de progreso y contadores del panel lateral.
   */
  function actualizarProgreso() {
    const total = shipments.length;
    const entregados = shipments.filter((s) => s.status === "DELIVERED").length;
    const pendientes = total - entregados;
    const porcentaje = total > 0 ? Math.round((entregados / total) * 100) : 0;

    if (progresoTexto) progresoTexto.textContent = `${porcentaje}% completado`;
    if (progresoPendiente) progresoPendiente.textContent = `${pendientes} pendientes`;
    if (progresoBarraFill) progresoBarraFill.style.width = `${porcentaje}%`;
    if (progresoEstado) progresoEstado.textContent = `${entregados}/${total} entregados`;
  }

  // Inicializar la aplicación
  async function init() {
    inicializarEventosModales();
    shipments = await fetchShipments();
    renderTarjetas();
  }

  init();
});