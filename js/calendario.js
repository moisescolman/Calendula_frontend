// js/calendario.js
document.addEventListener('DOMContentLoaded', () => {
  const btnAno = document.getElementById('boton-vista-ano');
  const btnMes = document.getElementById('boton-vista-mes');
  const btnHoy = document.getElementById('boton-hoy');
  const grid   = document.getElementById('calendario-grid');

  const ahora   = new Date();
  let currentMes = ahora.getMonth();
  const anioHoy = ahora.getFullYear();

  const usuarioJSON = localStorage.getItem('usuarioActual');
  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    document.getElementById('nombre-usuario').innerText = usuario.nombre;
  }

  const diasSemanaNombres = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const abrevSemana       = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  const mesesNombres       = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  // Resumen fecha/hora
  document.getElementById('dia-semana').innerText   = diasSemanaNombres[ahora.getDay()];
  document.getElementById('hora-actual').innerText  = `${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
  document.getElementById('fecha-actual').innerText = `${ahora.getDate()} de ${mesesNombres[ahora.getMonth()]} ${anioHoy}`;

  // Crear un mes (con flechas si estamos en vista-mes)
  function crearMes(mesIndex, soloUno = false) {
    const divMes = document.createElement('div');
    divMes.className = 'mes';
    divMes.dataset.mes = mesIndex;

    // Cabecera interna
    const header = document.createElement('div');
    header.className = 'mes-header';

    // Flecha izquierda (solo en vista-mes)
    const flechaIzq = document.createElement('button');
    flechaIzq.innerHTML = '&#8249;';
    flechaIzq.addEventListener('click', () => {
      currentMes = (currentMes + 11) % 12;
      mostrarMes();
    });
    // Título
    const titulo = document.createElement('h3');
    titulo.textContent = mesesNombres[mesIndex];
    // Flecha derecha
    const flechaDer = document.createElement('button');
    flechaDer.innerHTML = '&#8250;';
    flechaDer.addEventListener('click', () => {
      currentMes = (currentMes + 1) % 12;
      mostrarMes();
    });

    header.appendChild(flechaIzq);
    header.appendChild(titulo);
    header.appendChild(flechaDer);
    divMes.appendChild(header);

    // Días semana
    const diasSemanaDiv = document.createElement('div');
    diasSemanaDiv.className = 'dias-semana';
    abrevSemana.forEach(d => {
      const span = document.createElement('span');
      span.textContent = d;
      diasSemanaDiv.appendChild(span);
    });
    divMes.appendChild(diasSemanaDiv);

    // Fechas
    const fechasDiv = document.createElement('div');
    fechasDiv.className = 'fechas';
    const primerDia = new Date(anioHoy, mesIndex, 1).getDay();
    const offset = (primerDia + 6) % 7;
    for (let i = 0; i < offset; i++) fechasDiv.appendChild(document.createElement('span'));
    const diasEnMes = new Date(anioHoy, mesIndex+1, 0).getDate();
    for (let d = 1; d <= diasEnMes; d++) {
      const celda = document.createElement('span');
      celda.className = 'celda';
      celda.textContent = d;
      if (mesIndex === ahora.getMonth() && d === ahora.getDate()) {
        celda.classList.add('celda-actual');
      }
      fechasDiv.appendChild(celda);
    }
    divMes.appendChild(fechasDiv);

    return divMes;
  }

  // Generar todos los meses (vista año)
  function generarAno() {
    grid.innerHTML = '';
    for (let m = 0; m < 12; m++) {
      // En vista año, no mostramos flechas:
      const mesElem = crearMes(m);
      // ocultar flechas:
      mesElem.querySelectorAll('.mes-header button').forEach(b => b.style.visibility = 'hidden');
      grid.appendChild(mesElem);
    }
  }

  // Mostrar vista año
  function mostrarAno() {
    grid.classList.remove('vista-mes');
    btnAno.classList.add('activo');
    btnMes.classList.remove('activo');
    generarAno();
  }

  // Mostrar vista mes
  function mostrarMes() {
    grid.classList.add('vista-mes');
    btnMes.classList.add('activo');
    btnAno.classList.remove('activo');
    grid.innerHTML = '';
    grid.appendChild(crearMes(currentMes, true));
  }

  // Inicial
  mostrarAno();

  // Listeners
  btnAno.addEventListener('click', mostrarAno);
  btnMes.addEventListener('click', mostrarMes);
  btnHoy.addEventListener('click', () => {
    currentMes = ahora.getMonth();
    mostrarMes();
    const actual = document.querySelector('.celda-actual');
    if (actual) actual.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
