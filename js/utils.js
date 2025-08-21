export function getUsuarioActual() {
  return JSON.parse(localStorage.getItem('usuarioActual') || 'null');
}


export async function getTurnos(usuario) {
  try {
    const res = await fetch('https://calendula-backend.onrender.com/api/turnos', {
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


export async function getTurnosMarcados(usuario) {
  try {
    const res = await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
      method: 'GET',
      credentials: 'include'
    });
    if (!res.ok) {
      throw new Error('No autorizado');
    }
    const listaMarcados = await res.json(); 
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

// Sincroniza el conjunto completo de "datos" (pendientes) con el backend.
export async function guardarTurnosMarcados(usuario, datos) {
  try {

    const resGet = await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
      method: 'GET',
      credentials: 'include'
    });
    if (!resGet.ok) {
      throw new Error('No autorizado');
    }
    const listaBackend = await resGet.json(); 
    const mapaBackend = {};
    listaBackend.forEach(item => {
      const { id, fecha, turno_id } = item;
      if (!mapaBackend[fecha]) mapaBackend[fecha] = [];
      mapaBackend[fecha].push({ idMarcado: id, idTurno: turno_id });
    });

    for (const [fecha, arrBackend] of Object.entries(mapaBackend)) {
      const arrPendientes = datos[fecha] || [];
      for (const { idMarcado, idTurno } of arrBackend) {
        const existeEnPend = arrPendientes.some(p => p.idTurno === idTurno);
        if (!existeEnPend) {
          await fetch(`https://calendula-backend.onrender.com/api/turnos_marcados/${idMarcado}`, {
            method: 'DELETE',
            credentials: 'include'
          });
        }
      }
    }

    // Paso 3: Agregar marcados que están en "datos" pero no en backend
    for (const [fecha, arrPendientes] of Object.entries(datos)) {
      for (const { idTurno } of arrPendientes) {
        const arrBackend = mapaBackend[fecha] || [];
        const existeEnBackend = arrBackend.some(b => b.idTurno === idTurno);
        if (!existeEnBackend) {
          await fetch('https://calendula-backend.onrender.com/api/turnos_marcados', {
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

export function generarIdTurno(usuario) {
  return null;
}
