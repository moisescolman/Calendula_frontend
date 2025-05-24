// js/crear-turno.js

document.addEventListener('DOMContentLoaded', () => {
  const usr = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const key = `turnos_${usr.email}`;

  const form    = document.getElementById('form-crear-turno');
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
  const btnCan  = document.getElementById('cancelar-crear');

  const palette = [
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

  let turnos = JSON.parse(localStorage.getItem(key) || '[]');

  // poblar paletas
  function poblar(palDiv, selSpan, updatePreview) {
    palette.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch';
      sw.style.backgroundColor = c;
      sw.addEventListener('click', () => {
        selSpan.style.backgroundColor = c;
        palDiv.classList.add('hidden');
        if (updatePreview) preview.style.backgroundColor = c;
      });
      palDiv.append(sw);
    });
  }
  poblar(palF, selF, true);
  poblar(palT, selT, false);
  btnF.addEventListener('click', () => palF.classList.toggle('hidden'));
  btnT.addEventListener('click', () => palT.classList.toggle('hidden'));

  // preview abreviatura
  tAbre.addEventListener('input', () => {
    preview.textContent = tAbre.value.trim().substring(0,3);
  });

  // valores por defecto
  selF.style.backgroundColor = '#fff';
  preview.style.backgroundColor = '#fff';
  const rnd = palette[Math.floor(Math.random() * palette.length)];
  selT.style.backgroundColor = rnd;
  preview.style.color = rnd;

  // envío
  form.addEventListener('submit', e => {
    e.preventDefault();
    const sinHoras = !tInicio.value && !tFin.value;
    const isTodo = todo.checked || sinHoras;
    const nuevo = {
      id: Date.now(),
      nombre: tTitulo.value.trim(),
      abre: tAbre.value.trim(),
      tipo: radios.value,
      inicio: isTodo ? '00:00' : tInicio.value,
      fin: isTodo ? '23:59' : tFin.value,
      todoDia: isTodo,
      colorF: selF.style.backgroundColor,
      colorT: selT.style.backgroundColor
    };
    turnos.push(nuevo);
    localStorage.setItem(key, JSON.stringify(turnos));
    location.href = 'turnos.html';
  });

  btnCan.addEventListener('click', () => location.href = 'turnos.html');
});
