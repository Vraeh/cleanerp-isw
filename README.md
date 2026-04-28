# CleanERP - Sistema de Gestión para Empresas de Aseo

## Proyecto integrador de Ingeniería de Software

Desarrollado por:
- Vicente Aedo Hidalgo
- Alanis Figueroa Luengo

## Requisitos

- Node.js v18 o superior
- PostgreSQL 14 o superior
- npm 9 o superior

## Instalación

### Backend

```bash
cd server
npm install
cp .env.example .env
# Editar .env con credenciales de PostgreSQL
npm run dev
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Variables de Entorno (server/.env)

```env
HOST=localhost
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DATABASE=cleanerp_db
JWT_SECRET=supercalifragilisticoespialidoso
```

## Cuentas de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| Administrador | admin@cleanerp.cl | demo1234 |
| Supervisor | supervisor@cleanerp.cl | demo1234 |
| Prevención | prevencion@cleanerp.cl | demo1234 |

## Estructura del Proyecto

```
cleanerp-isw/
├── client/    <- React + Vite + TypeScript
└── server/    <- Express + TypeORM + PostgreSQL
```

## Ramas

- `main` - Repositorio base (inicialización del repo y creación de modelo de datos)
- `entrega-1` - Primera entrega
- `entrega-2` - Segunda entrega
- `entrega-3` - Tercera entrega
