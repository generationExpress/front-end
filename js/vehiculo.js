document.addEventListener("DOMContentLoaded", () => {
  const btnGrid = document.getElementById("btn-grid");
  const btnList = document.getElementById("btn-list");
  const container = document.getElementById("vehicles-container");

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
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("vehicle-form");
  const btnSave = document.getElementById("btn-vehicle-save");
  const modalElement = document.getElementById("vehicle-modal");

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

    bootstrap.Modal.getInstance(modalElement).hide();

    form.reset();

    form.classList.remove("was-validated");
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    form.reset();

    form.classList.remove("was-validated");
  });
});
