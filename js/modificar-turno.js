// js/modificar-turno.js
import {
  getUsuarioActual,
  getTurnos,
  guardarTurnos
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Usuario y recuperación de lista de turnos
  const usuario = getUsuarioActual();
  if (!usuario) return location.href = 'login.html';
  let turnos = getTurnos(usuario);

  // 2) Extraer id de la URL (string)
  const params  = new URLSearchParams(location.search);
  const idTurno = params.get('id');       // <<< string

  // 3) Buscar convirtiendo t.id a string para que coincida
  const turno   = turnos.find(t => String(t.id) === idTurno);

  if (!turno) {
    // No se encontró → vuelta a lista
    return location.href = 'turnos.html';
  }

  // 4) Referencias al DOM
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

  // 5) Cargar datos en el formulario
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

  // 6) Paleta de colores (55 muestras)
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

  // 7) Reactividad del preview
  inputAbr.addEventListener('input', () => {
    preview.textContent = inputAbr.value.trim().substring(0,3) || '';
  });
  chkTodo.addEventListener('change', () => {
    const des = chkTodo.checked;
    inputIni.disabled = inputFin.disabled = des;
  });

  // 8) Cancelar → vuelve a lista
  btnCancel.addEventListener('click', () => location.href = 'turnos.html');

  // 9) Eliminar → filtra y guarda
  btnEliminar.addEventListener('click', () => {
    if (confirm(`¿Eliminar "${turno.nombre}"?`)) {
      turnos = turnos.filter(t => String(t.id) !== idTurno);
      guardarTurnos(usuario, turnos);
      location.href = 'turnos.html';
    }
  });

  // 10) Guardar → actualiza el objeto y salva
  form.addEventListener('submit', e => {
    e.preventDefault();
    turno.nombre  = inputTit.value.trim();
    turno.abre    = inputAbr.value.trim();
    turno.tipo    = form.elements['tipo-turno'].value;
    turno.todoDia = chkTodo.checked;
    turno.inicio  = chkTodo.checked ? null : inputIni.value;
    turno.fin     = chkTodo.checked ? null : inputFin.value;
    turno.colorF  = selFondo.style.background;
    turno.colorT  = selTexto.style.background;
    guardarTurnos(usuario, turnos);
    location.href = 'turnos.html';
  });
});
