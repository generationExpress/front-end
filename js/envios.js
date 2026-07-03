document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("shipping-form");
  const btnSave = document.getElementById("btn-save-shipping");
  const modal = document.getElementById("form-shipping");
  const STORAGE_KEY = "shipments";

  btnSave.addEventListener("click", saveShipping);


  modal.addEventListener("hidden.bs.modal", resetForm);


  function saveShipping() {

    const isValid = form.checkValidity();
    form.classList.add("was-validated");

    if (!isValid) {
      return;
    }

    const shipment = getFormData();

    saveLocalStorage(shipment);

    // simplemente mostramos el objeto.
    // Más adelante aquí se enviará por HTTP.
    console.log("Nuevo envío:", shipment);

    // Cerramos el modal utilizando Bootstrap
    bootstrap.Modal.getInstance(modal).hide();
  }


  function getFormData() {

    return {

      createdAt: new Date().toISOString(),

      sender: {
        name: document.getElementById("sender-name").value.trim(),
        phone: document.getElementById("sender-phone").value.trim(),
        email: document.getElementById("sender-email").value.trim(),
        address: document.getElementById("sender-address").value.trim(),
        city: document.getElementById("sender-city").value.trim(),
      },
      recipient: {
        name: document.getElementById("recipient-name").value.trim(),
        phone: document.getElementById("recipient-phone").value.trim(),
        email: document.getElementById("recipient-email").value.trim(),
        address: document.getElementById("recipient-address").value.trim(),
        city: document.getElementById("recipient-city").value.trim(),
      },

      order: {
        status: document.getElementById("shipping-status").value,
        priority: document.getElementById("shipping-priority").value,
        vehicle: document.getElementById("assigned-vehicle").value,
        weight: Number(document.getElementById("package-weight").value),
        notes: document.getElementById("shipping-notes").value.trim(),
      },
    };
  }

  function saveLocalStorage(shipment) {
    const shipments = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    shipments.push(shipment);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  }

  function resetForm() {
    form.reset();

    // Eliminar los estilos de validación para que
    // al abrir nuevamente el modal aparezca limpio.
    form.classList.remove("was-validated");
  }
});
