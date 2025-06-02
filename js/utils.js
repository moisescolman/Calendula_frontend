// js/utils.js

/**
 * Devuelve el usuario actual almacenado en localStorage (login).
 */
export function getUsuarioActual() {
  return JSON.parse(localStorage.getItem('usuarioActual') || 'null');
}

/**
 * Obtiene la lista de turnos del backend para el usuario actual.
 * Retorna una Promise que resuelve a un array de objetos turno.
 */
export async function getTurnos(usuario) {
  try {
    const res = await fetch('http://127.0.0.1:50001/api/turnos', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('No autorizado');
    }
    const turnos = await res.json();
    return turnos;
  } catch (err) {
    console.error('Error al obtener turnos:', err);
    return [];
  }
}

/**
 * Obtiene el mapa de turnos marcados del backend para el usuario actual.
 * El backend devuelve una lista de objetos { id, fecha, turno_id }.
 * Esta función reestructura la información en un objeto:
 *   { '2025-06-01': [ { idMarcado: X, idTurno: Y }, ... ], ... }
 */
export async function getTurnosMarcados(usuario) {
  try {
    const res = await fetch('http://127.0.0.1:50001/api/turnos_marcados', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('No autorizado');
    }
    const listaMarcados = await res.json(); // Array de { id, fecha, turno_id }
    const mapa = {};
    listaMarcados.forEach(item => {
      const { id, fecha, turno_id } = item;
      if (!mapa[fecha]) mapa[fecha] = [];
      mapa[fecha].push({ idMarcado: id, idTurno: turno_id });
    });
    return mapa;
  } catch (err) {
    console.error('Error al obtener turnos marcados:', err);
    return {};
  }
}

/**
 * Sincroniza el conjunto completo de "datos" (pendientes) con el backend.
 * Estrategia:
 *   1) Obtener lista actual de turnos marcados desde el backend.
 *   2) Para cada marcado que esté en backend pero no en "datos", pedir DELETE.
 *   3) Para cada fecha en "datos", para cada idTurno, si no existía en backend, pedir POST.
 *
 * "datos" tiene esta forma:
 *   {
 *     '2025-06-01': [ { idTurno: 2 }, { idTurno: 5 } ],
 *     '2025-06-02': [ { idTurno: 1 } ],
 *     ...
 *   }
 */
export async function guardarTurnosMarcados(usuario, datos) {
  try {
    // Paso 1: obtener marcados actuales
    const resGet = await fetch('http://127.0.0.1:50001/api/turnos_marcados', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resGet.ok) {
      throw new Error('No autorizado');
    }
    const listaBackend = await resGet.json(); // Array de { id, fecha, turno_id }
    // Convertir listaBackend a mapa para facilitar comparaciones
    const mapaBackend = {};
    listaBackend.forEach(item => {
      const { id, fecha, turno_id } = item;
      if (!mapaBackend[fecha]) mapaBackend[fecha] = [];
      mapaBackend[fecha].push({ idMarcado: id, idTurno: turno_id });
    });

    // Paso 2: Borrar marcados que están en backend pero no en "datos"
    for (const [fecha, arrBackend] of Object.entries(mapaBackend)) {
      const arrPendientes = datos[fecha] || [];
      for (const { idMarcado, idTurno } of arrBackend) {
        // Si esta combinación (fecha, idTurno) no está en "datos", eliminar
        const existeEnPend = arrPendientes.some(p => p.idTurno === idTurno);
        if (!existeEnPend) {
          await fetch(`http://127.0.0.1:50001/api/turnos_marcados/${idMarcado}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }
    }

    // Paso 3: Agregar marcados que están en "datos" pero no en backend
    for (const [fecha, arrPendientes] of Object.entries(datos)) {
      for (const { idTurno } of arrPendientes) {
        // Verificar si ya existe en backend
        const arrBackend = mapaBackend[fecha] || [];
        const existeEnBackend = arrBackend.some(b => b.idTurno === idTurno);
        if (!existeEnBackend) {
          await fetch('http://127.0.0.1:50001/api/turnos_marcados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ fecha, turno_id: idTurno })
          });
        }
      }
    }
  } catch (err) {
    console.error('Error al guardar turnos marcados:', err);
  }
}

/**
 * Genera un nuevo ID de turno local en caso de que se necesite,
 * pero con el backend ya no se utiliza. Esta función queda para
 * compatibilidad, retorna null.
 */
export function generarIdTurno(usuario) {
  return null;
}
