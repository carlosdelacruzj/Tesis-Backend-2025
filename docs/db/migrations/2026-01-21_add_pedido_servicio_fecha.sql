-- Ajustes de Pedido: fecha como DATE, horas/mensaje y tabla de servicios por fecha

ALTER TABLE `T_Pedido`
  MODIFY COLUMN `P_FechaEvento` DATE NULL,
  ADD COLUMN `P_HorasEst` DECIMAL(4,1) NULL AFTER `P_FechaEvento`,
  MODIFY COLUMN `P_Dias` SMALLINT NULL AFTER `P_HorasEst`,
  ADD COLUMN `P_Mensaje` VARCHAR(500) NULL AFTER `P_ViaticosMonto`;

CREATE TABLE `T_PedidoServicioFecha` (
  `PK_PSF_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_P_Cod` int NOT NULL,
  `FK_PedServ_Cod` int NOT NULL,
  `PSF_Fecha` date NOT NULL,
  PRIMARY KEY (`PK_PSF_Cod`),
  UNIQUE KEY `UQ_PSF_Servicio_Fecha` (`FK_PedServ_Cod`,`PSF_Fecha`),
  KEY `IX_PSF_Pedido` (`FK_P_Cod`),
  KEY `IX_PSF_Fecha` (`PSF_Fecha`),
  CONSTRAINT `FK_PSF_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`),
  CONSTRAINT `FK_PSF_PedServ` FOREIGN KEY (`FK_PedServ_Cod`) REFERENCES `T_PedidoServicio` (`PK_PS_Cod`)
);
