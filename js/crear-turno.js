// js/crear-turno.js
import {
  getUsuarioActual,
  getTurnos,
  guardarTurnos
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Obtener usuario y su lista de turnos
  const usuario = getUsuarioActual();
  if (!usuario) return location.href = 'login.html';
  let turnos = getTurnos(usuario);

  // 2) Referencias al DOM
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

  // 3) Estado inicial de colores y preview
  let colorFondo = '#ffffff';
  let colorTexto = getComputedStyle(document.documentElement)
                     .getPropertyValue('--texto-oscuro').trim();

  preview.style.background = colorFondo;
  preview.style.color      = colorTexto;
  preview.textContent      = '?';

  // 4) Actualizar preview
  function actualizarPreview() {
    const letra = inputAbr.value.trim().charAt(0).toUpperCase() || 'A';
    preview.textContent      = letra;
    preview.style.background = colorFondo;
    preview.style.color      = colorTexto;
  }

  // 5) Paleta de colores (55)
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

  // 6) Toggle paletas
  btnFondo.addEventListener('click', () => palFondo.classList.toggle('hidden'));
  btnTexto.addEventListener('click', () => palTexto.classList.toggle('hidden'));

  // 7) Reactividad al cambiar abreviatura / todo día
  inputAbr.addEventListener('input', actualizarPreview);
  chkTodoDia.addEventListener('change', () => {
    const des = chkTodoDia.checked;
    inputInicio.disabled = inputFin.disabled = des;
    actualizarPreview();
  });

  // 8) Cancelar → history.back()
  btnCancel.addEventListener('click', () => history.back());

  // 9) Guardar → montar objeto, persistir y redirigir
  form.addEventListener('submit', e => {
    e.preventDefault();
    const tipo  = Array.from(radiosTipo).find(r => r.checked).value;
    const todo  = chkTodoDia.checked || (!inputInicio.value && !inputFin.value);

    const nuevo = {
      id: Date.now().toString(),
      nombre: inputTitulo.value.trim(),
      abre:   inputAbr.value.trim(),
      tipo:   tipo,
      inicio: todo ? null : inputInicio.value,
      fin:    todo ? null : inputFin.value,
      todoDia:todo,
      colorF: colorFondo,
      colorT: colorTexto
    };

    turnos.push(nuevo);
    guardarTurnos(usuario, turnos);
    location.href = 'turnos.html';
  });
});
