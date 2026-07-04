# Data-Loading-and-Validation-System-with-Authentication

Aplicación full-stack para cargar archivos CSV, validar registros y administrar usuarios con autenticación.

## Requisitos previos

- Node.js 20+
- npm 10+
- PostgreSQL 16+
- Git

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Reto-tecnico
```

## 2. Instalar dependencias

### Frontend

```bash
cd frontend
npm install
```

### Backend

```bash
cd ../backend
npm install
```

## 3. Configuración de la base de datos

1. Crea una base de datos PostgreSQL, por ejemplo:

```bash
createdb reto_tecnico
```

2. Crea un archivo de entorno para el backend a partir del ejemplo:

```bash
cp .env.example .env
```

3. Ajusta las variables de entorno en [backend/.env.example](backend/.env.example) y copia el contenido a un archivo real llamado [backend/.env](backend/.env) con tu configuración local:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reto_tecnico
JWT_SECRET=supersecret
PORT=3000
DEFAULT_USER_PASSWORD=TempPassword123!
IMPORT_USER_PASSWORD=prueba123
```

4. Ejecuta las migraciones y el seed inicial:

```bash
npm run migrate
npm run db:seed
```

Si prefieres resetear todo el esquema, puedes ejecutar:

```bash
npm run db:reset
```

## 4. Ejecutar la aplicación

### Backend

Modo desarrollo:

```bash
cd backend
npm run dev
```

El servidor queda disponible en:

- http://localhost:3000

### Frontend

```bash
cd frontend
npm run dev
```

El frontend queda disponible en:

- http://localhost:5173

## 5. Ejecutar pruebas

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
npm test
```

## 6. Estructura general

- frontend: interfaz en React + Vite
- backend: API en Express + TypeScript
- backend/db: migraciones y scripts SQL de base de datos

## 7. Credenciales iniciales

El seed crea un usuario administrador inicial para probar la aplicación. Revisa [backend/db/seed.sql](backend/db/seed.sql) para confirmar los datos cargados.
