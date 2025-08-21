// js/mod-perfil.js
document.addEventListener('DOMContentLoaded', async () => {
  // 1) Verificar sesión y obtener usuario
  let usuario;
  try {
    const resUser = await fetch('https://calendula-backend.onrender.com/api/usuarios/me', {
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

  const inputNombre = document.getElementById('mod-nombre');
  const inputCorreo = document.getElementById('mod-email');
  inputNombre.value  = usuario.nombre;
  inputCorreo.value  = usuario.correo;

  // Guardar cambios
  document.getElementById('form-mod-perfil')
    .addEventListener('submit', async e => {
      e.preventDefault();
      const nuevoNombre = inputNombre.value.trim();
      const nuevoCorreo = inputCorreo.value.trim().toLowerCase();
      if (!nuevoNombre || !nuevoCorreo) {
        return alert('Todos los campos son obligatorios');
      }

      try {
        const res = await fetch('https://calendula-backend.onrender.com/api/usuarios/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ nombre: nuevoNombre, correo: nuevoCorreo })
        });
        const data = await res.json();
        if (!res.ok) {
          return alert(data.error);
        }
        location.href = 'perfil.html';
      } catch {
        alert('Error al conectar con el servidor');
      }
    });

  // Cancelar → perfil
  document.getElementById('cancel-mod-perfil')
    .addEventListener('click', () => {
      location.href = 'perfil.html';
    });
});
