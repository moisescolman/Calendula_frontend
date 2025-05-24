// js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
  if (!usuario) return;

  // Rellenar datos
  document.getElementById('perfil-nombre').textContent = usuario.nombre;
  document.getElementById('perfil-correo').textContent = usuario.correo;

  // Botones
  document.getElementById('btn-mod-perfil')
    .addEventListener('click', () => {
      location.href = 'mod-perfil.html';
    });

  document.getElementById('btn-mod-contrasena')
    .addEventListener('click', () => {
      location.href = 'mod-contrasena.html';
    });

  // Modal eliminar cuenta
  const modal    = document.getElementById('modal-eliminar');
  const btnAbrir = document.getElementById('btn-eliminar-cuenta');
  const btnCerrar= document.getElementById('cancel-eliminar');
  const btnOk    = document.getElementById('confirm-eliminar');

  btnAbrir.addEventListener('click', () => {
    modal.classList.remove('oculta');
  });
  btnCerrar.addEventListener('click', () => {
    modal.classList.add('oculta');
  });
  btnOk.addEventListener('click', () => {
    // Eliminar usuario
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios = usuarios.filter(u => u.correo !== usuario.correo);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    localStorage.removeItem('usuarioActual');
    location.href = '../index.html';
  });
});
