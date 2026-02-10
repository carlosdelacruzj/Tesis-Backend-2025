INSERT INTO `T_Pedido` (`PK_P_Cod`, `FK_EP_Cod`, `FK_Cli_Cod`, `FK_ESP_Cod`, `P_Fecha_Creacion`, `P_Observaciones`, `FK_Em_Cod`, `P_Nombre_Pedido`, `FK_Cot_Cod`, `P_FechaEvento`, `P_HorasEst`, `P_Dias`, `P_IdTipoEvento`, `P_ViaticosMonto`, `P_Mensaje`, `P_Lugar`) VALUES
(1, 3, 3, 2, '2026-02-08 00:00:00', 'Origen: Cotizacion #7', 1, 'Boda - 01-03-2026 - Cusco', 7, '2026-03-01 00:00:00', '8.0', 1, 1, '800.00', 'Caso vigente normal. Viaticos aceptados.', 'Cusco'),
(2, 2, 3, 2, '2026-02-08 00:00:00', 'Origen: Cotizacion #3', 1, 'Corporativo - 20-03-2026 - Lima', 3, '2026-03-20 00:00:00', '6.0', 2, 3, '0.00', 'Cotizacion enviada. Trabajo en dos dias.', 'Lima');
ALTER TABLE `T_Pedido` AUTO_INCREMENT = 3;
