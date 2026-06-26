# Backend endpoints status

Este documento registra el estado funcional actual de controladores, servicios, rutas y pruebas manuales del backend.

## Controladores implementados

| Modulo | Archivo | Metodos | Responsabilidad |
| --- | --- | --- | --- |
| `auth` | `src/modules/auth/auth.controller.ts` | `register`, `login` | Maneja las respuestas HTTP para registro y autenticacion de usuarios. |
| `roles` | `src/modules/roles/roles.controller.ts` | `getAll`, `getById`, `create`, `update`, `remove` | Expone CRUD de roles usando el controlador generico. |

## Controladores pendientes

| Modulo | Estado |
| --- | --- |
| `users`, `academic-profile`, `admin`, `grades`, `quizzies`, `dashboard`, `notifications`, `questions`, `subjects`, `resources`, `study-sessions`, `recommendations` | Archivos creados, sin implementacion funcional aun. |

## Servicios implementados

| Modulo | Archivo | Logica de negocio | Conexion con controlador |
| --- | --- | --- | --- |
| `auth` | `src/modules/auth/auth.service.ts` | Normaliza email, valida duplicados, asigna rol `student`, hashea password, valida credenciales, actualiza `lastLogin` y genera JWT. | Usado por `auth.controller.ts`. |
| `roles` | `src/modules/roles/roles.service.ts` | CRUD sobre `prisma.roles` con orden descendente por `createdAt`. | Usado por `roles.controller.ts`. |

## Rutas funcionales

Todas las rutas estan montadas bajo el prefijo global `/api`.

| Metodo | URL | Descripcion | Respuesta esperada |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Registra un usuario y asigna automaticamente el rol `student`. | `201` con usuario seguro y token JWT. |
| `POST` | `/api/auth/login` | Autentica usuario por email y password. | `200` con usuario seguro y token JWT. |
| `GET` | `/api/roles` | Lista roles. | `200` con arreglo de roles. |
| `GET` | `/api/roles/:id` | Obtiene un rol por UUID. | `200` con rol o `404` si no existe. |
| `POST` | `/api/roles` | Crea un rol. | `201` con rol creado. |
| `PUT` | `/api/roles/:id` | Actualiza un rol. | `200` con rol actualizado. |
| `DELETE` | `/api/roles/:id` | Elimina un rol. | `200` con confirmacion. |

## Bodies de referencia

### POST /api/auth/register

```json
{
  "firstName": "Ana",
  "lastName": "Lopez",
  "studentCode": "STU-001",
  "career": "Ingenieria de Software",
  "email": "ana.lopez@example.com",
  "password": "Password123"
}
```

### POST /api/auth/login

```json
{
  "email": "ana.lopez@example.com",
  "password": "Password123"
}
```

### POST /api/roles

```json
{
  "name": "teacher",
  "description": "Teacher role"
}
```

## Codigos HTTP a probar

| Caso | Codigo esperado |
| --- | --- |
| Registro valido | `201` |
| Registro con body invalido | `400` |
| Registro con email duplicado | `409` |
| Registro con student code duplicado | `409` |
| Registro sin rol `student` cargado | `500` |
| Login valido | `200` |
| Login con credenciales invalidas | `401` |
| Obtener rol inexistente | `404` |
| Parametro `id` no UUID en CRUD roles | `400` |
| Ruta inexistente | `404` |

## Preparacion para Postman

1. Configurar `.env` con `DATABASE_URL`, `ENCRYPTION_KEY`, `JWT_SECRET` y `PORT`.
2. Ejecutar migraciones si la base no esta creada: `pnpm db:deploy` o `pnpm db:migrate`.
3. Cargar roles base: `pnpm db:seed`.
4. Levantar API: `pnpm dev`.
5. Probar endpoints sobre `http://localhost:3000/api` o el puerto configurado.
