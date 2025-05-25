// js/mod-perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuario) return;

  const inputNombre = document.getElementById('mod-nombre');
  const inputCorreo = document.getElementById('mod-email');
  inputNombre.value  = usuario.nombre;
  inputCorreo.value  = usuario.correo;

  // Guardar cambios
  document.getElementById('form-mod-perfil')
    .addEventListener('submit', e => {
      e.preventDefault();
      const nuevoNombre = inputNombre.value.trim();
      const nuevoCorreo = inputCorreo.value.trim();

      let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      usuarios = usuarios.map(u => u.correo === usuario.correo
        ? { ...u, nombre: nuevoNombre, correo: nuevoCorreo }
        : u
      );
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      localStorage.setItem('usuarioActual',
        JSON.stringify({ ...usuario, nombre: nuevoNombre, correo: nuevoCorreo })
      );
      location.href = 'perfil.html';
    });

  // Cancelar → perfil
  document.getElementById('cancel-mod-perfil')
    .addEventListener('click', () => {
      location.href = 'perfil.html';
    });
});
