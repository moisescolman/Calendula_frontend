document.addEventListener('DOMContentLoaded', async () => {
  // 1) Verificar sesión
  try {
    const resUser = await fetch('http://127.0.0.1:50001/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resUser.ok) {
      return window.location.href = 'login.html';
    }
  } catch {
    return window.location.href = 'login.html';
  }

  const passActual  = document.getElementById('actual-pass');
  const passNueva   = document.getElementById('nueva-pass');
  const passConfirm = document.getElementById('confirm-pass');

  document.getElementById('form-mod-contrasena')
    .addEventListener('submit', async e => {
      e.preventDefault();
      if (!passActual.value || !passNueva.value) {
        return alert('Todos los campos son obligatorios');
      }
      if (passNueva.value !== passConfirm.value) {
        return alert('La nueva contraseña y la confirmación no coinciden');
      }

      // Llamada al backend para cambiar contraseña
      try {
        const res = await fetch('http://127.0.0.1:50001/api/usuarios/me/contrasena', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            actual: passActual.value,
            nueva: passNueva.value
          })
        });
        const data = await res.json();
        if (!res.ok) {
          return alert(data.error);
        }
        alert('Contraseña cambiada con éxito');
        location.href = 'perfil.html';
      } catch {
        alert('Error al conectar con el servidor');
      }
    });

  document.getElementById('cancel-mod-contrasena')
    .addEventListener('click', () => {
      location.href = 'perfil.html';
    });
});
