async function loadComponent(elementId, filePath) {
  const placeholder = document.getElementById(elementId);
  if (!placeholder) return;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${filePath}: ${response.status}`);
    }

    const html = await response.text();
    placeholder.innerHTML = html;
  } catch (error) {
    console.error(`Error al cargar ${filePath}:`, error);
  }
}

async function setActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('#navbar-placeholder .nav-link');

  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    const linkFile = href.split('/').pop();
    if (linkFile === currentPath) {
      link.classList.add('active');
    }
  });
}

(async function initComponents() {
  await Promise.all([
    loadComponent('navbar-placeholder', '/components/navbar.html'),
    loadComponent('footer-placeholder', '/components/footer.html')
  ]);

  setActiveNavLink();
})();
