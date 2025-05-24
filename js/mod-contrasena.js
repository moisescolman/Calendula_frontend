// js/mod-contrasena.js
document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuario) return;

  const passActual  = document.getElementById('actual-pass');
  const passNueva   = document.getElementById('nueva-pass');
  const passConfirm = document.getElementById('confirm-pass');

  document.getElementById('form-mod-contrasena')
    .addEventListener('submit', e => {
      e.preventDefault();
      if (passActual.value !== usuario.contrasena) {
        return alert('La contraseña actual no coincide');
      }
      if (passNueva.value !== passConfirm.value) {
        return alert('La nueva contraseña y la confirmación no coinciden');
      }

      // Actualiza en localStorage
      let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      usuarios = usuarios.map(u => {
        if (u.correo === usuario.correo) {
          return { ...u, contrasena: passNueva.value };
        }
        return u;
      });
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Actualiza sesión
      localStorage.setItem('usuarioActual',
        JSON.stringify({ ...usuario, contrasena: passNueva.value })
      );
      alert('Contraseña cambiada con éxito');
      location.href = 'perfil.html';
    });

  document.getElementById('cancel-mod-contrasena')
    .addEventListener('click', () => {
      location.href = 'perfil.html';
    });
});
