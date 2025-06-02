// js/perfil.js
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Verificar sesión y obtener usuario del backend
  let usuario;
  try {
    const resUser = await fetch('http://127.0.0.1:50001/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resUser.ok) {
      return window.location.href = 'login.html';
    }
    usuario = await resUser.json(); // { id, nombre, correo }
  } catch {
    return window.location.href = 'login.html';
  }

  // 2) Rellenar datos en la UI
  document.getElementById('perfil-nombre').textContent = usuario.nombre;
  document.getElementById('perfil-correo').textContent = usuario.correo;

  // 3) Botones para modificar perfil y contraseña
  document.getElementById('btn-mod-perfil')
    .addEventListener('click', () => {
      location.href = 'mod-perfil.html';
    });

  document.getElementById('btn-mod-contrasena')
    .addEventListener('click', () => {
      location.href = 'mod-contrasena.html';
    });

  // 4) Modal eliminar cuenta
  const modal     = document.getElementById('modal-eliminar');
  const btnAbrir  = document.getElementById('btn-eliminar-cuenta');
  const btnCerrar = document.getElementById('cancel-eliminar');
  const btnOk     = document.getElementById('confirm-eliminar');

  btnAbrir.addEventListener('click', () => {
    modal.classList.remove('oculta');
  });
  btnCerrar.addEventListener('click', () => {
    modal.classList.add('oculta');
  });
  btnOk.addEventListener('click', async () => {
    // 5) Llamar al backend para eliminar usuario
    try {
      const res = await fetch('http://127.0.0.1:50001/api/usuarios/me', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        return alert(data.error || 'Error al eliminar cuenta');
      }
      // 6) Redirigir al inicio después de eliminar
      window.location.href = '../index.html';
    } catch {
      alert('Error al conectar con el servidor');
    }
  });
});
