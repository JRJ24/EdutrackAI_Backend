# Backend endpoints status

Este documento registra el estado funcional actual de controladores, servicios, rutas y pruebas manuales del backend.

Ultima actualizacion: 2026-06-26 (cierre del plan de modulos CRUD minimo).

## Controladores implementados

| Modulo | Archivo | Metodos | Responsabilidad |
| --- | --- | --- | --- |
| `auth` | `src/modules/auth/auth.controller.ts` | `register`, `login` | Maneja las respuestas HTTP para registro y autenticacion de usuarios. |
| `roles` | `src/modules/roles/roles.controller.ts` | `getAll`, `getById`, `create`, `update`, `remove` | Expone CRUD de roles usando el controlador generico. |
| `users` | `src/modules/users/user.controller.ts` | `getAll`, `getById`, `getMe`, `create`, `update`, `remove`, `changePassword` | CRUD de usuarios con hasheo de password, `GET /me` y cambio de password propio. |
| `academic-profile` | `src/modules/academic-profile/academic-profile.controller.ts` | `getAll`, `getById`, `getByUser`, `create`, `update`, `remove` | CRUD de perfil academico. Valida usuario activo y un solo perfil por usuario. |
| `subjects` | `src/modules/subjects/subjects.controller.ts` | `getAll`, `getById`, `create`, `update`, `remove`, `getUsersBySubject`, `assignUser`, `updateUserAssignment`, `unassignUser` | CRUD de materias y endpoints de asignacion `UserSubject` anidados. |
| `grades` | `src/modules/grades/grades.controller.ts` | `getAll`, `getById`, `getBySubject`, `create`, `update`, `remove` | CRUD de calificaciones; registra `GradeChange` al cambiar el valor. |
| `study-sessions` | `src/modules/study-sessions/study-sessions.controller.ts` | `getAll`, `getById`, `getBySubject`, `create`, `update`, `remove` | CRUD de sesiones; calcula `durationMinutes` si no viene en body. |
| `quizzies` | `src/modules/quizzies/quizzies.controller.ts` | `getAll`, `getById`, `getBySubject`, `create`, `update`, `remove`, `startAttempt`, `submitAttemptAnswer`, `finishAttempt`, `getAttemptById`, `getAttemptsByUser` | CRUD de quizzes + flujo completo de intentos (start / answer / finish). |
| `questions` | `src/modules/questions/questions.controller.ts` | `getQuestionsByQuiz`, `getQuestionById`, `createQuestion`, `updateQuestion`, `removeQuestion`, `getOptionsByQuestion`, `createOption`, `updateOption`, `removeOption` | CRUD de preguntas y opciones. Oculta `isCorrect` a usuarios no admin. |
| `resources` | `src/modules/resources/resource.controller.ts` | `getAll`, `getById`, `getBySubject`, `create`, `update`, `remove` | CRUD de recursos academicos. |
| `recommendations` | `src/modules/recommendations/recommendations.controller.ts` | `getAll`, `getById`, `create`, `update`, `remove` | CRUD de recomendaciones; restringe al usuario dueno salvo admin. |
| `notifications` | `src/modules/notifications/notifications.controller.ts` | `getAll`, `getById`, `create`, `update`, `remove`, `markAsRead`, `markAllAsRead` | CRUD + acciones de lectura. |
| `dashboard` | `src/modules/dashboard/dashboard.controller.ts` | `getSummary`, `getPerformance`, `getStreak` | Solo lectura; agrega datos del usuario actual. |
| `admin` | `src/modules/admin/admin.controller.ts` | `listUsers`, `setUserActive`, `getStats`, `listAuditLogs` | Endpoints administrativos con `requireRole("admin")` y registro en `AuditLog`. |

## Middlewares nuevos

| Middleware | Archivo | Uso |
| --- | --- | --- |
| `requireAuth` | `src/middlewares/auth.middlewares.ts` | Valida JWT en `Authorization: Bearer ...`, expone `req.user`. |
| `requireRole(...roles)` | `src/middlewares/auth.middlewares.ts` | 403 si `req.user.role` no esta en la lista. |
| `optionalAuth` | `src/middlewares/auth-google.ts` | Stub de auth opcional para integracion futura con Google OAuth. |

## Helpers nuevos

| Helper | Archivo | Proposito |
| --- | --- | --- |
| `recordAudit(input)` | `src/helpers/audit.ts` | Inserta una fila en `AuditLog` con los datos del cambio. |

## Servicios implementados (resumen)

| Modulo | Archivo | Logica principal |
| --- | --- | --- |
| `auth` | `src/modules/auth/auth.service.ts` | Normaliza email, valida duplicados, asigna rol `student`, hashea password, valida credenciales, actualiza `lastLogin` y genera JWT. |
| `roles` | `src/modules/roles/roles.service.ts` | CRUD sobre `prisma.roles` con orden descendente por `createdAt`. |
| `users` | `src/modules/users/user.service.ts` | CRUD con `select` que excluye `password`, hashea password al crear/actualizar, valida unicidad y existencia de rol. |
| `academic-profile` | `src/modules/academic-profile/academic-profile.service.ts` | CRUD; valida usuario activo y un perfil por usuario. |
| `subjects` | `src/modules/subjects/subjects.service.ts` | CRUD de materias + endpoints `UserSubject` anidados. |
| `grades` | `src/modules/grades/grades.service.ts` | CRUD; registra `GradeChange` en transaccion cuando cambia `gradeValue`. |
| `study-sessions` | `src/modules/study-sessions/study-sessions.service.ts` | CRUD; calcula `durationMinutes` desde `startedAt`/`endedAt`. |
| `quizzies` | `src/modules/quizzies/quizzies.service.ts` | CRUD de quizzes + flujo de intentos (start, answer, finish con score recalculado). |
| `questions` | `src/modules/questions/questions.service.ts` | CRUD; oculta `isCorrect` salvo admin. |
| `resources` | `src/modules/resources/resource.service.ts` | CRUD con `createdBy` automatico desde el usuario autenticado. |
| `recommendations` | `src/modules/recommendations/recommendations.service.ts` | CRUD; valida FKs (user/subject/resource) y scoping por usuario. |
| `notifications` | `src/modules/notifications/notifications.service.ts` | CRUD + `markAsRead` + `markAllAsRead`. |
| `dashboard` | `src/modules/dashboard/dashboard.service.ts` | Agregaciones: resumen 7 dias, rendimiento por materia, racha de estudio. |
| `admin` | `src/modules/admin/admin.service.ts` | Listado paginado y filtros, activacion/desactivacion con `AuditLog`, estadisticas y lectura de logs. |

## Rutas funcionales

Todas las rutas estan montadas bajo el prefijo global `/api`.

### Auth

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | publico | Registra usuario y devuelve JWT. |
| `POST` | `/api/auth/login` | publico | Autentica usuario y devuelve JWT. |

### Roles

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | `requireAuth` | Lista roles. |
| `GET` | `/api/roles/:id` | `requireAuth` | Obtiene rol por UUID. |
| `POST` | `/api/roles` | `requireAuth` | Crea rol. |
| `PUT` | `/api/roles/:id` | `requireAuth` | Actualiza rol. |
| `DELETE` | `/api/roles/:id` | `requireAuth` | Elimina rol. |

### Users

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/users` | `requireAuth` | Lista usuarios (sin password). |
| `GET` | `/api/users/me` | `requireAuth` | Perfil del usuario autenticado. |
| `GET` | `/api/users/:id` | `requireAuth` | Obtiene usuario por UUID. |
| `POST` | `/api/users` | `requireAuth` | Crea usuario. |
| `PUT` | `/api/users/:id` | `requireAuth` | Actualiza usuario (hashea password si viene). |
| `DELETE` | `/api/users/:id` | `requireAuth` | Elimina usuario. |
| `PATCH` | `/api/users/me/password` | `requireAuth` | Cambia password del usuario autenticado. |

### Academic profile

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/academic-profile` | `requireAuth` | Lista perfiles. |
| `GET` | `/api/academic-profile/by-user/:userId` | `requireAuth` | Perfil de un usuario. |
| `GET` | `/api/academic-profile/:id` | `requireAuth` | Perfil por UUID. |
| `POST` | `/api/academic-profile` | `requireAuth` | Crea perfil (1 por usuario). |
| `PUT` | `/api/academic-profile/:id` | `requireAuth` | Actualiza perfil. |
| `DELETE` | `/api/academic-profile/:id` | `requireAuth` | Elimina perfil. |

### Subjects

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/subjects` | `requireAuth` | Lista materias. |
| `GET` | `/api/subjects/:id` | `requireAuth` | Materia por UUID. |
| `POST` | `/api/subjects` | `requireAuth` | Crea materia. |
| `PUT` | `/api/subjects/:id` | `requireAuth` | Actualiza materia. |
| `DELETE` | `/api/subjects/:id` | `requireAuth` | Elimina materia. |
| `GET` | `/api/subjects/:id/users` | `requireAuth` | Usuarios asignados a la materia. |
| `POST` | `/api/subjects/:id/users` | `requireAuth` | Asigna usuario a materia. |
| `PUT` | `/api/subjects/:id/users/:userId` | `requireAuth` | Actualiza la asignacion. |
| `DELETE` | `/api/subjects/:id/users/:userId` | `requireAuth` | Quita la asignacion. |

### Grades

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/grades` | `requireAuth` | Lista notas del usuario actual (admin ve todas). |
| `GET` | `/api/grades/by-subject/:subjectId` | `requireAuth` | Notas filtradas por materia. |
| `GET` | `/api/grades/:id` | `requireAuth` | Nota por UUID. |
| `POST` | `/api/grades` | `requireAuth` | Crea nota (exige `UserSubject` previo). |
| `PUT` | `/api/grades/:id` | `requireAuth` | Actualiza nota (registra `GradeChange` si cambia valor). |
| `DELETE` | `/api/grades/:id` | `requireAuth` | Elimina nota. |

### Study sessions

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/study-sessions` | `requireAuth` | Lista sesiones del usuario actual. |
| `GET` | `/api/study-sessions/by-subject/:subjectId` | `requireAuth` | Sesiones por materia. |
| `GET` | `/api/study-sessions/:id` | `requireAuth` | Sesion por UUID. |
| `POST` | `/api/study-sessions` | `requireAuth` | Crea sesion (calcula `durationMinutes` si falta). |
| `PUT` | `/api/study-sessions/:id` | `requireAuth` | Actualiza sesion. |
| `DELETE` | `/api/study-sessions/:id` | `requireAuth` | Elimina sesion. |

### Quizzies

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/quizzies` | `requireAuth` | Lista quizzes. |
| `GET` | `/api/quizzies/me/attempts` | `requireAuth` | Intentos del usuario actual. |
| `GET` | `/api/quizzies/by-subject/:subjectId` | `requireAuth` | Quizzes por materia. |
| `GET` | `/api/quizzies/:id` | `requireAuth` | Quiz por UUID. |
| `POST` | `/api/quizzies` | `requireRole("admin")` | Crea quiz. |
| `PUT` | `/api/quizzies/:id` | `requireRole("admin")` | Actualiza quiz. |
| `DELETE` | `/api/quizzies/:id` | `requireRole("admin")` | Elimina quiz. |
| `POST` | `/api/quizzies/:id/attempts` | `requireAuth` | Inicia intento (setea `startedAt`). |
| `GET` | `/api/quizzies/attempts/:id` | `requireAuth` | Detalle de intento (dueño o admin). |
| `POST` | `/api/quizzies/attempts/:id/answers` | `requireAuth` | Registra/actualiza respuesta del intento. |
| `POST` | `/api/quizzies/attempts/:id/finish` | `requireAuth` | Cierra intento: recalcula score y `correctAnswers`. |

### Questions

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/questions/by-quiz/:quizId` | `requireAuth` | Preguntas del quiz (sin `isCorrect` salvo admin). |
| `GET` | `/api/questions/:id` | `requireAuth` | Pregunta por UUID. |
| `POST` | `/api/questions` | `requireRole("admin")` | Crea pregunta. |
| `PUT` | `/api/questions/:id` | `requireRole("admin")` | Actualiza pregunta. |
| `DELETE` | `/api/questions/:id` | `requireRole("admin")` | Elimina pregunta. |
| `GET` | `/api/questions/:questionId/options` | `requireAuth` | Opciones de una pregunta (sin `isCorrect` salvo admin). |
| `POST` | `/api/questions/:questionId/options` | `requireRole("admin")` | Crea opcion. |
| `PUT` | `/api/questions/options/:id` | `requireRole("admin")` | Actualiza opcion. |
| `DELETE` | `/api/questions/options/:id` | `requireRole("admin")` | Elimina opcion. |

### Resources

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/resources` | `requireAuth` | Lista recursos. |
| `GET` | `/api/resources/by-subject/:subjectId` | `requireAuth` | Recursos por materia. |
| `GET` | `/api/resources/:id` | `requireAuth` | Recurso por UUID. |
| `POST` | `/api/resources` | `requireRole("admin")` | Crea recurso. |
| `PUT` | `/api/resources/:id` | `requireRole("admin")` | Actualiza recurso. |
| `DELETE` | `/api/resources/:id` | `requireRole("admin")` | Elimina recurso. |

### Recommendations

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/recommendations` | `requireAuth` | Lista recomendaciones (usuario autenticado; admin ve todas). |
| `GET` | `/api/recommendations/:id` | `requireAuth` | Recomendacion por UUID. |
| `POST` | `/api/recommendations` | `requireRole("admin")` | Crea recomendacion. |
| `PUT` | `/api/recommendations/:id` | `requireRole("admin")` | Actualiza recomendacion. |
| `DELETE` | `/api/recommendations/:id` | `requireRole("admin")` | Elimina recomendacion. |

### Notifications

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/notifications` | `requireAuth` | Lista notificaciones del usuario actual. |
| `POST` | `/api/notifications/mark-all-read` | `requireAuth` | Marca todas como leidas. |
| `GET` | `/api/notifications/:id` | `requireAuth` | Notificacion por UUID. |
| `PATCH` | `/api/notifications/:id/read` | `requireAuth` | Marca una como leida. |
| `POST` | `/api/notifications` | `requireRole("admin")` | Crea notificacion. |
| `PUT` | `/api/notifications/:id` | `requireRole("admin")` | Actualiza notificacion. |
| `DELETE` | `/api/notifications/:id` | `requireRole("admin")` | Elimina notificacion. |

### Dashboard

| Metodo | URL | Auth | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/summary` | `requireAuth` | Resumen del usuario (sesiones 7d, score promedio, no leidas). |
| `GET` | `/api/dashboard/performance` | `requireAuth` | Rendimiento por materia. |
| `GET` | `/api/dashboard/streak` | `requireAuth` | Racha actual, racha maxima y dias activos ultimos 30. |

### Admin

Todas requieren `requireRole("admin")`.

| Metodo | URL | Descripcion |
| --- | --- | --- |
| `GET` | `/api/admin/users` | Listado paginado con filtros `role`, `isActive`, `search`. |
| `PATCH` | `/api/admin/users/:id/active` | Activa/desactiva usuario; registra `AuditLog`. |
| `GET` | `/api/admin/stats` | Conteos por modelo. |
| `GET` | `/api/admin/audit-logs` | Lectura paginada de logs. |

## Codigos HTTP a probar (ejemplos clave)

| Caso | Codigo esperado |
| --- | --- |
| Acceso a modulo protegido sin token | `401` |
| Acceso a endpoint admin con rol `student` | `403` |
| Registro valido | `201` |
| Registro con email duplicado | `409` |
| Crear grade sin `UserSubject` previo | `400` |
| Crear quiz con subjectId inexistente | `404` |
| Crear pregunta/opcion sin ser admin | `403` |
| Iniciar intento en quiz inactivo | `404` |
| Responder intento ajeno | `403` |
| Finalizar intento ya finalizado | `400` |
| Marcar notificacion como leida (propia) | `200` |
| Marcar notificacion ajena | `403` |
| UUID invalido en params | `400` |
| Ruta inexistente | `404` |

## Observaciones preexistentes (no resueltas en esta fase)

El `npm run build` produce `dist/src/...` (no `dist/...`) por `rootDir: "."` en `tsconfig.json`, y `package.json` define `"start": "node ./dist/app.js"`, por lo que `npm start` falla con `MODULE_NOT_FOUND`. Es un issue de la Fase 1 del plan original (`#1 Configurar base ejecutable del backend`) que queda fuera del alcance del plan de modulos CRUD. Para correr el build actual:

```bash
node ./dist/src/app.js
```

## Preparacion para Postman

1. Configurar `.env` con `DATABASE_URL`, `ENCRYPTION_KEY`, `JWT_SECRET` y `PORT`.
2. Ejecutar migraciones si la base no esta creada: `pnpm db:deploy` o `pnpm db:migrate`.
3. Cargar roles base: `pnpm db:seed`.
4. Levantar API: `pnpm dev`.
5. Probar endpoints sobre `http://localhost:3000/api` o el puerto configurado.