-- Seed basico (sin datos operativos)
-- Generado desde seed_dashboard_inicio_20260209.sql
-- Fecha: 2026-02-10
use defaultdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET @OLD_SQL_SAFE_UPDATES := @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

-- Limpieza de tablas operativas + basicas para recarga limpia
DELETE FROM `T_ProyectoDiaIncidencia`;
DELETE FROM `T_ProyectoDiaEquipo`;
DELETE FROM `T_ProyectoDiaEmpleado`;
DELETE FROM `T_ProyectoDiaServicio`;
DELETE FROM `T_ProyectoDiaBloque`;
DELETE FROM `T_ProyectoDia`;
DELETE FROM `T_ProyectoDevolucionJob`;
DELETE FROM `T_Proyecto`;
DELETE FROM `T_PedidoServicioFecha`;
DELETE FROM `T_PedidoServicio`;
DELETE FROM `T_PedidoEvento`;
DELETE FROM `T_Pedido`;
DELETE FROM `T_CotizacionServicioFecha`;
DELETE FROM `T_CotizacionServicio`;
DELETE FROM `T_CotizacionEvento`;
DELETE FROM `T_Cotizacion`;
DELETE FROM `T_Voucher`;
DELETE FROM `T_Contrato`;
DELETE FROM `T_PortafolioImagen`;
DELETE FROM `T_Lead`;
DELETE FROM `T_Cliente`;
DELETE FROM `T_EventoServicioEquipo`;
DELETE FROM `T_EventoServicioStaff`;
DELETE FROM `T_EventoServicioEstado`;
DELETE FROM `T_EventoServicioCategoria`;
DELETE FROM `T_EventoServicio`;
DELETE FROM `T_Eventos`;
DELETE FROM `T_Servicios`;
DELETE FROM `T_Equipo`;
DELETE FROM `T_Empleados`;
DELETE FROM `T_Usuario`;
DELETE FROM `T_Modelo`;
DELETE FROM `T_Marca`;
DELETE FROM `T_Tipo_Equipo`;
DELETE FROM `T_Tipo_Empleado`;
DELETE FROM `T_TipoDocumento`;
DELETE FROM `T_Metodo_Pago`;
DELETE FROM `T_Estado_Proyecto_Dia`;
DELETE FROM `T_Estado_Proyecto`;
DELETE FROM `T_Estado_Pedido`;
DELETE FROM `T_Estado_Pago`;
DELETE FROM `T_Estado_Equipo`;
DELETE FROM `T_Estado_Empleado`;
DELETE FROM `T_Estado_Cotizacion`;
DELETE FROM `T_Estado_Cliente`;
DELETE FROM `T_Estado_voucher`;

-- Reinicio de AUTO_INCREMENT en tablas operativas (seed sin datos operativos)
ALTER TABLE `T_Contrato` AUTO_INCREMENT = 1;
ALTER TABLE `T_Voucher` AUTO_INCREMENT = 1;
ALTER TABLE `T_Cotizacion` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionEvento` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionServicioFecha` AUTO_INCREMENT = 1;
ALTER TABLE `T_Pedido` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoEvento` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoServicioFecha` AUTO_INCREMENT = 1;
ALTER TABLE `T_Proyecto` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDevolucionJob` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDia` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDiaBloque` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDiaServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDiaEmpleado` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDiaEquipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_ProyectoDiaIncidencia` AUTO_INCREMENT = 1;
ALTER TABLE `T_PortafolioImagen` AUTO_INCREMENT = 1;

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
(1, '2025-01-01 00:00:00.000', 1, 1, 'CAM-EOSR6MARKI-001'),
(2, '2025-01-01 00:00:00.000', 1, 1, 'CAM-EOSR6MARKI-002'),
(3, '2025-01-01 00:00:00.000', 1, 1, 'CAM-EOSR6MARKI-003'),
(4, '2025-01-01 00:00:00.000', 2, 1, 'CAM-EOSR5-001'),
(5, '2025-01-01 00:00:00.000', 2, 1, 'CAM-EOSR5-002'),
(6, '2025-01-01 00:00:00.000', 2, 1, 'CAM-EOSR5-003'),
(7, '2025-01-01 00:00:00.000', 3, 1, 'CAM-ALPHA7IVA7-001'),
(8, '2025-01-01 00:00:00.000', 3, 1, 'CAM-ALPHA7IVA7-002'),
(9, '2025-01-01 00:00:00.000', 3, 1, 'CAM-ALPHA7IVA7-003'),
(10, '2025-01-01 00:00:00.000', 4, 1, 'CAM-Z6II-001'),
(11, '2025-01-01 00:00:00.000', 4, 1, 'CAM-Z6II-002'),
(12, '2025-01-01 00:00:00.000', 4, 1, 'CAM-Z6II-003'),
(13, '2025-01-01 00:00:00.000', 5, 1, 'CAM-XT5-001'),
(14, '2025-01-01 00:00:00.000', 5, 1, 'CAM-XT5-002'),
(15, '2025-01-01 00:00:00.000', 5, 1, 'CAM-XT5-003'),
(16, '2025-01-01 00:00:00.000', 6, 1, 'LEN-RF2470MMF2-001'),
(17, '2025-01-01 00:00:00.000', 6, 1, 'LEN-RF2470MMF2-002'),
(18, '2025-01-01 00:00:00.000', 6, 1, 'LEN-RF2470MMF2-003'),
(19, '2025-01-01 00:00:00.000', 7, 1, 'LEN-RF70200MMF-001'),
(20, '2025-01-01 00:00:00.000', 7, 1, 'LEN-RF70200MMF-002'),
(21, '2025-01-01 00:00:00.000', 7, 1, 'LEN-RF70200MMF-003'),
(22, '2025-01-01 00:00:00.000', 8, 1, 'LEN-FE35MMF18-001'),
(23, '2025-01-01 00:00:00.000', 8, 1, 'LEN-FE35MMF18-002'),
(24, '2025-01-01 00:00:00.000', 8, 1, 'LEN-FE35MMF18-003'),
(25, '2025-01-01 00:00:00.000', 9, 1, 'LEN-FE85MMF18-001'),
(26, '2025-01-01 00:00:00.000', 9, 1, 'LEN-FE85MMF18-002'),
(27, '2025-01-01 00:00:00.000', 9, 1, 'LEN-FE85MMF18-003'),
(28, '2025-01-01 00:00:00.000', 10, 1, 'LEN-NIKKORZ247-001'),
(29, '2025-01-01 00:00:00.000', 10, 1, 'LEN-NIKKORZ247-002'),
(30, '2025-01-01 00:00:00.000', 10, 1, 'LEN-NIKKORZ247-003'),
(31, '2025-01-01 00:00:00.000', 11, 1, 'LEN-XF56MMF12R-001'),
(32, '2025-01-01 00:00:00.000', 11, 1, 'LEN-XF56MMF12R-002'),
(33, '2025-01-01 00:00:00.000', 11, 1, 'LEN-XF56MMF12R-003'),
(34, '2025-01-01 00:00:00.000', 12, 1, 'LEN-SIGMA2470M-001'),
(35, '2025-01-01 00:00:00.000', 12, 1, 'LEN-SIGMA2470M-002'),
(36, '2025-01-01 00:00:00.000', 12, 1, 'LEN-SIGMA2470M-003'),
(37, '2025-01-01 00:00:00.000', 13, 1, 'LEN-TAMRON2875-001'),
(38, '2025-01-01 00:00:00.000', 13, 1, 'LEN-TAMRON2875-002'),
(39, '2025-01-01 00:00:00.000', 13, 1, 'LEN-TAMRON2875-003'),
(40, '2025-01-01 00:00:00.000', 14, 1, 'DRN-MAVIC3CLAS-001'),
(41, '2025-01-01 00:00:00.000', 14, 1, 'DRN-MAVIC3CLAS-002'),
(42, '2025-01-01 00:00:00.000', 14, 1, 'DRN-MAVIC3CLAS-003'),
(43, '2025-01-01 00:00:00.000', 15, 1, 'DRN-MINI4PRO-001'),
(44, '2025-01-01 00:00:00.000', 15, 1, 'DRN-MINI4PRO-002'),
(45, '2025-01-01 00:00:00.000', 15, 1, 'DRN-MINI4PRO-003'),
(46, '2025-01-01 00:00:00.000', 16, 1, 'GMB-RS3PRO-001'),
(47, '2025-01-01 00:00:00.000', 16, 1, 'GMB-RS3PRO-002'),
(48, '2025-01-01 00:00:00.000', 16, 1, 'GMB-RS3PRO-003'),
(49, '2025-01-01 00:00:00.000', 17, 1, 'FLH-AD200PRO-001'),
(50, '2025-01-01 00:00:00.000', 17, 1, 'FLH-AD200PRO-002'),
(51, '2025-01-01 00:00:00.000', 17, 1, 'FLH-AD200PRO-003'),
(52, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-SL60WII-001'),
(53, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-SL60WII-002'),
(54, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-SL60WII-003'),
(55, '2025-01-01 00:00:00.000', 19, 1, 'TRI-190XPROALU-001'),
(56, '2025-01-01 00:00:00.000', 19, 1, 'TRI-190XPROALU-002'),
(57, '2025-01-01 00:00:00.000', 19, 1, 'TRI-190XPROALU-003'),
(58, '2025-01-01 00:00:00.000', 20, 1, 'REC-H1NHANDYRE-001'),
(59, '2025-01-01 00:00:00.000', 20, 1, 'REC-H1NHANDYRE-002'),
(60, '2025-01-01 00:00:00.000', 20, 1, 'REC-H1NHANDYRE-003'),
(61, '2025-01-01 00:00:00.000', 21, 1, 'MIC-EW112PG4-001'),
(62, '2025-01-01 00:00:00.000', 21, 1, 'MIC-EW112PG4-002'),
(63, '2025-01-01 00:00:00.000', 21, 1, 'MIC-EW112PG4-003'),
(64, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-001'),
(65, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-002'),
(66, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-003'),
(67, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-004'),
(68, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-005'),
(69, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-006'),
(70, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-007'),
(71, '2025-01-01 00:00:00.000', 22, 1, 'BAT-MINI4PROIN-008'),
(72, '2025-01-01 00:00:00.000', 23, 1, 'GOP-GOPROV5720-001'),
(73, '2025-01-01 00:00:00.000', 23, 1, 'GOP-GOPROV5720-002'),
(74, '2025-01-01 00:00:00.000', 23, 1, 'GOP-GOPROV5720-003'),
(75, '2025-01-01 00:00:00.000', 24, 1, 'CAM-A7SIII-001'),
(76, '2025-01-01 00:00:00.000', 24, 1, 'CAM-A7SIII-002'),
(77, '2025-01-01 00:00:00.000', 24, 1, 'CAM-A7SIII-003'),
(78, '2025-01-01 00:00:00.000', 25, 1, 'CAM-LUMIXS5II-001'),
(79, '2025-01-01 00:00:00.000', 25, 1, 'CAM-LUMIXS5II-002'),
(80, '2025-01-01 00:00:00.000', 25, 1, 'CAM-LUMIXS5II-003'),
(81, '2025-01-01 00:00:00.000', 26, 1, 'CAM-SL2S-001'),
(82, '2025-01-01 00:00:00.000', 26, 1, 'CAM-SL2S-002'),
(83, '2025-01-01 00:00:00.000', 26, 1, 'CAM-SL2S-003'),
(84, '2025-01-01 00:00:00.000', 27, 1, 'CAM-POCKETCINE-001'),
(85, '2025-01-01 00:00:00.000', 27, 1, 'CAM-POCKETCINE-002'),
(86, '2025-01-01 00:00:00.000', 27, 1, 'CAM-POCKETCINE-003'),
(87, '2025-01-01 00:00:00.000', 28, 1, 'LEN-RF50MMF12L-001'),
(88, '2025-01-01 00:00:00.000', 28, 1, 'LEN-RF50MMF12L-002'),
(89, '2025-01-01 00:00:00.000', 28, 1, 'LEN-RF50MMF12L-003'),
(90, '2025-01-01 00:00:00.000', 29, 1, 'LEN-FE2470MMF2-001'),
(91, '2025-01-01 00:00:00.000', 29, 1, 'LEN-FE2470MMF2-002'),
(92, '2025-01-01 00:00:00.000', 29, 1, 'LEN-FE2470MMF2-003'),
(93, '2025-01-01 00:00:00.000', 30, 1, 'LEN-Z70200MMF2-001'),
(94, '2025-01-01 00:00:00.000', 30, 1, 'LEN-Z70200MMF2-002'),
(95, '2025-01-01 00:00:00.000', 30, 1, 'LEN-Z70200MMF2-003'),
(96, '2025-01-01 00:00:00.000', 31, 1, 'LEN-XF1655MMF2-001'),
(97, '2025-01-01 00:00:00.000', 31, 1, 'LEN-XF1655MMF2-002'),
(98, '2025-01-01 00:00:00.000', 31, 1, 'LEN-XF1655MMF2-003'),
(105, '2025-01-01 00:00:00.000', 34, 1, 'DRN-AIR3-001'),
(106, '2025-01-01 00:00:00.000', 34, 1, 'DRN-AIR3-002'),
(107, '2025-01-01 00:00:00.000', 34, 1, 'DRN-AIR3-003'),
(108, '2025-01-01 00:00:00.000', 35, 1, 'DRN-INSPIRE3-001'),
(109, '2025-01-01 00:00:00.000', 35, 1, 'DRN-INSPIRE3-002'),
(110, '2025-01-01 00:00:00.000', 35, 1, 'DRN-INSPIRE3-003'),
(111, '2025-01-01 00:00:00.000', 36, 1, 'FLH-V1-001'),
(112, '2025-01-01 00:00:00.000', 36, 1, 'FLH-V1-002'),
(113, '2025-01-01 00:00:00.000', 36, 1, 'FLH-V1-003'),
(114, '2025-01-01 00:00:00.000', 37, 1, 'FLH-AD300PRO-001'),
(115, '2025-01-01 00:00:00.000', 37, 1, 'FLH-AD300PRO-002'),
(116, '2025-01-01 00:00:00.000', 37, 1, 'FLH-AD300PRO-003'),
(117, '2025-01-01 00:00:00.000', 38, 1, 'LUZ-LS60X-001'),
(118, '2025-01-01 00:00:00.000', 38, 1, 'LUZ-LS60X-002'),
(119, '2025-01-01 00:00:00.000', 38, 1, 'LUZ-LS60X-003'),
(120, '2025-01-01 00:00:00.000', 39, 1, 'LUZ-FORZA60B-001'),
(121, '2025-01-01 00:00:00.000', 39, 1, 'LUZ-FORZA60B-002'),
(122, '2025-01-01 00:00:00.000', 39, 1, 'LUZ-FORZA60B-003'),
(123, '2025-01-01 00:00:00.000', 40, 1, 'GMB-CRANE3S-001'),
(124, '2025-01-01 00:00:00.000', 40, 1, 'GMB-CRANE3S-002'),
(125, '2025-01-01 00:00:00.000', 40, 1, 'GMB-CRANE3S-003'),
(126, '2025-01-01 00:00:00.000', 41, 1, 'REC-H6-001'),
(127, '2025-01-01 00:00:00.000', 41, 1, 'REC-H6-002'),
(128, '2025-01-01 00:00:00.000', 41, 1, 'REC-H6-003'),
(129, '2025-01-01 00:00:00.000', 42, 1, 'MIC-WIRELESSGO-001'),
(130, '2025-01-01 00:00:00.000', 42, 1, 'MIC-WIRELESSGO-002'),
(131, '2025-01-01 00:00:00.000', 42, 1, 'MIC-WIRELESSGO-003'),
(132, '2025-01-01 00:00:00.000', 43, 1, 'MIC-AT2020-001'),
(133, '2025-01-01 00:00:00.000', 43, 1, 'MIC-AT2020-002'),
(134, '2025-01-01 00:00:00.000', 43, 1, 'MIC-AT2020-003'),
(135, '2025-01-01 00:00:00.000', 44, 1, 'MIC-MKH416-001'),
(136, '2025-01-01 00:00:00.000', 44, 1, 'MIC-MKH416-002'),
(137, '2025-01-01 00:00:00.000', 44, 1, 'MIC-MKH416-003'),
(138, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-001'),
(139, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-002'),
(140, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-003'),
(141, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-004'),
(142, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-005'),
(143, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-006'),
(144, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-007'),
(145, '2025-01-01 00:00:00.000', 45, 1, 'BAT-NPFZ100-008'),
(146, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-001'),
(147, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-002'),
(148, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-003'),
(149, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-004'),
(150, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-005'),
(151, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-006'),
(152, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-007'),
(153, '2025-01-01 00:00:00.000', 46, 1, 'BAT-LPE6NH-008'),
(154, '2025-01-01 00:00:00.000', 47, 1, 'GOP-HERO12BLAC-001'),
(155, '2025-01-01 00:00:00.000', 47, 1, 'GOP-HERO12BLAC-002'),
(156, '2025-01-01 00:00:00.000', 47, 1, 'GOP-HERO12BLAC-003'),
(157, '2025-01-01 00:00:00.000', 48, 1, 'MNP-XPROMONOPO-001'),
(158, '2025-01-01 00:00:00.000', 48, 1, 'MNP-XPROMONOPO-002'),
(159, '2025-01-01 00:00:00.000', 48, 1, 'MNP-XPROMONOPO-003'),
(160, '2025-01-01 00:00:00.000', 49, 1, 'SLD-K360CMSLID-001'),
(161, '2025-01-01 00:00:00.000', 49, 1, 'SLD-K360CMSLID-002'),
(162, '2025-01-01 00:00:00.000', 49, 1, 'SLD-K360CMSLID-003'),
(163, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-001'),
(164, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-002'),
(165, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-003'),
(166, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-004'),
(167, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-005'),
(168, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-006'),
(169, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-007'),
(170, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-008'),
(171, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-009'),
(172, '2025-01-01 00:00:00.000', 50, 1, 'SD-EXTREMEPRO-010'),
(173, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-001'),
(174, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-002'),
(175, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-003'),
(176, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-004'),
(177, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-005'),
(178, '2025-01-01 00:00:00.000', 51, 1, 'SSD-T71TB-006'),
(179, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-001'),
(180, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-002'),
(181, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-003'),
(182, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-004'),
(183, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-005'),
(184, '2025-01-01 00:00:00.000', 52, 1, 'SSD-MYPASSPORT-006'),
(185, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-001'),
(186, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-002'),
(187, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-003'),
(188, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-004'),
(189, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-005'),
(190, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-006'),
(191, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-007'),
(192, '2025-01-01 00:00:00.000', 53, 1, 'BAT-ENEL15C-008'),
(193, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-001'),
(194, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-002'),
(195, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-003'),
(196, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-004'),
(197, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-005'),
(198, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-006'),
(199, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-007'),
(200, '2025-01-01 00:00:00.000', 54, 1, 'BAT-NPW235-008'),
(201, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-001'),
(202, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-002'),
(203, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-003'),
(204, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-004'),
(205, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-005'),
(206, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-006');
INSERT INTO `T_Equipo` (`PK_Eq_Cod`, `Eq_Fecha_Ingreso`, `FK_IMo_Cod`, `FK_EE_Cod`, `Eq_Serie`) VALUES
(207, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-007'),
(208, '2025-01-01 00:00:00.000', 55, 1, 'BAT-DMWBLK22-008'),
(209, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-001'),
(210, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-002'),
(211, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-003'),
(212, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-004'),
(213, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-005'),
(214, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-006'),
(215, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-007'),
(216, '2025-01-01 00:00:00.000', 56, 1, 'BAT-BPSCL4-008'),
(217, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-001'),
(218, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-002'),
(219, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-003'),
(220, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-004'),
(221, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-005'),
(222, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-006'),
(223, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-007'),
(224, '2025-01-01 00:00:00.000', 57, 1, 'BAT-NPF570-008'),
(225, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-001'),
(226, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-002'),
(227, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-003'),
(228, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-004'),
(229, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-005'),
(230, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-006'),
(231, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-007'),
(232, '2025-01-01 00:00:00.000', 58, 1, 'BAT-MAVIC3INTE-008'),
(233, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-001'),
(234, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-002'),
(235, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-003'),
(236, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-004'),
(237, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-005'),
(238, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-006'),
(239, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-007'),
(240, '2025-01-01 00:00:00.000', 59, 1, 'BAT-AIR3INTELL-008'),
(241, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-001'),
(242, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-002'),
(243, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-003'),
(244, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-004'),
(245, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-005'),
(246, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-006'),
(247, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-007'),
(248, '2025-01-01 00:00:00.000', 60, 1, 'BAT-INSPIRE3TB-008'),
(249, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-001'),
(250, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-002'),
(251, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-003'),
(252, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-004'),
(253, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-005'),
(254, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-006'),
(255, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-007'),
(256, '2025-01-01 00:00:00.000', 61, 1, 'BAT-GOPROENDUR-008'),
(257, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-001'),
(258, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-002'),
(259, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-003'),
(260, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-004'),
(261, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-005'),
(262, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-006'),
(263, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-007'),
(264, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-008'),
(265, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-009'),
(266, '2025-01-01 00:00:00.000', 1, 1, 'CAM-ECO-R6M2-010'),
(267, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-001'),
(268, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-002'),
(269, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-003'),
(270, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-004'),
(271, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-005'),
(272, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-006'),
(273, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-007'),
(274, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-008'),
(275, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-009'),
(276, '2025-01-01 00:00:00.000', 6, 1, 'LEN-ECO-RF2470-010'),
(277, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-001'),
(278, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-002'),
(279, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-003'),
(280, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-004'),
(281, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-005'),
(282, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-006'),
(283, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-007'),
(284, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-008'),
(285, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-009'),
(286, '2025-01-01 00:00:00.000', 14, 1, 'DRN-ECO-M3CL-010'),
(287, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-001'),
(288, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-002'),
(289, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-003'),
(290, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-004'),
(291, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-005'),
(292, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-006'),
(293, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-007'),
(294, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-008'),
(295, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-009'),
(296, '2025-01-01 00:00:00.000', 17, 1, 'FLS-ECO-AD200-010'),
(297, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-001'),
(298, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-002'),
(299, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-003'),
(300, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-004'),
(301, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-005'),
(302, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-006'),
(303, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-007'),
(304, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-008'),
(305, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-009'),
(306, '2025-01-01 00:00:00.000', 19, 1, 'TRI-ECO-190X-010'),
(307, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-001'),
(308, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-002'),
(309, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-003'),
(310, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-004'),
(311, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-005'),
(312, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-006'),
(313, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-007'),
(314, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-008'),
(315, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-009'),
(316, '2025-01-01 00:00:00.000', 16, 1, 'GMB-ECO-RS3P-010'),
(317, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-001'),
(318, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-002'),
(319, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-003'),
(320, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-004'),
(321, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-005'),
(322, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-006'),
(323, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-007'),
(324, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-008'),
(325, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-009'),
(326, '2025-01-01 00:00:00.000', 20, 1, 'REC-ECO-H1N-010'),
(327, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-001'),
(328, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-002'),
(329, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-003'),
(330, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-004'),
(331, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-005'),
(332, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-006'),
(333, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-007'),
(334, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-008'),
(335, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-009'),
(336, '2025-01-01 00:00:00.000', 21, 1, 'MIC-ECO-EW112-010'),
(337, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-001'),
(338, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-002'),
(339, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-003'),
(340, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-004'),
(341, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-005'),
(342, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-006'),
(343, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-007'),
(344, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-008'),
(345, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-009'),
(346, '2025-01-01 00:00:00.000', 18, 1, 'LUZ-ECO-SL60-010'),
(347, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-001'),
(348, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-002'),
(349, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-003'),
(350, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-004'),
(351, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-005'),
(352, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-006'),
(353, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-007'),
(354, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-008'),
(355, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-009'),
(356, '2025-01-01 00:00:00.000', 46, 1, 'BAT-ECO-LPE6-010'),
(357, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-001'),
(358, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-002'),
(359, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-003'),
(360, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-004'),
(361, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-005'),
(362, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-006'),
(363, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-007'),
(364, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-008'),
(365, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-009'),
(366, '2025-01-01 00:00:00.000', 47, 1, 'GOP-ECO-H12-010'),
(367, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-001'),
(368, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-002'),
(369, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-003'),
(370, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-004'),
(371, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-005'),
(372, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-006'),
(373, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-007'),
(374, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-008'),
(375, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-009'),
(376, '2025-01-01 00:00:00.000', 48, 1, 'MNP-ECO-XPRO-010'),
(377, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-001'),
(378, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-002'),
(379, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-003'),
(380, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-004'),
(381, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-005'),
(382, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-006'),
(383, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-007'),
(384, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-008'),
(385, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-009'),
(386, '2025-01-01 00:00:00.000', 49, 1, 'SLD-ECO-K3-010'),
(387, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-001'),
(388, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-002'),
(389, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-003'),
(390, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-004'),
(391, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-005'),
(392, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-006'),
(393, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-007'),
(394, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-008'),
(395, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-009'),
(396, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-010'),
(397, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-001'),
(398, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-002'),
(399, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-003'),
(400, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-004'),
(401, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-005'),
(402, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-006'),
(403, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-007'),
(404, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-008'),
(405, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-009'),
(406, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-010');
INSERT INTO `T_Equipo` (`PK_Eq_Cod`, `Eq_Fecha_Ingreso`, `FK_IMo_Cod`, `FK_EE_Cod`, `Eq_Serie`) VALUES
(407, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-011'),
(408, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-012'),
(409, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-013'),
(410, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-014'),
(411, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-015'),
(412, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-016'),
(413, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-017'),
(414, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-018'),
(415, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-019'),
(416, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-020'),
(417, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-021'),
(418, '2025-01-01 00:00:00.000', 50, 1, 'SD-ECO-128-022'),
(419, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-011'),
(420, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-012'),
(421, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-013'),
(422, '2025-01-01 00:00:00.000', 51, 1, 'SSD-ECO-T7-014'),
(423, '2025-01-01 00:00:00.000', 52, 1, 'SSD-ECO-MP-007'),
(424, '2025-01-01 00:00:00.000', 52, 1, 'SSD-ECO-MP-008'),
(425, '2025-01-01 00:00:00.000', 52, 1, 'SSD-ECO-MP-009'),
(426, '2025-01-01 00:00:00.000', 52, 1, 'SSD-ECO-MP-010');
ALTER TABLE `T_Equipo` AUTO_INCREMENT = 427;


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
(1, 'Disponible'),
(2, 'En Mantenimiento'),
(3, 'De baja');
ALTER TABLE `T_Estado_Equipo` AUTO_INCREMENT = 4;


-- T_Estado_Pago
INSERT INTO `T_Estado_Pago` (`PK_ESP_Cod`, `ESP_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Parcial'),
(3, 'Pagado'),
(4, 'Vencido'),
(5, 'Anulado'),
(6, 'Cerrado');
ALTER TABLE `T_Estado_Pago` AUTO_INCREMENT = 7;


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
(5, 'Entregado', 5, 1),
(6, 'Cancelado', 6, 1);
ALTER TABLE `T_Estado_Proyecto` AUTO_INCREMENT = 7;


-- T_Estado_Proyecto_Dia
INSERT INTO `T_Estado_Proyecto_Dia` (`PK_EPD_Cod`, `EPD_Nombre`, `EPD_Orden`, `Activo`) VALUES
(1, 'Pendiente', 1, 1),
(2, 'En curso', 2, 1),
(3, 'Terminado', 3, 1),
(4, 'Suspendido', 4, 1),
(5, 'Cancelado', 5, 1);
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
INSERT INTO `T_EventoServicioCategoria` (`PK_ESC_Cod`, `ESC_Nombre`, `ESC_Tipo`, `ESC_Activo`) VALUES
(1, 'Standard', 'PAQUETE', 1),
(2, 'Deluxe', 'PAQUETE', 1),
(3, 'Premium', 'PAQUETE', 1),
(4, 'Corporate', 'PAQUETE', 1),
(5, 'Add-on', 'ADDON', 1);
ALTER TABLE `T_EventoServicioCategoria` AUTO_INCREMENT = 6;


-- T_EventoServicioEquipo
INSERT INTO `T_EventoServicioEquipo` (`PK_ExS_Equipo_Cod`, `FK_ExS_Cod`, `FK_TE_Cod`, `Cantidad`, `Notas`) VALUES
(1, 1, 1, 3, '1 camara por operador + 1 backup por servicio'),
(2, 1, 2, 2, 'Lentes 24-70/70-200 + backup'),
(3, 1, 4, 2, 'Flashes + backup'),
(4, 1, 5, 2, 'Tripodes + backup'),
(5, 1, 9, 1, 'Luz continua'),
(6, 1, 10, 3, 'Baterias base + 1 backup por servicio'),
(7, 1, 14, 2, 'Tarjetas SD (respaldo)'),
(8, 2, 1, 3, '1 camara por operador + 1 backup por servicio'),
(9, 2, 2, 3, 'Lentes adicionales + backup'),
(10, 2, 4, 3, 'Flashes + backup'),
(11, 2, 5, 3, 'Tripodes + backup'),
(12, 2, 9, 2, 'Luces continuas + backup'),
(13, 2, 10, 3, 'Baterias base + 1 backup por servicio'),
(14, 2, 12, 1, 'Monopode'),
(15, 2, 14, 4, 'Tarjetas SD (respaldo)'),
(16, 3, 1, 2, '1 camara por operador + 1 backup por servicio'),
(17, 3, 6, 2, 'Gimbal + backup'),
(18, 3, 8, 2, 'Microfonos + backup'),
(19, 3, 7, 2, 'Grabadora + backup'),
(20, 3, 5, 2, 'Tripodes + backup'),
(21, 3, 9, 1, 'Luz continua'),
(22, 3, 10, 2, 'Baterias base + 1 backup por servicio'),
(23, 3, 14, 2, 'Tarjetas SD (respaldo)'),
(24, 3, 15, 1, 'SSD (backup)'),
(25, 4, 1, 3, '1 camara por operador + 1 backup por servicio'),
(26, 4, 6, 3, 'Gimbal + backup'),
(27, 4, 8, 4, 'Microfonos + backup'),
(28, 4, 7, 2, 'Grabadora + backup'),
(29, 4, 5, 3, 'Tripodes + backup'),
(30, 4, 9, 3, 'Luces continuas + backup'),
(31, 4, 10, 3, 'Baterias base + 1 backup por servicio'),
(32, 4, 12, 1, 'Monopode'),
(33, 4, 13, 1, 'Slider'),
(34, 4, 14, 4, 'Tarjetas SD (respaldo)'),
(35, 4, 15, 2, 'SSD (backup)'),
(36, 5, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(37, 5, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(38, 5, 14, 2, 'Tarjetas SD (respaldo)'),
(39, 6, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(40, 6, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(41, 6, 14, 2, 'Tarjetas SD (respaldo)'),
(42, 7, 1, 2, '1 camara por operador + 1 backup por servicio'),
(43, 7, 5, 2, 'Tripode + backup'),
(44, 7, 9, 2, 'Luces continuas + backup'),
(45, 7, 10, 2, 'Baterias base + 1 backup por servicio'),
(46, 7, 14, 2, 'Tarjetas SD (respaldo)'),
(47, 8, 1, 2, '1 camara por operador + 1 backup por servicio'),
(48, 8, 2, 2, 'Lente + backup'),
(49, 8, 4, 2, 'Flash + backup'),
(50, 8, 5, 2, 'Tripode + backup'),
(51, 8, 10, 2, 'Baterias base + 1 backup por servicio'),
(52, 8, 14, 2, 'Tarjetas SD (respaldo)'),
(53, 9, 1, 2, '1 camara por operador + 1 backup por servicio'),
(54, 9, 2, 2, 'Lentes + backup'),
(55, 9, 4, 2, 'Flashes + backup'),
(56, 9, 5, 2, 'Tripodes + backup'),
(57, 9, 9, 1, 'Luz continua'),
(58, 9, 10, 2, 'Baterias base + 1 backup por servicio'),
(59, 9, 14, 2, 'Tarjetas SD (respaldo)'),
(60, 10, 1, 2, '1 camara por operador + 1 backup por servicio'),
(61, 10, 6, 2, 'Gimbal + backup'),
(62, 10, 8, 2, 'Microfono + backup'),
(63, 10, 7, 2, 'Grabadora + backup'),
(64, 10, 5, 2, 'Tripode + backup'),
(65, 10, 9, 1, 'Luz continua'),
(66, 10, 10, 2, 'Baterias base + 1 backup por servicio'),
(67, 10, 14, 2, 'Tarjetas SD (respaldo)'),
(68, 10, 15, 1, 'SSD (backup)'),
(69, 11, 1, 2, '1 camara por operador + 1 backup por servicio'),
(70, 11, 6, 2, 'Gimbal + backup'),
(71, 11, 8, 3, 'Microfonos + backup'),
(72, 11, 7, 2, 'Grabadora + backup'),
(73, 11, 5, 3, 'Tripodes + backup'),
(74, 11, 9, 2, 'Luces continuas + backup'),
(75, 11, 10, 2, 'Baterias base + 1 backup por servicio'),
(76, 11, 13, 1, 'Slider'),
(77, 11, 14, 2, 'Tarjetas SD (respaldo)'),
(78, 11, 15, 1, 'SSD (backup)'),
(79, 12, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(80, 12, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(81, 12, 14, 2, 'Tarjetas SD (respaldo)'),
(82, 13, 1, 2, '1 camara por operador + 1 backup por servicio'),
(83, 13, 5, 2, 'Tripode + backup'),
(84, 13, 9, 2, 'Luces continuas + backup'),
(85, 13, 10, 2, 'Baterias base + 1 backup por servicio'),
(86, 13, 14, 2, 'Tarjetas SD (respaldo)'),
(87, 14, 1, 2, '1 camara por operador + 1 backup por servicio'),
(88, 14, 2, 2, 'Lente + backup'),
(89, 14, 4, 2, 'Flash + backup'),
(90, 14, 5, 2, 'Tripode + backup'),
(91, 14, 9, 1, 'Luz continua'),
(92, 14, 10, 2, 'Baterias base + 1 backup por servicio'),
(93, 14, 14, 2, 'Tarjetas SD (respaldo)'),
(94, 15, 1, 3, '1 camara por operador + 1 backup por servicio'),
(95, 15, 2, 3, 'Lentes + backup'),
(96, 15, 4, 3, 'Flashes + backup'),
(97, 15, 5, 3, 'Tripodes + backup'),
(98, 15, 9, 2, 'Luces continuas + backup'),
(99, 15, 10, 3, 'Baterias base + 1 backup por servicio'),
(100, 15, 12, 1, 'Monopode'),
(101, 15, 14, 4, 'Tarjetas SD (respaldo)'),
(102, 16, 1, 3, '1 camara por operador + 1 backup por servicio'),
(103, 16, 6, 2, 'Gimbal + backup'),
(104, 16, 8, 3, 'Microfonos + backup'),
(105, 16, 7, 2, 'Grabadora + backup'),
(106, 16, 5, 3, 'Tripodes + backup'),
(107, 16, 9, 3, 'Luces continuas + backup'),
(108, 16, 10, 3, 'Baterias base + 1 backup por servicio'),
(109, 16, 12, 1, 'Monopode'),
(110, 16, 13, 1, 'Slider'),
(111, 16, 14, 4, 'Tarjetas SD (respaldo)'),
(112, 16, 15, 2, 'SSD (backup)'),
(113, 17, 1, 3, '1 camara por operador + 1 backup por servicio'),
(114, 17, 6, 3, 'Gimbal + backup'),
(115, 17, 8, 4, 'Microfonos + backup'),
(116, 17, 7, 2, 'Grabadora + backup'),
(117, 17, 5, 3, 'Tripodes + backup'),
(118, 17, 9, 3, 'Luces continuas + backup'),
(119, 17, 10, 3, 'Baterias base + 1 backup por servicio'),
(120, 17, 12, 1, 'Monopode'),
(121, 17, 13, 1, 'Slider'),
(122, 17, 14, 4, 'Tarjetas SD (respaldo)'),
(123, 17, 15, 2, 'SSD (backup)'),
(124, 18, 3, 2, '1 drone por piloto + 1 backup por servicio'),
(125, 18, 10, 3, 'Baterias para drone (2 por piloto) + 1 backup por servicio'),
(126, 18, 14, 2, 'Tarjetas SD (respaldo)'),
(127, 19, 1, 2, '1 camara por operador + 1 backup por servicio'),
(128, 19, 5, 2, 'Tripode + backup'),
(129, 19, 9, 2, 'Luces continuas + backup'),
(130, 19, 10, 2, 'Baterias base + 1 backup por servicio'),
(131, 19, 14, 2, 'Tarjetas SD (respaldo)'),
(132, 20, 1, 3, '1 camara por operador + 1 backup por servicio'),
(133, 20, 2, 3, 'Lentes + backup'),
(134, 20, 4, 3, 'Flashes + backup'),
(135, 20, 5, 3, 'Tripodes + backup'),
(136, 20, 9, 2, 'Luces continuas + backup'),
(137, 20, 10, 3, 'Baterias base + 1 backup por servicio'),
(138, 20, 12, 1, 'Monopode'),
(139, 20, 14, 4, 'Tarjetas SD (respaldo)');
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
(2, 'Cumpleaños', 'assets/images/cumpleanos.jpg', 1),
(3, 'Corporativo', 'assets/images/corporativo.jpg', 1);
ALTER TABLE `T_Eventos` AUTO_INCREMENT = 4;


-- T_PortafolioImagen
INSERT INTO `T_PortafolioImagen` (`PK_PI_Cod`, `FK_E_Cod`, `PI_Url`, `PI_Titulo`, `PI_Descripcion`, `PI_Orden`, `PI_Fecha_Creacion`) VALUES
(1, 3, '/uploads/portafolio/pf_1770864274899_970584086.jpg', 'Evento Huawei 1', 'Evento Fin de Ano Huawei, Diciembre 2025', 1, '2026-02-11 21:44:34'),
(2, 3, '/uploads/portafolio/pf_1770864274899_801243601.jpg', 'Evento Huawei 2', 'Evento de Fin de Ano Huawei, Diciembre 2025', 2, '2026-02-11 21:44:34'),
(3, 3, '/uploads/portafolio/pf_1770864274902_352093987.jpg', 'Evento Huawei 3', 'Evento de Fin de Ano Huawei, Diciembre 2025', 3, '2026-02-11 21:44:34'),
(4, 3, '/uploads/portafolio/pf_1770864274905_246157725.jpg', 'Evento Huawei 4', 'Evento de Fin de Ano Huawei, Diciembre 2025', 4, '2026-02-11 21:44:35'),
(5, 2, '/uploads/portafolio/pf_1770864274907_947979402.jpg', 'Cumpleanos Mary 1', 'Cumpleanos Mary, Marzo 2023', 5, '2026-02-11 21:44:35'),
(6, 2, '/uploads/portafolio/pf_1770864274911_272481863.jpg', 'Cumpleanos Alexandra 1', 'Cumpleanos Alexandra, Julio 2025', 6, '2026-02-11 21:44:35'),
(7, 1, '/uploads/portafolio/pf_1770864274913_490338420.avif', 'Boda Pedro y Maria 1', 'Boda Pedro y Maria 1, Junio 2023', 7, '2026-02-11 21:44:35'),
(8, 1, '/uploads/portafolio/pf_1770864274914_551006044.png', 'Boda Gladys y Pablo 1', 'Boda Gladys y Pablo 1, Enero 2026', 8, '2026-02-11 21:44:35'),
(9, 1, '/uploads/portafolio/pf_1770864274914_893239508.png', 'Boda George y Elizabeth 1', 'Boda George y Elizabeth 1, Septiembre 2023', 9, '2026-02-11 21:44:35'),
(10, 1, '/uploads/portafolio/pf_1770864274915_674476000.jpg', 'Boda Miguel y Andrea 1', 'Boda Miguel y Andrea 1, Marzo 2024', 10, '2026-02-11 21:44:35'),
(11, 1, '/uploads/portafolio/pf_1770864274917_636860719.jpg', 'Boda Melissa y Diego', 'Boda Melissa y Diego, Diciembre 2025', 11, '2026-02-11 21:44:35');
ALTER TABLE `T_PortafolioImagen` AUTO_INCREMENT = 12;


-- T_Marca
INSERT INTO `T_Marca` (`PK_IMa_Cod`, `NMa_Nombre`) VALUES
(1, 'Canon'),
(2, 'Sony'),
(3, 'Nikon'),
(4, 'Fujifilm'),
(5, 'DJI'),
(6, 'Godox'),
(7, 'Manfrotto'),
(8, 'Zoom'),
(9, 'Sennheiser'),
(10, 'Sigma'),
(11, 'Tamron'),
(12, 'Boya'),
(13, 'Panasonic'),
(14, 'Leica'),
(15, 'Blackmagic'),
(16, 'Rode'),
(17, 'Audio-Technica'),
(18, 'Aputure'),
(19, 'Nanlite'),
(20, 'Zhiyun'),
(21, 'Rokinon'),
(22, 'Samyang'),
(23, 'Tokina'),
(24, 'SanDisk'),
(25, 'Samsung'),
(26, 'WD'),
(27, 'Konova'),
(28, 'GoPro');
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


-- T_Servicios
INSERT INTO `T_Servicios` (`PK_S_Cod`, `S_Nombre`) VALUES
(1, 'Fotografia'),
(2, 'Video'),
(3, 'Drone'),
(4, 'Photobooth');
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
(1, 'Camara'),
(2, 'Lente'),
(3, 'Drone'),
(4, 'Flash'),
(5, 'Tripode'),
(6, 'Gimbal'),
(7, 'Grabadora'),
(8, 'Microfono'),
(9, 'Luz continua'),
(10, 'Bateria'),
(11, 'GoPro'),
(12, 'Monopode'),
(13, 'Slider'),
(14, 'Tarjeta SD'),
(15, 'SSD');
ALTER TABLE `T_Tipo_Equipo` AUTO_INCREMENT = 16;


-- T_Usuario
INSERT INTO `T_Usuario` (`PK_U_Cod`, `U_Nombre`, `U_Apellido`, `U_Correo`, `U_Contrasena`, `U_Celular`, `U_Numero_Documento`, `U_Direccion`, `FK_TD_Cod`) VALUES
(1, 'Carlos Alfredo', 'De La Cruz Jaramillo', 'delacruzcarlos1405@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '935771764', '17753529', 'Calle Francia', 1),
(2, 'john', 'doe', 'johndoe@gmail.com', 'aed5e5903cae9e439c0a6d373e9a444a96ad630f5ee529c6c7be863331a1877b', '913500023', '79805635', 'calle piura mz b4 lote 10', 1),
(4, 'Lucia', 'Garcia Lopez', 'lucia.garcia01@gmail.com', '9863328cc3a69b72d0ebf7a46def01ec7c812703b2e44919f045d31f20682560', '954558447', '58116003', 'Av. Los Olivos 100, Lima', 1),
(5, 'Mateo', 'Rodriguez Perez', 'mateo.rodriguez02@gmail.com', 'b67be0b75ac364bd070449ae6ca4cb1c76719b4682216138a09d207fd0dbb0c1', '904268281', '69452776', 'Calle Las Flores 103, Arequipa', 1),
(6, 'Sofia', 'Fernandez Diaz', 'sofia.fernandez03@gmail.com', '1138d0668ac6c8bee0cb0c2a24105d6f385dad901c2fa821f28f72cc459261eb', '922257847', '23580123', 'Jr. San Martin 106, Cusco', 1),
(7, 'Martin', 'Gonzalez Ruiz', 'martin.gonzalez04@gmail.com', '0feb3bc89c6f8c42324964a2ee672760fc70470fa63493b35ba4bc5ca531fddf', '931950128', '61550090', 'Av. La Marina 109, Trujillo', 1),
(8, 'Valentina', 'Sanchez Torres', 'valentina.sanchez05@gmail.com', 'ca641d4467fbbcdb2efb7b1bb4b27b6b2fa9aa578dfc6569c296da1baad12ec9', '917509687', '67254765', 'Calle Libertad 112, Piura', 1),
(9, 'Sebastian', 'Ramirez Castillo', 'sebastian.ramirez06@gmail.com', 'ae54726163babf013a631d05d8871c18e65409e8ff3df2e9b2502ca6ca4b0321', '988590929', '55927742', 'Av. El Sol 115, Chiclayo', 1),
(10, 'Camila', 'Vargas Rojas', 'camila.vargas07@gmail.com', '811a26ced78120ae97a1c2d618a826a45a50b7bb02164afc0993f40c1c0b52ee', '997575162', '71689614', 'Jr. Grau 118, Iquitos', 1),
(11, 'Nicolas', 'Flores Medina', 'nicolas.flores08@gmail.com', 'e2f3d34c1038953b13132fe20aed005a1a0dce39f86dc2cd232dcdd1a7bcb162', '981088905', '48644763', 'Calle Principal 121, Huancayo', 1),
(12, 'Daniela', 'Herrera Chavez', 'daniela.herrera09@gmail.com', '790a975b60c20470190ede24097a549dab6ef22fde7d323235fc7318c0133a8e', '917419300', '77080111', 'Av. Independencia 124, Tacna', 1),
(13, 'Alejandro', 'Silva Morales', 'alejandro.silva10@gmail.com', '67ec2f2cb6b3ad336536ae851b73a7f9be3be264e0d5ae940790b8a75aab8a7c', '976047070', '76494868', 'Calle Union 127, Puno', 1),
(14, 'Mariana', 'Mendoza Paredes', 'mariana.mendoza11@gmail.com', 'e3d06092c0dcde3608ef14d3771fca598fa91fbaec8b7f4b208ef68bf9d90ca6', '915128848', '57075185', 'Av. Los Olivos 130, Lima', 1),
(15, 'Diego', 'Rios Gutierrez', 'diego.rios12@gmail.com', '96f1c5456b83cb9e708b893b6a0fc9a4c3db2f3d9b833f66562efb941869589f', '904179778', '72078364', 'Calle Las Flores 133, Arequipa', 1),
(16, 'Renata', 'Navarro Salas', 'renata.navarro13@gmail.com', '437290057d47af46acc0990b61d9e64d70eadba61103d88862f6da5baf50c2aa', '933648864', '58795185', 'Jr. San Martin 136, Cusco', 1),
(17, 'Javier', 'Cruz Aguilar', 'javier.cruz14@gmail.com', 'a5f201bbe3b498706eafa82b5653af6a9bb4a30c8bf22c703f6749f0f792d1ca', '968817618', '43116352', 'Av. La Marina 139, Trujillo', 1),
(18, 'Paula', 'Ortega Campos', 'paula.ortega15@gmail.com', 'c89ee620547f2c30aafc6b835f623c99781045bd23513f57125eaff378378846', '965737407', '52153789', 'Calle Libertad 142, Piura', 1),
(19, 'Andres', 'Castro Nunez', 'andres.castro16@gmail.com', '3167fc76da1b864d1d5857b14d18f1eea3d3437278bc3355a8071bf66c6e030d', '925861535', '47479180', 'Av. El Sol 145, Chiclayo', 1),
(20, 'Gabriela', 'Suarez Vega', 'gabriela.suarez17@gmail.com', '01002972b94c4bca7458d7023a6d70944b6237eb7c904e0977ea1dae71dabedf', '920934824', '31641498', 'Jr. Grau 148, Iquitos', 1),
(21, 'Fernando', 'Ponce Cardenas', 'fernando.ponce18@gmail.com', 'ead39d8517405cbeda500e69721f51454e344928f49a41aade10358decac8916', '914305436', '57673019', 'Calle Principal 151, Huancayo', 1),
(22, 'Carolina', 'Delgado Palacios', 'carolina.delgado19@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '941567300', '71911799', 'Av. Independencia 154, Tacna', 1),
(23, 'Ricardo', 'Cabrera Leon', 'ricardo.cabrera20@gmail.com', '280dc73df5ccef8f90dd86950715f0aab8ff4c6386344b199f4d5720b0832990', '922739320', '48127618', 'Calle Union 157, Puno', 1),
(24, 'Ana', 'Ibarra Soto', 'ana.ibarra21@gmail.com', '6d28613c623affe281f2bbe82d630f1f402253b388c947e19c93b16c726e49ff', '913990641', '70986170', 'Av. Los Olivos 160, Lima', 1),
(25, 'Pedro', 'Reyes Romero', 'pedro.reyes22@gmail.com', '63040aeb6634a65a45c5b3873cf96a1445b0c3f750b9c6c66f27d0a8d0afcaab', '990086656', '49190960', 'Calle Las Flores 163, Arequipa', 1),
(26, 'Isabella', 'Luna Valdes', 'isabella.luna23@gmail.com', '26d57d021030d7ef6ed2bd08563733cc76feb90b45d58a36a79eb8688378d153', '963184451', '46800673', 'Jr. San Martin 166, Cusco', 1),
(27, 'Juan', 'Ramos Pena', 'juan.ramos24@gmail.com', '0d9ecfca383a4f5085c8ddbc3111339489b61efd431602db2402991e4ac64147', '925051686', '10977185', 'Av. La Marina 169, Trujillo', 1),
(28, 'Monica', 'Salazar Arias', 'monica.salazar25@gmail.com', '9d44414dd85043c3e91d8dd71e57110d6729382a1d9a400a64fa3e52275d38b3', '946433606', '60208656', 'Calle Libertad 172, Piura', 1),
(29, 'Carlos', 'Quispe Huaman', 'carlos.quispe26@gmail.com', 'a96e723718da115c11e06370f817be15dd3b856579820dc222b2dbf1083fa2d6', '995490674', '48228935', 'Av. El Sol 175, Chiclayo', 1),
(30, 'Florencia', 'Torres Mejia', 'florencia.torres27@gmail.com', 'b5ca4338897d7dc0312bbd837a10e8fc78f0f837b68fd810d17f9d8e07974cae', '937276134', '66545733', 'Jr. Grau 178, Iquitos', 1),
(31, 'Hugo', 'Alvarado Benitez', 'hugo.alvarado28@gmail.com', '5560f4db81c47eda7104996eeefa7be24a78d0655948cc162a20973f1a62d8ac', '999729854', '36452969', 'Calle Principal 181, Huancayo', 1),
(32, 'Natalia', 'Campos Farfan', 'natalia.campos29@gmail.com', '028ccc43a370457d952526da8d291db07625f72de2eed697a08a0273c2c41a93', '951453871', '46485284', 'Av. Independencia 184, Tacna', 1),
(33, 'Oscar', 'Espinoza Rivas', 'oscar.espinoza30@gmail.com', '7c7ce0ba23aa33714eea4028c298ab96e39e7d1b12e1436e379ff6876d2d640a', '941460359', '62255822', 'Calle Union 187, Puno', 1),
(34, 'Paolo', 'Paredes Rojas', 'paolo.paredes01@gmail.com', '615281f4c0e09a9f0fd5aadf4d98022c99630e431ff2fdfa946c598b6e40a78f', '957521583', '47485996', 'Av. Los Olivos 100, Lima', 1),
(35, 'Veronica', 'Chavez Silva', 'veronica.chavez02@gmail.com', '1fa272990466e80c8dddecc43a684c20a787d4c9783bb5fab00711dc59b82883', '934708165', '70776141', 'Calle Las Flores 103, Arequipa', 1),
(36, 'Rosa', 'Morales Quispe', 'rosa.morales03@gmail.com', 'ad0abeb5e300fbba581dbdcb42cbe9b06a52b93a0109ab9f9e6a0497274eb453', '993707285', '37469873', 'Jr. San Martin 106, Cusco', 1),
(37, 'Eduardo', 'Gutierrez Flores', 'eduardo.gutierrez04@gmail.com', '08afd38cbcfcf76abdb4d37362d51d0c8d8f1146e611c780f43f89056425c844', '965142306', '69341838', 'Av. La Marina 109, Trujillo', 1),
(38, 'Jimena', 'Salas Mendoza', 'jimena.salas05@gmail.com', 'f9151f8bea12f9e26e2fb1f97e420fcb3f84ed9efd165315e7523e3ac007e263', '946625772', '13417224', 'Calle Libertad 112, Piura', 1),
(39, 'Sergio', 'Vega Rios', 'sergio.vega06@gmail.com', '8241bf770bec39c8adbaea0d5782049ac4772bb6155dd396e90a60b63f89bf69', '942077358', '51399533', 'Av. El Sol 115, Chiclayo', 1),
(40, 'Claudia', 'Campos Luna', 'claudia.campos07@gmail.com', 'bdb2633a4df35ec4aeccebf3f492a6a327bc72041a67c9d00ae6bd756513be05', '905020550', '74883485', 'Jr. Grau 118, Iquitos', 1),
(41, 'Alvaro', 'Arias Ramos', 'alvaro.arias08@gmail.com', '9573a1682463d2b06ef2b2cae9dd87c2e77f6f71654b453ee5c16e1ea356ed89', '903917409', '17218787', 'Calle Principal 121, Huancayo', 1),
(42, 'Lorena', 'Pena Salazar', 'lorena.pena09@gmail.com', 'a16727b0a956c185af93b5bcc492335b25ad8e8e5db6a91db90a33f70c7fb80f', '902054002', '24595405', 'Av. Independencia 124, Tacna', 1),
(43, 'Tomas', 'Romero Ibarra', 'tomas.romero10@gmail.com', '4c41baffb70f58eda16951603024843e637d8c063bf1d57333efbafd1c173b38', '912971243', '10371157', 'Calle Union 127, Puno', 1),
(44, 'Patricia', 'Soto Reyes', 'patricia.soto11@gmail.com', '0d7c92adc8e502e6d8605deb00a10db6d3601e359aa187f6570ecbe475ce0765', '994213382', '68717687', 'Av. Los Olivos 130, Lima', 1),
(45, 'Luis', 'Leon Cabrera', 'luis.leon12@gmail.com', 'e8078208e48cdaab5a9b8e4eef676026e0f65af7658d02bf47254a427da7a770', '996564132', '18940605', 'Calle Las Flores 133, Arequipa', 1),
(46, 'Elena', 'Palacios Delgado', 'elena.palacios13@gmail.com', '0ee1d7b9d5264703256a9f59d0f9c1b5992bff0d229fadefe8fb11caad2f1a69', '965910532', '23397738', 'Jr. San Martin 136, Cusco', 1),
(47, 'Marco', 'Cardenas Ponce', 'marco.cardenas14@gmail.com', 'ed74b28afe618ac50615bc91994444b5e338276f4761a3e7d7eec0e146bedffa', '919755095', '51497596', 'Av. La Marina 139, Trujillo', 1),
(48, 'Raul', 'Nunez Castro', 'raul.nunez15@gmail.com', '7428b3eebd26d3d10db7fb281c2d5447502b519d3f94d4b194dfa85367c786d3', '920955639', '40237769', 'Calle Libertad 142, Piura', 1),
(49, 'Silvia', 'Vargas Suarez', 'silvia.vargas16@gmail.com', '56c4e1424d6e7b160197f6c00d62ac9994a91fd9af16f94ca35259c39f2e4fdf', '974706822', '36503599', 'Av. El Sol 145, Chiclayo', 1),
(50, 'Bruno', 'Aguilar Ortega', 'bruno.aguilar17@gmail.com', '78fcb5ae8034f81e703f86a7b4c96c75f1b0891b381059c445d930385b2c79d0', '966142244', '45970702', 'Jr. Grau 148, Iquitos', 1),
(51, 'Noelia', 'Benitez Alvarado', 'noelia.benitez18@gmail.com', '58e8b2e84d6f65487da01d51caa94f5f8fee5f320b9b4d1276c586f99e7daac1', '914985793', '23199014', 'Calle Principal 151, Huancayo', 1),
(52, 'Felipe', 'Mejia Torres', 'felipe.mejia19@gmail.com', '09dacd965fbff194d182c7694924e86b934c07be9b15517191ed476940c6db55', '909930028', '40376406', 'Av. Independencia 154, Tacna', 1),
(53, 'Rocio', 'Farfan Campos', 'rocio.farfan20@gmail.com', '120b658b6fbfcfcb70c86b5b1327a5294619b57001ecc48759d233fa1055cf36', '963536725', '42526794', 'Calle Union 157, Puno', 1),
(54, 'Esteban', 'Rivas Espinoza', 'esteban.rivas21@gmail.com', 'd3f3d4329229ec2fa69deeaa95860b7f95c856dd5102d111abca2b9323b16976', '931369771', '53162078', 'Av. Los Olivos 160, Lima', 1),
(55, 'Cecilia', 'Medina Herrera', 'cecilia.medina22@gmail.com', '1f67c4e41ffc2fc10efa21f0093f8902fbfd8caba2ab662bd3d6a3bdb79f5a1a', '955486607', '22344002', 'Calle Las Flores 163, Arequipa', 1),
(56, 'Ivan', 'Chavez Flores', 'ivan.chavez23@gmail.com', '12a8db8f3bf3978ec857124dc77b45a1d084cbf71255f206b027b50fcba42664', '995674343', '45067521', 'Jr. San Martin 166, Cusco', 1),
(57, 'Beatriz', 'Ruiz Gonzalez', 'beatriz.ruiz24@gmail.com', '9c574a77f18e99ab5c27654b8c00bceaf0bb129f06a52a9a22f0cf7b6e2ee78e', '936540489', '74051364', 'Av. La Marina 169, Trujillo', 1),
(58, 'German', 'Diaz Fernandez', 'german.diaz25@gmail.com', '214eac47ad6b3f1fa9ab5f1d896c20311dcf96f3500f3a4b776619347d62d217', '985728710', '31759661', 'Calle Libertad 172, Piura', 1),
(59, 'Sandra', 'Perez Rodriguez', 'sandra.perez26@gmail.com', '66e3236f0a70f3907dc91e9a99075dac8626e4e7608d4c99ba1ccab6c2263a08', '948625623', '53469902', 'Av. El Sol 175, Chiclayo', 1),
(60, 'Alonso', 'Lopez Garcia', 'alonso.lopez27@gmail.com', '9a7a52a65102436a4fe445852b456d41cda3bc47700c1d936803a2743ff35519', '906916601', '18832089', 'Jr. Grau 178, Iquitos', 1),
(61, 'Marta', 'Torres Sanchez', 'marta.torres28@gmail.com', '52b52c09f1e61358bbd704bd1f76455245a1288ccdbc57ba48979eaf2e5f5b86', '932146478', '74138882', 'Calle Principal 181, Huancayo', 1),
(62, 'Gonzalo', 'Castillo Ramirez', 'gonzalo.castillo29@gmail.com', '80fe91a7b87e38bad955c7597d0985d450139d95ab8ab16fe9951cce770b9e6f', '991571140', '22488850', 'Av. Independencia 184, Tacna', 1),
(63, 'Ines', 'Rojas Vargas', 'ines.rojas30@gmail.com', 'ac9371f9553f89d29c12415c7c384d48820b279d6db531182ff147a822abbf43', '985879518', '56982394', 'Calle Union 187, Puno', 1);
ALTER TABLE `T_Usuario` AUTO_INCREMENT = 64;


COMMIT;
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;
SET FOREIGN_KEY_CHECKS = 1;
