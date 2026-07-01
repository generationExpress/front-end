document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    initNavbar();
});

/**
 * Renderiza el navbar
 */
function renderNavbar() {
    const navbarContainer = document.getElementById("navbar-container");
    if (!navbarContainer) return;

    navbarContainer.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-white shadow-sm px-3 mb-4 rounded-3 d-flex align-items-center">
            <button class="btn btn-light border-0 me-3 shadow-none" id="sidebar-toggle-btn">
                <i class="bi bi-list fs-4"></i>
            </button>
            <span class="fw-bold fs-5 text-dark mb-0">Express</span>
            
            <div class="ms-auto d-flex align-items-center">
                <button class="btn btn-light border-0 me-2 position-relative shadow-none">
                    <i class="bi bi-bell fs-5"></i>
                    <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                        <span class="visually-hidden">Nuevas alertas</span>
                    </span>
                </button>
                <div class="dropdown">
                    <button class="btn btn-light border-0 d-flex align-items-center shadow-none dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-person-circle fs-5 me-2"></i>
                        <span>Administrador</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#">Perfil</a></li>
                        <li><a class="dropdown-item" href="#">Ajustes</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#">Cerrar Sesión</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    `;
}


function initNavbar() {
    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("sidebar-toggle-btn");

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }
}
