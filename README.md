# Calendula — Frontend

> **Presentación.**
> Es una aplicación web diseñada para facilitar la planificación y gestión de turnos laborales, vacaciones y días libres. Ofrece a cada usuario un calendario interactivo donde pueden crear, modificar y eliminar turnos personalizados (tales como Mañana, Tarde, Noche, Descanso y Vacaciones), asignarlos a fechas específicas y obtener resúmenes de días de descanso, ocupados y horas trabajadas. Con un frontend responsivo en HTML, CSS y JavaScript y un backend en Flask con una API RESTful sobre SQLite, Calendula permite un flujo ágil desde el registro de usuarios y autenticación segura hasta la persistencia de datos y la visualización dinámica de la información en cualquier dispositivo.

---

## ✨ Funcionalidades clave
- **Autenticación y perfil:** registro, inicio/cierre de sesión, edición de perfil y cambio de contraseña.
- **Gestión de turnos (CRUD):** nombre, abreviatura (máx. 3), tipo (`suma`, `resta`, `nada`), colores (fondo/texto), horario o día completo.
- **Calendario interactivo:** vista **Mes** y **Año**, **máximo 2 turnos por día**, ordenados por hora de inicio.
- **Atajos útiles:** **Marcar huecos** (autocompleta días vacíos), **Modo borrar**, **Borrar todo**, guardado incremental (**diff**).
- **Resumen por periodo:** totales por turno, días de descanso/vacaciones/actividad y **horas trabajadas** (a partir de los horarios).
- **Día de ausencias:** *Descanso* y *Vacaciones* no se pueden editar ni eliminar.
- **Interfaz responsive** para dispositivos móviles y escritorio.

El frontend se comunica con el **backend Flask** a través de `fetch` y utiliza **cookies de sesión** para mantener la autenticación del usuario.

## 🧱 Stack y arquitectura
- **Frontend:** HTML5, CSS3, JavaScript (algunos módulos ES).  
- **Infraestructura:** sitio estático (sin build).  
- **Backend (otro repositorio):** Python + Flask + SQLite  en `http://127.0.0.1:50001`, con CORS.

### Estructura del proyecto
```
├── css/                 # estilos por página/feature
├── img/                 # logotipos e iconografía
├── js/                  # lógica de UI y API (módulos ES en partes)
│   ├── auth.js          # estado de sesión, logout, guardas de ruta
│   ├── calendario.js    # render mensual/anual, marcado, diff y resumen
│   ├── turnos.js        # listado/acciones sobre turnos
│   ├── crear-turno.js   # alta con previsualización y paleta de colores
│   ├── modificar-turno.js
│   ├── utils.js         # utilidades de sincronización con backend
│   ├── login.js         # formulario de acceso
│   ├── registro.js      # formulario de alta
│   ├── perfil.js        # vista de perfil
│   ├── mod-perfil.js    # edición de perfil
│   ├── mod-contrasena.js# cambio de contraseña
│   └── nav.js           # cabecera y navegación
├── pages/               # vistas (login, calendario, turnos, perfil, …)
└── index.html           # landing
```

