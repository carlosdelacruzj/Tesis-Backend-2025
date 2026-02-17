-- validation_20260216_rbac_post_migration.sql
-- Objetivo:
-- 1) Confirmar perfiles creados.
-- 2) Confirmar que Admin/Vendedor quedaron en T_UsuarioPerfil.
-- 3) Detectar empleados con login habilitado pero sin perfil.

USE defaultdb;
SET NAMES utf8mb4;

-- 1) Perfiles creados
SELECT
  p.PK_Perf_Cod,
  p.Per_Codigo,
  p.Per_Nombre,
  p.Per_Activo
FROM T_Perfil p
ORDER BY p.Per_Codigo;

-- 2) Usuarios mapeados por backfill (Admin / Ventas)
SELECT
  u.PK_U_Cod AS usuarioId,
  u.U_Correo AS correo,
  te.TiEm_Cargo AS tipoEmpleadoActual,
  p.Per_Codigo AS perfilCodigo,
  p.Per_Nombre AS perfilNombre,
  up.UP_Principal,
  up.UP_Activo
FROM T_UsuarioPerfil up
JOIN T_Usuario u
  ON u.PK_U_Cod = up.FK_U_Cod
JOIN T_Perfil p
  ON p.PK_Perf_Cod = up.FK_Perf_Cod
LEFT JOIN T_Empleados e
  ON e.FK_U_Cod = u.PK_U_Cod
LEFT JOIN T_Tipo_Empleado te
  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
WHERE p.Per_Codigo IN ('ADMIN', 'VENTAS')
ORDER BY p.Per_Codigo, u.PK_U_Cod;

-- 3) Empleados con login habilitado pero sin perfil asignado
SELECT
  u.PK_U_Cod AS usuarioId,
  u.U_Correo AS correo,
  e.PK_Em_Cod AS empleadoId,
  te.TiEm_Cargo AS tipoEmpleado,
  te.TiEm_PermiteLogin AS permiteLogin
FROM T_Empleados e
JOIN T_Usuario u
  ON u.PK_U_Cod = e.FK_U_Cod
JOIN T_Tipo_Empleado te
  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
LEFT JOIN T_UsuarioPerfil up
  ON up.FK_U_Cod = u.PK_U_Cod
  AND COALESCE(up.UP_Activo, 1) = 1
WHERE COALESCE(te.TiEm_PermiteLogin, 0) = 1
  AND up.PK_UPerf_Cod IS NULL
ORDER BY u.PK_U_Cod;

