-- Fase 10: agregar razon social a clientes
-- Ejecuta este script una sola vez en la BD.

ALTER TABLE `T_Cliente`
  ADD COLUMN `Cli_RazonSocial` VARCHAR(150) DEFAULT NULL;
