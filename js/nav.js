// js/nav.js
const enPages = location.pathname.includes('/pages/');
const base    = enPages ? '' : 'pages/';

const plantillaNav = `
  <nav class="nav">
    <div class="logo">
      <a href="${enPages ? '../index.html' : './index.html'}">
        <img src="${enPages ? '../img/logo_calendula-02.svg' : 'img/logo_calendula-02.svg'}" alt="Logotipo Calendula">
      </a>
    </div>
    <ul class="lista-navegacion">
      <li><a href="${enPages ? 'calendario.html' : 'pages/calendario.html'}" class="enlace-nav">Calendario</a></li>
      <li><a href="${enPages ? 'turnos.html'     : 'pages/turnos.html'}"     class="enlace-nav">Turnos</a></li>
      <li><a href="${enPages ? 'estadisticas.html': 'pages/estadisticas.html'}"class="enlace-nav">Estadísticas</a></li>
      <li><a href="${enPages ? '../index.html'   : './index.html'}"          class="enlace-nav">Cómo funciona</a></li>
      <li><a href="${enPages ? '../index.html'   : './index.html'}"          class="enlace-nav">Contacto</a></li>
    </ul>
    <ul id="acciones-nav" class="acciones-nav">
      <li>
        <a href="${base}registro.html" id="link-registrarse" class="enlace-nav">
          Registrarse
        </a>
      </li>
      <li>
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
      <li><a href="${enPages ? '../index.html'   : './index.html'}"        class="enlace-nav">Cómo funciona</a></li>
      <li><a href="${enPages ? '../index.html'   : './index.html'}"        class="enlace-nav">Ayuda</a></li>
      <li><a href="${enPages ? '../index.html'   : './index.html'}"        class="enlace-nav">Contacto</a></li>
      <li><a href="${base}registro.html"          class="enlace-nav">Registrarse</a></li>
      <li><button id="btn-entrar-movil" class="boton-entrar-movil">Entrar</button></li>
    </ul>
  </div>
`;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('header.encabezado').innerHTML = plantillaNav;
});
