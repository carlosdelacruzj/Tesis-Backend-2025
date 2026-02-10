-- cleanup_dashboard_cotizaciones_operativas_20260209.sql
-- Objetivo:
-- 1) Redistribuir cotizaciones para demo operativa del dashboard:
--    - mayoria en febrero 2026
--    - pocas en marzo 2026
--    - pocas en abril 2026
-- 2) Evitar estado 'Aceptada' en cotizaciones (flujo manual desde frontend)
-- 3) Mantener consistencia de fechas en T_CotizacionEvento y T_CotizacionServicioFecha

SET NAMES utf8mb4;
SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

-- Resolver IDs de estado por nombre (no hardcodeados)
SET @EC_BORRADOR := (SELECT PK_ECot_Cod FROM T_Estado_Cotizacion WHERE ECot_Nombre = 'Borrador' LIMIT 1);
SET @EC_ENVIADA  := (SELECT PK_ECot_Cod FROM T_Estado_Cotizacion WHERE ECot_Nombre = 'Enviada' LIMIT 1);
SET @EC_RECHAZADA:= (SELECT PK_ECot_Cod FROM T_Estado_Cotizacion WHERE ECot_Nombre = 'Rechazada' LIMIT 1);
SET @EC_EXPIRADA := (SELECT PK_ECot_Cod FROM T_Estado_Cotizacion WHERE ECot_Nombre = 'Expirada' LIMIT 1);

DROP TEMPORARY TABLE IF EXISTS tmp_cot_dashboard;
CREATE TEMPORARY TABLE tmp_cot_dashboard (
  cotizacionId INT NOT NULL,
  rn INT NOT NULL,
  total INT NOT NULL,
  fechaEventoNueva DATE NOT NULL,
  estadoNuevoNombre VARCHAR(25) NOT NULL,
  PRIMARY KEY (cotizacionId)
);

INSERT INTO tmp_cot_dashboard (cotizacionId, rn, total, fechaEventoNueva, estadoNuevoNombre)
SELECT
  t.cotizacionId,
  t.rn,
  t.total,
  CASE
    -- ~80% en febrero
    WHEN t.rn <= FLOOR(t.total * 0.80)
      THEN DATE_ADD('2026-02-10', INTERVAL MOD(t.rn - 1, 19) DAY)
    -- ~13% en marzo
    WHEN t.rn <= FLOOR(t.total * 0.93)
      THEN DATE_ADD('2026-03-05', INTERVAL MOD(t.rn - 1, 20) DAY)
    -- resto en abril
    ELSE DATE_ADD('2026-04-05', INTERVAL MOD(t.rn - 1, 15) DAY)
  END AS fechaEventoNueva,
  CASE
    WHEN MOD(t.rn, 11) = 0 THEN 'Rechazada'
    WHEN MOD(t.rn, 13) = 0 THEN 'Expirada'
    WHEN MOD(t.rn, 2) = 0 THEN 'Enviada'
    ELSE 'Borrador'
  END AS estadoNuevoNombre
FROM (
  SELECT
    c.PK_Cot_Cod AS cotizacionId,
    ROW_NUMBER() OVER (ORDER BY c.PK_Cot_Cod) AS rn,
    COUNT(*) OVER () AS total
  FROM T_Cotizacion c
) t;

-- Actualizar cotizaciones: fechas + estado (sin 'Aceptada')
UPDATE T_Cotizacion c
JOIN tmp_cot_dashboard x ON x.cotizacionId = c.PK_Cot_Cod
SET
  c.Cot_FechaEvento = DATE(x.fechaEventoNueva),
  c.Cot_Fecha_Crea = DATE_SUB(
    TIMESTAMP(DATE(x.fechaEventoNueva), '10:00:00'),
    INTERVAL (2 + MOD(x.rn, 4)) DAY
  ),
  c.FK_ECot_Cod = CASE x.estadoNuevoNombre
    WHEN 'Borrador' THEN @EC_BORRADOR
    WHEN 'Enviada' THEN @EC_ENVIADA
    WHEN 'Rechazada' THEN @EC_RECHAZADA
    WHEN 'Expirada' THEN @EC_EXPIRADA
    ELSE @EC_BORRADOR
  END;

-- Alinear fechas de eventos de cotizacion (si hay varios eventos, los reparte en dias consecutivos)
DROP TEMPORARY TABLE IF EXISTS tmp_cot_evento_idx;
CREATE TEMPORARY TABLE tmp_cot_evento_idx (
  cotEventoId INT NOT NULL,
  cotizacionId INT NOT NULL,
  offsetDia INT NOT NULL,
  PRIMARY KEY (cotEventoId)
);

INSERT INTO tmp_cot_evento_idx (cotEventoId, cotizacionId, offsetDia)
SELECT
  ce.PK_CotE_Cod AS cotEventoId,
  ce.FK_Cot_Cod AS cotizacionId,
  ROW_NUMBER() OVER (PARTITION BY ce.FK_Cot_Cod ORDER BY ce.PK_CotE_Cod) - 1 AS offsetDia
FROM T_CotizacionEvento ce;

UPDATE T_CotizacionEvento ce
JOIN tmp_cot_evento_idx e ON e.cotEventoId = ce.PK_CotE_Cod
JOIN tmp_cot_dashboard x ON x.cotizacionId = e.cotizacionId
SET ce.CotE_Fecha = DATE_ADD(DATE(x.fechaEventoNueva), INTERVAL e.offsetDia DAY);

-- Alinear fechas de servicio de cotizacion al nuevo rango (evita duplicados por servicio+fecha)
DROP TEMPORARY TABLE IF EXISTS tmp_csf_idx;
CREATE TEMPORARY TABLE tmp_csf_idx (
  csfId INT NOT NULL,
  cotizacionId INT NOT NULL,
  offsetDia INT NOT NULL,
  PRIMARY KEY (csfId)
);

INSERT INTO tmp_csf_idx (csfId, cotizacionId, offsetDia)
SELECT
  csf.PK_CSF_Cod AS csfId,
  csf.FK_Cot_Cod AS cotizacionId,
  ROW_NUMBER() OVER (PARTITION BY csf.FK_CotServ_Cod ORDER BY csf.PK_CSF_Cod) - 1 AS offsetDia
FROM T_CotizacionServicioFecha csf;

UPDATE T_CotizacionServicioFecha csf
JOIN tmp_csf_idx idx ON idx.csfId = csf.PK_CSF_Cod
JOIN tmp_cot_dashboard x ON x.cotizacionId = idx.cotizacionId
SET csf.CSF_Fecha = DATE_ADD(DATE(x.fechaEventoNueva), INTERVAL idx.offsetDia DAY);

-- Verificacion 1: distribucion por estado
SELECT
  ec.ECot_Nombre AS estado,
  COUNT(*) AS total
FROM T_Cotizacion c
JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
GROUP BY ec.ECot_Nombre
ORDER BY total DESC, estado ASC;

-- Verificacion 2: distribucion por mes del evento
SELECT
  DATE_FORMAT(Cot_FechaEvento, '%Y-%m') AS mesEvento,
  COUNT(*) AS total
FROM T_Cotizacion
GROUP BY DATE_FORMAT(Cot_FechaEvento, '%Y-%m')
ORDER BY mesEvento;

-- Verificacion 3: muestra rapida
SELECT
  c.PK_Cot_Cod AS cotizacionId,
  ec.ECot_Nombre AS estado,
  DATE_FORMAT(c.Cot_Fecha_Crea, '%Y-%m-%d') AS fechaCrea,
  DATE_FORMAT(c.Cot_FechaEvento, '%Y-%m-%d') AS fechaEvento
FROM T_Cotizacion c
JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
ORDER BY c.PK_Cot_Cod ASC;

COMMIT;
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
