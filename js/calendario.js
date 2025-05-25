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

  const hoy      = new Date();
  let year       = hoy.getFullYear();
  let month      = hoy.getMonth();
  let viewMode   = 'anio';

  const mesesNom = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const diasSem  = ['L','M','X','J','V','S','D'];

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

  function generarMes(año, mes) {
    const md = document.createElement('div');
    md.className = 'mes';
    const mh = document.createElement('div');
    mh.className = 'mes-header';
    mh.innerHTML = `<h3>${mesesNom[mes]} ${año}</h3>`;
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
    const off = (prim + 6) % 7;
    for (let i = 0; i < off; i++) fd.appendChild(document.createElement('div'));
    const dm = new Date(año, mes + 1, 0).getDate();
    for (let d = 1; d <= dm; d++) {
      const fecha = new Date(año, mes, d).toISOString().split('T')[0];
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
      grid.appendChild(generarMes(year, m));
    }
    bindCeldaClicks();
    aplicarMarcados();
  }

  function renderMonth() {
    clearGrid();
    grid.className = 'calendario-grid vista-mes';
    grid.appendChild(generarMes(year, month));
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

  btnYear.addEventListener('click', () => { viewMode = 'anio'; renderView(); });
  btnMonth.addEventListener('click', () => { viewMode = 'mes';  renderView(); });
  btnPrevY.addEventListener('click', () => { year--; renderView(); });
  btnNextY.addEventListener('click', () => { year++; renderView(); });
  btnHoy.addEventListener('click', () => {
    year   = hoy.getFullYear();
    month  = hoy.getMonth();
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
      if (cel.dataset.fecha === hoy.toISOString().split('T')[0]) {
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
      // Marcamos para borrado independientemente de si estaba guardado
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

  // ─── Panel de turnos ────────────────────────────────────────────────────────

  function renderCarrusel() {
    carrusel.innerHTML = '';
    const visibles = turnos.slice(indexCarr, indexCarr + VISIBLE_COUNT);
    visibles.forEach(t => {
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
      if (!((pendientes[f] !== undefined
             ? pendientes[f]
             : (marcados[f] || [])).length)) {
        manejarCelda(c);
      }
    });
    btnGuardar.disabled = false;
  });

  // ─── Inicio ────────────────────────────────────────────────────────────────
  renderView();
});
