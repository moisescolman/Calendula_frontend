document.addEventListener('DOMContentLoaded', () => {
  // Detecta si estamos dentro de /pages/
  const enPages = location.pathname.includes('/pages/');
  // Para construir rutas relativas
  const base = enPages ? '' : 'pages/';

  const form = document.getElementById('form-login');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email = form['login-email'].value.trim().toLowerCase();
    const pass  = form['login-pass'].value;
    if (!email || !pass) {
      return alert('Debes ingresar correo y contraseña');
    }

    try {
      const res = await fetch('https://calendula-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ correo: email, contrasena: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.error);
      }
      localStorage.setItem('usuarioActual', JSON.stringify(data));
      window.location.href = `${base}calendario.html`;
    } catch {
      alert('Error al conectar con el servidor');
    }
  });
});
