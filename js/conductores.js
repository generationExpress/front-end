const STORAGE_KEY = "drivers";

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
    
    const name = document.getElementById("driver-name");
    const phone = document.getElementById("driver-phone");
    const email = document.getElementById("driver-email");
    
    name.setCustomValidity("");
    phone.setCustomValidity("");
    email.setCustomValidity("");

    if (name.value.trim().length < 10) {
      name.setCustomValidity("El nombre debe tener al menos 10 caracteres.");
    }

    if (!/^\d{10}$/.test(phone.value.trim())) {
      phone.setCustomValidity(
        "Ingrese un número de teléfono válido de 10 dígitos.",
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.setCustomValidity("Ingrese un correo electrónico válido.");
    }

    const isValid = form.checkValidity();

    form.classList.add("was-validated");

    if (!isValid) {
      form.reportValidity();
      return;
    }

    const driver = {
      name: document.getElementById("driver-name").value,
      license: document.getElementById("driver-license").value,
      phone: document.getElementById("driver-phone").value,
      email: document.getElementById("driver-email").value,
      assignedVehicle: document.getElementById("assigned-vehicle").value,
      status: document.getElementById("driver-status").value,
    };

    console.log("Driver:", driver);
    saveLocalStorage(driver);

    bootstrap.Modal.getInstance(modalElement).hide();

    form.reset();
    form.classList.remove("was-validated");
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    form.reset();
    form.classList.remove("was-validated");
  });
});

function saveLocalStorage(driver) {
  const drivers = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  drivers.push(driver);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
}

function resetForm() {
  form.reset();

  // Eliminar los estilos de validación para que
  // al abrir nuevamente el modal aparezca limpio.
  form.classList.remove("was-validated");
}
