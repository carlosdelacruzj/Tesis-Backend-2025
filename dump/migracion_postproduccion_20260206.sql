-- Migracion postproduccion proyecto - 2026-02-06
-- Agrega campos simples para pre-entrega, respaldo y entrega final.
-- Nota: no elimina campos existentes (revision multimedia/edicion).

ALTER TABLE T_Proyecto
  ADD COLUMN Pro_Pre_Entrega_Enlace varchar(255) DEFAULT NULL,
  ADD COLUMN Pro_Pre_Entrega_Tipo varchar(60) DEFAULT NULL,
  ADD COLUMN Pro_Pre_Entrega_Feedback varchar(255) DEFAULT NULL,
  ADD COLUMN Pro_Pre_Entrega_Fecha date DEFAULT NULL,
  ADD COLUMN Pro_Respaldo_Ubicacion varchar(255) DEFAULT NULL,
  ADD COLUMN Pro_Respaldo_Notas varchar(255) DEFAULT NULL,
  ADD COLUMN Pro_Entrega_Final_Enlace varchar(255) DEFAULT NULL,
  ADD COLUMN Pro_Entrega_Final_Fecha date DEFAULT NULL;
