import {
  getUsuarioActual,
  getTurnos,
  guardarTurnos
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUsuarioActual();
  const params = new URLSearchParams(location.search);
  const idTurno = Number(params.get('id'));
  let turnos = getTurnos(usuario);
  const turno = turnos.find(t => t.id === idTurno);
  if (!turno) return alert('Turno no encontrado');

  const form       = document.getElementById('form-modificar-turno');
  const tTitulo    = document.getElementById('titulo-turno');
  const tAbre      = document.getElementById('abreviatura-turno');
  const radios     = form.elements['tipo-turno'];
  const tInicio    = document.getElementById('inicio-turno');
  const tFin       = document.getElementById('fin-turno');
  const todo       = document.getElementById('todo-dia');
  const btnF       = document.getElementById('boton-color-fondo');
  const palF       = document.getElementById('paleta-fondo');
  const selF       = btnF.querySelector('.selected-color');
  const btnT       = document.getElementById('boton-color-texto');
  const palT       = document.getElementById('paleta-texto');
  const selT       = btnT.querySelector('.selected-color');
  const preview    = document.getElementById('preview-sq');
  const btnCan     = document.getElementById('cancelar-modificacion');
  const btnEliminar= document.getElementById('btn-eliminar-turno');

  const noModificables = ['Vacaciones', 'Descanso'];

  // Precargar valores
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

  // Bloquear edición si es no modificable
  const esProtegido = noModificables.includes(turno.nombre);
  tTitulo.disabled = esProtegido;
  tAbre.disabled = esProtegido;
  Array.from(radios).forEach(r => r.disabled = esProtegido);
  tInicio.disabled = esProtegido || turno.todoDia;
  tFin.disabled = esProtegido || turno.todoDia;
  todo.disabled = esProtegido;
  btnF.disabled = esProtegido;
  btnT.disabled = esProtegido;
  btnEliminar.disabled = esProtegido;

  // Paletas
  const palette = [ /* mismos 55 colores */ ];
  function poblar(paleta, seleccion, actualizar) {
    palette.forEach(color => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.backgroundColor = color;
      sw.addEventListener('click', () => {
        seleccion.style.backgroundColor = color;
        paleta.classList.add('hidden');
        if (actualizar) preview.style.backgroundColor = color;
        else preview.style.color = color;
      });
      paleta.append(sw);
    });
  }
  poblar(palF, selF, true);
  poblar(palT, selT, false);
  btnF.addEventListener('click', () => palF.classList.toggle('hidden'));
  btnT.addEventListener('click', () => palT.classList.toggle('hidden'));

  tAbre.addEventListener('input', () => {
    preview.textContent = tAbre.value.trim().substring(0, 3);
  });

  todo.addEventListener('change', () => {
    const desactiva = todo.checked;
    tInicio.disabled = desactiva;
    tFin.disabled = desactiva;
  });

  // Cancelar
  btnCan.addEventListener('click', () => location.href = 'turnos.html');

  // Eliminar
  btnEliminar.addEventListener('click', () => {
    if (confirm(`¿Eliminar el turno "${turno.nombre}"?`)) {
      turnos = turnos.filter(t => t.id !== idTurno);
      guardarTurnos(usuario, turnos);
      location.href = 'turnos.html';
    }
  });

  // Guardar
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (esProtegido) return;

    turno.nombre  = tTitulo.value.trim();
    turno.abre    = tAbre.value.trim();
    turno.tipo    = form.elements['tipo-turno'].value;
    turno.inicio  = todo.checked ? '00:00' : tInicio.value;
    turno.fin     = todo.checked ? '23:59' : tFin.value;
    turno.todoDia = todo.checked;
    turno.colorF  = selF.style.backgroundColor;
    turno.colorT  = selT.style.backgroundColor;

    guardarTurnos(usuario, turnos);
    location.href = 'turnos.html';
  });
});
