# Database Schema

Generado: 2025-10-26T00:14:28.341052


## `Historial_Estado_Proyecto`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_HEP_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_EPro_Cod` | `int` | NOT NULL |  |  |  |
| `HEP_Fecha` | `date` | NULL | NULL |  |  |
| `FK_Pro_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_HEP_Cod`
- Foreign key `FK_Historial_Estado_Proyecto_T_Estado_Proyecto`: (`FK_EPro_Cod`) → `T_Estado_Proyecto` (`PK_EPro_Cod`)
- Foreign key `FK_Historial_Estado_Proyecto_T_Proyecto`: (`FK_Pro_Cod`) → `T_Proyecto` (`PK_Pro_Cod`)

**Indexes**

- INDEX `FK_Historial_Estado_Proyecto_T_Estado_Proyecto` (`FK_EPro_Cod`)
- INDEX `FK_Historial_Estado_Proyecto_T_Proyecto` (`FK_Pro_Cod`)

---


## `T_Cliente`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Cli_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_U_Cod` | `int` | NOT NULL |  |  |  |
| `Cli_Tipo_Cliente` | `int` | NULL | NULL |  |  |
| `FK_ECli_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_Cli_Cod`
- Foreign key `FK_T_Cliente_T_Estado_Cliente`: (`FK_ECli_Cod`) → `T_Estado_Cliente` (`PK_ECli_Cod`)
- Foreign key `FK_T_Cliente_T_Usuario`: (`FK_U_Cod`) → `T_Usuario` (`PK_U_Cod`)

**Indexes**

- UNIQUE `UQ_T_Cliente_FK_U` (`FK_U_Cod`)
- INDEX `FK_T_Cliente_T_Estado_Cliente` (`FK_ECli_Cod`)

---


## `T_Contrato`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Cont_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Cont_Link` | `varchar(255)` | NULL | NULL |  |  |
| `FK_P_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_Cont_Cod`
- Foreign key `FK_T_Contrato_T_Pedido`: (`FK_P_Cod`) → `T_Pedido` (`PK_P_Cod`)

**Indexes**

- INDEX `FK_T_Contrato_T_Pedido` (`FK_P_Cod`)

---


## `T_Cotizacion`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Cot_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_Lead_Cod` | `int` | NULL | NULL |  |  |
| `Cot_TipoEvento` | `varchar(40)` | NOT NULL |  |  |  |
| `Cot_FechaEvento` | `date` | NULL | NULL |  |  |
| `Cot_Lugar` | `varchar(150)` | NULL | NULL |  |  |
| `Cot_HorasEst` | `decimal(4,1)` | NULL | NULL |  |  |
| `Cot_Mensaje` | `varchar(500)` | NULL | NULL |  |  |
| `Cot_Estado` | `varchar(20)` | NOT NULL | 'Borrador' |  |  |
| `Cot_Fecha_Crea` | `datetime` | NOT NULL | CURRENT_TIMESTAMP |  |  |
| `Cot_IdTipoEvento` | `int` | NOT NULL |  |  |  |
| `FK_Cli_Cod` | `int` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_Cot_Cod`
- Foreign key `fk_cot_cliente`: (`FK_Cli_Cod`) → `T_Cliente` (`PK_Cli_Cod`)
- Foreign key `FK_Cot_Lead`: (`FK_Lead_Cod`) → `T_Lead` (`PK_Lead_Cod`)

**Indexes**

- INDEX `ix_cot_lead` (`FK_Lead_Cod`)
- INDEX `ix_cot_cli` (`FK_Cli_Cod`)

---


## `T_CotizacionServicio`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_CotServ_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_Cot_Cod` | `int` | NOT NULL |  |  |  |
| `FK_ExS_Cod` | `int` | NULL | NULL |  |  |
| `CS_Nombre` | `varchar(120)` | NOT NULL |  |  |  |
| `CS_Descripcion` | `varchar(1000)` | NULL | NULL |  |  |
| `CS_Moneda` | `char(3)` | NOT NULL | 'USD' |  |  |
| `CS_PrecioUnit` | `decimal(10,2)` | NOT NULL |  |  |  |
| `CS_Cantidad` | `decimal(10,2)` | NOT NULL | '1.00' |  |  |
| `CS_Descuento` | `decimal(10,2)` | NOT NULL | '0.00' |  |  |
| `CS_Recargo` | `decimal(10,2)` | NOT NULL | '0.00' |  |  |
| `CS_Subtotal` | `decimal(10,2)` | NULL |  | GENERATED AS ((((`CS_PrecioUnit` - `CS_Descuento`) |  |
| `CS_Notas` | `varchar(150)` | NULL | NULL |  |  |
| `CS_Horas` | `decimal(4,1)` | NULL | NULL |  |  |
| `CS_Staff` | `smallint` | NULL | NULL |  |  |
| `CS_FotosImpresas` | `int` | NULL | NULL |  |  |
| `CS_TrailerMin` | `int` | NULL | NULL |  |  |
| `CS_FilmMin` | `int` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_CotServ_Cod`
- Foreign key `FK_CotServ_Cot`: (`FK_Cot_Cod`) → `T_Cotizacion` (`PK_Cot_Cod`)
- Foreign key `FK_CotServ_ExS`: (`FK_ExS_Cod`) → `T_EventoServicio` (`PK_ExS_Cod`)

**Indexes**

- INDEX `FK_CotServ_Cot` (`FK_Cot_Cod`)
- INDEX `FK_CotServ_ExS` (`FK_ExS_Cod`)

---


## `T_Empleados`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Em_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_U_Cod` | `int` | NOT NULL |  |  |  |
| `Em_Autonomo` | `varchar(25)` | NULL | NULL |  |  |
| `FK_Tipo_Emp_Cod` | `int` | NOT NULL |  |  |  |
| `FK_Estado_Emp_Cod` | `tinyint unsigned` | NOT NULL | '1' |  |  |

**Constraints**

- Primary key: `PK_Em_Cod`
- Foreign key `FK_T_Empleados_Estado`: (`FK_Estado_Emp_Cod`) → `T_Estado_Empleado` (`PK_Estado_Emp_Cod`)
- Foreign key `FK_T_Empleados_T_Tipo_Empleado`: (`FK_Tipo_Emp_Cod`) → `T_Tipo_Empleado` (`PK_Tipo_Emp_Cod`)
- Foreign key `FK_T_Empleados_T_Usuario`: (`FK_U_Cod`) → `T_Usuario` (`PK_U_Cod`)

**Indexes**

- INDEX `FK_T_Empleados_T_Usuario` (`FK_U_Cod`)
- INDEX `FK_T_Empleados_T_Tipo_Empleado` (`FK_Tipo_Emp_Cod`)
- INDEX `FK_T_Empleados_Estado` (`FK_Estado_Emp_Cod`)

---


## `T_Equipo`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Eq_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Eq_Fecha_Ingreso` | `date` | NULL | NULL |  |  |
| `FK_IMo_Cod` | `int` | NOT NULL |  |  |  |
| `FK_EE_Cod` | `int` | NOT NULL |  |  |  |
| `Eq_Serie` | `varchar(64)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_Eq_Cod`
- Foreign key `FK_T_Equipo_T_Estado_Equipo`: (`FK_EE_Cod`) → `T_Estado_Equipo` (`PK_EE_Cod`)
- Foreign key `FK_T_Equipo_T_Modelo`: (`FK_IMo_Cod`) → `T_Modelo` (`PK_IMo_Cod`) (ON UPDATE RESTRICT, ON DELETE RESTRICT ON UPDATE RESTRICT)

**Indexes**

- UNIQUE `uq_equipo_serie` (`Eq_Serie`)
- INDEX `FK_T_Equipo_T_Estado_Equipo` (`FK_EE_Cod`)
- INDEX `FK_T_Equipo_T_Modelo` (`FK_IMo_Cod`)

---


## `T_Estado_Cliente`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_ECli_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `ECli_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_ECli_Cod`

---


## `T_Estado_Empleado`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Estado_Emp_Cod` | `tinyint unsigned` | NOT NULL |  |  |  |
| `EsEm_Nombre` | `varchar(20)` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_Estado_Emp_Cod`

**Indexes**

- UNIQUE `EsEm_Nombre` (`EsEm_Nombre`)

---


## `T_Estado_Equipo`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_EE_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `EE_Nombre` | `varchar(40)` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_EE_Cod`

**Indexes**

- UNIQUE `uq_estado_nombre` (`EE_Nombre`)

---


## `T_Estado_Pago`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_ESP_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `ESP_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_ESP_Cod`

---


## `T_Estado_Pedido`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_EP_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `EP_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_EP_Cod`

---


## `T_Estado_Proyecto`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_EPro_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `EPro_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_EPro_Cod`

---


## `T_Estado_voucher`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_EV_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `EV_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_EV_Cod`

---


## `T_EventoServicio`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_ExS_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `PK_S_Cod` | `int` | NOT NULL |  |  |  |
| `PK_E_Cod` | `int` | NOT NULL |  |  |  |
| `ExS_Precio` | `int` | NULL | NULL |  |  |
| `ExS_Descripcion` | `varchar(100)` | NULL | NULL |  |  |
| `ExS_Horas` | `decimal(4,1)` | NULL | NULL |  |  |
| `ExS_Staff` | `smallint` | NULL | NULL |  |  |
| `ExS_FotosImpresas` | `int` | NULL | NULL |  |  |
| `ExS_TrailerMin` | `int` | NULL | NULL |  |  |
| `ExS_FilmMin` | `int` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_ExS_Cod`
- Foreign key `FK_T_EventoServicio_T_Eventos`: (`PK_E_Cod`) → `T_Eventos` (`PK_E_Cod`)
- Foreign key `FK_T_EventoServicio_T_Servicios`: (`PK_S_Cod`) → `T_Servicios` (`PK_S_Cod`)

**Indexes**

- INDEX `FK_T_EventoServicio_T_Servicios` (`PK_S_Cod`)
- INDEX `FK_T_EventoServicio_T_Eventos` (`PK_E_Cod`)

---


## `T_Eventos`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_E_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `E_Nombre` | `varchar(25)` | NULL | NULL |  |  |
| `E_IconUrl` | `varchar(500)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_E_Cod`

---


## `T_Lead`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Lead_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Lead_Nombre` | `varchar(80)` | NOT NULL |  |  |  |
| `Lead_Celular` | `varchar(30)` | NULL | NULL |  |  |
| `Lead_Origen` | `varchar(40)` | NULL | NULL |  |  |
| `Lead_Fecha_Crea` | `datetime` | NOT NULL | CURRENT_TIMESTAMP |  |  |

**Constraints**

- Primary key: `PK_Lead_Cod`

---


## `T_Marca`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_IMa_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `NMa_Nombre` | `varchar(100)` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_IMa_Cod`

**Indexes**

- UNIQUE `uq_marca_nombre` (`NMa_Nombre`)

---


## `T_Metodo_Pago`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_MP_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `MP_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_MP_Cod`

---


## `T_Modelo`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_IMo_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `NMo_Nombre` | `varchar(100)` | NOT NULL |  |  |  |
| `FK_IMa_Cod` | `int` | NOT NULL |  |  |  |
| `FK_TE_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_IMo_Cod`
- Foreign key `FK_T_Modelo_T_Marca`: (`FK_IMa_Cod`) → `T_Marca` (`PK_IMa_Cod`)
- Foreign key `FK_T_Modelo_T_Tipo_Equipo`: (`FK_TE_Cod`) → `T_Tipo_Equipo` (`PK_TE_Cod`) (ON UPDATE RESTRICT, ON DELETE RESTRICT ON UPDATE RESTRICT)

**Indexes**

- UNIQUE `uq_modelo_nombre_marca` (`NMo_Nombre`, `FK_IMa_Cod`)
- INDEX `FK_T_Modelo_T_Marca` (`FK_IMa_Cod`)
- INDEX `FK_T_Modelo_T_Tipo_Equipo` (`FK_TE_Cod`)

---


## `T_Multimedia`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Mul_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Mul_Enlace` | `varchar(255)` | NULL | NULL |  |  |
| `FK_Pro_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_Mul_Cod`
- Foreign key `FK_T_Multimedia_T_Proyecto`: (`FK_Pro_Cod`) → `T_Proyecto` (`PK_Pro_Cod`)

**Indexes**

- INDEX `FK_T_Multimedia_T_Proyecto` (`FK_Pro_Cod`)

---


## `T_Pedido`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_P_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_EP_Cod` | `int` | NOT NULL |  |  |  |
| `FK_Cli_Cod` | `int` | NOT NULL |  |  |  |
| `FK_ESP_Cod` | `int` | NOT NULL |  |  |  |
| `P_Fecha_Creacion` | `date` | NULL | NULL |  |  |
| `P_Observaciones` | `varchar(255)` | NULL | NULL |  |  |
| `FK_Em_Cod` | `int` | NOT NULL |  |  |  |
| `P_Nombre_Pedido` | `varchar(225)` | NULL | NULL |  |  |
| `FK_Cot_Cod` | `int` | NULL | NULL |  | 🔹 Nueva columna — referencia a cotización |

**Constraints**

- Primary key: `PK_P_Cod`
- Foreign key `FK_Pedido_Cliente`: (`FK_Cli_Cod`) → `T_Cliente` (`PK_Cli_Cod`)
- foreign key `FK_Pedido_Empleado`: (`FK_Em_Cod`) → `T_Empleados` (`PK_Em_Cod`)
- foreign key `FK_Pedido_EstadoPago`: (`FK_ESP_Cod`) → `T_Estado_Pago` (`PK_ESP_Cod`)
- foreign key `FK_Pedido_EstadoPedido`: (`FK_EP_Cod`) → `T_Estado_Pedido` (`PK_EP_Cod`)
- 🔹 **foreign key `FK_Pedido_Cotizacion`: (`FK_Cot_Cod`) → `T_Cotizacion` (`PK_Cot_Cod`)**

**Indexes**

- INDEX `IX_Pedido_Cliente` (`FK_Cli_Cod`)
- INDEX `IX_Pedido_Estado` (`FK_EP_Cod`)
- INDEX `IX_Pedido_Estado_Pago` (`FK_ESP_Cod`)
- INDEX `IX_Pedido_Empleado` (`FK_Em_Cod`)
- 🔹 **INDEX `IX_Pedido_Cotizacion` (`FK_Cot_Cod`)**

---


## `T_PedidoEvento`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_PE_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_P_Cod` | `int` | NOT NULL |  |  |  |
| `PE_Fecha` | `date` | NOT NULL |  |  |  |
| `PE_Hora` | `time` | NULL | NULL |  |  |
| `PE_Ubicacion` | `varchar(100)` | NULL | NULL |  |  |
| `PE_Direccion` | `varchar(150)` | NULL | NULL |  |  |
| `PE_Notas` | `varchar(255)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_PE_Cod`
- Foreign key `FK_PedidoEvento_Pedido`: (`FK_P_Cod`) → `T_Pedido` (`PK_P_Cod`)

**Indexes**

- INDEX `FK_PedidoEvento_Pedido` (`FK_P_Cod`)

---


## `T_PedidoServicio`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_PS_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_P_Cod` | `int` | NOT NULL |  |  |  |
| `FK_ExS_Cod` | `int` | NULL | NULL |  |  |
| `FK_PE_Cod` | `int` | NULL | NULL |  |  |
| `PS_Nombre` | `varchar(120)` | NOT NULL |  |  |  |
| `PS_Descripcion` | `varchar(255)` | NULL | NULL |  |  |
| `PS_Moneda` | `char(3)` | NOT NULL | 'USD' |  |  |
| `PS_PrecioUnit` | `decimal(10,2)` | NOT NULL |  |  |  |
| `PS_Cantidad` | `decimal(10,2)` | NOT NULL | '1.00' |  |  |
| `PS_Descuento` | `decimal(10,2)` | NOT NULL | '0.00' |  |  |
| `PS_Recargo` | `decimal(10,2)` | NOT NULL | '0.00' |  |  |
| `PS_Subtotal` | `decimal(10,2)` | NULL |  | GENERATED AS ((((`PS_PrecioUnit` - `PS_Descuento`) |  |
| `PS_Notas` | `varchar(150)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_PS_Cod`
- Foreign key `FK_PedidoServicio_ExS`: (`FK_ExS_Cod`) → `T_EventoServicio` (`PK_ExS_Cod`)
- Foreign key `FK_PedidoServicio_Pedido`: (`FK_P_Cod`) → `T_Pedido` (`PK_P_Cod`)
- Foreign key `FK_PedidoServicio_PedidoEvento`: (`FK_PE_Cod`) → `T_PedidoEvento` (`PK_PE_Cod`)

**Indexes**

- INDEX `FK_PedidoServicio_Pedido` (`FK_P_Cod`)
- INDEX `FK_PedidoServicio_ExS` (`FK_ExS_Cod`)
- INDEX `FK_PedidoServicio_PedidoEvento` (`FK_PE_Cod`)

---


## `T_Proyecto`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Pro_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Pro_Nombre` | `varchar(50)` | NULL | NULL |  |  |
| `FK_P_Cod` | `int` | NOT NULL |  |  |  |
| `EPro_Fecha_Inicio_Edicion` | `date` | NULL | NULL |  |  |
| `Pro_Fecha_Fin_Edicion` | `date` | NULL | NULL |  |  |
| `Pro_Revision_Edicion` | `int` | NULL | NULL |  |  |
| `Pro_Revision_Multimedia` | `int` | NULL | NULL |  |  |
| `Pro_Enlace` | `varchar(255)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_Pro_Cod`
- Foreign key `FK_T_Proyecto_T_Pedido`: (`FK_P_Cod`) → `T_Pedido` (`PK_P_Cod`)

**Indexes**

- INDEX `FK_T_Proyecto_T_Pedido` (`FK_P_Cod`)

---


## `T_RecursosxProyecto`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_RxP_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_Pro_Cod` | `int` | NOT NULL |  |  |  |
| `FK_Em_Cod` | `int` | NOT NULL |  |  |  |
| `FK_Eq_Cod` | `int` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_RxP_Cod`
- Foreign key `FK_T_RecursosxProyecto_T_Empleados`: (`FK_Em_Cod`) → `T_Empleados` (`PK_Em_Cod`)
- Foreign key `FK_T_RecursosxProyecto_T_Equipo`: (`FK_Eq_Cod`) → `T_Equipo` (`PK_Eq_Cod`) (ON UPDATE RESTRICT, ON DELETE RESTRICT ON UPDATE RESTRICT)
- Foreign key `FK_T_RecursosxProyecto_T_Proyecto`: (`FK_Pro_Cod`) → `T_Proyecto` (`PK_Pro_Cod`)

**Indexes**

- INDEX `FK_T_RecursosxProyecto_T_Proyecto` (`FK_Pro_Cod`)
- INDEX `FK_T_RecursosxProyecto_T_Empleados` (`FK_Em_Cod`)
- INDEX `FK_T_RecursosxProyecto_T_Equipo` (`FK_Eq_Cod`)

---


## `T_Servicios`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_S_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `S_Nombre` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_S_Cod`

---


## `T_Timeline`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_TL_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `FK_PE_Cod` | `int` | NOT NULL |  |  |  |
| `TL_Hora` | `time` | NOT NULL |  |  |  |
| `TL_Lugar` | `varchar(100)` | NULL | NULL |  |  |
| `TL_Descripcion` | `varchar(150)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_TL_Cod`
- Foreign key `FK_Timeline_PedidoEvento`: (`FK_PE_Cod`) → `T_PedidoEvento` (`PK_PE_Cod`)

**Indexes**

- INDEX `FK_Timeline_PedidoEvento` (`FK_PE_Cod`)

---


## `T_Tipo_Empleado`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Tipo_Emp_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `TiEm_Cargo` | `varchar(25)` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_Tipo_Emp_Cod`

---


## `T_Tipo_Equipo`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_TE_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `TE_Nombre` | `varchar(60)` | NOT NULL |  |  |  |

**Constraints**

- Primary key: `PK_TE_Cod`

**Indexes**

- UNIQUE `uq_tipo_nombre` (`TE_Nombre`)

---


## `T_Usuario`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_U_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `U_Nombre` | `varchar(25)` | NULL | NULL |  |  |
| `U_Apellido` | `varchar(25)` | NULL | NULL |  |  |
| `U_Correo` | `varchar(250)` | NOT NULL |  |  |  |
| `U_Contrasena` | `varchar(255)` | NULL | NULL | 🔹 Ampliado para hashes seguros |
| `U_Celular` | `varchar(25)` | NOT NULL |  |  |  |
| `U_Numero_Documento` | `varchar(11)` | NOT NULL |  |  |  |
| `U_Direccion` | `varchar(100)` | NULL | NULL |  |  |
| `U_Fecha_Crea` | `datetime` | NOT NULL | CURRENT_TIMESTAMP |  |  |
| `U_Fecha_Upd` | `datetime` | NOT NULL | CURRENT_TIMESTAMP |  |  |

**Constraints**

- Primary key: `PK_U_Cod`

**Indexes**

- UNIQUE `UQ_T_Usuario_Correo` (`U_Correo`)
- UNIQUE `UQ_T_Usuario_Celular` (`U_Celular`)
- UNIQUE `UQ_T_Usuario_NumDoc` (`U_Numero_Documento`)

---


## `T_Voucher`

| Column | Type | Null | Default | Extra | Comment |
|---|---|---|---|---|---|
| `PK_Pa_Cod` | `int` | NOT NULL |  | AUTO_INCREMENT |  |
| `Pa_Monto_Depositado` | `int` | NULL | NULL |  |  |
| `FK_MP_Cod` | `int` | NOT NULL |  |  |  |
| `Pa_Imagen_Voucher` | `longblob` | NULL |  |  |  |
| `FK_P_Cod` | `int` | NOT NULL |  |  |  |
| `FK_EV_Cod` | `int` | NOT NULL |  |  |  |
| `Pa_Fecha` | `date` | NULL | NULL |  |  |
| `Pa_Imagen_Mime` | `varchar(100)` | NULL | NULL |  |  |
| `Pa_Imagen_NombreOriginal` | `varchar(255)` | NULL | NULL |  |  |
| `Pa_Imagen_Size` | `int` | NULL | NULL |  |  |

**Constraints**

- Primary key: `PK_Pa_Cod`
- Foreign key `FK_T_Voucher_T_Estado_voucher`: (`FK_EV_Cod`) → `T_Estado_voucher` (`PK_EV_Cod`)
- Foreign key `FK_T_Voucher_T_Metodo_Pago`: (`FK_MP_Cod`) → `T_Metodo_Pago` (`PK_MP_Cod`)
- Foreign key `FK_T_Voucher_T_Pedido`: (`FK_P_Cod`) → `T_Pedido` (`PK_P_Cod`)

**Indexes**

- INDEX `FK_T_Voucher_T_Metodo_Pago` (`FK_MP_Cod`)
- INDEX `FK_T_Voucher_T_Pedido` (`FK_P_Cod`)
- INDEX `FK_T_Voucher_T_Estado_voucher` (`FK_EV_Cod`)

---


# Views

## `V_Pedido_Saldos`

<details><summary>Definition</summary>

```sql
CREATE VIEW `V_Pedido_Saldos` AS SELECT 
 1 AS `PedidoId`,
 1 AS `Fecha`,
 1 AS `Proyecto`,
 1 AS `CostoTotal`,
 1 AS `MontoAbonado`,
 1 AS `SaldoPendiente`,
 1 AS `EstadoPagoId`,
 1 AS `EstadoPedidoId`*/
```
</details>


---

## `V_Pedido_Saldos`

<details><summary>Definition</summary>

```sql
CREATE VIEW `V_Pedido_Saldos` AS select `p`.`PK_P_Cod` AS `PedidoId`,coalesce(min(`pe`.`PE_Fecha`),`p`.`P_Fecha_Creacion`) AS `Fecha`,max(`pr`.`Pro_Nombre`) AS `Proyecto`,coalesce(sum(`ps`.`PS_Subtotal`),0) AS `CostoTotal`,coalesce((select sum(`v`.`Pa_Monto_Depositado`) from (`T_Voucher` `v` join `T_Estado_voucher` `ev` on(((`ev`.`PK_EV_Cod` = `v`.`FK_EV_Cod`) and (`ev`.`EV_Nombre` = 'Aprobado')))) where (`v`.`FK_P_Cod` = `p`.`PK_P_Cod`)),0) AS `MontoAbonado`,(coalesce(sum(`ps`.`PS_Subtotal`),0) - coalesce((select sum(`v`.`Pa_Monto_Depositado`) from (`T_Voucher` `v` join `T_Estado_voucher` `ev` on(((`ev`.`PK_EV_Cod` = `v`.`FK_EV_Cod`) and (`ev`.`EV_Nombre` = 'Aprobado')))) where (`v`.`FK_P_Cod` = `p`.`PK_P_Cod`)),0)) AS `SaldoPendiente`,`p`.`FK_ESP_Cod` AS `EstadoPagoId`,`p`.`FK_EP_Cod` AS `EstadoPedidoId` from (((`T_Pedido` `p` left join `T_PedidoServicio` `ps` on((`ps`.`FK_P_Cod` = `p`.`PK_P_Cod`))) left join `T_PedidoEvento` `pe` on((`pe`.`FK_P_Cod` = `p`.`PK_P_Cod`))) left join `T_Proyecto` `pr` on((`pr`.`FK_P_Cod` = `p`.`PK_P_Cod`))) group by `p`.`PK_P_Cod`,`p`.`P_Fecha_Creacion`,`p`.`FK_ESP_Cod`,`p`.`FK_EP_Cod` */
```
</details>


---
