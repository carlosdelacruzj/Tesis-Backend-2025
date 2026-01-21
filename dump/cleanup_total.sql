
-- Limpieza transaccional y carga de seed basico normalizado
-- Ejecuta este archivo con el cliente mysql (SOURCE).

SET FOREIGN_KEY_CHECKS=0;

-- Transaccionales (hijos -> padres)
DELETE FROM `T_Voucher`;
DELETE FROM `T_Proyecto_Recurso`;
DELETE FROM `T_Equipo_Asignacion`;
DELETE FROM `T_Empleado_Asignacion`;
DELETE FROM `T_PedidoServicioFecha`;
DELETE FROM `T_PedidoServicio`;
DELETE FROM `T_PedidoEvento`;
DELETE FROM `T_Proyecto`;
DELETE FROM `T_Pedido`;
DELETE FROM `T_CotizacionServicioFecha`;
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
DELETE FROM `T_Estado_Cotizacion`;
DELETE FROM `T_Estado_Pago`;
DELETE FROM `T_Estado_Equipo`;
DELETE FROM `T_Estado_Empleado`;
DELETE FROM `T_Estado_Cliente`;
DELETE FROM `T_TipoDocumento`;

SET FOREIGN_KEY_CHECKS=1;

-- Seed basico con IDs normalizados
-- Fecha: 2026-01-08T10:09:18.657Z
SET FOREIGN_KEY_CHECKS=0;
-- T_Estado_Cliente
INSERT INTO `T_Estado_Cliente` (`PK_ECli_Cod`, `ECli_Nombre`) VALUES(1, 'Activo'),(2, 'Inactivo');
-- T_Estado_Empleado
INSERT INTO `T_Estado_Empleado` (`PK_Estado_Emp_Cod`, `EsEm_Nombre`) VALUES(1, 'Activo'),(2, 'Inactivo');
-- T_Estado_Equipo
INSERT INTO `T_Estado_Equipo` (`PK_EE_Cod`, `EE_Nombre`) VALUES(1, 'Disponible'),(2, 'En Mantenimiento'),(3, 'De baja');
-- T_Estado_Pago
INSERT INTO `T_Estado_Pago` (`PK_ESP_Cod`, `ESP_Nombre`) VALUES(1, 'Pendiente'),(2, 'Parcial'),(3, 'Pagado'),(4, 'Vencido'),(5, 'Anulado');
-- T_Estado_Pedido
INSERT INTO `T_Estado_Pedido` (`PK_EP_Cod`, `EP_Nombre`) VALUES(1, 'Cotizado'),(2, 'Contratado'),(3, 'En ejecución'),(4, 'Entregado'),(5, 'Cerrado'),(6, 'Cancelado'),(7, 'Expirado');
-- T_Estado_Cotizacion
INSERT INTO `T_Estado_Cotizacion` (`PK_ECot_Cod`, `ECot_Nombre`) VALUES(1, 'Borrador'),(2, 'Enviada'),(3, 'Aceptada'),(4, 'Rechazada'),(5, 'Expirada');
-- T_Estado_Proyecto
INSERT INTO `T_Estado_Proyecto` (`PK_EPro_Cod`, `EPro_Nombre`, `EPro_Orden`, `Activo`) VALUES(1, 'Planificado', 1, 1),(2, 'En ejecucion', 2, 1),(3, 'Entregado', 3, 1),(4, 'Cerrado', 4, 1);
-- T_Estado_voucher
INSERT INTO `T_Estado_voucher` (`PK_EV_Cod`, `EV_Nombre`) VALUES(1, 'Pendiente'),(2, 'Aprobado'),(3, 'Rechazado');
-- T_Metodo_Pago
INSERT INTO `T_Metodo_Pago` (`PK_MP_Cod`, `MP_Nombre`) VALUES(1, 'Efectivo'),(2, 'Transferencia');
-- T_Servicios
INSERT INTO `T_Servicios` (`PK_S_Cod`, `S_Nombre`) VALUES(1, 'Fotografia'),(2, 'Video'),(3, 'Drone'),(4, 'Photobooth');
-- T_Eventos
INSERT INTO `T_Eventos` (`PK_E_Cod`, `E_Nombre`, `E_IconUrl`) VALUES(1, 'Boda', 'assets/images/boda.jpg'),(2, 'Cumpleaños', 'assets/images/cumpleanos.jpg'),(3, 'Corporativo', 'assets/images/corporativo.jpg');
-- T_EventoServicioCategoria
INSERT INTO `T_EventoServicioCategoria` (`PK_ESC_Cod`, `ESC_Nombre`, `ESC_Tipo`, `ESC_Activo`, `ESC_Fecha_Creacion`) VALUES(1, 'Standard', 'PAQUETE', 1, '2025-11-13 05:43:18'),(2, 'Deluxe', 'PAQUETE', 1, '2025-11-13 05:43:18'),(3, 'Premium', 'PAQUETE', 1, '2025-11-13 05:43:18'),(4, 'Corporate', 'PAQUETE', 1, '2025-11-13 05:43:18'),(5, 'Add-on', 'ADDON', 1, '2025-11-13 05:43:18');
-- T_EventoServicioEstado
INSERT INTO `T_EventoServicioEstado` (`PK_ESE_Cod`, `ESE_Nombre`) VALUES(1, 'Activo'),(2, 'Inactivo');
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
INSERT INTO `T_Tipo_Equipo` (`PK_TE_Cod`, `TE_Nombre`) VALUES(1, 'Cámara'),(2, 'Lente'),(3, 'Drone'),(4, 'Flash'),(5, 'Trípode'),(6, 'Gimbal'),(7, 'Grabadora'),(8, 'Micrófono'),(9, 'Luz continua'),(10, 'Bateria'),(11, 'GoPro'),(12, 'Monopode'),(13, 'Slider'),(14, 'Tarjeta SD'),(15, 'SSD');
-- T_TipoDocumento
INSERT INTO `T_TipoDocumento` (`PK_TD_Cod`, `TD_Codigo`, `TD_Nombre`, `TD_TipoDato`, `TD_TamMin`, `TD_TamMax`, `TD_Activo`) VALUES
(1, 'DNI', 'Documento Nacional de Identidad',  'N', 8, 8, TRUE),
(2, 'CE',  'Carnet de Extranjeria',            'A', 1, 12, TRUE),
(3, 'RUC', 'Registro Unico de Contribuyentes', 'N', 11, 11, TRUE),
(4, 'PAS', 'Pasaporte',                        'A', 1, 12, TRUE);
-- T_Marca
INSERT INTO `T_Marca` (`PK_IMa_Cod`, `NMa_Nombre`) VALUES(1, 'Canon'),(2, 'Sony'),(3, 'Nikon'),(4, 'Fujifilm'),(5, 'DJI'),(6, 'Godox'),(7, 'Manfrotto'),(8, 'Zoom'),(9, 'Sennheiser'),(10, 'Sigma'),(11, 'Tamron'),(12, 'Boya'),(13, 'Panasonic'),(14, 'Leica'),(15, 'Blackmagic'),(16, 'Rode'),(17, 'Audio-Technica'),(18, 'Aputure'),(19, 'Nanlite'),(20, 'Zhiyun'),(21, 'Rokinon'),(22, 'Samyang'),(23, 'Tokina'),(24, 'SanDisk'),(25, 'Samsung'),(26, 'WD'),(27, 'Konova'),(28, 'GoPro');
-- T_Usuario
INSERT INTO `T_Usuario` (`PK_U_Cod`, `U_Nombre`, `U_Apellido`, `U_Correo`, `U_Contrasena`, `U_Celular`, `U_Numero_Documento`, `FK_TD_Cod`, `U_Direccion`, `U_Fecha_Crea`, `U_Fecha_Upd`) VALUES
(1, 'Carlos Alfredo', 'De La Cruz Jaramillo', 'delacruzcarlos1405@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '931764349', '74034611', 1, 'Calle Francia', '2025-10-21 05:37:39', '2025-10-29 10:10:59'),
(2, 'john', 'doe', 'johndoe@gmail.com', 'aed5e5903cae9e439c0a6d373e9a444a96ad630f5ee529c6c7be863331a1877b', '900000001', '00000001', 1, 'calle piura mz b4 lote 10', '2026-01-05 04:44:04', '2026-01-05 05:00:16'),
(4, 'Lucía', 'García López', 'lucia.garcia01@gmail.com', '9863328cc3a69b72d0ebf7a46def01ec7c812703b2e44919f045d31f20682560', '900000002', '00000002', 1, 'Av. Los Olivos 100, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(5, 'Mateo', 'Rodríguez Pérez', 'mateo.rodriguez02@gmail.com', 'b67be0b75ac364bd070449ae6ca4cb1c76719b4682216138a09d207fd0dbb0c1', '900000003', '00000003', 1, 'Calle Las Flores 103, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(6, 'Sofía', 'Fernández Díaz', 'sofia.fernandez03@gmail.com', '1138d0668ac6c8bee0cb0c2a24105d6f385dad901c2fa821f28f72cc459261eb', '900000004', '00000004', 1, 'Jr. San Martín 106, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(7, 'Martín', 'González Ruiz', 'martin.gonzalez04@gmail.com', '0feb3bc89c6f8c42324964a2ee672760fc70470fa63493b35ba4bc5ca531fddf', '900000005', '00000005', 1, 'Av. La Marina 109, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(8, 'Valentina', 'Sánchez Torres', 'valentina.sanchez05@gmail.com', 'ca641d4467fbbcdb2efb7b1bb4b27b6b2fa9aa578dfc6569c296da1baad12ec9', '900000006', '00000006', 1, 'Calle Libertad 112, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(9, 'Sebastián', 'Ramírez Castillo', 'sebastian.ramirez06@gmail.com', 'ae54726163babf013a631d05d8871c18e65409e8ff3df2e9b2502ca6ca4b0321', '900000007', '00000007', 1, 'Av. El Sol 115, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(10, 'Camila', 'Vargas Rojas', 'camila.vargas07@gmail.com', '811a26ced78120ae97a1c2d618a826a45a50b7bb02164afc0993f40c1c0b52ee', '900000008', '00000008', 1, 'Jr. Grau 118, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(11, 'Nicolás', 'Flores Medina', 'nicolas.flores08@gmail.com', 'e2f3d34c1038953b13132fe20aed005a1a0dce39f86dc2cd232dcdd1a7bcb162', '900000009', '00000009', 1, 'Calle Principal 121, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(12, 'Daniela', 'Herrera Chávez', 'daniela.herrera09@gmail.com', '790a975b60c20470190ede24097a549dab6ef22fde7d323235fc7318c0133a8e', '900000010', '00000010', 1, 'Av. Independencia 124, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(13, 'Alejandro', 'Silva Morales', 'alejandro.silva10@gmail.com', '67ec2f2cb6b3ad336536ae851b73a7f9be3be264e0d5ae940790b8a75aab8a7c', '900000011', '00000011', 1, 'Calle Unión 127, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(14, 'Mariana', 'Mendoza Paredes', 'mariana.mendoza11@gmail.com', 'e3d06092c0dcde3608ef14d3771fca598fa91fbaec8b7f4b208ef68bf9d90ca6', '900000012', '00000012', 1, 'Av. Los Olivos 130, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(15, 'Diego', 'Ríos Gutiérrez', 'diego.rios12@gmail.com', '96f1c5456b83cb9e708b893b6a0fc9a4c3db2f3d9b833f66562efb941869589f', '900000013', '00000013', 1, 'Calle Las Flores 133, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(16, 'Renata', 'Navarro Salas', 'renata.navarro13@gmail.com', '437290057d47af46acc0990b61d9e64d70eadba61103d88862f6da5baf50c2aa', '900000014', '00000014', 1, 'Jr. San Martín 136, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(17, 'Javier', 'Cruz Aguilar', 'javier.cruz14@gmail.com', 'a5f201bbe3b498706eafa82b5653af6a9bb4a30c8bf22c703f6749f0f792d1ca', '900000015', '00000015', 1, 'Av. La Marina 139, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(18, 'Paula', 'Ortega Campos', 'paula.ortega15@gmail.com', 'c89ee620547f2c30aafc6b835f623c99781045bd23513f57125eaff378378846', '900000016', '00000016', 1, 'Calle Libertad 142, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(19, 'Andrés', 'Castro Núñez', 'andres.castro16@gmail.com', '3167fc76da1b864d1d5857b14d18f1eea3d3437278bc3355a8071bf66c6e030d', '900000017', '00000017', 1, 'Av. El Sol 145, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(20, 'Gabriela', 'Suárez Vega', 'gabriela.suarez17@gmail.com', '01002972b94c4bca7458d7023a6d70944b6237eb7c904e0977ea1dae71dabedf', '900000018', '00000018', 1, 'Jr. Grau 148, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(21, 'Fernando', 'Ponce Cárdenas', 'fernando.ponce18@gmail.com', 'ead39d8517405cbeda500e69721f51454e344928f49a41aade10358decac8916', '900000019', '00000019', 1, 'Calle Principal 151, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(22, 'Carolina', 'Delgado Palacios', 'carolina.delgado19@gmail.com', 'dc5907c97e503e37f9eae7e25e387e05bff7bca24b99f0cd89ec67e59ba2846e', '900000020', '00000020', 1, 'Av. Independencia 154, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(23, 'Ricardo', 'Cabrera León', 'ricardo.cabrera20@gmail.com', '280dc73df5ccef8f90dd86950715f0aab8ff4c6386344b199f4d5720b0832990', '900000021', '00000021', 1, 'Calle Unión 157, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(24, 'Ana', 'Ibarra Soto', 'ana.ibarra21@gmail.com', '6d28613c623affe281f2bbe82d630f1f402253b388c947e19c93b16c726e49ff', '900000022', '00000022', 1, 'Av. Los Olivos 160, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(25, 'Pedro', 'Reyes Romero', 'pedro.reyes22@gmail.com', '63040aeb6634a65a45c5b3873cf96a1445b0c3f750b9c6c66f27d0a8d0afcaab', '900000023', '00000023', 1, 'Calle Las Flores 163, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(26, 'Isabella', 'Luna Valdés', 'isabella.luna23@gmail.com', '26d57d021030d7ef6ed2bd08563733cc76feb90b45d58a36a79eb8688378d153', '900000024', '00000024', 1, 'Jr. San Martín 166, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(27, 'Juan', 'Ramos Peña', 'juan.ramos24@gmail.com', '0d9ecfca383a4f5085c8ddbc3111339489b61efd431602db2402991e4ac64147', '900000025', '00000025', 1, 'Av. La Marina 169, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(28, 'Mónica', 'Salazar Arias', 'monica.salazar25@gmail.com', '9d44414dd85043c3e91d8dd71e57110d6729382a1d9a400a64fa3e52275d38b3', '900000026', '00000026', 1, 'Calle Libertad 172, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(29, 'Carlos', 'Quispe Huamán', 'carlos.quispe26@gmail.com', 'a96e723718da115c11e06370f817be15dd3b856579820dc222b2dbf1083fa2d6', '900000027', '00000027', 1, 'Av. El Sol 175, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(30, 'Florencia', 'Torres Mejía', 'florencia.torres27@gmail.com', 'b5ca4338897d7dc0312bbd837a10e8fc78f0f837b68fd810d17f9d8e07974cae', '900000028', '00000028', 1, 'Jr. Grau 178, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(31, 'Hugo', 'Alvarado Benítez', 'hugo.alvarado28@gmail.com', '5560f4db81c47eda7104996eeefa7be24a78d0655948cc162a20973f1a62d8ac', '900000029', '00000029', 1, 'Calle Principal 181, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(32, 'Natalia', 'Campos Farfán', 'natalia.campos29@gmail.com', '028ccc43a370457d952526da8d291db07625f72de2eed697a08a0273c2c41a93', '900000030', '00000030', 1, 'Av. Independencia 184, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(33, 'Oscar', 'Espinoza Rivas', 'oscar.espinoza30@gmail.com', '7c7ce0ba23aa33714eea4028c298ab96e39e7d1b12e1436e379ff6876d2d640a', '900000031', '00000031', 1, 'Calle Unión 187, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(34, 'Paolo', 'Paredes Rojas', 'paolo.paredes01@gmail.com', '615281f4c0e09a9f0fd5aadf4d98022c99630e431ff2fdfa946c598b6e40a78f', '900000032', '00000032', 1, 'Av. Los Olivos 100, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(35, 'Verónica', 'Chávez Silva', 'veronica.chavez02@gmail.com', '1fa272990466e80c8dddecc43a684c20a787d4c9783bb5fab00711dc59b82883', '900000033', '00000033', 1, 'Calle Las Flores 103, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(36, 'Rosa', 'Morales Quispe', 'rosa.morales03@gmail.com', 'ad0abeb5e300fbba581dbdcb42cbe9b06a52b93a0109ab9f9e6a0497274eb453', '900000034', '00000034', 1, 'Jr. San Martín 106, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(37, 'Eduardo', 'Gutiérrez Flores', 'eduardo.gutierrez04@gmail.com', '08afd38cbcfcf76abdb4d37362d51d0c8d8f1146e611c780f43f89056425c844', '900000035', '00000035', 1, 'Av. La Marina 109, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(38, 'Jimena', 'Salas Mendoza', 'jimena.salas05@gmail.com', 'f9151f8bea12f9e26e2fb1f97e420fcb3f84ed9efd165315e7523e3ac007e263', '900000036', '00000036', 1, 'Calle Libertad 112, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(39, 'Sergio', 'Vega Ríos', 'sergio.vega06@gmail.com', '8241bf770bec39c8adbaea0d5782049ac4772bb6155dd396e90a60b63f89bf69', '900000037', '00000037', 1, 'Av. El Sol 115, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(40, 'Claudia', 'Campos Luna', 'claudia.campos07@gmail.com', 'bdb2633a4df35ec4aeccebf3f492a6a327bc72041a67c9d00ae6bd756513be05', '900000038', '00000038', 1, 'Jr. Grau 118, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(41, 'Álvaro', 'Arias Ramos', 'alvaro.arias08@gmail.com', '9573a1682463d2b06ef2b2cae9dd87c2e77f6f71654b453ee5c16e1ea356ed89', '900000039', '00000039', 1, 'Calle Principal 121, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(42, 'Lorena', 'Peña Salazar', 'lorena.pena09@gmail.com', 'a16727b0a956c185af93b5bcc492335b25ad8e8e5db6a91db90a33f70c7fb80f', '900000040', '00000040', 1, 'Av. Independencia 124, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(43, 'Tomás', 'Romero Ibarra', 'tomas.romero10@gmail.com', '4c41baffb70f58eda16951603024843e637d8c063bf1d57333efbafd1c173b38', '900000041', '00000041', 1, 'Calle Unión 127, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(44, 'Patricia', 'Soto Reyes', 'patricia.soto11@gmail.com', '0d7c92adc8e502e6d8605deb00a10db6d3601e359aa187f6570ecbe475ce0765', '900000042', '00000042', 1, 'Av. Los Olivos 130, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(45, 'Luis', 'León Cabrera', 'luis.leon12@gmail.com', 'e8078208e48cdaab5a9b8e4eef676026e0f65af7658d02bf47254a427da7a770', '900000043', '00000043', 1, 'Calle Las Flores 133, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(46, 'Elena', 'Palacios Delgado', 'elena.palacios13@gmail.com', '0ee1d7b9d5264703256a9f59d0f9c1b5992bff0d229fadefe8fb11caad2f1a69', '900000044', '00000044', 1, 'Jr. San Martín 136, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(47, 'Marco', 'Cárdenas Ponce', 'marco.cardenas14@gmail.com', 'ed74b28afe618ac50615bc91994444b5e338276f4761a3e7d7eec0e146bedffa', '900000045', '00000045', 1, 'Av. La Marina 139, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(48, 'Raúl', 'Núñez Castro', 'raul.nunez15@gmail.com', '7428b3eebd26d3d10db7fb281c2d5447502b519d3f94d4b194dfa85367c786d3', '900000046', '00000046', 1, 'Calle Libertad 142, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(49, 'Silvia', 'Vargas Suárez', 'silvia.vargas16@gmail.com', '56c4e1424d6e7b160197f6c00d62ac9994a91fd9af16f94ca35259c39f2e4fdf', '900000047', '00000047', 1, 'Av. El Sol 145, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(50, 'Bruno', 'Aguilar Ortega', 'bruno.aguilar17@gmail.com', '78fcb5ae8034f81e703f86a7b4c96c75f1b0891b381059c445d930385b2c79d0', '900000048', '00000048', 1, 'Jr. Grau 148, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(51, 'Noelia', 'Benítez Alvarado', 'noelia.benitez18@gmail.com', '58e8b2e84d6f65487da01d51caa94f5f8fee5f320b9b4d1276c586f99e7daac1', '900000049', '00000049', 1, 'Calle Principal 151, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(52, 'Felipe', 'Mejía Torres', 'felipe.mejia19@gmail.com', '09dacd965fbff194d182c7694924e86b934c07be9b15517191ed476940c6db55', '900000050', '00000050', 1, 'Av. Independencia 154, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(53, 'Rocío', 'Farfán Campos', 'rocio.farfan20@gmail.com', '120b658b6fbfcfcb70c86b5b1327a5294619b57001ecc48759d233fa1055cf36', '900000051', '00000051', 1, 'Calle Unión 157, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(54, 'Esteban', 'Rivas Espinoza', 'esteban.rivas21@gmail.com', 'd3f3d4329229ec2fa69deeaa95860b7f95c856dd5102d111abca2b9323b16976', '900000052', '00000052', 1, 'Av. Los Olivos 160, Lima', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(55, 'Cecilia', 'Medina Herrera', 'cecilia.medina22@gmail.com', '1f67c4e41ffc2fc10efa21f0093f8902fbfd8caba2ab662bd3d6a3bdb79f5a1a', '900000053', '00000053', 1, 'Calle Las Flores 163, Arequipa', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(56, 'Iván', 'Chávez Flores', 'ivan.chavez23@gmail.com', '12a8db8f3bf3978ec857124dc77b45a1d084cbf71255f206b027b50fcba42664', '900000054', '00000054', 1, 'Jr. San Martín 166, Cusco', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(57, 'Beatriz', 'Ruiz González', 'beatriz.ruiz24@gmail.com', '9c574a77f18e99ab5c27654b8c00bceaf0bb129f06a52a9a22f0cf7b6e2ee78e', '900000055', '00000055', 1, 'Av. La Marina 169, Trujillo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(58, 'Germán', 'Díaz Fernández', 'german.diaz25@gmail.com', '214eac47ad6b3f1fa9ab5f1d896c20311dcf96f3500f3a4b776619347d62d217', '900000056', '00000056', 1, 'Calle Libertad 172, Piura', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(59, 'Sandra', 'Pérez Rodríguez', 'sandra.perez26@gmail.com', '66e3236f0a70f3907dc91e9a99075dac8626e4e7608d4c99ba1ccab6c2263a08', '900000057', '00000057', 1, 'Av. El Sol 175, Chiclayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(60, 'Alonso', 'López García', 'alonso.lopez27@gmail.com', '9a7a52a65102436a4fe445852b456d41cda3bc47700c1d936803a2743ff35519', '900000058', '00000058', 1, 'Jr. Grau 178, Iquitos', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(61, 'Marta', 'Torres Sánchez', 'marta.torres28@gmail.com', '52b52c09f1e61358bbd704bd1f76455245a1288ccdbc57ba48979eaf2e5f5b86', '900000059', '00000059', 1, 'Calle Principal 181, Huancayo', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(62, 'Gonzalo', 'Castillo Ramírez', 'gonzalo.castillo29@gmail.com', '80fe91a7b87e38bad955c7597d0985d450139d95ab8ab16fe9951cce770b9e6f', '900000060', '00000060', 1, 'Av. Independencia 184, Tacna', '2026-01-08 12:00:00', '2026-01-08 12:00:00'),
(63, 'Inés', 'Rojas Vargas', 'ines.rojas30@gmail.com', 'ac9371f9553f89d29c12415c7c384d48820b279d6db531182ff147a822abbf43', '900000061', '00000061', 1, 'Calle Unión 187, Puno', '2026-01-08 12:00:00', '2026-01-08 12:00:00');
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
-- T_Cliente
INSERT INTO `T_Cliente` (`PK_Cli_Cod`, `FK_U_Cod`, `Cli_Tipo_Cliente`, `FK_ECli_Cod`) VALUES
(1, 1, 1, 1),
(2, 4, 1, 1),
(3, 5, 1, 1),
(4, 6, 1, 1),
(5, 7, 1, 1),
(6, 8, 1, 1),
(7, 9, 1, 1),
(8, 10, 1, 1),
(9, 11, 1, 1),
(10, 12, 1, 1),
(11, 13, 1, 1),
(12, 14, 1, 1),
(13, 15, 1, 1),
(14, 16, 1, 1),
(15, 17, 1, 1),
(16, 18, 1, 1),
(17, 19, 1, 1),
(18, 20, 1, 1),
(19, 21, 1, 1),
(20, 22, 1, 1),
(21, 23, 1, 1),
(22, 24, 1, 1),
(23, 25, 1, 1),
(24, 26, 1, 1),
(25, 27, 1, 1),
(26, 28, 1, 1),
(27, 29, 1, 1),
(28, 30, 1, 1),
(29, 31, 1, 1),
(30, 32, 1, 1),
(31, 33, 1, 1);
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
(256, '2025-01-01 00:00:00', 61, 1, 'BAT-GOPROENDUR-008');
-- T_EventoServicio
INSERT INTO `T_EventoServicio` (`PK_ExS_Cod`, `PK_S_Cod`, `PK_E_Cod`, `ExS_Titulo`, `FK_ESC_Cod`, `ExS_EsAddon`, `FK_ESE_Cod`, `ExS_Precio`, `ExS_Descripcion`, `ExS_Horas`, `ExS_FotosImpresas`, `ExS_TrailerMin`, `ExS_FilmMin`) VALUES(1, 1, 1, 'Fotografia Boda Premium', 3, 0, 1, '1500.00', 'Cobertura completa (getting ready, ceremonia, recepcion) + album fine art', '10.0', 60, 0, 0),(2, 1, 1, 'Fotografia Boda Deluxe', 2, 0, 1, '2500.00', 'Cobertura full day con dos equipos y album de lujo', '12.0', 100, 0, 0),(3, 2, 1, 'Video Boda Ceremonia', 1, 0, 1, '800.00', 'Cobertura de ceremonia con entrega de highlight de 1 minuto', '4.0', NULL, 1, 15),(4, 2, 1, 'Video Boda Cinematic', 3, 0, 1, '4000.00', 'Cobertura cinematografica full day + highlight 3 min + film 45 min', '12.0', NULL, 3, 45),(5, 3, 1, 'Drone Boda Ceremonia', 5, 1, 1, '300.00', 'Tomas aereas de ceremonia y exteriores inmediatos', '2.0', NULL, NULL, NULL),(6, 3, 1, 'Drone Boda Jornada Completa', 5, 1, 1, '800.00', 'Cobertura aerea durante todo el evento (piloto certificado)', '6.0', NULL, NULL, NULL),(7, 4, 1, 'Photobooth Boda Glam', 5, 1, 1, '900.00', 'Photobooth glam 3h con props premium y album digital', '3.0', NULL, NULL, NULL),(8, 1, 2, 'Fotografia Cumple Express', 1, 0, 1, '1200.00', 'Cobertura fotografica 4h con edicion basica', '4.0', 0, NULL, NULL),(9, 1, 2, 'Fotografia Cumple Premium', 3, 0, 1, '1600.00', 'Cobertura fotografica 6h + album digital y impresiones', '6.0', 30, NULL, NULL),(10, 2, 2, 'Video Cumple Celebracion', 1, 0, 1, '1500.00', 'Cobertura video 4h con highlight 90 segundos', '4.0', NULL, 2, 12),(11, 2, 2, 'Video Cumple Signature', 3, 0, 1, '2000.00', 'Video 6h con highlight 3 min y film 20 min', '6.0', NULL, 3, 20),(12, 3, 2, 'Drone Cumple Show', 5, 1, 1, '300.00', 'Tomas aereas show central y exteriores', '2.0', NULL, NULL, NULL),(13, 4, 2, 'Photobooth Cumple Kids', 5, 1, 1, '500.00', 'Photobooth 3h con impresiones ilimitadas', '3.0', NULL, NULL, NULL),(14, 1, 3, 'Fotografia Corporativa Retratos', 4, 0, 1, '500.00', 'Sesion de retratos ejecutivos en estudio portatil', '3.0', NULL, NULL, NULL),(15, 1, 3, 'Fotografia Corporativa Evento', 4, 0, 1, '2500.00', 'Cobertura fotografica de congreso o lanzamiento (6h)', '6.0', NULL, NULL, NULL),(16, 2, 3, 'Video Corporativo Conferencia', 4, 0, 1, '3000.00', 'Cobertura completa de conferencia con edicion resumen', '6.0', NULL, 2, 25),(17, 2, 3, 'Video Corporativo Institucional', 4, 0, 1, '3500.00', 'Produccion de video institucional (entrevistas + broll)', '8.0', NULL, 1, 8),(18, 3, 3, 'Drone Corporativo Exterior', 5, 1, 1, '400.00', 'Tomas aereas del local y planos de contexto', '3.0', NULL, NULL, NULL),(19, 4, 3, 'Photobooth Corporativo Branding', 5, 1, 1, '600.00', 'Photobooth 3h con marco personalizado y envio inmediato', '3.0', NULL, NULL, NULL),(20, 1, 2, 'Fotografía Cumpleaños Deluxe', 2, 0, 1, '3000.00', NULL, '8.0', 50, NULL, NULL);
-- T_EventoServicioEquipo
INSERT INTO `T_EventoServicioEquipo` (`PK_ExS_Equipo_Cod`, `FK_ExS_Cod`, `FK_TE_Cod`, `Cantidad`, `Notas`) VALUES
(1, 1, 1, 2, 'Camaras principales + backup'),
(2, 1, 2, 2, 'Lentes 24-70/70-200 + backup'),
(3, 1, 4, 2, 'Flashes + backup'),
(4, 1, 5, 2, 'Tripodes + backup'),
(5, 1, 9, 1, 'Luz continua'),
(6, 1, 10, 4, 'Baterias (2x por camara)'),
(7, 1, 14, 4, 'Tarjetas SD (respaldo)'),
(8, 2, 1, 3, 'Camaras principales + backup'),
(9, 2, 2, 3, 'Lentes adicionales + backup'),
(10, 2, 4, 3, 'Flashes + backup'),
(11, 2, 5, 3, 'Tripodes + backup'),
(12, 2, 9, 2, 'Luces continuas + backup'),
(13, 2, 10, 6, 'Baterias (2x por camara)'),
(14, 2, 12, 1, 'Monopode'),
(15, 2, 14, 6, 'Tarjetas SD (respaldo)'),
(16, 3, 1, 2, 'Camaras + backup'),
(17, 3, 6, 2, 'Gimbal + backup'),
(18, 3, 8, 2, 'Microfonos + backup'),
(19, 3, 7, 2, 'Grabadora + backup'),
(20, 3, 5, 2, 'Tripodes + backup'),
(21, 3, 9, 1, 'Luz continua'),
(22, 3, 10, 4, 'Baterias (2x por camara)'),
(23, 3, 14, 4, 'Tarjetas SD (respaldo)'),
(24, 3, 15, 2, 'SSD (backup)'),
(25, 4, 1, 4, 'Camaras principales + backup'),
(26, 4, 6, 3, 'Gimbal + backup'),
(27, 4, 8, 4, 'Microfonos + backup'),
(28, 4, 7, 2, 'Grabadora + backup'),
(29, 4, 5, 3, 'Tripodes + backup'),
(30, 4, 9, 3, 'Luces continuas + backup'),
(31, 4, 10, 8, 'Baterias (2x por camara)'),
(32, 4, 12, 1, 'Monopode'),
(33, 4, 13, 1, 'Slider'),
(34, 4, 14, 6, 'Tarjetas SD (respaldo)'),
(35, 4, 15, 3, 'SSD (backup)'),
(36, 5, 3, 2, 'Drone + backup'),
(37, 5, 10, 4, 'Baterias (2x por drone)'),
(38, 5, 14, 2, 'Tarjetas SD (respaldo)'),
(39, 6, 3, 2, 'Drone + backup'),
(40, 6, 10, 6, 'Baterias (2x por drone)'),
(41, 6, 14, 4, 'Tarjetas SD (respaldo)'),
(42, 7, 1, 2, 'Camara + backup'),
(43, 7, 5, 2, 'Tripode + backup'),
(44, 7, 9, 2, 'Luces continuas + backup'),
(45, 7, 10, 4, 'Baterias (2x por camara)'),
(46, 7, 14, 4, 'Tarjetas SD (respaldo)'),
(47, 8, 1, 2, 'Camara + backup'),
(48, 8, 2, 2, 'Lente + backup'),
(49, 8, 4, 2, 'Flash + backup'),
(50, 8, 5, 2, 'Tripode + backup'),
(51, 8, 10, 4, 'Baterias (2x por camara)'),
(52, 8, 14, 4, 'Tarjetas SD (respaldo)'),
(53, 9, 1, 2, 'Camaras + backup'),
(54, 9, 2, 2, 'Lentes + backup'),
(55, 9, 4, 2, 'Flashes + backup'),
(56, 9, 5, 2, 'Tripodes + backup'),
(57, 9, 9, 1, 'Luz continua'),
(58, 9, 10, 4, 'Baterias (2x por camara)'),
(59, 9, 14, 4, 'Tarjetas SD (respaldo)'),
(60, 10, 1, 2, 'Camara + backup'),
(61, 10, 6, 2, 'Gimbal + backup'),
(62, 10, 8, 2, 'Microfono + backup'),
(63, 10, 7, 2, 'Grabadora + backup'),
(64, 10, 5, 2, 'Tripode + backup'),
(65, 10, 9, 1, 'Luz continua'),
(66, 10, 10, 4, 'Baterias (2x por camara)'),
(67, 10, 14, 4, 'Tarjetas SD (respaldo)'),
(68, 10, 15, 2, 'SSD (backup)'),
(69, 11, 1, 3, 'Camaras + backup'),
(70, 11, 6, 2, 'Gimbal + backup'),
(71, 11, 8, 3, 'Microfonos + backup'),
(72, 11, 7, 2, 'Grabadora + backup'),
(73, 11, 5, 3, 'Tripodes + backup'),
(74, 11, 9, 2, 'Luces continuas + backup'),
(75, 11, 10, 6, 'Baterias (2x por camara)'),
(76, 11, 13, 1, 'Slider'),
(77, 11, 14, 6, 'Tarjetas SD (respaldo)'),
(78, 11, 15, 2, 'SSD (backup)'),
(79, 12, 3, 2, 'Drone + backup'),
(80, 12, 10, 4, 'Baterias (2x por drone)'),
(81, 12, 14, 2, 'Tarjetas SD (respaldo)'),
(82, 13, 1, 2, 'Camara + backup'),
(83, 13, 5, 2, 'Tripode + backup'),
(84, 13, 9, 2, 'Luces continuas + backup'),
(85, 13, 10, 4, 'Baterias (2x por camara)'),
(86, 13, 14, 4, 'Tarjetas SD (respaldo)'),
(87, 14, 1, 2, 'Camara + backup'),
(88, 14, 2, 2, 'Lente + backup'),
(89, 14, 4, 2, 'Flash + backup'),
(90, 14, 5, 2, 'Tripode + backup'),
(91, 14, 9, 1, 'Luz continua'),
(92, 14, 10, 4, 'Baterias (2x por camara)'),
(93, 14, 14, 4, 'Tarjetas SD (respaldo)'),
(94, 15, 1, 3, 'Camaras + backup'),
(95, 15, 2, 3, 'Lentes + backup'),
(96, 15, 4, 3, 'Flashes + backup'),
(97, 15, 5, 3, 'Tripodes + backup'),
(98, 15, 9, 2, 'Luces continuas + backup'),
(99, 15, 10, 6, 'Baterias (2x por camara)'),
(100, 15, 12, 1, 'Monopode'),
(101, 15, 14, 6, 'Tarjetas SD (respaldo)'),
(102, 16, 1, 3, 'Camaras + backup'),
(103, 16, 6, 2, 'Gimbal + backup'),
(104, 16, 8, 3, 'Microfonos + backup'),
(105, 16, 7, 2, 'Grabadora + backup'),
(106, 16, 5, 3, 'Tripodes + backup'),
(107, 16, 9, 3, 'Luces continuas + backup'),
(108, 16, 10, 6, 'Baterias (2x por camara)'),
(109, 16, 12, 1, 'Monopode'),
(110, 16, 13, 1, 'Slider'),
(111, 16, 14, 6, 'Tarjetas SD (respaldo)'),
(112, 16, 15, 3, 'SSD (backup)'),
(113, 17, 1, 4, 'Camaras + backup'),
(114, 17, 6, 3, 'Gimbal + backup'),
(115, 17, 8, 4, 'Microfonos + backup'),
(116, 17, 7, 2, 'Grabadora + backup'),
(117, 17, 5, 3, 'Tripodes + backup'),
(118, 17, 9, 3, 'Luces continuas + backup'),
(119, 17, 10, 8, 'Baterias (2x por camara)'),
(120, 17, 12, 1, 'Monopode'),
(121, 17, 13, 1, 'Slider'),
(122, 17, 14, 6, 'Tarjetas SD (respaldo)'),
(123, 17, 15, 3, 'SSD (backup)'),
(124, 18, 3, 2, 'Drone + backup'),
(125, 18, 10, 4, 'Baterias (2x por drone)'),
(126, 18, 14, 2, 'Tarjetas SD (respaldo)'),
(127, 19, 1, 2, 'Camara + backup'),
(128, 19, 5, 2, 'Tripode + backup'),
(129, 19, 9, 2, 'Luces continuas + backup'),
(130, 19, 10, 4, 'Baterias (2x por camara)'),
(131, 19, 14, 4, 'Tarjetas SD (respaldo)'),
(132, 20, 1, 3, 'Camaras + backup'),
(133, 20, 2, 3, 'Lentes + backup'),
(134, 20, 4, 3, 'Flashes + backup'),
(135, 20, 5, 3, 'Tripodes + backup'),
(136, 20, 9, 2, 'Luces continuas + backup'),
(137, 20, 10, 6, 'Baterias (2x por camara)'),
(138, 20, 12, 1, 'Monopode'),
(139, 20, 14, 6, 'Tarjetas SD (respaldo)');
-- T_EventoServicioStaff
INSERT INTO `T_EventoServicioStaff` (`PK_ExS_Staff_Cod`, `FK_ExS_Cod`, `Staff_Rol`, `Staff_Cantidad`) VALUES(1, 1, 'Fotografo', 2),(2, 1, 'Asistente', 1),(3, 2, 'Fotografo', 2),(4, 2, 'Asistente', 1),(5, 3, 'Videografo', 1),(6, 3, 'Asistente', 1),(7, 4, 'Videografo', 2),(8, 4, 'Asistente', 1),(9, 5, 'Piloto de dron', 1),(10, 6, 'Piloto de dron', 1),(11, 6, 'Asistente', 1),(12, 7, 'Fotografo', 1),(13, 7, 'Asistente', 1),(14, 8, 'Fotografo', 1),(15, 9, 'Fotografo', 2),(16, 9, 'Asistente', 1),(17, 10, 'Videografo', 1),(18, 10, 'Asistente', 1),(19, 11, 'Videografo', 1),(20, 11, 'Asistente', 1),(21, 12, 'Piloto de dron', 1),(22, 13, 'Asistente', 1),(23, 14, 'Fotografo', 1),(24, 14, 'Asistente', 1),(25, 15, 'Fotografo', 2),(26, 15, 'Asistente', 1),(27, 16, 'Videografo', 2),(28, 16, 'Asistente', 1),(29, 17, 'Videografo', 2),(30, 17, 'Asistente', 1),(31, 18, 'Piloto de dron', 1),(32, 19, 'Fotografo', 1),(33, 19, 'Asistente', 1),(34, 20, 'Fotografo', 2),(35, 20, 'Asistente', 1);
-- T_Cotizacion (seed con estado Expirada)
INSERT INTO `T_Cotizacion` (`PK_Cot_Cod`, `FK_Lead_Cod`, `Cot_TipoEvento`, `Cot_FechaEvento`, `Cot_Lugar`, `Cot_HorasEst`, `Cot_Mensaje`, `FK_ECot_Cod`, `Cot_Fecha_Crea`, `Cot_IdTipoEvento`, `FK_Cli_Cod`) VALUES
(1, NULL, 'Boda', '2025-12-10', 'Lima', 6.0, 'Cotizacion expirada de ejemplo', 5, '2025-11-01 10:00:00', 1, 1);
-- T_CotizacionServicio
INSERT INTO `T_CotizacionServicio` (`PK_CotServ_Cod`, `FK_Cot_Cod`, `FK_ExS_Cod`, `CS_EventoId`, `CS_ServicioId`, `CS_Nombre`, `CS_Descripcion`, `CS_Moneda`, `CS_PrecioUnit`, `CS_Cantidad`, `CS_Descuento`, `CS_Recargo`, `CS_Notas`, `CS_Horas`, `CS_Staff`, `CS_FotosImpresas`, `CS_TrailerMin`, `CS_FilmMin`) VALUES
(1, 1, 1, 1, 1, 'Fotografia Boda Premium', 'Cobertura completa + album', 'USD', 1500.00, 1, 0, 0, 'Estado expirada', 10.0, 2, 60, 0, 0);
-- T_CotizacionEvento
INSERT INTO `T_CotizacionEvento` (`PK_CotE_Cod`, `FK_Cot_Cod`, `CotE_Fecha`, `CotE_Hora`, `CotE_Ubicacion`, `CotE_Direccion`, `CotE_Notas`) VALUES
(1, 1, '2025-12-10', '18:00:00', 'Lima', 'Miraflores', 'Evento expirada');
-- T_Cotizacion (seed con estado Borrador)
INSERT INTO `T_Cotizacion` (`PK_Cot_Cod`, `FK_Lead_Cod`, `Cot_TipoEvento`, `Cot_FechaEvento`, `Cot_Lugar`, `Cot_HorasEst`, `Cot_Mensaje`, `FK_ECot_Cod`, `Cot_Fecha_Crea`, `Cot_IdTipoEvento`, `FK_Cli_Cod`) VALUES
(2, NULL, 'Cumpleaños', '2026-02-15', 'Arequipa', 4.0, 'Cotizacion borrador de ejemplo', 1, '2026-01-15 09:30:00', 2, 2);
-- T_CotizacionServicio
INSERT INTO `T_CotizacionServicio` (`PK_CotServ_Cod`, `FK_Cot_Cod`, `FK_ExS_Cod`, `CS_EventoId`, `CS_ServicioId`, `CS_Nombre`, `CS_Descripcion`, `CS_Moneda`, `CS_PrecioUnit`, `CS_Cantidad`, `CS_Descuento`, `CS_Recargo`, `CS_Notas`, `CS_Horas`, `CS_Staff`, `CS_FotosImpresas`, `CS_TrailerMin`, `CS_FilmMin`) VALUES
(2, 2, 8, 2, 1, 'Fotografia Cumple Express', 'Cobertura fotografica 4h con edicion basica', 'USD', 1200.00, 1, 0, 0, 'Estado borrador', 4.0, NULL, 0, NULL, NULL);
-- T_CotizacionEvento
INSERT INTO `T_CotizacionEvento` (`PK_CotE_Cod`, `FK_Cot_Cod`, `CotE_Fecha`, `CotE_Hora`, `CotE_Ubicacion`, `CotE_Direccion`, `CotE_Notas`) VALUES
(2, 2, '2026-02-15', '19:30:00', 'Arequipa', 'Cercado', 'Evento borrador');
-- T_Cotizacion (seed con estado Enviada)
INSERT INTO `T_Cotizacion` (`PK_Cot_Cod`, `FK_Lead_Cod`, `Cot_TipoEvento`, `Cot_FechaEvento`, `Cot_Lugar`, `Cot_HorasEst`, `Cot_Mensaje`, `FK_ECot_Cod`, `Cot_Fecha_Crea`, `Cot_IdTipoEvento`, `FK_Cli_Cod`) VALUES
(3, NULL, 'Corporativo', '2026-03-20', 'Lima', 6.0, 'Cotizacion enviada de ejemplo', 2, '2026-02-01 11:15:00', 3, 3);
-- T_CotizacionServicio
INSERT INTO `T_CotizacionServicio` (`PK_CotServ_Cod`, `FK_Cot_Cod`, `FK_ExS_Cod`, `CS_EventoId`, `CS_ServicioId`, `CS_Nombre`, `CS_Descripcion`, `CS_Moneda`, `CS_PrecioUnit`, `CS_Cantidad`, `CS_Descuento`, `CS_Recargo`, `CS_Notas`, `CS_Horas`, `CS_Staff`, `CS_FotosImpresas`, `CS_TrailerMin`, `CS_FilmMin`) VALUES
(3, 3, 16, 3, 2, 'Video Corporativo Conferencia', 'Cobertura completa de conferencia con edicion resumen', 'USD', 3000.00, 1, 0, 0, 'Estado enviada', 6.0, NULL, NULL, 2, 25);
-- T_CotizacionEvento
INSERT INTO `T_CotizacionEvento` (`PK_CotE_Cod`, `FK_Cot_Cod`, `CotE_Fecha`, `CotE_Hora`, `CotE_Ubicacion`, `CotE_Direccion`, `CotE_Notas`) VALUES
(3, 3, '2026-03-20', '09:00:00', 'Lima', 'San Isidro', 'Evento enviada');
-- T_Cotizacion (seed para reglas de vencimiento, usando fecha real)
INSERT INTO `T_Cotizacion` (`PK_Cot_Cod`, `FK_Lead_Cod`, `Cot_TipoEvento`, `Cot_FechaEvento`, `Cot_Lugar`, `Cot_HorasEst`, `Cot_Mensaje`, `FK_ECot_Cod`, `Cot_Fecha_Crea`, `Cot_IdTipoEvento`, `FK_Cli_Cod`) VALUES
(4, NULL, 'Boda', '2026-02-15', 'Lima', 6.0, 'Caso expirado por vigencia comercial', 1, '2025-10-01 10:00:00', 1, 1),
(5, NULL, 'Corporativo', '2026-01-18', 'Lima', 5.0, 'Caso expirado por vigencia operativa (no urgente)', 2, '2025-12-01 09:00:00', 3, 1),
(6, NULL, 'Cumpleanos', '2026-01-16', 'Arequipa', 4.0, 'Caso urgente (no debe expirar por operativa)', 2, '2026-01-10 12:00:00', 2, 2),
(7, NULL, 'Boda', '2026-03-01', 'Cusco', 8.0, 'Caso vigente normal', 1, '2025-12-20 15:30:00', 1, 3);
-- T_CotizacionServicio (reglas de vencimiento)
INSERT INTO `T_CotizacionServicio` (`PK_CotServ_Cod`, `FK_Cot_Cod`, `FK_ExS_Cod`, `CS_EventoId`, `CS_ServicioId`, `CS_Nombre`, `CS_Descripcion`, `CS_Moneda`, `CS_PrecioUnit`, `CS_Cantidad`, `CS_Descuento`, `CS_Recargo`, `CS_Notas`, `CS_Horas`, `CS_Staff`, `CS_FotosImpresas`, `CS_TrailerMin`, `CS_FilmMin`) VALUES
(4, 4, 1, 1, 1, 'Fotografia Boda Standard', 'Caso comercial vencido', 'USD', 1000.00, 1, 0, 0, 'Regla 90 dias', 6.0, 2, 40, 0, 0),
(5, 5, 16, 3, 2, 'Video Corporativo', 'Caso operativa vencida', 'USD', 2500.00, 1, 0, 0, 'Regla 7 dias', 5.0, NULL, NULL, 1, 15),
(6, 6, 8, 2, 1, 'Fotografia Cumple Express', 'Caso urgente', 'USD', 900.00, 1, 0, 0, 'Urgente', 4.0, NULL, 0, NULL, NULL),
(7, 7, 1, 1, 1, 'Fotografia Boda Standard', 'Caso vigente', 'USD', 1300.00, 1, 0, 0, 'Normal', 8.0, 2, 50, 0, 0);
-- T_CotizacionEvento (reglas de vencimiento)
INSERT INTO `T_CotizacionEvento` (`PK_CotE_Cod`, `FK_Cot_Cod`, `CotE_Fecha`, `CotE_Hora`, `CotE_Ubicacion`, `CotE_Direccion`, `CotE_Notas`) VALUES
(4, 4, '2026-02-15', '18:00:00', 'Lima', 'Miraflores', 'Evento comercial'),
(5, 5, '2026-01-18', '09:00:00', 'Lima', 'San Isidro', 'Evento operativa'),
(6, 6, '2026-01-16', '19:30:00', 'Arequipa', 'Cercado', 'Evento urgente'),
(7, 7, '2026-03-01', '17:00:00', 'Cusco', 'Centro', 'Evento vigente');
-- Ajusta AUTO_INCREMENT para continuar desde MAX(id)+1
ALTER TABLE `T_Estado_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Empleado` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Pago` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Pedido` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Cotizacion` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_Proyecto` AUTO_INCREMENT = 1;
ALTER TABLE `T_Estado_voucher` AUTO_INCREMENT = 1;
ALTER TABLE `T_Metodo_Pago` AUTO_INCREMENT = 1;
ALTER TABLE `T_Servicios` AUTO_INCREMENT = 1;
ALTER TABLE `T_Eventos` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioCategoria` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioEstado` AUTO_INCREMENT = 1;
ALTER TABLE `T_Tipo_Empleado` AUTO_INCREMENT = 1;
ALTER TABLE `T_Tipo_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_TipoDocumento` AUTO_INCREMENT = 1;
ALTER TABLE `T_Marca` AUTO_INCREMENT = 1;
ALTER TABLE `T_Usuario` AUTO_INCREMENT = 1;
ALTER TABLE `T_Modelo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Cliente` AUTO_INCREMENT = 1;
ALTER TABLE `T_Empleados` AUTO_INCREMENT = 1;
ALTER TABLE `T_Equipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_Cotizacion` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionServicioFecha` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_CotizacionEvento` AUTO_INCREMENT = 1;
ALTER TABLE `T_Lead` AUTO_INCREMENT = 1;
ALTER TABLE `T_Contrato` AUTO_INCREMENT = 1;
ALTER TABLE `T_Pedido` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoServicioFecha` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_PedidoEvento` AUTO_INCREMENT = 1;
ALTER TABLE `T_Voucher` AUTO_INCREMENT = 1;
ALTER TABLE `T_Proyecto` AUTO_INCREMENT = 1;
ALTER TABLE `T_Proyecto_Recurso` AUTO_INCREMENT = 1;
ALTER TABLE `T_Equipo_Asignacion` AUTO_INCREMENT = 1;
ALTER TABLE `T_Empleado_Asignacion` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicio` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioEquipo` AUTO_INCREMENT = 1;
ALTER TABLE `T_EventoServicioStaff` AUTO_INCREMENT = 1;
ALTER TABLE `T_TipoDocumento` AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS=1;
