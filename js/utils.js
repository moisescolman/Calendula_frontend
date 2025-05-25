// js/utils.js

export function getUsuarioActual() {
  return JSON.parse(localStorage.getItem('usuarioActual') || 'null');
}

export function getTurnos(usuario) {
  const clave = `turnos_${usuario.email}`;
  return JSON.parse(localStorage.getItem(clave) || '[]');
}

export function guardarTurnos(usuario, lista) {
  const clave = `turnos_${usuario.email}`;
  localStorage.setItem(clave, JSON.stringify(lista));
}

export function getTurnosMarcados(usuario) {
  const clave = `turnosMarcados_${usuario.email}`;
  return JSON.parse(localStorage.getItem(clave) || '{}');
}

export function guardarTurnosMarcados(usuario, datos) {
  const clave = `turnosMarcados_${usuario.email}`;
  localStorage.setItem(clave, JSON.stringify(datos));
}

export function generarIdTurno(usuario) {
  const turnos = getTurnos(usuario);
  const ids = turnos.map(t => t.id);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}
