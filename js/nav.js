document.addEventListener('DOMContentLoaded', async () => {
  const enPages = location.pathname.includes('/pages/');
  const base    = enPages ? '' : 'pages/';
  const header  = document.querySelector('header.encabezado');
  // Determina si el nav debe ir morado (header tiene la clase calendario-encabezado)
  const navMorado = header.classList.contains('calendario-encabezado');

  // Elegir logo según variante
  const logoSrc = navMorado
    ? (enPages ? '../img/logo_calendula-01.svg' : 'img/logo_calendula-01.svg')
    : (enPages ? '../img/logo_calendula-02.svg' : 'img/logo_calendula-02.svg');

  const plantillaNav = `
    <nav class="nav">
      <div class="logo">
        <a href="${enPages ? '../index.html' : './index.html'}">
          <img src="${logoSrc}" alt="Logotipo Calendula">
        </a>
      </div>
      <ul class="lista-navegacion">
        <li><a href="${enPages ? 'calendario.html' : 'pages/calendario.html'}" class="enlace-nav">Calendario</a></li>
        <li><a href="${enPages ? 'turnos.html'     : 'pages/turnos.html'}"     class="enlace-nav">Turnos</a></li>
        <li><a href="${enPages ? 'como-funciona.html' : 'pages/como-funciona.html'}" class="enlace-nav">Cómo funciona</a></li>
        <li><a href="${enPages ? 'contacto.html'   : 'pages/contacto.html'}"   class="enlace-nav">Contacto</a></li>
      </ul>
      <ul id="acciones-nav" class="acciones-nav">
        <li>
          <a href="${base}registro.html" id="link-registrarse" class="enlace-nav">Registrarse</a>
          <button id="btn-entrar" class="boton-entrar">Entrar</button>
        </li>
      </ul>
      <div id="usuario-nav" class="user-dropdown oculta">
        <button id="user-menu" class="user-button">
          <span id="user-name"></span><span class="triangle">▾</span>
        </button>
        <ul id="dropdown-menu" class="dropdown-menu oculta">
          <li><a href="${base}perfil.html">Perfil</a></li>
          <li><a href="#" id="logout">Salir</a></li>
        </ul>
      </div>
      <button class="boton-hamburguesa" aria-label="Menú">
        <span class="linea"></span><span class="linea"></span><span class="linea"></span>
      </button>
    </nav>
    <div class="nav-movil oculta">
      <ul>
        <li><a href="${enPages ? 'calendario.html' : 'pages/calendario.html'}" class="enlace-nav">Calendario</a></li>
        <li><a href="${enPages ? 'turnos.html' : 'pages/turnos.html'}" class="enlace-nav">Turnos</a></li>
        <li><a href="${enPages ? 'como-funciona.html' : 'pages/como-funciona.html'}" class="enlace-nav">Cómo funciona</a></li>
        <li><a href="${enPages ? 'contacto.html' : 'pages/contacto.html'}" class="enlace-nav">Contacto</a></li>
        <li><a href="${base}registro.html" class="enlace-nav">Registrarse</a></li>
        <li><button id="btn-entrar-movil" class="boton-entrar-movil">Entrar</button></li>
      </ul>
    </div>
  `;

  header.innerHTML = plantillaNav;

  // Verificar sesión llamando al backend
  let usuario;
  try {
    const res = await fetch('https://calendula-backend.onrender.com/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      usuario = await res.json();
    }
  } catch {
    // error de conexión: asumimos no autenticado
  }

  // Si hay sesión, ocultar el botón "Entrar" del menú móvil
  if (usuario) {
    const btnEntrarMovilLi = document.querySelector('#btn-entrar-movil')?.closest('li');
    if (btnEntrarMovilLi) btnEntrarMovilLi.remove();
  }

  // Funcionalidad del menú hamburguesa para navegación móvil
  const btnHamburguesa = document.querySelector('.boton-hamburguesa');
  const navMovil       = document.querySelector('.nav-movil');
  if (btnHamburguesa && navMovil) {
    btnHamburguesa.addEventListener('click', () => {
      navMovil.classList.toggle('oculta');
    });
  }

  // Cerrar menú al hacer clic en un enlace dentro del menú móvil
  document.querySelectorAll('.nav-movil .enlace-nav').forEach(link => {
    link.addEventListener('click', () => {
      navMovil.classList.add('oculta');
    });
  });

  // Manejo del botón "Entrar" en navegación móvil
  const btnEntrarMovil = document.querySelector('#btn-entrar-movil');
  if (btnEntrarMovil) {
    btnEntrarMovil.addEventListener('click', () => {
      window.location.href = `${base}login.html`;
    });
  }
});
