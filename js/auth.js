document.addEventListener('DOMContentLoaded', async () => {
  const enPages = location.pathname.includes('/pages/');
  const base    = enPages ? '' : 'pages/';

  // Nombre del fichero actual
  const pagina   = location.pathname.split('/').pop();
  // Páginas públicas dentro de /pages/
  const publicas = ['login.html', 'registro.html', 'contacto.html', 'como-funciona.html'];

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

  // 1) Comprobar sesión llamando al backend
  let usuario;
  try {
    const res = await fetch('http://127.0.0.1:50001/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (res.ok) {
      usuario = await res.json(); 
    }
  } catch {
  
  }

  if (enPages && !publicas.includes(pagina) && !usuario) {
    return location.href = `${base}login.html`;
  }


  if (usuario) {
    accionesNav?.classList.add('oculta');
    usuarioNav?.classList.remove('oculta');
    nombreSpan.textContent = usuario.nombre.split(' ')[0]; 
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

  // Logout: llamar a backend y redirigir
  logoutBtn?.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await fetch('http://127.0.0.1:50001/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // Ignorar errores al cerrar sesión
    }
    location.href = enPages ? '../index.html' : './index.html';
  });
});
