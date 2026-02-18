-- Cotizaciones versionadas (alineado al estandar de contratos)
-- Fecha: 2026-02-18

CREATE TABLE IF NOT EXISTS `T_CotizacionVersion` (
  `PK_CotVer_Cod` INT NOT NULL AUTO_INCREMENT,
  `FK_Cot_Cod` INT NOT NULL,
  `CotVer_Version` INT NOT NULL DEFAULT 1,
  `CotVer_Estado` VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
  `CotVer_Snapshot` LONGTEXT NULL,
  `CotVer_SnapshotHash` CHAR(64) NULL,
  `CotVer_EsVigente` TINYINT(1) NOT NULL DEFAULT 1,
  `CotVer_Fecha_Crea` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `CotVer_Fecha_Cierre` DATETIME NULL,
  `CotVer_Pdf_Link` VARCHAR(255) NULL,
  PRIMARY KEY (`PK_CotVer_Cod`),
  UNIQUE KEY `UQ_T_CotizacionVersion_Cotizacion_Version` (`FK_Cot_Cod`, `CotVer_Version`),
  KEY `IX_T_CotizacionVersion_Cotizacion_Vigente` (`FK_Cot_Cod`, `CotVer_EsVigente`),
  CONSTRAINT `FK_T_CotizacionVersion_T_Cotizacion`
    FOREIGN KEY (`FK_Cot_Cod`) REFERENCES `T_Cotizacion` (`PK_Cot_Cod`)
);

-- Backfill inicial: crear v1 para cotizaciones ya existentes si no tienen historial.
-- Snapshot mínimo (cabecera). Luego el backend irá guardando snapshots completos.
INSERT INTO `T_CotizacionVersion` (
  `FK_Cot_Cod`,
  `CotVer_Version`,
  `CotVer_Estado`,
  `CotVer_Snapshot`,
  `CotVer_SnapshotHash`,
  `CotVer_EsVigente`,
  `CotVer_Fecha_Crea`,
  `CotVer_Fecha_Cierre`,
  `CotVer_Pdf_Link`
)
SELECT
  c.`PK_Cot_Cod` AS `FK_Cot_Cod`,
  1 AS `CotVer_Version`,
  CASE
    WHEN LOWER(TRIM(ec.`ECot_Nombre`)) IN ('aceptada', 'rechazada', 'expirada') THEN 'FINAL'
    ELSE 'BORRADOR'
  END AS `CotVer_Estado`,
  JSON_OBJECT(
    'cotizacion', JSON_OBJECT(
      'id', c.`PK_Cot_Cod`,
      'tipoEvento', c.`Cot_TipoEvento`,
      'idTipoEvento', c.`Cot_IdTipoEvento`,
      'fechaEvento', c.`Cot_FechaEvento`,
      'lugar', c.`Cot_Lugar`,
      'horasEstimadas', c.`Cot_HorasEst`,
      'dias', c.`Cot_Dias`,
      'viaticosMonto', c.`Cot_ViaticosMonto`,
      'mensaje', c.`Cot_Mensaje`,
      'fechaCreacion', c.`Cot_Fecha_Crea`
    )
  ) AS `CotVer_Snapshot`,
  SHA2(CONCAT('legacy-cot-', c.`PK_Cot_Cod`), 256) AS `CotVer_SnapshotHash`,
  1 AS `CotVer_EsVigente`,
  COALESCE(c.`Cot_Fecha_Crea`, NOW()) AS `CotVer_Fecha_Crea`,
  CASE
    WHEN LOWER(TRIM(ec.`ECot_Nombre`)) IN ('aceptada', 'rechazada', 'expirada')
      THEN COALESCE(c.`Cot_Fecha_Crea`, NOW())
    ELSE NULL
  END AS `CotVer_Fecha_Cierre`,
  NULL AS `CotVer_Pdf_Link`
FROM `T_Cotizacion` c
LEFT JOIN `T_Estado_Cotizacion` ec
  ON ec.`PK_ECot_Cod` = c.`FK_ECot_Cod`
WHERE NOT EXISTS (
  SELECT 1
  FROM `T_CotizacionVersion` cv
  WHERE cv.`FK_Cot_Cod` = c.`PK_Cot_Cod`
);
