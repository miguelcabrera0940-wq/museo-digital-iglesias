# Museo Digital y Archivo Histórico de Iglesias

Proyecto académico de Aplicaciones Web que permite explorar ocho iglesias de Yucatán, Campeche y Puebla, conocer su historia y consultar su museo y biblioteca digital.

## Índice

- [Descripción](#descripción)
- [Funciones](#funciones)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Roles](#roles)
- [Pruebas](#pruebas)
- [Contenido y fotografías](#contenido-y-fotografías)
- [Limitaciones](#limitaciones)

## Descripción

El proyecto reúne información histórica y materiales públicos en una interfaz inspirada en un museo. Incluye un mapa interactivo, fotografías, una biblioteca con lector y un panel de administración por iglesia.

Su propósito es facilitar la consulta del patrimonio religioso y presentar una propuesta de organización de archivos digitales, con especial atención a la legibilidad y facilidad de uso.

## Funciones

- Mapa interactivo y selección de iglesias por estado.
- Historia, ubicación y fotografías de cada templo.
- Museo con diez objetos documentados.
- Ocho cuadernos informativos con cuatro páginas cada uno.
- Lector digital con navegación entre páginas.
- Consulta de horarios y actividades.
- Orientación general sobre trámites parroquiales.
- Inicio de sesión y administración con permisos por iglesia.
- Selección y vista previa local de un PDF de demostración.

## Tecnologías

| Componente | Tecnología |
|---|---|
| Interfaz | React y React Router |
| Desarrollo y compilación | Vite |
| Mapas | Leaflet y OpenStreetMap |
| Estilos y animaciones | CSS |
| Backend | Node.js y Express |
| Base de datos | PostgreSQL en Neon |
| Autenticación | Better Auth |
| Control de versiones | Git y GitHub |

## Estructura

- `frontend/`: interfaz, componentes, estilos y recursos públicos.
- `backend/`: API, autenticación, scripts, pruebas y migraciones SQL.
- `docs/`: documentación técnica, decisiones y resultados de verificación.
- `AGENTS.md` y `CLAUDE.md`: instrucciones de trabajo para los asistentes de desarrollo.
- `LEEME.md`: documentación adicional del proyecto.

## Instalación y ejecución

### Requisitos

- Node.js 24 y npm.
- Una base PostgreSQL configurada con el esquema del proyecto.
- Variables de entorno propias.
- Conexión a internet para consultar Neon y cargar el mapa.

Clonar el repositorio:

```bash
git clone https://github.com/miguelcabrera0940-wq/museo-digital-iglesias.git
cd museo-digital-iglesias
```

Instalar las dependencias:

```bash
cd backend
npm ci
cd ../frontend
npm ci
```

### Configuración

Utilizar los archivos `.env.example` como referencia y configurar las conexiones y secretos propios en los archivos locales correspondientes.

Las credenciales reales no se incluyen en el repositorio. Clonar el proyecto no concede acceso a la base de datos ni a las cuentas de administración.

Para preparar una base nueva, consultar la documentación del backend y revisar las migraciones de `backend/sql/`. No ejecutar nuevamente las migraciones sobre una base que ya las tenga aplicadas.

### Backend

Desde la raíz del proyecto, en una terminal:

```bash
cd backend
npm start
```

El backend utiliza el puerto `3001` en la configuración local del proyecto.

### Frontend

Desde la raíz, en otra terminal:

```bash
cd frontend
VITE_USAR_MOCKS=false VITE_API_BASE=/api npm run dev -- --host localhost --port 5173 --strictPort
```

Abrir `http://localhost:5173`.

Ambos procesos deben permanecer activos durante el uso local.

## Roles

### Visitante

Puede explorar el contenido público sin iniciar sesión. Los materiales reservados muestran únicamente la información pública autorizada.

### Administrador parroquial

Gestiona los contenidos y operaciones permitidos de su iglesia. No tiene autorización para administrar otras iglesias ni gestionar cuentas de usuarios.

### Administrador general

Dispone de las funciones generales habilitadas por el sistema.

Las autorizaciones se comprueban en el backend; no dependen únicamente de ocultar botones en la interfaz.

## Pruebas

Ejecutar las pruebas del backend:

```bash
cd backend
npm test
```

Ejecutar las pruebas del frontend:

```bash
cd frontend
npm test
```

Compilar el frontend:

```bash
npm run build
```

Se realizaron comprobaciones de acceso público, autenticación y aislamiento entre las ocho cuentas parroquiales de prueba. Los resultados y las limitaciones de cada verificación se registran en `docs/TAREAS.md`.

La auditoría de dependencias mediante `npm audit` quedó pendiente por un error de resolución de red durante la revisión. No se presenta como aprobada.

## Contenido y fotografías

Los cuadernos son textos informativos redactados a partir de fuentes públicas. No representan transcripciones de libros históricos originales ni documentos emitidos por las parroquias.

Las fotografías conservan sus atribuciones y licencias. Los créditos pueden consultarse en `frontend/public/imagenes/creditos.html` y en los archivos de atribuciones correspondientes.

## Limitaciones

- La aplicación se ejecuta localmente; este repositorio no constituye un despliegue web.
- «Subir PDF» es una demostración: el archivo se visualiza localmente, no se envía al servidor ni crea un libro real.
- No se realizan reservas, pagos ni inscripciones.
- Algunos teléfonos, horarios, requisitos y fotografías interiores siguen pendientes de confirmación.
- La orientación sobre trámites no sustituye la información oficial de cada parroquia.
- La cantidad de objetos documentados varía entre iglesias.
- Las pruebas realizadas no garantizan la ausencia de vulnerabilidades.

Los secretos operativos se mantienen fuera del repositorio. Un respaldo cifrado del archivo de configuración es independiente del archivo `.env` que utiliza la aplicación.

## Desarrollo

El proyecto se desarrolló con apoyo de Claude Code y Codex, mediante instrucciones de trabajo, revisión de cambios y pruebas. Las decisiones de alcance y diseño fueron dirigidas por el alumno.
