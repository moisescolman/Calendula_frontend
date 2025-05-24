// js/modificar-turno.js

document.addEventListener('DOMContentLoaded', () => {
  const usr       = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const key       = `turnos_${usr.email}`;
  const params    = new URLSearchParams(location.search);
  const idTurno   = Number(params.get('id'));
  let turnos      = JSON.parse(localStorage.getItem(key) || '[]');
  const turno     = turnos.find(t => t.id === idTurno);
  if (!turno) return alert('Turno no encontrado');

  // Campos
  const form    = document.getElementById('form-modificar-turno');
  const tTitulo = document.getElementById('titulo-turno');
  const tAbre   = document.getElementById('abreviatura-turno');
  const radios  = form.elements['tipo-turno'];
  const tInicio = document.getElementById('inicio-turno');
  const tFin    = document.getElementById('fin-turno');
  const todo    = document.getElementById('todo-dia');
  const btnF    = document.getElementById('boton-color-fondo');
  const palF    = document.getElementById('paleta-fondo');
  const selF    = btnF.querySelector('.selected-color');
  const btnT    = document.getElementById('boton-color-texto');
  const palT    = document.getElementById('paleta-texto');
  const selT    = btnT.querySelector('.selected-color');
  const preview = document.getElementById('preview-sq');

  // Precarga de valores
  tTitulo.value       = turno.nombre;
  tAbre.value         = turno.abre;
  preview.textContent = turno.abre;
  selF.style.backgroundColor = turno.colorF;
  preview.style.backgroundColor = turno.colorF;
  selT.style.backgroundColor = turno.colorT;
  preview.style.color = turno.colorT;
  Array.from(radios).find(r => r.value === turno.tipo).checked = true;
  tInicio.value = turno.inicio;
  tFin.value    = turno.fin;
  todo.checked  = turno.todoDia;
  if (turno.todoDia) tInicio.disabled = tFin.disabled = true;

  // Paleta
  const palette = [ /* mismos 55 colores */ ];
  function poblar(palDiv, selSpan, updPrev) {
    palette.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.backgroundColor = c;
      sw.addEventListener('click', () => {
        selSpan.style.backgroundColor = c;
        palDiv.classList.add('hidden');
        if (updPrev) preview.style.backgroundColor = c;
        else preview.style.color = c;
      });
      palDiv.append(sw);
    });
  }
  poblar(palF, selF, true);
  poblar(palT, selT, false);
  btnF.addEventListener('click', () => palF.classList.toggle('hidden'));
  btnT.addEventListener('click', () => palT.classList.toggle('hidden'));

  // Interacciones
  tAbre.addEventListener('input', () => {
    preview.textContent = tAbre.value.trim().substring(0,3);
  });
  todo.addEventListener('change', () => {
    const is = todo.checked;
    tInicio.disabled = tFin.disabled = is;
  });

  // Cancelar → Turnos
  document.getElementById('cancelar-modificacion')
    .addEventListener('click', () => location.href = 'turnos.html');

  // Eliminar → Turnos
  document.getElementById('btn-eliminar-turno')
    .addEventListener('click', () => {
      if (confirm(`¿Eliminar turno "${turno.nombre}"?`)) {
        turnos = turnos.filter(t => t.id !== turno.id);
        localStorage.setItem(key, JSON.stringify(turnos));
        location.href = 'turnos.html';
      }
    });

  // Guardar cambios
  form.addEventListener('submit', e => {
    e.preventDefault();
    const sinHoras = !tInicio.value && !tFin.value;
    const isTodo   = todo.checked || sinHoras;
    turno.nombre  = tTitulo.value.trim();
    turno.abre    = tAbre.value.trim();
    turno.tipo    = form.elements['tipo-turno'].value;
    turno.inicio  = isTodo ? '00:00' : tInicio.value;
    turno.fin     = isTodo ? '23:59' : tFin.value;
    turno.todoDia = isTodo;
    turno.colorF  = selF.style.backgroundColor;
    turno.colorT  = selT.style.backgroundColor;
    localStorage.setItem(key, JSON.stringify(turnos));
    location.href = 'turnos.html';
  });
});
