-- Tabla para asignar servicios de cotizacion a fechas (dias reales)
CREATE TABLE "T_CotizacionServicioFecha" (
  "PK_CSF_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Cot_Cod" int NOT NULL,
  "FK_CotServ_Cod" int NOT NULL,
  "CSF_Fecha" date NOT NULL,
  PRIMARY KEY ("PK_CSF_Cod"),
  UNIQUE KEY "UQ_CSF_Servicio_Fecha" ("FK_CotServ_Cod","CSF_Fecha"),
  KEY "IX_CSF_Cot" ("FK_Cot_Cod"),
  KEY "IX_CSF_Fecha" ("CSF_Fecha"),
  CONSTRAINT "FK_CSF_Cot" FOREIGN KEY ("FK_Cot_Cod") REFERENCES "T_Cotizacion" ("PK_Cot_Cod"),
  CONSTRAINT "FK_CSF_CotServ" FOREIGN KEY ("FK_CotServ_Cod") REFERENCES "T_CotizacionServicio" ("PK_CotServ_Cod")
);
