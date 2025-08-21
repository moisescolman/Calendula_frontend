# Calendula
Parte Frontend

## Presentación
Calendula es una aplicación web diseñada para facilitar la planificación y gestión de turnos laborales, vacaciones y días libres. Ofrece a cada usuario un calendario interactivo donde pueden crear, modificar y eliminar turnos personalizados (tales como Mañana, Tarde, Noche, Descanso y Vacaciones), asignarlos a fechas específicas y obtener resúmenes de días de descanso, ocupados y horas trabajadas. Con un frontend responsivo en HTML, CSS y JavaScript y un backend en Flask con una API RESTful sobre SQLite, Calendula permite un flujo ágil desde el registro de usuarios y autenticación segura hasta la persistencia de datos y la visualización dinámica de la información en cualquier dispositivo.

---

## Funcionalidades clave
- **Autenticación y perfil:** registro, inicio/cierre de sesión, edición de perfil y cambio de contraseña.
- **Gestión de turnos (CRUD):** nombre, abreviatura (máx. 3), tipo (`suma`, `resta`, `nada`), colores (fondo/texto), horario o día completo.
- **Calendario interactivo:** vista **Mes** y **Año**, **máximo 2 turnos por día**, ordenados por hora de inicio.
- **Atajos útiles:** **Marcar huecos** (autocompleta días vacíos), **Modo borrar**, **Borrar todo**, guardado incremental (**diff**).
- **Resumen por periodo:** totales por turno, días de descanso/vacaciones/actividad y **horas trabajadas** (a partir de los horarios).
- **Día de ausencias:** *Descanso* y *Vacaciones* no se pueden editar ni eliminar.
- **Interfaz responsive** para dispositivos móviles y escritorio.

El frontend se comunica con el **backend Flask** a través de `fetch` y utiliza **cookies de sesión** para mantener la autenticación del usuario.

## Stack y arquitectura
- **Frontend:** HTML5, CSS3, JavaScript (algunos módulos ES).  
- **Infraestructura:** sitio estático (sin build).  
- **Backend (otro repositorio):** Python + Flask + SQLite  en `http://127.0.0.1:50001`, con CORS.

## Estructura del proyecto

```bash
CALENDULA-Front/
│
├── index.html             # Página principal / acceso
├── registro.html          # Registro de nuevos usuarios
├── login.html             # Inicio de sesión
├── calendario.html        # Vista del calendario con turnos
├── turnos.html            # Gestión de turnos del usuario
├── crear-turno.html       # Creación de turnos personalizados
├── modificar-turno.html   # Edición de turnos existentes
│
├── css/                   # Estilos CSS
│   ├── main.css
│   └── responsive.css
│
├── js/                    # Lógica Frontend
│   ├── registro.js
│   ├── login.js
│   ├── calendario.js
│   ├── turnos.js
│   ├── crear-turno.js
│   ├── modificar-turno.js
│   └── utils.js
│
└── assets/                # Recursos (imágenes, íconos, etc.)
```

---

## Ejecución del proyecto

El frontend está pensado para ejecutarse en un **servidor HTTP simple**.  
Existen varias opciones:

### Opción 1: Live Server (VS Code recomendado)
1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho en `index.html` → **"Open with Live Server"**.
4. Se abrirá automáticamente en `http://127.0.0.1:5500`.

### Opción 2: Servidor HTTP de Python
1. Abre una terminal en la carpeta raíz del proyecto.
2. Ejecuta:
   ```bash
   # Python 3
   python3 -m http.server 5500
   ```
3. Abre en el navegador:  
    `http://127.0.0.1:5500`

---

## Comunicación con el Backend

El frontend realiza llamadas al backend Flask (que corre en `http://127.0.0.1:50001`) usando **fetch con credenciales**:
- Si cambias el puerto del frontend, deberás actualizar la configuración de **CORS en el backend**.

---

## Interfaz y vistas principales

- **Registro/Login** → Formularios de autenticación de usuario.  
- **Calendario** → Vista general del año/mes con turnos marcados.  
- **Turnos** → Listado dinámico de los turnos del usuario, con botones para modificar o eliminar.  
- **Crear/Modificar Turno** → Formularios interactivos con selector de colores y horarios.  
- **Responsive** → Diseño adaptado para escritorio y móvil.

---

## Sobre el proyecto

Proyecto desarrollado como trabajo final para acreditación de finalización del Bootcamp Full Stack de Peñascal F5.
Desarrollado como parte de la aplicación **Calendula**, con integración completa **Frontend (este repositorio) + Backend (Flask + SQLite)**.

---

