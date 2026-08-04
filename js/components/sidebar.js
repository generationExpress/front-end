document.addEventListener("DOMContentLoaded", () => {
    renderSidebar();
});

function renderSidebar() {
    const sidebar = document.getElementById("sidebar");

    sidebar.innerHTML = `
        <div class="logo-details">
    <i class='bx bx-package icon'></i>
    <div class="logo_name">Logistics</div>
  </div>
  <ul class="nav-list">
    <li class="active">
      <a href="./../admin/dashboard.html">
        <i class='bi bi-speedometer2'></i>
        <span class="links_name">Dashboard</span>
      </a>
    </li>
    <li>
      <a href="./../admin/envios.html">
        <i class='bi bi-box-seam'></i>
        <span class="links_name">Envíos</span>
      </a>
    </li>
    <li class="section-title">
        <span class="links_name">OPERACIONES</span>
    </li>
    <li>
      <a href="./../admin/vehiculos.html">
        <i class='bi bi-truck'></i>
        <span class="links_name">Vehículos</span>
      </a>
    </li>
    <li>
      <a href="./../admin/conductores.html">
        <i class='bi bi-person-badge'></i>
        <span class="links_name">Conductores</span>
      </a>
    </li>
    <li>
      <a href="./../admin/rutas.html">
        <i class='bi bi-geo-alt'></i>
        <span class="links_name">Rutas</span>
      </a>
    </li>
    <li>
      <a href="#">
        <i class='bi bi-calendar-event'></i>
        <span class="links_name">Calendario</span>
      </a>
    </li>
  </ul>
    `;
}
