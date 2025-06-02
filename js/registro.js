// js/registro.js
document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.getElementById('form-registro');
  const mensajeError = document.getElementById('error-registro');

  formulario.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre     = document.getElementById('nombre').value.trim();
    const correo     = document.getElementById('correo').value.trim().toLowerCase();
    const contrasena = document.getElementById('contrasena').value;

    if (!nombre || !correo || !contrasena) {
      mensajeError.textContent = 'Todos los campos son obligatorios.';
      mensajeError.classList.remove('oculta');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:50001/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nombre, correo, contrasena })
      });
      const data = await res.json();
      if (!res.ok) {
        mensajeError.textContent = data.error || 'Error al registrar usuario.';
        mensajeError.classList.remove('oculta');
        return;
      }
      // Registro exitoso → ir a login
      window.location.href = 'login.html';
    } catch {
      mensajeError.textContent = 'Error al conectar con el servidor.';
      mensajeError.classList.remove('oculta');
    }
  });
});
