# Gestión de pacientes

Aplicación web full-stack para dar de alta, consultar, editar y eliminar pacientes.
El proyecto se divide en dos partes independientes:

- **`Backend/`** — API REST con Node.js y Express 5.
- **`Frontend/`** — SPA con React 19, TypeScript y Vite.

---

## Índice

- [Stack](#stack)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Variables de entorno](#variables-de-entorno)
- [API](#api)
- [Reglas de validación](#reglas-de-validación)
- [Tests](#tests)
- [Scripts disponibles](#scripts-disponibles)
- [Limitaciones conocidas](#limitaciones-conocidas)

---

## Stack

| Capa     | Tecnologías                                                        |
| -------- | ------------------------------------------------------------------ |
| Backend  | Node.js, Express 5, CORS, Vitest + Supertest, Nodemon               |
| Frontend | React 19, TypeScript, Vite, Axios, Vitest + Testing Library, Oxlint |

---

## Estructura del proyecto

```
gestion-pacientes/
├── Backend/
│   ├── app.js                  # Aplicación Express (sin listen), reutilizable en los tests
│   ├── server.js               # Arranque del servidor (lee PORT)
│   ├── routes/
│   │   └── pacientes.js        # Rutas CRUD y validación de pacientes
│   └── test/
│       └── pacientes.test.js   # Tests de la API con Supertest
└── Frontend/
    ├── index.html
    ├── vite.config.ts          # Config de Vite + Vitest (entorno jsdom)
    └── src/
        ├── App.tsx             # Composición de la vista y estado de edición
        ├── components/
        │   ├── FormularioPacientes.tsx   # Alta y edición de pacientes
        │   └── TablaPacientes.tsx        # Listado, edición y borrado
        ├── hooks/
        │   └── usePacientes.ts           # Estado y operaciones CRUD
        └── services/
            └── pacientesService.ts       # Cliente Axios y tipos (Paciente, ApiError)
```

La separación entre `app.js` y `server.js` permite importar la aplicación desde los tests
sin abrir un puerto real.

---

## Requisitos

- **Node.js >= 22.12** (lo exige Vitest 5)
- **npm 10** o superior

Las dependencias se instalan por separado en cada carpeta: no hay workspaces ni
`package.json` en la raíz.

---

## Puesta en marcha

### 1. Backend

```bash
cd Backend
npm install
npm run dev      # con recarga automática (nodemon)
# o
npm start        # arranque normal
```

La API queda escuchando en <http://localhost:3000>.

### 2. Frontend

En otra terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite sirve la aplicación en <http://localhost:5173> y ataca por defecto a
`http://localhost:3000`. El backend tiene CORS abierto, así que ambos puertos conviven
sin configuración adicional.

---

## Variables de entorno

| Variable       | Dónde    | Por defecto             | Descripción                     |
| -------------- | -------- | ----------------------- | ------------------------------- |
| `PORT`         | Backend  | `3000`                  | Puerto de escucha de la API     |
| `VITE_API_URL` | Frontend | `http://localhost:3000` | URL base a la que llama Axios   |

Para apuntar el frontend a otra API, crea un archivo `Frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:4000
```

---

## API

Base: `http://localhost:3000` · Todos los cuerpos de petición y respuesta son JSON.

### Modelo `Paciente`

```json
{
  "dni": "12345678A",
  "name": "Ana",
  "surname": "García",
  "address": "Calle Mayor 1",
  "city": "Madrid",
  "postalCode": "28001",
  "phone": "600123456"
}
```

### Endpoints

| Método   | Ruta              | Descripción                        | Respuestas                          |
| -------- | ----------------- | ---------------------------------- | ----------------------------------- |
| `GET`    | `/pacientes`      | Lista todos los pacientes          | `200` array de pacientes            |
| `GET`    | `/pacientes/:dni` | Devuelve un paciente por su DNI    | `200` paciente · `404` no encontrado |
| `POST`   | `/pacientes`      | Crea un paciente                   | `201` creado · `400` datos inválidos · `409` DNI duplicado |
| `PUT`    | `/pacientes/:dni` | Actualiza los datos de un paciente | `200` actualizado · `400` datos inválidos · `404` no encontrado |
| `DELETE` | `/pacientes/:dni` | Elimina un paciente                | `200` paciente eliminado · `404` no encontrado |

Cualquier otra ruta responde `404` con `{ "message": "Incorrect route or params." }`.

Los errores siempre llegan con la forma `{ "message": "..." }`; si hay varios fallos de
validación se concatenan en un único mensaje.

### Ejemplos

```bash
# Crear
curl -X POST http://localhost:3000/pacientes \
  -H "Content-Type: application/json" \
  -d '{"dni":"12345678A","name":"Ana","surname":"García","address":"Calle Mayor 1","city":"Madrid","postalCode":"28001","phone":"600123456"}'

# Listar
curl http://localhost:3000/pacientes

# Actualizar (el DNI se toma de la URL, no del cuerpo)
curl -X PUT http://localhost:3000/pacientes/12345678A \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana María","surname":"García","address":"Calle Mayor 2","city":"Madrid","postalCode":"28002","phone":"600123457"}'

# Eliminar
curl -X DELETE http://localhost:3000/pacientes/12345678A
```

---

## Reglas de validación

- Todos los campos son obligatorios y deben ser cadenas no vacías; se les aplica `trim()`.
- `dni`: 8 dígitos seguidos de una letra (`^\d{8}[A-Za-z]$`). Se guarda en mayúsculas.
- `postalCode`: exactamente 5 dígitos.
- `phone`: exactamente 9 dígitos.
- El DNI debe ser único: crear uno repetido devuelve `409`.
- En `PUT` el DNI no se puede cambiar: se toma de la URL y se ignora el que venga en el cuerpo.
- Las propiedades no reconocidas se descartan; solo se guardan los campos del modelo.

El formulario del frontend refleja estas mismas reglas y bloquea el campo DNI durante la
edición.

---

## Tests

```bash
cd Backend  && npm test    # 17 tests: API con Vitest + Supertest
cd Frontend && npm test    # 11 tests: hook usePacientes y formulario (Testing Library)
```

Usa `npm run test:watch` en cualquiera de las dos carpetas para el modo interactivo.

Los tests del backend cubren los cinco endpoints (códigos de estado, validación de campos,
descarte de propiedades no esperadas y DNI duplicado). Los del frontend incluyen dos tests
de regresión: al editar se envía el DNI original y el campo permanece bloqueado.

---

## Scripts disponibles

### Backend

| Script               | Acción                                  |
| -------------------- | --------------------------------------- |
| `npm start`          | Arranca el servidor                     |
| `npm run dev`        | Arranca con nodemon (recarga automática) |
| `npm test`           | Ejecuta los tests una vez               |
| `npm run test:watch` | Tests en modo watch                     |

### Frontend

| Script               | Acción                                       |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Servidor de desarrollo de Vite               |
| `npm run build`      | Comprueba tipos (`tsc -b`) y genera `dist/`  |
| `npm run preview`    | Sirve la build de producción                 |
| `npm run typecheck`  | Solo comprobación de tipos                   |
| `npm run lint`       | Oxlint                                       |
| `npm run lint:fix`   | Oxlint aplicando correcciones automáticas    |
| `npm test`           | Ejecuta los tests una vez                    |
| `npm run test:watch` | Tests en modo watch                          |

---

## Limitaciones conocidas

- **Los datos se guardan en memoria.** El array de pacientes vive en
  `Backend/routes/pacientes.js`, así que todo se pierde al reiniciar el servidor. El
  siguiente paso natural sería sustituirlo por una base de datos.
- No hay autenticación ni control de acceso: la API es pública.
- La letra del DNI se valida por formato, no se comprueba que corresponda al número.
