document.addEventListener('DOMContentLoaded', async () => {
  // ─── Verificar sesión y obtener usuario ─────────────────────────────────────
  let usuario;
  try {
    const resUser = await fetch('https://calendula-backend.onrender.com/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resUser.ok) {
      // No autenticado → redirigir a login
      return window.location.href = '../pages/login.html';
    }
    usuario = await resUser.json(); // { id, nombre, correo }
  } catch {
    return window.location.href = '../pages/login.html';
  }

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

  const fechaHoyStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid'
  }).format(new Date());
  const [hoyY, hoyM, hoyD] = fechaHoyStr.split('-').map(Number);

  let isDragging           = false;
  const VISIBLE_COUNT      = 5;
  let indexCarr            = 0;

  // Desde el backend: obtener turnos y marcados
  let turnos = [];
  let marcadosMap = {}; 

  try {
    // Obtener turnos
    const resTurnos = await fetch('https://calendula-backend.onrender.com/api/turnos', {
      method: 'GET',
      credentials: 'include'
    });
    turnos = await resTurnos.json();

    // Obtener turnos marcados
    const resMarcados = await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
      method: 'GET',
      credentials: 'include'
    });
    const listMarc = await resMarcados.json(); // [ { id, fecha, turno_id } ]

    // Agrupar por fecha
    marcadosMap = {};
    listMarc.forEach(item => {
      if (!marcadosMap[item.fecha]) marcadosMap[item.fecha] = [];
      marcadosMap[item.fecha].push({ id: item.id, idTurno: item.turno_id });
    });
  } catch {
    alert('Error al cargar datos del servidor');
    return;
  }

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
    // primero, copiamos marcados
    Object.entries(marcadosMap).forEach(([f, arr]) => {
      efectivo[f] = arr.map(item => ({ idTurno: item.idTurno }));
    });
    // luego, sobrescribimos con pendientes donde existan
    Object.entries(pendientes).forEach(([f, arr]) => {
      efectivo[f] = arr.map(item => ({ idTurno: item.idTurno }));
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
      let arr = [];
      if (pendientes[f] !== undefined) {
        arr = pendientes[f];
      } else if (marcadosMap[f]) {
        arr = marcadosMap[f].map(item => ({ idTurno: item.idTurno }));
      }

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

    let arrOriginal = [];
    if (pendientes[f] !== undefined) {
      arrOriginal = pendientes[f].slice();
    } else if (marcadosMap[f]) {
      arrOriginal = marcadosMap[f].map(item => ({ idTurno: item.idTurno }));
    }

    if (modoBorrar) {
      pendientes[f] = [];
      btnGuardar.disabled = false;
      aplicarMarcados();
      renderResumen();
      return;
    }

    if (!turnoActivo) return;

    const tieneTodoDia = arrOriginal.some(item => {
      const t = turnos.find(x => x.id === item.idTurno);
      return t && t.todoDia;
    });

    let nuevoArr = [];

    if (
      arrOriginal.length >= 2 ||
      tieneTodoDia ||
      turnoActivo.todoDia
    ) {
      nuevoArr = [{ idTurno: turnoActivo.id }];
    } else {
      if (arrOriginal.length === 0) {
        nuevoArr = [{ idTurno: turnoActivo.id }];
      } else if (arrOriginal.length === 1) {
        const turnoExistente = turnos.find(t => t.id === arrOriginal[0].idTurno);
        if (
          turnoExistente &&
          !turnoExistente.todoDia &&
          turnoExistente.id !== turnoActivo.id &&
          !turnoActivo.todoDia
        ) {
          const duo = [turnoExistente, turnoActivo].sort((a, b) =>
            a.inicio.localeCompare(b.inicio)
          );
          nuevoArr = duo.map(t => ({ idTurno: t.id }));
        } else {
          nuevoArr = [{ idTurno: turnoActivo.id }];
        }
      }
    }

    pendientes[f] = nuevoArr;
    btnGuardar.disabled = Object.keys(pendientes).length === 0;
    aplicarMarcados();
    renderResumen();
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

  btnGuardar.addEventListener('click', async () => {
    // Iterar sobre fechas pendientes y sincronizar con backend
    for (const [f, arrNuevo] of Object.entries(pendientes)) {
      const orig = (marcadosMap[f] || []).map(item => item.idTurno);

      // Turnos a eliminar
      for (const marcadoObj of (marcadosMap[f] || [])) {
        if (!arrNuevo.some(x => x.idTurno === marcadoObj.idTurno)) {
          // Borrar marcado
          await fetch(`https://calendula-backend.onrender.com/api/turnos_marcados/${marcadoObj.id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }
      // Turnos a agregar
      for (const x of arrNuevo) {
        if (!orig.includes(x.idTurno)) {
          await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fecha: f, turno_id: x.idTurno })
          });
        }
      }
    }

    // Después de sincronizar, recargar marcadosMap desde el backend
    try {
      const res = await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
        method: 'GET',
        credentials: 'include'
      });
      const listMarc = await res.json();
      marcadosMap = {};
      listMarc.forEach(item => {
        if (!marcadosMap[item.fecha]) marcadosMap[item.fecha] = [];
        marcadosMap[item.fecha].push({ id: item.id, idTurno: item.turno_id });
      });
    } catch {
      alert('Error al recargar marcados');
    }

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
      // “Marcar huecos”
      if (!turnoActivo) return;
      document.querySelectorAll('.celda[data-fecha]').forEach(c => {
        const f = c.dataset.fecha;
        if (!((pendientes[f] || marcadosMap[f] || []).length)) {
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
