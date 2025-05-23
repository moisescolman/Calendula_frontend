// js/registro.js
document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('form-registro');
  const mensajeError = document.getElementById('error-registro');

  formulario.addEventListener('submit', e => {
    e.preventDefault();
    const nombre     = document.getElementById('nombre').value.trim();
    const correo     = document.getElementById('correo').value.trim().toLowerCase();
    const contrasena = document.getElementById('contrasena').value;

    // Recupera lista de usuarios de localStorage o crea nueva
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verifica si el correo ya existe
    if (usuarios.some(u => u.correo === correo)) {
      mensajeError.classList.remove('oculta');
      return;
    }

    // Añade nuevo usuario y guarda
    usuarios.push({ nombre, correo, contrasena });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Redirige al login tras registro exitoso
    window.location.href = 'login.html';
  });
});
