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

  // Mostrar nombre de usuario
  const usrJSON = localStorage.getItem('usuarioActual');
  if (usrJSON) {
    document.getElementById('nombre-usuario').innerText = JSON.parse(usrJSON).nombre;
  }

  // Arrays de nombres
  const diasSemanaN = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const abrevSemana = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const mesesN      = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // Rellenar mini-resumen
  document.getElementById('dia-semana').innerText   = diasSemanaN[ahora.getDay()];
  document.getElementById('hora-actual').innerText  =
    `${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
  document.getElementById('fecha-actual').innerText =
    `${ahora.getDate()} de ${mesesN[ahora.getMonth()]} ${ahora.getFullYear()}`;

  function actualizarAnio() {
    anioLabel.innerText = currentAnio;
  }

  function crearMes(m, soloUno) {
    const div = document.createElement('div');
    div.className = 'mes';
    div.dataset.mes = m;

    // Cabecera interna con flechas
    const hdr = document.createElement('div');
    hdr.className = 'mes-header';

    const izq = document.createElement('button');
    izq.innerHTML = '‹';
    izq.onclick = () => {
      if (!grid.classList.contains('vista-mes')) return;
      // Si estamos en enero, retrocedemos año
      if (currentMes === 0) {
        currentMes = 11;
        currentAnio--;
      } else {
        currentMes--;
      }
      mostrarMes();
    };

    const h3 = document.createElement('h3');
    h3.textContent = soloUno
      ? `${mesesN[m]} ${currentAnio}`
      : mesesN[m];

    const der = document.createElement('button');
    der.innerHTML = '›';
    der.onclick = () => {
      if (!grid.classList.contains('vista-mes')) return;
      // Si estamos en diciembre, avanzamos año
      if (currentMes === 11) {
        currentMes = 0;
        currentAnio++;
      } else {
        currentMes++;
      }
      mostrarMes();
    };

    hdr.append(izq, h3, der);
    div.appendChild(hdr);

    // Días de la semana
    const ds = document.createElement('div');
    ds.className = 'dias-semana';
    abrevSemana.forEach(d => {
      const s = document.createElement('span');
      s.textContent = d;
      ds.appendChild(s);
    });
    div.appendChild(ds);

    // Fechas
    const fv = document.createElement('div');
    fv.className = 'fechas';
    const primerDiaSemana = new Date(currentAnio, m, 1).getDay();
    const offset = (primerDiaSemana + 6) % 7;
    for (let i = 0; i < offset; i++) {
      fv.appendChild(document.createElement('span'));
    }
    const diasEnMes = new Date(currentAnio, m + 1, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const c = document.createElement('span');
      c.className = 'celda';
      c.textContent = d;
      // Marcamos la fecha actual solo si coinciden mes, día y año
      if (
        m === ahora.getMonth() &&
        d === ahora.getDate() &&
        currentAnio === ahora.getFullYear()
      ) {
        c.classList.add('celda-actual');
      }
      fv.appendChild(c);
    }
    div.appendChild(fv);

    return div;
  }

  function generarAno() {
    grid.innerHTML = '';
    actualizarAnio();
    for (let m = 0; m < 12; m++) {
      const mesElem = crearMes(m, false);
      // ocultar flechas en vista Año
      mesElem.querySelectorAll('.mes-header button')
             .forEach(b => b.style.visibility = 'hidden');
      grid.appendChild(mesElem);
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
    grid.appendChild(crearMes(currentMes, true));
  }

  // Navegar años (en la vista año)
  btnPrevAnio.onclick = () => {
    currentAnio--;
    if (!grid.classList.contains('vista-mes')) generarAno();
  };
  btnNextAnio.onclick = () => {
    currentAnio++;
    if (!grid.classList.contains('vista-mes')) generarAno();
  };

  // Hoy: ir al mes y año actual en Vista Mes
  btnHoy.onclick = () => {
    currentAnio = ahora.getFullYear();
    currentMes  = ahora.getMonth();
    mostrarMes();
    const act = document.querySelector('.celda-actual');
    if (act) act.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Inicial
  mostrarAno();

  // Listeners de Vista Año / Vista Mes
  btnAno.addEventListener('click', mostrarAno);
  btnMes.addEventListener('click', mostrarMes);
});
