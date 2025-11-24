# Tablas

## Índice

- [T_Cliente](#t_cliente)
- [T_Contrato](#t_contrato)
- [T_Cotizacion](#t_cotizacion)
- [T_CotizacionEvento](#t_cotizacionevento)
- [T_CotizacionServicio](#t_cotizacionservicio)
- [T_Empleados](#t_empleados)
- [T_Empleado_Asignacion](#t_empleado_asignacion)
- [T_Equipo](#t_equipo)
- [T_Estado_Cliente](#t_estado_cliente)
- [T_Estado_Empleado](#t_estado_empleado)
- [T_Estado_Equipo](#t_estado_equipo)
- [T_Estado_Pago](#t_estado_pago)
- [T_Estado_Pedido](#t_estado_pedido)
- [T_Estado_Proyecto](#t_estado_proyecto)
- [T_Estado_voucher](#t_estado_voucher)
- [T_Eventos](#t_eventos)
- [T_EventoServicio](#t_eventoservicio)
- [T_EventoServicioCategoria](#t_eventoserviciocategoria)
- [T_EventoServicioEquipo](#t_eventoservicioequipo)
- [T_EventoServicioStaff](#t_eventoserviciostaff)
- [T_Lead](#t_lead)
- [T_Marca](#t_marca)
- [T_Metodo_Pago](#t_metodo_pago)
- [T_Modelo](#t_modelo)
- [T_Pedido](#t_pedido)
- [T_PedidoEvento](#t_pedidoevento)
- [T_PedidoServicio](#t_pedidoservicio)
- [T_Proyecto](#t_proyecto)
- [T_Proyecto_Recurso](#t_proyecto_recurso)
- [T_Servicios](#t_servicios)
- [T_Tipo_Empleado](#t_tipo_empleado)
- [T_Tipo_Equipo](#t_tipo_equipo)
- [T_Usuario](#t_usuario)
- [T_Voucher](#t_voucher)

---

## T_Cliente

```sql
CREATE TABLE `T_Cliente` (

  `PK_Cli_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_U_Cod` int NOT NULL,
  `Cli_Tipo_Cliente` int DEFAULT NULL,
  `FK_ECli_Cod` int NOT NULL,
  PRIMARY KEY (`PK_Cli_Cod`),
  UNIQUE KEY `UQ_T_Cliente_FK_U` (`FK_U_Cod`),
  KEY `FK_T_Cliente_T_Estado_Cliente` (`FK_ECli_Cod`),
  CONSTRAINT `FK_T_Cliente_T_Estado_Cliente` FOREIGN KEY (`FK_ECli_Cod`) REFERENCES `T_Estado_Cliente` (`PK_ECli_Cod`),
  CONSTRAINT `FK_T_Cliente_T_Usuario` FOREIGN KEY (`FK_U_Cod`) REFERENCES `T_Usuario` (`PK_U_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Contrato

```sql
CREATE TABLE `T_Contrato` (

  `PK_Cont_Cod` int NOT NULL AUTO_INCREMENT,
  `Cont_Link` varchar(255) DEFAULT NULL,
  `FK_P_Cod` int NOT NULL,
  PRIMARY KEY (`PK_Cont_Cod`),
  KEY `FK_T_Contrato_T_Pedido` (`FK_P_Cod`),
  CONSTRAINT `FK_T_Contrato_T_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Cotizacion

```sql
CREATE TABLE `T_Cotizacion` (

  `PK_Cot_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_Lead_Cod` int DEFAULT NULL,
  `Cot_TipoEvento` varchar(40) NOT NULL,
  `Cot_FechaEvento` date DEFAULT NULL,
  `Cot_Lugar` varchar(150) DEFAULT NULL,
  `Cot_HorasEst` decimal(4,1) DEFAULT NULL,
  `Cot_Mensaje` varchar(500) DEFAULT NULL,
  `Cot_Estado` varchar(20) NOT NULL DEFAULT 'Borrador',
  `Cot_Fecha_Crea` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Cot_IdTipoEvento` int NOT NULL,
  `FK_Cli_Cod` int DEFAULT NULL,
  PRIMARY KEY (`PK_Cot_Cod`),
  KEY `ix_cot_lead` (`FK_Lead_Cod`),
  KEY `ix_cot_cli` (`FK_Cli_Cod`),
  CONSTRAINT `fk_cot_cliente` FOREIGN KEY (`FK_Cli_Cod`) REFERENCES `T_Cliente` (`PK_Cli_Cod`),
  CONSTRAINT `FK_Cot_Lead` FOREIGN KEY (`FK_Lead_Cod`) REFERENCES `T_Lead` (`PK_Lead_Cod`),
  CONSTRAINT `chk_cot_origen` CHECK ((((`FK_Lead_Cod` is not null) and (`FK_Cli_Cod` is null)) or ((`FK_Lead_Cod` is null) and (`FK_Cli_Cod` is not null))))

) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_CotizacionEvento

```sql
CREATE TABLE `T_CotizacionEvento` (

  `PK_CotE_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_Cot_Cod` int NOT NULL,
  `CotE_Fecha` date NOT NULL,
  `CotE_Hora` time DEFAULT NULL,
  `CotE_Ubicacion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CotE_Direccion` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `CotE_Notas` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`PK_CotE_Cod`),
  KEY `FK_CotizacionEvento_Cotizacion` (`FK_Cot_Cod`),
  CONSTRAINT `FK_CotizacionEvento_Cotizacion` FOREIGN KEY (`FK_Cot_Cod`) REFERENCES `T_Cotizacion` (`PK_Cot_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

## T_CotizacionServicio

```sql
CREATE TABLE `T_CotizacionServicio` (

  `PK_CotServ_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_Cot_Cod` int NOT NULL,
  `FK_ExS_Cod` int DEFAULT NULL,
  `CS_EventoId` int DEFAULT NULL,
  `CS_ServicioId` int DEFAULT NULL,
  `CS_Nombre` varchar(120) NOT NULL,
  `CS_Descripcion` varchar(1000) DEFAULT NULL,
  `CS_Moneda` char(3) NOT NULL DEFAULT 'USD',
  `CS_PrecioUnit` decimal(10,2) NOT NULL,
  `CS_Cantidad` decimal(10,2) NOT NULL DEFAULT '1.00',
  `CS_Descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `CS_Recargo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `CS_Subtotal` decimal(10,2) GENERATED ALWAYS AS ((((`CS_PrecioUnit` - `CS_Descuento`) + `CS_Recargo`) * `CS_Cantidad`)) STORED,
  `CS_Notas` varchar(150) DEFAULT NULL,
  `CS_Horas` decimal(4,1) DEFAULT NULL,
  `CS_Staff` smallint DEFAULT NULL,
  `CS_FotosImpresas` int DEFAULT NULL,
  `CS_TrailerMin` int DEFAULT NULL,
  `CS_FilmMin` int DEFAULT NULL,
  PRIMARY KEY (`PK_CotServ_Cod`),
  KEY `FK_CotServ_Cot` (`FK_Cot_Cod`),
  KEY `FK_CotServ_ExS` (`FK_ExS_Cod`),
  CONSTRAINT `FK_CotServ_Cot` FOREIGN KEY (`FK_Cot_Cod`) REFERENCES `T_Cotizacion` (`PK_Cot_Cod`),
  CONSTRAINT `FK_CotServ_ExS` FOREIGN KEY (`FK_ExS_Cod`) REFERENCES `T_EventoServicio` (`PK_ExS_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Empleados

```sql
CREATE TABLE `T_Empleados` (

  `PK_Em_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_U_Cod` int NOT NULL,
  `Em_Autonomo` varchar(25) DEFAULT NULL,
  `FK_Tipo_Emp_Cod` int NOT NULL,
  `FK_Estado_Emp_Cod` tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`PK_Em_Cod`),
  KEY `FK_T_Empleados_T_Usuario` (`FK_U_Cod`),
  KEY `FK_T_Empleados_T_Tipo_Empleado` (`FK_Tipo_Emp_Cod`),
  KEY `FK_T_Empleados_Estado` (`FK_Estado_Emp_Cod`),
  CONSTRAINT `FK_T_Empleados_Estado` FOREIGN KEY (`FK_Estado_Emp_Cod`) REFERENCES `T_Estado_Empleado` (`PK_Estado_Emp_Cod`),
  CONSTRAINT `FK_T_Empleados_T_Tipo_Empleado` FOREIGN KEY (`FK_Tipo_Emp_Cod`) REFERENCES `T_Tipo_Empleado` (`PK_Tipo_Emp_Cod`),
  CONSTRAINT `FK_T_Empleados_T_Usuario` FOREIGN KEY (`FK_U_Cod`) REFERENCES `T_Usuario` (`PK_U_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Empleado_Asignacion

```sql
CREATE TABLE `T_Empleado_Asignacion` (

  `PK_EAsig_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_Em_Cod` int NOT NULL,
  `FK_Pro_Cod` int NOT NULL,
  `EAsig_Fecha_Inicio` date NOT NULL,
  `EAsig_Fecha_Fin` date NOT NULL,
  `EAsig_Estado` varchar(20) NOT NULL DEFAULT 'Confirmado',
  `EAsig_Notas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PK_EAsig_Cod`),
  UNIQUE KEY `ux_empleado_proyecto` (`FK_Em_Cod`,`FK_Pro_Cod`),
  KEY `ix_emp_fecha` (`FK_Em_Cod`,`EAsig_Fecha_Inicio`,`EAsig_Fecha_Fin`,`EAsig_Estado`),
  KEY `FK_EAsig_Proyecto` (`FK_Pro_Cod`),
  CONSTRAINT `FK_EAsig_Empleado` FOREIGN KEY (`FK_Em_Cod`) REFERENCES `T_Empleados` (`PK_Em_Cod`),
  CONSTRAINT `FK_EAsig_Proyecto` FOREIGN KEY (`FK_Pro_Cod`) REFERENCES `T_Proyecto` (`PK_Pro_Cod`),
  CONSTRAINT `chk_easig_fecha` CHECK ((`EAsig_Fecha_Fin` >= `EAsig_Fecha_Inicio`))

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Equipo

```sql
CREATE TABLE `T_Equipo` (

  `PK_Eq_Cod` int NOT NULL AUTO_INCREMENT,
  `Eq_Fecha_Ingreso` date DEFAULT NULL,
  `FK_IMo_Cod` int NOT NULL,
  `FK_EE_Cod` int NOT NULL,
  `Eq_Serie` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`PK_Eq_Cod`),
  UNIQUE KEY `uq_equipo_serie` (`Eq_Serie`),
  KEY `FK_T_Equipo_T_Estado_Equipo` (`FK_EE_Cod`),
  KEY `FK_T_Equipo_T_Modelo` (`FK_IMo_Cod`),
  CONSTRAINT `FK_T_Equipo_T_Estado_Equipo` FOREIGN KEY (`FK_EE_Cod`) REFERENCES `T_Estado_Equipo` (`PK_EE_Cod`),
  CONSTRAINT `FK_T_Equipo_T_Modelo` FOREIGN KEY (`FK_IMo_Cod`) REFERENCES `T_Modelo` (`PK_IMo_Cod`) ON DELETE RESTRICT ON UPDATE RESTRICT

) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Cliente

```sql
CREATE TABLE `T_Estado_Cliente` (

  `PK_ECli_Cod` int NOT NULL AUTO_INCREMENT,
  `ECli_Nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PK_ECli_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Empleado

```sql
CREATE TABLE `T_Estado_Empleado` (

  `PK_Estado_Emp_Cod` tinyint unsigned NOT NULL,
  `EsEm_Nombre` varchar(20) NOT NULL,
  PRIMARY KEY (`PK_Estado_Emp_Cod`),
  UNIQUE KEY `EsEm_Nombre` (`EsEm_Nombre`)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Equipo

```sql
CREATE TABLE `T_Estado_Equipo` (

  `PK_EE_Cod` int NOT NULL AUTO_INCREMENT,
  `EE_Nombre` varchar(40) NOT NULL,
  PRIMARY KEY (`PK_EE_Cod`),
  UNIQUE KEY `uq_estado_nombre` (`EE_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Pago

```sql
CREATE TABLE `T_Estado_Pago` (

  `PK_ESP_Cod` int NOT NULL AUTO_INCREMENT,
  `ESP_Nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PK_ESP_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Pedido

```sql
CREATE TABLE `T_Estado_Pedido` (

  `PK_EP_Cod` int NOT NULL AUTO_INCREMENT,
  `EP_Nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PK_EP_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_Proyecto

```sql
CREATE TABLE `T_Estado_Proyecto` (

  `PK_EPro_Cod` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `EPro_Nombre` varchar(30) NOT NULL,
  `EPro_Orden` tinyint unsigned NOT NULL DEFAULT '1',
  `Activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`PK_EPro_Cod`),
  UNIQUE KEY `uq_estado_proyecto_nombre` (`EPro_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Estado_voucher

```sql
CREATE TABLE `T_Estado_voucher` (

  `PK_EV_Cod` int NOT NULL AUTO_INCREMENT,
  `EV_Nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PK_EV_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Eventos

```sql
CREATE TABLE `T_Eventos` (

  `PK_E_Cod` int NOT NULL AUTO_INCREMENT,
  `E_Nombre` varchar(25) NOT NULL,
  `E_IconUrl` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`PK_E_Cod`),
  UNIQUE KEY `uq_eventos_nombre` (`E_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_EventoServicio

```sql
CREATE TABLE `T_EventoServicio` (

  `PK_ExS_Cod` int NOT NULL AUTO_INCREMENT,
  `PK_S_Cod` int NOT NULL,
  `PK_E_Cod` int NOT NULL,
  `ExS_Titulo` varchar(120) NOT NULL,
  `FK_ESC_Cod` int DEFAULT NULL,
  `ExS_EsAddon` tinyint(1) NOT NULL DEFAULT '0',
  `ExS_Precio` decimal(10,2) DEFAULT NULL,
  `ExS_Descripcion` varchar(100) DEFAULT NULL,
  `ExS_Horas` decimal(4,1) DEFAULT NULL,
  `ExS_FotosImpresas` int DEFAULT NULL,
  `ExS_TrailerMin` int DEFAULT NULL,
  `ExS_FilmMin` int DEFAULT NULL,
  PRIMARY KEY (`PK_ExS_Cod`),
  KEY `FK_T_EventoServicio_T_Servicios` (`PK_S_Cod`),
  KEY `FK_T_EventoServicio_T_Eventos` (`PK_E_Cod`),
  KEY `FK_EventoServicio_Categoria` (`FK_ESC_Cod`),
  CONSTRAINT `FK_EventoServicio_Categoria` FOREIGN KEY (`FK_ESC_Cod`) REFERENCES `T_EventoServicioCategoria` (`PK_ESC_Cod`),
  CONSTRAINT `FK_T_EventoServicio_T_Eventos` FOREIGN KEY (`PK_E_Cod`) REFERENCES `T_Eventos` (`PK_E_Cod`),
  CONSTRAINT `FK_T_EventoServicio_T_Servicios` FOREIGN KEY (`PK_S_Cod`) REFERENCES `T_Servicios` (`PK_S_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_EventoServicioCategoria

```sql
CREATE TABLE `T_EventoServicioCategoria` (

  `PK_ESC_Cod` int NOT NULL AUTO_INCREMENT,
  `ESC_Nombre` varchar(60) NOT NULL,
  `ESC_Tipo` enum('PAQUETE','ADDON') NOT NULL DEFAULT 'PAQUETE',
  `ESC_Activo` tinyint(1) NOT NULL DEFAULT '1',
  `ESC_Fecha_Creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_ESC_Cod`),
  UNIQUE KEY `ESC_Nombre` (`ESC_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_EventoServicioEquipo

```sql
CREATE TABLE `T_EventoServicioEquipo` (

  `PK_ExS_Equipo_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_ExS_Cod` int NOT NULL,
  `FK_TE_Cod` int NOT NULL,
  `Cantidad` smallint unsigned NOT NULL DEFAULT '1',
  `Notas` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`PK_ExS_Equipo_Cod`),
  KEY `fk_exs_equipo_exs` (`FK_ExS_Cod`),
  KEY `fk_exs_equipo_tipo` (`FK_TE_Cod`),
  CONSTRAINT `fk_exs_equipo_exs` FOREIGN KEY (`FK_ExS_Cod`) REFERENCES `T_EventoServicio` (`PK_ExS_Cod`) ON DELETE CASCADE,
  CONSTRAINT `fk_exs_equipo_tipo` FOREIGN KEY (`FK_TE_Cod`) REFERENCES `T_Tipo_Equipo` (`PK_TE_Cod`) ON DELETE RESTRICT

) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_EventoServicioStaff

```sql
CREATE TABLE `T_EventoServicioStaff` (

  `PK_ExS_Staff_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_ExS_Cod` int NOT NULL,
  `Staff_Rol` varchar(40) NOT NULL,
  `Staff_Cantidad` smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`PK_ExS_Staff_Cod`),
  KEY `fk_exs_staff_exs` (`FK_ExS_Cod`),
  CONSTRAINT `fk_exs_staff_exs` FOREIGN KEY (`FK_ExS_Cod`) REFERENCES `T_EventoServicio` (`PK_ExS_Cod`) ON DELETE CASCADE

) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Lead

```sql
CREATE TABLE `T_Lead` (

  `PK_Lead_Cod` int NOT NULL AUTO_INCREMENT,
  `Lead_Nombre` varchar(80) NOT NULL,
  `Lead_Celular` varchar(30) DEFAULT NULL,
  `Lead_Origen` varchar(40) DEFAULT NULL,
  `Lead_Fecha_Crea` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_Lead_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Marca

```sql
CREATE TABLE `T_Marca` (

  `PK_IMa_Cod` int NOT NULL AUTO_INCREMENT,
  `NMa_Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`PK_IMa_Cod`),
  UNIQUE KEY `uq_marca_nombre` (`NMa_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Metodo_Pago

```sql
CREATE TABLE `T_Metodo_Pago` (

  `PK_MP_Cod` int NOT NULL AUTO_INCREMENT,
  `MP_Nombre` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`PK_MP_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Modelo

```sql
CREATE TABLE `T_Modelo` (

  `PK_IMo_Cod` int NOT NULL AUTO_INCREMENT,
  `NMo_Nombre` varchar(100) NOT NULL,
  `FK_IMa_Cod` int NOT NULL,
  `FK_TE_Cod` int NOT NULL,
  PRIMARY KEY (`PK_IMo_Cod`),
  UNIQUE KEY `uq_modelo_nombre_marca` (`NMo_Nombre`,`FK_IMa_Cod`),
  KEY `FK_T_Modelo_T_Marca` (`FK_IMa_Cod`),
  KEY `FK_T_Modelo_T_Tipo_Equipo` (`FK_TE_Cod`),
  CONSTRAINT `FK_T_Modelo_T_Marca` FOREIGN KEY (`FK_IMa_Cod`) REFERENCES `T_Marca` (`PK_IMa_Cod`),
  CONSTRAINT `FK_T_Modelo_T_Tipo_Equipo` FOREIGN KEY (`FK_TE_Cod`) REFERENCES `T_Tipo_Equipo` (`PK_TE_Cod`) ON DELETE RESTRICT ON UPDATE RESTRICT

) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Pedido

```sql
CREATE TABLE `T_Pedido` (

  `PK_P_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_EP_Cod` int NOT NULL,
  `FK_Cli_Cod` int NOT NULL,
  `FK_ESP_Cod` int NOT NULL,
  `P_Fecha_Creacion` date DEFAULT NULL,
  `P_Observaciones` varchar(255) DEFAULT NULL,
  `FK_Em_Cod` int NOT NULL,
  `P_Nombre_Pedido` varchar(225) DEFAULT NULL,
  `FK_Cot_Cod` int DEFAULT NULL,
  `P_FechaEvento` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`PK_P_Cod`),
  KEY `IX_Pedido_Cliente` (`FK_Cli_Cod`),
  KEY `IX_Pedido_Estado` (`FK_EP_Cod`),
  KEY `IX_Pedido_Estado_Pago` (`FK_ESP_Cod`),
  KEY `IX_Pedido_Empleado` (`FK_Em_Cod`),
  KEY `IX_Pedido_Cotizacion` (`FK_Cot_Cod`),
  CONSTRAINT `FK_Pedido_Cliente` FOREIGN KEY (`FK_Cli_Cod`) REFERENCES `T_Cliente` (`PK_Cli_Cod`),
  CONSTRAINT `FK_Pedido_Cotizacion` FOREIGN KEY (`FK_Cot_Cod`) REFERENCES `T_Cotizacion` (`PK_Cot_Cod`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `FK_Pedido_Empleado` FOREIGN KEY (`FK_Em_Cod`) REFERENCES `T_Empleados` (`PK_Em_Cod`),
  CONSTRAINT `FK_Pedido_EstadoPago` FOREIGN KEY (`FK_ESP_Cod`) REFERENCES `T_Estado_Pago` (`PK_ESP_Cod`),
  CONSTRAINT `FK_Pedido_EstadoPedido` FOREIGN KEY (`FK_EP_Cod`) REFERENCES `T_Estado_Pedido` (`PK_EP_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_PedidoEvento

```sql
CREATE TABLE `T_PedidoEvento` (

  `PK_PE_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_P_Cod` int NOT NULL,
  `PE_Fecha` date NOT NULL,
  `PE_Hora` time DEFAULT NULL,
  `PE_Ubicacion` varchar(100) DEFAULT NULL,
  `PE_Direccion` varchar(150) DEFAULT NULL,
  `PE_Notas` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`PK_PE_Cod`),
  KEY `FK_PedidoEvento_Pedido` (`FK_P_Cod`),
  CONSTRAINT `FK_PedidoEvento_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_PedidoServicio

```sql
CREATE TABLE `T_PedidoServicio` (

  `PK_PS_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_P_Cod` int NOT NULL,
  `FK_ExS_Cod` int DEFAULT NULL,
  `FK_PE_Cod` int DEFAULT NULL,
  `PS_Nombre` varchar(120) NOT NULL,
  `PS_Descripcion` varchar(255) DEFAULT NULL,
  `PS_Moneda` char(3) NOT NULL DEFAULT 'USD',
  `PS_PrecioUnit` decimal(10,2) NOT NULL,
  `PS_Cantidad` decimal(10,2) NOT NULL DEFAULT '1.00',
  `PS_Descuento` decimal(10,2) NOT NULL DEFAULT '0.00',
  `PS_Recargo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `PS_Subtotal` decimal(10,2) GENERATED ALWAYS AS ((((`PS_PrecioUnit` - `PS_Descuento`) + `PS_Recargo`) * `PS_Cantidad`)) STORED,
  `PS_Notas` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`PK_PS_Cod`),
  KEY `FK_PedidoServicio_Pedido` (`FK_P_Cod`),
  KEY `FK_PedidoServicio_ExS` (`FK_ExS_Cod`),
  KEY `FK_PedidoServicio_PedidoEvento` (`FK_PE_Cod`),
  CONSTRAINT `FK_PedidoServicio_ExS` FOREIGN KEY (`FK_ExS_Cod`) REFERENCES `T_EventoServicio` (`PK_ExS_Cod`),
  CONSTRAINT `FK_PedidoServicio_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`),
  CONSTRAINT `FK_PedidoServicio_PedidoEvento` FOREIGN KEY (`FK_PE_Cod`) REFERENCES `T_PedidoEvento` (`PK_PE_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Proyecto

```sql
CREATE TABLE `T_Proyecto` (

  `PK_Pro_Cod` int NOT NULL AUTO_INCREMENT,
  `Pro_Nombre` varchar(50) DEFAULT NULL,
  `FK_P_Cod` int NOT NULL,
  `Pro_Estado` tinyint unsigned NOT NULL DEFAULT '1',
  `FK_Em_Cod` int DEFAULT NULL,
  `EPro_Fecha_Inicio_Edicion` date DEFAULT NULL,
  `Pro_Fecha_Fin_Edicion` date DEFAULT NULL,
  `Pro_Revision_Edicion` int DEFAULT NULL,
  `Pro_Revision_Multimedia` int DEFAULT NULL,
  `Pro_Enlace` varchar(255) DEFAULT NULL,
  `Pro_Notas` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_Pro_Cod`),
  UNIQUE KEY `ux_proyecto_pedido` (`FK_P_Cod`),
  KEY `fk_proyecto_responsable` (`FK_Em_Cod`),
  KEY `fk_proyecto_estado` (`Pro_Estado`),
  CONSTRAINT `fk_proyecto_estado` FOREIGN KEY (`Pro_Estado`) REFERENCES `T_Estado_Proyecto` (`PK_EPro_Cod`),
  CONSTRAINT `fk_proyecto_responsable` FOREIGN KEY (`FK_Em_Cod`) REFERENCES `T_Empleados` (`PK_Em_Cod`),
  CONSTRAINT `FK_T_Proyecto_T_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Proyecto_Recurso

```sql
CREATE TABLE `T_Proyecto_Recurso` (

  `PK_RxP_Cod` int NOT NULL AUTO_INCREMENT,
  `FK_Pro_Cod` int NOT NULL,
  `FK_Em_Cod` int NOT NULL,
  `FK_Eq_Cod` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_RxP_Cod`),
  UNIQUE KEY `ux_proyecto_recurso` (`FK_Pro_Cod`,`FK_Em_Cod`,`FK_Eq_Cod`),
  KEY `FK_T_RecursosxProyecto_T_Empleados` (`FK_Em_Cod`),
  KEY `FK_T_RecursosxProyecto_T_Equipo` (`FK_Eq_Cod`),
  CONSTRAINT `FK_T_RecursosxProyecto_T_Empleados` FOREIGN KEY (`FK_Em_Cod`) REFERENCES `T_Empleados` (`PK_Em_Cod`),
  CONSTRAINT `FK_T_RecursosxProyecto_T_Equipo` FOREIGN KEY (`FK_Eq_Cod`) REFERENCES `T_Equipo` (`PK_Eq_Cod`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `FK_T_RecursosxProyecto_T_Proyecto` FOREIGN KEY (`FK_Pro_Cod`) REFERENCES `T_Proyecto` (`PK_Pro_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Servicios

```sql
CREATE TABLE `T_Servicios` (

  `PK_S_Cod` int NOT NULL AUTO_INCREMENT,
  `S_Nombre` varchar(25) NOT NULL,
  PRIMARY KEY (`PK_S_Cod`),
  UNIQUE KEY `uq_servicios_nombre` (`S_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Tipo_Empleado

```sql
CREATE TABLE `T_Tipo_Empleado` (

  `PK_Tipo_Emp_Cod` int NOT NULL AUTO_INCREMENT,
  `TiEm_Cargo` varchar(25) DEFAULT NULL,
  `TiEm_PermiteLogin` tinyint(1) NOT NULL DEFAULT '0',
  `TiEm_OperativoCampo` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`PK_Tipo_Emp_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Tipo_Equipo

```sql
CREATE TABLE `T_Tipo_Equipo` (

  `PK_TE_Cod` int NOT NULL AUTO_INCREMENT,
  `TE_Nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`PK_TE_Cod`),
  UNIQUE KEY `uq_tipo_nombre` (`TE_Nombre`)

) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Usuario

```sql
CREATE TABLE `T_Usuario` (

  `PK_U_Cod` int NOT NULL AUTO_INCREMENT,
  `U_Nombre` varchar(25) DEFAULT NULL,
  `U_Apellido` varchar(25) DEFAULT NULL,
  `U_Correo` varchar(250) NOT NULL,
  `U_Contrasena` varchar(255) DEFAULT NULL,
  `U_Celular` varchar(25) NOT NULL,
  `U_Numero_Documento` varchar(11) NOT NULL,
  `U_Direccion` varchar(100) DEFAULT NULL,
  `U_Fecha_Crea` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `U_Fecha_Upd` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PK_U_Cod`),
  UNIQUE KEY `UQ_T_Usuario_Correo` (`U_Correo`),
  UNIQUE KEY `UQ_T_Usuario_Celular` (`U_Celular`),
  UNIQUE KEY `UQ_T_Usuario_NumDoc` (`U_Numero_Documento`),
  CONSTRAINT `chk_usuario_correo_formato` CHECK (regexp_like(`U_Correo`,_utf8mb4'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$')),
  CONSTRAINT `chk_usuario_doc_len_digits` CHECK (regexp_like(`U_Numero_Documento`,_utf8mb4'^[0-9]{8}$|^[0-9]{11}$'))

) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## T_Voucher

```sql
CREATE TABLE `T_Voucher` (

  `PK_Pa_Cod` int NOT NULL AUTO_INCREMENT,
  `Pa_Monto_Depositado` int DEFAULT NULL,
  `FK_MP_Cod` int NOT NULL,
  `Pa_Imagen_Voucher` longblob,
  `FK_P_Cod` int NOT NULL,
  `FK_EV_Cod` int NOT NULL,
  `Pa_Fecha` date DEFAULT NULL,
  `Pa_Imagen_Mime` varchar(100) DEFAULT NULL,
  `Pa_Imagen_NombreOriginal` varchar(255) DEFAULT NULL,
  `Pa_Imagen_Size` int DEFAULT NULL,
  PRIMARY KEY (`PK_Pa_Cod`),
  KEY `FK_T_Voucher_T_Metodo_Pago` (`FK_MP_Cod`),
  KEY `FK_T_Voucher_T_Pedido` (`FK_P_Cod`),
  KEY `FK_T_Voucher_T_Estado_voucher` (`FK_EV_Cod`),
  CONSTRAINT `FK_T_Voucher_T_Estado_voucher` FOREIGN KEY (`FK_EV_Cod`) REFERENCES `T_Estado_voucher` (`PK_EV_Cod`),
  CONSTRAINT `FK_T_Voucher_T_Metodo_Pago` FOREIGN KEY (`FK_MP_Cod`) REFERENCES `T_Metodo_Pago` (`PK_MP_Cod`),
  CONSTRAINT `FK_T_Voucher_T_Pedido` FOREIGN KEY (`FK_P_Cod`) REFERENCES `T_Pedido` (`PK_P_Cod`)

) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
