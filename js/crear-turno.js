// js/crear-turno.js
import {
  getUsuarioActual,
  getTurnos,
  guardarTurnos
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista-turnos');
  const btnCrear = document.getElementById('btn-crear-turno');
  const usuario = getUsuarioActual();
  let turnos = getTurnos(usuario);

  const idsNoEliminables = ['Descanso', 'Vacaciones'];

  function render() {
    lista.innerHTML = '';
    turnos.forEach(t => {
      const div = document.createElement('div');
      div.className = 'turno-item';

      // ... UI de turno ...

      const btnEdit = document.createElement('button');
      btnEdit.className = 'boton-control';
      btnEdit.textContent = 'Modificar';
      btnEdit.disabled = idsNoEliminables.includes(t.nombre);
      btnEdit.addEventListener('click', () => {
        if (!btnEdit.disabled) {
          location.href = `modificar-turno.html?id=${t.id}`;
        }
      });

      const btnEliminar = document.createElement('button');
      btnEliminar.className = 'boton-control peligro';
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.disabled = idsNoEliminables.includes(t.nombre);
      btnEliminar.addEventListener('click', () => {
        if (!btnEliminar.disabled && confirm('¿Eliminar este turno?')) {
          turnos = turnos.filter(x => x.id !== t.id);
          guardarTurnos(usuario, turnos);
          render();
        }
      });

      div.append(btnEdit, btnEliminar);
      lista.appendChild(div);
    });
  }

  btnCrear.addEventListener('click', () => {
    location.href = 'crear-turno.html';
  });

  render();
});
