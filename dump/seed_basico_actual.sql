-- Seed basico generado desde la BD actual
-- Fecha: 2026-01-05T16:57:27.476Z

SET FOREIGN_KEY_CHECKS=0;

-- T_Estado_Cliente
INSERT INTO `T_Estado_Cliente` (`PK_ECli_Cod`, `ECli_Nombre`) VALUES
(1, 'Activo'),
(3, 'Inactivo');

-- T_Estado_Empleado
INSERT INTO `T_Estado_Empleado` (`PK_Estado_Emp_Cod`, `EsEm_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Estado_Equipo
INSERT INTO `T_Estado_Equipo` (`PK_EE_Cod`, `EE_Nombre`) VALUES
(13, 'De baja'),
(10, 'Disponible'),
(12, 'En Mantenimiento');

-- T_Estado_Pago
INSERT INTO `T_Estado_Pago` (`PK_ESP_Cod`, `ESP_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Parcial'),
(3, 'Pagado'),
(4, 'Vencido'),
(5, 'Anulado');

-- T_Estado_Pedido
INSERT INTO `T_Estado_Pedido` (`PK_EP_Cod`, `EP_Nombre`) VALUES
(1, 'Cotizado'),
(2, 'Contratado'),
(3, 'En ejecución'),
(4, 'Entregado'),
(5, 'Cerrado'),
(6, 'Cancelado');

-- T_Estado_Proyecto
INSERT INTO `T_Estado_Proyecto` (`PK_EPro_Cod`, `EPro_Nombre`, `EPro_Orden`, `Activo`) VALUES
(1, 'Planificado', 1, 1),
(2, 'En ejecucion', 2, 1),
(3, 'Entregado', 3, 1),
(4, 'Cerrado', 4, 1);

-- T_Estado_voucher
INSERT INTO `T_Estado_voucher` (`PK_EV_Cod`, `EV_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'Rechazado');

-- T_Metodo_Pago
INSERT INTO `T_Metodo_Pago` (`PK_MP_Cod`, `MP_Nombre`) VALUES
(1, 'Efectivo'),
(2, 'Transferencia');

-- T_Servicios
INSERT INTO `T_Servicios` (`PK_S_Cod`, `S_Nombre`) VALUES
(3, 'Drone'),
(1, 'Fotografia'),
(4, 'Photobooth'),
(2, 'Video');

-- T_Eventos
INSERT INTO `T_Eventos` (`PK_E_Cod`, `E_Nombre`, `E_IconUrl`) VALUES
(1, 'Boda', 'assets/images/boda.jpg'),
(2, 'Cumpleaños', 'assets/images/cumpleanos.jpg'),
(3, 'Corporativo', 'assets/images/corporativo.jpg');

-- T_EventoServicioCategoria
INSERT INTO `T_EventoServicioCategoria` (`PK_ESC_Cod`, `ESC_Nombre`, `ESC_Tipo`, `ESC_Activo`, `ESC_Fecha_Creacion`) VALUES
(1, 'Standard', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(2, 'Deluxe', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(3, 'Premium', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(4, 'Corporate', 'PAQUETE', 1, '2025-11-13 05:43:18'),
(5, 'Add-on', 'ADDON', 1, '2025-11-13 05:43:18');

-- T_EventoServicioEstado
INSERT INTO `T_EventoServicioEstado` (`PK_ESE_Cod`, `ESE_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Tipo_Empleado
INSERT INTO `T_Tipo_Empleado` (`PK_Tipo_Emp_Cod`, `TiEm_Cargo`, `TiEm_PermiteLogin`, `TiEm_OperativoCampo`) VALUES
(1, 'Fotografo', 0, 1),
(2, 'Videografo', 0, 1),
(3, 'Editor', 0, 0),
(4, 'Vendedor', 1, 0),
(5, 'Asistente', 0, 1),
(6, 'Piloto de dron', 0, 1);

-- T_Tipo_Equipo
INSERT INTO `T_Tipo_Equipo` (`PK_TE_Cod`, `TE_Nombre`) VALUES
(22, 'Bateria'),
(13, 'Cámara'),
(15, 'Drone'),
(16, 'Flash'),
(18, 'Gimbal'),
(23, 'GoPro'),
(19, 'Grabadora'),
(14, 'Lente'),
(21, 'Luz continua'),
(20, 'Micrófono'),
(17, 'Trípode');

-- T_Marca
INSERT INTO `T_Marca` (`PK_IMa_Cod`, `NMa_Nombre`) VALUES
(26, 'Boya'),
(15, 'Canon'),
(19, 'DJI'),
(18, 'Fujifilm'),
(20, 'Godox'),
(21, 'Manfrotto'),
(17, 'Nikon'),
(23, 'Sennheiser'),
(24, 'Sigma'),
(16, 'Sony'),
(25, 'Tamron'),
(22, 'Zoom');

-- T_Modelo
INSERT INTO `T_Modelo` (`PK_IMo_Cod`, `NMo_Nombre`, `FK_IMa_Cod`, `FK_TE_Cod`) VALUES
(25, 'EOS R6 Mark II', 15, 13),
(26, 'EOS R5', 15, 13),
(27, 'Alpha 7 IV (A7 IV)', 16, 13),
(28, 'Z6 II', 17, 13),
(29, 'X-T5', 18, 13),
(30, 'RF 24-70mm f/2.8L IS USM', 15, 14),
(31, 'RF 70-200mm f/2.8L IS USM', 15, 14),
(32, 'FE 35mm f/1.8', 16, 14),
(33, 'FE 85mm f/1.8', 16, 14),
(34, 'Nikkor Z 24-70mm f/2.8 S', 17, 14),
(35, 'XF 56mm f/1.2 R WR', 18, 14),
(36, 'Sigma 24-70mm f/2.8 DG DN Art (E-mount)', 24, 14),
(37, 'Tamron 28-75mm f/2.8 Di III VXD G2 (E-mount)', 25, 14),
(38, 'Mavic 3 Classic', 19, 15),
(39, 'Mini 4 Pro', 19, 15),
(40, 'RS 3 Pro', 19, 18),
(41, 'AD200Pro', 20, 16),
(42, 'SL60W II', 20, 21),
(43, '190XPRO Aluminium', 21, 17),
(44, 'H1n Handy Recorder', 22, 19),
(45, 'EW 112P G4', 23, 20),
(46, 'Mini 4 Pro Intelligent Flight Battery', 19, 22),
(47, 'GoPro v5.7 2025', 17, 23);

-- T_Usuario
INSERT INTO `T_Usuario` (`PK_U_Cod`, `U_Nombre`, `U_Apellido`, `U_Correo`, `U_Contrasena`, `U_Celular`, `U_Numero_Documento`, `U_Direccion`, `U_Fecha_Crea`, `U_Fecha_Upd`) VALUES
(1, 'Carlos Alfredo', 'De La Cruz Jaramillo', 'delacruzcarlos1405@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '931764349', '74034611', 'Calle Francia', '2025-10-21 05:37:39', '2025-10-29 10:10:59'),
(2, 'john', 'doe', 'johndoe@gmail.com', 'aed5e5903cae9e439c0a6d373e9a444a96ad630f5ee529c6c7be863331a1877b', '900000001', '00000001', 'calle piura mz b4 lote 10', '2026-01-05 04:44:04', '2026-01-05 05:00:16'),
(3, 'Lucía', 'García López', 'lucia.garcia01@example.com', '9863328cc3a69b72d0ebf7a46def01ec7c812703b2e44919f045d31f20682560', '900000002', '00000002', 'Av. Los Olivos 100, Lima', '2026-01-05 05:48:28', '2026-01-05 05:48:28');

-- T_Cliente
INSERT INTO `T_Cliente` (`PK_Cli_Cod`, `FK_U_Cod`, `Cli_Tipo_Cliente`, `FK_ECli_Cod`) VALUES
(1, 1, 1, 1),
(2, 3, 1, 1);

-- T_Empleados
INSERT INTO `T_Empleados` (`PK_Em_Cod`, `FK_U_Cod`, `Em_Autonomo`, `FK_Tipo_Emp_Cod`, `FK_Estado_Emp_Cod`) VALUES
(1, 2, 'NO', 4, 1);

-- T_Equipo
INSERT INTO `T_Equipo` (`PK_Eq_Cod`, `Eq_Fecha_Ingreso`, `FK_IMo_Cod`, `FK_EE_Cod`, `Eq_Serie`) VALUES
(1, '2024-06-20 00:00:00', 25, 10, 'CN-R6M2-06302100-A1'),
(2, '2024-08-05 00:00:00', 25, 10, 'CN-R6M2-06302100-B3'),
(3, '2024-03-12 00:00:00', 26, 12, 'CN-R5-09304100-C7'),
(4, '2024-07-10 00:00:00', 27, 10, 'SN-A7IV-4291001-7789'),
(5, '2023-11-03 00:00:00', 28, 10, 'NK-Z6II-2211-AB88'),
(6, '2024-09-14 00:00:00', 29, 10, 'FJ-XT5-PE-2024-009'),
(7, '2024-06-20 00:00:00', 30, 10, 'RF2470LIS-UV0123-A'),
(8, '2024-01-10 00:00:00', 31, 10, 'RF70200LIS-UV0456-B'),
(9, '2024-07-08 00:00:00', 32, 10, 'SN-35F18-7781'),
(10, '2024-02-19 00:00:00', 33, 12, 'SN-85F18-4412'),
(11, '2023-12-02 00:00:00', 34, 12, 'Z-2470S-9911'),
(12, '2024-05-25 00:00:00', 35, 10, 'XF56-2024-5566'),
(13, '2024-04-30 00:00:00', 36, 10, 'SG-2470-DGDN-003'),
(14, '2024-07-30 00:00:00', 37, 10, 'TM-2875-G2-010'),
(15, '2024-02-05 00:00:00', 38, 13, 'DJI-M3C-883211'),
(16, '2024-07-18 00:00:00', 39, 10, 'DJI-M4P-229977'),
(17, '2024-04-30 00:00:00', 40, 12, 'DJI-RS3P-8899'),
(18, '2023-09-01 00:00:00', 41, 10, 'GDX-AD2P-1122'),
(19, '2024-05-09 00:00:00', 42, 10, 'GDX-SL60W2-7755'),
(20, '2022-12-18 00:00:00', 43, 10, 'MT190XPRO-AL-5566'),
(21, '2023-10-21 00:00:00', 44, 10, 'H1N-2023-PE-001'),
(22, '2024-03-11 00:00:00', 45, 12, 'G4-ENG-112P-7780'),
(23, '2025-10-25 00:00:00', 26, 13, 'CN-R5-09304100-C8'),
(28, '2025-10-25 00:00:00', 26, 10, 'CN-R5-09304100-C9');

-- T_EventoServicio
INSERT INTO `T_EventoServicio` (`PK_ExS_Cod`, `PK_S_Cod`, `PK_E_Cod`, `ExS_Titulo`, `FK_ESC_Cod`, `ExS_EsAddon`, `FK_ESE_Cod`, `ExS_Precio`, `ExS_Descripcion`, `ExS_Horas`, `ExS_FotosImpresas`, `ExS_TrailerMin`, `ExS_FilmMin`) VALUES
(10, 1, 1, 'Fotografia Boda Premium', 3, 0, 1, '1500.00', 'Cobertura completa (getting ready, ceremonia, recepcion) + album fine art', '10.0', 60, 0, 0),
(11, 1, 1, 'Fotografia Boda Deluxe', 2, 0, 1, '2500.00', 'Cobertura full day con dos equipos y album de lujo', '12.0', 100, 0, 0),
(12, 2, 1, 'Video Boda Ceremonia', 1, 0, 1, '800.00', 'Cobertura de ceremonia con entrega de highlight de 1 minuto', '4.0', NULL, 1, 15),
(13, 2, 1, 'Video Boda Cinematic', 3, 0, 1, '4000.00', 'Cobertura cinematografica full day + highlight 3 min + film 45 min', '12.0', NULL, 3, 45),
(14, 3, 1, 'Drone Boda Ceremonia', 5, 1, 1, '300.00', 'Tomas aereas de ceremonia y exteriores inmediatos', '2.0', NULL, NULL, NULL),
(15, 3, 1, 'Drone Boda Jornada Completa', 5, 1, 1, '800.00', 'Cobertura aerea durante todo el evento (piloto certificado)', '6.0', NULL, NULL, NULL),
(16, 4, 1, 'Photobooth Boda Glam', 5, 1, 1, '900.00', 'Photobooth glam 3h con props premium y album digital', '3.0', NULL, NULL, NULL),
(17, 1, 2, 'Fotografia Cumple Express', 1, 0, 1, '1200.00', 'Cobertura fotografica 4h con edicion basica', '4.0', 0, NULL, NULL),
(18, 1, 2, 'Fotografia Cumple Premium', 3, 0, 1, '1600.00', 'Cobertura fotografica 6h + album digital y impresiones', '6.0', 30, NULL, NULL),
(19, 2, 2, 'Video Cumple Celebracion', 1, 0, 1, '1500.00', 'Cobertura video 4h con highlight 90 segundos', '4.0', NULL, 2, 12),
(20, 2, 2, 'Video Cumple Signature', 3, 0, 1, '2000.00', 'Video 6h con highlight 3 min y film 20 min', '6.0', NULL, 3, 20),
(21, 3, 2, 'Drone Cumple Show', 5, 1, 1, '300.00', 'Tomas aereas show central y exteriores', '2.0', NULL, NULL, NULL),
(22, 4, 2, 'Photobooth Cumple Kids', 5, 1, 1, '500.00', 'Photobooth 3h con impresiones ilimitadas', '3.0', NULL, NULL, NULL),
(23, 1, 3, 'Fotografia Corporativa Retratos', 4, 0, 1, '500.00', 'Sesion de retratos ejecutivos en estudio portatil', '3.0', NULL, NULL, NULL),
(24, 1, 3, 'Fotografia Corporativa Evento', 4, 0, 1, '2500.00', 'Cobertura fotografica de congreso o lanzamiento (6h)', '6.0', NULL, NULL, NULL),
(25, 2, 3, 'Video Corporativo Conferencia', 4, 0, 1, '3000.00', 'Cobertura completa de conferencia con edicion resumen', '6.0', NULL, 2, 25),
(26, 2, 3, 'Video Corporativo Institucional', 4, 0, 1, '3500.00', 'Produccion de video institucional (entrevistas + broll)', '8.0', NULL, 1, 8),
(27, 3, 3, 'Drone Corporativo Exterior', 5, 1, 1, '400.00', 'Tomas aereas del local y planos de contexto', '3.0', NULL, NULL, NULL),
(28, 4, 3, 'Photobooth Corporativo Branding', 5, 1, 1, '600.00', 'Photobooth 3h con marco personalizado y envio inmediato', '3.0', NULL, NULL, NULL),
(29, 1, 2, 'Fotografía Cumpleaños Deluxe', 2, 0, 1, '3000.00', NULL, '8.0', 50, NULL, NULL);

-- Ajusta AUTO_INCREMENT para continuar desde MAX(id)+1
ALTER TABLE `T_Estado_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Pago` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Pedido` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Proyecto` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_voucher` AUTO_INCREMENT = 1;
ALTER TABLE `T_Metodo_Pago` AUTO_INCREMENT = 1;
ALTER TABLE `T_Servicios` AUTO_INCREMENT = 1;
ALTER TABLE `T_Eventos` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioCategoria` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioEstado` AUTO_INCREMENT = 1;
ALTER TABLE `T_Tipo_Empleado` AUTO_INCREMENT = 1;
ALTER TABLE `T_Tipo_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Marca` AUTO_INCREMENT = 1;
ALTER TABLE `T_Modelo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Usuario` AUTO_INCREMENT = 1;
ALTER TABLE `T_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Empleados` AUTO_INCREMENT = 1;
ALTER TABLE `T_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioEquipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioStaff` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS=1;
