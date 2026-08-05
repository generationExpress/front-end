document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shipping-form");
  const btnSave = document.getElementById("btn-save-shipping");
  const modal = document.getElementById("form-shipping");
  const STORAGE_KEY = "shipments";

  const searchInput = document.querySelector('input[placeholder*="Buscar"]');
  const statusSelect = document.querySelector('.card-body select');
  const rows = document.querySelectorAll('table tbody tr');

  function filterTable() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = statusSelect ? statusSelect.value.toLowerCase() : 'todos';

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const rowStatus = (row.dataset.status || '').toLowerCase();

      const matchesSearch = !query || text.includes(query);
      const matchesStatus =
        selectedStatus === 'todos' ||
        selectedStatus === 'todos los estados' ||
        rowStatus.includes(selectedStatus) ||
        text.includes(selectedStatus);

      if (matchesSearch && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterTable);
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', filterTable);
  }

  if (btnSave) {
    btnSave.addEventListener("click", saveShipping);
  }

  if (modal) {
    modal.addEventListener("hidden.bs.modal", resetForm);
  }

  function saveShipping() {
    const isValid = form.checkValidity();
    form.classList.add("was-validated");

    if (!isValid) {
      return;
    }

    const shipment = getFormData();
    saveLocalStorage(shipment);
    console.log("Nuevo envío:", shipment);

    if (modal && window.bootstrap) {
      bootstrap.Modal.getInstance(modal).hide();
    }
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
    form.classList.remove("was-validated");
  }
});
