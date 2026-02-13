-- migration_20260212_pedido_estado_pago_guardrails.sql
-- Objetivo:
-- 1) Forzar que todo nuevo pedido nazca con estado de pago "Pendiente".
-- 2) No interferir con la sincronizacion de estado por flujo de vouchers.

USE defaultdb;

SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- Resolver ID de "Pendiente" de forma robusta (por nombre)
SET @PENDIENTE_ID := (
  SELECT PK_ESP_Cod
  FROM T_Estado_Pago
  WHERE LOWER(ESP_Nombre) = LOWER('Pendiente')
  LIMIT 1
);

-- Fallback defensivo si no existe por nombre
SET @PENDIENTE_ID := IFNULL(@PENDIENTE_ID, 1);

-- Normalizar datos historicos (si existiera algun registro fuera de rango de negocio)
-- Nota: no se cambia logica de estados ya calculados por vouchers.
UPDATE T_Pedido
SET FK_ESP_Cod = @PENDIENTE_ID
WHERE FK_ESP_Cod IS NULL;

-- Trigger de alta: todo nuevo pedido inicia en Pendiente
DROP TRIGGER IF EXISTS trg_t_pedido_bi_estado_pago_pendiente;
DELIMITER $$
CREATE TRIGGER trg_t_pedido_bi_estado_pago_pendiente
BEFORE INSERT ON T_Pedido
FOR EACH ROW
BEGIN
  DECLARE v_pendiente_id INT;

  SELECT PK_ESP_Cod
    INTO v_pendiente_id
  FROM T_Estado_Pago
  WHERE LOWER(ESP_Nombre) = LOWER('Pendiente')
  LIMIT 1;

  SET NEW.FK_ESP_Cod = IFNULL(v_pendiente_id, 1);
END$$
DELIMITER ;

SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- Verificacion sugerida:
-- SHOW TRIGGERS LIKE 'T_Pedido';
-- INSERT INTO T_Pedido (...) VALUES (..., FK_ESP_Cod distinto ...);
-- SELECT FK_ESP_Cod FROM T_Pedido WHERE PK_P_Cod = LAST_INSERT_ID();
