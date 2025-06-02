document.addEventListener('DOMContentLoaded', async () => {
  // 1) Verificar sesión y obtener usuario
  try {
    const resUser = await fetch('http://127.0.0.1:50001/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resUser.ok) {
      return location.href = 'login.html';
    }
  } catch {
    return location.href = 'login.html';
  }

  // 2) Extraer id de la URL (string)
  const params  = new URLSearchParams(location.search);
  const idTurno = params.get('id'); // string

  // 3) Obtener lista de turnos desde el backend
  let turnos = [];
  try {
    const resTurnos = await fetch('http://127.0.0.1:50001/api/turnos', {
      method: 'GET',
      credentials: 'include'
    });
    turnos = await resTurnos.json();
  } catch {
    alert('Error al cargar turnos');
    return location.href = 'turnos.html';
  }

  // 4) Buscar turno en la lista
  const turno = turnos.find(t => String(t.id) === idTurno);
  if (!turno) {
    return location.href = 'turnos.html';
  }

  // 5) Referencias al DOM
  const form        = document.getElementById('form-modificar-turno');
  const inputTit    = document.getElementById('titulo-turno');
  const inputAbr    = document.getElementById('abreviatura-turno');
  const radios      = form.elements['tipo-turno'];
  const inputIni    = document.getElementById('inicio-turno');
  const inputFin    = document.getElementById('fin-turno');
  const chkTodo     = document.getElementById('todo-dia');
  const btnFondo    = document.getElementById('boton-color-fondo');
  const palFondo    = document.getElementById('paleta-fondo');
  const selFondo    = btnFondo.querySelector('.selected-color');
  const btnTexto    = document.getElementById('boton-color-texto');
  const palTexto    = document.getElementById('paleta-texto');
  const selTexto    = btnTexto.querySelector('.selected-color');
  const preview     = document.getElementById('preview-sq');
  const btnCancel   = document.getElementById('cancelar-modificacion');
  const btnEliminar = document.getElementById('btn-eliminar-turno');

  // 6) Cargar datos en el formulario
  inputTit.value    = turno.nombre;
  inputAbr.value    = turno.abre;
  preview.textContent      = turno.abre;
  preview.style.background = turno.colorF;
  preview.style.color      = turno.colorT;
  selFondo.style.background = turno.colorF;
  selTexto.style.background = turno.colorT;

  Array.from(radios)
    .find(r => r.value === turno.tipo)
    .checked = true;

  chkTodo.checked = turno.todoDia;
  inputIni.value  = turno.inicio || '';
  inputFin.value  = turno.fin    || '';
  if (turno.todoDia) inputIni.disabled = inputFin.disabled = true;

  // 7) Paleta de colores (55 muestras)
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

  function poblarPaleta(contenedor, span, aplicaFondo) {
    COLORES.forEach(col => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.background = col;
      sw.addEventListener('click', () => {
        span.style.background = col;
        if (aplicaFondo) preview.style.background = col;
        else            preview.style.color      = col;
        contenedor.classList.add('hidden');
      });
      contenedor.appendChild(sw);
    });
  }

  poblarPaleta(palFondo, selFondo, true);
  poblarPaleta(palTexto, selTexto, false);

  btnFondo.addEventListener('click', () => palFondo.classList.toggle('hidden'));
  btnTexto.addEventListener('click', () => palTexto.classList.toggle('hidden'));

  // 8) Reactividad del preview
  inputAbr.addEventListener('input', () => {
    preview.textContent = inputAbr.value.trim().substring(0,3) || '';
  });
  chkTodo.addEventListener('change', () => {
    const des = chkTodo.checked;
    inputIni.disabled = inputFin.disabled = des;
  });

  // 9) Cancelar → vuelve a lista
  btnCancel.addEventListener('click', () => location.href = 'turnos.html');

  // 10) Eliminar → llamado al backend
  btnEliminar.addEventListener('click', async () => {
    if (!confirm(`¿Eliminar "${turno.nombre}"?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:50001/api/turnos/${idTurno}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json();
        return alert(data.error || 'Error al eliminar turno');
      }
      location.href = 'turnos.html';
    } catch {
      alert('Error al conectar con el servidor');
    }
  });

  // 11) Guardar → actualización vía API
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nombre  = inputTit.value.trim();
    const abre    = inputAbr.value.trim();
    const tipo    = form.elements['tipo-turno'].value;
    const todoDia = chkTodo.checked;
    const inicio  = chkTodo.checked ? null : inputIni.value;
    const fin     = chkTodo.checked ? null : inputFin.value;
    const colorF  = selFondo.style.background;
    const colorT  = selTexto.style.background;

    if (!nombre || !abre || !tipo) {
      return alert('Datos de turno inválidos');
    }

    try {
      const res = await fetch(`http://127.0.0.1:50001/api/turnos/${idTurno}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nombre, abre, tipo, todoDia, inicio, fin, colorF, colorT
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.error || 'Error al actualizar turno');
      }
      location.href = 'turnos.html';
    } catch {
      alert('Error al conectar con el servidor');
    }
  });
});
