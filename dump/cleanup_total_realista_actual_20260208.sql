-- Limpieza total + seed actual (snapshot real de la BD)
-- Generado: 2026-02-08T05:10:49.907Z
-- Basado en el formato cleanup_total_realista_*

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

-- Limpieza de tablas
DELETE FROM `T_Cliente`;
DELETE FROM `T_Contrato`;
DELETE FROM `T_Cotizacion`;
DELETE FROM `T_CotizacionEvento`;
DELETE FROM `T_CotizacionServicio`;
DELETE FROM `T_CotizacionServicioFecha`;
DELETE FROM `T_Empleados`;
DELETE FROM `T_Equipo`;
DELETE FROM `T_Estado_Cliente`;
DELETE FROM `T_Estado_Cotizacion`;
DELETE FROM `T_Estado_Empleado`;
DELETE FROM `T_Estado_Equipo`;
DELETE FROM `T_Estado_Pago`;
DELETE FROM `T_Estado_Pedido`;
DELETE FROM `T_Estado_Proyecto`;
DELETE FROM `T_Estado_Proyecto_Dia`;
DELETE FROM `T_Estado_voucher`;
DELETE FROM `T_EventoServicio`;
DELETE FROM `T_EventoServicioCategoria`;
DELETE FROM `T_EventoServicioEquipo`;
DELETE FROM `T_EventoServicioEstado`;
DELETE FROM `T_EventoServicioStaff`;
DELETE FROM `T_Eventos`;
DELETE FROM `T_Lead`;
DELETE FROM `T_Marca`;
DELETE FROM `T_Metodo_Pago`;
DELETE FROM `T_Modelo`;
DELETE FROM `T_Pedido`;
DELETE FROM `T_PedidoEvento`;
DELETE FROM `T_PedidoServicio`;
DELETE FROM `T_PedidoServicioFecha`;
DELETE FROM `T_PortafolioImagen`;
DELETE FROM `T_Proyecto`;
DELETE FROM `T_ProyectoDia`;
DELETE FROM `T_ProyectoDiaBloque`;
DELETE FROM `T_ProyectoDiaEmpleado`;
DELETE FROM `T_ProyectoDiaEquipo`;
DELETE FROM `T_ProyectoDiaIncidencia`;
DELETE FROM `T_ProyectoDevolucionJob`;
DELETE FROM `T_ProyectoDiaServicio`;
DELETE FROM `T_Servicios`;
DELETE FROM `T_TipoDocumento`;
DELETE FROM `T_Tipo_Empleado`;
DELETE FROM `T_Tipo_Equipo`;
DELETE FROM `T_Usuario`;
DELETE FROM `T_Voucher`;

-- T_Cliente
INSERT INTO `T_Cliente` (`PK_Cli_Cod`, `FK_U_Cod`, `Cli_Tipo_Cliente`, `FK_ECli_Cod`, `Cli_RazonSocial`) VALUES
(1, 1, 1, 1, NULL),
(2, 4, 1, 1, NULL),
(3, 5, 1, 1, NULL),
(4, 6, 1, 1, NULL),
(5, 7, 1, 1, NULL),
(6, 8, 1, 1, NULL),
(7, 9, 1, 1, NULL),
(8, 10, 1, 1, NULL),
(9, 11, 1, 1, NULL),
(10, 12, 1, 1, NULL),
(11, 13, 1, 1, NULL),
(12, 14, 1, 1, NULL),
(13, 15, 1, 1, NULL),
(14, 16, 1, 1, NULL),
(15, 17, 1, 1, NULL),
(16, 18, 1, 1, NULL),
(17, 19, 1, 1, NULL),
(18, 20, 1, 1, NULL),
(19, 21, 1, 1, NULL),
(20, 22, 1, 1, NULL),
(21, 23, 1, 1, NULL),
(22, 24, 1, 1, NULL),
(23, 25, 1, 1, NULL),
(24, 26, 1, 1, NULL),
(25, 27, 1, 1, NULL),
(26, 28, 1, 1, NULL),
(27, 29, 1, 1, NULL),
(28, 30, 1, 1, NULL),
(29, 31, 1, 1, NULL),
(30, 32, 1, 1, NULL),
(31, 33, 1, 1, NULL);
ALTER TABLE `T_Cliente` AUTO_INCREMENT = 32;

-- T_Contrato
-- Sin datos

-- T_Cotizacion
INSERT INTO `T_Cotizacion` (`PK_Cot_Cod`, `FK_Lead_Cod`, `Cot_TipoEvento`, `Cot_FechaEvento`, `Cot_Lugar`, `Cot_HorasEst`, `Cot_Dias`, `Cot_Mensaje`, `Cot_Fecha_Crea`, `Cot_IdTipoEvento`, `FK_Cli_Cod`, `FK_ECot_Cod`, `Cot_ViaticosMonto`) VALUES
(1, NULL, 'Boda', '2025-12-10 00:00:00', 'Lima', '8.0', 1, 'Caso expirado por vigencia comercial. Viaticos no aplica.', '2025-11-01 10:00:00', 1, 1, 5, '0.00'),
(2, NULL, 'Cumpleanos', '2026-02-15 00:00:00', 'Arequipa', '5.0', 1, 'Cotizacion borrador. Viaticos aceptados.', '2026-01-15 09:30:00', 2, 2, 5, '450.00'),
(3, NULL, 'Corporativo', '2026-03-20 00:00:00', 'Lima', '6.0', 2, 'Cotizacion enviada. Trabajo en dos dias.', '2026-02-01 11:15:00', 3, 3, 3, '0.00'),
(4, NULL, 'Boda', '2026-02-15 00:00:00', 'Lima', '7.0', 1, 'Caso expirado por vigencia comercial. Viaticos no aplica.', '2025-10-01 10:00:00', 1, 1, 5, '0.00'),
(5, NULL, 'Corporativo', '2026-01-18 00:00:00', 'Piura', '5.0', 1, 'Caso expirado por vigencia operativa. Viaticos no aceptados.', '2025-12-01 09:00:00', 3, 1, 5, '0.00'),
(6, NULL, 'Cumpleanos', '2026-01-16 00:00:00', 'Arequipa', '4.0', 1, 'Caso urgente. Viaticos aceptados.', '2026-01-10 12:00:00', 2, 2, 5, '300.00'),
(7, NULL, 'Boda', '2026-03-01 00:00:00', 'Cusco', '8.0', 1, 'Caso vigente normal. Viaticos aceptados.', '2025-12-20 15:30:00', 1, 3, 3, '800.00');
ALTER TABLE `T_Cotizacion` AUTO_INCREMENT = 8;

-- T_CotizacionEvento
INSERT INTO `T_CotizacionEvento` (`PK_CotE_Cod`, `FK_Cot_Cod`, `CotE_Fecha`, `CotE_Hora`, `CotE_Ubicacion`, `CotE_Direccion`, `CotE_Notas`) VALUES
(1, 1, '2025-12-10 00:00:00', '18:00:00', 'Iglesia San Pedro', 'Av. Brasil 1234, Jesus Maria, Lima', 'Ceremonia'),
(2, 2, '2026-02-15 00:00:00', '19:30:00', 'Casa de la novia', 'Calle Mercaderes 245, Cercado, Arequipa', 'Sesion previa'),
(4, 4, '2026-02-15 00:00:00', '18:00:00', 'Recepcion Los Olivos', 'Av. Los Olivos 560, Los Olivos, Lima', 'Recepcion'),
(5, 5, '2026-01-18 00:00:00', '09:00:00', 'Hotel Costa Norte', 'Av. Grau 980, Piura', 'Sala principal'),
(6, 6, '2026-01-16 00:00:00', '19:30:00', 'Iglesia Santa Ana', 'Jr. San Martin 320, Cayma, Arequipa', 'Ceremonia'),
(13, 7, '2026-03-01 00:00:00', '14:00:00', 'Iglesia Catedral', 'Plaza de Armas S/N, Cusco', 'Ceremonia'),
(14, 7, '2026-03-01 00:00:00', '19:30:00', 'Recepcion Valle Sagrado', 'Av. El Sol 420, Cusco', 'Recepcion'),
(16, 3, '2026-03-20 00:00:00', '09:00:00', 'Centro de Convenciones San Isidro', 'Av. Javier Prado 1200, San Isidro, Lima', 'Conferencia dia 1'),
(17, 3, '2026-03-21 00:00:00', '09:30:00', 'Auditorio Empresarial San Isidro', 'Av. Rivera Navarrete 450, San Isidro, Lima', 'Conferencia dia 2');
ALTER TABLE `T_CotizacionEvento` AUTO_INCREMENT = 18;

-- T_CotizacionServicio
INSERT INTO `T_CotizacionServicio` (`PK_CotServ_Cod`, `FK_Cot_Cod`, `FK_ExS_Cod`, `CS_EventoId`, `CS_ServicioId`, `CS_Nombre`, `CS_Descripcion`, `CS_Moneda`, `CS_PrecioUnit`, `CS_Cantidad`, `CS_Descuento`, `CS_Recargo`, `CS_Notas`, `CS_Horas`, `CS_Staff`, `CS_FotosImpresas`, `CS_TrailerMin`, `CS_FilmMin`) VALUES
(1, 1, 1, 1, 1, 'Fotografia Boda Premium', 'Cobertura integral de boda con direccion de retratos y entrega digital.', 'USD', '1800.00', '1.00', '0.00', '0.00', 'Estado expirada', '10.0', 2, 60, 0, 0),
(2, 2, 8, 2, 1, 'Fotografia Cumple Express', 'Servicio simple y economico: un fotografo, cobertura corta y entrega digital.', 'USD', '900.00', '1.00', '0.00', '0.00', 'Estado borrador', '4.0', 1, 0, NULL, NULL),
(4, 4, 1, 1, 1, 'Fotografia Boda Premium', 'Cobertura integral de boda con direccion de retratos y entrega digital.', 'USD', '1800.00', '1.00', '0.00', '0.00', 'Regla 90 dias', '10.0', 2, 60, 0, 0),
(5, 5, 16, 3, 2, 'Video Corporativo Conferencia', 'Registro multicamara de conferencia con edicion de resumen.', 'USD', '3200.00', '1.00', '0.00', '0.00', 'Regla 7 dias', '6.0', 3, NULL, 2, 25),
(6, 6, 8, 2, 1, 'Fotografia Cumple Express', 'Servicio simple y economico: un fotografo, cobertura corta y entrega digital.', 'USD', '900.00', '1.00', '0.00', '0.00', 'Urgente', '4.0', 1, 0, NULL, NULL),
(13, 7, 3, 1, 2, 'Video Boda Ceremonia', 'Registro de ceremonia con highlight corto y audio limpio.', 'USD', '1100.00', '1.00', '0.00', '0.00', NULL, '4.0', 1, NULL, 1, 15),
(14, 7, 1, 1, 1, 'Fotografia Boda Premium', 'Cobertura integral de boda con direccion de retratos y entrega digital.', 'USD', '1800.00', '1.00', '0.00', '0.00', NULL, '10.0', 2, 60, 0, 0),
(16, 3, 15, 3, 1, 'Fotografia Corporativa Evento', 'Cobertura de conferencia o lanzamiento con enfoque editorial.', 'USD', '2300.00', '2.00', '0.00', '0.00', NULL, '6.0', 3, NULL, NULL, NULL),
(17, 3, 16, 3, 2, 'Video Corporativo Conferencia', 'Registro multicamara de conferencia con edicion de resumen.', 'USD', '3200.00', '2.00', '0.00', '0.00', NULL, '6.0', 3, NULL, 2, 25),
(18, 3, 18, 3, 3, 'Drone Corporativo Exterior', 'Tomas aereas de fachada, entorno y activos del cliente.', 'USD', '500.00', '1.00', '0.00', '0.00', NULL, '3.0', 1, NULL, NULL, NULL);
ALTER TABLE `T_CotizacionServicio` AUTO_INCREMENT = 19;

-- T_CotizacionServicioFecha
INSERT INTO `T_CotizacionServicioFecha` (`PK_CSF_Cod`, `FK_Cot_Cod`, `FK_CotServ_Cod`, `CSF_Fecha`) VALUES
(3, 7, 13, '2026-03-01 00:00:00'),
(4, 7, 14, '2026-03-01 00:00:00'),
(5, 3, 16, '2026-03-20 00:00:00'),
(6, 3, 16, '2026-03-21 00:00:00'),
(7, 3, 17, '2026-03-21 00:00:00'),
(8, 3, 17, '2026-03-20 00:00:00'),
(9, 3, 18, '2026-03-21 00:00:00');
ALTER TABLE `T_CotizacionServicioFecha` AUTO_INCREMENT = 10;

-- T_Empleados
INSERT INTO `T_Empleados` (`PK_Em_Cod`, `FK_U_Cod`, `Em_Autonomo`, `FK_Tipo_Emp_Cod`, `FK_Estado_Emp_Cod`) VALUES
(1, 2, 'NO', 7, 1),
(2, 34, 'NO', 4, 1),
(3, 35, 'NO', 4, 1),
(4, 36, 'NO', 3, 1),
(5, 37, 'NO', 3, 1),
(6, 38, 'NO', 1, 1),
(7, 39, 'NO', 2, 1),
(8, 40, 'NO', 5, 1),
(9, 41, 'NO', 6, 1),
(10, 42, 'NO', 1, 1),
(11, 43, 'NO', 2, 1),
(12, 44, 'NO', 5, 1),
(13, 45, 'NO', 6, 1),
(14, 46, 'NO', 1, 1),
(15, 47, 'NO', 2, 1),
(16, 48, 'NO', 5, 1),
(17, 49, 'NO', 6, 1),
(18, 50, 'NO', 1, 1),
(19, 51, 'NO', 2, 1),
(20, 52, 'NO', 5, 1),
(21, 53, 'NO', 6, 1),
(22, 54, 'NO', 1, 1),
(23, 55, 'NO', 2, 1),
(24, 56, 'NO', 5, 1),
(25, 57, 'NO', 6, 1),
(26, 58, 'NO', 1, 1),
(27, 59, 'NO', 2, 1),
(28, 60, 'NO', 5, 1),
(29, 61, 'NO', 6, 1),
(30, 62, 'NO', 1, 1),
(31, 63, 'NO', 2, 1);
ALTER TABLE `T_Empleados` AUTO_INCREMENT = 32;

-- T_Equipo
INSERT INTO `T_Equipo` (`PK_Eq_Cod`, `Eq_Fecha_Ingreso`, `FK_IMo_Cod`, `FK_EE_Cod`, `Eq_Serie`) VALUES
(1, '2025-01-01 00:00:00', 1, 1, 'CAM-EOSR6MARKI-001'),
(2, '2025-01-01 00:00:00', 1, 1, 'CAM-EOSR6MARKI-002'),
(3, '2025-01-01 00:00:00', 1, 1, 'CAM-EOSR6MARKI-003'),
(4, '2025-01-01 00:00:00', 2, 1, 'CAM-EOSR5-001'),
(5, '2025-01-01 00:00:00', 2, 1, 'CAM-EOSR5-002'),
(6, '2025-01-01 00:00:00', 2, 1, 'CAM-EOSR5-003'),
(7, '2025-01-01 00:00:00', 3, 1, 'CAM-ALPHA7IVA7-001'),
(8, '2025-01-01 00:00:00', 3, 1, 'CAM-ALPHA7IVA7-002'),
(9, '2025-01-01 00:00:00', 3, 1, 'CAM-ALPHA7IVA7-003'),
(10, '2025-01-01 00:00:00', 4, 1, 'CAM-Z6II-001'),
(11, '2025-01-01 00:00:00', 4, 1, 'CAM-Z6II-002'),
(12, '2025-01-01 00:00:00', 4, 1, 'CAM-Z6II-003'),
(13, '2025-01-01 00:00:00', 5, 1, 'CAM-XT5-001'),
(14, '2025-01-01 00:00:00', 5, 1, 'CAM-XT5-002'),
(15, '2025-01-01 00:00:00', 5, 1, 'CAM-XT5-003'),
(16, '2025-01-01 00:00:00', 6, 1, 'LEN-RF2470MMF2-001'),
(17, '2025-01-01 00:00:00', 6, 1, 'LEN-RF2470MMF2-002'),
(18, '2025-01-01 00:00:00', 6, 1, 'LEN-RF2470MMF2-003'),
(19, '2025-01-01 00:00:00', 7, 1, 'LEN-RF70200MMF-001'),
(20, '2025-01-01 00:00:00', 7, 1, 'LEN-RF70200MMF-002'),
(21, '2025-01-01 00:00:00', 7, 1, 'LEN-RF70200MMF-003'),
(22, '2025-01-01 00:00:00', 8, 1, 'LEN-FE35MMF18-001'),
(23, '2025-01-01 00:00:00', 8, 1, 'LEN-FE35MMF18-002'),
(24, '2025-01-01 00:00:00', 8, 1, 'LEN-FE35MMF18-003'),
(25, '2025-01-01 00:00:00', 9, 1, 'LEN-FE85MMF18-001'),
(26, '2025-01-01 00:00:00', 9, 1, 'LEN-FE85MMF18-002'),
(27, '2025-01-01 00:00:00', 9, 1, 'LEN-FE85MMF18-003'),
(28, '2025-01-01 00:00:00', 10, 1, 'LEN-NIKKORZ247-001'),
(29, '2025-01-01 00:00:00', 10, 1, 'LEN-NIKKORZ247-002'),
(30, '2025-01-01 00:00:00', 10, 1, 'LEN-NIKKORZ247-003'),
(31, '2025-01-01 00:00:00', 11, 1, 'LEN-XF56MMF12R-001'),
(32, '2025-01-01 00:00:00', 11, 1, 'LEN-XF56MMF12R-002'),
(33, '2025-01-01 00:00:00', 11, 1, 'LEN-XF56MMF12R-003'),
(34, '2025-01-01 00:00:00', 12, 1, 'LEN-SIGMA2470M-001'),
(35, '2025-01-01 00:00:00', 12, 1, 'LEN-SIGMA2470M-002'),
(36, '2025-01-01 00:00:00', 12, 1, 'LEN-SIGMA2470M-003'),
(37, '2025-01-01 00:00:00', 13, 1, 'LEN-TAMRON2875-001'),
(38, '2025-01-01 00:00:00', 13, 1, 'LEN-TAMRON2875-002'),
(39, '2025-01-01 00:00:00', 13, 1, 'LEN-TAMRON2875-003'),
(40, '2025-01-01 00:00:00', 14, 1, 'DRN-MAVIC3CLAS-001'),
(41, '2025-01-01 00:00:00', 14, 1, 'DRN-MAVIC3CLAS-002'),
(42, '2025-01-01 00:00:00', 14, 1, 'DRN-MAVIC3CLAS-003'),
(43, '2025-01-01 00:00:00', 15, 1, 'DRN-MINI4PRO-001'),
(44, '2025-01-01 00:00:00', 15, 1, 'DRN-MINI4PRO-002'),
(45, '2025-01-01 00:00:00', 15, 1, 'DRN-MINI4PRO-003'),
(46, '2025-01-01 00:00:00', 16, 1, 'GMB-RS3PRO-001'),
(47, '2025-01-01 00:00:00', 16, 1, 'GMB-RS3PRO-002'),
(48, '2025-01-01 00:00:00', 16, 1, 'GMB-RS3PRO-003'),
(49, '2025-01-01 00:00:00', 17, 1, 'FLH-AD200PRO-001'),
(50, '2025-01-01 00:00:00', 17, 1, 'FLH-AD200PRO-002'),
(51, '2025-01-01 00:00:00', 17, 1, 'FLH-AD200PRO-003'),
(52, '2025-01-01 00:00:00', 18, 1, 'LUZ-SL60WII-001'),
(53, '2025-01-01 00:00:00', 18, 1, 'LUZ-SL60WII-002'),
(54, '2025-01-01 00:00:00', 18, 1, 'LUZ-SL60WII-003'),
(55, '2025-01-01 00:00:00', 19, 1, 'TRI-190XPROALU-001'),
(56, '2025-01-01 00:00:00', 19, 1, 'TRI-190XPROALU-002'),
(57, '2025-01-01 00:00:00', 19, 1, 'TRI-190XPROALU-003'),
(58, '2025-01-01 00:00:00', 20, 1, 'REC-H1NHANDYRE-001'),
(59, '2025-01-01 00:00:00', 20, 1, 'REC-H1NHANDYRE-002'),
(60, '2025-01-01 00:00:00', 20, 1, 'REC-H1NHANDYRE-003'),
(61, '2025-01-01 00:00:00', 21, 1, 'MIC-EW112PG4-001'),
(62, '2025-01-01 00:00:00', 21, 1, 'MIC-EW112PG4-002'),
(63, '2025-01-01 00:00:00', 21, 1, 'MIC-EW112PG4-003'),
(64, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-001'),
(65, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-002'),
(66, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-003'),
(67, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-004'),
(68, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-005'),
(69, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-006'),
(70, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-007'),
(71, '2025-01-01 00:00:00', 22, 1, 'BAT-MINI4PROIN-008'),
(72, '2025-01-01 00:00:00', 23, 1, 'GOP-GOPROV5720-001'),
(73, '2025-01-01 00:00:00', 23, 1, 'GOP-GOPROV5720-002'),
(74, '2025-01-01 00:00:00', 23, 1, 'GOP-GOPROV5720-003'),
(75, '2025-01-01 00:00:00', 24, 1, 'CAM-A7SIII-001'),
(76, '2025-01-01 00:00:00', 24, 1, 'CAM-A7SIII-002'),
(77, '2025-01-01 00:00:00', 24, 1, 'CAM-A7SIII-003'),
(78, '2025-01-01 00:00:00', 25, 1, 'CAM-LUMIXS5II-001'),
(79, '2025-01-01 00:00:00', 25, 1, 'CAM-LUMIXS5II-002'),
(80, '2025-01-01 00:00:00', 25, 1, 'CAM-LUMIXS5II-003'),
(81, '2025-01-01 00:00:00', 26, 1, 'CAM-SL2S-001'),
(82, '2025-01-01 00:00:00', 26, 1, 'CAM-SL2S-002'),
(83, '2025-01-01 00:00:00', 26, 1, 'CAM-SL2S-003'),
(84, '2025-01-01 00:00:00', 27, 1, 'CAM-POCKETCINE-001'),
(85, '2025-01-01 00:00:00', 27, 1, 'CAM-POCKETCINE-002'),
(86, '2025-01-01 00:00:00', 27, 1, 'CAM-POCKETCINE-003'),
(87, '2025-01-01 00:00:00', 28, 1, 'LEN-RF50MMF12L-001'),
(88, '2025-01-01 00:00:00', 28, 1, 'LEN-RF50MMF12L-002'),
(89, '2025-01-01 00:00:00', 28, 1, 'LEN-RF50MMF12L-003'),
(90, '2025-01-01 00:00:00', 29, 1, 'LEN-FE2470MMF2-001'),
(91, '2025-01-01 00:00:00', 29, 1, 'LEN-FE2470MMF2-002'),
(92, '2025-01-01 00:00:00', 29, 1, 'LEN-FE2470MMF2-003'),
(93, '2025-01-01 00:00:00', 30, 1, 'LEN-Z70200MMF2-001'),
(94, '2025-01-01 00:00:00', 30, 1, 'LEN-Z70200MMF2-002'),
(95, '2025-01-01 00:00:00', 30, 1, 'LEN-Z70200MMF2-003'),
(96, '2025-01-01 00:00:00', 31, 1, 'LEN-XF1655MMF2-001'),
(97, '2025-01-01 00:00:00', 31, 1, 'LEN-XF1655MMF2-002'),
(98, '2025-01-01 00:00:00', 31, 1, 'LEN-XF1655MMF2-003'),
(105, '2025-01-01 00:00:00', 34, 1, 'DRN-AIR3-001'),
(106, '2025-01-01 00:00:00', 34, 1, 'DRN-AIR3-002'),
(107, '2025-01-01 00:00:00', 34, 1, 'DRN-AIR3-003'),
(108, '2025-01-01 00:00:00', 35, 1, 'DRN-INSPIRE3-001'),
(109, '2025-01-01 00:00:00', 35, 1, 'DRN-INSPIRE3-002'),
(110, '2025-01-01 00:00:00', 35, 1, 'DRN-INSPIRE3-003'),
(111, '2025-01-01 00:00:00', 36, 1, 'FLH-V1-001'),
(112, '2025-01-01 00:00:00', 36, 1, 'FLH-V1-002'),
(113, '2025-01-01 00:00:00', 36, 1, 'FLH-V1-003'),
(114, '2025-01-01 00:00:00', 37, 1, 'FLH-AD300PRO-001'),
(115, '2025-01-01 00:00:00', 37, 1, 'FLH-AD300PRO-002'),
(116, '2025-01-01 00:00:00', 37, 1, 'FLH-AD300PRO-003'),
(117, '2025-01-01 00:00:00', 38, 1, 'LUZ-LS60X-001'),
(118, '2025-01-01 00:00:00', 38, 1, 'LUZ-LS60X-002'),
(119, '2025-01-01 00:00:00', 38, 1, 'LUZ-LS60X-003'),
(120, '2025-01-01 00:00:00', 39, 1, 'LUZ-FORZA60B-001'),
(121, '2025-01-01 00:00:00', 39, 1, 'LUZ-FORZA60B-002'),
(122, '2025-01-01 00:00:00', 39, 1, 'LUZ-FORZA60B-003'),
(123, '2025-01-01 00:00:00', 40, 1, 'GMB-CRANE3S-001'),
(124, '2025-01-01 00:00:00', 40, 1, 'GMB-CRANE3S-002'),
(125, '2025-01-01 00:00:00', 40, 1, 'GMB-CRANE3S-003'),
(126, '2025-01-01 00:00:00', 41, 1, 'REC-H6-001'),
(127, '2025-01-01 00:00:00', 41, 1, 'REC-H6-002'),
(128, '2025-01-01 00:00:00', 41, 1, 'REC-H6-003'),
(129, '2025-01-01 00:00:00', 42, 1, 'MIC-WIRELESSGO-001'),
(130, '2025-01-01 00:00:00', 42, 1, 'MIC-WIRELESSGO-002'),
(131, '2025-01-01 00:00:00', 42, 1, 'MIC-WIRELESSGO-003'),
(132, '2025-01-01 00:00:00', 43, 1, 'MIC-AT2020-001'),
(133, '2025-01-01 00:00:00', 43, 1, 'MIC-AT2020-002'),
(134, '2025-01-01 00:00:00', 43, 1, 'MIC-AT2020-003'),
(135, '2025-01-01 00:00:00', 44, 1, 'MIC-MKH416-001'),
(136, '2025-01-01 00:00:00', 44, 1, 'MIC-MKH416-002'),
(137, '2025-01-01 00:00:00', 44, 1, 'MIC-MKH416-003'),
(138, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-001'),
(139, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-002'),
(140, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-003'),
(141, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-004'),
(142, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-005'),
(143, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-006'),
(144, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-007'),
(145, '2025-01-01 00:00:00', 45, 1, 'BAT-NPFZ100-008'),
(146, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-001'),
(147, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-002'),
(148, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-003'),
(149, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-004'),
(150, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-005'),
(151, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-006'),
(152, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-007'),
(153, '2025-01-01 00:00:00', 46, 1, 'BAT-LPE6NH-008'),
(154, '2025-01-01 00:00:00', 47, 1, 'GOP-HERO12BLAC-001'),
(155, '2025-01-01 00:00:00', 47, 1, 'GOP-HERO12BLAC-002'),
(156, '2025-01-01 00:00:00', 47, 1, 'GOP-HERO12BLAC-003'),
(157, '2025-01-01 00:00:00', 48, 1, 'MNP-XPROMONOPO-001'),
(158, '2025-01-01 00:00:00', 48, 1, 'MNP-XPROMONOPO-002'),
(159, '2025-01-01 00:00:00', 48, 1, 'MNP-XPROMONOPO-003'),
(160, '2025-01-01 00:00:00', 49, 1, 'SLD-K360CMSLID-001'),
(161, '2025-01-01 00:00:00', 49, 1, 'SLD-K360CMSLID-002'),
(162, '2025-01-01 00:00:00', 49, 1, 'SLD-K360CMSLID-003'),
(163, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-001'),
(164, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-002'),
(165, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-003'),
(166, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-004'),
(167, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-005'),
(168, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-006'),
(169, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-007'),
(170, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-008'),
(171, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-009'),
(172, '2025-01-01 00:00:00', 50, 1, 'SD-EXTREMEPRO-010'),
(173, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-001'),
(174, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-002'),
(175, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-003'),
(176, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-004'),
(177, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-005'),
(178, '2025-01-01 00:00:00', 51, 1, 'SSD-T71TB-006'),
(179, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-001'),
(180, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-002'),
(181, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-003'),
(182, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-004'),
(183, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-005'),
(184, '2025-01-01 00:00:00', 52, 1, 'SSD-MYPASSPORT-006'),
(185, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-001'),
(186, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-002'),
(187, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-003'),
(188, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-004'),
(189, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-005'),
(190, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-006'),
(191, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-007'),
(192, '2025-01-01 00:00:00', 53, 1, 'BAT-ENEL15C-008'),
(193, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-001'),
(194, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-002'),
(195, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-003'),
(196, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-004'),
(197, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-005'),
(198, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-006'),
(199, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-007'),
(200, '2025-01-01 00:00:00', 54, 1, 'BAT-NPW235-008'),
(201, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-001'),
(202, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-002'),
(203, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-003'),
(204, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-004'),
(205, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-005'),
(206, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-006'),
(207, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-007'),
(208, '2025-01-01 00:00:00', 55, 1, 'BAT-DMWBLK22-008'),
(209, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-001'),
(210, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-002'),
(211, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-003'),
(212, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-004'),
(213, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-005'),
(214, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-006'),
(215, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-007'),
(216, '2025-01-01 00:00:00', 56, 1, 'BAT-BPSCL4-008'),
(217, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-001'),
(218, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-002'),
(219, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-003'),
(220, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-004'),
(221, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-005'),
(222, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-006'),
(223, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-007'),
(224, '2025-01-01 00:00:00', 57, 1, 'BAT-NPF570-008'),
(225, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-001'),
(226, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-002'),
(227, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-003'),
(228, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-004'),
(229, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-005'),
(230, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-006'),
(231, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-007'),
(232, '2025-01-01 00:00:00', 58, 1, 'BAT-MAVIC3INTE-008'),
(233, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-001'),
(234, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-002'),
(235, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-003'),
(236, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-004'),
(237, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-005'),
(238, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-006'),
(239, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-007'),
(240, '2025-01-01 00:00:00', 59, 1, 'BAT-AIR3INTELL-008'),
(241, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-001'),
(242, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-002'),
(243, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-003'),
(244, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-004'),
(245, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-005'),
(246, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-006'),
(247, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-007'),
(248, '2025-01-01 00:00:00', 60, 1, 'BAT-INSPIRE3TB-008'),
(249, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-001'),
(250, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-002'),
(251, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-003'),
(252, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-004'),
(253, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-005'),
(254, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-006'),
(255, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-007'),
(256, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-008'),
(257, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-001'),
(258, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-002'),
(259, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-003'),
(260, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-004'),
(261, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-005'),
(262, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-006'),
(263, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-007'),
(264, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-008'),
(265, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-009'),
(266, '2025-01-01 00:00:00', 1, 1, 'CAM-ECO-R6M2-010'),
(267, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-001'),
(268, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-002'),
(269, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-003'),
(270, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-004'),
(271, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-005'),
(272, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-006'),
(273, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-007'),
(274, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-008'),
(275, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-009'),
(276, '2025-01-01 00:00:00', 6, 1, 'LEN-ECO-RF2470-010'),
(277, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-001'),
(278, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-002'),
(279, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-003'),
(280, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-004'),
(281, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-005'),
(282, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-006'),
(283, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-007'),
(284, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-008'),
(285, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-009'),
(286, '2025-01-01 00:00:00', 14, 1, 'DRN-ECO-M3CL-010'),
(287, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-001'),
(288, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-002'),
(289, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-003'),
(290, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-004'),
(291, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-005'),
(292, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-006'),
(293, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-007'),
(294, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-008'),
(295, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-009'),
(296, '2025-01-01 00:00:00', 17, 1, 'FLS-ECO-AD200-010'),
(297, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-001'),
(298, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-002'),
(299, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-003'),
(300, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-004'),
(301, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-005'),
(302, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-006'),
(303, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-007'),
(304, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-008'),
(305, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-009'),
(306, '2025-01-01 00:00:00', 19, 1, 'TRI-ECO-190X-010'),
(307, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-001'),
(308, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-002'),
(309, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-003'),
(310, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-004'),
(311, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-005'),
(312, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-006'),
(313, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-007'),
(314, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-008'),
(315, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-009'),
(316, '2025-01-01 00:00:00', 16, 1, 'GMB-ECO-RS3P-010'),
(317, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-001'),
(318, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-002'),
(319, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-003'),
(320, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-004'),
(321, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-005'),
(322, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-006'),
(323, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-007'),
(324, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-008'),
(325, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-009'),
(326, '2025-01-01 00:00:00', 20, 1, 'REC-ECO-H1N-010'),
(327, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-001'),
(328, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-002'),
(329, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-003'),
(330, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-004'),
(331, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-005'),
(332, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-006'),
(333, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-007'),
(334, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-008'),
(335, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-009'),
(336, '2025-01-01 00:00:00', 21, 1, 'MIC-ECO-EW112-010'),
(337, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-001'),
(338, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-002'),
(339, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-003'),
(340, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-004'),
(341, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-005'),
(342, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-006'),
(343, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-007'),
(344, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-008'),
(345, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-009'),
(346, '2025-01-01 00:00:00', 18, 1, 'LUZ-ECO-SL60-010'),
(347, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-001'),
(348, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-002'),
(349, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-003'),
(350, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-004'),
(351, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-005'),
(352, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-006'),
(353, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-007'),
(354, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-008'),
(355, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-009'),
(356, '2025-01-01 00:00:00', 46, 1, 'BAT-ECO-LPE6-010'),
(357, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-001'),
(358, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-002'),
(359, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-003'),
(360, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-004'),
(361, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-005'),
(362, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-006'),
(363, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-007'),
(364, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-008'),
(365, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-009'),
(366, '2025-01-01 00:00:00', 47, 1, 'GOP-ECO-H12-010'),
(367, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-001'),
(368, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-002'),
(369, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-003'),
(370, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-004'),
(371, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-005'),
(372, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-006'),
(373, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-007'),
(374, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-008'),
(375, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-009'),
(376, '2025-01-01 00:00:00', 48, 1, 'MNP-ECO-XPRO-010'),
(377, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-001'),
(378, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-002'),
(379, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-003'),
(380, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-004'),
(381, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-005'),
(382, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-006'),
(383, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-007'),
(384, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-008'),
(385, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-009'),
(386, '2025-01-01 00:00:00', 49, 1, 'SLD-ECO-K3-010'),
(387, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-001'),
(388, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-002'),
(389, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-003'),
(390, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-004'),
(391, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-005'),
(392, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-006'),
(393, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-007'),
(394, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-008'),
(395, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-009'),
(396, '2025-01-01 00:00:00', 50, 1, 'SD-ECO-128-010'),
(397, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-001'),
(398, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-002'),
(399, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-003'),
(400, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-004'),
(401, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-005'),
(402, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-006'),
(403, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-007'),
(404, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-008'),
(405, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-009'),
(406, '2025-01-01 00:00:00', 51, 1, 'SSD-ECO-T7-010');
ALTER TABLE `T_Equipo` AUTO_INCREMENT = 407;

-- T_Estado_Cliente
INSERT INTO `T_Estado_Cliente` (`PK_ECli_Cod`, `ECli_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');
ALTER TABLE `T_Estado_Cliente` AUTO_INCREMENT = 3;

-- T_Estado_Cotizacion
INSERT INTO `T_Estado_Cotizacion` (`PK_ECot_Cod`, `ECot_Nombre`) VALUES
(1, 'Borrador'),
(2, 'Enviada'),
(3, 'Aceptada'),
(4, 'Rechazada'),
(5, 'Expirada');
ALTER TABLE `T_Estado_Cotizacion` AUTO_INCREMENT = 6;

-- T_Estado_Empleado
INSERT INTO `T_Estado_Empleado` (`PK_Estado_Emp_Cod`, `EsEm_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Estado_Equipo
INSERT INTO `T_Estado_Equipo` (`PK_EE_Cod`, `EE_Nombre`) VALUES
(3, 'De baja'),
(1, 'Disponible'),
(2, 'En Mantenimiento');
ALTER TABLE `T_Estado_Equipo` AUTO_INCREMENT = 4;

-- T_Estado_Pago
INSERT INTO `T_Estado_Pago` (`PK_ESP_Cod`, `ESP_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Parcial'),
(3, 'Pagado'),
(4, 'Vencido'),
(5, 'Anulado');
ALTER TABLE `T_Estado_Pago` AUTO_INCREMENT = 6;

-- T_Estado_Pedido
INSERT INTO `T_Estado_Pedido` (`PK_EP_Cod`, `EP_Nombre`) VALUES
(1, 'Cotizado'),
(2, 'Contratado'),
(3, 'En ejecucion'),
(4, 'Entregado'),
(5, 'Cerrado'),
(6, 'Cancelado'),
(7, 'Expirado');
ALTER TABLE `T_Estado_Pedido` AUTO_INCREMENT = 8;

-- T_Estado_Proyecto
INSERT INTO `T_Estado_Proyecto` (`PK_EPro_Cod`, `EPro_Nombre`, `EPro_Orden`, `Activo`) VALUES
(1, 'Planificado', 1, 1),
(2, 'En ejecucion', 2, 1),
(3, 'En postproduccion', 3, 1),
(4, 'Listo para entrega', 4, 1),
(5, 'Entregado', 5, 1);
ALTER TABLE `T_Estado_Proyecto` AUTO_INCREMENT = 6;

-- T_Estado_Proyecto_Dia
INSERT INTO `T_Estado_Proyecto_Dia` (`PK_EPD_Cod`, `EPD_Nombre`, `EPD_Orden`, `Activo`, `created_at`, `updated_at`) VALUES
(1, 'Pendiente', 1, 1, '2026-02-08 05:00:30', '2026-02-08 05:00:30'),
(2, 'En curso', 2, 1, '2026-02-08 05:00:30', '2026-02-08 05:00:30'),
(3, 'Terminado', 3, 1, '2026-02-08 05:00:30', '2026-02-08 05:00:30'),
(4, 'Suspendido', 4, 1, '2026-02-08 05:00:30', '2026-02-08 05:00:30'),
(5, 'Cancelado', 5, 1, '2026-02-08 05:00:30', '2026-02-08 05:00:30');
ALTER TABLE `T_Estado_Proyecto_Dia` AUTO_INCREMENT = 6;

-- T_Estado_voucher
INSERT INTO `T_Estado_voucher` (`PK_EV_Cod`, `EV_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'Rechazado');
ALTER TABLE `T_Estado_voucher` AUTO_INCREMENT = 4;

-- T_EventoServicio
INSERT INTO `T_EventoServicio` (`PK_ExS_Cod`, `PK_S_Cod`, `PK_E_Cod`, `ExS_Titulo`, `FK_ESC_Cod`, `ExS_EsAddon`, `FK_ESE_Cod`, `ExS_Precio`, `ExS_Descripcion`, `ExS_Horas`, `ExS_FotosImpresas`, `ExS_TrailerMin`, `ExS_FilmMin`) VALUES
(1, 1, 1, 'Fotografia Boda Premium', 3, 0, 1, '1800.00', 'Cobertura integral de boda con direccion de retratos y entrega digital.', '10.0', 60, 0, 0),
(2, 1, 1, 'Fotografia Boda Deluxe', 2, 0, 1, '2800.00', 'Cobertura extendida con segundo fotografo, mas retratos y seleccion ampliada.', '12.0', 100, 0, 0),
(3, 2, 1, 'Video Boda Ceremonia', 1, 0, 1, '1100.00', 'Registro de ceremonia con highlight corto y audio limpio.', '4.0', NULL, 1, 15),
(4, 2, 1, 'Video Boda Cinematic', 3, 0, 1, '4200.00', 'Cobertura cinematografica de jornada completa con trailer y film largo.', '12.0', NULL, 3, 45),
(5, 3, 1, 'Drone Boda Ceremonia', 5, 1, 1, '350.00', 'Tomas aereas puntuales para exteriores y llegada.', '2.0', NULL, NULL, NULL),
(6, 3, 1, 'Drone Boda Jornada Completa', 5, 1, 1, '900.00', 'Cobertura aerea en varios bloques de la boda con plan de vuelo coordinado.', '6.0', NULL, NULL, NULL),
(7, 4, 1, 'Photobooth Boda Glam', 5, 1, 1, '850.00', 'Photobooth social de 3 horas con atencion en sitio y galeria digital.', '3.0', NULL, NULL, NULL),
(8, 1, 2, 'Fotografia Cumple Express', 1, 0, 1, '900.00', 'Servicio simple y economico: un fotografo, cobertura corta y entrega digital.', '4.0', 0, NULL, NULL),
(9, 1, 2, 'Fotografia Cumple Premium', 3, 0, 1, '1500.00', 'Cobertura de cumpleanos con retratos familiares y seleccion curada.', '6.0', 30, NULL, NULL),
(10, 2, 2, 'Video Cumple Celebracion', 1, 0, 1, '1300.00', 'Video de celebracion con resumen dinamico de los momentos clave.', '4.0', NULL, 2, 12),
(11, 2, 2, 'Video Cumple Signature', 3, 0, 1, '2200.00', 'Cobertura completa con narrativa de evento y film extendido.', '6.0', NULL, 3, 20),
(12, 3, 2, 'Drone Cumple Show', 5, 1, 1, '350.00', 'Tomas aereas del show principal y apertura del evento.', '2.0', NULL, NULL, NULL),
(13, 4, 2, 'Photobooth Cumple Kids', 5, 1, 1, '650.00', 'Photobooth de 3 horas con flujo rapido de fotos y entrega digital.', '3.0', NULL, NULL, NULL),
(14, 1, 3, 'Fotografia Corporativa Retratos', 4, 0, 1, '700.00', 'Sesion de retratos ejecutivos en locacion con iluminacion controlada.', '3.0', NULL, NULL, NULL),
(15, 1, 3, 'Fotografia Corporativa Evento', 4, 0, 1, '2300.00', 'Cobertura de conferencia o lanzamiento con enfoque editorial.', '6.0', NULL, NULL, NULL),
(16, 2, 3, 'Video Corporativo Conferencia', 4, 0, 1, '3200.00', 'Registro multicamara de conferencia con edicion de resumen.', '6.0', NULL, 2, 25),
(17, 2, 3, 'Video Corporativo Institucional', 4, 0, 1, '3800.00', 'Produccion institucional con entrevistas y recursos de apoyo.', '8.0', NULL, 1, 8),
(18, 3, 3, 'Drone Corporativo Exterior', 5, 1, 1, '500.00', 'Tomas aereas de fachada, entorno y activos del cliente.', '3.0', NULL, NULL, NULL),
(19, 4, 3, 'Photobooth Corporativo Branding', 5, 1, 1, '700.00', 'Photobooth de marca con personal de apoyo y entrega en linea.', '3.0', NULL, NULL, NULL),
(20, 1, 2, 'Fotografia Cumpleanos Deluxe', 2, 0, 1, '2600.00', 'Cobertura amplia con segundo tirador y seleccion premium de entrega.', '8.0', 50, NULL, NULL);
ALTER TABLE `T_EventoServicio` AUTO_INCREMENT = 21;

-- T_EventoServicioCategoria
INSERT INTO `T_EventoServicioCategoria` (`PK_ESC_Cod`, `ESC_Nombre`, `ESC_Tipo`, `ESC_Activo`, `ESC_Fecha_Creacion`) VALUES
(1, 'Standard', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(2, 'Deluxe', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(3, 'Premium', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(4, 'Corporate', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(5, 'Add-on', 'ADDON', 1, '2025-11-13 05:43:18');
ALTER TABLE `T_EventoServicioCategoria` AUTO_INCREMENT = 6;

-- T_EventoServicioEquipo
INSERT INTO `T_EventoServicioEquipo` (`PK_ExS_Equipo_Cod`, `FK_ExS_Cod`, `FK_TE_Cod`, `Cantidad`, `Notas`) VALUES
(1, 1, 1, 3, '1 camara por operador + 1 backup por servicio'),
(2, 1, 2, 2, 'Lentes 24-70/70-200 + backup'),
(3, 1, 4, 2, 'Flashes + backup'),
(4, 1, 5, 2, 'Tripodes + backup'),
(5, 1, 9, 1, 'Luz continua'),
(6, 1, 10, 3, 'Baterias base + 1 backup por servicio'),
(7, 1, 14, 4, 'Tarjetas SD (respaldo)'),
(8, 2, 1, 3, '1 camara por operador + 1 backup por servicio'),
(9, 2, 2, 3, 'Lentes adicionales + backup'),
(10, 2, 4, 3, 'Flashes + backup'),
(11, 2, 5, 3, 'Tripodes + backup'),
(12, 2, 9, 2, 'Luces continuas + backup'),
(13, 2, 10, 3, 'Baterias base + 1 backup por servicio'),
(14, 2, 12, 1, 'Monopode'),
(15, 2, 14, 6, 'Tarjetas SD (respaldo)'),
(16, 3, 1, 2, '1 camara por operador + 1 backup por servicio'),
(17, 3, 6, 2, 'Gimbal + backup'),
(18, 3, 8, 2, 'Microfonos + backup'),
(19, 3, 7, 2, 'Grabadora + backup'),
(20, 3, 5, 2, 'Tripodes + backup'),
(21, 3, 9, 1, 'Luz continua'),
(22, 3, 10, 2, 'Baterias base + 1 backup por servicio'),
(23, 3, 14, 4, 'Tarjetas SD (respaldo)'),
(24, 3, 15, 2, 'SSD (backup)'),
(25, 4, 1, 3, '1 camara por operador + 1 backup por servicio'),
(26, 4, 6, 3, 'Gimbal + backup'),
(27, 4, 8, 4, 'Microfonos + backup'),
(28, 4, 7, 2, 'Grabadora + backup'),
(29, 4, 5, 3, 'Tripodes + backup'),
(30, 4, 9, 3, 'Luces continuas + backup'),
(31, 4, 10, 3, 'Baterias base + 1 backup por servicio'),
(32, 4, 12, 1, 'Monopode'),
(33, 4, 13, 1, 'Slider'),
(34, 4, 14, 6, 'Tarjetas SD (respaldo)'),
(35, 4, 15, 3, 'SSD (backup)'),
(36, 5, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(37, 5, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(38, 5, 14, 2, 'Tarjetas SD (respaldo)'),
(39, 6, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(40, 6, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(41, 6, 14, 4, 'Tarjetas SD (respaldo)'),
(42, 7, 1, 2, '1 camara por operador + 1 backup por servicio'),
(43, 7, 5, 2, 'Tripode + backup'),
(44, 7, 9, 2, 'Luces continuas + backup'),
(45, 7, 10, 2, 'Baterias base + 1 backup por servicio'),
(46, 7, 14, 4, 'Tarjetas SD (respaldo)'),
(47, 8, 1, 2, '1 camara por operador + 1 backup por servicio'),
(48, 8, 2, 2, 'Lente + backup'),
(49, 8, 4, 2, 'Flash + backup'),
(50, 8, 5, 2, 'Tripode + backup'),
(51, 8, 10, 2, 'Baterias base + 1 backup por servicio'),
(52, 8, 14, 4, 'Tarjetas SD (respaldo)'),
(53, 9, 1, 2, '1 camara por operador + 1 backup por servicio'),
(54, 9, 2, 2, 'Lentes + backup'),
(55, 9, 4, 2, 'Flashes + backup'),
(56, 9, 5, 2, 'Tripodes + backup'),
(57, 9, 9, 1, 'Luz continua'),
(58, 9, 10, 2, 'Baterias base + 1 backup por servicio'),
(59, 9, 14, 4, 'Tarjetas SD (respaldo)'),
(60, 10, 1, 2, '1 camara por operador + 1 backup por servicio'),
(61, 10, 6, 2, 'Gimbal + backup'),
(62, 10, 8, 2, 'Microfono + backup'),
(63, 10, 7, 2, 'Grabadora + backup'),
(64, 10, 5, 2, 'Tripode + backup'),
(65, 10, 9, 1, 'Luz continua'),
(66, 10, 10, 2, 'Baterias base + 1 backup por servicio'),
(67, 10, 14, 4, 'Tarjetas SD (respaldo)'),
(68, 10, 15, 2, 'SSD (backup)'),
(69, 11, 1, 2, '1 camara por operador + 1 backup por servicio'),
(70, 11, 6, 2, 'Gimbal + backup'),
(71, 11, 8, 3, 'Microfonos + backup'),
(72, 11, 7, 2, 'Grabadora + backup'),
(73, 11, 5, 3, 'Tripodes + backup'),
(74, 11, 9, 2, 'Luces continuas + backup'),
(75, 11, 10, 2, 'Baterias base + 1 backup por servicio'),
(76, 11, 13, 1, 'Slider'),
(77, 11, 14, 6, 'Tarjetas SD (respaldo)'),
(78, 11, 15, 2, 'SSD (backup)'),
(79, 12, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(80, 12, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(81, 12, 14, 2, 'Tarjetas SD (respaldo)'),
(82, 13, 1, 2, '1 camara por operador + 1 backup por servicio'),
(83, 13, 5, 2, 'Tripode + backup'),
(84, 13, 9, 2, 'Luces continuas + backup'),
(85, 13, 10, 2, 'Baterias base + 1 backup por servicio'),
(86, 13, 14, 4, 'Tarjetas SD (respaldo)'),
(87, 14, 1, 2, '1 camara por operador + 1 backup por servicio'),
(88, 14, 2, 2, 'Lente + backup'),
(89, 14, 4, 2, 'Flash + backup'),
(90, 14, 5, 2, 'Tripode + backup'),
(91, 14, 9, 1, 'Luz continua'),
(92, 14, 10, 2, 'Baterias base + 1 backup por servicio'),
(93, 14, 14, 4, 'Tarjetas SD (respaldo)'),
(94, 15, 1, 3, '1 camara por operador + 1 backup por servicio'),
(95, 15, 2, 3, 'Lentes + backup'),
(96, 15, 4, 3, 'Flashes + backup'),
(97, 15, 5, 3, 'Tripodes + backup'),
(98, 15, 9, 2, 'Luces continuas + backup'),
(99, 15, 10, 3, 'Baterias base + 1 backup por servicio'),
(100, 15, 12, 1, 'Monopode'),
(101, 15, 14, 6, 'Tarjetas SD (respaldo)'),
(102, 16, 1, 3, '1 camara por operador + 1 backup por servicio'),
(103, 16, 6, 2, 'Gimbal + backup'),
(104, 16, 8, 3, 'Microfonos + backup'),
(105, 16, 7, 2, 'Grabadora + backup'),
(106, 16, 5, 3, 'Tripodes + backup'),
(107, 16, 9, 3, 'Luces continuas + backup'),
(108, 16, 10, 3, 'Baterias base + 1 backup por servicio'),
(109, 16, 12, 1, 'Monopode'),
(110, 16, 13, 1, 'Slider'),
(111, 16, 14, 6, 'Tarjetas SD (respaldo)'),
(112, 16, 15, 3, 'SSD (backup)'),
(113, 17, 1, 3, '1 camara por operador + 1 backup por servicio'),
(114, 17, 6, 3, 'Gimbal + backup'),
(115, 17, 8, 4, 'Microfonos + backup'),
(116, 17, 7, 2, 'Grabadora + backup'),
(117, 17, 5, 3, 'Tripodes + backup'),
(118, 17, 9, 3, 'Luces continuas + backup'),
(119, 17, 10, 3, 'Baterias base + 1 backup por servicio'),
(120, 17, 12, 1, 'Monopode'),
(121, 17, 13, 1, 'Slider'),
(122, 17, 14, 6, 'Tarjetas SD (respaldo)'),
(123, 17, 15, 3, 'SSD (backup)'),
(124, 18, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(125, 18, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(126, 18, 14, 2, 'Tarjetas SD (respaldo)'),
(127, 19, 1, 2, '1 camara por operador + 1 backup por servicio'),
(128, 19, 5, 2, 'Tripode + backup'),
(129, 19, 9, 2, 'Luces continuas + backup'),
(130, 19, 10, 2, 'Baterias base + 1 backup por servicio'),
(131, 19, 14, 4, 'Tarjetas SD (respaldo)'),
(132, 20, 1, 3, '1 camara por operador + 1 backup por servicio'),
(133, 20, 2, 3, 'Lentes + backup'),
(134, 20, 4, 3, 'Flashes + backup'),
(135, 20, 5, 3, 'Tripodes + backup'),
(136, 20, 9, 2, 'Luces continuas + backup'),
(137, 20, 10, 3, 'Baterias base + 1 backup por servicio'),
(138, 20, 12, 1, 'Monopode'),
(139, 20, 14, 6, 'Tarjetas SD (respaldo)');
ALTER TABLE `T_EventoServicioEquipo` AUTO_INCREMENT = 140;

-- T_EventoServicioEstado
INSERT INTO `T_EventoServicioEstado` (`PK_ESE_Cod`, `ESE_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');
ALTER TABLE `T_EventoServicioEstado` AUTO_INCREMENT = 3;

-- T_EventoServicioStaff
INSERT INTO `T_EventoServicioStaff` (`PK_ExS_Staff_Cod`, `FK_ExS_Cod`, `Staff_Rol`, `Staff_Cantidad`) VALUES
(1, 1, 'Fotografo', 2),
(2, 1, 'Asistente', 1),
(3, 2, 'Fotografo', 2),
(4, 2, 'Asistente', 1),
(5, 3, 'Videografo', 1),
(6, 4, 'Videografo', 2),
(7, 4, 'Asistente', 1),
(8, 5, 'Piloto de dron', 1),
(9, 6, 'Piloto de dron', 1),
(10, 6, 'Asistente', 1),
(11, 7, 'Fotografo', 1),
(12, 7, 'Asistente', 1),
(13, 8, 'Fotografo', 1),
(14, 9, 'Fotografo', 1),
(15, 9, 'Asistente', 1),
(16, 10, 'Videografo', 1),
(17, 11, 'Videografo', 1),
(18, 11, 'Asistente', 1),
(19, 12, 'Piloto de dron', 1),
(20, 13, 'Fotografo', 1),
(21, 13, 'Asistente', 1),
(22, 14, 'Fotografo', 1),
(23, 15, 'Fotografo', 2),
(24, 15, 'Asistente', 1),
(25, 16, 'Videografo', 2),
(26, 16, 'Asistente', 1),
(27, 17, 'Videografo', 2),
(28, 17, 'Asistente', 1),
(29, 18, 'Piloto de dron', 1),
(30, 19, 'Fotografo', 1),
(31, 19, 'Asistente', 1),
(32, 20, 'Fotografo', 2),
(33, 20, 'Asistente', 1);
ALTER TABLE `T_EventoServicioStaff` AUTO_INCREMENT = 34;

-- T_Eventos
INSERT INTO `T_Eventos` (`PK_E_Cod`, `E_Nombre`, `E_IconUrl`, `E_MostrarPortafolio`) VALUES
(1, 'Boda', 'assets/images/boda.jpg', 1),
(2, 'Cumpleanos', 'assets/images/cumpleanos.jpg', 1),
(3, 'Corporativo', 'assets/images/corporativo.jpg', 1);
ALTER TABLE `T_Eventos` AUTO_INCREMENT = 4;

-- T_Lead
-- Sin datos

-- T_Marca
INSERT INTO `T_Marca` (`PK_IMa_Cod`, `NMa_Nombre`) VALUES
(18, 'Aputure'),
(17, 'Audio-Technica'),
(15, 'Blackmagic'),
(12, 'Boya'),
(1, 'Canon'),
(5, 'DJI'),
(4, 'Fujifilm'),
(6, 'Godox'),
(28, 'GoPro'),
(27, 'Konova'),
(14, 'Leica'),
(7, 'Manfrotto'),
(19, 'Nanlite'),
(3, 'Nikon'),
(13, 'Panasonic'),
(16, 'Rode'),
(21, 'Rokinon'),
(25, 'Samsung'),
(22, 'Samyang'),
(24, 'SanDisk'),
(9, 'Sennheiser'),
(10, 'Sigma'),
(2, 'Sony'),
(11, 'Tamron'),
(23, 'Tokina'),
(26, 'WD'),
(20, 'Zhiyun'),
(8, 'Zoom');
ALTER TABLE `T_Marca` AUTO_INCREMENT = 29;

-- T_Metodo_Pago
INSERT INTO `T_Metodo_Pago` (`PK_MP_Cod`, `MP_Nombre`) VALUES
(1, 'Efectivo'),
(2, 'Transferencia');
ALTER TABLE `T_Metodo_Pago` AUTO_INCREMENT = 3;

-- T_Modelo
INSERT INTO `T_Modelo` (`PK_IMo_Cod`, `NMo_Nombre`, `FK_IMa_Cod`, `FK_TE_Cod`) VALUES
(1, 'EOS R6 Mark II', 1, 1),
(2, 'EOS R5', 1, 1),
(3, 'Alpha 7 IV (A7 IV)', 2, 1),
(4, 'Z6 II', 3, 1),
(5, 'X-T5', 4, 1),
(6, 'RF 24-70mm f/2.8L IS USM', 1, 2),
(7, 'RF 70-200mm f/2.8L IS USM', 1, 2),
(8, 'FE 35mm f/1.8', 2, 2),
(9, 'FE 85mm f/1.8', 2, 2),
(10, 'Nikkor Z 24-70mm f/2.8 S', 3, 2),
(11, 'XF 56mm f/1.2 R WR', 4, 2),
(12, 'Sigma 24-70mm f/2.8 DG DN Art (E-mount)', 10, 2),
(13, 'Tamron 28-75mm f/2.8 Di III VXD G2 (E-mount)', 11, 2),
(14, 'Mavic 3 Classic', 5, 3),
(15, 'Mini 4 Pro', 5, 3),
(16, 'RS 3 Pro', 5, 6),
(17, 'AD200Pro', 6, 4),
(18, 'SL60W II', 6, 9),
(19, '190XPRO Aluminium', 7, 5),
(20, 'H1n Handy Recorder', 8, 7),
(21, 'EW 112P G4', 9, 8),
(22, 'Mini 4 Pro Intelligent Flight Battery', 5, 10),
(23, 'GoPro v5.7 2025', 3, 11),
(24, 'A7S III', 2, 1),
(25, 'Lumix S5 II', 13, 1),
(26, 'SL2-S', 14, 1),
(27, 'Pocket Cinema Camera 6K G2', 15, 1),
(28, 'RF 50mm f/1.2L', 1, 2),
(29, 'FE 24-70mm f/2.8 GM II', 2, 2),
(30, 'Z 70-200mm f/2.8 VR S', 3, 2),
(31, 'XF 16-55mm f/2.8 R LM WR', 4, 2),
(34, 'Air 3', 5, 3),
(35, 'Inspire 3', 5, 3),
(36, 'V1', 6, 4),
(37, 'AD300Pro', 6, 4),
(38, 'LS 60x', 18, 9),
(39, 'Forza 60B', 19, 9),
(40, 'Crane 3S', 20, 6),
(41, 'H6', 8, 7),
(42, 'Wireless GO II', 16, 8),
(43, 'AT2020', 17, 8),
(44, 'MKH 416', 9, 8),
(45, 'NP-FZ100', 2, 10),
(46, 'LP-E6NH', 1, 10),
(47, 'HERO12 Black', 28, 11),
(48, 'XPRO Monopod+', 7, 12),
(49, 'K3 60cm Slider', 27, 13),
(50, 'Extreme Pro SDXC 128GB', 24, 14),
(51, 'T7 1TB', 25, 15),
(52, 'My Passport SSD 1TB', 26, 15),
(53, 'EN-EL15c', 3, 10),
(54, 'NP-W235', 4, 10),
(55, 'DMW-BLK22', 13, 10),
(56, 'BP-SCL4', 14, 10),
(57, 'NP-F570', 15, 10),
(58, 'Mavic 3 Intelligent Flight Battery', 5, 10),
(59, 'Air 3 Intelligent Flight Battery', 5, 10),
(60, 'Inspire 3 TB51 Battery', 5, 10),
(61, 'GoPro Enduro Battery', 28, 10);
ALTER TABLE `T_Modelo` AUTO_INCREMENT = 62;

-- T_Pedido
INSERT INTO `T_Pedido` (`PK_P_Cod`, `FK_EP_Cod`, `FK_Cli_Cod`, `FK_ESP_Cod`, `P_Fecha_Creacion`, `P_Observaciones`, `FK_Em_Cod`, `P_Nombre_Pedido`, `FK_Cot_Cod`, `P_FechaEvento`, `P_HorasEst`, `P_Dias`, `P_IdTipoEvento`, `P_ViaticosMonto`, `P_Mensaje`, `P_Lugar`) VALUES
(1, 3, 3, 2, '2026-02-08 00:00:00', 'Origen: Cotizacion #7', 1, 'Boda - 01-03-2026 - Cusco', 7, '2026-03-01 00:00:00', '8.0', 1, 1, '800.00', 'Caso vigente normal. Viaticos aceptados.', 'Cusco'),
(2, 2, 3, 2, '2026-02-08 00:00:00', 'Origen: Cotizacion #3', 1, 'Corporativo - 20-03-2026 - Lima', 3, '2026-03-20 00:00:00', '6.0', 2, 3, '0.00', 'Cotizacion enviada. Trabajo en dos dias.', 'Lima');
ALTER TABLE `T_Pedido` AUTO_INCREMENT = 3;

-- T_PedidoEvento
INSERT INTO `T_PedidoEvento` (`PK_PE_Cod`, `FK_P_Cod`, `PE_Fecha`, `PE_Hora`, `PE_Ubicacion`, `PE_Direccion`, `PE_Notas`) VALUES
(1, 1, '2026-03-01 00:00:00', '14:00:00', 'Iglesia Catedral', 'Plaza de Armas S/N, Cusco', 'Ceremonia'),
(2, 1, '2026-03-01 00:00:00', '19:30:00', 'Recepcion Valle Sagrado', 'Av. El Sol 420, Cusco', 'Recepcion'),
(4, 2, '2026-03-20 00:00:00', '09:00:00', 'Centro de Convenciones San Isidro', 'Av. Javier Prado 1200, San Isidro, Lima', 'Conferencia dia 1'),
(5, 2, '2026-03-21 00:00:00', '09:30:00', 'Auditorio Empresarial San Isidro', 'Av. Rivera Navarrete 450, San Isidro, Lima', 'Conferencia dia 2');
ALTER TABLE `T_PedidoEvento` AUTO_INCREMENT = 6;

-- T_PedidoServicio
INSERT INTO `T_PedidoServicio` (`PK_PS_Cod`, `FK_P_Cod`, `FK_ExS_Cod`, `FK_PE_Cod`, `PS_EventoId`, `PS_ServicioId`, `PS_Nombre`, `PS_Descripcion`, `PS_Moneda`, `PS_PrecioUnit`, `PS_Cantidad`, `PS_Descuento`, `PS_Recargo`, `PS_Notas`, `PS_Horas`, `PS_Staff`, `PS_FotosImpresas`, `PS_TrailerMin`, `PS_FilmMin`) VALUES
(1, 1, 3, NULL, 1, 2, 'Video Boda Ceremonia', 'Registro de ceremonia con highlight corto y audio limpio.', 'USD', '1100.00', '1.00', '0.00', '0.00', NULL, '4.0', 1, NULL, 1, 15),
(2, 1, 1, NULL, 1, 1, 'Fotografia Boda Premium', 'Cobertura integral de boda con direccion de retratos y entrega digital.', 'USD', '1800.00', '1.00', '0.00', '0.00', NULL, '10.0', 2, 60, 0, 0),
(4, 2, 15, NULL, 3, 1, 'Fotografia Corporativa Evento', 'Cobertura de conferencia o lanzamiento con enfoque editorial.', 'USD', '2300.00', '2.00', '0.00', '0.00', NULL, '6.0', 3, NULL, NULL, NULL),
(5, 2, 16, NULL, 3, 2, 'Video Corporativo Conferencia', 'Registro multicamara de conferencia con edicion de resumen.', 'USD', '3200.00', '2.00', '0.00', '0.00', NULL, '6.0', 3, NULL, 2, 25),
(6, 2, 18, NULL, 3, 3, 'Drone Corporativo Exterior', 'Tomas aereas de fachada, entorno y activos del cliente.', 'USD', '500.00', '1.00', '0.00', '0.00', NULL, '3.0', 1, NULL, NULL, NULL);
ALTER TABLE `T_PedidoServicio` AUTO_INCREMENT = 7;

-- T_PedidoServicioFecha
INSERT INTO `T_PedidoServicioFecha` (`PK_PSF_Cod`, `FK_P_Cod`, `FK_PedServ_Cod`, `PSF_Fecha`) VALUES
(1, 1, 1, '2026-03-01 00:00:00'),
(2, 1, 2, '2026-03-01 00:00:00'),
(4, 2, 4, '2026-03-20 00:00:00'),
(5, 2, 4, '2026-03-21 00:00:00'),
(6, 2, 5, '2026-03-20 00:00:00'),
(7, 2, 5, '2026-03-21 00:00:00'),
(8, 2, 6, '2026-03-21 00:00:00');
ALTER TABLE `T_PedidoServicioFecha` AUTO_INCREMENT = 9;

-- T_PortafolioImagen
-- Sin datos

-- T_Proyecto
INSERT INTO `T_Proyecto` (`PK_Pro_Cod`, `Pro_Nombre`, `FK_P_Cod`, `Pro_Estado`, `FK_Em_Cod`, `EPro_Fecha_Inicio_Edicion`, `Pro_Fecha_Fin_Edicion`, `Pro_Revision_Edicion`, `Pro_Revision_Multimedia`, `Pro_Enlace`, `Pro_Notas`, `created_at`, `updated_at`, `Pro_Pre_Entrega_Enlace`, `Pro_Pre_Entrega_Tipo`, `Pro_Pre_Entrega_Feedback`, `Pro_Pre_Entrega_Fecha`, `Pro_Respaldo_Ubicacion`, `Pro_Respaldo_Notas`, `Pro_Entrega_Final_Enlace`, `Pro_Entrega_Final_Fecha`) VALUES
(1, 'Corporativo - 20-03-2026 - Lima', 2, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-08 00:01:41', '2026-02-08 00:01:41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'Boda - 01-03-2026 - Cusco', 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-08 00:01:47', '2026-02-08 00:04:12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
ALTER TABLE `T_Proyecto` AUTO_INCREMENT = 3;

-- T_ProyectoDia
INSERT INTO `T_ProyectoDia` (`PK_PD_Cod`, `FK_Pro_Cod`, `FK_EPD_Cod`, `PD_Fecha`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-03-20 00:00:00', '2026-02-08 00:01:41', '2026-02-08 00:01:41'),
(2, 1, 1, '2026-03-21 00:00:00', '2026-02-08 00:01:41', '2026-02-08 00:01:41'),
(4, 2, 2, '2026-03-01 00:00:00', '2026-02-08 00:01:47', '2026-02-08 00:04:11');
ALTER TABLE `T_ProyectoDia` AUTO_INCREMENT = 5;

-- T_ProyectoDiaBloque
INSERT INTO `T_ProyectoDiaBloque` (`PK_PDB_Cod`, `FK_PD_Cod`, `PDB_Hora`, `PDB_Ubicacion`, `PDB_Direccion`, `PDB_Notas`, `PDB_Orden`, `created_at`, `updated_at`) VALUES
(1, 1, '09:00:00', 'Centro de Convenciones San Isidro', 'Av. Javier Prado 1200, San Isidro, Lima', 'Conferencia dia 1', 1, '2026-02-08 00:01:41', '2026-02-08 00:01:41'),
(2, 2, '09:30:00', 'Auditorio Empresarial San Isidro', 'Av. Rivera Navarrete 450, San Isidro, Lima', 'Conferencia dia 2', 1, '2026-02-08 00:01:41', '2026-02-08 00:01:41'),
(4, 4, '14:00:00', 'Iglesia Catedral', 'Plaza de Armas S/N, Cusco', 'Ceremonia', 1, '2026-02-08 00:01:47', '2026-02-08 00:01:47'),
(5, 4, '19:30:00', 'Recepcion Valle Sagrado', 'Av. El Sol 420, Cusco', 'Recepcion', 2, '2026-02-08 00:01:47', '2026-02-08 00:01:47');
ALTER TABLE `T_ProyectoDiaBloque` AUTO_INCREMENT = 6;

-- T_ProyectoDiaEmpleado
INSERT INTO `T_ProyectoDiaEmpleado` (`PK_PDE_Cod`, `FK_PD_Cod`, `FK_Em_Cod`, `PDE_Notas`, `created_at`) VALUES
(1, 4, 28, NULL, '2026-02-08 00:03:55'),
(2, 4, 18, NULL, '2026-02-08 00:03:55'),
(3, 4, 14, NULL, '2026-02-08 00:03:55'),
(4, 4, 23, NULL, '2026-02-08 00:03:55'),
(5, 1, 28, NULL, '2026-02-08 00:07:08'),
(6, 1, 8, NULL, '2026-02-08 00:07:08'),
(7, 1, 18, NULL, '2026-02-08 00:07:08'),
(8, 1, 14, NULL, '2026-02-08 00:07:08'),
(9, 1, 23, NULL, '2026-02-08 00:07:08'),
(10, 1, 31, NULL, '2026-02-08 00:07:08'),
(11, 2, 28, NULL, '2026-02-08 00:08:24'),
(12, 2, 8, NULL, '2026-02-08 00:08:24'),
(13, 2, 18, NULL, '2026-02-08 00:08:24'),
(14, 2, 14, NULL, '2026-02-08 00:08:24'),
(15, 2, 23, NULL, '2026-02-08 00:08:24'),
(16, 2, 31, NULL, '2026-02-08 00:08:24'),
(17, 2, 9, NULL, '2026-02-08 00:08:24');
ALTER TABLE `T_ProyectoDiaEmpleado` AUTO_INCREMENT = 18;

-- T_ProyectoDiaEquipo
INSERT INTO `T_ProyectoDiaEquipo` (`PK_PDQ_Cod`, `FK_PD_Cod`, `FK_Eq_Cod`, `FK_Em_Cod`, `PDQ_Notas`, `PDQ_Devuelto`, `PDQ_Fecha_Devolucion`, `PDQ_Estado_Devolucion`, `PDQ_Notas_Devolucion`, `PDQ_Usuario_Devolucion`, `created_at`) VALUES
(1, 4, 209, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(2, 4, 210, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(3, 4, 211, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(4, 4, 212, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(5, 4, 213, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(6, 4, 75, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(7, 4, 76, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(8, 4, 77, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(9, 4, 7, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(10, 4, 8, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(11, 4, 49, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(12, 4, 50, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(13, 4, 123, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(14, 4, 124, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(15, 4, 58, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(16, 4, 59, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(17, 4, 90, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(18, 4, 91, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(19, 4, 120, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(20, 4, 121, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(21, 4, 132, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(22, 4, 133, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(23, 4, 179, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(24, 4, 180, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(25, 4, 163, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(26, 4, 164, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(27, 4, 165, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(28, 4, 166, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(29, 4, 167, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(30, 4, 168, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(31, 4, 169, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(32, 4, 170, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(33, 4, 55, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(34, 4, 56, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(35, 4, 57, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(36, 4, 297, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:03:55'),
(37, 1, 209, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(38, 1, 210, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(39, 1, 211, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(40, 1, 212, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(41, 1, 213, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(42, 1, 214, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(43, 1, 75, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(44, 1, 76, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(45, 1, 77, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(46, 1, 7, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(47, 1, 8, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(48, 1, 9, 31, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(49, 1, 49, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(50, 1, 50, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(51, 1, 51, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(52, 1, 123, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(53, 1, 124, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(54, 1, 58, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(55, 1, 59, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(56, 1, 90, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(57, 1, 91, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(58, 1, 92, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(59, 1, 120, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(60, 1, 121, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(61, 1, 122, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(62, 1, 117, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(63, 1, 118, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(64, 1, 132, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(65, 1, 133, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(66, 1, 134, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(67, 1, 157, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(68, 1, 158, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(69, 1, 160, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(70, 1, 179, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(71, 1, 180, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(72, 1, 181, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(73, 1, 163, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(74, 1, 164, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(75, 1, 165, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(76, 1, 166, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(77, 1, 167, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(78, 1, 168, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(79, 1, 169, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(80, 1, 170, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(81, 1, 171, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(82, 1, 172, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(83, 1, 387, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(84, 1, 388, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(85, 1, 55, 31, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(86, 1, 56, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(87, 1, 57, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(88, 1, 297, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(89, 1, 298, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(90, 1, 299, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:07:09'),
(91, 2, 209, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(92, 2, 210, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(93, 2, 211, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(94, 2, 212, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(95, 2, 213, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(96, 2, 214, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(97, 2, 75, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(98, 2, 76, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(99, 2, 77, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(100, 2, 7, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(101, 2, 8, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(102, 2, 9, 31, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(103, 2, 49, 18, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(104, 2, 50, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(105, 2, 51, 14, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(106, 2, 123, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(107, 2, 124, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(108, 2, 58, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(109, 2, 59, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(110, 2, 90, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(111, 2, 91, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(112, 2, 92, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(113, 2, 120, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(114, 2, 121, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(115, 2, 122, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(116, 2, 117, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(117, 2, 118, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(118, 2, 132, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(119, 2, 133, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(120, 2, 134, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(121, 2, 157, 28, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(122, 2, 158, 8, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(123, 2, 160, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(124, 2, 179, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(125, 2, 180, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(126, 2, 181, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(127, 2, 163, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(128, 2, 164, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(129, 2, 165, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(130, 2, 166, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(131, 2, 167, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(132, 2, 168, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(133, 2, 169, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(134, 2, 170, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(135, 2, 171, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(136, 2, 172, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(137, 2, 387, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(138, 2, 388, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(139, 2, 55, 31, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(140, 2, 56, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(141, 2, 57, 23, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(142, 2, 297, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(143, 2, 298, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(144, 2, 299, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(145, 2, 233, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(146, 2, 234, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(147, 2, 235, 9, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(148, 2, 105, 9, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(149, 2, 106, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(150, 2, 389, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24'),
(151, 2, 390, NULL, NULL, 0, NULL, NULL, NULL, NULL, '2026-02-08 00:08:24');
ALTER TABLE `T_ProyectoDiaEquipo` AUTO_INCREMENT = 152;

-- T_ProyectoDiaIncidencia
-- Sin datos

-- T_ProyectoDevolucionJob
-- Solo limpieza/reset (sin seed)
ALTER TABLE `T_ProyectoDevolucionJob` AUTO_INCREMENT = 1;

-- T_ProyectoDiaServicio
INSERT INTO `T_ProyectoDiaServicio` (`PK_PDS_Cod`, `FK_PD_Cod`, `FK_PS_Cod`, `created_at`) VALUES
(1, 1, 4, '2026-02-08 00:01:41'),
(2, 1, 5, '2026-02-08 00:01:41'),
(3, 2, 4, '2026-02-08 00:01:41'),
(4, 2, 5, '2026-02-08 00:01:41'),
(5, 2, 6, '2026-02-08 00:01:41'),
(8, 4, 1, '2026-02-08 00:01:47'),
(9, 4, 2, '2026-02-08 00:01:47');
ALTER TABLE `T_ProyectoDiaServicio` AUTO_INCREMENT = 10;

-- T_Servicios
INSERT INTO `T_Servicios` (`PK_S_Cod`, `S_Nombre`) VALUES
(3, 'Drone'),
(1, 'Fotografia'),
(4, 'Photobooth'),
(2, 'Video');
ALTER TABLE `T_Servicios` AUTO_INCREMENT = 5;

-- T_TipoDocumento
INSERT INTO `T_TipoDocumento` (`PK_TD_Cod`, `TD_Codigo`, `TD_Nombre`, `TD_TipoDato`, `TD_TamMin`, `TD_TamMax`, `TD_Activo`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', 'N', 8, 8, 1),
(2, 'CE', 'Carnet de Extranjeria', 'A', 1, 12, 1),
(3, 'RUC', 'Registro Unico de Contribuyentes', 'N', 11, 11, 1),
(4, 'PAS', 'Pasaporte', 'A', 1, 12, 1);
ALTER TABLE `T_TipoDocumento` AUTO_INCREMENT = 5;

-- T_Tipo_Empleado
INSERT INTO `T_Tipo_Empleado` (`PK_Tipo_Emp_Cod`, `TiEm_Cargo`, `TiEm_PermiteLogin`, `TiEm_OperativoCampo`) VALUES
(1, 'Fotografo', 0, 1),
(2, 'Videografo', 0, 1),
(3, 'Editor', 0, 0),
(4, 'Vendedor', 1, 0),
(5, 'Asistente', 0, 1),
(6, 'Piloto de dron', 0, 1),
(7, 'Admin', 1, 0);
ALTER TABLE `T_Tipo_Empleado` AUTO_INCREMENT = 8;

-- T_Tipo_Equipo
INSERT INTO `T_Tipo_Equipo` (`PK_TE_Cod`, `TE_Nombre`) VALUES
(10, 'Bateria'),
(1, 'Camara'),
(3, 'Drone'),
(4, 'Flash'),
(6, 'Gimbal'),
(11, 'GoPro'),
(7, 'Grabadora'),
(2, 'Lente'),
(9, 'Luz continua'),
(8, 'Microfono'),
(12, 'Monopode'),
(13, 'Slider'),
(15, 'SSD'),
(14, 'Tarjeta SD'),
(5, 'Tripode');
ALTER TABLE `T_Tipo_Equipo` AUTO_INCREMENT = 16;

-- T_Usuario
INSERT INTO `T_Usuario` (`PK_U_Cod`, `U_Nombre`, `U_Apellido`, `U_Correo`, `U_Contrasena`, `U_Celular`, `U_Numero_Documento`, `U_Direccion`, `U_Fecha_Crea`, `U_Fecha_Upd`, `FK_TD_Cod`) VALUES
(1, 'Carlos Alfredo', 'De La Cruz Jaramillo', 'delacruzcarlos1405@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '931764349', '74034611', 'Calle Francia', '2025-10-21 05:37:39', '2025-10-29 10:10:59', 1),
(2, 'john', 'doe', 'johndoe@gmail.com', 'aed5e5903cae9e439c0a6d373e9a444a96ad630f5ee529c6c7be863331a1877b', '900000001', '00000001', 'calle piura mz b4 lote 10', '2026-01-05 04:44:04', '2026-01-05 05:00:16', 1),
(4, 'Lucia', 'Garcia Lopez', 'lucia.garcia01@gmail.com', '9863328cc3a69b72d0ebf7a46def01ec7c812703b2e44919f045d31f20682560', '900000002', '00000002', 'Av. Los Olivos 100, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(5, 'Mateo', 'Rodriguez Perez', 'mateo.rodriguez02@gmail.com', 'b67be0b75ac364bd070449ae6ca4cb1c76719b4682216138a09d207fd0dbb0c1', '900000003', '00000003', 'Calle Las Flores 103, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(6, 'Sofia', 'Fernandez Diaz', 'sofia.fernandez03@gmail.com', '1138d0668ac6c8bee0cb0c2a24105d6f385dad901c2fa821f28f72cc459261eb', '900000004', '00000004', 'Jr. San Martin 106, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(7, 'Martin', 'Gonzalez Ruiz', 'martin.gonzalez04@gmail.com', '0feb3bc89c6f8c42324964a2ee672760fc70470fa63493b35ba4bc5ca531fddf', '900000005', '00000005', 'Av. La Marina 109, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(8, 'Valentina', 'Sanchez Torres', 'valentina.sanchez05@gmail.com', 'ca641d4467fbbcdb2efb7b1bb4b27b6b2fa9aa578dfc6569c296da1baad12ec9', '900000006', '00000006', 'Calle Libertad 112, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(9, 'Sebastian', 'Ramirez Castillo', 'sebastian.ramirez06@gmail.com', 'ae54726163babf013a631d05d8871c18e65409e8ff3df2e9b2502ca6ca4b0321', '900000007', '00000007', 'Av. El Sol 115, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(10, 'Camila', 'Vargas Rojas', 'camila.vargas07@gmail.com', '811a26ced78120ae97a1c2d618a826a45a50b7bb02164afc0993f40c1c0b52ee', '900000008', '00000008', 'Jr. Grau 118, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(11, 'Nicolas', 'Flores Medina', 'nicolas.flores08@gmail.com', 'e2f3d34c1038953b13132fe20aed005a1a0dce39f86dc2cd232dcdd1a7bcb162', '900000009', '00000009', 'Calle Principal 121, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(12, 'Daniela', 'Herrera Chavez', 'daniela.herrera09@gmail.com', '790a975b60c20470190ede24097a549dab6ef22fde7d323235fc7318c0133a8e', '900000010', '00000010', 'Av. Independencia 124, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(13, 'Alejandro', 'Silva Morales', 'alejandro.silva10@gmail.com', '67ec2f2cb6b3ad336536ae851b73a7f9be3be264e0d5ae940790b8a75aab8a7c', '900000011', '00000011', 'Calle Union 127, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(14, 'Mariana', 'Mendoza Paredes', 'mariana.mendoza11@gmail.com', 'e3d06092c0dcde3608ef14d3771fca598fa91fbaec8b7f4b208ef68bf9d90ca6', '900000012', '00000012', 'Av. Los Olivos 130, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(15, 'Diego', 'Rios Gutierrez', 'diego.rios12@gmail.com', '96f1c5456b83cb9e708b893b6a0fc9a4c3db2f3d9b833f66562efb941869589f', '900000013', '00000013', 'Calle Las Flores 133, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(16, 'Renata', 'Navarro Salas', 'renata.navarro13@gmail.com', '437290057d47af46acc0990b61d9e64d70eadba61103d88862f6da5baf50c2aa', '900000014', '00000014', 'Jr. San Martin 136, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(17, 'Javier', 'Cruz Aguilar', 'javier.cruz14@gmail.com', 'a5f201bbe3b498706eafa82b5653af6a9bb4a30c8bf22c703f6749f0f792d1ca', '900000015', '00000015', 'Av. La Marina 139, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(18, 'Paula', 'Ortega Campos', 'paula.ortega15@gmail.com', 'c89ee620547f2c30aafc6b835f623c99781045bd23513f57125eaff378378846', '900000016', '00000016', 'Calle Libertad 142, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(19, 'Andres', 'Castro Nunez', 'andres.castro16@gmail.com', '3167fc76da1b864d1d5857b14d18f1eea3d3437278bc3355a8071bf66c6e030d', '900000017', '00000017', 'Av. El Sol 145, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(20, 'Gabriela', 'Suarez Vega', 'gabriela.suarez17@gmail.com', '01002972b94c4bca7458d7023a6d70944b6237eb7c904e0977ea1dae71dabedf', '900000018', '00000018', 'Jr. Grau 148, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(21, 'Fernando', 'Ponce Cardenas', 'fernando.ponce18@gmail.com', 'ead39d8517405cbeda500e69721f51454e344928f49a41aade10358decac8916', '900000019', '00000019', 'Calle Principal 151, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(22, 'Carolina', 'Delgado Palacios', 'carolina.delgado19@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '900000020', '00000020', 'Av. Independencia 154, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(23, 'Ricardo', 'Cabrera Leon', 'ricardo.cabrera20@gmail.com', '280dc73df5ccef8f90dd86950715f0aab8ff4c6386344b199f4d5720b0832990', '900000021', '00000021', 'Calle Union 157, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(24, 'Ana', 'Ibarra Soto', 'ana.ibarra21@gmail.com', '6d28613c623affe281f2bbe82d630f1f402253b388c947e19c93b16c726e49ff', '900000022', '00000022', 'Av. Los Olivos 160, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(25, 'Pedro', 'Reyes Romero', 'pedro.reyes22@gmail.com', '63040aeb6634a65a45c5b3873cf96a1445b0c3f750b9c6c66f27d0a8d0afcaab', '900000023', '00000023', 'Calle Las Flores 163, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(26, 'Isabella', 'Luna Valdes', 'isabella.luna23@gmail.com', '26d57d021030d7ef6ed2bd08563733cc76feb90b45d58a36a79eb8688378d153', '900000024', '00000024', 'Jr. San Martin 166, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(27, 'Juan', 'Ramos Pena', 'juan.ramos24@gmail.com', '0d9ecfca383a4f5085c8ddbc3111339489b61efd431602db2402991e4ac64147', '900000025', '00000025', 'Av. La Marina 169, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(28, 'Monica', 'Salazar Arias', 'monica.salazar25@gmail.com', '9d44414dd85043c3e91d8dd71e57110d6729382a1d9a400a64fa3e52275d38b3', '900000026', '00000026', 'Calle Libertad 172, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(29, 'Carlos', 'Quispe Huaman', 'carlos.quispe26@gmail.com', 'a96e723718da115c11e06370f817be15dd3b856579820dc222b2dbf1083fa2d6', '900000027', '00000027', 'Av. El Sol 175, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(30, 'Florencia', 'Torres Mejia', 'florencia.torres27@gmail.com', 'b5ca4338897d7dc0312bbd837a10e8fc78f0f837b68fd810d17f9d8e07974cae', '900000028', '00000028', 'Jr. Grau 178, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(31, 'Hugo', 'Alvarado Benitez', 'hugo.alvarado28@gmail.com', '5560f4db81c47eda7104996eeefa7be24a78d0655948cc162a20973f1a62d8ac', '900000029', '00000029', 'Calle Principal 181, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(32, 'Natalia', 'Campos Farfan', 'natalia.campos29@gmail.com', '028ccc43a370457d952526da8d291db07625f72de2eed697a08a0273c2c41a93', '900000030', '00000030', 'Av. Independencia 184, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(33, 'Oscar', 'Espinoza Rivas', 'oscar.espinoza30@gmail.com', '7c7ce0ba23aa33714eea4028c298ab96e39e7d1b12e1436e379ff6876d2d640a', '900000031', '00000031', 'Calle Union 187, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(34, 'Paolo', 'Paredes Rojas', 'paolo.paredes01@gmail.com', '615281f4c0e09a9f0fd5aadf4d98022c99630e431ff2fdfa946c598b6e40a78f', '900000032', '00000032', 'Av. Los Olivos 100, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(35, 'Veronica', 'Chavez Silva', 'veronica.chavez02@gmail.com', '1fa272990466e80c8dddecc43a684c20a787d4c9783bb5fab00711dc59b82883', '900000033', '00000033', 'Calle Las Flores 103, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(36, 'Rosa', 'Morales Quispe', 'rosa.morales03@gmail.com', 'ad0abeb5e300fbba581dbdcb42cbe9b06a52b93a0109ab9f9e6a0497274eb453', '900000034', '00000034', 'Jr. San Martin 106, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(37, 'Eduardo', 'Gutierrez Flores', 'eduardo.gutierrez04@gmail.com', '08afd38cbcfcf76abdb4d37362d51d0c8d8f1146e611c780f43f89056425c844', '900000035', '00000035', 'Av. La Marina 109, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(38, 'Jimena', 'Salas Mendoza', 'jimena.salas05@gmail.com', 'f9151f8bea12f9e26e2fb1f97e420fcb3f84ed9efd165315e7523e3ac007e263', '900000036', '00000036', 'Calle Libertad 112, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(39, 'Sergio', 'Vega Rios', 'sergio.vega06@gmail.com', '8241bf770bec39c8adbaea0d5782049ac4772bb6155dd396e90a60b63f89bf69', '900000037', '00000037', 'Av. El Sol 115, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(40, 'Claudia', 'Campos Luna', 'claudia.campos07@gmail.com', 'bdb2633a4df35ec4aeccebf3f492a6a327bc72041a67c9d00ae6bd756513be05', '900000038', '00000038', 'Jr. Grau 118, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(41, 'Alvaro', 'Arias Ramos', 'alvaro.arias08@gmail.com', '9573a1682463d2b06ef2b2cae9dd87c2e77f6f71654b453ee5c16e1ea356ed89', '900000039', '00000039', 'Calle Principal 121, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(42, 'Lorena', 'Pena Salazar', 'lorena.pena09@gmail.com', 'a16727b0a956c185af93b5bcc492335b25ad8e8e5db6a91db90a33f70c7fb80f', '900000040', '00000040', 'Av. Independencia 124, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(43, 'Tomas', 'Romero Ibarra', 'tomas.romero10@gmail.com', '4c41baffb70f58eda16951603024843e637d8c063bf1d57333efbafd1c173b38', '900000041', '00000041', 'Calle Union 127, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(44, 'Patricia', 'Soto Reyes', 'patricia.soto11@gmail.com', '0d7c92adc8e502e6d8605deb00a10db6d3601e359aa187f6570ecbe475ce0765', '900000042', '00000042', 'Av. Los Olivos 130, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(45, 'Luis', 'Leon Cabrera', 'luis.leon12@gmail.com', 'e8078208e48cdaab5a9b8e4eef676026e0f65af7658d02bf47254a427da7a770', '900000043', '00000043', 'Calle Las Flores 133, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(46, 'Elena', 'Palacios Delgado', 'elena.palacios13@gmail.com', '0ee1d7b9d5264703256a9f59d0f9c1b5992bff0d229fadefe8fb11caad2f1a69', '900000044', '00000044', 'Jr. San Martin 136, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(47, 'Marco', 'Cardenas Ponce', 'marco.cardenas14@gmail.com', 'ed74b28afe618ac50615bc91994444b5e338276f4761a3e7d7eec0e146bedffa', '900000045', '00000045', 'Av. La Marina 139, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(48, 'Raul', 'Nunez Castro', 'raul.nunez15@gmail.com', '7428b3eebd26d3d10db7fb281c2d5447502b519d3f94d4b194dfa85367c786d3', '900000046', '00000046', 'Calle Libertad 142, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(49, 'Silvia', 'Vargas Suarez', 'silvia.vargas16@gmail.com', '56c4e1424d6e7b160197f6c00d62ac9994a91fd9af16f94ca35259c39f2e4fdf', '900000047', '00000047', 'Av. El Sol 145, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(50, 'Bruno', 'Aguilar Ortega', 'bruno.aguilar17@gmail.com', '78fcb5ae8034f81e703f86a7b4c96c75f1b0891b381059c445d930385b2c79d0', '900000048', '00000048', 'Jr. Grau 148, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(51, 'Noelia', 'Benitez Alvarado', 'noelia.benitez18@gmail.com', '58e8b2e84d6f65487da01d51caa94f5f8fee5f320b9b4d1276c586f99e7daac1', '900000049', '00000049', 'Calle Principal 151, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(52, 'Felipe', 'Mejia Torres', 'felipe.mejia19@gmail.com', '09dacd965fbff194d182c7694924e86b934c07be9b15517191ed476940c6db55', '900000050', '00000050', 'Av. Independencia 154, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(53, 'Rocio', 'Farfan Campos', 'rocio.farfan20@gmail.com', '120b658b6fbfcfcb70c86b5b1327a5294619b57001ecc48759d233fa1055cf36', '900000051', '00000051', 'Calle Union 157, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(54, 'Esteban', 'Rivas Espinoza', 'esteban.rivas21@gmail.com', 'd3f3d4329229ec2fa69deeaa95860b7f95c856dd5102d111abca2b9323b16976', '900000052', '00000052', 'Av. Los Olivos 160, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(55, 'Cecilia', 'Medina Herrera', 'cecilia.medina22@gmail.com', '1f67c4e41ffc2fc10efa21f0093f8902fbfd8caba2ab662bd3d6a3bdb79f5a1a', '900000053', '00000053', 'Calle Las Flores 163, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(56, 'Ivan', 'Chavez Flores', 'ivan.chavez23@gmail.com', '12a8db8f3bf3978ec857124dc77b45a1d084cbf71255f206b027b50fcba42664', '900000054', '00000054', 'Jr. San Martin 166, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(57, 'Beatriz', 'Ruiz Gonzalez', 'beatriz.ruiz24@gmail.com', '9c574a77f18e99ab5c27654b8c00bceaf0bb129f06a52a9a22f0cf7b6e2ee78e', '900000055', '00000055', 'Av. La Marina 169, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(58, 'German', 'Diaz Fernandez', 'german.diaz25@gmail.com', '214eac47ad6b3f1fa9ab5f1d896c20311dcf96f3500f3a4b776619347d62d217', '900000056', '00000056', 'Calle Libertad 172, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(59, 'Sandra', 'Perez Rodriguez', 'sandra.perez26@gmail.com', '66e3236f0a70f3907dc91e9a99075dac8626e4e7608d4c99ba1ccab6c2263a08', '900000057', '00000057', 'Av. El Sol 175, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(60, 'Alonso', 'Lopez Garcia', 'alonso.lopez27@gmail.com', '9a7a52a65102436a4fe445852b456d41cda3bc47700c1d936803a2743ff35519', '900000058', '00000058', 'Jr. Grau 178, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(61, 'Marta', 'Torres Sanchez', 'marta.torres28@gmail.com', '52b52c09f1e61358bbd704bd1f76455245a1288ccdbc57ba48979eaf2e5f5b86', '900000059', '00000059', 'Calle Principal 181, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(62, 'Gonzalo', 'Castillo Ramirez', 'gonzalo.castillo29@gmail.com', '80fe91a7b87e38bad955c7597d0985d450139d95ab8ab16fe9951cce770b9e6f', '900000060', '00000060', 'Av. Independencia 184, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1),
(63, 'Ines', 'Rojas Vargas', 'ines.rojas30@gmail.com', 'ac9371f9553f89d29c12415c7c384d48820b279d6db531182ff147a822abbf43', '900000061', '00000061', 'Calle Union 187, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00', 1);
ALTER TABLE `T_Usuario` AUTO_INCREMENT = 64;

-- T_Voucher
INSERT INTO `T_Voucher` (`PK_Pa_Cod`, `Pa_Monto_Depositado`, `FK_MP_Cod`, `Pa_Imagen_Voucher`, `FK_P_Cod`, `FK_EV_Cod`, `Pa_Fecha`, `Pa_Imagen_Mime`, `Pa_Imagen_NombreOriginal`, `Pa_Imagen_Size`) VALUES
(1, 6785, 1, NULL, 2, 2, '2026-02-08 00:00:00', NULL, NULL, NULL),
(2, 2183, 1, NULL, 1, 2, '2026-02-08 00:00:00', NULL, NULL, NULL);
ALTER TABLE `T_Voucher` AUTO_INCREMENT = 3;

COMMIT;
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
SET FOREIGN_KEY_CHECKS = 1;
