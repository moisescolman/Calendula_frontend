// js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('form-inicio-sesion');
  const errorMensaje = document.getElementById('error-mensaje');

  formulario.addEventListener('submit', e => {
    e.preventDefault();
    const correo    = document.getElementById('correo').value.trim().toLowerCase();
    const contrasena= document.getElementById('contrasena').value;

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario  = usuarios.find(u => u.correo === correo && u.contrasena === contrasena);

    if (usuario) {
      // Guarda el usuario actual y redirige a calendario
      localStorage.setItem('usuarioActual', JSON.stringify(usuario));
      window.location.href = 'calendario.html';
    } else {
      errorMensaje.classList.remove('oculta');
    }
  });
});
