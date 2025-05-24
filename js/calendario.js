// js/calendario.js
document.addEventListener('DOMContentLoaded', () => {
  const btnAno      = document.getElementById('boton-vista-ano');
  const btnMes      = document.getElementById('boton-vista-mes');
  const btnHoy      = document.getElementById('boton-hoy');
  const btnPrevAnio = document.getElementById('boton-prev-anio');
  const btnNextAnio = document.getElementById('boton-next-anio');
  const yearCtrls   = document.getElementById('controles-anio');
  const grid        = document.getElementById('calendario-grid');
  const anioLabel   = document.getElementById('anio-mostrado');

  const ahora       = new Date();
  let currentMes    = ahora.getMonth();
  let currentAnio   = ahora.getFullYear();

  const abrevSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const mesesN      = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // Mini‐resumen
  document.getElementById('dia-semana').innerText =
    ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][ahora.getDay()];
  document.getElementById('hora-actual').innerText =
    `${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
  document.getElementById('fecha-actual').innerText =
    `${ahora.getDate()} de ${mesesN[ahora.getMonth()]} ${ahora.getFullYear()}`;

  function actualizarAnio() {
    anioLabel.innerText = currentAnio;
  }

  function crearMes(m, soloUno) {
    const div = document.createElement('div');
    div.className = 'mes';

    const hdr = document.createElement('div');
    hdr.className = 'mes-header';

    const izq = document.createElement('button');
    izq.textContent = '‹';
    izq.onclick = () => {
      if (!grid.classList.contains('vista-mes')) return;
      if (currentMes === 0) { currentMes = 11; currentAnio--; }
      else currentMes--;
      mostrarMes();
    };

    const title = document.createElement('h3');
    title.textContent = soloUno
      ? `${mesesN[m]} ${currentAnio}`
      : mesesN[m];

    const der = document.createElement('button');
    der.textContent = '›';
    der.onclick = () => {
      if (!grid.classList.contains('vista-mes')) return;
      if (currentMes === 11) { currentMes = 0; currentAnio++; }
      else currentMes++;
      mostrarMes();
    };

    hdr.append(izq, title, der);
    div.append(hdr);

    // Días de la semana
    const ds = document.createElement('div');
    ds.className = 'dias-semana';
    abrevSemana.forEach(d => {
      const cel = document.createElement('span');
      cel.textContent = d;
      ds.append(cel);
    });
    div.append(ds);

    // Fechas
    const fv = document.createElement('div');
    fv.className = 'fechas';
    const primer = new Date(currentAnio, m, 1).getDay();
    const offset = (primer + 6) % 7;
    for (let i = 0; i < offset; i++) fv.appendChild(document.createElement('span'));

    const diasEnMes = new Date(currentAnio, m + 1, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const cel = document.createElement('span');
      cel.className = 'celda';
      cel.textContent = d;
      if (
        currentAnio === ahora.getFullYear() &&
        m === ahora.getMonth() &&
        d === ahora.getDate()
      ) cel.classList.add('celda-actual');
      fv.append(cel);
    }
    div.append(fv);

    return div;
  }

  function generarAno() {
    grid.innerHTML = '';
    actualizarAnio();
    for (let m = 0; m < 12; m++) {
      const mesElem = crearMes(m, false);
      mesElem.querySelectorAll('.mes-header button')
             .forEach(b => b.style.visibility = 'hidden');
      grid.append(mesElem);
    }
  }

  function mostrarAno() {
    grid.classList.remove('vista-mes');
    btnAno.classList.add('activo');
    btnMes.classList.remove('activo');
    yearCtrls.style.display = 'flex';
    generarAno();
  }

  function mostrarMes() {
    grid.classList.add('vista-mes');
    btnMes.classList.add('activo');
    btnAno.classList.remove('activo');
    yearCtrls.style.display = 'none';
    grid.innerHTML = '';
    grid.append(crearMes(currentMes, true));
  }

  btnPrevAnio.onclick = () => {
    currentAnio--;
    if (!grid.classList.contains('vista-mes')) generarAno();
  };
  btnNextAnio.onclick = () => {
    currentAnio++;
    if (!grid.classList.contains('vista-mes')) generarAno();
  };

  btnHoy.onclick = () => {
    const hoy = new Date();
    currentAnio = hoy.getFullYear();
    currentMes  = hoy.getMonth();
    mostrarMes();
    document.querySelector('.celda-actual')
            ?.scrollIntoView({ behavior:'smooth', block:'center' });
  };

  btnAno.addEventListener('click', mostrarAno);
  btnMes.addEventListener('click', mostrarMes);

  // Inicial
  mostrarAno();
});
