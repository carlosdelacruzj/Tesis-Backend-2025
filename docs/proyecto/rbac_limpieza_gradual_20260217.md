# RBAC Limpieza Gradual (2026-02-17)

## Estado actual

- `T_Perfil` y `T_UsuarioPerfil` activos.
- Login ya emite `perfiles` en JWT.
- Middleware por perfil aplicado en rutas criticas.
- `TiEm_PermiteLogin` se mantiene por compatibilidad.

## Decision de paso 6

1. `TiEm_PermiteLogin` queda **temporalmente como legado**.
2. `T_Tipo_Empleado` se mantiene para rol operativo (campo/capacidad/planificacion).
3. La autorizacion funcional ya no debe depender de `T_Tipo_Empleado`, sino de `T_UsuarioPerfil`.

## Checklist de estabilizacion

1. Verificar periodicamente usuarios con login pero sin perfil:
   - usar `docs/db/validation_20260216_rbac_post_migration.sql`.
2. Validar que cuentas `ADMIN` tengan al menos un reemplazo administrativo.
3. Forzar relogin de usuarios luego de despliegue para refrescar JWT con `perfiles`.
4. Auditar respuestas `403` por perfil durante la primera semana.

## Revision global de SPs (creacion/actualizacion)

Actualmente **no es obligatorio** cambiar SPs para operar RBAC minimo porque:

- la asignacion de perfiles se puede gestionar desde el nuevo CRUD de acceso (admin-only).
- el control de acceso se hace en API por `req.user.perfiles`.

Sin embargo, para evitar pasos manuales, se recomienda una fase 2:

1. `sp_empleado_crear`:
   - si el cargo creado es `Admin` o `Vendedor`, registrar automaticamente `T_UsuarioPerfil`.
2. `sp_empleado_actualizar` (si cambia cargo):
   - sincronizar asignacion de perfil cuando corresponda.
3. Mantener la sincronizacion en una sola capa (SP o API), no en ambas, para evitar drift.

## Criterio de retiro de legado

Retirar `TiEm_PermiteLogin` cuando se cumplan ambos:

1. Toda cuenta con acceso tenga perfil activo en `T_UsuarioPerfil`.
2. No existan rutas protegidas por reglas antiguas de tipo empleado.

