// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const enPages = location.pathname.includes('/pages/');
  const base    = enPages ? '' : 'pages/';

  // Asegura usuario demo
  let usuarios = JSON.parse(localStorage.getItem('usuarios') || 'null');
  if (!usuarios) {
    usuarios = [{ nombre: 'Demo', correo: 'demo@demo.com', contrasena: 'demo123' }];
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  // Usuario actual
  const usuario = JSON.parse(localStorage.getItem('usuarioActual') || 'null');

  // Nombre del fichero actual
  const pagina   = location.pathname.split('/').pop();
  // Páginas públicas dentro de /pages/
  const publicas = ['login.html', 'registro.html', 'contacto.html'];

  // Si estamos en /pages/, no es pública y no hay usuario → redirige a login
  if (enPages && !publicas.includes(pagina) && !usuario) {
    return location.href = `${base}login.html`;
  }

  // Referencias al DOM
  const accionesNav      = document.getElementById('acciones-nav');
  const usuarioNav       = document.getElementById('usuario-nav');
  const nombreSpan       = document.getElementById('user-name');
  const btnEntrar        = document.getElementById('btn-entrar');
  const btnEntrarMovil   = document.getElementById('btn-entrar-movil');
  const linkReg          = document.getElementById('link-registrarse');
  const toggleMenu       = document.getElementById('user-menu');
  const dropdownMenu     = document.getElementById('dropdown-menu');
  const logoutBtn        = document.getElementById('logout');

  // Lista de secciones privadas a ocultar en no-login
  const seccionesPrivadas = ['Calendario', 'Turnos', 'Estadísticas'];

  function ocultarPrivadas() {
    // Escritorio
    document.querySelectorAll('.lista-navegacion li a.enlace-nav')
      .forEach(a => {
        if (seccionesPrivadas.includes(a.textContent.trim())) {
          a.parentElement.style.display = 'none';
        }
      });
    // Móvil
    document.querySelectorAll('.nav-movil ul li a.enlace-nav')
      .forEach(a => {
        if (seccionesPrivadas.includes(a.textContent.trim())) {
          a.parentElement.style.display = 'none';
        }
      });
  }

  // Mostrar/ocultar bloques según sesión
  if (usuario) {
    accionesNav?.classList.add('oculta');
    usuarioNav?.classList.remove('oculta');
    nombreSpan.textContent = usuario.nombre.split(' ')[0]; // sólo primer nombre
  } else {
    accionesNav?.classList.remove('oculta');
    usuarioNav?.classList.add('oculta');
    ocultarPrivadas();
  }

  // “Entrar” / “Registrarse”
  btnEntrar?.addEventListener('click',      () => location.href = `${base}login.html`);
  btnEntrarMovil?.addEventListener('click', () => location.href = `${base}login.html`);
  linkReg?.addEventListener('click',        () => location.href = `${base}registro.html`);

  // Toggle dropdown de usuario
  toggleMenu?.addEventListener('click', () => {
    dropdownMenu.classList.toggle('oculta');
  });

  // Logout
  logoutBtn?.addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('usuarioActual');
    location.href = enPages ? '../index.html' : './index.html';
  });
});
