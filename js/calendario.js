// js/calendario.js
import {
  getUsuarioActual,
  getTurnos,
  getTurnosMarcados,
  guardarTurnosMarcados
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUsuarioActual();
  if (!usuario) return;

  // ─── Elementos DOM ─────────────────────────────────────────────────────────
  const grid         = document.getElementById('calendario-grid');
  const headerYear   = document.getElementById('anio-mostrado');
  const btnPrevY     = document.getElementById('anio-previo');
  const btnNextY     = document.getElementById('anio-siguiente');
  const btnYear      = document.getElementById('vista-anio');
  const btnMonth     = document.getElementById('vista-mes');
  const btnHoy       = document.getElementById('boton-hoy');

  const btnMarcar    = document.getElementById('btn-marcar');
  const btnGuardar   = document.getElementById('btn-guardar-turnos');
  const btnCancelar  = document.getElementById('btn-cancelar-marcar');
  const panel        = document.getElementById('panel-turnos');
  const carrusel     = document.getElementById('contenedor-turnos');
  const txtActivo    = document.getElementById('texto-turno-activo');
  const flechaL      = document.getElementById('flecha-izq');
  const flechaR      = document.getElementById('flecha-der');
  const btnBorrar    = document.getElementById('boton-borrar-turno');
  const btnCrear     = document.getElementById('boton-crear-turno');
  const btnMarcarTodo= document.getElementById('btn-marcar-todo');

  // ─── Configurar “hoy” en zona Madrid ───────────────────────────────────────
  // Fecha “hoy” en formato YYYY-MM-DD según Europe/Madrid
  const fechaHoy     = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid'
  }).format(new Date());
  const [hoyY, hoyM, hoyD] = fechaHoy.split('-').map(Number);

  // ─── Drag state ─────────────────────────────────────────────────────────────
  let isDragging = false;

  // ─── Configuración Carrusel ────────────────────────────────────────────────
  const VISIBLE_COUNT = 5;
  let indexCarr       = 0;

  // ─── Estado interno ────────────────────────────────────────────────────────
  let turnos       = getTurnos(usuario);
  let marcados     = getTurnosMarcados(usuario);
  let pendientes   = {};
  let turnoActivo  = null;
  let modoMarcar   = false;
  let modoBorrar   = false;

  // Vista inicial centrada en hoy (Madrid)
  let year     = hoyY;
  let month    = hoyM - 1;
  let viewMode = 'anio';

  const mesesNom = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem  = ['Lun','Mar','Mié','Jue','Vie','Sab','Dom'];

  // ─── Render Dinámico ───────────────────────────────────────────────────────

  function clearGrid() {
    grid.innerHTML = '';
  }

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

  /**
   * Genera un mes completo.
   * @param {number} año
   * @param {number} mes
   * @param {boolean} mostrarNav  — si true, renderiza las flechas de navegación
   * @returns {HTMLElement} div.mes
   */
  function generarMes(año, mes, mostrarNav) {
    const md = document.createElement('div');
    md.className = 'mes';

    // ─── Cabecera del mes ────────────────────────────────────────────────────
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

    // ─── Días de la semana ────────────────────────────────────────────────────
    const ds = document.createElement('div');
    ds.className = 'dias-semana';
    diasSem.forEach(d => {
      const sp = document.createElement('div');
      sp.textContent = d;
      ds.appendChild(sp);
    });
    md.appendChild(ds);

    // ─── Fechas del mes ───────────────────────────────────────────────────────
    const fd = document.createElement('div');
    fd.className = 'fechas';
    // offset para el primer día
    const prim = new Date(año, mes, 1).getDay();
    const off = (prim + 6) % 7; // ajustar a Lunes=0
    for (let i = 0; i < off; i++) {
      fd.appendChild(document.createElement('div'));
    }
    // días del mes
    const dm = new Date(año, mes + 1, 0).getDate();
    for (let d = 1; d <= dm; d++) {
      // fecha en YYYY-MM-DD sin usar toISOString (evita desfases por UTC)
      const fecha = `${año}-${String(mes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cel = crearCelda(fecha, d);
      fd.appendChild(cel);
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
    bindCeldaClicks();
    aplicarMarcados();
  }

  function renderMonth() {
    clearGrid();
    grid.className = 'calendario-grid vista-mes';
    const mesDiv = generarMes(year, month, true);
    grid.appendChild(mesDiv);

    // ─── Listeners para navegación entre meses ──────────────────────────────
    const btnMesPrev = mesDiv.querySelector('.mes-prev');
    const btnMesNext = mesDiv.querySelector('.mes-next');

    btnMesPrev.addEventListener('click', () => {
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      renderView();
    });
    btnMesNext.addEventListener('click', () => {
      month++;
      if (month > 11) {
        month = 0;
        year++;
      }
      renderView();
    });

    bindCeldaClicks();
    aplicarMarcados();
  }

  function renderView() {
    headerYear.textContent = year;
    btnYear.classList.toggle('activo', viewMode === 'anio');
    btnMonth.classList.toggle('activo', viewMode === 'mes');
    if (viewMode === 'anio') renderYear();
    else renderMonth();
  }

  // ─── Botones de control ───────────────────────────────────────────────────
  btnYear.addEventListener('click', () => { viewMode = 'anio'; renderView(); });
  btnMonth.addEventListener('click', () => { viewMode = 'mes';  renderView(); });
  btnPrevY.addEventListener('click', () => { year--; renderView(); });
  btnNextY.addEventListener('click', () => { year++; renderView(); });
  btnHoy.addEventListener('click', () => {
    // Volver a "hoy" Madrid
    year     = hoyY;
    month    = hoyM - 1;
    viewMode = 'mes';
    renderView();
  });

  // ─── Bind y Marcado ────────────────────────────────────────────────────────
  function bindCeldaClicks() {
    document.querySelectorAll('.celda[data-fecha]').forEach(c => {
      c.addEventListener('click', () => manejarCelda(c));
    });
  }

  function aplicarMarcados() {
    document.querySelectorAll('.celda[data-fecha]').forEach(cel => {
      cel.querySelectorAll('.etq-turno').forEach(el => el.remove());
      const f = cel.dataset.fecha;
      const arr = pendientes[f] !== undefined
        ? pendientes[f]
        : (marcados[f] || []);
      // mostrar turnos como antes...
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
      // resaltar celda de hoy (Madrid)
      if (cel.dataset.fecha === fechaHoy) {
        cel.classList.add('celda-actual');
      }
    });
  }

  function manejarCelda(celda) {
    if (!modoMarcar) return;
    const f = celda.dataset.fecha;
    let arr = pendientes[f] !== undefined
      ? pendientes[f]
      : (marcados[f] || []);

    if (modoBorrar) {
      pendientes[f] = [];
    } else if (turnoActivo) {
      if (turnoActivo.todoDia || arr.length === 0) {
        arr = [{ idTurno: turnoActivo.id }];
      } else if (arr.length === 1) {
        const ex = turnos.find(t => t.id === arr[0].idTurno);
        if (!ex.todoDia && ex.id !== turnoActivo.id) {
          const duo = [ex, turnoActivo].sort((a, b) =>
            a.inicio.localeCompare(b.inicio)
          );
          arr = duo.map(t => ({ idTurno: t.id }));
        }
      }
      pendientes[f] = arr;
    }

    btnGuardar.disabled = Object.keys(pendientes).length === 0;
    aplicarMarcados();
  }

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
    if (modoBorrar)     txtActivo.textContent = 'Modo borrado activo';
    else if (turnoActivo) txtActivo.textContent = `Turno seleccionado: ${turnoActivo.nombre}`;
    else                   txtActivo.textContent = 'Selecciona turno a marcar';
  }

  btnMarcar.addEventListener('click', () => {
    indexCarr = 0;
    modoMarcar = true;
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
    renderView();
  });

  // ─── Flechas del carrusel ───────────────────────────────────────────────────
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
    if (!turnoActivo) return;
    document.querySelectorAll('.celda[data-fecha]').forEach(c => {
      const f = c.dataset.fecha;
      if (!((pendientes[f] || marcados[f] || []).length)) {
        manejarCelda(c);
      }
    });
    btnGuardar.disabled = false;
  });

  // ─── Drag-to-mark: click + drag support ────────────────────────────────────
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

  // ─── Inicio ────────────────────────────────────────────────────────────────
  renderView();
});
