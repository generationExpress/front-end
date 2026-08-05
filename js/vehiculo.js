document.addEventListener("DOMContentLoaded", () => {
  const btnGrid = document.getElementById("btn-grid");
  const btnList = document.getElementById("btn-list");
  const container = document.getElementById("vehicles-container");

  if (btnGrid && btnList && container) {
    btnGrid.addEventListener("click", () => {
      container.classList.remove("view-list");
      container.classList.add("view-grid");
      btnGrid.classList.add("active");
      btnList.classList.remove("active");
    });

    btnList.addEventListener("click", () => {
      container.classList.remove("view-grid");
      container.classList.add("view-list");
      btnList.classList.add("active");
      btnGrid.classList.remove("active");
    });
  }

  // Filtering logic
  const searchInput = document.querySelector('input[placeholder*="Buscar"]');
  const statusSelect = document.querySelector('.card-body select');
  const vehicleCards = document.querySelectorAll('#vehicles-container .vehicle-item');

  function filterVehicles() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = statusSelect ? statusSelect.value.toLowerCase() : 'todos';

    vehicleCards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const cardStatus = (card.dataset.status || '').toLowerCase();

      const matchesSearch = !query || text.includes(query);
      const matchesStatus =
        selectedStatus === 'todos' ||
        cardStatus.includes(selectedStatus) ||
        text.includes(selectedStatus);

      if (matchesSearch && matchesStatus) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterVehicles);
  }
  if (statusSelect) {
    statusSelect.addEventListener('change', filterVehicles);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vehicle-form");
  const btnSave = document.getElementById("btn-vehicle-save");
  const modalElement = document.getElementById("vehicle-modal");

  if (btnSave && form && modalElement) {
    btnSave.addEventListener("click", () => {
      const isValid = form.checkValidity();
      form.classList.add("was-validated");

      if (!isValid) {
        return;
      }

      const vehicle = {
        licensePlate: document.getElementById("license-plate").value,
        model: document.getElementById("vehicle-model").value,
        capacity: document.getElementById("vehicle-capacity").value,
        mileage: document.getElementById("vehicle-mileage").value,
        fuelType: document.getElementById("fuel-type").value,
        maintenanceStatus: document.getElementById("maintenance-status").value,
      };

      console.log("Vehicle:", vehicle);

      if (window.bootstrap) {
        bootstrap.Modal.getInstance(modalElement).hide();
      }

      form.reset();
      form.classList.remove("was-validated");
    });

    modalElement.addEventListener("hidden.bs.modal", () => {
      form.reset();
      form.classList.remove("was-validated");
    });
  }
});
