-- 2026-01-27_project_day_model.sql
-- Proyecto por dias (no consecutivos) con servicios y recursos por dia
-- NOTA: Esta migracion crea nuevas tablas y elimina las deprecadas.

-- ==============================
-- 1) Tablas nuevas
-- ==============================

CREATE TABLE IF NOT EXISTS T_ProyectoDia (
  PK_PD_Cod INT NOT NULL AUTO_INCREMENT,
  FK_Pro_Cod INT NOT NULL,
  PD_Fecha DATE NOT NULL,
  PD_Hora TIME DEFAULT NULL,
  PD_Ubicacion VARCHAR(100) DEFAULT NULL,
  PD_Direccion VARCHAR(150) DEFAULT NULL,
  PD_Notas VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (PK_PD_Cod),
  UNIQUE KEY uq_proyecto_dia (FK_Pro_Cod, PD_Fecha),
  KEY ix_proyecto_dia_fecha (PD_Fecha),
  CONSTRAINT fk_proyecto_dia_proyecto
    FOREIGN KEY (FK_Pro_Cod) REFERENCES T_Proyecto (PK_Pro_Cod)
);

CREATE TABLE IF NOT EXISTS T_ProyectoDiaServicio (
  PK_PDS_Cod INT NOT NULL AUTO_INCREMENT,
  FK_PD_Cod INT NOT NULL,
  FK_PS_Cod INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (PK_PDS_Cod),
  UNIQUE KEY uq_pd_servicio (FK_PD_Cod, FK_PS_Cod),
  KEY ix_pd_servicio_serv (FK_PS_Cod),
  CONSTRAINT fk_pds_pd
    FOREIGN KEY (FK_PD_Cod) REFERENCES T_ProyectoDia (PK_PD_Cod) ON DELETE CASCADE,
  CONSTRAINT fk_pds_ps
    FOREIGN KEY (FK_PS_Cod) REFERENCES T_PedidoServicio (PK_PS_Cod) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS T_ProyectoDiaEmpleado (
  PK_PDE_Cod INT NOT NULL AUTO_INCREMENT,
  FK_PD_Cod INT NOT NULL,
  FK_Em_Cod INT NOT NULL,
  PDE_Estado VARCHAR(20) NOT NULL DEFAULT 'Confirmado',
  PDE_Notas VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (PK_PDE_Cod),
  UNIQUE KEY uq_pd_empleado (FK_PD_Cod, FK_Em_Cod),
  KEY ix_pde_empleado (FK_Em_Cod),
  CONSTRAINT fk_pde_pd
    FOREIGN KEY (FK_PD_Cod) REFERENCES T_ProyectoDia (PK_PD_Cod) ON DELETE CASCADE,
  CONSTRAINT fk_pde_empleado
    FOREIGN KEY (FK_Em_Cod) REFERENCES T_Empleados (PK_Em_Cod)
);

CREATE TABLE IF NOT EXISTS T_ProyectoDiaEquipo (
  PK_PDQ_Cod INT NOT NULL AUTO_INCREMENT,
  FK_PD_Cod INT NOT NULL,
  FK_Eq_Cod INT NOT NULL,
  PDQ_Estado VARCHAR(20) NOT NULL DEFAULT 'Confirmado',
  PDQ_Notas VARCHAR(255) DEFAULT NULL,
  PDQ_Devuelto TINYINT(1) NOT NULL DEFAULT 0,
  PDQ_Fecha_Devolucion DATETIME DEFAULT NULL,
  PDQ_Estado_Devolucion VARCHAR(20) DEFAULT NULL,
  PDQ_Notas_Devolucion VARCHAR(255) DEFAULT NULL,
  PDQ_Usuario_Devolucion INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (PK_PDQ_Cod),
  UNIQUE KEY uq_pd_equipo (FK_PD_Cod, FK_Eq_Cod),
  KEY ix_pdq_equipo (FK_Eq_Cod),
  KEY ix_pdq_devolucion_fecha (PDQ_Devuelto, PDQ_Fecha_Devolucion),
  CONSTRAINT fk_pdq_pd
    FOREIGN KEY (FK_PD_Cod) REFERENCES T_ProyectoDia (PK_PD_Cod) ON DELETE CASCADE,
  CONSTRAINT fk_pdq_equipo
    FOREIGN KEY (FK_Eq_Cod) REFERENCES T_Equipo (PK_Eq_Cod),
  CONSTRAINT fk_pdq_usuario_devolucion
    FOREIGN KEY (PDQ_Usuario_Devolucion) REFERENCES T_Usuario (PK_U_Cod)
);

-- ==============================
-- 2) SPs a eliminar (dependen de tablas deprecadas)
-- ==============================

DROP PROCEDURE IF EXISTS sp_proyecto_recurso_agregar;
DROP PROCEDURE IF EXISTS sp_proyecto_obtener;
DROP PROCEDURE IF EXISTS sp_proyecto_asignaciones;
DROP PROCEDURE IF EXISTS sp_proyecto_recursos_reset;
DROP PROCEDURE IF EXISTS sp_proyecto_disponibilidad;
DROP PROCEDURE IF EXISTS sp_equipo_inhabilitar;
DROP PROCEDURE IF EXISTS sp_equipo_proyectos_afectados;

-- ==============================
-- 3) Tablas deprecadas
-- ==============================

DROP TABLE IF EXISTS T_Proyecto_Recurso;
DROP TABLE IF EXISTS T_Empleado_Asignacion;
DROP TABLE IF EXISTS T_Equipo_Asignacion;
