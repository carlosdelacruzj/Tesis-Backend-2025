-- Portafolio por tipo de evento (T_Eventos)

ALTER TABLE `T_Eventos`
  ADD COLUMN `E_MostrarPortafolio` TINYINT(1) NOT NULL DEFAULT '1' AFTER `E_IconUrl`;

CREATE TABLE `T_PortafolioImagen` (
  `PK_PI_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_E_Cod` int NOT NULL,
  `PI_Url` varchar(500) NOT NULL,
  `PI_Titulo` varchar(120) DEFAULT NULL,
  `PI_Descripcion` varchar(255) DEFAULT NULL,
  `PI_Orden` int NOT NULL DEFAULT '0',
  `PI_Fecha_Creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_PI_Cod`),
  KEY `IX_Portafolio_Evento` (`FK_E_Cod`),
  KEY `IX_Portafolio_Orden` (`PI_Orden`),
  CONSTRAINT `FK_Portafolio_Evento` FOREIGN KEY (`FK_E_Cod`) REFERENCES `T_Eventos` (`PK_E_Cod`)
);
