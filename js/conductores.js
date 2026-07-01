document.addEventListener("DOMContentLoaded", () => {
  const filterBtns = document.querySelectorAll(".filter-tabs .btn");
  const cards = document.querySelectorAll("#drivers-grid .driver-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const status = card.dataset.status;
        if (filter === "todos" || status === filter) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Search logic
  const searchInput = document.querySelector('input[placeholder*="Buscar"]');
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query) ? "" : "none";
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("driver-form");
  const btnSave = document.getElementById("btn-driver-save");
  const modalElement = document.getElementById("driver-modal");

  btnSave.addEventListener("click", () => {
    const isValid = form.checkValidity();

    form.classList.add("was-validated");

    if (!isValid) return;

    const driver = {
      name: document.getElementById("driver-name").value,
      license: document.getElementById("driver-license").value,
      phone: document.getElementById("driver-phone").value,
      email: document.getElementById("driver-email").value,
      assignedVehicle: document.getElementById("assigned-vehicle").value,
      status: document.getElementById("driver-status").value,
    };

    console.log("Driver:", driver);

    bootstrap.Modal.getInstance(modalElement).hide();

    form.reset();
    form.classList.remove("was-validated");
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
  });
});
