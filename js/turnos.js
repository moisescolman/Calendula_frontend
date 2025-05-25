// js/turnos.js

document.addEventListener('DOMContentLoaded', () => {
  const lista    = document.getElementById('lista-turnos');
  const btnCrear = document.getElementById('btn-crear-turno');
  const usr      = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const key      = `turnos_${usr.email}`;

  // Almacena los nombres de los turnos que NO deben poder modificarse ni eliminarse
  const idsNoModificables = ['Descanso', 'Vacaciones'];

  function loadTurnos() {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    const def = [
      { id: 1, abre: 'M', nombre: 'Mañana',    inicio: '08:00', fin: '14:00', tipo: 'suma',   colorF: '#F06292', colorT: '#000', todoDia: false },
      { id: 2, abre: 'T', nombre: 'Tarde',     inicio: '14:00', fin: '20:00', tipo: 'suma',   colorF: '#64B5F6', colorT: '#000', todoDia: false },
      { id: 3, abre: 'N', nombre: 'Noche',     inicio: '20:00', fin: '02:00', tipo: 'nada',   colorF: '#9575CD', colorT: '#fff', todoDia: false },
      { id: 4, abre: 'D', nombre: 'Descanso',  inicio: '00:00', fin: '00:00', tipo: 'resta',  colorF: '#AED581', colorT: '#000', todoDia: true  },
      { id: 5, abre: 'V', nombre: 'Vacaciones',inicio: '00:00', fin: '00:00', tipo: 'nada',   colorF: '#FFEB3B', colorT: '#000', todoDia: true  }
    ];
    localStorage.setItem(key, JSON.stringify(def));
    return def;
  }

  let turnos = loadTurnos();

  function saveTurnos() {
    localStorage.setItem(key, JSON.stringify(turnos));
  }

  function render() {
    lista.innerHTML = '';
    turnos.forEach(t => {
      const div = document.createElement('div');
      div.className = 'turno-item';

      // 1) Abreviatura
      const caja = document.createElement('div');
      caja.className = 'turno-abre';
      caja.textContent = t.abre;
      caja.style.backgroundColor = t.colorF;
      caja.style.color = t.colorT;
      div.append(caja);

      // 2) Nombre
      const nom = document.createElement('span');
      nom.className = 'turno-nombre';
      nom.textContent = t.nombre;
      div.append(nom);

      // 3) “Todo el día” vs horarios
      if (t.todoDia) {
        const todo = document.createElement('span');
        todo.className = 'turno-todo';
        todo.textContent = 'Todo el día';
        div.append(todo);
      } else {
        const ini = document.createElement('span');
        ini.className = 'turno-inicio';
        ini.textContent = t.inicio;
        div.append(ini);

        const fle = document.createElement('span');
        fle.className = 'turno-flecha';
        fle.textContent = '→';
        div.append(fle);

        const fin = document.createElement('span');
        fin.className = 'turno-fin';
        fin.textContent = t.fin;
        div.append(fin);
      }

      // 4) Radios informativas
      const cont = document.createElement('div');
      cont.className = 'tipo-horas';
      [
        ['suma', 'Trabajo'],
        ['resta', 'Libre'],
        ['nada', 'Vacaciones']
      ].forEach(([val, label]) => {
        const lbl = document.createElement('label');
        const inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = `tipo-${t.id}`;
        inp.value = val;
        inp.checked = t.tipo === val;
        inp.disabled = true;
        lbl.append(inp, document.createTextNode(label));
        cont.append(lbl);
      });
      div.append(cont);

      // 5) Botones Modificar / Eliminar SI y SOLO SI no es Descanso/Vacaciones
      if (!idsNoModificables.includes(t.nombre)) {
        // Botón Modificar
        const btnEdit = document.createElement('button');
        btnEdit.className = 'boton-modificar-turno';
        btnEdit.textContent = 'Modificar';
        btnEdit.addEventListener('click', () => {
          location.href = `modificar-turno.html?id=${t.id}`;
        });
        div.append(btnEdit);

        // Botón Eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'boton-eliminar-turno';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => {
          if (confirm('¿Eliminar este turno?')) {
            turnos = turnos.filter(x => x.id !== t.id);
            saveTurnos();
            render();
          }
        });
        div.append(btnEliminar);
      }

      lista.appendChild(div);
    });
  }

  // Crear turno
  btnCrear.addEventListener('click', () => {
    location.href = 'crear-turno.html';
  });

  // Primera renderización
  render();
});
