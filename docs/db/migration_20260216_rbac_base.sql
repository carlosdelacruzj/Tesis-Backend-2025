-- migration_20260216_rbac_base.sql
-- Objetivo:
-- 1) Introducir RBAC minimo (perfiles) sin romper la logica actual.
-- 2) Mantener compatibilidad con T_Tipo_Empleado durante la transicion.

USE defaultdb;
SET NAMES utf8mb4;

-- =========================
-- 1) Tablas base RBAC minimo
-- =========================

CREATE TABLE IF NOT EXISTS `T_Perfil` (
  `PK_Perf_Cod` INT NOT NULL AUTO_INCREMENT,
  `Per_Codigo` VARCHAR(40) NOT NULL,
  `Per_Nombre` VARCHAR(80) NOT NULL,
  `Per_Descripcion` VARCHAR(255) NULL,
  `Per_Activo` TINYINT(1) NOT NULL DEFAULT 1,
  `Per_Fecha_Crea` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_Perf_Cod`),
  UNIQUE KEY `UQ_T_Perfil_Codigo` (`Per_Codigo`)
);

CREATE TABLE IF NOT EXISTS `T_UsuarioPerfil` (
  `PK_UPerf_Cod` INT NOT NULL AUTO_INCREMENT,
  `FK_U_Cod` INT NOT NULL,
  `FK_Perf_Cod` INT NOT NULL,
  `UP_Principal` TINYINT(1) NOT NULL DEFAULT 0,
  `UP_Activo` TINYINT(1) NOT NULL DEFAULT 1,
  `UP_Fecha_Crea` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_UPerf_Cod`),
  UNIQUE KEY `UQ_T_UsuarioPerfil_UsuarioPerfil` (`FK_U_Cod`, `FK_Perf_Cod`),
  KEY `IDX_T_UsuarioPerfil_Perfil` (`FK_Perf_Cod`),
  CONSTRAINT `FK_T_UsuarioPerfil_T_Usuario`
    FOREIGN KEY (`FK_U_Cod`) REFERENCES `T_Usuario` (`PK_U_Cod`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_T_UsuarioPerfil_T_Perfil`
    FOREIGN KEY (`FK_Perf_Cod`) REFERENCES `T_Perfil` (`PK_Perf_Cod`)
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- =========================
-- 2) Catalogo base de perfiles
-- =========================

INSERT INTO `T_Perfil` (`Per_Codigo`, `Per_Nombre`, `Per_Descripcion`, `Per_Activo`) VALUES
('ADMIN', 'Administrador', 'Acceso total al sistema', 1),
('VENTAS', 'Ventas', 'Gestion comercial: leads, clientes, cotizaciones y pedidos', 1),
('OPERACIONES', 'Operaciones', 'Gestion operativa: proyectos, agenda y recursos', 1)
ON DUPLICATE KEY UPDATE
  `Per_Nombre` = VALUES(`Per_Nombre`),
  `Per_Descripcion` = VALUES(`Per_Descripcion`),
  `Per_Activo` = VALUES(`Per_Activo`);

-- =========================
-- 3) Backfill inicial desde modelo actual (compatibilidad)
--    Admin/Vendedor de T_Tipo_Empleado -> T_UsuarioPerfil
-- =========================

INSERT INTO `T_UsuarioPerfil` (`FK_U_Cod`, `FK_Perf_Cod`, `UP_Principal`, `UP_Activo`)
SELECT DISTINCT
  e.FK_U_Cod,
  p.PK_Perf_Cod,
  1 AS UP_Principal,
  1 AS UP_Activo
FROM `T_Empleados` e
JOIN `T_Tipo_Empleado` te
  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
JOIN `T_Perfil` p
  ON p.Per_Codigo = CASE
    WHEN UPPER(TRIM(te.TiEm_Cargo)) = 'ADMIN' THEN 'ADMIN'
    WHEN UPPER(TRIM(te.TiEm_Cargo)) = 'VENDEDOR' THEN 'VENTAS'
    ELSE NULL
  END
WHERE UPPER(TRIM(te.TiEm_Cargo)) IN ('ADMIN', 'VENDEDOR')
ON DUPLICATE KEY UPDATE
  `UP_Principal` = VALUES(`UP_Principal`),
  `UP_Activo` = VALUES(`UP_Activo`);

-- Verificacion sugerida:
-- SELECT * FROM T_Perfil;
-- SELECT up.*, u.U_Correo, p.Per_Codigo
--   FROM T_UsuarioPerfil up
--   JOIN T_Usuario u ON u.PK_U_Cod = up.FK_U_Cod
--   JOIN T_Perfil p ON p.PK_Perf_Cod = up.FK_Perf_Cod
--  ORDER BY up.FK_U_Cod;
