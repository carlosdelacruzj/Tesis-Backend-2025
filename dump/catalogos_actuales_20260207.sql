-- Catalogos/estados actuales
-- Generated at 2026-02-07T03:52:19.266Z
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
(3, 'De baja'),
(1, 'Disponible'),
(2, 'En Mantenimiento');

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
(6, 'Cancelado'),
(7, 'Expirado');

-- T_Estado_Proyecto
INSERT INTO `T_Estado_Proyecto` (`PK_EPro_Cod`, `EPro_Nombre`, `EPro_Orden`, `Activo`) VALUES
(1, 'Planificado', 1, 1),
(2, 'En ejecucion', 2, 1),
(3, 'En postproducción', 3, 1),
(4, 'Listo para entrega', 4, 1),
(5, 'Entregado ', 5, 1);

-- T_Estado_Proyecto_Dia
INSERT INTO `T_Estado_Proyecto_Dia` (`PK_EPD_Cod`, `EPD_Nombre`, `EPD_Orden`, `Activo`, `created_at`, `updated_at`) VALUES
(1, 'Pendiente', 1, 1, '2026-01-28 19:06:46', '2026-01-28 19:06:46'),
(2, 'En curso', 2, 1, '2026-01-28 19:06:46', '2026-01-28 19:06:46'),
(3, 'Terminado', 3, 1, '2026-01-28 19:06:46', '2026-01-28 19:06:46'),
(4, 'Suspendido', 4, 1, '2026-01-28 19:06:46', '2026-01-28 19:06:46'),
(5, 'Cancelado', 5, 1, '2026-01-28 19:06:46', '2026-01-28 19:06:46');

-- T_Estado_voucher
INSERT INTO `T_Estado_voucher` (`PK_EV_Cod`, `EV_Nombre`) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'Rechazado');

-- T_TipoDocumento
INSERT INTO `T_TipoDocumento` (`PK_TD_Cod`, `TD_Codigo`, `TD_Nombre`, `TD_TipoDato`, `TD_TamMin`, `TD_TamMax`, `TD_Activo`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad', 'N', 8, 8, 1),
(2, 'CE', 'Carnet de Extranjeria', 'A', 1, 12, 1),
(3, 'RUC', 'Registro Unico de Contribuyentes', 'N', 11, 11, 1),
(4, 'PAS', 'Pasaporte', 'A', 1, 12, 1);

-- T_Tipo_Empleado
INSERT INTO `T_Tipo_Empleado` (`PK_Tipo_Emp_Cod`, `TiEm_Cargo`, `TiEm_PermiteLogin`, `TiEm_OperativoCampo`) VALUES
(1, 'Fotografo', 0, 1),
(2, 'Videografo', 0, 1),
(3, 'Editor', 0, 0),
(4, 'Vendedor', 1, 0),
(5, 'Asistente', 0, 1),
(6, 'Piloto de dron', 0, 1),
(7, 'Admin', 1, 0);

-- T_Tipo_Equipo
INSERT INTO `T_Tipo_Equipo` (`PK_TE_Cod`, `TE_Nombre`) VALUES
(10, 'Bateria'),
(1, 'Cámara'),
(3, 'Drone'),
(4, 'Flash'),
(6, 'Gimbal'),
(11, 'GoPro'),
(7, 'Grabadora'),
(2, 'Lente'),
(9, 'Luz continua'),
(8, 'Micrófono'),
(12, 'Monopode'),
(13, 'Slider'),
(15, 'SSD'),
(14, 'Tarjeta SD'),
(5, 'Trípode');

-- T_Metodo_Pago
INSERT INTO `T_Metodo_Pago` (`PK_MP_Cod`, `MP_Nombre`) VALUES
(1, 'Efectivo'),
(2, 'Transferencia');

-- T_Eventos
INSERT INTO `T_Eventos` (`PK_E_Cod`, `E_Nombre`, `E_IconUrl`, `E_MostrarPortafolio`) VALUES
(1, 'Boda', 'assets/images/boda.jpg', 1),
(2, 'Cumpleaños', 'assets/images/cumpleanos.jpg', 1),
(3, 'Corporativo', 'assets/images/corporativo.jpg', 1);

-- T_EventoServicioCategoria
INSERT INTO `T_EventoServicioCategoria` (`PK_ESC_Cod`, `ESC_Nombre`, `ESC_Tipo`, `ESC_Activo`, `ESC_Fecha_Creacion`) VALUES
(1, 'Standard', 'PAQUETE', 1, '2025-11-13 09:43:18'),
(2, 'Deluxe', 'PAQUETE', 1, '2025-11-13 09:43:18'),
(3, 'Premium', 'PAQUETE', 1, '2025-11-13 09:43:18'),
(4, 'Corporate', 'PAQUETE', 1, '2025-11-13 09:43:18'),
(5, 'Add-on', 'ADDON', 1, '2025-11-13 09:43:18');

-- T_EventoServicioEstado
INSERT INTO `T_EventoServicioEstado` (`PK_ESE_Cod`, `ESE_Nombre`) VALUES
(1, 'Activo'),
(2, 'Inactivo');

-- T_Servicios
INSERT INTO `T_Servicios` (`PK_S_Cod`, `S_Nombre`) VALUES
(3, 'Drone'),
(1, 'Fotografia'),
(4, 'Photobooth'),
(2, 'Video');

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
SET FOREIGN_KEY_CHECKS=1;