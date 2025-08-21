document.addEventListener('DOMContentLoaded', async () => {
  const lista    = document.getElementById('lista-turnos');
  const btnCrear = document.getElementById('btn-crear-turno');
  // IDs de turnos que no deben modificarse/eliminarse
  const namesNoModificables = ['Descanso', 'Vacaciones'];

  // 1) Verificar sesión
  try {
    const resUser = await fetch('https://calendula-backend.onrender.com/api/usuarios/me', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resUser.ok) {
      return window.location.href = 'login.html';
    }
  } catch {
    return window.location.href = 'login.html';
  }


  let turnos = [];
  try {
    const resTurnos = await fetch('https://calendula-backend.onrender.com/api/turnos', {
      method: 'GET',
      credentials: 'include'
    });
    turnos = await resTurnos.json();
  } catch {
    alert('Error al cargar los turnos');
    return;
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

      // 4) Radios informativas (solo lectura)
      const cont = document.createElement('div');
      cont.className = 'tipo-horas';
      [
        ['completo', 'Trabajo'],
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

      if (!namesNoModificables.includes(t.nombre)) {
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
        btnEliminar.addEventListener('click', async () => {
          if (!confirm('¿Eliminar este turno?')) return;
          try {
            const res = await fetch(`https://calendula-backend.onrender.com/api/turnos/${t.id}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) {
              return alert(data.error || 'Error al eliminar turno');
            }
            turnos = turnos.filter(x => x.id !== t.id);
            render();
          } catch {
            alert('Error al conectar con el servidor');
          }
        });
        div.append(btnEliminar);
      }

      lista.appendChild(div);
    });
  }

  btnCrear.addEventListener('click', () => {
    location.href = 'crear-turno.html';
  });

  render();
});
