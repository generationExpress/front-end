document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "shipments";
  const ESTADOS = ["Pendiente", "En transito", "Entregado"];

  let shipments = [];
  let indiceActivo = null; // índice del envío abierto actualmente en el modal

  const panelLista = document.querySelector(".panel__lista");
  const listaGrid = document.querySelector(".lista-grid");
  const finalizadosTitulo = document.querySelector(".finalizados__titulo");

  const progresoTexto = document.querySelector(".progreso__texto span:first-child");
  const progresoPendiente = document.querySelector(".progreso__pendiente");
  const progresoBarraFill = document.querySelector(".progreso__barra-fill");
  const progresoEstado = document.querySelector(".progreso__estado");

  const modalCliente = document.querySelector(".modal-reparto__cliente");
  const modalTag = document.querySelector(".modal-reparto__tag-camino");
  const modalHora = document.querySelector(".modal-reparto__hora");
  const modalCalle = document.querySelector(".modal-reparto__calle");
  const modalCiudad = document.querySelector(".modal-reparto__ciudad");
  const modalAlerta = document.querySelector(".modal-reparto__alerta");
  const modalFilas = document.querySelectorAll(".modal-reparto__fila strong");
  const btnConfirmar = document.querySelector(".modal-reparto__btn-confirmar");

  function cargarShipments() {
    shipments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function guardarShipments() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  }

  function getIconoEstado(status) {
    switch (status) {
      case "Pendiente": return "hourglass_empty";
      case "En transito": return "local_shipping";
      case "Entregado": return "check_circle";
      default: return "schedule";
    }
  }

  function crearTarjetaHTML(order, index) {
    return `
      <div class="tarjeta" data-index="${index}">
        <div class="tarjeta__body">
          <h3 class="tarjeta__cliente">${order.recipient.name}</h3>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="material-symbols-outlined">${getIconoEstado(order.order.status)}</span> ${order.order.status}</span>
            <span><span class="material-symbols-outlined">package</span> ${order.order.weight} kg</span>
          </div>
          <div class="tarjeta__alerta">
            <span class="material-symbols-outlined">warning</span>
            ${order.order.notes || "Sin notas"}
          </div>
          <div class="tarjeta__botones">
            <button class="tarjeta__btn-ir" data-bs-toggle="modal" data-bs-target="#modal-detalle" data-index="${index}">
              <span class="material-symbols-outlined">navigation</span> Navegar
            </button>
            <button class="tarjeta__btn-tel">
              <span class="material-symbols-outlined">call</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function crearTarjetaEntregadaHTML(order, index) {
    return `
      <div class="tarjeta" data-index="${index}">
        <div class="tarjeta__body">
          <h3 class="tarjeta__cliente">${order.recipient.name}</h3>
          <p class="tarjeta__direccion">
            <span class="material-symbols-outlined">location_on</span> ${order.recipient.address}, ${order.recipient.city}
          </p>
          <div class="tarjeta__datos">
            <span><span class="material-symbols-outlined">check_circle</span> ${order.order.status}</span>
            <span><span class="material-symbols-outlined">package</span> ${order.order.weight} kg</span>
          </div>
        </div>
      </div>
    `;
  }


  function renderTarjetas() {
    const activos = shipments.filter((s) => s.order.status !== "Entregado");

    if (panelLista) {
      panelLista.innerHTML = activos.length
        ? activos.map((s) => crearTarjetaHTML(s, shipments.indexOf(s))).join("")
        : "<p class='text-center text-muted p-3'>No hay entregas pendientes 🎉</p>";
    }

    const entregados = shipments.filter((s) => s.order.status === "Entregado");

    if (listaGrid) {
      listaGrid.innerHTML = entregados.length
        ? entregados.map((s) => crearTarjetaEntregadaHTML(s, shipments.indexOf(s))).join("")
        : "<p>Todavía no hay entregas completadas.</p>";
    }

    actualizarProgreso();
    asignarEventosTarjetas();
  }

  function actualizarProgreso() {
    const total = shipments.length;
    const entregados = shipments.filter((s) => s.order.status === "Entregado").length;
    const pendientes = total - entregados;
    const porcentaje = total > 0 ? Math.round((entregados / total) * 100) : 0;

    if (progresoTexto) progresoTexto.textContent = `${porcentaje}% completado`;
    if (progresoPendiente) progresoPendiente.textContent = `${pendientes} pendientes`;
    if (progresoBarraFill) progresoBarraFill.style.width = `${porcentaje}%`;
    if (progresoEstado) progresoEstado.textContent = `${entregados}/${total} entregados`;
    if (finalizadosTitulo) finalizadosTitulo.textContent = `COMPLETADAS (${entregados})`;
  }

  function asignarEventosTarjetas() {
    document.querySelectorAll(".tarjeta__btn-ir").forEach((btn) => {
      btn.addEventListener("click", () => {
        indiceActivo = Number(btn.dataset.index);
        mostrarDetalleEnModal(indiceActivo);
      });
    });
  }

  function mostrarDetalleEnModal(index) {
    const order = shipments[index];
    if (!order) return;

    if (modalCliente) modalCliente.textContent = order.recipient.name;
    if (modalTag) modalTag.textContent = order.order.status;
    if (modalHora) {
      modalHora.innerHTML = `<span class="material-symbols-outlined">schedule</span> ${new Date(
        order.createdAt
      ).toLocaleString()}`;
    }
    if (modalCalle) modalCalle.textContent = order.recipient.address;
    if (modalCiudad) modalCiudad.textContent = order.recipient.city;
    if (modalAlerta) {
      modalAlerta.innerHTML = `<span class="material-symbols-outlined">warning</span> ${
        order.order.notes || "Sin notas"
      }`;
    }

    if (modalFilas.length >= 3) {
      modalFilas[0].textContent = `${order.order.weight} kg`;
      modalFilas[1].textContent = order.recipient.phone;
      modalFilas[2].textContent = order.order.vehicle;
    }

    actualizarBotonConfirmar(order.order.status);
  }

  function actualizarBotonConfirmar(status) {
    if (!btnConfirmar) return;

    if (status === "Entregado") {
      btnConfirmar.disabled = true;
      btnConfirmar.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Entregado`;
    } else {
      btnConfirmar.disabled = false;
      const siguiente = ESTADOS[ESTADOS.indexOf(status) + 1];
      btnConfirmar.innerHTML = `<span class="material-symbols-outlined">check_circle</span> Marcar como "${siguiente}"`;
    }
  }

  function avanzarEstado() {
    if (indiceActivo === null) return;

    const order = shipments[indiceActivo];
    const actual = ESTADOS.indexOf(order.order.status);

    if (actual < ESTADOS.length - 1) {
      order.order.status = ESTADOS[actual + 1];
      guardarShipments();
      renderTarjetas();
      mostrarDetalleEnModal(indiceActivo);
    }
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", avanzarEstado);
  }

  
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      cargarShipments();
      renderTarjetas();
    }
  });

  
  let ultimoSnapshot = localStorage.getItem(STORAGE_KEY);

  setInterval(() => {
    const actual = localStorage.getItem(STORAGE_KEY);
    if (actual !== ultimoSnapshot) {
      ultimoSnapshot = actual;
      cargarShipments();
      renderTarjetas();
    }
  }, 1500); 

  cargarShipments();
  renderTarjetas();
});