// js/login.js
document.addEventListener('DOMContentLoaded', () => {
  // Detecta si estamos dentro de /pages/
  const enPages = location.pathname.includes('/pages/');
  // Para construir rutas relativas
  const base = enPages ? '' : 'pages/';

  const form = document.getElementById('form-login');
  form.addEventListener('submit', e => {
    e.preventDefault();

    const email = form['login-email'].value.trim();
    const pass  = form['login-pass'].value;
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    const usr = usuarios.find(u => u.correo === email && u.contrasena === pass);
    if (!usr) {
      return alert('Credenciales incorrectas');
    }

    // Guardamos usuario actual y redirigimos al calendario
    localStorage.setItem('usuarioActual', JSON.stringify(usr));
    window.location.href = `${base}calendario.html`;
  });
});
