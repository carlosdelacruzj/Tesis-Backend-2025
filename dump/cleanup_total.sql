-- Limpieza transaccional y carga de seed basico normalizado
-- Ejecuta este archivo con el cliente mysql (SOURCE).

SET FOREIGN_KEY_CHECKS=0;

-- Transaccionales (hijos -> padres)
DELETE FROM `T_Voucher`;
DELETE FROM `T_Proyecto_Recurso`;
DELETE FROM `T_Equipo_Asignacion`;
DELETE FROM `T_Empleado_Asignacion`;
DELETE FROM `T_PedidoServicio`;
DELETE FROM `T_PedidoEvento`;
DELETE FROM `T_Proyecto`;
DELETE FROM `T_Pedido`;
DELETE FROM `T_CotizacionServicio`;
DELETE FROM `T_CotizacionEvento`;
DELETE FROM `T_Contrato`;
DELETE FROM `T_Cotizacion`;
DELETE FROM `T_Lead`;

-- Datos base que el seed vuelve a insertar (hijos -> padres)
DELETE FROM `T_EventoServicioStaff`;
DELETE FROM `T_EventoServicioEquipo`;
DELETE FROM `T_EventoServicio`;
DELETE FROM `T_Equipo`;
DELETE FROM `T_Modelo`;
DELETE FROM `T_Marca`;
DELETE FROM `T_Cliente`;
DELETE FROM `T_Empleados`;
DELETE FROM `T_Usuario`;
DELETE FROM `T_Tipo_Equipo`;
DELETE FROM `T_Tipo_Empleado`;
DELETE FROM `T_EventoServicioEstado`;
DELETE FROM `T_EventoServicioCategoria`;
DELETE FROM `T_Eventos`;
DELETE FROM `T_Servicios`;
DELETE FROM `T_Metodo_Pago`;
DELETE FROM `T_Estado_voucher`;
DELETE FROM `T_Estado_Proyecto`;
DELETE FROM `T_Estado_Pedido`;
DELETE FROM `T_Estado_Pago`;
DELETE FROM `T_Estado_Equipo`;
DELETE FROM `T_Estado_Empleado`;
DELETE FROM `T_Estado_Cliente`;

SET FOREIGN_KEY_CHECKS=1;

-- Carga el seed normalizado
-- Seed basico con IDs normalizados
-- Fecha: 2026-01-05T18:12:16.913Z

SET FOREIGN_KEY_CHECKS=0;

-- T_Estado_Cliente
INSERT INTO `T_Estado_Cliente` (`PK_ECli_Cod`, `ECli_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Estado_Empleado
INSERT INTO `T_Estado_Empleado` (`PK_Estado_Emp_Cod`, `EsEm_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Estado_Equipo
INSERT INTO `T_Estado_Equipo` (`PK_EE_Cod`, `EE_Nombre`) VALUES
(1, 'Disponible'),
(2, 'En Mantenimiento'),
(3, 'De baja');

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
(1, 'Fotografia'),
(2, 'Video'),
(3, 'Drone'),
(4, 'Photobooth');

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
(1, 'Cámara'),
(2, 'Lente'),
(3, 'Drone'),
(4, 'Flash'),
(5, 'Trípode'),
(6, 'Gimbal'),
(7, 'Grabadora'),
(8, 'Micrófono'),
(9, 'Luz continua'),
(10, 'Bateria'),
(11, 'GoPro');

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
(12, 'Boya');

-- T_Usuario
INSERT INTO `T_Usuario` (`PK_U_Cod`, `U_Nombre`, `U_Apellido`, `U_Correo`, `U_Contrasena`, `U_Celular`, `U_Numero_Documento`, `U_Direccion`, `U_Fecha_Crea`, `U_Fecha_Upd`) VALUES
(1, 'Carlos Alfredo', 'De La Cruz Jaramillo', 'delacruzcarlos1405@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '931764349', '74034611', 'Calle Francia', '2025-10-21 05:37:39', '2025-10-29 10:10:59'),
(2, 'john', 'doe', 'johndoe@gmail.com', 'aed5e5903cae9e439c0a6d373e9a444a96ad630f5ee529c6c7be863331a1877b', '900000001', '00000001', 'calle piura mz b4 lote 10', '2026-01-05 04:44:04', '2026-01-05 05:00:16'),
(3, 'Lucía', 'García López', 'lucia.garcia01@example.com', '9863328cc3a69b72d0ebf7a46def01ec7c812703b2e44919f045d31f20682560', '900000002', '00000002', 'Av. Los Olivos 100, Lima', '2026-01-05 05:48:28', '2026-01-05 05:48:28');

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
(23, 'GoPro v5.7 2025', 3, 11);

-- T_Cliente
INSERT INTO `T_Cliente` (`PK_Cli_Cod`, `FK_U_Cod`, `Cli_Tipo_Cliente`, `FK_ECli_Cod`) VALUES
(1, 1, 1, 1),
(2, 3, 1, 1);

-- T_Empleados
INSERT INTO `T_Empleados` (`PK_Em_Cod`, `FK_U_Cod`, `Em_Autonomo`, `FK_Tipo_Emp_Cod`, `FK_Estado_Emp_Cod`) VALUES
(1, 2, 'NO', 4, 1);

-- T_Equipo
INSERT INTO `T_Equipo` (`PK_Eq_Cod`, `Eq_Fecha_Ingreso`, `FK_IMo_Cod`, `FK_EE_Cod`, `Eq_Serie`) VALUES
(1, '2024-06-20 00:00:00', 1, 1, 'CN-R6M2-06302100-A1'),
(2, '2024-08-05 00:00:00', 1, 1, 'CN-R6M2-06302100-B3'),
(3, '2024-03-12 00:00:00', 2, 2, 'CN-R5-09304100-C7'),
(4, '2024-07-10 00:00:00', 3, 1, 'SN-A7IV-4291001-7789'),
(5, '2023-11-03 00:00:00', 4, 1, 'NK-Z6II-2211-AB88'),
(6, '2024-09-14 00:00:00', 5, 1, 'FJ-XT5-PE-2024-009'),
(7, '2024-06-20 00:00:00', 6, 1, 'RF2470LIS-UV0123-A'),
(8, '2024-01-10 00:00:00', 7, 1, 'RF70200LIS-UV0456-B'),
(9, '2024-07-08 00:00:00', 8, 1, 'SN-35F18-7781'),
(10, '2024-02-19 00:00:00', 9, 2, 'SN-85F18-4412'),
(11, '2023-12-02 00:00:00', 10, 2, 'Z-2470S-9911'),
(12, '2024-05-25 00:00:00', 11, 1, 'XF56-2024-5566'),
(13, '2024-04-30 00:00:00', 12, 1, 'SG-2470-DGDN-003'),
(14, '2024-07-30 00:00:00', 13, 1, 'TM-2875-G2-010'),
(15, '2024-02-05 00:00:00', 14, 3, 'DJI-M3C-883211'),
(16, '2024-07-18 00:00:00', 15, 1, 'DJI-M4P-229977'),
(17, '2024-04-30 00:00:00', 16, 2, 'DJI-RS3P-8899'),
(18, '2023-09-01 00:00:00', 17, 1, 'GDX-AD2P-1122'),
(19, '2024-05-09 00:00:00', 18, 1, 'GDX-SL60W2-7755'),
(20, '2022-12-18 00:00:00', 19, 1, 'MT190XPRO-AL-5566'),
(21, '2023-10-21 00:00:00', 20, 1, 'H1N-2023-PE-001'),
(22, '2024-03-11 00:00:00', 21, 2, 'G4-ENG-112P-7780'),
(23, '2025-10-25 00:00:00', 2, 3, 'CN-R5-09304100-C8'),
(24, '2025-10-25 00:00:00', 2, 1, 'CN-R5-09304100-C9');

-- T_EventoServicio
INSERT INTO `T_EventoServicio` (`PK_ExS_Cod`, `PK_S_Cod`, `PK_E_Cod`, `ExS_Titulo`, `FK_ESC_Cod`, `ExS_EsAddon`, `FK_ESE_Cod`, `ExS_Precio`, `ExS_Descripcion`, `ExS_Horas`, `ExS_FotosImpresas`, `ExS_TrailerMin`, `ExS_FilmMin`) VALUES
(1, 1, 1, 'Fotografia Boda Premium', 3, 0, 1, '1500.00', 'Cobertura completa (getting ready, ceremonia, recepcion) + album fine art', '10.0', 60, 0, 0),
(2, 1, 1, 'Fotografia Boda Deluxe', 2, 0, 1, '2500.00', 'Cobertura full day con dos equipos y album de lujo', '12.0', 100, 0, 0),
(3, 2, 1, 'Video Boda Ceremonia', 1, 0, 1, '800.00', 'Cobertura de ceremonia con entrega de highlight de 1 minuto', '4.0', NULL, 1, 15),
(4, 2, 1, 'Video Boda Cinematic', 3, 0, 1, '4000.00', 'Cobertura cinematografica full day + highlight 3 min + film 45 min', '12.0', NULL, 3, 45),
(5, 3, 1, 'Drone Boda Ceremonia', 5, 1, 1, '300.00', 'Tomas aereas de ceremonia y exteriores inmediatos', '2.0', NULL, NULL, NULL),
(6, 3, 1, 'Drone Boda Jornada Completa', 5, 1, 1, '800.00', 'Cobertura aerea durante todo el evento (piloto certificado)', '6.0', NULL, NULL, NULL),
(7, 4, 1, 'Photobooth Boda Glam', 5, 1, 1, '900.00', 'Photobooth glam 3h con props premium y album digital', '3.0', NULL, NULL, NULL),
(8, 1, 2, 'Fotografia Cumple Express', 1, 0, 1, '1200.00', 'Cobertura fotografica 4h con edicion basica', '4.0', 0, NULL, NULL),
(9, 1, 2, 'Fotografia Cumple Premium', 3, 0, 1, '1600.00', 'Cobertura fotografica 6h + album digital y impresiones', '6.0', 30, NULL, NULL),
(10, 2, 2, 'Video Cumple Celebracion', 1, 0, 1, '1500.00', 'Cobertura video 4h con highlight 90 segundos', '4.0', NULL, 2, 12),
(11, 2, 2, 'Video Cumple Signature', 3, 0, 1, '2000.00', 'Video 6h con highlight 3 min y film 20 min', '6.0', NULL, 3, 20),
(12, 3, 2, 'Drone Cumple Show', 5, 1, 1, '300.00', 'Tomas aereas show central y exteriores', '2.0', NULL, NULL, NULL),
(13, 4, 2, 'Photobooth Cumple Kids', 5, 1, 1, '500.00', 'Photobooth 3h con impresiones ilimitadas', '3.0', NULL, NULL, NULL),
(14, 1, 3, 'Fotografia Corporativa Retratos', 4, 0, 1, '500.00', 'Sesion de retratos ejecutivos en estudio portatil', '3.0', NULL, NULL, NULL),
(15, 1, 3, 'Fotografia Corporativa Evento', 4, 0, 1, '2500.00', 'Cobertura fotografica de congreso o lanzamiento (6h)', '6.0', NULL, NULL, NULL),
(16, 2, 3, 'Video Corporativo Conferencia', 4, 0, 1, '3000.00', 'Cobertura completa de conferencia con edicion resumen', '6.0', NULL, 2, 25),
(17, 2, 3, 'Video Corporativo Institucional', 4, 0, 1, '3500.00', 'Produccion de video institucional (entrevistas + broll)', '8.0', NULL, 1, 8),
(18, 3, 3, 'Drone Corporativo Exterior', 5, 1, 1, '400.00', 'Tomas aereas del local y planos de contexto', '3.0', NULL, NULL, NULL),
(19, 4, 3, 'Photobooth Corporativo Branding', 5, 1, 1, '600.00', 'Photobooth 3h con marco personalizado y envio inmediato', '3.0', NULL, NULL, NULL),
(20, 1, 2, 'Fotografía Cumpleaños Deluxe', 2, 0, 1, '3000.00', NULL, '8.0', 50, NULL, NULL);

-- Ajusta AUTO_INCREMENT para continuar desde MAX(id)+1
ALTER TABLE `T_Estado_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Empleado` AUTO_INCREMENT = 1;
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
ALTER TABLE `T_Usuario` AUTO_INCREMENT = 1;
ALTER TABLE `T_Modelo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Empleados` AUTO_INCREMENT = 1;
ALTER TABLE `T_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioEquipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioStaff` AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS=1;