# Database schema – SWGODLC (MySQL)

Versión basada en el dump (MySQL 8.0.35).

Este documento resume la estructura actual de la base de datos: tablas, columnas principales,
índices/constraints y relaciones. La idea es que puedas leer una tabla y justo debajo ver
cómo se relaciona con las demás sin ir al final del documento.

---

## 1. Tablas

### 1.1. T_Usuario

Usuarios base del sistema (clientes, empleados, etc.).

**Columnas**
- `PK_U_Cod` int, PK, AUTO_INCREMENT  
- `U_Nombre` varchar(25), NULL  
- `U_Apellido` varchar(25), NULL  
- `U_Correo` varchar(250), NOT NULL  
- `U_Contrasena` varchar(255), NULL  
- `U_Celular` varchar(25), NOT NULL  
- `U_Numero_Documento` varchar(11), NOT NULL  
- `U_Direccion` varchar(100), NULL  
- `U_Fecha_Crea` datetime, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `U_Fecha_Upd` datetime, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  

**Índices / constraints**
- PK: (`PK_U_Cod`)  
- UQ: `UQ_T_Usuario_Correo` (`U_Correo`)  
- UQ: `UQ_T_Usuario_Celular` (`U_Celular`)  
- UQ: `UQ_T_Usuario_NumDoc` (`U_Numero_Documento`)  
- CHECK `chk_usuario_correo_formato`: formato de correo vía regexp  
- CHECK `chk_usuario_doc_len_digits`: documento con 8 u 11 dígitos numéricos  

**Relaciones (desde esta tabla)**
- No define foreign keys hacia otras tablas (sirve como tabla raíz).  

**Relaciones (hacia esta tabla)**
- `T_Cliente.FK_U_Cod` → `T_Usuario.PK_U_Cod` (un usuario puede ser cliente).  
- `T_Empleados.FK_U_Cod` → `T_Usuario.PK_U_Cod` (un usuario puede ser empleado).  

---

### 1.2. T_Estado_Cliente

Catálogo de estados de cliente.

**Columnas**
- `PK_ECli_Cod` int, PK, AUTO_INCREMENT  
- `ECli_Nombre` varchar(25), NULL  

**Índices / constraints**
- PK: (`PK_ECli_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Cliente.FK_ECli_Cod` → `T_Estado_Cliente.PK_ECli_Cod`.  

---

### 1.3. T_Cliente

Cliente vinculado a un usuario.

**Columnas**
- `PK_Cli_Cod` int, PK, AUTO_INCREMENT  
- `FK_U_Cod` int, NOT NULL  
- `Cli_Tipo_Cliente` int, NULL  
- `FK_ECli_Cod` int, NOT NULL  

**Índices / constraints**
- PK: (`PK_Cli_Cod`)  
- UQ: `UQ_T_Cliente_FK_U` (`FK_U_Cod`) – un usuario solo puede ser cliente una vez.  
- FK: `FK_U_Cod` → `T_Usuario(PK_U_Cod)`  
- FK: `FK_ECli_Cod` → `T_Estado_Cliente(PK_ECli_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_Cliente` referencian un `T_Usuario`.  
- Muchos `T_Cliente` referencian un `T_Estado_Cliente`.  

**Relaciones (hacia esta tabla)**
- `T_Cotizacion.FK_Cli_Cod` → `T_Cliente.PK_Cli_Cod`.  
- `T_Pedido.FK_Cli_Cod` → `T_Cliente.PK_Cli_Cod`.  

---

### 1.4. T_Estado_Empleado

Catálogo de estados de empleado (DISPONIBLE / NO_DISPONIBLE).

**Columnas**
- `PK_Estado_Emp_Cod` tinyint unsigned, PK  
- `EsEm_Nombre` varchar(20), NOT NULL  

**Índices / constraints**
- PK: (`PK_Estado_Emp_Cod`)  
- UQ: (`EsEm_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Empleados.FK_Estado_Emp_Cod` → `T_Estado_Empleado.PK_Estado_Emp_Cod`.  

---

### 1.5. T_Tipo_Empleado

Catálogo de tipos de empleado / cargo.

**Columnas**
- `PK_Tipo_Emp_Cod` int, PK, AUTO_INCREMENT  
- `TiEm_Cargo` varchar(25), NULL  
- `TiEm_PermiteLogin` tinyint(1), NOT NULL, DEFAULT 0  
- `TiEm_OperativoCampo` tinyint(1), NOT NULL, DEFAULT 0  -- nuevo flag para indicar si el cargo participa en eventos/campo  

**Índices / constraints**
- PK: (`PK_Tipo_Emp_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Empleados.FK_Tipo_Emp_Cod` → `T_Tipo_Empleado.PK_Tipo_Emp_Cod`.  

---

### 1.6. T_Empleados

Registro de empleados a partir de un usuario.

**Columnas**
- `PK_Em_Cod` int, PK, AUTO_INCREMENT  
- `FK_U_Cod` int, NOT NULL  
- `Em_Autonomo` varchar(25), NULL  
- `FK_Tipo_Emp_Cod` int, NOT NULL  
- `FK_Estado_Emp_Cod` tinyint unsigned, NOT NULL, DEFAULT 1  

**Índices / constraints**
- PK: (`PK_Em_Cod`)  
- FK: `FK_U_Cod` → `T_Usuario(PK_U_Cod)`  
- FK: `FK_Tipo_Emp_Cod` → `T_Tipo_Empleado(PK_Tipo_Emp_Cod)`  
- FK: `FK_Estado_Emp_Cod` → `T_Estado_Empleado(PK_Estado_Emp_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_Empleados` referencian un `T_Usuario`.  
- Muchos `T_Empleados` referencian un `T_Tipo_Empleado`.  
- Muchos `T_Empleados` referencian un `T_Estado_Empleado`.  

**Relaciones (hacia esta tabla)**
- `T_Pedido.FK_Em_Cod` → `T_Empleados.PK_Em_Cod`.  
- `T_RecursosxProyecto.FK_Em_Cod` → `T_Empleados.PK_Em_Cod`.  

---

### 1.7. T_Estado_Equipo

Catálogo de estados del equipo (Disponible, En servicio, etc.).

**Columnas**
- `PK_EE_Cod` int, PK, AUTO_INCREMENT  
- `EE_Nombre` varchar(40), NOT NULL  

**Índices / constraints**
- PK: (`PK_EE_Cod`)  
- UQ: `uq_estado_nombre` (`EE_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Equipo.FK_EE_Cod` → `T_Estado_Equipo.PK_EE_Cod`.  

---

### 1.8. T_Tipo_Equipo

Catálogo de tipos de equipo (Cámara, Lente, Drone, etc.).

**Columnas**
- `PK_TE_Cod` int, PK, AUTO_INCREMENT  
- `TE_Nombre` varchar(60), NOT NULL  

**Índices / constraints**
- PK: (`PK_TE_Cod`)  
- UQ: `uq_tipo_nombre` (`TE_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Modelo.FK_TE_Cod` → `T_Tipo_Equipo.PK_TE_Cod`.  
- `T_EventoServicioEquipo.FK_TE_Cod` → `T_Tipo_Equipo.PK_TE_Cod`.  

---

### 1.9. T_Marca

Catálogo de marcas de equipo.

**Columnas**
- `PK_IMa_Cod` int, PK, AUTO_INCREMENT  
- `NMa_Nombre` varchar(100), NOT NULL  

**Índices / constraints**
- PK: (`PK_IMa_Cod`)  
- UQ: `uq_marca_nombre` (`NMa_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Modelo.FK_IMa_Cod` → `T_Marca.PK_IMa_Cod`.  

---

### 1.10. T_Modelo

Modelos de equipo (marca + tipo).

**Columnas**
- `PK_IMo_Cod` int, PK, AUTO_INCREMENT  
- `NMo_Nombre` varchar(100), NOT NULL  
- `FK_IMa_Cod` int, NOT NULL  
- `FK_TE_Cod` int, NOT NULL  

**Índices / constraints**
- PK: (`PK_IMo_Cod`)  
- UQ: `uq_modelo_nombre_marca` (`NMo_Nombre`, `FK_IMa_Cod`)  
- FK: `FK_IMa_Cod` → `T_Marca(PK_IMa_Cod)`  
- FK: `FK_TE_Cod` → `T_Tipo_Equipo(PK_TE_Cod)` ON DELETE RESTRICT ON UPDATE RESTRICT  

**Relaciones (desde esta tabla)**
- Muchos `T_Modelo` referencian una `T_Marca`.  
- Muchos `T_Modelo` referencian un `T_Tipo_Equipo`.  

**Relaciones (hacia esta tabla)**
- `T_Equipo.FK_IMo_Cod` → `T_Modelo.PK_IMo_Cod`.  

---

### 1.11. T_Equipo

Instancias físicas de equipos (inventario).

**Columnas**
- `PK_Eq_Cod` int, PK, AUTO_INCREMENT  
- `Eq_Fecha_Ingreso` date, NULL  
- `FK_IMo_Cod` int, NOT NULL  
- `FK_EE_Cod` int, NOT NULL  
- `Eq_Serie` varchar(64), NULL  

**Índices / constraints**
- PK: (`PK_Eq_Cod`)  
- UQ: `uq_equipo_serie` (`Eq_Serie`)  
- FK: `FK_IMo_Cod` → `T_Modelo(PK_IMo_Cod)`  
- FK: `FK_EE_Cod` → `T_Estado_Equipo(PK_EE_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_Equipo` referencian un `T_Modelo`.  
- Muchos `T_Equipo` referencian un `T_Estado_Equipo`.  

**Relaciones (hacia esta tabla)**
- `T_RecursosxProyecto.FK_Eq_Cod` → `T_Equipo.PK_Eq_Cod`.  

---

### 1.12. T_Servicios

Tipos de servicio (Fotografia, Video, Drone, Photobooth).

**Columnas**
- `PK_S_Cod` int, PK, AUTO_INCREMENT  
- `S_Nombre` varchar(25), NOT NULL  

**Índices / constraints**
- PK: (`PK_S_Cod`)  
- UQ: `uq_servicios_nombre` (`S_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_EventoServicio.PK_S_Cod` → `T_Servicios.PK_S_Cod`.  

---

### 1.13. T_Eventos

Tipos de evento (Boda, Cumpleaños, Corporativo, etc.).

**Columnas**
- `PK_E_Cod` int, PK, AUTO_INCREMENT  
- `E_Nombre` varchar(25), NOT NULL  
- `E_IconUrl` varchar(500), NULL  

**Índices / constraints**
- PK: (`PK_E_Cod`)  
- UQ: `uq_eventos_nombre` (`E_Nombre`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_EventoServicio.PK_E_Cod` → `T_Eventos.PK_E_Cod`.  

---

### 1.14. T_EventoServicioCategoria

Catálogo de categorías para los combos de evento/servicio.

**Columnas**
- `PK_ESC_Cod` int, PK, AUTO_INCREMENT  
- `ESC_Nombre` varchar(60), NOT NULL  
- `ESC_Tipo` enum('PAQUETE','ADDON'), NOT NULL DEFAULT 'PAQUETE'  
- `ESC_Activo` tinyint(1), NOT NULL DEFAULT 1  
- `ESC_Fecha_Creacion` timestamp, NOT NULL, DEFAULT CURRENT_TIMESTAMP  

**Índices / constraints**
- PK: (`PK_ESC_Cod`)  
- UQ: (`ESC_Nombre`)  

**Relaciones (desde esta tabla)**
- No declara FKs.  

**Relaciones (hacia esta tabla)**
- `T_EventoServicio.FK_ESC_Cod` → `T_EventoServicioCategoria.PK_ESC_Cod`.  

---

### 1.15. T_EventoServicio

Servicios predefinidos por tipo de evento (combos).

**Columnas**
- `PK_ExS_Cod` int, PK, AUTO_INCREMENT  
- `PK_S_Cod` int, NOT NULL  
- `PK_E_Cod` int, NOT NULL  
- `FK_ESC_Cod` int, NULL  
- `ExS_EsAddon` tinyint(1), NOT NULL, DEFAULT 0  -- 1 cuando el combo actúa como complemento  
- `ExS_Titulo` varchar(120), NOT NULL  
- `ExS_Precio` decimal(10,2), NULL  
- `ExS_Descripcion` varchar(100), NULL  
- `ExS_Horas` decimal(4,1), NULL  
- `ExS_FotosImpresas` int, NULL  
- `ExS_TrailerMin` int, NULL  
- `ExS_FilmMin` int, NULL  

**Índices / constraints**
- PK: (`PK_ExS_Cod`)  
- FK: `PK_S_Cod` → `T_Servicios(PK_S_Cod)`  
- FK: `PK_E_Cod` → `T_Eventos(PK_E_Cod)`  
- FK: `FK_ESC_Cod` → `T_EventoServicioCategoria(PK_ESC_Cod)` ON DELETE SET NULL  

**Relaciones (desde esta tabla)**
- Muchos `T_EventoServicio` referencian un `T_Servicios`.  
- Muchos `T_EventoServicio` referencian un `T_Eventos`.  
- Muchos `T_EventoServicio` referencian una `T_EventoServicioCategoria` cuando aplica.  

**Relaciones (hacia esta tabla)**
- `T_CotizacionServicio.FK_ExS_Cod` → `T_EventoServicio.PK_ExS_Cod`.  
- `T_EventoServicioEquipo.FK_ExS_Cod` → `T_EventoServicio.PK_ExS_Cod`.  
- `T_EventoServicioStaff.FK_ExS_Cod` → `T_EventoServicio.PK_ExS_Cod`.  
- `T_PedidoServicio.FK_ExS_Cod` → `T_EventoServicio.PK_ExS_Cod`.  

---

### 1.16. T_EventoServicioEquipo

Equipo estándar requerido por un servicio de evento.

**Columnas**
- `PK_ExS_Equipo_Cod` int, PK, AUTO_INCREMENT  
- `FK_ExS_Cod` int, NOT NULL  
- `FK_TE_Cod` int, NOT NULL  
- `Cantidad` smallint unsigned, NOT NULL, DEFAULT 1  
- `Notas` varchar(150), NULL  

**Índices / constraints**
- PK: (`PK_ExS_Equipo_Cod`)  
- FK: `FK_ExS_Cod` → `T_EventoServicio(PK_ExS_Cod)` ON DELETE CASCADE  
- FK: `FK_TE_Cod` → `T_Tipo_Equipo(PK_TE_Cod)` ON DELETE RESTRICT  

**Relaciones (desde esta tabla)**
- Muchos `T_EventoServicioEquipo` referencian un `T_EventoServicio`.  
- Muchos `T_EventoServicioEquipo` referencian un `T_Tipo_Equipo`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_EventoServicioEquipo`.  

---

### 1.17. T_EventoServicioStaff

Staff recomendado por servicio de evento.

**Columnas**
- `PK_ExS_Staff_Cod` int, PK, AUTO_INCREMENT  
- `FK_ExS_Cod` int, NOT NULL  
- `Staff_Rol` varchar(40), NOT NULL  
- `Staff_Cantidad` smallint unsigned, NOT NULL, DEFAULT 0  

**Índices / constraints**
- PK: (`PK_ExS_Staff_Cod`)  
- FK: `FK_ExS_Cod` → `T_EventoServicio(PK_ExS_Cod)` ON DELETE CASCADE  

**Relaciones (desde esta tabla)**
- Muchos `T_EventoServicioStaff` referencian un `T_EventoServicio`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_EventoServicioStaff`.  

---

### 1.18. T_Lead

Leads (potenciales clientes) capturados.

**Columnas**
- `PK_Lead_Cod` int, PK, AUTO_INCREMENT  
- `Lead_Nombre` varchar(80), NOT NULL  
- `Lead_Celular` varchar(30), NULL  
- `Lead_Origen` varchar(40), NULL  
- `Lead_Fecha_Crea` datetime, NOT NULL, DEFAULT CURRENT_TIMESTAMP  

**Índices / constraints**
- PK: (`PK_Lead_Cod`)  

**Relaciones (desde esta tabla)**
- No define FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Cotizacion.FK_Lead_Cod` → `T_Lead.PK_Lead_Cod`.  

---

### 1.19. T_Cotizacion

Cotizaciones generadas desde un lead o desde un cliente (origen exclusivo).

**Columnas**
- `PK_Cot_Cod` int, PK, AUTO_INCREMENT  
- `FK_Lead_Cod` int, NULL  
- `Cot_TipoEvento` varchar(40), NOT NULL  
- `Cot_FechaEvento` date, NULL  
- `Cot_Lugar` varchar(150), NULL  
- `Cot_HorasEst` decimal(4,1), NULL  
- `Cot_Mensaje` varchar(500), NULL  
- `Cot_Estado` varchar(20), NOT NULL, DEFAULT 'Borrador'  
- `Cot_Fecha_Crea` datetime, NOT NULL, DEFAULT CURRENT_TIMESTAMP  
- `Cot_IdTipoEvento` int, NOT NULL  
- `FK_Cli_Cod` int, NULL  

**Índices / constraints**
- PK: (`PK_Cot_Cod`)  
- IX: `ix_cot_lead` (`FK_Lead_Cod`)  
- IX: `ix_cot_cli` (`FK_Cli_Cod`)  
- FK: `FK_Lead_Cod` → `T_Lead(PK_Lead_Cod)`  
- FK: `FK_Cli_Cod` → `T_Cliente(PK_Cli_Cod)`  
- CHECK `chk_cot_origen`: el origen debe ser lead **o** cliente, pero no ambos.  

**Relaciones (desde esta tabla)**
- Muchas cotizaciones pueden referenciar un solo `T_Lead`.  
- Muchas cotizaciones pueden referenciar un solo `T_Cliente`.  

**Relaciones (hacia esta tabla)**
- `T_CotizacionEvento.FK_Cot_Cod` → `T_Cotizacion.PK_Cot_Cod`.  
- `T_CotizacionServicio.FK_Cot_Cod` → `T_Cotizacion.PK_Cot_Cod`.  
- `T_Pedido.FK_Cot_Cod` → `T_Cotizacion.PK_Cot_Cod`.  

---

### 1.20. T_CotizacionEvento

Fechas y ubicaciones asociadas a una cotización (varios eventos/hitos).

**Columnas**
- `PK_CotE_Cod` int, PK, AUTO_INCREMENT  
- `FK_Cot_Cod` int, NOT NULL  
- `CotE_Fecha` date, NOT NULL  
- `CotE_Hora` time, NULL  
- `CotE_Ubicacion` varchar(100), NULL  
- `CotE_Direccion` varchar(150), NULL  
- `CotE_Notas` varchar(255), NULL  

**Índices / constraints**
- PK: (`PK_CotE_Cod`)  
- FK: `FK_Cot_Cod` → `T_Cotizacion(PK_Cot_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_CotizacionEvento` pertenecen a una `T_Cotizacion`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_CotizacionEvento`.  

---

### 1.21. T_CotizacionServicio

Servicios configurados dentro de una cotización.

**Columnas**
- `PK_CotServ_Cod` int, PK, AUTO_INCREMENT  
- `FK_Cot_Cod` int, NOT NULL  
- `FK_ExS_Cod` int, NULL  
- `CS_EventoId` int, NULL  
- `CS_ServicioId` int, NULL  
- `CS_Nombre` varchar(120), NOT NULL  
- `CS_Descripcion` varchar(1000), NULL  
- `CS_Moneda` char(3), NOT NULL, DEFAULT 'USD'  
- `CS_PrecioUnit` decimal(10,2), NOT NULL  
- `CS_Cantidad` decimal(10,2), NOT NULL, DEFAULT 1.00  
- `CS_Descuento` decimal(10,2), NOT NULL, DEFAULT 0.00  
- `CS_Recargo` decimal(10,2), NOT NULL, DEFAULT 0.00  
- `CS_Subtotal` decimal(10,2), GENERATED ALWAYS ( (Precio - Descuento + Recargo) * Cantidad ) STORED  
- `CS_Notas` varchar(150), NULL  
- `CS_Horas` decimal(4,1), NULL  
- `CS_Staff` smallint, NULL  
- `CS_FotosImpresas` int, NULL  
- `CS_TrailerMin` int, NULL  
- `CS_FilmMin` int, NULL  

**Índices / constraints**
- PK: (`PK_CotServ_Cod`)  
- FK: `FK_Cot_Cod` → `T_Cotizacion(PK_Cot_Cod)`  
- FK: `FK_ExS_Cod` → `T_EventoServicio(PK_ExS_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_CotizacionServicio` pertenecen a una `T_Cotizacion`.  
- Muchos `T_CotizacionServicio` pueden vincularse a un `T_EventoServicio` predefinido.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_CotizacionServicio`.  

---

### 1.22. T_Estado_Pedido

Catálogo de estados del pedido (Cotizado, Contratado, En ejecución, etc.).

**Columnas**
- `PK_EP_Cod` int, PK, AUTO_INCREMENT  
- `EP_Nombre` varchar(25), NULL  

**Índices / constraints**
- PK: (`PK_EP_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Pedido.FK_EP_Cod` → `T_Estado_Pedido.PK_EP_Cod`.  

---

### 1.23. T_Estado_Pago

Catálogo de estados de pago (Pendiente, Parcial, Pagado, etc.).

**Columnas**
- `PK_ESP_Cod` int, PK, AUTO_INCREMENT  
- `ESP_Nombre` varchar(25), NULL  

**Índices / constraints**
- PK: (`PK_ESP_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Pedido.FK_ESP_Cod` → `T_Estado_Pago.PK_ESP_Cod`.  

---

### 1.24. T_Pedido

Pedidos confirmados (contratos en ejecución).

**Columnas**
- `PK_P_Cod` int, PK, AUTO_INCREMENT  
- `FK_EP_Cod` int, NOT NULL          -- estado del pedido  
- `FK_Cli_Cod` int, NOT NULL         -- cliente  
- `FK_ESP_Cod` int, NOT NULL         -- estado de pago  
- `P_Fecha_Creacion` date, NULL  
- `P_Observaciones` varchar(255), NULL  
- `FK_Em_Cod` int, NOT NULL          -- empleado responsable/vendedor  
- `P_Nombre_Pedido` varchar(225), NULL  
- `FK_Cot_Cod` int, NULL             -- cotización origen  
- `P_FechaEvento` varchar(45), NULL  

**Índices / constraints**
- PK: (`PK_P_Cod`)  
- IX: `IX_Pedido_Cliente` (`FK_Cli_Cod`)  
- IX: `IX_Pedido_Estado` (`FK_EP_Cod`)  
- IX: `IX_Pedido_Estado_Pago` (`FK_ESP_Cod`)  
- IX: `IX_Pedido_Empleado` (`FK_Em_Cod`)  
- IX: `IX_Pedido_Cotizacion` (`FK_Cot_Cod`)  
- FK: `FK_Cli_Cod` → `T_Cliente(PK_Cli_Cod)`  
- FK: `FK_EP_Cod` → `T_Estado_Pedido(PK_EP_Cod)`  
- FK: `FK_ESP_Cod` → `T_Estado_Pago(PK_ESP_Cod)`  
- FK: `FK_Em_Cod` → `T_Empleados(PK_Em_Cod)`  
- FK: `FK_Cot_Cod` → `T_Cotizacion(PK_Cot_Cod)` ON DELETE SET NULL ON UPDATE RESTRICT  

**Relaciones (desde esta tabla)**
- Muchos `T_Pedido` referencian un `T_Cliente`.  
- Muchos `T_Pedido` referencian un `T_Estado_Pedido`.  
- Muchos `T_Pedido` referencian un `T_Estado_Pago`.  
- Muchos `T_Pedido` referencian un `T_Empleados`.  
- Muchos `T_Pedido` pueden derivar de una `T_Cotizacion`.  

**Relaciones (hacia esta tabla)**
- `T_Contrato.FK_P_Cod` → `T_Pedido.PK_P_Cod`.  
- `T_PedidoEvento.FK_P_Cod` → `T_Pedido.PK_P_Cod`.  
- `T_PedidoServicio.FK_P_Cod` → `T_Pedido.PK_P_Cod`.  
- `T_Proyecto.FK_P_Cod` → `T_Pedido.PK_P_Cod`.  
- `T_Voucher.FK_P_Cod` → `T_Pedido.PK_P_Cod`.  

---

### 1.25. T_PedidoEvento

Fechas y ubicaciones específicas del pedido (similar a T_CotizacionEvento pero ya contratado).

**Columnas**
- `PK_PE_Cod` int, PK, AUTO_INCREMENT  
- `FK_P_Cod` int, NOT NULL  
- `PE_Fecha` date, NOT NULL  
- `PE_Hora` time, NULL  
- `PE_Ubicacion` varchar(100), NULL  
- `PE_Direccion` varchar(150), NULL  
- `PE_Notas` varchar(255), NULL  

**Índices / constraints**
- PK: (`PK_PE_Cod`)  
- FK: `FK_P_Cod` → `T_Pedido(PK_P_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_PedidoEvento` pertenecen a un `T_Pedido`.  

**Relaciones (hacia esta tabla)**
- `T_PedidoServicio.FK_PE_Cod` → `T_PedidoEvento.PK_PE_Cod`.  

---

### 1.26. T_PedidoServicio

Servicios finales contratados en un pedido.

**Columnas**
- `PK_PS_Cod` int, PK, AUTO_INCREMENT  
- `FK_P_Cod` int, NOT NULL  
- `FK_ExS_Cod` int, NULL  
- `FK_PE_Cod` int, NULL  
- `PS_Nombre` varchar(120), NOT NULL  
- `PS_Descripcion` varchar(255), NULL  
- `PS_Moneda` char(3), NOT NULL, DEFAULT 'USD'  
- `PS_PrecioUnit` decimal(10,2), NOT NULL  
- `PS_Cantidad` decimal(10,2), NOT NULL, DEFAULT 1.00  
- `PS_Descuento` decimal(10,2), NOT NULL, DEFAULT 0.00  
- `PS_Recargo` decimal(10,2), NOT NULL, DEFAULT 0.00  
- `PS_Subtotal` decimal(10,2), GENERATED ALWAYS STORED  
- `PS_Notas` varchar(150), NULL  

**Índices / constraints**
- PK: (`PK_PS_Cod`)  
- FK: `FK_P_Cod` → `T_Pedido(PK_P_Cod)`  
- FK: `FK_ExS_Cod` → `T_EventoServicio(PK_ExS_Cod)`  
- FK: `FK_PE_Cod` → `T_PedidoEvento(PK_PE_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos `T_PedidoServicio` pertenecen a un `T_Pedido`.  
- Muchos `T_PedidoServicio` pueden vincularse a un `T_EventoServicio`.  
- Muchos `T_PedidoServicio` pueden vincularse a un `T_PedidoEvento` concreto.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_PedidoServicio`.  

---

### 1.27. T_Contrato

Contrato asociado a un pedido.

**Columnas**
- `PK_Cont_Cod` int, PK, AUTO_INCREMENT  
- `Cont_Link` varchar(255), NULL  
- `FK_P_Cod` int, NOT NULL  

**Índices / constraints**
- PK: (`PK_Cont_Cod`)  
- FK: `FK_P_Cod` → `T_Pedido(PK_P_Cod)`  

**Relaciones (desde esta tabla)**
- Cada contrato pertenece a un `T_Pedido`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_Contrato`.  

---

### 1.28. T_Proyecto

Proyecto de edición asociado a un pedido.

**Columnas**
- `PK_Pro_Cod` int, PK, AUTO_INCREMENT  
- `Pro_Nombre` varchar(50), NULL  
- `FK_P_Cod` int, NOT NULL  
- `EPro_Fecha_Inicio_Edicion` date, NULL  
- `Pro_Fecha_Fin_Edicion` date, NULL  
- `Pro_Revision_Edicion` int, NULL  
- `Pro_Revision_Multimedia` int, NULL  
- `Pro_Enlace` varchar(255), NULL  

**Índices / constraints**
- PK: (`PK_Pro_Cod`)  
- FK: `FK_P_Cod` → `T_Pedido(PK_P_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos proyectos pertenecen a un `T_Pedido`.  

**Relaciones (hacia esta tabla)**
- `T_RecursosxProyecto.FK_Pro_Cod` → `T_Proyecto.PK_Pro_Cod`.  

---

### 1.29. T_RecursosxProyecto

Asignación de recursos (empleados y equipos) a un proyecto.

**Columnas**
- `PK_RxP_Cod` int, PK, AUTO_INCREMENT  
- `FK_Pro_Cod` int, NOT NULL  
- `FK_Em_Cod` int, NOT NULL  
- `FK_Eq_Cod` int, NOT NULL  

**Índices / constraints**
- PK: (`PK_RxP_Cod`)  
- FK: `FK_Pro_Cod` → `T_Proyecto(PK_Pro_Cod)`  
- FK: `FK_Em_Cod` → `T_Empleados(PK_Em_Cod)`  
- FK: `FK_Eq_Cod` → `T_Equipo(PK_Eq_Cod)` ON DELETE RESTRICT ON UPDATE RESTRICT  

**Relaciones (desde esta tabla)**
- Muchos `T_RecursosxProyecto` se asocian a un `T_Proyecto`.  
- Muchos `T_RecursosxProyecto` se asocian a un `T_Empleados`.  
- Muchos `T_RecursosxProyecto` se asocian a un `T_Equipo`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_RecursosxProyecto`.  

---

### 1.30. T_Metodo_Pago

Catálogo de métodos de pago.

**Columnas**
- `PK_MP_Cod` int, PK, AUTO_INCREMENT  
- `MP_Nombre` varchar(25), NULL  

**Índices / constraints**
- PK: (`PK_MP_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Voucher.FK_MP_Cod` → `T_Metodo_Pago.PK_MP_Cod`.  

---

### 1.31. T_Estado_voucher

Catálogo de estados de voucher (Pendiente, Aprobado, Rechazado).

**Columnas**
- `PK_EV_Cod` int, PK, AUTO_INCREMENT  
- `EV_Nombre` varchar(25), NULL  

**Índices / constraints**
- PK: (`PK_EV_Cod`)  

**Relaciones (desde esta tabla)**
- No tiene FKs hacia otras tablas.  

**Relaciones (hacia esta tabla)**
- `T_Voucher.FK_EV_Cod` → `T_Estado_voucher.PK_EV_Cod`.  

---

### 1.32. T_Voucher

Vouchers de pago asociados a pedidos.

**Columnas**
- `PK_Pa_Cod` int, PK, AUTO_INCREMENT  
- `Pa_Monto_Depositado` int, NULL  
- `FK_MP_Cod` int, NOT NULL  
- `Pa_Imagen_Voucher` longblob, NULL  
- `FK_P_Cod` int, NOT NULL  
- `FK_EV_Cod` int, NOT NULL  
- `Pa_Fecha` date, NULL  
- `Pa_Imagen_Mime` varchar(100), NULL  
- `Pa_Imagen_NombreOriginal` varchar(255), NULL  
- `Pa_Imagen_Size` int, NULL  

**Índices / constraints**
- PK: (`PK_Pa_Cod`)  
- FK: `FK_MP_Cod` → `T_Metodo_Pago(PK_MP_Cod)`  
- FK: `FK_P_Cod` → `T_Pedido(PK_P_Cod)`  
- FK: `FK_EV_Cod` → `T_Estado_voucher(PK_EV_Cod)`  

**Relaciones (desde esta tabla)**
- Muchos vouchers pertenecen a un `T_Pedido`.  
- Muchos vouchers usan un `T_Metodo_Pago`.  
- Muchos vouchers tienen un `T_Estado_voucher`.  

**Relaciones (hacia esta tabla)**
- No hay tablas que referencien a `T_Voucher`.  
