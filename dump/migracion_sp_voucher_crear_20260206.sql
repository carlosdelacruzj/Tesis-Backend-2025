-- Migracion SP: sp_voucher_crear devuelve idVoucher
-- Fecha: 2026-02-06

DROP PROCEDURE IF EXISTS sp_voucher_crear;

DELIMITER ;;
CREATE PROCEDURE sp_voucher_crear(
  IN p_monto         DECIMAL(10,2),
  IN p_metodoPago    INT,
  IN p_estadoVoucher INT,
  IN p_imagen        LONGBLOB,
  IN p_idPedido      INT,
  IN p_fecha         DATETIME,
  IN p_mime          VARCHAR(100),
  IN p_nombre        VARCHAR(255),
  IN p_size          INT
)
BEGIN
  INSERT INTO T_Voucher(
    Pa_Monto_Depositado,
    FK_MP_Cod,
    FK_EV_Cod,
    Pa_Imagen_Voucher,
    FK_P_Cod,
    Pa_Fecha,
    Pa_Imagen_Mime,
    Pa_Imagen_NombreOriginal,
    Pa_Imagen_Size
  )
  VALUES (
    p_monto,
    p_metodoPago,
    p_estadoVoucher,
    p_imagen,
    p_idPedido,
    p_fecha,
    p_mime,
    p_nombre,
    p_size
  );

  SELECT LAST_INSERT_ID() AS idVoucher;
END;;
DELIMITER ;
