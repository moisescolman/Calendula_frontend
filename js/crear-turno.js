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

  // 2) Obtener lista de turnos desde el backend (no la almacenamos localmente)
  let turnos = [];
  try {
    const resTurnos = await fetch('https://calendula-backend.onrender.com/api/turnos', {
      method: 'GET',
      credentials: 'include'
    });
    turnos = await resTurnos.json();
  } catch {
    alert('Error al cargar turnos');
    return;
  }

  // 3) Referencias al DOM
  const form         = document.getElementById('form-crear-turno');
  const inputTitulo  = document.getElementById('titulo-turno');
  const inputAbr     = document.getElementById('abreviatura-turno');
  const radiosTipo   = document.getElementsByName('tipo-turno');
  const inputInicio  = document.getElementById('inicio-turno');
  const inputFin     = document.getElementById('fin-turno');
  const chkTodoDia   = document.getElementById('todo-dia');
  const btnCancel    = document.getElementById('cancelar-crear');
  const preview      = document.getElementById('preview-sq');
  const btnFondo     = document.getElementById('boton-color-fondo');
  const palFondo     = document.getElementById('paleta-fondo');
  const selFondo     = btnFondo.querySelector('.selected-color');
  const btnTexto     = document.getElementById('boton-color-texto');
  const palTexto     = document.getElementById('paleta-texto');
  const selTexto     = btnTexto.querySelector('.selected-color');

  // 4) Estado inicial de colores y preview
  let colorFondo = '#ffffff';
  let colorTexto = getComputedStyle(document.documentElement)
                     .getPropertyValue('--texto-oscuro').trim();

  preview.style.background = colorFondo;
  preview.style.color      = colorTexto;
  preview.textContent      = '?';

  // 5) Actualizar preview
  function actualizarPreview() {
    const letra = inputAbr.value.trim().substring(0,3) || 'A';
    preview.textContent      = letra;
    preview.style.background = colorFondo;
    preview.style.color      = colorTexto;
  }

  // 6) Paleta de colores (55)
  const COLORES = [
    '#E57373','#F06292','#BA68C8','#9575CD','#7986CB',
    '#64B5F6','#4FC3F7','#4DD0E1','#4DB6AC','#81C784',
    '#AED581','#FFD54F','#FFB74D','#A1887F','#E0E0E0',
    '#90A4AE','#F44336','#E91E63','#9C27B0','#3F51B5',
    '#2196F3','#03A9F4','#00BCD4','#009688','#4CAF50',
    '#8BC34A','#CDDC39','#FFEB3B','#FFC107','#FF9800',
    '#FF5722','#795548','#9E9E9E','#607D8B','#D32F2F',
    '#C2185B','#7B1FA2','#512DA8','#303F9F','#1976D2',
    '#0288D1','#0097A7','#00796B','#388E3C','#689F38',
    '#AFB42B','#FBC02D','#FFA000','#F57C00','#E64A19',
    '#5D4037','#616161','#455A64','#212121','#0D47A1'
  ];

  function poblarPaleta(contenedor, span, setter) {
    COLORES.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = c;
      sw.addEventListener('click', () => {
        setter(c);
        span.style.background = c;
        contenedor.classList.add('hidden');
        actualizarPreview();
      });
      contenedor.appendChild(sw);
    });
  }
  poblarPaleta(palFondo, selFondo, c => colorFondo = c);
  poblarPaleta(palTexto, selTexto, c => colorTexto = c);

  // 7) Toggle paletas
  btnFondo.addEventListener('click', () => palFondo.classList.toggle('hidden'));
  btnTexto.addEventListener('click', () => palTexto.classList.toggle('hidden'));

  // 8) Reactividad al cambiar abreviatura / todo día
  inputAbr.addEventListener('input', actualizarPreview);
  chkTodoDia.addEventListener('change', () => {
    const des = chkTodoDia.checked;
    inputInicio.disabled = inputFin.disabled = des;
    actualizarPreview();
  });

  // 9) Cancelar → history.back()
  btnCancel.addEventListener('click', () => history.back());

  // 10) Guardar → llamar a API y redirigir
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const titulo = inputTitulo.value.trim();
    const abre   = inputAbr.value.trim();
    const tipo   = Array.from(radiosTipo).find(r => r.checked)?.value;
    const todo   = chkTodoDia.checked || (!inputInicio.value && !inputFin.value);
    const inicio = todo ? null : inputInicio.value;
    const fin    = todo ? null : inputFin.value;

    if (!titulo || !abre || !tipo) {
      return alert('Datos de turno inválidos');
    }

    // Llamada al backend para crear el turno
    try {
      const res = await fetch('https://calendula-backend.onrender.com/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre: titulo,
          abre: abre,
          tipo: tipo,
          todoDia: todo,
          inicio: inicio,
          fin: fin,
          colorF: colorFondo,
          colorT: colorTexto
        })
      });
      const nuevoTurno = await res.json();
      if (!res.ok) {
        return alert(nuevoTurno.error || 'Error al crear turno');
      }
      // Redirigir a la página de listado de turnos
      location.href = 'turnos.html';
    } catch {
      alert('Error al conectar con el servidor');
    }
  });
});
