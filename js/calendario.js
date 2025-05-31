// js/calendario.js
import {
  getUsuarioActual,
  getTurnos,
  getTurnosMarcados,
  guardarTurnosMarcados
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const usuario      = getUsuarioActual();
  if (!usuario) return;

  // ─── Elementos DOM ─────────────────────────────────────────────────────────
  const grid          = document.getElementById('calendario-grid');
  const headerYear    = document.getElementById('anio-mostrado');
  const btnPrevY      = document.getElementById('anio-previo');
  const btnNextY      = document.getElementById('anio-siguiente');
  const btnYear       = document.getElementById('vista-anio');
  const btnMonth      = document.getElementById('vista-mes');
  const btnHoy        = document.getElementById('boton-hoy');
  const resumenEl     = document.getElementById('resumen-turnos');

  const btnMarcar     = document.getElementById('btn-marcar');
  const btnGuardar    = document.getElementById('btn-guardar-turnos');
  const btnCancelar   = document.getElementById('btn-cancelar-marcar');
  const panel         = document.getElementById('panel-turnos');
  const carrusel      = document.getElementById('contenedor-turnos');
  const txtActivo     = document.getElementById('texto-turno-activo');
  const flechaL       = document.getElementById('flecha-izq');
  const flechaR       = document.getElementById('flecha-der');
  const btnBorrar     = document.getElementById('boton-borrar-turno');
  const btnCrear      = document.getElementById('boton-crear-turno');
  const btnMarcarTodo = document.getElementById('btn-marcar-todo');

  // ─── “Hoy” en zona Madrid ───────────────────────────────────────────────────
  const fechaHoyStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid'
  }).format(new Date());
  const [hoyY, hoyM, hoyD] = fechaHoyStr.split('-').map(Number);

  // ─── Estado interno y carrusel ─────────────────────────────────────────────
  let isDragging           = false;
  const VISIBLE_COUNT      = 5;
  let indexCarr            = 0;

  const turnos      = getTurnos(usuario);
  const marcados    = getTurnosMarcados(usuario);
  let pendientes   = {};
  let turnoActivo  = null;
  let modoMarcar   = false;
  let modoBorrar   = false;

  let year     = hoyY;
  let month    = hoyM - 1;
  let viewMode = 'anio';

  const mesesNom = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];
  const diasSem = ['Lun','Mar','Mié','Jue','Vie','Sab','Dom'];

  // ─── Funciones de render ────────────────────────────────────────────────────
  function clearGrid() { grid.innerHTML = ''; }

  function crearCelda(fecha, dia) {
    const cel = document.createElement('div');
    cel.className = 'celda';
    cel.dataset.fecha = fecha;
    const num = document.createElement('span');
    num.className = 'numero-dia';
    num.textContent = dia;
    cel.appendChild(num);
    return cel;
  }

  function generarMes(año, mes, mostrarNav) {
    const md = document.createElement('div');
    md.className = 'mes';

    const mh = document.createElement('div');
    mh.className = 'mes-header';
    if (mostrarNav) {
      mh.innerHTML = `
        <button class="mes-prev boton-control">‹</button>
        <h3>${mesesNom[mes]} ${año}</h3>
        <button class="mes-next boton-control">›</button>
      `;
    } else {
      mh.innerHTML = `<h3>${mesesNom[mes]} ${año}</h3>`;
    }
    md.appendChild(mh);

    const ds = document.createElement('div');
    ds.className = 'dias-semana';
    diasSem.forEach(d => {
      const sp = document.createElement('div');
      sp.textContent = d;
      ds.appendChild(sp);
    });
    md.appendChild(ds);

    const fd = document.createElement('div');
    fd.className = 'fechas';
    const prim = new Date(año, mes, 1).getDay();
    const off  = (prim + 6) % 7; // ajustar para que Lunes sea 0
    for (let i = 0; i < off; i++) {
      fd.appendChild(document.createElement('div'));
    }
    const dm = new Date(año, mes + 1, 0).getDate();
    for (let d = 1; d <= dm; d++) {
      const fecha = `${año}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      fd.appendChild(crearCelda(fecha, d));
    }
    md.appendChild(fd);

    return md;
  }

  function renderYear() {
    clearGrid();
    grid.className = 'calendario-grid vista-anio';
    for (let m = 0; m < 12; m++) {
      grid.appendChild(generarMes(year, m, false));
    }
    aplicarMarcados();
  }

  function renderMonth() {
    clearGrid();
    grid.className = 'calendario-grid vista-mes';
    const mesDiv = generarMes(year, month, true);
    grid.appendChild(mesDiv);

    // Flechas para navegar meses
    mesDiv.querySelector('.mes-prev').addEventListener('click', () => {
      month--;
      if (month < 0) { month = 11; year--; }
      renderView();
    });
    mesDiv.querySelector('.mes-next').addEventListener('click', () => {
      month++;
      if (month > 11) { month = 0; year++; }
      renderView();
    });

    aplicarMarcados();
  }

  function renderResumen() {
    resumenEl.innerHTML = '';

    // Título
    const h2 = document.createElement('h2');
    h2.textContent = viewMode === 'anio'
      ? `Resumen Año ${year}`
      : `Resumen ${mesesNom[month]} ${year}`;
    resumenEl.appendChild(h2);

    // Calculamos un objeto "efectivo" que combina marcados y pendientes
    const efectivo = {};
    // Primero, copiamos marcados
    Object.entries(marcados).forEach(([f, arr]) => {
      efectivo[f] = arr.slice();
    });
    // Luego, sobrescribimos con pendientes donde existan
    Object.entries(pendientes).forEach(([f, arr]) => {
      efectivo[f] = arr.slice();
    });

    // Listado de turnos
    const lista = document.createElement('div');
    lista.className = 'resumen-lista-turnos';
    const contador = {};
    turnos.forEach(t => contador[t.id] = 0);

    Object.entries(efectivo).forEach(([f, arr]) => {
      const [y, m] = f.split('-').map(Number);
      if (viewMode === 'anio' && y !== year) return;
      if (viewMode === 'mes' && (y !== year || m - 1 !== month)) return;
      arr.forEach(i => {
        if (contador[i.idTurno] != null) contador[i.idTurno]++;
      });
    });

    turnos.forEach(t => {
      const item = document.createElement('div');
      item.className = 'resumen-item';
      const icon = document.createElement('span');
      icon.className = 'icon-turno';
      icon.textContent = t.abre;
      icon.style.background = t.colorF;
      icon.style.color      = t.colorT;
      const txt = document.createElement('span');
      txt.className = 'resumen-texto';
      txt.textContent = `${t.nombre}:`;
      const cnt = document.createElement('span');
      cnt.className = 'resumen-count';
      cnt.textContent = contador[t.id];
      item.append(icon, txt, cnt);
      lista.appendChild(item);
    });
    resumenEl.appendChild(lista);

    // Separador
    const hr = document.createElement('hr');
    hr.className = 'resumen-separador';
    resumenEl.appendChild(hr);

    // Totales
    const tot = document.createElement('div');
    tot.className = 'resumen-totales';
    const idsDesc = turnos.filter(t => t.nombre === 'Descanso').map(t => t.id);
    const idsVac  = turnos.filter(t => t.nombre === 'Vacaciones').map(t => t.id);
    const idsAct  = turnos.filter(t => t.tipo === 'suma').map(t => t.id);
    let dDesc = 0, dVac = 0, dOcu = 0, hOcu = 0;

    Object.entries(efectivo).forEach(([f, arr]) => {
      const [y, m] = f.split('-').map(Number);
      if (viewMode === 'anio' && y !== year) return;
      if (viewMode === 'mes' && (y !== year || m - 1 !== month)) return;
      if (arr.some(i => idsDesc.includes(i.idTurno))) dDesc++;
      if (arr.some(i => idsVac.includes(i.idTurno))) dVac++;
      if (arr.some(i => idsAct.includes(i.idTurno))) dOcu++;
      arr.forEach(i => {
        if (!idsAct.includes(i.idTurno)) return;
        const t = turnos.find(x => x.id === i.idTurno);
        let [h1, m1] = t.inicio.split(':').map(Number);
        let [h2, m2] = t.fin.split(':').map(Number);
        let dur = (h2 + (h2 < h1 ? 24 : 0)) + m2 / 60 - (h1 + m1 / 60);
        hOcu += dur;
      });
    });

    [
      ['Días descanso', dDesc],
      ['Días vacaciones', dVac],
      ['Días ocupados', dOcu],
      ['Total horas ocupadas', Math.round(hOcu * 100) / 100 + ' h']
    ].forEach(([lab, val]) => {
      const item = document.createElement('div');
      item.className = 'resumen-item';
      const a = document.createElement('span'); a.textContent = lab;
      const b = document.createElement('span'); b.textContent = val;
      item.append(a, b);
      tot.appendChild(item);
    });
    resumenEl.appendChild(tot);
  }

  function renderView() {
    headerYear.textContent = year;
    btnYear.classList.toggle('activo', viewMode === 'anio');
    btnMonth.classList.toggle('activo', viewMode === 'mes');
    if (viewMode === 'anio') {
      renderYear();
    } else {
      renderMonth();
    }
    renderResumen();
  }

  // ─── Botones de control ───────────────────────────────────────────────────
  btnYear.addEventListener('click',   () => { viewMode = 'anio'; renderView(); });
  btnMonth.addEventListener('click',  () => { viewMode = 'mes';  renderView(); });
  btnPrevY.addEventListener('click',  () => { year--; renderView(); });
  btnNextY.addEventListener('click',  () => { year++; renderView(); });
  btnHoy.addEventListener('click',    () => {
    year = hoyY; month = hoyM - 1; viewMode = 'mes'; renderView();
  });

  // ─── Marcado y Borrado ──────────────────────────────────────────────────────
  function aplicarMarcados() {
    document.querySelectorAll('.celda[data-fecha]').forEach(cel => {
      cel.querySelectorAll('.etq-turno').forEach(el => el.remove());
      const f = cel.dataset.fecha;
      const arr = pendientes[f] !== undefined
        ? pendientes[f]
        : (marcados[f] || []);

      if (arr.length === 1) {
        const t = turnos.find(x => x.id === arr[0].idTurno);
        const seg = document.createElement('div');
        seg.className = 'etq-turno uno';
        seg.textContent   = t.abre;
        seg.style.background = t.colorF;
        seg.style.color      = t.colorT;
        cel.appendChild(seg);

      } else if (arr.length === 2) {
        arr.forEach((item, i) => {
          const t = turnos.find(x => x.id === item.idTurno);
          const seg = document.createElement('div');
          seg.className = `etq-turno ${i === 0 ? 'arriba' : 'abajo'}`;
          seg.textContent   = t.abre;
          seg.style.background = t.colorF;
          seg.style.color      = t.colorT;
          cel.appendChild(seg);
        });
      }

      if (cel.dataset.fecha === fechaHoyStr) {
        cel.classList.add('celda-actual');
      }
    });
  }

  function manejarCelda(celda) {
    if (!modoMarcar) return;
    const f = celda.dataset.fecha;

    // Tomamos el estado actual de esa fecha (pendientes tiene prioridad)
    let arrOriginal = pendientes[f] !== undefined
      ? pendientes[f].slice()
      : ((marcados[f] || []).slice());

    // Si estamos en modo "borrar", borramos todo
    if (modoBorrar) {
      pendientes[f] = [];
      btnGuardar.disabled = false;
      aplicarMarcados();
      renderResumen(); // ← Actualizar resumen en tiempo real
      return;
    }

    // Si no hay turnoActivo, no hacemos nada
    if (!turnoActivo) return;

    // Identificamos si arrOriginal contiene un turno "todo el día"
    const tieneTodoDia = arrOriginal.some(item => {
      const t = turnos.find(x => x.id === item.idTurno);
      return t && t.todoDia;
    });

    // Nuevo array que construiremos según la lógica
    let nuevoArr = [];

    // Caso 1: Si la celda ya tiene dos turnos distintos OR tiene un turno "todo el día"
    //         OR el turnoActivo es "todo el día", sobrescribimos con turnoActivo solo
    if (
      arrOriginal.length >= 2 ||
      tieneTodoDia ||
      turnoActivo.todoDia
    ) {
      nuevoArr = [{ idTurno: turnoActivo.id }];
    } else {
      // Aquí arrOriginal puede ser 0 o 1
      if (arrOriginal.length === 0) {
        // Si estaba vacía, añadimos turnoActivo
        nuevoArr = [{ idTurno: turnoActivo.id }];
      } else if (arrOriginal.length === 1) {
        // Si tenía exactamente un turno, comprobamos si es distinto y ninguno es "todo el día"
        const turnoExistente = turnos.find(t => t.id === arrOriginal[0].idTurno);
        if (
          turnoExistente &&
          !turnoExistente.todoDia &&
          turnoExistente.id !== turnoActivo.id &&
          !turnoActivo.todoDia
        ) {
          // Combinamos ambos turnos y los ordenamos por hora de inicio
          const duo = [turnoExistente, turnoActivo].sort((a, b) =>
            a.inicio.localeCompare(b.inicio)
          );
          nuevoArr = duo.map(t => ({ idTurno: t.id }));
        } else {
          // O bien es el mismo turno que ya existía, o había "todo el día", o turnoActivo es "todo el día"
          // En cualquiera de esos casos, sobrescribimos con turnoActivo solo
          nuevoArr = [{ idTurno: turnoActivo.id }];
        }
      }
    }

    // Guardamos el resultado en pendientes
    pendientes[f] = nuevoArr;

    // Habilitamos el botón Guardar si hay pendientes
    btnGuardar.disabled = Object.keys(pendientes).length === 0;
    aplicarMarcados();
    renderResumen(); // ← Actualizar resumen en tiempo real
  }

  // ─── Eventos de ratón para marcar/arrastrar ─────────────────────────────────
  grid.addEventListener('mousedown', e => {
    if (!modoMarcar) return;
    const cel = e.target.closest('.celda');
    if (cel) {
      isDragging = true;
      manejarCelda(cel);
    }
  });

  grid.addEventListener('mouseover', e => {
    if (!isDragging) return;
    const cel = e.target.closest('.celda');
    if (cel) manejarCelda(cel);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) isDragging = false;
  });

  // ─── Panel de selección de turnos ────────────────────────────────────────────
  function renderCarrusel() {
    carrusel.innerHTML = '';
    turnos.slice(indexCarr, indexCarr + VISIBLE_COUNT).forEach(t => {
      const d = document.createElement('div');
      d.className = 'cuadro-turno';
      d.textContent = t.abre;
      d.style.background = t.colorF;
      d.style.color      = t.colorT;
      if (turnoActivo && turnoActivo.id === t.id) d.classList.add('seleccionado');
      d.addEventListener('click', () => {
        turnoActivo = t;
        modoBorrar  = false;
        actualizarPanel();
      });
      carrusel.appendChild(d);
    });
  }

  function actualizarPanel() {
    renderCarrusel();
    if (modoBorrar) {
      txtActivo.textContent = 'Modo borrado activo';
      btnMarcarTodo.textContent = 'Borrar todo';
      btnBorrar.classList.add('activo');
    } else if (turnoActivo) {
      txtActivo.textContent = `Seleccionado: ${turnoActivo.nombre}`;
      btnMarcarTodo.textContent = 'Marcar huecos';
      btnBorrar.classList.remove('activo');
    } else {
      txtActivo.textContent = 'Selecciona turno a marcar';
      btnMarcarTodo.textContent = 'Marcar huecos';
      btnBorrar.classList.remove('activo');
    }
  }

  btnMarcar.addEventListener('click', () => {
    indexCarr = 0;
    modoMarcar = true;
    modoBorrar = false;
    turnoActivo = null;
    panel.classList.remove('oculta');
    btnGuardar.classList.remove('oculta');
    btnGuardar.disabled = true;
    btnCancelar.classList.remove('oculta');
    btnMarcar.classList.add('oculta');
    actualizarPanel();
  });

  btnCancelar.addEventListener('click', () => {
    modoMarcar = false;
    modoBorrar = false;
    turnoActivo = null;
    pendientes = {};
    panel.classList.add('oculta');
    btnGuardar.classList.add('oculta');
    btnCancelar.classList.add('oculta');
    btnMarcar.classList.remove('oculta');
    btnMarcarTodo.textContent = 'Marcar huecos';
    btnBorrar.classList.remove('activo');
    renderView();
  });

  btnGuardar.addEventListener('click', () => {
    Object.assign(marcados, pendientes);
    guardarTurnosMarcados(usuario, marcados);
    pendientes = {};
    btnGuardar.disabled = true;
    modoMarcar = false;
    modoBorrar = false;
    turnoActivo = null;
    panel.classList.add('oculta');
    btnGuardar.classList.add('oculta');
    btnCancelar.classList.add('oculta');
    btnMarcar.classList.remove('oculta');
    btnMarcarTodo.textContent = 'Marcar huecos';
    btnBorrar.classList.remove('activo');
    renderView();
  });

  // ─── Navegación Carrusel ────────────────────────────────────────────────────
  flechaL?.addEventListener('click', () => {
    if (indexCarr > 0) {
      indexCarr--;
      actualizarPanel();
    }
  });
  flechaR?.addEventListener('click', () => {
    if (indexCarr + VISIBLE_COUNT < turnos.length) {
      indexCarr++;
      actualizarPanel();
    }
  });

  btnBorrar.addEventListener('click', () => {
    turnoActivo = null;
    modoBorrar = true;
    actualizarPanel();
  });

  btnCrear.addEventListener('click', () => {
    location.href = 'crear-turno.html';
  });

  btnMarcarTodo.addEventListener('click', () => {
    if (modoBorrar) {
      // “Borrar todo” en la vista actual: recorremos todas las celdas visibles
      document.querySelectorAll('.celda[data-fecha]').forEach(c => {
        const f = c.dataset.fecha;
        const [y, m] = f.split('-').map(Number);
        if (viewMode === 'anio' && y === year) {
          pendientes[f] = [];
        }
        if (viewMode === 'mes' && y === year && m - 1 === month) {
          pendientes[f] = [];
        }
      });
      aplicarMarcados();
      renderResumen(); // ← Actualizar resumen en tiempo real
      btnGuardar.disabled = false;
    } else {
      // “Marcar huecos” (comportamiento original)
      if (!turnoActivo) return;
      document.querySelectorAll('.celda[data-fecha]').forEach(c => {
        const f = c.dataset.fecha;
        if (!((pendientes[f] || marcados[f] || []).length)) {
          manejarCelda(c);
        }
      });
      aplicarMarcados();
      renderResumen(); // ← Actualizar resumen en tiempo real
      btnGuardar.disabled = false;
    }
  });

  // ─── Inicialización ─────────────────────────────────────────────────────────
  renderView();
});
