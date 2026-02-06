-- Snapshot schema + SPs
-- Generated at 2026-02-06T16:56:18.937Z

-- Table: T_Cliente
CREATE TABLE "T_Cliente" (
  "PK_Cli_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_U_Cod" int NOT NULL,
  "Cli_Tipo_Cliente" int DEFAULT NULL,
  "FK_ECli_Cod" int NOT NULL,
  "Cli_RazonSocial" varchar(150) DEFAULT NULL,
  PRIMARY KEY ("PK_Cli_Cod"),
  UNIQUE KEY "UQ_T_Cliente_FK_U" ("FK_U_Cod"),
  KEY "FK_T_Cliente_T_Estado_Cliente" ("FK_ECli_Cod"),
  CONSTRAINT "FK_T_Cliente_T_Estado_Cliente" FOREIGN KEY ("FK_ECli_Cod") REFERENCES "T_Estado_Cliente" ("PK_ECli_Cod"),
  CONSTRAINT "FK_T_Cliente_T_Usuario" FOREIGN KEY ("FK_U_Cod") REFERENCES "T_Usuario" ("PK_U_Cod")
);

-- Table: T_Contrato
CREATE TABLE "T_Contrato" (
  "PK_Cont_Cod" int NOT NULL AUTO_INCREMENT,
  "Cont_Link" varchar(255) DEFAULT NULL,
  "FK_P_Cod" int NOT NULL,
  PRIMARY KEY ("PK_Cont_Cod"),
  KEY "FK_T_Contrato_T_Pedido" ("FK_P_Cod"),
  CONSTRAINT "FK_T_Contrato_T_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

-- Table: T_Cotizacion
CREATE TABLE "T_Cotizacion" (
  "PK_Cot_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Lead_Cod" int DEFAULT NULL,
  "Cot_TipoEvento" varchar(40) NOT NULL,
  "Cot_FechaEvento" date DEFAULT NULL,
  "Cot_Lugar" varchar(150) DEFAULT NULL,
  "Cot_HorasEst" decimal(4,1) DEFAULT NULL,
  "Cot_Dias" smallint DEFAULT NULL,
  "Cot_Mensaje" varchar(500) DEFAULT NULL,
  "Cot_Fecha_Crea" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "Cot_IdTipoEvento" int NOT NULL,
  "FK_Cli_Cod" int DEFAULT NULL,
  "FK_ECot_Cod" int NOT NULL DEFAULT '1',
  "Cot_ViaticosMonto" decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY ("PK_Cot_Cod"),
  KEY "ix_cot_lead" ("FK_Lead_Cod"),
  KEY "ix_cot_cli" ("FK_Cli_Cod"),
  KEY "FK_T_Cotizacion_T_Estado_Cotizacion" ("FK_ECot_Cod"),
  CONSTRAINT "fk_cot_cliente" FOREIGN KEY ("FK_Cli_Cod") REFERENCES "T_Cliente" ("PK_Cli_Cod"),
  CONSTRAINT "FK_Cot_Lead" FOREIGN KEY ("FK_Lead_Cod") REFERENCES "T_Lead" ("PK_Lead_Cod"),
  CONSTRAINT "FK_T_Cotizacion_T_Estado_Cotizacion" FOREIGN KEY ("FK_ECot_Cod") REFERENCES "T_Estado_Cotizacion" ("PK_ECot_Cod"),
  CONSTRAINT "chk_cot_origen" CHECK ((((`FK_Lead_Cod` is not null) and (`FK_Cli_Cod` is null)) or ((`FK_Lead_Cod` is null) and (`FK_Cli_Cod` is not null))))
);

-- Table: T_CotizacionEvento
CREATE TABLE "T_CotizacionEvento" (
  "PK_CotE_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Cot_Cod" int NOT NULL,
  "CotE_Fecha" date NOT NULL,
  "CotE_Hora" time DEFAULT NULL,
  "CotE_Ubicacion" varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "CotE_Direccion" varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  "CotE_Notas" varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY ("PK_CotE_Cod"),
  KEY "FK_CotizacionEvento_Cotizacion" ("FK_Cot_Cod"),
  CONSTRAINT "FK_CotizacionEvento_Cotizacion" FOREIGN KEY ("FK_Cot_Cod") REFERENCES "T_Cotizacion" ("PK_Cot_Cod")
);

-- Table: T_CotizacionServicio
CREATE TABLE "T_CotizacionServicio" (
  "PK_CotServ_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Cot_Cod" int NOT NULL,
  "FK_ExS_Cod" int DEFAULT NULL,
  "CS_EventoId" int DEFAULT NULL,
  "CS_ServicioId" int DEFAULT NULL,
  "CS_Nombre" varchar(120) NOT NULL,
  "CS_Descripcion" varchar(1000) DEFAULT NULL,
  "CS_Moneda" char(3) NOT NULL DEFAULT 'USD',
  "CS_PrecioUnit" decimal(10,2) NOT NULL,
  "CS_Cantidad" decimal(10,2) NOT NULL DEFAULT '1.00',
  "CS_Descuento" decimal(10,2) NOT NULL DEFAULT '0.00',
  "CS_Recargo" decimal(10,2) NOT NULL DEFAULT '0.00',
  "CS_Subtotal" decimal(10,2) GENERATED ALWAYS AS ((((`CS_PrecioUnit` - `CS_Descuento`) + `CS_Recargo`) * `CS_Cantidad`)) STORED,
  "CS_Notas" varchar(150) DEFAULT NULL,
  "CS_Horas" decimal(4,1) DEFAULT NULL,
  "CS_Staff" smallint DEFAULT NULL,
  "CS_FotosImpresas" int DEFAULT NULL,
  "CS_TrailerMin" int DEFAULT NULL,
  "CS_FilmMin" int DEFAULT NULL,
  PRIMARY KEY ("PK_CotServ_Cod"),
  KEY "FK_CotServ_Cot" ("FK_Cot_Cod"),
  KEY "FK_CotServ_ExS" ("FK_ExS_Cod"),
  CONSTRAINT "FK_CotServ_Cot" FOREIGN KEY ("FK_Cot_Cod") REFERENCES "T_Cotizacion" ("PK_Cot_Cod"),
  CONSTRAINT "FK_CotServ_ExS" FOREIGN KEY ("FK_ExS_Cod") REFERENCES "T_EventoServicio" ("PK_ExS_Cod")
);

-- Table: T_CotizacionServicioFecha
CREATE TABLE "T_CotizacionServicioFecha" (
  "PK_CSF_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Cot_Cod" int NOT NULL,
  "FK_CotServ_Cod" int NOT NULL,
  "CSF_Fecha" date NOT NULL,
  PRIMARY KEY ("PK_CSF_Cod"),
  UNIQUE KEY "UQ_CSF_Servicio_Fecha" ("FK_CotServ_Cod","CSF_Fecha"),
  KEY "IX_CSF_Cot" ("FK_Cot_Cod"),
  KEY "IX_CSF_Fecha" ("CSF_Fecha"),
  CONSTRAINT "FK_CSF_Cot" FOREIGN KEY ("FK_Cot_Cod") REFERENCES "T_Cotizacion" ("PK_Cot_Cod"),
  CONSTRAINT "FK_CSF_CotServ" FOREIGN KEY ("FK_CotServ_Cod") REFERENCES "T_CotizacionServicio" ("PK_CotServ_Cod")
);

-- Table: T_Empleados
CREATE TABLE "T_Empleados" (
  "PK_Em_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_U_Cod" int NOT NULL,
  "Em_Autonomo" varchar(25) DEFAULT NULL,
  "FK_Tipo_Emp_Cod" int NOT NULL,
  "FK_Estado_Emp_Cod" tinyint unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_Em_Cod"),
  KEY "FK_T_Empleados_T_Usuario" ("FK_U_Cod"),
  KEY "FK_T_Empleados_T_Tipo_Empleado" ("FK_Tipo_Emp_Cod"),
  KEY "FK_T_Empleados_Estado" ("FK_Estado_Emp_Cod"),
  CONSTRAINT "FK_T_Empleados_Estado" FOREIGN KEY ("FK_Estado_Emp_Cod") REFERENCES "T_Estado_Empleado" ("PK_Estado_Emp_Cod"),
  CONSTRAINT "FK_T_Empleados_T_Tipo_Empleado" FOREIGN KEY ("FK_Tipo_Emp_Cod") REFERENCES "T_Tipo_Empleado" ("PK_Tipo_Emp_Cod"),
  CONSTRAINT "FK_T_Empleados_T_Usuario" FOREIGN KEY ("FK_U_Cod") REFERENCES "T_Usuario" ("PK_U_Cod")
);

-- Table: T_Equipo
CREATE TABLE "T_Equipo" (
  "PK_Eq_Cod" int NOT NULL AUTO_INCREMENT,
  "Eq_Fecha_Ingreso" date DEFAULT NULL,
  "FK_IMo_Cod" int NOT NULL,
  "FK_EE_Cod" int NOT NULL,
  "Eq_Serie" varchar(64) DEFAULT NULL,
  PRIMARY KEY ("PK_Eq_Cod"),
  UNIQUE KEY "uq_equipo_serie" ("Eq_Serie"),
  KEY "FK_T_Equipo_T_Estado_Equipo" ("FK_EE_Cod"),
  KEY "FK_T_Equipo_T_Modelo" ("FK_IMo_Cod"),
  CONSTRAINT "FK_T_Equipo_T_Estado_Equipo" FOREIGN KEY ("FK_EE_Cod") REFERENCES "T_Estado_Equipo" ("PK_EE_Cod"),
  CONSTRAINT "FK_T_Equipo_T_Modelo" FOREIGN KEY ("FK_IMo_Cod") REFERENCES "T_Modelo" ("PK_IMo_Cod") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- Table: T_Estado_Cliente
CREATE TABLE "T_Estado_Cliente" (
  "PK_ECli_Cod" int NOT NULL AUTO_INCREMENT,
  "ECli_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ECli_Cod")
);

-- Table: T_Estado_Cotizacion
CREATE TABLE "T_Estado_Cotizacion" (
  "PK_ECot_Cod" int NOT NULL AUTO_INCREMENT,
  "ECot_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ECot_Cod")
);

-- Table: T_Estado_Empleado
CREATE TABLE "T_Estado_Empleado" (
  "PK_Estado_Emp_Cod" tinyint unsigned NOT NULL,
  "EsEm_Nombre" varchar(20) NOT NULL,
  PRIMARY KEY ("PK_Estado_Emp_Cod"),
  UNIQUE KEY "EsEm_Nombre" ("EsEm_Nombre")
);

-- Table: T_Estado_Equipo
CREATE TABLE "T_Estado_Equipo" (
  "PK_EE_Cod" int NOT NULL AUTO_INCREMENT,
  "EE_Nombre" varchar(40) NOT NULL,
  PRIMARY KEY ("PK_EE_Cod"),
  UNIQUE KEY "uq_estado_nombre" ("EE_Nombre")
);

-- Table: T_Estado_Pago
CREATE TABLE "T_Estado_Pago" (
  "PK_ESP_Cod" int NOT NULL AUTO_INCREMENT,
  "ESP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ESP_Cod")
);

-- Table: T_Estado_Pedido
CREATE TABLE "T_Estado_Pedido" (
  "PK_EP_Cod" int NOT NULL AUTO_INCREMENT,
  "EP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_EP_Cod")
);

-- Table: T_Estado_Proyecto
CREATE TABLE "T_Estado_Proyecto" (
  "PK_EPro_Cod" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "EPro_Nombre" varchar(30) NOT NULL,
  "EPro_Orden" tinyint unsigned NOT NULL DEFAULT '1',
  "Activo" tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_EPro_Cod"),
  UNIQUE KEY "uq_estado_proyecto_nombre" ("EPro_Nombre")
);

-- Table: T_Estado_Proyecto_Dia
CREATE TABLE "T_Estado_Proyecto_Dia" (
  "PK_EPD_Cod" int NOT NULL AUTO_INCREMENT,
  "EPD_Nombre" varchar(30) NOT NULL,
  "EPD_Orden" int NOT NULL DEFAULT '1',
  "Activo" tinyint(1) NOT NULL DEFAULT '1',
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_EPD_Cod"),
  UNIQUE KEY "uq_epd_nombre" ("EPD_Nombre")
);

-- Table: T_Estado_voucher
CREATE TABLE "T_Estado_voucher" (
  "PK_EV_Cod" int NOT NULL AUTO_INCREMENT,
  "EV_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_EV_Cod")
);

-- Table: T_EventoServicio
CREATE TABLE "T_EventoServicio" (
  "PK_ExS_Cod" int NOT NULL AUTO_INCREMENT,
  "PK_S_Cod" int NOT NULL,
  "PK_E_Cod" int NOT NULL,
  "ExS_Titulo" varchar(120) NOT NULL,
  "FK_ESC_Cod" int DEFAULT NULL,
  "ExS_EsAddon" tinyint(1) NOT NULL DEFAULT '0',
  "FK_ESE_Cod" int NOT NULL DEFAULT '1',
  "ExS_Precio" decimal(10,2) DEFAULT NULL,
  "ExS_Descripcion" varchar(100) DEFAULT NULL,
  "ExS_Horas" decimal(4,1) DEFAULT NULL,
  "ExS_FotosImpresas" int DEFAULT NULL,
  "ExS_TrailerMin" int DEFAULT NULL,
  "ExS_FilmMin" int DEFAULT NULL,
  PRIMARY KEY ("PK_ExS_Cod"),
  KEY "FK_T_EventoServicio_T_Servicios" ("PK_S_Cod"),
  KEY "FK_T_EventoServicio_T_Eventos" ("PK_E_Cod"),
  KEY "FK_EventoServicio_Categoria" ("FK_ESC_Cod"),
  KEY "FK_EventoServicio_Estado" ("FK_ESE_Cod"),
  CONSTRAINT "FK_EventoServicio_Categoria" FOREIGN KEY ("FK_ESC_Cod") REFERENCES "T_EventoServicioCategoria" ("PK_ESC_Cod"),
  CONSTRAINT "FK_EventoServicio_Estado" FOREIGN KEY ("FK_ESE_Cod") REFERENCES "T_EventoServicioEstado" ("PK_ESE_Cod"),
  CONSTRAINT "FK_T_EventoServicio_T_Eventos" FOREIGN KEY ("PK_E_Cod") REFERENCES "T_Eventos" ("PK_E_Cod"),
  CONSTRAINT "FK_T_EventoServicio_T_Servicios" FOREIGN KEY ("PK_S_Cod") REFERENCES "T_Servicios" ("PK_S_Cod")
);

-- Table: T_EventoServicioCategoria
CREATE TABLE "T_EventoServicioCategoria" (
  "PK_ESC_Cod" int NOT NULL AUTO_INCREMENT,
  "ESC_Nombre" varchar(60) NOT NULL,
  "ESC_Tipo" enum('PAQUETE','ADDON') NOT NULL DEFAULT 'PAQUETE',
  "ESC_Activo" tinyint(1) NOT NULL DEFAULT '1',
  "ESC_Fecha_Creacion" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_ESC_Cod"),
  UNIQUE KEY "ESC_Nombre" ("ESC_Nombre")
);

-- Table: T_EventoServicioEquipo
CREATE TABLE "T_EventoServicioEquipo" (
  "PK_ExS_Equipo_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_ExS_Cod" int NOT NULL,
  "FK_TE_Cod" int NOT NULL,
  "Cantidad" smallint unsigned NOT NULL DEFAULT '1',
  "Notas" varchar(150) DEFAULT NULL,
  PRIMARY KEY ("PK_ExS_Equipo_Cod"),
  KEY "fk_exs_equipo_exs" ("FK_ExS_Cod"),
  KEY "fk_exs_equipo_tipo" ("FK_TE_Cod"),
  CONSTRAINT "fk_exs_equipo_exs" FOREIGN KEY ("FK_ExS_Cod") REFERENCES "T_EventoServicio" ("PK_ExS_Cod") ON DELETE CASCADE,
  CONSTRAINT "fk_exs_equipo_tipo" FOREIGN KEY ("FK_TE_Cod") REFERENCES "T_Tipo_Equipo" ("PK_TE_Cod") ON DELETE RESTRICT
);

-- Table: T_EventoServicioEstado
CREATE TABLE "T_EventoServicioEstado" (
  "PK_ESE_Cod" int NOT NULL AUTO_INCREMENT,
  "ESE_Nombre" varchar(25) NOT NULL,
  PRIMARY KEY ("PK_ESE_Cod")
);

-- Table: T_EventoServicioStaff
CREATE TABLE "T_EventoServicioStaff" (
  "PK_ExS_Staff_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_ExS_Cod" int NOT NULL,
  "Staff_Rol" varchar(40) NOT NULL,
  "Staff_Cantidad" smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY ("PK_ExS_Staff_Cod"),
  KEY "fk_exs_staff_exs" ("FK_ExS_Cod"),
  CONSTRAINT "fk_exs_staff_exs" FOREIGN KEY ("FK_ExS_Cod") REFERENCES "T_EventoServicio" ("PK_ExS_Cod") ON DELETE CASCADE
);

-- Table: T_Eventos
CREATE TABLE "T_Eventos" (
  "PK_E_Cod" int NOT NULL AUTO_INCREMENT,
  "E_Nombre" varchar(25) NOT NULL,
  "E_IconUrl" varchar(500) DEFAULT NULL,
  "E_MostrarPortafolio" tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_E_Cod"),
  UNIQUE KEY "uq_eventos_nombre" ("E_Nombre")
);

-- Table: T_Lead
CREATE TABLE "T_Lead" (
  "PK_Lead_Cod" int NOT NULL AUTO_INCREMENT,
  "Lead_Nombre" varchar(80) NOT NULL,
  "Lead_Celular" varchar(30) DEFAULT NULL,
  "Lead_Origen" varchar(40) DEFAULT NULL,
  "Lead_Fecha_Crea" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_Lead_Cod")
);

-- Table: T_Marca
CREATE TABLE "T_Marca" (
  "PK_IMa_Cod" int NOT NULL AUTO_INCREMENT,
  "NMa_Nombre" varchar(100) NOT NULL,
  PRIMARY KEY ("PK_IMa_Cod"),
  UNIQUE KEY "uq_marca_nombre" ("NMa_Nombre")
);

-- Table: T_Metodo_Pago
CREATE TABLE "T_Metodo_Pago" (
  "PK_MP_Cod" int NOT NULL AUTO_INCREMENT,
  "MP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_MP_Cod")
);

-- Table: T_Modelo
CREATE TABLE "T_Modelo" (
  "PK_IMo_Cod" int NOT NULL AUTO_INCREMENT,
  "NMo_Nombre" varchar(100) NOT NULL,
  "FK_IMa_Cod" int NOT NULL,
  "FK_TE_Cod" int NOT NULL,
  PRIMARY KEY ("PK_IMo_Cod"),
  UNIQUE KEY "uq_modelo_nombre_marca" ("NMo_Nombre","FK_IMa_Cod"),
  KEY "FK_T_Modelo_T_Marca" ("FK_IMa_Cod"),
  KEY "FK_T_Modelo_T_Tipo_Equipo" ("FK_TE_Cod"),
  CONSTRAINT "FK_T_Modelo_T_Marca" FOREIGN KEY ("FK_IMa_Cod") REFERENCES "T_Marca" ("PK_IMa_Cod"),
  CONSTRAINT "FK_T_Modelo_T_Tipo_Equipo" FOREIGN KEY ("FK_TE_Cod") REFERENCES "T_Tipo_Equipo" ("PK_TE_Cod") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- Table: T_Pedido
CREATE TABLE "T_Pedido" (
  "PK_P_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_EP_Cod" int NOT NULL,
  "FK_Cli_Cod" int NOT NULL,
  "FK_ESP_Cod" int NOT NULL,
  "P_Fecha_Creacion" date DEFAULT NULL,
  "P_Observaciones" varchar(255) DEFAULT NULL,
  "FK_Em_Cod" int NOT NULL,
  "P_Nombre_Pedido" varchar(225) DEFAULT NULL,
  "FK_Cot_Cod" int DEFAULT NULL,
  "P_FechaEvento" date DEFAULT NULL,
  "P_HorasEst" decimal(4,1) DEFAULT NULL,
  "P_Dias" smallint DEFAULT NULL,
  "P_IdTipoEvento" int DEFAULT NULL,
  "P_ViaticosMonto" decimal(10,2) NOT NULL DEFAULT '0.00',
  "P_Mensaje" varchar(500) DEFAULT NULL,
  "P_Lugar" varchar(150) DEFAULT NULL,
  PRIMARY KEY ("PK_P_Cod"),
  KEY "IX_Pedido_Cliente" ("FK_Cli_Cod"),
  KEY "IX_Pedido_Estado" ("FK_EP_Cod"),
  KEY "IX_Pedido_Estado_Pago" ("FK_ESP_Cod"),
  KEY "IX_Pedido_Empleado" ("FK_Em_Cod"),
  KEY "IX_Pedido_Cotizacion" ("FK_Cot_Cod"),
  CONSTRAINT "FK_Pedido_Cliente" FOREIGN KEY ("FK_Cli_Cod") REFERENCES "T_Cliente" ("PK_Cli_Cod"),
  CONSTRAINT "FK_Pedido_Cotizacion" FOREIGN KEY ("FK_Cot_Cod") REFERENCES "T_Cotizacion" ("PK_Cot_Cod") ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT "FK_Pedido_Empleado" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "FK_Pedido_EstadoPago" FOREIGN KEY ("FK_ESP_Cod") REFERENCES "T_Estado_Pago" ("PK_ESP_Cod"),
  CONSTRAINT "FK_Pedido_EstadoPedido" FOREIGN KEY ("FK_EP_Cod") REFERENCES "T_Estado_Pedido" ("PK_EP_Cod")
);

-- Table: T_PedidoEvento
CREATE TABLE "T_PedidoEvento" (
  "PK_PE_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_P_Cod" int NOT NULL,
  "PE_Fecha" date NOT NULL,
  "PE_Hora" time DEFAULT NULL,
  "PE_Ubicacion" varchar(100) DEFAULT NULL,
  "PE_Direccion" varchar(150) DEFAULT NULL,
  "PE_Notas" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("PK_PE_Cod"),
  KEY "FK_PedidoEvento_Pedido" ("FK_P_Cod"),
  CONSTRAINT "FK_PedidoEvento_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

-- Table: T_PedidoServicio
CREATE TABLE "T_PedidoServicio" (
  "PK_PS_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_P_Cod" int NOT NULL,
  "FK_ExS_Cod" int DEFAULT NULL,
  "FK_PE_Cod" int DEFAULT NULL,
  "PS_EventoId" int DEFAULT NULL,
  "PS_ServicioId" int DEFAULT NULL,
  "PS_Nombre" varchar(120) NOT NULL,
  "PS_Descripcion" varchar(255) DEFAULT NULL,
  "PS_Moneda" char(3) NOT NULL DEFAULT 'USD',
  "PS_PrecioUnit" decimal(10,2) NOT NULL,
  "PS_Cantidad" decimal(10,2) NOT NULL DEFAULT '1.00',
  "PS_Descuento" decimal(10,2) NOT NULL DEFAULT '0.00',
  "PS_Recargo" decimal(10,2) NOT NULL DEFAULT '0.00',
  "PS_Subtotal" decimal(10,2) GENERATED ALWAYS AS ((((`PS_PrecioUnit` - `PS_Descuento`) + `PS_Recargo`) * `PS_Cantidad`)) STORED,
  "PS_Notas" varchar(150) DEFAULT NULL,
  "PS_Horas" decimal(4,1) DEFAULT NULL,
  "PS_Staff" smallint DEFAULT NULL,
  "PS_FotosImpresas" int DEFAULT NULL,
  "PS_TrailerMin" int DEFAULT NULL,
  "PS_FilmMin" int DEFAULT NULL,
  PRIMARY KEY ("PK_PS_Cod"),
  KEY "FK_PedidoServicio_Pedido" ("FK_P_Cod"),
  KEY "FK_PedidoServicio_ExS" ("FK_ExS_Cod"),
  KEY "FK_PedidoServicio_PedidoEvento" ("FK_PE_Cod"),
  CONSTRAINT "FK_PedidoServicio_ExS" FOREIGN KEY ("FK_ExS_Cod") REFERENCES "T_EventoServicio" ("PK_ExS_Cod"),
  CONSTRAINT "FK_PedidoServicio_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod"),
  CONSTRAINT "FK_PedidoServicio_PedidoEvento" FOREIGN KEY ("FK_PE_Cod") REFERENCES "T_PedidoEvento" ("PK_PE_Cod")
);

-- Table: T_PedidoServicioFecha
CREATE TABLE "T_PedidoServicioFecha" (
  "PK_PSF_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_P_Cod" int NOT NULL,
  "FK_PedServ_Cod" int NOT NULL,
  "PSF_Fecha" date NOT NULL,
  PRIMARY KEY ("PK_PSF_Cod"),
  UNIQUE KEY "UQ_PSF_Servicio_Fecha" ("FK_PedServ_Cod","PSF_Fecha"),
  KEY "IX_PSF_Pedido" ("FK_P_Cod"),
  KEY "IX_PSF_Fecha" ("PSF_Fecha"),
  CONSTRAINT "FK_PSF_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod"),
  CONSTRAINT "FK_PSF_PedServ" FOREIGN KEY ("FK_PedServ_Cod") REFERENCES "T_PedidoServicio" ("PK_PS_Cod")
);

-- Table: T_PortafolioImagen
CREATE TABLE "T_PortafolioImagen" (
  "PK_PI_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_E_Cod" int NOT NULL,
  "PI_Url" varchar(500) NOT NULL,
  "PI_Titulo" varchar(120) DEFAULT NULL,
  "PI_Descripcion" varchar(255) DEFAULT NULL,
  "PI_Orden" int NOT NULL DEFAULT '0',
  "PI_Fecha_Creacion" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PI_Cod"),
  KEY "IX_Portafolio_Evento" ("FK_E_Cod"),
  KEY "IX_Portafolio_Orden" ("PI_Orden"),
  CONSTRAINT "FK_Portafolio_Evento" FOREIGN KEY ("FK_E_Cod") REFERENCES "T_Eventos" ("PK_E_Cod")
);

-- Table: T_Proyecto
CREATE TABLE "T_Proyecto" (
  "PK_Pro_Cod" int NOT NULL AUTO_INCREMENT,
  "Pro_Nombre" varchar(50) DEFAULT NULL,
  "FK_P_Cod" int NOT NULL,
  "Pro_Estado" tinyint unsigned NOT NULL DEFAULT '1',
  "FK_Em_Cod" int DEFAULT NULL,
  "EPro_Fecha_Inicio_Edicion" date DEFAULT NULL,
  "Pro_Fecha_Fin_Edicion" date DEFAULT NULL,
  "Pro_Revision_Edicion" int DEFAULT NULL,
  "Pro_Revision_Multimedia" int DEFAULT NULL,
  "Pro_Enlace" varchar(255) DEFAULT NULL,
  "Pro_Notas" varchar(255) DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "Pro_Pre_Entrega_Enlace" varchar(255) DEFAULT NULL,
  "Pro_Pre_Entrega_Tipo" varchar(60) DEFAULT NULL,
  "Pro_Pre_Entrega_Feedback" varchar(255) DEFAULT NULL,
  "Pro_Pre_Entrega_Fecha" date DEFAULT NULL,
  "Pro_Respaldo_Ubicacion" varchar(255) DEFAULT NULL,
  "Pro_Respaldo_Notas" varchar(255) DEFAULT NULL,
  "Pro_Entrega_Final_Enlace" varchar(255) DEFAULT NULL,
  "Pro_Entrega_Final_Fecha" date DEFAULT NULL,
  PRIMARY KEY ("PK_Pro_Cod"),
  UNIQUE KEY "ux_proyecto_pedido" ("FK_P_Cod"),
  KEY "fk_proyecto_responsable" ("FK_Em_Cod"),
  KEY "fk_proyecto_estado" ("Pro_Estado"),
  CONSTRAINT "fk_proyecto_estado" FOREIGN KEY ("Pro_Estado") REFERENCES "T_Estado_Proyecto" ("PK_EPro_Cod"),
  CONSTRAINT "fk_proyecto_responsable" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "FK_T_Proyecto_T_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

-- Table: T_ProyectoDia
CREATE TABLE "T_ProyectoDia" (
  "PK_PD_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Pro_Cod" int NOT NULL,
  "FK_EPD_Cod" int NOT NULL DEFAULT '1',
  "PD_Fecha" date NOT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PD_Cod"),
  UNIQUE KEY "uq_proyecto_dia" ("FK_Pro_Cod","PD_Fecha"),
  KEY "ix_proyecto_dia_fecha" ("PD_Fecha"),
  KEY "ix_proyecto_dia_estado" ("FK_EPD_Cod"),
  CONSTRAINT "fk_proyecto_dia_estado" FOREIGN KEY ("FK_EPD_Cod") REFERENCES "T_Estado_Proyecto_Dia" ("PK_EPD_Cod"),
  CONSTRAINT "fk_proyecto_dia_proyecto" FOREIGN KEY ("FK_Pro_Cod") REFERENCES "T_Proyecto" ("PK_Pro_Cod")
);

-- Table: T_ProyectoDiaBloque
CREATE TABLE "T_ProyectoDiaBloque" (
  "PK_PDB_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "PDB_Hora" time DEFAULT NULL,
  "PDB_Ubicacion" varchar(100) DEFAULT NULL,
  "PDB_Direccion" varchar(150) DEFAULT NULL,
  "PDB_Notas" varchar(255) DEFAULT NULL,
  "PDB_Orden" int NOT NULL DEFAULT '1',
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDB_Cod"),
  UNIQUE KEY "uq_pdb_dia_orden" ("FK_PD_Cod","PDB_Orden"),
  KEY "ix_pdb_dia" ("FK_PD_Cod"),
  CONSTRAINT "fk_pdb_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE
);

-- Table: T_ProyectoDiaEmpleado
CREATE TABLE "T_ProyectoDiaEmpleado" (
  "PK_PDE_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "FK_Em_Cod" int NOT NULL,
  "PDE_Notas" varchar(255) DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDE_Cod"),
  UNIQUE KEY "uq_pd_empleado" ("FK_PD_Cod","FK_Em_Cod"),
  KEY "ix_pde_empleado" ("FK_Em_Cod"),
  CONSTRAINT "fk_pde_empleado" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "fk_pde_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE
);

-- Table: T_ProyectoDiaEquipo
CREATE TABLE "T_ProyectoDiaEquipo" (
  "PK_PDQ_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "FK_Eq_Cod" int NOT NULL,
  "FK_Em_Cod" int DEFAULT NULL,
  "PDQ_Notas" varchar(255) DEFAULT NULL,
  "PDQ_Devuelto" tinyint(1) NOT NULL DEFAULT '0',
  "PDQ_Fecha_Devolucion" datetime DEFAULT NULL,
  "PDQ_Estado_Devolucion" varchar(20) DEFAULT NULL,
  "PDQ_Notas_Devolucion" varchar(255) DEFAULT NULL,
  "PDQ_Usuario_Devolucion" int DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDQ_Cod"),
  UNIQUE KEY "uq_pd_equipo" ("FK_PD_Cod","FK_Eq_Cod"),
  KEY "ix_pdq_equipo" ("FK_Eq_Cod"),
  KEY "ix_pdq_devolucion_fecha" ("PDQ_Devuelto","PDQ_Fecha_Devolucion"),
  KEY "fk_pdq_usuario_devolucion" ("PDQ_Usuario_Devolucion"),
  KEY "ix_pdq_responsable" ("FK_Em_Cod"),
  CONSTRAINT "fk_pdq_equipo" FOREIGN KEY ("FK_Eq_Cod") REFERENCES "T_Equipo" ("PK_Eq_Cod"),
  CONSTRAINT "fk_pdq_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE,
  CONSTRAINT "fk_pdq_responsable" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "fk_pdq_usuario_devolucion" FOREIGN KEY ("PDQ_Usuario_Devolucion") REFERENCES "T_Usuario" ("PK_U_Cod")
);

-- Table: T_ProyectoDiaIncidencia
CREATE TABLE "T_ProyectoDiaIncidencia" (
  "PK_PDI_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "PDI_Tipo" varchar(50) NOT NULL,
  "PDI_Descripcion" varchar(500) NOT NULL,
  "PDI_FechaHora_Evento" datetime DEFAULT NULL,
  "FK_Em_Cod" int DEFAULT NULL,
  "FK_Em_Reemplazo_Cod" int DEFAULT NULL,
  "FK_Eq_Cod" int DEFAULT NULL,
  "FK_Eq_Reemplazo_Cod" int DEFAULT NULL,
  "FK_U_Cod" int DEFAULT NULL,
  "created_at" timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDI_Cod"),
  KEY "ix_pdi_dia" ("FK_PD_Cod"),
  KEY "ix_pdi_empleado" ("FK_Em_Cod"),
  KEY "ix_pdi_empleado_reemplazo" ("FK_Em_Reemplazo_Cod"),
  KEY "ix_pdi_equipo" ("FK_Eq_Cod"),
  KEY "ix_pdi_equipo_reemplazo" ("FK_Eq_Reemplazo_Cod"),
  KEY "ix_pdi_usuario" ("FK_U_Cod"),
  CONSTRAINT "fk_pdi_dia" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod"),
  CONSTRAINT "fk_pdi_empleado" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "fk_pdi_empleado_reemplazo" FOREIGN KEY ("FK_Em_Reemplazo_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "fk_pdi_equipo" FOREIGN KEY ("FK_Eq_Cod") REFERENCES "T_Equipo" ("PK_Eq_Cod"),
  CONSTRAINT "fk_pdi_equipo_reemplazo" FOREIGN KEY ("FK_Eq_Reemplazo_Cod") REFERENCES "T_Equipo" ("PK_Eq_Cod"),
  CONSTRAINT "fk_pdi_usuario" FOREIGN KEY ("FK_U_Cod") REFERENCES "T_Usuario" ("PK_U_Cod")
);

-- Table: T_ProyectoDiaServicio
CREATE TABLE "T_ProyectoDiaServicio" (
  "PK_PDS_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "FK_PS_Cod" int NOT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDS_Cod"),
  UNIQUE KEY "uq_pd_servicio" ("FK_PD_Cod","FK_PS_Cod"),
  KEY "ix_pd_servicio_serv" ("FK_PS_Cod"),
  CONSTRAINT "fk_pds_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE,
  CONSTRAINT "fk_pds_ps" FOREIGN KEY ("FK_PS_Cod") REFERENCES "T_PedidoServicio" ("PK_PS_Cod") ON DELETE RESTRICT
);

-- Table: T_Servicios
CREATE TABLE "T_Servicios" (
  "PK_S_Cod" int NOT NULL AUTO_INCREMENT,
  "S_Nombre" varchar(25) NOT NULL,
  PRIMARY KEY ("PK_S_Cod"),
  UNIQUE KEY "uq_servicios_nombre" ("S_Nombre")
);

-- Table: T_TipoDocumento
CREATE TABLE "T_TipoDocumento" (
  "PK_TD_Cod" int NOT NULL AUTO_INCREMENT,
  "TD_Codigo" varchar(10) NOT NULL,
  "TD_Nombre" varchar(60) NOT NULL,
  "TD_TipoDato" enum('N','A') NOT NULL,
  "TD_TamMin" tinyint unsigned NOT NULL,
  "TD_TamMax" tinyint unsigned NOT NULL,
  "TD_Activo" tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_TD_Cod"),
  UNIQUE KEY "UQ_TipoDocumento_Codigo" ("TD_Codigo")
);

-- Table: T_Tipo_Empleado
CREATE TABLE "T_Tipo_Empleado" (
  "PK_Tipo_Emp_Cod" int NOT NULL AUTO_INCREMENT,
  "TiEm_Cargo" varchar(25) DEFAULT NULL,
  "TiEm_PermiteLogin" tinyint(1) NOT NULL DEFAULT '0',
  "TiEm_OperativoCampo" tinyint(1) DEFAULT '0',
  PRIMARY KEY ("PK_Tipo_Emp_Cod")
);

-- Table: T_Tipo_Equipo
CREATE TABLE "T_Tipo_Equipo" (
  "PK_TE_Cod" int NOT NULL AUTO_INCREMENT,
  "TE_Nombre" varchar(60) NOT NULL,
  PRIMARY KEY ("PK_TE_Cod"),
  UNIQUE KEY "uq_tipo_nombre" ("TE_Nombre")
);

-- Table: T_Usuario
CREATE TABLE "T_Usuario" (
  "PK_U_Cod" int NOT NULL AUTO_INCREMENT,
  "U_Nombre" varchar(25) DEFAULT NULL,
  "U_Apellido" varchar(25) DEFAULT NULL,
  "U_Correo" varchar(255) NOT NULL,
  "U_Contrasena" varchar(255) DEFAULT NULL,
  "U_Celular" varchar(25) NOT NULL,
  "U_Numero_Documento" varchar(12) NOT NULL,
  "U_Direccion" varchar(150) DEFAULT NULL,
  "U_Fecha_Crea" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "U_Fecha_Upd" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  "FK_TD_Cod" int NOT NULL,
  PRIMARY KEY ("PK_U_Cod"),
  UNIQUE KEY "UQ_T_Usuario_Correo" ("U_Correo"),
  UNIQUE KEY "UQ_T_Usuario_Celular" ("U_Celular"),
  UNIQUE KEY "UQ_T_Usuario_NumDoc" ("U_Numero_Documento"),
  KEY "FK_T_Usuario_T_TipoDocumento" ("FK_TD_Cod"),
  CONSTRAINT "FK_T_Usuario_T_TipoDocumento" FOREIGN KEY ("FK_TD_Cod") REFERENCES "T_TipoDocumento" ("PK_TD_Cod"),
  CONSTRAINT "chk_usuario_correo_formato" CHECK (regexp_like(`U_Correo`,_utf8mb4'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$'))
);

-- Table: T_Voucher
CREATE TABLE "T_Voucher" (
  "PK_Pa_Cod" int NOT NULL AUTO_INCREMENT,
  "Pa_Monto_Depositado" int DEFAULT NULL,
  "FK_MP_Cod" int NOT NULL,
  "Pa_Imagen_Voucher" longblob,
  "FK_P_Cod" int NOT NULL,
  "FK_EV_Cod" int NOT NULL,
  "Pa_Fecha" date DEFAULT NULL,
  "Pa_Imagen_Mime" varchar(100) DEFAULT NULL,
  "Pa_Imagen_NombreOriginal" varchar(255) DEFAULT NULL,
  "Pa_Imagen_Size" int DEFAULT NULL,
  PRIMARY KEY ("PK_Pa_Cod"),
  KEY "FK_T_Voucher_T_Metodo_Pago" ("FK_MP_Cod"),
  KEY "FK_T_Voucher_T_Pedido" ("FK_P_Cod"),
  KEY "FK_T_Voucher_T_Estado_voucher" ("FK_EV_Cod"),
  CONSTRAINT "FK_T_Voucher_T_Estado_voucher" FOREIGN KEY ("FK_EV_Cod") REFERENCES "T_Estado_voucher" ("PK_EV_Cod"),
  CONSTRAINT "FK_T_Voucher_T_Metodo_Pago" FOREIGN KEY ("FK_MP_Cod") REFERENCES "T_Metodo_Pago" ("PK_MP_Cod"),
  CONSTRAINT "FK_T_Voucher_T_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

-- Procedure: sp_cliente_actualizar
DROP PROCEDURE IF EXISTS `sp_cliente_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_actualizar"(
  IN pIdCliente INT,
  IN pNombre    VARCHAR(100),
  IN pApellido  VARCHAR(100),
  IN pCorreo    VARCHAR(250),
  IN pCelular   VARCHAR(25),
  IN pDireccion VARCHAR(250),
  IN pRazonSocial VARCHAR(150)
)
BEGIN
  DECLARE vUserId INT;
  DECLARE vTdCodigo VARCHAR(10);

  SELECT c.FK_U_Cod, td.TD_Codigo INTO vUserId, vTdCodigo
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cli_Cod = pIdCliente;

  IF vUserId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe';
  END IF;

  IF vTdCodigo = 'RUC' THEN
    IF pRazonSocial IS NOT NULL AND TRIM(pRazonSocial) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  END IF;

  UPDATE T_Usuario
     SET U_Nombre   = COALESCE(NULLIF(TRIM(pNombre), ''), U_Nombre),
         U_Apellido = COALESCE(NULLIF(TRIM(pApellido), ''), U_Apellido),
         U_Correo   = COALESCE(pCorreo,    U_Correo),
         U_Celular  = COALESCE(pCelular,   U_Celular),
         U_Direccion = COALESCE(pDireccion, U_Direccion)
   WHERE PK_U_Cod = vUserId;

  IF vTdCodigo = 'RUC' THEN
    UPDATE T_Cliente
       SET Cli_RazonSocial = COALESCE(NULLIF(TRIM(pRazonSocial), ''), Cli_RazonSocial)
     WHERE PK_Cli_Cod = pIdCliente;
  END IF;

  SELECT
    c.PK_Cli_Cod                               AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.PK_U_Cod                                 AS idUsuario,
    u.U_Nombre                                 AS nombre,
    u.U_Apellido                               AS apellido,
    u.U_Correo                                 AS correo,
    u.U_Celular                                AS celular,
    u.U_Numero_Documento                       AS doc,
    u.U_Direccion                              AS direccion,
    u.FK_TD_Cod                                AS tipoDocumentoId,
    td.TD_Codigo                               AS tipoDocumentoCodigo,
    td.TD_Nombre                               AS tipoDocumentoNombre,
    c.Cli_RazonSocial                          AS razonSocial,
    c.Cli_Tipo_Cliente                         AS tipoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cli_Cod = pIdCliente;
END;;
DELIMITER ;

-- Procedure: sp_cliente_autocompletar
DROP PROCEDURE IF EXISTS `sp_cliente_autocompletar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_autocompletar"(
  IN p_query VARCHAR(120),
  IN p_limit INT
)
BEGIN
  DECLARE v_q VARCHAR(120);
  DECLARE v_q_norm VARCHAR(120);
  DECLARE v_t1 VARCHAR(60);
  DECLARE v_t2 VARCHAR(60);
  DECLARE v_limit INT DEFAULT 10;

  -- Normaliza y colapsa espacios dobles
  SET v_q = NULLIF(TRIM(p_query), '');
  IF v_q IS NOT NULL THEN
    SET v_q_norm = REPLACE(REPLACE(REPLACE(v_q, '  ', ' '), '  ', ' '), '  ', ' ');
  ELSE
    SET v_q_norm = NULL;
  END IF;

  -- token1 = primera palabra; token2 = resto (todo lo que viene despues de la 1ra palabra)
  SET v_t1 = NULL;
  SET v_t2 = NULL;
  IF v_q_norm IS NOT NULL THEN
    SET v_t1 = NULLIF(TRIM(SUBSTRING_INDEX(v_q_norm, ' ', 1)), '');
    SET v_t2 = NULLIF(TRIM(SUBSTRING(v_q_norm, LENGTH(SUBSTRING_INDEX(v_q_norm, ' ', 1)) + 2)), '');
  END IF;

  -- Limite seguro
  SET v_limit = IFNULL(p_limit, 10);
  SET v_limit = CASE
                  WHEN v_limit < 1  THEN 10
                  WHEN v_limit > 50 THEN 50
                  ELSE v_limit
                END;

  IF v_q_norm IS NULL THEN
    -- Sin texto: devolver 0 filas
    SELECT
      CAST(NULL AS SIGNED) AS idCliente,
      CAST(NULL AS CHAR)   AS codigoCliente,
      CAST(NULL AS CHAR)   AS nombre,
      CAST(NULL AS CHAR)   AS apellido,
      CAST(NULL AS CHAR)   AS correo,
      CAST(NULL AS CHAR)   AS celular,
      CAST(NULL AS CHAR)   AS doc,
      CAST(NULL AS CHAR)   AS direccion,
      CAST(NULL AS SIGNED) AS tipoDocumentoId,
      CAST(NULL AS CHAR)   AS tipoDocumentoCodigo,
      CAST(NULL AS CHAR)   AS tipoDocumentoNombre
    WHERE 1=0;

  ELSEIF v_t2 IS NOT NULL THEN
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      CASE WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial ELSE u.U_Nombre END AS nombre,
      CASE WHEN td.TD_Codigo = 'RUC' THEN NULL ELSE u.U_Apellido END AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      u.FK_TD_Cod AS tipoDocumentoId,
      td.TD_Codigo AS tipoDocumentoCodigo,
      td.TD_Nombre AS tipoDocumentoNombre,
      90 AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
    WHERE
      c.FK_ECli_Cod = 1
      AND (
        (u.U_Nombre  LIKE CONCAT(v_t1, '%') AND u.U_Apellido LIKE CONCAT(v_t2, '%'))
        OR c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%')
      )
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;

  ELSE
    SELECT
      c.PK_Cli_Cod AS idCliente,
      CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
      CASE WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial ELSE u.U_Nombre END AS nombre,
      CASE WHEN td.TD_Codigo = 'RUC' THEN NULL ELSE u.U_Apellido END AS apellido,
      u.U_Correo   AS correo,
      u.U_Celular  AS celular,
      u.U_Numero_Documento AS doc,
      u.U_Direccion AS direccion,
      u.FK_TD_Cod AS tipoDocumentoId,
      td.TD_Codigo AS tipoDocumentoCodigo,
      td.TD_Nombre AS tipoDocumentoNombre,
      (CASE
         WHEN u.U_Numero_Documento = v_q_norm OR u.U_Correo = v_q_norm OR u.U_Celular = v_q_norm THEN 100
         WHEN c.Cli_RazonSocial = v_q_norm THEN 95
         WHEN c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%') THEN 80
         WHEN u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR u.U_Celular LIKE CONCAT(v_t1, '%') THEN 70
         WHEN u.U_Nombre LIKE CONCAT(v_t1, '%') OR u.U_Apellido LIKE CONCAT(v_t1, '%') THEN 55
         ELSE 0
       END) AS score
    FROM T_Cliente c
    JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
    JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
    WHERE
      c.FK_ECli_Cod = 1
      AND (
        u.U_Numero_Documento = v_q_norm OR
        u.U_Correo = v_q_norm OR
        u.U_Celular = v_q_norm OR
        c.Cli_RazonSocial = v_q_norm OR
        c.Cli_RazonSocial LIKE CONCAT(v_q_norm, '%') OR
        u.U_Numero_Documento LIKE CONCAT(v_t1, '%') OR
        u.U_Celular          LIKE CONCAT(v_t1, '%') OR
        u.U_Nombre           LIKE CONCAT(v_t1, '%') OR
        u.U_Apellido         LIKE CONCAT(v_t1, '%')
      )
    ORDER BY score DESC, c.PK_Cli_Cod DESC
    LIMIT v_limit;
  END IF;
END;;
DELIMITER ;

-- Procedure: sp_cliente_buscar_por_documento
DROP PROCEDURE IF EXISTS `sp_cliente_buscar_por_documento`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_buscar_por_documento"(
  IN p_doc VARCHAR(50)  -- número de documento (DNI/RUC)
)
BEGIN
  /*
    Devuelve datos de usuario + (si existe) su fila en T_Cliente enlazada por FK_U_Cod.
    - Si p_doc es NULL devuelve todos (útil para pruebas).
    - Si p_doc no es NULL filtra por U_Numero_Document.
  */

  SELECT
      u.PK_U_Cod               AS idUsuario,
      u.U_Nombre               AS nombre,
      u.U_Apellido             AS apellido,
      u.U_Correo               AS correo,
      u.U_Celular              AS celular,
      u.U_Numero_Documento      AS documento,
      u.U_Direccion            AS direccion,
      c.PK_Cli_Cod             AS idCliente   -- <<< CAMBIA AQUÍ si tu PK se llama distinto
  FROM T_Usuario u
  LEFT JOIN T_Cliente c
         ON c.FK_U_Cod = u.PK_U_Cod
  WHERE (p_doc IS NULL OR u.U_Numero_Documento = p_doc);
END;;
DELIMITER ;

-- Procedure: sp_cliente_crear
DROP PROCEDURE IF EXISTS `sp_cliente_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_crear"(
  IN p_nombre        VARCHAR(100),
  IN p_apellido      VARCHAR(100),
  IN p_correo        VARCHAR(120),
  IN p_numDoc        VARCHAR(32),
  IN p_tipo_doc_id   INT,
  IN p_razon_social  VARCHAR(150),
  IN p_celular       VARCHAR(32),
  IN p_direccion     VARCHAR(200),
  IN p_contrasena_hash VARCHAR(255)
)
BEGIN
  DECLARE v_user_id BIGINT;
  DECLARE v_tipo_cliente INT DEFAULT 1;
  DECLARE v_td_codigo VARCHAR(10);

  SELECT TD_Codigo INTO v_td_codigo
  FROM T_TipoDocumento
  WHERE PK_TD_Cod = p_tipo_doc_id
  LIMIT 1;

  IF v_td_codigo IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de documento invalido';
  END IF;

  IF v_td_codigo = 'RUC' THEN
    SET v_tipo_cliente = 2;
    IF p_razon_social IS NULL OR TRIM(p_razon_social) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  END IF;

  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), p_contrasena_hash, TRIM(p_celular), TRIM(p_numDoc), p_tipo_doc_id, TRIM(p_direccion));

  SET v_user_id = LAST_INSERT_ID();

  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod, Cli_RazonSocial)
  VALUES (
    v_user_id,
    v_tipo_cliente,
    1,
    CASE WHEN v_td_codigo = 'RUC' THEN TRIM(p_razon_social) ELSE NULL END
  );
END;;
DELIMITER ;

-- Procedure: sp_cliente_listar
DROP PROCEDURE IF EXISTS `sp_cliente_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_listar"()
BEGIN
  SELECT
    c.PK_Cli_Cod AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.U_Nombre  AS nombre,
    u.U_Apellido AS apellido,
    u.U_Correo  AS correo,
    u.U_Celular AS celular,
    u.U_Numero_Documento AS doc,
    u.U_Direccion AS direccion,
    u.FK_TD_Cod AS tipoDocumentoId,
    td.TD_Codigo AS tipoDocumentoCodigo,
    td.TD_Nombre AS tipoDocumentoNombre,
    c.Cli_RazonSocial AS razonSocial,
    c.Cli_Tipo_Cliente AS tipoCliente,
    ec.PK_ECli_Cod AS idEstadoCliente,
    ec.ECli_Nombre AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u ON u.PK_U_Cod = c.FK_U_Cod
  JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  ORDER BY c.PK_Cli_Cod;
END;;
DELIMITER ;

-- Procedure: sp_cliente_obtener
DROP PROCEDURE IF EXISTS `sp_cliente_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cliente_obtener"(IN pId INT)
BEGIN
  SELECT
    c.PK_Cli_Cod                               AS idCliente,
    CONCAT('CLI-', LPAD(c.PK_Cli_Cod, 6, '0')) AS codigoCliente,
    u.PK_U_Cod                                 AS idUsuario,
    u.U_Nombre                                 AS nombre,
    u.U_Apellido                               AS apellido,
    u.U_Correo                                 AS correo,
    u.U_Celular                                AS celular,
    u.U_Numero_Documento                       AS doc,
    u.U_Direccion                              AS direccion,
    u.FK_TD_Cod                                AS tipoDocumentoId,
    td.TD_Codigo                               AS tipoDocumentoCodigo,
    td.TD_Nombre                               AS tipoDocumentoNombre,
    c.Cli_Tipo_Cliente                         AS tipoCliente,
    c.Cli_RazonSocial                          AS razonSocial,
    ec.PK_ECli_Cod                             AS idEstadoCliente,
    ec.ECli_Nombre                             AS estadoCliente
  FROM T_Cliente c
  JOIN T_Usuario u         ON u.PK_U_Cod     = c.FK_U_Cod
  JOIN T_TipoDocumento td  ON td.PK_TD_Cod   = u.FK_TD_Cod
  JOIN T_Estado_Cliente ec ON ec.PK_ECli_Cod = c.FK_ECli_Cod
  WHERE c.PK_Cli_Cod = pId;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_admin_actualizar
DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_admin_actualizar"(
  IN p_cot_id          INT,
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_dias            SMALLINT,
  IN p_viaticos_monto  DECIMAL(10,2),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),       -- 'Borrador' | 'Enviada' | ...
  IN p_items_json      JSON,              -- array de items
  IN p_eventos_json    JSON               -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }
)
BEGIN
  DECLARE v_estado_id INT DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Validacion existencia
  IF (SELECT COUNT(*) FROM defaultdb.T_Cotizacion WHERE PK_Cot_Cod = p_cot_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='La cotizacion no existe';
  END IF;

  IF p_estado IS NOT NULL THEN
    SELECT PK_ECot_Cod INTO v_estado_id
    FROM defaultdb.T_Estado_Cotizacion
    WHERE ECot_Nombre = p_estado
    LIMIT 1;

    IF v_estado_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Estado de cotizacion invalido';
    END IF;
  END IF;

  -- Update parcial de cabecera
  UPDATE defaultdb.T_Cotizacion
  SET Cot_TipoEvento     = COALESCE(p_tipo_evento,    Cot_TipoEvento),
      Cot_IdTipoEvento   = COALESCE(p_id_tipo_evento, Cot_IdTipoEvento),
      Cot_FechaEvento    = COALESCE(p_fecha_evento,   Cot_FechaEvento),
      Cot_Lugar          = COALESCE(p_lugar,          Cot_Lugar),
      Cot_HorasEst       = COALESCE(p_horas_est,      Cot_HorasEst),
      Cot_Dias           = COALESCE(p_dias,           Cot_Dias),
      Cot_ViaticosMonto  = COALESCE(p_viaticos_monto, Cot_ViaticosMonto),
      Cot_Mensaje        = COALESCE(p_mensaje,        Cot_Mensaje),
      FK_ECot_Cod        = COALESCE(v_estado_id,      FK_ECot_Cod)
  WHERE PK_Cot_Cod = p_cot_id;

  -- Reemplazo completo de items si se envia JSON
  IF p_items_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionServicioFecha
    WHERE FK_Cot_Cod = p_cot_id;

    DELETE FROM defaultdb.T_CotizacionServicio
    WHERE FK_Cot_Cod = p_cot_id;

    INSERT INTO defaultdb.T_CotizacionServicio(
      FK_Cot_Cod,
      FK_ExS_Cod,
      CS_EventoId,
      CS_ServicioId,
      CS_Nombre,
      CS_Descripcion,
      CS_Moneda,
      CS_PrecioUnit,
      CS_Cantidad,
      CS_Descuento,
      CS_Recargo,
      CS_Notas,
      CS_Horas,
      CS_Staff,
      CS_FotosImpresas,
      CS_TrailerMin,
      CS_FilmMin
    )
    SELECT
      p_cot_id,
      j.id_evento_servicio,
      j.evento_id,
      j.servicio_id,
      j.nombre,
      j.descripcion,
      COALESCE(j.moneda, 'USD'),
      j.precio_unit,
      COALESCE(j.cantidad, 1),
      COALESCE(j.descuento, 0),
      COALESCE(j.recargo, 0),
      j.notas,
      j.horas,
      j.personal,
      j.fotos_impresas,
      j.trailer_min,
      j.film_min
    FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS (
      id_evento_servicio  INT           PATH '$.idEventoServicio'  NULL ON ERROR,
      evento_id           INT           PATH '$.eventoId'          NULL ON ERROR,
      servicio_id         INT           PATH '$.servicioId'        NULL ON ERROR,
      nombre              VARCHAR(120)  PATH '$.nombre',
      descripcion         VARCHAR(1000) PATH '$.descripcion'       NULL ON ERROR,
      moneda              CHAR(3)       PATH '$.moneda'            NULL ON ERROR,
      precio_unit         DECIMAL(10,2) PATH '$.precioUnit',
      cantidad            DECIMAL(10,2) PATH '$.cantidad'          NULL ON ERROR,
      descuento           DECIMAL(10,2) PATH '$.descuento'         NULL ON ERROR,
      recargo             DECIMAL(10,2) PATH '$.recargo'           NULL ON ERROR,
      notas               VARCHAR(150)  PATH '$.notas'             NULL ON ERROR,
      horas               DECIMAL(4,1)  PATH '$.horas'             NULL ON ERROR,
      personal            SMALLINT      PATH '$.personal'          NULL ON ERROR,
      fotos_impresas      INT           PATH '$.fotosImpresas'     NULL ON ERROR,
      trailer_min         INT           PATH '$.trailerMin'        NULL ON ERROR,
      film_min            INT           PATH '$.filmMin'           NULL ON ERROR
    )) AS j;
  END IF;

  -- Reemplazo completo de eventos si se envia JSON
  IF p_eventos_json IS NOT NULL THEN
    DELETE FROM defaultdb.T_CotizacionEvento
    WHERE FK_Cot_Cod = p_cot_id;

    INSERT INTO defaultdb.T_CotizacionEvento(
      FK_Cot_Cod, CotE_Fecha, CotE_Hora,
      CotE_Ubicacion, CotE_Direccion, CotE_Notas
    )
    SELECT
      p_cot_id,
      evt.fecha,
      evt.hora,
      NULLIF(TRIM(evt.ubicacion), ''),
      NULLIF(TRIM(evt.direccion), ''),
      NULLIF(TRIM(evt.notas), '')
    FROM JSON_TABLE(p_eventos_json, '$[*]' COLUMNS (
      fecha      DATE          PATH '$.fecha',
      hora       TIME          PATH '$.hora'        NULL ON ERROR,
      ubicacion  VARCHAR(100)  PATH '$.ubicacion'   NULL ON ERROR,
      direccion  VARCHAR(150)  PATH '$.direccion'   NULL ON ERROR,
      notas      VARCHAR(255)  PATH '$.notas'       NULL ON ERROR
    )) AS evt
    WHERE evt.fecha IS NOT NULL;
  END IF;

  COMMIT;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_admin_crear_v3
DROP PROCEDURE IF EXISTS `sp_cotizacion_admin_crear_v3`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_admin_crear_v3"(
  IN p_cliente_id      INT,            -- si viene (>0), NO se crea lead
  IN p_lead_nombre     VARCHAR(80),    -- usados SOLO si no viene cliente
  IN p_lead_celular    VARCHAR(30),
  IN p_lead_origen     VARCHAR(40),
  IN p_tipo_evento     VARCHAR(40),
  IN p_id_tipo_evento  INT,
  IN p_fecha_evento    DATE,
  IN p_lugar           VARCHAR(150),
  IN p_horas_est       DECIMAL(4,1),
  IN p_dias            SMALLINT,
  IN p_viaticos_monto  DECIMAL(10,2),
  IN p_mensaje         VARCHAR(500),
  IN p_estado          VARCHAR(20),    -- 'Borrador' | 'Enviada' (opcional)
  IN p_fecha_crea      DATETIME,
  IN p_items_json      JSON,           -- array de items
  IN p_eventos_json    JSON            -- array de eventos { fecha, hora?, ubicacion?, direccion?, notas? }
)
BEGIN
  DECLARE v_lead_id INT DEFAULT NULL;
  DECLARE v_cli_id  INT DEFAULT NULL;
  DECLARE v_cli_estado INT DEFAULT NULL;
  DECLARE v_cot_id  INT DEFAULT NULL;
  DECLARE v_estado_nombre VARCHAR(20);
  DECLARE v_estado_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  /* 1) Origen: CLIENTE (preferente) o crear LEAD */
  IF p_cliente_id IS NOT NULL AND p_cliente_id > 0 THEN
    SELECT PK_Cli_Cod, FK_ECli_Cod INTO v_cli_id, v_cli_estado
    FROM defaultdb.T_Cliente
    WHERE PK_Cli_Cod = p_cliente_id
    LIMIT 1;

    IF v_cli_id IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Cliente no existe';
    END IF;
  ELSE
    IF p_lead_nombre IS NULL OR TRIM(p_lead_nombre) = '' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Se requiere nombre para crear el lead';
    END IF;

    INSERT INTO defaultdb.T_Lead (Lead_Nombre, Lead_Celular, Lead_Origen)
    VALUES (TRIM(p_lead_nombre), TRIM(p_lead_celular), TRIM(p_lead_origen));

    SET v_lead_id = LAST_INSERT_ID();
  END IF;

  /* 2) Estado: usa el enviado o default Borrador */
  SET v_estado_nombre = COALESCE(NULLIF(TRIM(p_estado), ''), 'Borrador');
  SELECT PK_ECot_Cod INTO v_estado_id
  FROM defaultdb.T_Estado_Cotizacion
  WHERE ECot_Nombre = v_estado_nombre
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Estado de cotizacion invalido';
  END IF;

  /* 3) Insert cabecera */
  INSERT INTO defaultdb.T_Cotizacion(
    FK_Lead_Cod,
    FK_Cli_Cod,
    Cot_TipoEvento,
    Cot_IdTipoEvento,
    Cot_FechaEvento,
    Cot_Lugar,
    Cot_HorasEst,
    Cot_Dias,
    Cot_ViaticosMonto,
    Cot_Mensaje,
    Cot_Fecha_Crea,
    FK_ECot_Cod
  )
  VALUES (
    v_lead_id,
    v_cli_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_dias,
    COALESCE(p_viaticos_monto, 0),
    p_mensaje,
    COALESCE(p_fecha_crea, NOW()),
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  /* 4) Items */
  IF p_items_json IS NOT NULL THEN
    INSERT INTO defaultdb.T_CotizacionServicio(
      FK_Cot_Cod,
      FK_ExS_Cod,
      CS_EventoId,
      CS_ServicioId,
      CS_Nombre,
      CS_Descripcion,
      CS_Moneda,
      CS_PrecioUnit,
      CS_Cantidad,
      CS_Descuento,
      CS_Recargo,
      CS_Notas,
      CS_Horas,
      CS_Staff,
      CS_FotosImpresas,
      CS_TrailerMin,
      CS_FilmMin
    )
    SELECT
      v_cot_id,
      j.id_evento_servicio,
      j.evento_id,
      j.servicio_id,
      j.nombre,
      j.descripcion,
      COALESCE(j.moneda, 'USD'),
      j.precio_unit,
      COALESCE(j.cantidad, 1),
      COALESCE(j.descuento, 0),
      COALESCE(j.recargo, 0),
      j.notas,
      j.horas,
      j.personal,
      j.fotos_impresas,
      j.trailer_min,
      j.film_min
    FROM JSON_TABLE(p_items_json, '$[*]' COLUMNS (
      id_evento_servicio  INT           PATH '$.idEventoServicio'  NULL ON ERROR,
      evento_id           INT           PATH '$.eventoId'          NULL ON ERROR,
      servicio_id         INT           PATH '$.servicioId'        NULL ON ERROR,
      nombre              VARCHAR(120)  PATH '$.nombre',
      descripcion         VARCHAR(1000) PATH '$.descripcion'       NULL ON ERROR,
      moneda              CHAR(3)       PATH '$.moneda'            NULL ON ERROR,
      precio_unit         DECIMAL(10,2) PATH '$.precioUnit',
      cantidad            DECIMAL(10,2) PATH '$.cantidad'          NULL ON ERROR,
      descuento           DECIMAL(10,2) PATH '$.descuento'         NULL ON ERROR,
      recargo             DECIMAL(10,2) PATH '$.recargo'           NULL ON ERROR,
      notas               VARCHAR(150)  PATH '$.notas'             NULL ON ERROR,
      horas               DECIMAL(4,1)  PATH '$.horas'             NULL ON ERROR,
      personal            SMALLINT      PATH '$.personal'          NULL ON ERROR,
      fotos_impresas      INT           PATH '$.fotosImpresas'     NULL ON ERROR,
      trailer_min         INT           PATH '$.trailerMin'        NULL ON ERROR,
      film_min            INT           PATH '$.filmMin'           NULL ON ERROR
    )) AS j;
  END IF;

  /* 5) Eventos */
  IF p_eventos_json IS NOT NULL THEN
    INSERT INTO defaultdb.T_CotizacionEvento(
      FK_Cot_Cod, CotE_Fecha, CotE_Hora,
      CotE_Ubicacion, CotE_Direccion, CotE_Notas
    )
    SELECT
      v_cot_id,
      evt.fecha,
      evt.hora,
      NULLIF(TRIM(evt.ubicacion), ''),
      NULLIF(TRIM(evt.direccion), ''),
      NULLIF(TRIM(evt.notas), '')
    FROM JSON_TABLE(p_eventos_json, '$[*]' COLUMNS (
      fecha      DATE          PATH '$.fecha',
      hora       TIME          PATH '$.hora'        NULL ON ERROR,
      ubicacion  VARCHAR(100)  PATH '$.ubicacion'   NULL ON ERROR,
      direccion  VARCHAR(150)  PATH '$.direccion'   NULL ON ERROR,
      notas      VARCHAR(255)  PATH '$.notas'       NULL ON ERROR
    )) AS evt
    WHERE evt.fecha IS NOT NULL;
  END IF;

  COMMIT;

  /* 6) Salida */
  SELECT
    v_cot_id  AS idCotizacion,
    v_cli_id  AS clienteId,
    v_lead_id AS leadId,
    CASE WHEN v_cli_id IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_convertir_a_pedido
DROP PROCEDURE IF EXISTS `sp_cotizacion_convertir_a_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_convertir_a_pedido"(
  IN  p_cot_id        INT,
  IN  p_empleado_id   INT,
  IN  p_nombre_pedido VARCHAR(225),
  IN  p_fecha_hoy     DATE,
  OUT o_pedido_id     INT
)
BEGIN
  DECLARE v_fk_cli      INT;
  DECLARE v_tipo_evento VARCHAR(40);
  DECLARE v_fecha_ev    DATE;
  DECLARE v_lugar       VARCHAR(150);
  DECLARE v_estado      VARCHAR(20);
  DECLARE v_nombre      VARCHAR(225);
  DECLARE v_fecha_ref   DATE;
  DECLARE v_id_tipo_evento INT;
  DECLARE v_dias        SMALLINT;
  DECLARE v_viaticos_monto DECIMAL(10,2);
  DECLARE v_horas_est   DECIMAL(4,1);
  DECLARE v_mensaje     VARCHAR(500);

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  SET v_fecha_ref = COALESCE(p_fecha_hoy, CURDATE());

  SELECT c.FK_Cli_Cod, c.Cot_TipoEvento, c.Cot_FechaEvento, c.Cot_Lugar,
         c.Cot_IdTipoEvento, c.Cot_Dias, c.Cot_ViaticosMonto, c.Cot_HorasEst, c.Cot_Mensaje, ec.ECot_Nombre
    INTO v_fk_cli,     v_tipo_evento,   v_fecha_ev,        v_lugar,
         v_id_tipo_evento, v_dias, v_viaticos_monto, v_horas_est, v_mensaje, v_estado
  FROM T_Cotizacion c
  JOIN T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cotizacion no encontrada';
  END IF;

  IF v_estado <> 'Aceptada' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solo se pueden migrar cotizaciones en estado Aceptada';
  END IF;

  IF v_fk_cli IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotizacion no tiene cliente ni lead asociado';
  END IF;

  SET v_nombre = COALESCE(
    p_nombre_pedido,
    CONCAT(
      COALESCE(v_tipo_evento,'Evento'),
      ' - ', DATE_FORMAT(COALESCE(v_fecha_ev, v_fecha_ref), '%d-%m-%Y'),
      COALESCE(CONCAT(' - ', v_lugar), '')
    )
  );

  INSERT INTO T_Pedido
    (FK_EP_Cod, FK_Cot_Cod, FK_Cli_Cod, FK_ESP_Cod, P_Fecha_Creacion, P_Observaciones,
     FK_Em_Cod, P_Nombre_Pedido, P_FechaEvento, P_Lugar, P_IdTipoEvento, P_Dias, P_ViaticosMonto, P_HorasEst, P_Mensaje)
  VALUES
    (1, p_cot_id, v_fk_cli, 1, v_fecha_ref, CONCAT('Origen: Cotizacion #', p_cot_id),
     p_empleado_id, v_nombre, v_fecha_ev, v_lugar, v_id_tipo_evento, v_dias, COALESCE(v_viaticos_monto, 0), v_horas_est, v_mensaje);

  SET o_pedido_id = LAST_INSERT_ID();

  INSERT INTO T_PedidoServicio
    (FK_P_Cod, FK_ExS_Cod, FK_PE_Cod, PS_EventoId, PS_ServicioId,
     PS_Nombre, PS_Descripcion, PS_Moneda, PS_PrecioUnit, PS_Cantidad, PS_Descuento, PS_Recargo, PS_Notas,
     PS_Horas, PS_Staff, PS_FotosImpresas, PS_TrailerMin, PS_FilmMin)
  SELECT
    o_pedido_id,
    cs.FK_ExS_Cod,
    NULL,
    cs.CS_EventoId,
    cs.CS_ServicioId,
    cs.CS_Nombre,
    cs.CS_Descripcion,
    cs.CS_Moneda,
    cs.CS_PrecioUnit,
    cs.CS_Cantidad,
    cs.CS_Descuento,
    cs.CS_Recargo,
    cs.CS_Notas,
    cs.CS_Horas,
    cs.CS_Staff,
    cs.CS_FotosImpresas,
    cs.CS_TrailerMin,
    cs.CS_FilmMin
  FROM T_CotizacionServicio cs
  WHERE cs.FK_Cot_Cod = p_cot_id
  ORDER BY cs.PK_CotServ_Cod;

  INSERT INTO T_PedidoEvento
    (FK_P_Cod, PE_Fecha, PE_Hora, PE_Ubicacion, PE_Direccion, PE_Notas)
  SELECT
    o_pedido_id,
    ce.CotE_Fecha,
    ce.CotE_Hora,
    ce.CotE_Ubicacion,
    ce.CotE_Direccion,
    ce.CotE_Notas
  FROM T_CotizacionEvento ce
  WHERE ce.FK_Cot_Cod = p_cot_id;

  -- Copiar serviciosFechas (mapeo por orden de insercion)
  INSERT INTO T_PedidoServicioFecha (FK_P_Cod, FK_PedServ_Cod, PSF_Fecha)
  SELECT
    o_pedido_id,
    ps.PK_PS_Cod,
    csf.CSF_Fecha
  FROM (
    SELECT PK_PS_Cod, ROW_NUMBER() OVER (ORDER BY PK_PS_Cod) AS rn
    FROM T_PedidoServicio
    WHERE FK_P_Cod = o_pedido_id
  ) ps
  JOIN (
    SELECT PK_CotServ_Cod, ROW_NUMBER() OVER (ORDER BY PK_CotServ_Cod) AS rn
    FROM T_CotizacionServicio
    WHERE FK_Cot_Cod = p_cot_id
  ) cs ON cs.rn = ps.rn
  JOIN T_CotizacionServicioFecha csf ON csf.FK_CotServ_Cod = cs.PK_CotServ_Cod;

  COMMIT;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_estado_actualizar
DROP PROCEDURE IF EXISTS `sp_cotizacion_estado_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_estado_actualizar"(
  IN p_cot_id           INT,
  IN p_estado_nuevo     VARCHAR(20),   -- Borrador|Enviada|Aceptada|Rechazada
  IN p_estado_esperado  VARCHAR(20)    -- NULL = sin concurrencia optimista
)
BEGIN
  DECLARE v_estado_actual VARCHAR(20);
  DECLARE v_estado_nuevo_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- leer + lock
  SELECT ec.ECot_Nombre INTO v_estado_actual
  FROM defaultdb.T_Cotizacion c
  JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  WHERE c.PK_Cot_Cod = p_cot_id
  FOR UPDATE;

  IF v_estado_actual IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Quote not found';
  END IF;

  -- concurrencia optimista (opcional)
  IF p_estado_esperado IS NOT NULL AND p_estado_esperado <> v_estado_actual THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Version conflict';
  END IF;

  -- reglas de transicion (basicas, ajusta a tu flujo)
  IF v_estado_actual = 'Borrador' AND p_estado_nuevo NOT IN ('Enviada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid transition from Borrador';
  END IF;

  IF v_estado_actual = 'Enviada' AND p_estado_nuevo NOT IN ('Aceptada','Rechazada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid transition from Enviada';
  END IF;

  IF v_estado_actual IN ('Aceptada','Rechazada') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Final state cannot transition';
  END IF;

  SELECT PK_ECot_Cod INTO v_estado_nuevo_id
  FROM defaultdb.T_Estado_Cotizacion
  WHERE ECot_Nombre = p_estado_nuevo
  LIMIT 1;

  IF v_estado_nuevo_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de cotizacion invalido';
  END IF;

  -- update
  UPDATE defaultdb.T_Cotizacion
  SET FK_ECot_Cod = v_estado_nuevo_id
  WHERE PK_Cot_Cod = p_cot_id;

  -- devolver JSON de detalle (incluye viaticos)
  SELECT JSON_OBJECT(
    'id',              c.PK_Cot_Cod,
    'estado',          ec.ECot_Nombre,
    'fechaCreacion',   c.Cot_Fecha_Crea,
    'eventoId',        c.Cot_IdTipoEvento,
    'tipoEvento',      c.Cot_TipoEvento,
    'fechaEvento',     c.Cot_FechaEvento,
    'lugar',           c.Cot_Lugar,
    'horasEstimadas',  c.Cot_HorasEst,
    'mensaje',         c.Cot_Mensaje,
    'viaticosMonto',   COALESCE(c.Cot_ViaticosMonto, 0),
    'totalServicios',  COALESCE((
                        SELECT SUM(s.CS_Subtotal)
                        FROM defaultdb.T_CotizacionServicio s
                        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                      ),0),
    'total',           COALESCE((
                        SELECT SUM(s.CS_Subtotal)
                        FROM defaultdb.T_CotizacionServicio s
                        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                      ),0) + COALESCE(c.Cot_ViaticosMonto, 0),
    'contacto',
      CASE
        WHEN l.PK_Lead_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',             l.PK_Lead_Cod,
            'nombre',         l.Lead_Nombre,
            'celular',        l.Lead_Celular,
            'origen',         'LEAD',
            'fechaCreacion',  l.Lead_Fecha_Crea
          )
        WHEN cli.PK_Cli_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',             cli.PK_Cli_Cod,
            'nombre',         TRIM(CONCAT(COALESCE(u.U_Nombre,''),' ',COALESCE(u.U_Apellido,''))),
            'celular',        u.U_Celular,
            'origen',         'CLIENTE',
            'fechaCreacion',  c.Cot_Fecha_Crea
          )
        ELSE
          JSON_OBJECT(
            'id',             NULL,
            'nombre',         NULL,
            'celular',        NULL,
            'origen',         NULL,
            'fechaCreacion',  NULL
          )
      END
  ) AS detalle_json
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli  ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u    ON u.PK_U_Cod = cli.FK_U_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

  COMMIT;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_listar_general
DROP PROCEDURE IF EXISTS `sp_cotizacion_listar_general`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_listar_general"()
BEGIN
  SELECT
      c.PK_Cot_Cod        AS idCotizacion,

      -- Origen
      c.FK_Lead_Cod       AS idLead,
      c.FK_Cli_Cod        AS idCliente,
      CASE WHEN c.FK_Cli_Cod IS NOT NULL THEN 'CLIENTE' ELSE 'LEAD' END AS origen,

      -- Si CLIENTE y es RUC devuelve razon social; si es LEAD usa Lead_Nombre
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN
          CASE
            WHEN td.TD_Codigo = 'RUC' THEN cli.Cli_RazonSocial
            ELSE TRIM(CONCAT_WS(' ',
              NULLIF(u.U_Nombre, ''),
              NULLIF(u.U_Apellido, '')
            ))
          END
        ELSE
          l.Lead_Nombre
      END AS contactoNombre,

      -- Celular segun origen
      CASE
        WHEN c.FK_Cli_Cod IS NOT NULL THEN u.U_Celular
        ELSE l.Lead_Celular
      END AS contactoCelular,

      -- Cabecera
      c.Cot_TipoEvento     AS tipoEvento,
      c.Cot_IdTipoEvento   AS idTipoEvento,
      c.Cot_FechaEvento    AS fechaEvento,
      c.Cot_Lugar          AS lugar,
      c.Cot_HorasEst       AS horasEstimadas,
      c.Cot_Dias           AS dias,
      c.Cot_ViaticosMonto  AS viaticosMonto,
      c.Cot_Mensaje        AS mensaje,
      ec.ECot_Nombre       AS estado,
      c.Cot_Fecha_Crea     AS fechaCreacion,

      -- Total
      COALESCE((
        SELECT SUM(
          COALESCE(cs.CS_Subtotal,
                   COALESCE(cs.CS_PrecioUnit,0) * COALESCE(cs.CS_Cantidad,1)
                   - COALESCE(cs.CS_Descuento,0) + COALESCE(cs.CS_Recargo,0))
        )
        FROM defaultdb.T_CotizacionServicio cs
        WHERE cs.FK_Cot_Cod = c.PK_Cot_Cod
      ), 0) + COALESCE(c.Cot_ViaticosMonto, 0) AS total
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead    l   ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u   ON u.PK_U_Cod    = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  ORDER BY c.PK_Cot_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_cotizacion_obtener_json
DROP PROCEDURE IF EXISTS `sp_cotizacion_obtener_json`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_obtener_json"(
  IN p_cot_id INT
)
BEGIN
  IF p_cot_id IS NULL OR p_cot_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cot_id invalido';
  END IF;

  IF (SELECT COUNT(*) FROM defaultdb.T_Cotizacion WHERE PK_Cot_Cod = p_cot_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La cotizacion no existe';
  END IF;

  SELECT
    JSON_OBJECT(
      'idCotizacion', c.PK_Cot_Cod,

      'contacto',
      CASE
        WHEN l.PK_Lead_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',         l.PK_Lead_Cod,
            'nombre',     l.Lead_Nombre,
            'celular',    l.Lead_Celular,
            'origen',     'LEAD',
            'fechaCrea',  l.Lead_Fecha_Crea
          )

        WHEN cli.PK_Cli_Cod IS NOT NULL THEN
          JSON_OBJECT(
            'id',              cli.PK_Cli_Cod,

            'nombreContacto',  CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            'nombre',          CONCAT(
                                COALESCE(u.U_Nombre,''),
                                CASE
                                  WHEN u.U_Nombre IS NOT NULL AND u.U_Apellido IS NOT NULL THEN ' '
                                  ELSE ''
                                END,
                                COALESCE(u.U_Apellido,'')
                              ),

            'razonSocial',     cli.Cli_RazonSocial,

            'tipoDocumento',   td.TD_Codigo,
            'numeroDocumento', u.U_Numero_Documento,

            'celular',         u.U_Celular,
            'origen',          'CLIENTE',
            'fechaCrea',       c.Cot_Fecha_Crea
          )

        ELSE
          JSON_OBJECT(
            'id',         NULL,
            'nombre',     NULL,
            'celular',    NULL,
            'origen',     NULL,
            'fechaCrea',  NULL
          )
      END,

      'cotizacion', JSON_OBJECT(
        'tipoEvento',     c.Cot_TipoEvento,
        'idTipoEvento',   c.Cot_IdTipoEvento,
        'fechaEvento',    c.Cot_FechaEvento,
        'lugar',          c.Cot_Lugar,
        'horasEstimadas', c.Cot_HorasEst,
        'dias',           c.Cot_Dias,
        'viaticosMonto',  c.Cot_ViaticosMonto,
        'mensaje',        c.Cot_Mensaje,
        'estado',         ec.ECot_Nombre,
        'fechaCreacion',  c.Cot_Fecha_Crea,

        'total',          COALESCE((
                           SELECT SUM(s.CS_Subtotal)
                           FROM defaultdb.T_CotizacionServicio s
                           WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
                         ),0) + COALESCE(c.Cot_ViaticosMonto, 0)
      ),

      'items', COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'idCotizacionServicio', s.PK_CotServ_Cod,
            'idEventoServicio',     s.FK_ExS_Cod,
            'eventoId',             s.CS_EventoId,
            'servicioId',           s.CS_ServicioId,
            'nombre',               s.CS_Nombre,
            'descripcion',          s.CS_Descripcion,
            'moneda',               s.CS_Moneda,
            'precioUnit',           s.CS_PrecioUnit,
            'cantidad',             s.CS_Cantidad,
            'descuento',            s.CS_Descuento,
            'recargo',              s.CS_Recargo,
            'subtotal',             s.CS_Subtotal,
            'notas',                s.CS_Notas,
            'horas',                s.CS_Horas,
            'personal',             s.CS_Staff,
            'fotosImpresas',        s.CS_FotosImpresas,
            'trailerMin',           s.CS_TrailerMin,
            'filmMin',              s.CS_FilmMin,
            'eventoServicio',
            CASE
              WHEN s.FK_ExS_Cod IS NULL THEN NULL
              ELSE (
                SELECT JSON_OBJECT(
                  'id',               exs.PK_ExS_Cod,
                  'servicioId',       exs.PK_S_Cod,
                  'servicioNombre',   srv.S_Nombre,
                  'eventoId',         exs.PK_E_Cod,
                  'eventoNombre',     evt.E_Nombre,
                  'categoriaId',      exs.FK_ESC_Cod,
                  'categoriaNombre',  cat.ESC_Nombre,
                  'categoriaTipo',    cat.ESC_Tipo,
                  'titulo',           exs.ExS_Titulo,
                  'esAddon',          exs.ExS_EsAddon,
                  'precio',           exs.ExS_Precio,
                  'descripcion',      exs.ExS_Descripcion,
                  'horas',            exs.ExS_Horas,
                  'fotosImpresas',    exs.ExS_FotosImpresas,
                  'trailerMin',       exs.ExS_TrailerMin,
                  'filmMin',          exs.ExS_FilmMin,

                  'staff', COALESCE((
                    SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'rol',      st.Staff_Rol,
                        'cantidad', st.Staff_Cantidad
                      )
                    )
                    FROM defaultdb.T_EventoServicioStaff st
                    WHERE st.FK_ExS_Cod = exs.PK_ExS_Cod
                  ), JSON_ARRAY()),

                  'equipos', COALESCE((
                    SELECT JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'tipoEquipoId',  eq.FK_TE_Cod,
                        'tipoEquipo',    te.TE_Nombre,
                        'cantidad',      eq.Cantidad,
                        'notas',         eq.Notas
                      )
                    )
                    FROM defaultdb.T_EventoServicioEquipo eq
                    JOIN defaultdb.T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
                    WHERE eq.FK_ExS_Cod = exs.PK_ExS_Cod
                  ), JSON_ARRAY())
                )
                FROM defaultdb.T_EventoServicio exs
                LEFT JOIN defaultdb.T_Servicios srv ON srv.PK_S_Cod = exs.PK_S_Cod
                LEFT JOIN defaultdb.T_Eventos   evt ON evt.PK_E_Cod = exs.PK_E_Cod
                LEFT JOIN defaultdb.T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = exs.FK_ESC_Cod
                WHERE exs.PK_ExS_Cod = s.FK_ExS_Cod
                LIMIT 1
              )
            END
          )
        )
        FROM defaultdb.T_CotizacionServicio s
        WHERE s.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY()),

      'eventos', COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id',         e.PK_CotE_Cod,
            'fecha',      e.CotE_Fecha,
            'hora',       e.CotE_Hora,
            'ubicacion',  e.CotE_Ubicacion,
            'direccion',  e.CotE_Direccion,
            'notas',      e.CotE_Notas
          )
        )
        FROM defaultdb.T_CotizacionEvento e
        WHERE e.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY()),

      'serviciosFechas', COALESCE((
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'idCotizacionServicio', sf.FK_CotServ_Cod,
            'fecha', sf.CSF_Fecha
          )
        )
        FROM defaultdb.T_CotizacionServicioFecha sf
        WHERE sf.FK_Cot_Cod = c.PK_Cot_Cod
      ), JSON_ARRAY())
    ) AS cotizacion_json
  FROM defaultdb.T_Cotizacion c
  LEFT JOIN defaultdb.T_Estado_Cotizacion ec ON ec.PK_ECot_Cod = c.FK_ECot_Cod
  LEFT JOIN defaultdb.T_Lead l ON l.PK_Lead_Cod = c.FK_Lead_Cod
  LEFT JOIN defaultdb.T_Cliente cli ON cli.PK_Cli_Cod = c.FK_Cli_Cod
  LEFT JOIN defaultdb.T_Usuario u ON u.PK_U_Cod = cli.FK_U_Cod
  LEFT JOIN defaultdb.T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  WHERE c.PK_Cot_Cod = p_cot_id;

END;;
DELIMITER ;

-- Procedure: sp_cotizacion_publica_crear
DROP PROCEDURE IF EXISTS `sp_cotizacion_publica_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_cotizacion_publica_crear"(
  IN p_lead_nombre    VARCHAR(80),
  IN p_lead_celular   VARCHAR(30),
  IN p_lead_origen    VARCHAR(40),
  IN p_tipo_evento    VARCHAR(40),
  IN p_id_tipo_evento INT,
  IN p_fecha_evento   DATE,
  IN p_lugar          VARCHAR(150),
  IN p_horas_est      DECIMAL(4,1),
  IN p_dias           SMALLINT,
  IN p_viaticos_monto DECIMAL(10,2),
  IN p_mensaje        VARCHAR(500),
  IN p_fecha_crea     DATETIME
)
BEGIN
  DECLARE v_lead_id INT;
  DECLARE v_cot_id  INT;
  DECLARE v_estado_id INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN ROLLBACK; RESIGNAL; END;

  START TRANSACTION;

  -- dedup simple por celular (ajusta si luego agregas email)
  SELECT PK_Lead_Cod INTO v_lead_id
  FROM T_Lead
  WHERE p_lead_celular IS NOT NULL AND Lead_Celular = p_lead_celular
  LIMIT 1 FOR UPDATE;

  IF v_lead_id IS NULL THEN
    INSERT INTO T_Lead(Lead_Nombre, Lead_Celular, Lead_Origen)
    VALUES (p_lead_nombre, p_lead_celular, p_lead_origen);
    SET v_lead_id = LAST_INSERT_ID();
  END IF;

  SELECT PK_ECot_Cod INTO v_estado_id
  FROM T_Estado_Cotizacion
  WHERE ECot_Nombre = 'Borrador'
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de cotizacion invalido';
  END IF;

  INSERT INTO T_Cotizacion(
    FK_Lead_Cod,
    Cot_TipoEvento,
    Cot_IdTipoEvento,
    Cot_FechaEvento,
    Cot_Lugar,
    Cot_HorasEst,
    Cot_Dias,
    Cot_ViaticosMonto,
    Cot_Mensaje,
    Cot_Fecha_Crea,
    FK_ECot_Cod
  )
  VALUES (
    v_lead_id,
    p_tipo_evento,
    p_id_tipo_evento,
    p_fecha_evento,
    p_lugar,
    p_horas_est,
    p_dias,
    COALESCE(p_viaticos_monto, 0),
    p_mensaje,
    COALESCE(p_fecha_crea, NOW()),
    v_estado_id
  );

  SET v_cot_id = LAST_INSERT_ID();

  COMMIT;

  SELECT v_lead_id AS lead_id, v_cot_id AS cotizacion_id;
END;;
DELIMITER ;

-- Procedure: SP_debug_comprobante_voucher_detalle
DROP PROCEDURE IF EXISTS `SP_debug_comprobante_voucher_detalle`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "SP_debug_comprobante_voucher_detalle"(IN p_PK_Pa_Cod INT)
BEGIN
  DECLARE v_total DECIMAL(10,2) DEFAULT 0;
  DECLARE v_pedidoId INT DEFAULT NULL;

  DECLARE v_sumPedido DECIMAL(18,6) DEFAULT 0;
  DECLARE v_sumPedidoConIgv DECIMAL(18,2) DEFAULT 0;

  DECLARE v_factor DECIMAL(18,8) DEFAULT 1;      -- ratio pagado (0.60, 0.70, etc)
  DECLARE v_factor2 DECIMAL(18,8) DEFAULT 1;     -- ratio redondeado a 2 decimales (0.60 exacto)

  /* 1) Voucher + Pedido */
  SELECT v.Pa_Monto_Depositado, v.FK_P_Cod
    INTO v_total, v_pedidoId
  FROM T_Voucher v
  WHERE v.PK_Pa_Cod = p_PK_Pa_Cod
  LIMIT 1;

  IF v_pedidoId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voucher no encontrado o sin pedido asociado';
  END IF;

  /* 2) Total del pedido (SIN IGV) */
  SELECT SUM(IFNULL(ps.PS_Subtotal,0))
    INTO v_sumPedido
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = v_pedidoId;

  SET v_sumPedidoConIgv = ROUND(IFNULL(v_sumPedido,0) * 1.18, 2);

  /* 3) Factor pagado (basado en total CON IGV) */
  SET v_factor = v_total / NULLIF(v_sumPedidoConIgv, 0);
  IF v_factor > 1 THEN SET v_factor = 1; END IF;

  /* 4) Redondeo del factor para que sea “bonito” (0.60 exacto) */
  SET v_factor2 = ROUND(v_factor, 2);

  /* ===== RESULTSET 1: HEADER DEBUG ===== */
  SELECT
    p_PK_Pa_Cod AS voucherId,
    v_pedidoId  AS pedidoId,
    v_total     AS voucherMontoConIgv,
    ROUND(v_sumPedido,2) AS pedidoTotalSinIgv,
    v_sumPedidoConIgv AS pedidoTotalConIgv,
    ROUND(v_factor, 6) AS factorPagado_raw,
    v_factor2 AS factorPagado_2dec,
    ROUND(v_factor2*100, 2) AS porcentajePagadoPct;

  /* ===== RESULTSET 2: DETALLE (PRORRATEADO) =====
     - valorUnitario = unitario real * factor
     - importeTotal  = valorUnitario * cantidad
  */
  SELECT
    ps.PK_PS_Cod,
    ps.FK_P_Cod,
    IFNULL(ps.PS_Nombre,'Servicio') AS descripcion,

    CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2)) AS cantidad,
    'UNIDAD' AS unidad,

    -- unitario real sin IGV
    ROUND(IFNULL(ps.PS_Subtotal,0) / NULLIF(IFNULL(ps.PS_Cantidad,1),0), 2) AS unitarioReal_sinIgv,

    -- ✅ unitario pagado sin IGV (prorrateado)
    ROUND(
      ROUND(IFNULL(ps.PS_Subtotal,0) / NULLIF(IFNULL(ps.PS_Cantidad,1),0), 2) * v_factor2
    , 2) AS valorUnitario_sinIgv,

    0.00 AS descuento,

    -- ✅ total pagado sin IGV = valorUnitario * cantidad
    ROUND(
      ROUND(
        ROUND(IFNULL(ps.PS_Subtotal,0) / NULLIF(IFNULL(ps.PS_Cantidad,1),0), 2) * v_factor2
      , 2) * CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2))
    , 2) AS importeVentaTotal_sinIgv

  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = v_pedidoId
  ORDER BY ps.PK_PS_Cod;

END;;
DELIMITER ;

-- Procedure: sp_empleado_actualizar
DROP PROCEDURE IF EXISTS `sp_empleado_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_actualizar"(
  IN p_id       INT,          -- PK_Em_Cod
  IN p_celular  VARCHAR(32),
  IN p_correo   VARCHAR(120),
  IN p_direccion VARCHAR(200),
  IN p_estado   TINYINT       -- 1=SI (autónomo), 0=NO
)
BEGIN
  DECLARE v_user_id INT;

  -- obtener el usuario del empleado
  SELECT FK_U_Cod INTO v_user_id
  FROM T_Empleados
  WHERE PK_Em_Cod = p_id;

  IF v_user_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Empleado no existe';
  END IF;

  -- actualizar datos de contacto del usuario
  UPDATE T_Usuario
  SET U_Celular   = TRIM(p_celular),
      U_Correo    = TRIM(p_correo),
      U_Direccion = TRIM(p_direccion)
  WHERE PK_U_Cod = v_user_id;

  -- actualizar estado de autonomía del empleado (SI/NO)
  UPDATE T_Empleados
  SET Em_Autonomo = IF(p_estado=1,'SI','NO')
  WHERE PK_Em_Cod = p_id;

  -- opcional: devolver filas afectadas
  SELECT ROW_COUNT() AS rowsAffected;
END;;
DELIMITER ;

-- Procedure: sp_empleado_cargo_listar
DROP PROCEDURE IF EXISTS `sp_empleado_cargo_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_cargo_listar"()
BEGIN
  SELECT
    te.PK_Tipo_Emp_Cod AS idCargo,
    te.TiEm_Cargo     AS cargoNombre,
    te.TiEm_OperativoCampo AS esOperativoCampo
  FROM T_Tipo_Empleado te
  ORDER BY te.TiEm_Cargo;
END;;
DELIMITER ;

-- Procedure: sp_empleado_crear
DROP PROCEDURE IF EXISTS `sp_empleado_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_crear"(
  IN p_nombre     VARCHAR(100),
  IN p_apellido   VARCHAR(100),
  IN p_correo     VARCHAR(120),
  IN p_celular    VARCHAR(32),
  IN p_doc        VARCHAR(32),
  IN p_tipo_doc_id INT,
  IN p_direccion  VARCHAR(200),
  IN p_autonomo   TINYINT,
  IN p_cargo      INT
)
BEGIN
  INSERT INTO T_Usuario
    (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
    (TRIM(p_nombre), TRIM(p_apellido), TRIM(p_correo), NULL, TRIM(p_celular), TRIM(p_doc), p_tipo_doc_id, TRIM(p_direccion));

  SET @v_user_id := LAST_INSERT_ID();

  INSERT INTO T_Empleados (FK_U_Cod, Em_Autonomo, FK_Tipo_Emp_Cod)
  VALUES (@v_user_id, IF(p_autonomo=1,'SI','NO'), p_cargo);

  SELECT @v_user_id AS userId, LAST_INSERT_ID() AS empleadoId;
END;;
DELIMITER ;

-- Procedure: sp_empleado_listar
DROP PROCEDURE IF EXISTS `sp_empleado_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_listar"()
BEGIN
  SELECT
    e.PK_Em_Cod                               AS idEmpleado,
    CONCAT('EMP-', LPAD(e.PK_Em_Cod, 6, '0')) AS codigoEmpleado,
    u.PK_U_Cod                                AS idUsuario,
    u.U_Nombre                                AS nombre,
    u.U_Apellido                              AS apellido,
    u.U_Correo                                AS correo,
    u.U_Celular                               AS celular,
    u.U_Numero_Documento                      AS documento,
    u.U_Direccion                             AS direccion,
    e.Em_Autonomo                             AS autonomo,
    e.FK_Tipo_Emp_Cod                         AS idCargo,
    te.TiEm_Cargo                             AS cargo,
    te.TiEm_OperativoCampo                    AS esOperativoCampo,
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u         ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te  ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  ORDER BY e.PK_Em_Cod;
END;;
DELIMITER ;

-- Procedure: sp_empleado_obtener
DROP PROCEDURE IF EXISTS `sp_empleado_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_empleado_obtener"(IN p_id INT)
BEGIN
  SELECT
    e.PK_Em_Cod                               AS idEmpleado,
    CONCAT('EMP-', LPAD(e.PK_Em_Cod, 6, '0')) AS codigoEmpleado,
    u.PK_U_Cod                                AS idUsuario,
    u.U_Nombre                                AS nombre,
    u.U_Apellido                              AS apellido,
    u.U_Correo                                AS correo,
    u.U_Celular                               AS celular,
    u.U_Numero_Documento                      AS documento,
    u.U_Direccion                             AS direccion,
    e.Em_Autonomo                             AS autonomo,
    e.FK_Tipo_Emp_Cod                         AS idCargo,
    te.TiEm_Cargo                             AS cargo,
    te.TiEm_OperativoCampo                    AS esOperativoCampo,
    e.FK_Estado_Emp_Cod                       AS idEstado,
    ee.EsEm_Nombre                            AS estado
  FROM T_Empleados e
  JOIN T_Usuario u          ON u.PK_U_Cod = e.FK_U_Cod
  JOIN T_Tipo_Empleado te   ON te.PK_Tipo_Emp_Cod = e.FK_Tipo_Emp_Cod
  JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = e.FK_Estado_Emp_Cod
  WHERE e.PK_Em_Cod = p_id
  LIMIT 1;
END;;
DELIMITER ;

-- Procedure: sp_evento_listar
DROP PROCEDURE IF EXISTS `sp_evento_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_listar"()
BEGIN
  DECLARE v_table_name VARCHAR(64);

  -- Busca una tabla de eventos con nombre T_Eventos o T_Evento
  SELECT t.table_name
    INTO v_table_name
  FROM information_schema.tables t
  WHERE t.table_schema = DATABASE()
    AND t.table_name IN ('T_Eventos','T_Evento')
  ORDER BY FIELD(t.table_name, 'T_Eventos','T_Evento')  -- preferimos T_Eventos si existen ambas
  LIMIT 1;

  -- Si no hay tabla compatible, avisamos
  IF v_table_name IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No existe una tabla de eventos (T_Eventos o T_Evento) en este schema.';
  ELSE
    -- Selecciona todos los eventos. ORDER BY 1 = por la primera columna (normalmente el PK)
    SET @sql := CONCAT('SELECT * FROM ', v_table_name, ' ORDER BY 1 DESC');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END;;
DELIMITER ;

-- Procedure: sp_evento_servicio_actualizar
DROP PROCEDURE IF EXISTS `sp_evento_servicio_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_actualizar"(
    IN p_id             INT,            -- PK_ExS_Cod
    IN p_servicio       INT,            -- Nuevo FK servicio (nullable)
    IN p_evento         INT,            -- Nuevo FK evento   (nullable)
    IN p_categoria_id   INT,            -- Nuevo FK categoría (nullable)
    IN p_es_addon       TINYINT,        -- 1/0 para marcar complemento
    IN p_precio         DECIMAL(10,2),
    IN p_descripcion    VARCHAR(255),
    IN p_titulo         VARCHAR(255),
    IN p_horas          DECIMAL(4,1),
    IN p_fotos          INT,
    IN p_trailer        INT,
    IN p_film           INT,
    IN p_staff          JSON,           -- Reemplaza si no es NULL
    IN p_equipos        JSON            -- Reemplaza si no es NULL
)
BEGIN
    DECLARE v_servicio INT;
    DECLARE v_evento   INT;
    DECLARE v_categoria INT;
    DECLARE v_titulo   VARCHAR(120);

    IF NOT EXISTS (SELECT 1 FROM T_EventoServicio WHERE PK_ExS_Cod = p_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_SERVICIO_NO_EXISTE';
    END IF;

    SELECT PK_S_Cod, PK_E_Cod, FK_ESC_Cod INTO v_servicio, v_evento, v_categoria
      FROM T_EventoServicio
     WHERE PK_ExS_Cod = p_id
     FOR UPDATE;

    SET v_servicio = COALESCE(p_servicio, v_servicio);
    SET v_evento   = COALESCE(p_evento, v_evento);
    SET v_categoria = COALESCE(p_categoria_id, v_categoria);

    IF NOT EXISTS (SELECT 1 FROM T_Servicios WHERE PK_S_Cod = v_servicio) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SERVICIO_NO_EXISTE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM T_Eventos WHERE PK_E_Cod = v_evento) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_NO_EXISTE';
    END IF;

    IF v_categoria IS NOT NULL AND
       NOT EXISTS (
           SELECT 1
             FROM T_EventoServicioCategoria
            WHERE PK_ESC_Cod = v_categoria
              AND ESC_Activo = 1
       ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CATEGORIA_NO_EXISTE';
    END IF;

    SET v_titulo = COALESCE(NULLIF(TRIM(p_titulo), ''),
                            (SELECT ExS_Titulo FROM T_EventoServicio WHERE PK_ExS_Cod = p_id));

    UPDATE T_EventoServicio
       SET PK_S_Cod        = v_servicio,
           PK_E_Cod        = v_evento,
           FK_ESC_Cod      = v_categoria,
           ExS_EsAddon     = COALESCE(p_es_addon, ExS_EsAddon),
           ExS_Titulo      = v_titulo,
           ExS_Precio      = COALESCE(p_precio, ExS_Precio),
           ExS_Descripcion = COALESCE(NULLIF(TRIM(p_descripcion), ''), ExS_Descripcion),
           ExS_Horas       = COALESCE(p_horas, ExS_Horas),
           ExS_FotosImpresas = COALESCE(p_fotos, ExS_FotosImpresas),
           ExS_TrailerMin  = COALESCE(p_trailer, ExS_TrailerMin),
           ExS_FilmMin     = COALESCE(p_film, ExS_FilmMin)
     WHERE PK_ExS_Cod = p_id;

    IF p_staff IS NOT NULL THEN
        DELETE FROM T_EventoServicioStaff WHERE FK_ExS_Cod = p_id;
        IF JSON_VALID(p_staff) THEN
            INSERT INTO T_EventoServicioStaff (FK_ExS_Cod, Staff_Rol, Staff_Cantidad)
            SELECT p_id,
                   NULLIF(TRIM(js.rol), ''),
                   GREATEST(COALESCE(js.cantidad, 0), 0)
            FROM JSON_TABLE(
                    p_staff,
                    '$[*]' COLUMNS (
                        rol VARCHAR(40) PATH '$.rol',
                        cantidad INT PATH '$.cantidad'
                    )
                 ) js
            WHERE NULLIF(TRIM(js.rol), '') IS NOT NULL;
        END IF;
    END IF;

    IF p_equipos IS NOT NULL THEN
        DELETE FROM T_EventoServicioEquipo WHERE FK_ExS_Cod = p_id;
        IF JSON_VALID(p_equipos) THEN
            INSERT INTO T_EventoServicioEquipo (FK_ExS_Cod, FK_TE_Cod, Cantidad, Notas)
            SELECT p_id,
                   js.tipoEquipoId,
                   GREATEST(COALESCE(js.cantidad, 1), 0),
                   NULLIF(TRIM(js.notas), '')
            FROM JSON_TABLE(
                    p_equipos,
                    '$[*]' COLUMNS (
                        tipoEquipoId INT PATH '$.tipoEquipoId',
                        cantidad INT PATH '$.cantidad',
                        notas VARCHAR(150) PATH '$.notas'
                    )
                 ) js
            WHERE js.tipoEquipoId IS NOT NULL;
        END IF;
    END IF;
END;;
DELIMITER ;

-- Procedure: sp_evento_servicio_crear
DROP PROCEDURE IF EXISTS `sp_evento_servicio_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_crear"(
    IN p_servicio      INT,             -- T_Servicios.PK_S_Cod
    IN p_evento        INT,             -- T_Eventos.PK_E_Cod
    IN p_categoria_id  INT,             -- FK -> T_EventoServicioCategoria (nullable)
    IN p_es_addon      TINYINT,         -- 1 si es complemento, 0 en caso contrario
    IN p_precio        DECIMAL(10,2),   -- ExS_Precio
    IN p_descripcion   VARCHAR(255),    -- ExS_Descripcion
    IN p_titulo        VARCHAR(255),    -- ExS_Titulo (requerido, se normaliza)
    IN p_horas         DECIMAL(4,1),    -- ExS_Horas
    IN p_fotos         INT,             -- ExS_FotosImpresas
    IN p_trailer       INT,             -- ExS_TrailerMin
    IN p_film          INT,             -- ExS_FilmMin
    IN p_staff         JSON,            -- Detalle [{rol,cantidad}]
    IN p_equipos       JSON             -- Detalle [{tipoEquipoId,cantidad,notas}]
)
BEGIN
    DECLARE v_titulo VARCHAR(120);
    DECLARE v_id INT;

    -- Validaciones básicas
    IF NOT EXISTS (SELECT 1 FROM T_Eventos WHERE PK_E_Cod = p_evento) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EVENTO_NO_EXISTE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM T_Servicios WHERE PK_S_Cod = p_servicio) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'SERVICIO_NO_EXISTE';
    END IF;

    IF p_categoria_id IS NOT NULL AND
       NOT EXISTS (
           SELECT 1
             FROM T_EventoServicioCategoria
            WHERE PK_ESC_Cod = p_categoria_id
              AND ESC_Activo = 1
       ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'CATEGORIA_NO_EXISTE';
    END IF;

    SET v_titulo = NULLIF(TRIM(p_titulo), '');
    IF v_titulo IS NULL THEN
        SELECT CONCAT_WS(' - ', e.E_Nombre, s.S_Nombre)
          INTO v_titulo
        FROM T_Eventos e
        JOIN T_Servicios s
        WHERE e.PK_E_Cod = p_evento AND s.PK_S_Cod = p_servicio;
        IF v_titulo IS NULL THEN
            SET v_titulo = CONCAT('Paquete ', p_evento, '-', p_servicio);
        END IF;
    END IF;

    INSERT INTO T_EventoServicio (
        PK_S_Cod,
        PK_E_Cod,
        FK_ESC_Cod,
        ExS_EsAddon,
        ExS_Titulo,
        ExS_Precio,
        ExS_Descripcion,
        ExS_Horas,
        ExS_FotosImpresas,
        ExS_TrailerMin,
        ExS_FilmMin
    )
    VALUES (
        p_servicio,
        p_evento,
        p_categoria_id,
        IFNULL(p_es_addon, 0),
        v_titulo,
        p_precio,
        NULLIF(TRIM(p_descripcion), ''),
        p_horas,
        p_fotos,
        p_trailer,
        p_film
    );

    SET v_id = LAST_INSERT_ID();

    -- Staff
    IF p_staff IS NOT NULL AND JSON_VALID(p_staff) THEN
        INSERT INTO T_EventoServicioStaff (FK_ExS_Cod, Staff_Rol, Staff_Cantidad)
        SELECT v_id,
               NULLIF(TRIM(js.rol), ''),
               GREATEST(COALESCE(js.cantidad, 0), 0)
        FROM JSON_TABLE(
                p_staff,
                '$[*]' COLUMNS (
                    rol VARCHAR(40) PATH '$.rol',
                    cantidad INT PATH '$.cantidad'
                )
             ) AS js
        WHERE NULLIF(TRIM(js.rol), '') IS NOT NULL;
    END IF;

    -- Equipos
    IF p_equipos IS NOT NULL AND JSON_VALID(p_equipos) THEN
        INSERT INTO T_EventoServicioEquipo (FK_ExS_Cod, FK_TE_Cod, Cantidad, Notas)
        SELECT v_id,
               js.tipoEquipoId,
               GREATEST(COALESCE(js.cantidad, 1), 0),
               NULLIF(TRIM(js.notas), '')
        FROM JSON_TABLE(
                p_equipos,
                '$[*]' COLUMNS (
                    tipoEquipoId INT PATH '$.tipoEquipoId',
                    cantidad INT PATH '$.cantidad',
                    notas VARCHAR(150) PATH '$.notas'
                )
             ) AS js
        WHERE js.tipoEquipoId IS NOT NULL;
    END IF;

    SELECT v_id AS PK_ExS_Cod;
END;;
DELIMITER ;

-- Procedure: sp_evento_servicio_listar
DROP PROCEDURE IF EXISTS `sp_evento_servicio_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_listar"(
    IN p_evento INT,
    IN p_serv   INT
  )
BEGIN
    SELECT
        es.PK_ExS_Cod        AS idEventoServicio,
        es.ExS_Titulo        AS titulo,
        es.FK_ESC_Cod        AS categoriaId,
        cat.ESC_Nombre       AS categoriaNombre,
        cat.ESC_Tipo         AS categoriaTipo,
        es.ExS_EsAddon       AS esAddon,
        es.FK_ESE_Cod        AS estadoId,
        est.ESE_Nombre       AS estadoNombre,
        e.PK_E_Cod           AS idEvento,
        e.E_Nombre           AS evento,
        s.PK_S_Cod           AS idServicio,
        s.S_Nombre           AS servicio,
        es.ExS_Precio        AS precio,
        es.ExS_Descripcion   AS descripcion,
        es.ExS_Horas         AS horas,
        es.ExS_FotosImpresas AS fotosImpresas,
        es.ExS_TrailerMin    AS trailerMin,
        es.ExS_FilmMin       AS filmMin,
        (
          SELECT COALESCE(SUM(st.Staff_Cantidad), 0)
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffTotal,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'rol', st.Staff_Rol,
                     'cantidad', st.Staff_Cantidad
                   )
                 )
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffDetalle,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'tipoEquipoId', eq.FK_TE_Cod,
                     'tipoEquipo', te.TE_Nombre,
                     'cantidad', eq.Cantidad,
                     'notas', eq.Notas
                   )
                 )
          FROM T_EventoServicioEquipo eq
          JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
          WHERE eq.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS equipos
    FROM T_EventoServicio es
    JOIN T_Eventos e    ON e.PK_E_Cod = es.PK_E_Cod
    JOIN T_Servicios s  ON s.PK_S_Cod = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    LEFT JOIN T_EventoServicioEstado est    ON est.PK_ESE_Cod = es.FK_ESE_Cod
    WHERE (p_evento IS NULL OR es.PK_E_Cod = p_evento)
      AND (p_serv   IS NULL OR es.PK_S_Cod = p_serv)
    ORDER BY es.PK_ExS_Cod DESC;
  END;;
DELIMITER ;

-- Procedure: sp_evento_servicio_obtener
DROP PROCEDURE IF EXISTS `sp_evento_servicio_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_evento_servicio_obtener"(
    IN p_id INT
  )
BEGIN
    SELECT
        es.PK_ExS_Cod        AS id,
        es.ExS_Titulo        AS titulo,
        es.FK_ESC_Cod        AS categoriaId,
        cat.ESC_Nombre       AS categoriaNombre,
        cat.ESC_Tipo         AS categoriaTipo,
        es.ExS_EsAddon       AS esAddon,
        es.FK_ESE_Cod        AS estadoId,
        est.ESE_Nombre       AS estadoNombre,
        es.PK_E_Cod          AS idEvento,
        e.E_Nombre           AS evento,
        es.PK_S_Cod          AS idServicio,
        s.S_Nombre           AS servicio,
        es.ExS_Precio        AS precio,
        es.ExS_Descripcion   AS descripcion,
        es.ExS_Horas         AS horas,
        es.ExS_FotosImpresas AS fotosImpresas,
        es.ExS_TrailerMin    AS trailerMin,
        es.ExS_FilmMin       AS filmMin,
        (
          SELECT COALESCE(SUM(st.Staff_Cantidad), 0)
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffTotal,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'rol', st.Staff_Rol,
                     'cantidad', st.Staff_Cantidad
                   )
                 )
          FROM T_EventoServicioStaff st
          WHERE st.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS staffDetalle,
        (
          SELECT JSON_ARRAYAGG(
                   JSON_OBJECT(
                     'tipoEquipoId', eq.FK_TE_Cod,
                     'tipoEquipo', te.TE_Nombre,
                     'cantidad', eq.Cantidad,
                     'notas', eq.Notas
                   )
                 )
          FROM T_EventoServicioEquipo eq
          JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = eq.FK_TE_Cod
          WHERE eq.FK_ExS_Cod = es.PK_ExS_Cod
        ) AS equipos
    FROM T_EventoServicio es
    JOIN T_Eventos e    ON e.PK_E_Cod = es.PK_E_Cod
    JOIN T_Servicios s  ON s.PK_S_Cod = es.PK_S_Cod
    LEFT JOIN T_EventoServicioCategoria cat ON cat.PK_ESC_Cod = es.FK_ESC_Cod
    LEFT JOIN T_EventoServicioEstado est    ON est.PK_ESE_Cod = es.FK_ESE_Cod
    WHERE es.PK_ExS_Cod = p_id;
  END;;
DELIMITER ;

-- Procedure: SP_get_comprobante_pdf_by_voucher
DROP PROCEDURE IF EXISTS `SP_get_comprobante_pdf_by_voucher`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "SP_get_comprobante_pdf_by_voucher"(IN p_PK_Pa_Cod INT)
BEGIN
  DECLARE v_total DECIMAL(10,2) DEFAULT 0;          -- voucher (incluye IGV)
  DECLARE v_opGravada DECIMAL(10,2) DEFAULT 0;      -- referencia: base del voucher sin IGV
  DECLARE v_igv DECIMAL(10,2) DEFAULT 0;

  DECLARE v_totalSinIgv DECIMAL(10,2) DEFAULT 0;   -- total del comprobante sin IGV (= suma detalle)
  DECLARE v_totalConIgv DECIMAL(10,2) DEFAULT 0;   -- total con IGV

  DECLARE v_pedidoId INT DEFAULT NULL;
  DECLARE v_clienteId INT DEFAULT NULL;
  DECLARE v_userId INT DEFAULT NULL;

  DECLARE v_clienteTipoDoc VARCHAR(10) DEFAULT '';
  DECLARE v_clienteNumDoc VARCHAR(20) DEFAULT '';
  DECLARE v_clienteNombre VARCHAR(200) DEFAULT '';
  DECLARE v_clienteDireccion VARCHAR(255) DEFAULT '';
  DECLARE v_clienteCorreo VARCHAR(120) DEFAULT '';
  DECLARE v_clienteCelular VARCHAR(30) DEFAULT '';

  DECLARE v_tipo VARCHAR(20) DEFAULT 'BOLETA';
  DECLARE v_serie VARCHAR(10) DEFAULT 'B001';
  DECLARE v_numero VARCHAR(20) DEFAULT '';

  DECLARE v_sumPedido DECIMAL(18,6) DEFAULT 0;      -- SUM(PS_Subtotal) sin IGV
  DECLARE v_sumPedidoConIgv DECIMAL(18,2) DEFAULT 0;

  DECLARE v_factorPago_raw DECIMAL(18,8) DEFAULT 1; -- ratio real
  DECLARE v_factorPago DECIMAL(18,8) DEFAULT 1;     -- ratio redondeado a 2 dec

  DECLARE v_cnt INT DEFAULT 0;

  /* 1) Voucher + Pedido */
  SELECT v.Pa_Monto_Depositado, v.FK_P_Cod
    INTO v_total, v_pedidoId
  FROM T_Voucher v
  WHERE v.PK_Pa_Cod = p_PK_Pa_Cod
  LIMIT 1;

  IF v_pedidoId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Voucher no encontrado o sin pedido asociado';
  END IF;

  /* 2) Cliente -> Usuario */
  SELECT p.FK_Cli_Cod
    INTO v_clienteId
  FROM T_Pedido p
  WHERE p.PK_P_Cod = v_pedidoId
  LIMIT 1;

  IF v_clienteId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido sin cliente asociado';
  END IF;

  SELECT c.FK_U_Cod
    INTO v_userId
  FROM T_Cliente c
  WHERE c.PK_Cli_Cod = v_clienteId
  LIMIT 1;

  IF v_userId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente sin usuario asociado';
  END IF;

  SELECT
    CASE u.FK_TD_Cod
      WHEN 1 THEN 'DNI'
      WHEN 2 THEN 'CE'
      WHEN 3 THEN 'RUC'
      WHEN 4 THEN 'PAS'
      ELSE 'DNI'
    END,
    IFNULL(u.U_Numero_Documento,''),
    TRIM(CONCAT(IFNULL(u.U_Nombre,''), ' ', IFNULL(u.U_Apellido,''))),
    IFNULL(u.U_Direccion,''),
    IFNULL(u.U_Correo,''),
    IFNULL(u.U_Celular,'')
  INTO
    v_clienteTipoDoc,
    v_clienteNumDoc,
    v_clienteNombre,
    v_clienteDireccion,
    v_clienteCorreo,
    v_clienteCelular
  FROM T_Usuario u
  WHERE u.PK_U_Cod = v_userId
  LIMIT 1;

  /* 3) Tipo comprobante */
  IF v_clienteTipoDoc = 'RUC' THEN
    SET v_tipo = 'FACTURA';
    SET v_serie = 'F001';
  ELSE
    SET v_tipo = 'BOLETA';
    SET v_serie = 'B001';
  END IF;

  SET v_numero = LPAD(p_PK_Pa_Cod, 8, '0');

  /* 4) Referencia: base del voucher (sin IGV) */
  SET v_opGravada = ROUND(v_total / 1.18, 2);

  /* 5) Calcular factor y total SIN IGV (suma detalle) */
  SELECT COUNT(*), SUM(IFNULL(ps.PS_Subtotal,0))
    INTO v_cnt, v_sumPedido
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = v_pedidoId;

  SET v_sumPedidoConIgv = ROUND(IFNULL(v_sumPedido,0) * 1.18, 2);

  IF v_cnt > 0 AND v_sumPedido > 0 THEN
    SET v_factorPago_raw = v_total / NULLIF(v_sumPedidoConIgv, 0);
    IF v_factorPago_raw > 1 THEN SET v_factorPago_raw = 1; END IF;

    SET v_factorPago = ROUND(v_factorPago_raw, 2);

    -- total sin IGV = suma detalle prorrateada
    SET v_totalSinIgv = ROUND(v_sumPedido * v_factorPago, 2);
  ELSE
    SET v_totalSinIgv = v_opGravada;
    SET v_factorPago = 1;
  END IF;

  -- IGV y total con IGV
  SET v_igv = ROUND(v_totalSinIgv * 0.18, 2);
  SET v_totalConIgv = ROUND(v_totalSinIgv + v_igv, 2);

  /* ===== RESULTSET 1: CABECERA ===== */
  SELECT
    'D’la Cruz Video y Fotografia' AS empresaRazonSocial,
    'RUC_PLACE_HOLDER'             AS empresaRuc,
    'Cal. Piura MZ B4 Lt-10 S. J. de Miraflores' AS empresaDireccion,

    v_tipo   AS tipo,
    v_serie  AS serie,
    v_numero AS numero,

    DATE_FORMAT(NOW(), '%Y-%m-%d') AS fechaEmision,
    DATE_FORMAT(NOW(), '%H:%i')    AS horaEmision,
    'USD' AS moneda,

    v_clienteTipoDoc AS clienteTipoDoc,
    v_clienteNumDoc  AS clienteNumDoc,
    v_clienteNombre  AS clienteNombre,
    v_clienteDireccion AS clienteDireccion,
    v_clienteCorreo  AS clienteCorreo,
    v_clienteCelular AS clienteCelular,

    v_pedidoId AS pedidoId,
    (SELECT IFNULL(p.P_Nombre_Pedido,'') FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoNombre,
    (SELECT p.P_FechaEvento FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoFechaEvento,
    (SELECT IFNULL(p.P_Lugar,'') FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1) AS pedidoLugar,

    v_totalSinIgv AS opGravada,      -- SIN IGV
    v_igv         AS igv,            -- IGV
    v_totalSinIgv AS total,          -- ✅ primer total: SIN IGV
    v_totalConIgv AS totalConIgv,    -- ✅ segundo total: CON IGV
    0.00          AS anticipos,

    v_factorPago  AS factorPago;

  /* ===== RESULTSET 2: DETALLE ===== */
  IF v_cnt = 0 OR v_sumPedido <= 0 THEN
    SELECT
      1.00 AS cantidad,
      'UNIDAD' AS unidad,
      CONCAT(
        'Servicio por pago de pedido #', v_pedidoId,
        ' - ',
        (SELECT IFNULL(p.P_Nombre_Pedido,'') FROM T_Pedido p WHERE p.PK_P_Cod=v_pedidoId LIMIT 1)
      ) AS descripcion,
      v_totalSinIgv AS valorUnitario,
      0.00 AS descuento,
      v_totalSinIgv AS importe;
  ELSE
    SELECT
      CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2)) AS cantidad,
      'UNIDAD' AS unidad,
      CONCAT(
        IFNULL(ps.PS_Nombre,'Servicio'),
        IF(ps.PS_Descripcion IS NOT NULL AND ps.PS_Descripcion <> '', CONCAT(' — ', ps.PS_Descripcion), '')
      ) AS descripcion,

      ROUND(
        ROUND(IFNULL(ps.PS_Subtotal,0) / NULLIF(IFNULL(ps.PS_Cantidad,1),0), 2) * v_factorPago
      , 2) AS valorUnitario,

      0.00 AS descuento,

      ROUND(
        ROUND(
          ROUND(IFNULL(ps.PS_Subtotal,0) / NULLIF(IFNULL(ps.PS_Cantidad,1),0), 2) * v_factorPago
        , 2) * CAST(IFNULL(ps.PS_Cantidad,1) AS DECIMAL(10,2))
      , 2) AS importe

    FROM T_PedidoServicio ps
    WHERE ps.FK_P_Cod = v_pedidoId
    ORDER BY ps.PK_PS_Cod;
  END IF;

END;;
DELIMITER ;

-- Procedure: sp_lead_convertir_cliente
DROP PROCEDURE IF EXISTS `sp_lead_convertir_cliente`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_lead_convertir_cliente"(
  IN  p_lead_id        INT,
  IN  p_correo         VARCHAR(250),   -- obligatorio
  IN  p_celular        VARCHAR(25),    -- si viene vacio se usa el del lead
  IN  p_nombre         VARCHAR(25),    -- opcional
  IN  p_apellido       VARCHAR(25),    -- opcional
  IN  p_num_doc        VARCHAR(11),    -- obligatorio para crear usuario
  IN  p_tipo_doc_id    INT,            -- opcional (si no viene, se infiere por longitud)
  IN  p_razon_social   VARCHAR(150),   -- requerido si es RUC
  IN  p_direccion      VARCHAR(100),
  IN  p_tipo_cliente   INT,            -- puede ser NULL
  IN  p_estado_cliente INT,            -- requerido por FK a T_Estado_Cliente
  OUT o_usuario_id     INT,
  OUT o_cliente_id     INT,
  OUT o_usuario_accion VARCHAR(10),    -- siempre 'CREADO'
  OUT o_cliente_accion VARCHAR(10)     -- siempre 'CREADO'
)
BEGIN
  DECLARE v_lead_nombre   VARCHAR(80);
  DECLARE v_lead_celular  VARCHAR(30);
  DECLARE v_nombre        VARCHAR(25);
  DECLARE v_apellido      VARCHAR(25);
  DECLARE v_celular       VARCHAR(25);
  DECLARE v_tipo_doc_id   INT;
  DECLARE v_td_codigo     VARCHAR(10);
  DECLARE v_tipo_cliente  INT;
  DECLARE v_razon_social  VARCHAR(150);

  DECLARE v_exists_mail   INT;
  DECLARE v_exists_cel    INT;
  DECLARE v_exists_doc    INT;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  /* 1) Lock y validacion del lead */
  SELECT Lead_Nombre, Lead_Celular
    INTO v_lead_nombre, v_lead_celular
  FROM T_Lead
  WHERE PK_Lead_Cod = p_lead_id
  FOR UPDATE;

  IF v_lead_nombre IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lead no existe';
  END IF;

  /* 2) Resolver/validar datos base */
  SET v_celular = COALESCE(NULLIF(p_celular,''), v_lead_celular);
  IF p_correo IS NULL OR p_correo = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Correo es obligatorio';
  END IF;
  IF v_celular IS NULL OR v_celular = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Celular es obligatorio (no esta en payload ni en el lead)';
  END IF;
  IF p_num_doc IS NULL OR p_num_doc = '' THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Documento obligatorio para crear usuario';
  END IF;
  IF p_estado_cliente IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Falta p_estado_cliente (FK a T_Estado_Cliente)';
  END IF;

  SET v_nombre   = LEFT(COALESCE(NULLIF(p_nombre,''), v_lead_nombre), 25);
  SET v_apellido = LEFT(
                    COALESCE(
                      NULLIF(p_apellido,''),
                      TRIM(SUBSTRING(v_lead_nombre FROM LOCATE(' ', v_lead_nombre)+1))
                    ), 25
                  );

  /* 3) Resolver tipo de documento */
  SET v_tipo_doc_id = NULL;
  SET v_td_codigo = NULL;

  IF p_tipo_doc_id IS NOT NULL THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE PK_TD_Cod = p_tipo_doc_id
    LIMIT 1;
  ELSEIF CHAR_LENGTH(p_num_doc) = 8 THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE TD_Codigo = 'DNI'
    LIMIT 1;
  ELSEIF CHAR_LENGTH(p_num_doc) = 11 THEN
    SELECT PK_TD_Cod, TD_Codigo INTO v_tipo_doc_id, v_td_codigo
    FROM T_TipoDocumento
    WHERE TD_Codigo = 'RUC'
    LIMIT 1;
  END IF;

  IF v_tipo_doc_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de documento invalido';
  END IF;

  IF v_td_codigo = 'RUC' THEN
    SET v_tipo_cliente = 2;
    SET v_razon_social = NULLIF(TRIM(p_razon_social), '');
    IF v_razon_social IS NULL THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Razon social es requerida para RUC';
    END IF;
  ELSE
    SET v_tipo_cliente = COALESCE(p_tipo_cliente, 1);
    SET v_razon_social = NULL;
  END IF;

  /* 4) Verificar que NO exista usuario (precondicion de negocio) */
  SELECT COUNT(*) INTO v_exists_mail FROM T_Usuario WHERE U_Correo = p_correo FOR UPDATE;
  IF v_exists_mail > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese correo';
  END IF;

  SELECT COUNT(*) INTO v_exists_cel FROM T_Usuario WHERE U_Celular = v_celular FOR UPDATE;
  IF v_exists_cel > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese celular';
  END IF;

  SELECT COUNT(*) INTO v_exists_doc FROM T_Usuario WHERE U_Numero_Documento = p_num_doc FOR UPDATE;
  IF v_exists_doc > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe un usuario con ese documento';
  END IF;

  /* 5) Crear usuario */
  INSERT INTO T_Usuario
      (U_Nombre, U_Apellido, U_Correo, U_Contrasena, U_Celular, U_Numero_Documento, FK_TD_Cod, U_Direccion)
  VALUES
      (v_nombre, v_apellido, p_correo, NULL, v_celular, p_num_doc, v_tipo_doc_id, p_direccion);

  SET o_usuario_id     = LAST_INSERT_ID();
  SET o_usuario_accion = 'CREADO';

  /* 6) Crear cliente */
  INSERT INTO T_Cliente (FK_U_Cod, Cli_Tipo_Cliente, FK_ECli_Cod, Cli_RazonSocial)
  VALUES (o_usuario_id, v_tipo_cliente, p_estado_cliente, v_razon_social);

  SET o_cliente_id     = LAST_INSERT_ID();
  SET o_cliente_accion = 'CREADO';

  /* 7) Migrar cotizaciones del lead */
  UPDATE T_Cotizacion
     SET FK_Cli_Cod  = o_cliente_id,
         FK_Lead_Cod = NULL
   WHERE FK_Lead_Cod = p_lead_id
     AND (FK_Cli_Cod IS NULL OR FK_Cli_Cod = o_cliente_id);

  COMMIT;
END;;
DELIMITER ;

-- Procedure: sp_metodo_pago_listar
DROP PROCEDURE IF EXISTS `sp_metodo_pago_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_metodo_pago_listar"()
BEGIN
  SELECT
    mp.PK_MP_Cod AS idMetodoPago,
    mp.MP_Nombre AS nombre
  FROM T_Metodo_Pago mp
  ORDER BY mp.PK_MP_Cod;
END;;
DELIMITER ;

-- Procedure: sp_pedido_actualizar
DROP PROCEDURE IF EXISTS `sp_pedido_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_actualizar"(
  IN p_id          INT,          -- PK del pedido (PK_P_Cod)
  IN p_fk_ep       INT,          -- FK_EP_Cod (estado del pedido)
  IN p_fecha_event DATE,         -- P_Fecha_Evento (YYYY-MM-DD)
  IN p_hora_event  TIME,         -- P_Hora_Evento (HH:mm:ss)
  IN p_lugar       VARCHAR(100), -- P_Lugar
  IN p_fk_emp      INT,          -- FK_Em_Cod (empleado asignado)
  IN p_fk_esp      INT           -- FK_ESP_Cod (estado de pago)
)
BEGIN
  UPDATE T_Pedido
  SET
    FK_EP_Cod      = p_fk_ep,
    P_Fecha_Evento = p_fecha_event,
    P_Hora_Evento  = p_hora_event,
    P_Lugar        = TRIM(p_lugar),
    FK_Em_Cod      = p_fk_emp,
    FK_ESP_Cod     = p_fk_esp
  WHERE PK_P_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END;;
DELIMITER ;

-- Procedure: sp_pedido_estado_obtener_ultimo
DROP PROCEDURE IF EXISTS `sp_pedido_estado_obtener_ultimo`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_estado_obtener_ultimo"()
BEGIN
  SELECT 
    PK_EP_Cod  AS idEstadoPedido,
    EP_Nombre  AS nombre
  FROM T_Estado_Pedido
  ORDER BY PK_EP_Cod DESC
  LIMIT 1;
END;;
DELIMITER ;

-- Procedure: sp_pedido_listar
DROP PROCEDURE IF EXISTS `sp_pedido_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar"()
BEGIN
  DECLARE v_igv_rate DECIMAL(6,4) DEFAULT 0.18;

  SELECT
    p.PK_P_Cod                                           AS ID,
    CONCAT('Pedido ', p.PK_P_Cod)                        AS Nombre,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE CONCAT_WS(' ', u.U_Nombre, u.U_Apellido)
    END                                                  AS Cliente,
    u.U_Numero_Documento                                 AS Documento,
    p.P_Fecha_Creacion                                   AS Creado,
    p.P_Dias                                             AS dias,
    p.P_ViaticosMonto                                    AS viaticosMonto,
    p.P_Lugar                                            AS Lugar,

    -- Proximo evento elegido (futuro mas cercano; si no hay, el primero)
    evProx.PE_Fecha                                      AS ProxFecha,
    TIME_FORMAT(evProx.PE_Hora, '%H:%i:%s')              AS ProxHora,
    CASE DAYOFWEEK(evProx.PE_Fecha)
      WHEN 1 THEN 'dom' WHEN 2 THEN 'lun' WHEN 3 THEN 'mar'
      WHEN 4 THEN 'mie' WHEN 5 THEN 'jue' WHEN 6 THEN 'vie'
      WHEN 7 THEN 'sab' ELSE NULL
    END                                                  AS ProxDia,
    evProx.PE_Ubicacion                                  AS Ubicacion,

    -- Tipo de evento (E_Nombre) segun primer item del pedido
    (SELECT e.E_Nombre
       FROM T_PedidoServicio ps
       JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
       JOIN T_Eventos e          ON e.PK_E_Cod     = exs.PK_E_Cod
      WHERE ps.FK_P_Cod = p.PK_P_Cod
      ORDER BY ps.PK_PS_Cod
      LIMIT 1)                                           AS TipoEvento,

    -- Totales por moneda (string listo para tabla)
    (
      SELECT GROUP_CONCAT(
        CONCAT(
          t.moneda,
          ' ',
          FORMAT((t.total + COALESCE(p.P_ViaticosMonto, 0)) * (1 + v_igv_rate), 2)
        ) SEPARATOR ' | '
      )
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalLabel,

    -- Totales por moneda en JSON
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'moneda',
          t.moneda,
          'total',
          (t.total + COALESCE(p.P_ViaticosMonto, 0)) * (1 + v_igv_rate)
        )
      )
      FROM (
        SELECT PS_Moneda AS moneda, SUM(PS_Subtotal) AS total
        FROM T_PedidoServicio
        WHERE FK_P_Cod = p.PK_P_Cod
        GROUP BY PS_Moneda
      ) t
    )                                                    AS TotalesJSON,

    COALESCE(ep.EP_Nombre, CONCAT('Estado #', p.FK_EP_Cod)) AS Estado,
    COALESCE(esp.ESP_Nombre, CONCAT('Pago #', p.FK_ESP_Cod)) AS Pago,
    p.FK_Em_Cod                                              AS ResponsableId

  FROM T_Pedido p
  JOIN T_Cliente c      ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u      ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  LEFT JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod  = p.FK_EP_Cod
  LEFT JOIN T_Estado_Pago  esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod

  LEFT JOIN T_PedidoEvento evProx
    ON evProx.PK_PE_Cod = COALESCE(
      (SELECT e1.PK_PE_Cod
       FROM T_PedidoEvento e1
       WHERE e1.FK_P_Cod = p.PK_P_Cod
         AND CONCAT(e1.PE_Fecha, ' ', COALESCE(e1.PE_Hora, '00:00:00')) >= NOW()
       ORDER BY e1.PE_Fecha, e1.PE_Hora
       LIMIT 1),
      (SELECT e2.PK_PE_Cod
       FROM T_PedidoEvento e2
       WHERE e2.FK_P_Cod = p.PK_P_Cod
       ORDER BY e2.PE_Fecha, e2.PE_Hora
       LIMIT 1)
    )
  ORDER BY p.PK_P_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_pedido_listar_por_cliente_detalle
DROP PROCEDURE IF EXISTS `sp_pedido_listar_por_cliente_detalle`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_listar_por_cliente_detalle"(
  IN p_cliente_id INT
)
BEGIN
  DECLARE v_igv_rate DECIMAL(6,4) DEFAULT 0.18;

  IF p_cliente_id IS NULL OR p_cliente_id <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'p_cliente_id debe ser mayor que cero';
  END IF;

  SELECT
    p.PK_P_Cod AS pedidoId,
    p.FK_Cli_Cod AS clienteId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.P_Nombre_Pedido AS nombrePedido,
    p.P_Observaciones AS observaciones,
    p.FK_Cot_Cod AS cotizacionId,
    ep.EP_Nombre AS estadoPedido,
    esp.ESP_Nombre AS estadoPago,
    p.FK_Em_Cod AS empleadoId,
    MAX(CONCAT_WS(' ', uEm.U_Nombre, uEm.U_Apellido)) AS empleadoNombre,
    p.P_ViaticosMonto AS viaticosMonto,
    p.P_Lugar AS lugar,
    COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) AS subtotal,
    COALESCE(
      sal.Igv,
      ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * v_igv_rate, 2)
    ) AS igv,
    COALESCE(
      sal.CostoTotal,
      ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * (1 + v_igv_rate), 2)
    ) AS total,
    COALESCE(sal.MontoAbonado, 0) AS montoAbonado,
    COALESCE(
      sal.SaldoPendiente,
      COALESCE(
        sal.CostoTotal,
        ROUND(COALESCE(sal.CostoBase, (it.totalCalculado + COALESCE(p.P_ViaticosMonto, 0)), 0) * (1 + v_igv_rate), 2)
      ) - COALESCE(sal.MontoAbonado, 0),
      0
    ) AS saldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    COALESCE(ev.cantidadEventos, 0) AS cantidadEventos,
    COALESCE(it.cantidadItems, 0) AS cantidadItems
  FROM T_Pedido p
  JOIN T_Estado_Pedido ep ON ep.PK_EP_Cod = p.FK_EP_Cod
  JOIN T_Estado_Pago esp ON esp.PK_ESP_Cod = p.FK_ESP_Cod
  LEFT JOIN T_Empleados em ON em.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario uEm ON uEm.PK_U_Cod = em.FK_U_Cod
  LEFT JOIN V_Pedido_Saldos sal ON sal.PedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      MIN(PE_Fecha) AS primerEventoFecha,
      MAX(PE_Fecha) AS ultimoEventoFecha,
      COUNT(*) AS cantidadEventos
    FROM T_PedidoEvento
    GROUP BY FK_P_Cod
  ) ev ON ev.pedidoId = p.PK_P_Cod
  LEFT JOIN (
    SELECT
      FK_P_Cod AS pedidoId,
      COUNT(*) AS cantidadItems,
      SUM(
        COALESCE(
          PS_Subtotal,
          (COALESCE(PS_PrecioUnit,0) * COALESCE(PS_Cantidad,1))
          - COALESCE(PS_Descuento,0)
          + COALESCE(PS_Recargo,0)
        )
      ) AS totalCalculado
    FROM T_PedidoServicio
    GROUP BY FK_P_Cod
  ) it ON it.pedidoId = p.PK_P_Cod
  WHERE p.FK_Cli_Cod = p_cliente_id
  GROUP BY
    p.PK_P_Cod,
    p.FK_Cli_Cod,
    p.P_Fecha_Creacion,
    p.P_Nombre_Pedido,
    p.P_Observaciones,
    p.FK_Cot_Cod,
    ep.EP_Nombre,
    esp.ESP_Nombre,
    p.FK_Em_Cod,
    p.P_ViaticosMonto,
    p.P_Lugar,
    sal.CostoBase,
    sal.Igv,
    sal.CostoTotal,
    sal.MontoAbonado,
    sal.SaldoPendiente,
    ev.primerEventoFecha,
    ev.ultimoEventoFecha,
    ev.cantidadEventos,
    it.cantidadItems,
    it.totalCalculado
  ORDER BY p.P_Fecha_Creacion DESC;
END;;
DELIMITER ;

-- Procedure: sp_pedido_obtener
DROP PROCEDURE IF EXISTS `sp_pedido_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_obtener"(IN p_pedido_id INT)
BEGIN
  DECLARE v_exists INT DEFAULT 0;

  SELECT COUNT(*) INTO v_exists
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_exists = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Pedido no encontrado';
  END IF;

  SELECT
    p.PK_P_Cod         AS id,
    p.FK_Cli_Cod       AS clienteId,
    p.FK_Cot_Cod       AS cotizacionId,
    p.FK_Em_Cod        AS empleadoId,
    p.P_Fecha_Creacion AS fechaCreacion,
    p.FK_EP_Cod        AS estadoPedidoId,
    p.FK_ESP_Cod       AS estadoPagoId,
    p.P_FechaEvento    AS fechaEvento,
    p.P_Lugar          AS lugar,
    p.P_IdTipoEvento   AS idTipoEvento,
    p.P_Dias           AS dias,
    p.P_HorasEst       AS horasEstimadas,
    p.P_ViaticosMonto  AS viaticosMonto,
    p.P_Mensaje        AS mensaje,
    p.P_Observaciones  AS observaciones,
    p.P_Nombre_Pedido  AS nombrePedido,
    u.U_Numero_Documento AS clienteDocumento,
    CASE
      WHEN td.TD_Codigo = 'RUC' THEN c.Cli_RazonSocial
      ELSE NULL
    END                 AS clienteRazonSocial,
    u.U_Nombre           AS clienteNombres,
    u.U_Apellido         AS clienteApellidos,
    u.U_Celular          AS clienteCelular,
    u.U_Correo           AS clienteCorreo,
    u.U_Direccion        AS clienteDireccion,
    ue.U_Nombre        AS empleadoNombres,
    ue.U_Apellido      AS empleadoApellidos
  FROM T_Pedido p
  JOIN T_Cliente c   ON c.PK_Cli_Cod = p.FK_Cli_Cod
  JOIN T_Usuario u   ON u.PK_U_Cod   = c.FK_U_Cod
  LEFT JOIN T_TipoDocumento td ON td.PK_TD_Cod = u.FK_TD_Cod
  LEFT JOIN T_Empleados e ON e.PK_Em_Cod = p.FK_Em_Cod
  LEFT JOIN T_Usuario  ue ON ue.PK_U_Cod = e.FK_U_Cod
  WHERE p.PK_P_Cod = p_pedido_id;

  SELECT
    pe.PK_PE_Cod    AS id,
    pe.FK_P_Cod     AS pedidoId,
    pe.PE_Fecha     AS fecha,
    pe.PE_Hora      AS hora,
    pe.PE_Ubicacion AS ubicacion,
    pe.PE_Direccion AS direccion,
    pe.PE_Notas     AS notas
  FROM T_PedidoEvento pe
  WHERE pe.FK_P_Cod = p_pedido_id
  ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod;

  SELECT
    ps.PK_PS_Cod     AS id,
    ps.FK_P_Cod      AS pedidoId,
    ps.FK_PE_Cod     AS eventoCodigo,
    ps.FK_ExS_Cod    AS idEventoServicio,
    ps.PS_EventoId   AS eventoId,
    ps.PS_ServicioId AS servicioId,
    ps.PS_Nombre     AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda     AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad   AS cantidad,
    ps.PS_Descuento  AS descuento,
    ps.PS_Recargo    AS recargo,
    ps.PS_Notas      AS notas,
    ps.PS_Horas      AS horas,
    ps.PS_Staff      AS personal,
    ps.PS_FotosImpresas AS fotosImpresas,
    ps.PS_TrailerMin AS trailerMin,
    ps.PS_FilmMin    AS filmMin,
    ps.PS_Subtotal   AS subtotal
  FROM T_PedidoServicio ps
  WHERE ps.FK_P_Cod = p_pedido_id
  ORDER BY ps.PK_PS_Cod;

  SELECT
    psf.FK_PedServ_Cod AS idPedidoServicio,
    psf.PSF_Fecha      AS fecha
  FROM T_PedidoServicioFecha psf
  WHERE psf.FK_P_Cod = p_pedido_id
  ORDER BY psf.FK_PedServ_Cod, psf.PSF_Fecha;
END;;
DELIMITER ;

-- Procedure: sp_pedido_obtener_siguiente_id
DROP PROCEDURE IF EXISTS `sp_pedido_obtener_siguiente_id`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_obtener_siguiente_id"()
BEGIN
  DECLARE v_next BIGINT;

  /* Opción preferida: leer el AUTO_INCREMENT real de la tabla */
  SELECT t.AUTO_INCREMENT
    INTO v_next
    FROM information_schema.TABLES t
   WHERE t.TABLE_SCHEMA = DATABASE()
     AND t.TABLE_NAME   = 'T_Pedido'     -- <<< Cambia si tu tabla tiene otro nombre
   LIMIT 1;

  /* Fallback: si por alguna razón no trajo valor, usamos MAX(id)+1 */
  IF v_next IS NULL THEN
    SELECT COALESCE(MAX(PK_Ped_Cod), 0) + 1   -- <<< Cambia PK_Ped_Cod si tu PK tiene otro nombre
      INTO v_next
      FROM T_Pedido;                          -- <<< Cambia el nombre de la tabla si aplica
  END IF;

  SELECT v_next AS nextIndex;
END;;
DELIMITER ;

-- Procedure: sp_pedido_pago_resumen
DROP PROCEDURE IF EXISTS `sp_pedido_pago_resumen`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_pago_resumen"(IN pPedidoId INT)
BEGIN
  SELECT
    CostoBase,
    Igv,
    CostoTotal,
    MontoAbonado,
    SaldoPendiente
  FROM V_Pedido_Saldos
  WHERE PedidoId = pPedidoId;
END;;
DELIMITER ;

-- Procedure: sp_pedido_saldo_listar_pagados
DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_pagados`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pagados"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 3
  ORDER BY s.PedidoId DESC;
END;;
DELIMITER ;

-- Procedure: sp_pedido_saldo_listar_parciales
DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_parciales`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_parciales"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 2
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END;;
DELIMITER ;

-- Procedure: sp_pedido_saldo_listar_pendientes
DROP PROCEDURE IF EXISTS `sp_pedido_saldo_listar_pendientes`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_pedido_saldo_listar_pendientes"()
BEGIN
  SELECT
    s.PedidoId AS IdPed,
    COALESCE(s.Proyecto, CONCAT('Pedido ', s.PedidoId)) AS Nombre,
    s.Fecha,
    s.FechaCreacion
  FROM V_Pedido_Saldos s
  WHERE s.EstadoPagoId = 1
    AND s.EstadoPedidoId <> 6
  ORDER BY s.PedidoId DESC;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_actualizar
DROP PROCEDURE IF EXISTS `sp_proyecto_actualizar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_actualizar"(
  IN p_id INT,
  IN p_nombre VARCHAR(50),
  IN p_fecha_inicio DATE,
  IN p_fecha_fin DATE,
  IN p_pre_entrega_enlace VARCHAR(255),
  IN p_pre_entrega_tipo VARCHAR(60),
  IN p_pre_entrega_feedback VARCHAR(255),
  IN p_pre_entrega_fecha DATE,
  IN p_respaldo_ubicacion VARCHAR(255),
  IN p_respaldo_notas VARCHAR(255),
  IN p_entrega_final_enlace VARCHAR(255),
  IN p_entrega_final_fecha DATE,
  IN p_estado TINYINT,
  IN p_responsable INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255),
  IN p_updated_at DATETIME
)
BEGIN
  UPDATE T_Proyecto
  SET Pro_Nombre = COALESCE(NULLIF(TRIM(p_nombre), ''), Pro_Nombre),
      Pro_Estado = COALESCE(p_estado, Pro_Estado),
      FK_Em_Cod = COALESCE(p_responsable, FK_Em_Cod),
      EPro_Fecha_Inicio_Edicion = COALESCE(p_fecha_inicio, EPro_Fecha_Inicio_Edicion),
      Pro_Fecha_Fin_Edicion = COALESCE(p_fecha_fin, Pro_Fecha_Fin_Edicion),
      Pro_Pre_Entrega_Enlace = COALESCE(NULLIF(TRIM(p_pre_entrega_enlace), ''), Pro_Pre_Entrega_Enlace),
      Pro_Pre_Entrega_Tipo = COALESCE(NULLIF(TRIM(p_pre_entrega_tipo), ''), Pro_Pre_Entrega_Tipo),
      Pro_Pre_Entrega_Feedback = COALESCE(NULLIF(TRIM(p_pre_entrega_feedback), ''), Pro_Pre_Entrega_Feedback),
      Pro_Pre_Entrega_Fecha = COALESCE(p_pre_entrega_fecha, Pro_Pre_Entrega_Fecha),
      Pro_Respaldo_Ubicacion = COALESCE(NULLIF(TRIM(p_respaldo_ubicacion), ''), Pro_Respaldo_Ubicacion),
      Pro_Respaldo_Notas = COALESCE(NULLIF(TRIM(p_respaldo_notas), ''), Pro_Respaldo_Notas),
      Pro_Entrega_Final_Enlace = COALESCE(NULLIF(TRIM(p_entrega_final_enlace), ''), Pro_Entrega_Final_Enlace),
      Pro_Entrega_Final_Fecha = COALESCE(p_entrega_final_fecha, Pro_Entrega_Final_Fecha),
      Pro_Enlace = COALESCE(NULLIF(TRIM(p_enlace), ''), Pro_Enlace),
      Pro_Notas = COALESCE(NULLIF(TRIM(p_notas), ''), Pro_Notas),
      updated_at = COALESCE(p_updated_at, updated_at)
  WHERE PK_Pro_Cod = p_id;

  SELECT ROW_COUNT() AS rowsAffected;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_crear_desde_pedido
DROP PROCEDURE IF EXISTS `sp_proyecto_crear_desde_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_crear_desde_pedido"(
  IN p_pedido_id INT,
  IN p_responsable_id INT,
  IN p_notas VARCHAR(255),
  IN p_enlace VARCHAR(255)
)
BEGIN
  DECLARE v_estado_id TINYINT;
  DECLARE v_proyecto_id INT;
  DECLARE v_nombre VARCHAR(50);
  DECLARE v_fecha_inicio DATE;
  DECLARE v_fecha_fin DATE;

  IF p_pedido_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'pedidoId es requerido';
  END IF;

  IF (SELECT COUNT(*) FROM T_Proyecto WHERE FK_P_Cod = p_pedido_id) > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El pedido ya tiene proyecto';
  END IF;

  SELECT COALESCE(NULLIF(TRIM(P_Nombre_Pedido), ''), CONCAT('Pedido ', p_pedido_id))
  INTO v_nombre
  FROM T_Pedido
  WHERE PK_P_Cod = p_pedido_id;

  IF v_nombre IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido no existe';
  END IF;

  SELECT PK_EPro_Cod INTO v_estado_id
  FROM T_Estado_Proyecto
  WHERE LOWER(EPro_Nombre) = 'planificado'
  LIMIT 1;

  IF v_estado_id IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado proyecto Planificado no existe';
  END IF;

  SELECT MIN(PE_Fecha), MAX(PE_Fecha)
  INTO v_fecha_inicio, v_fecha_fin
  FROM T_PedidoEvento
  WHERE FK_P_Cod = p_pedido_id;

  START TRANSACTION;

    INSERT INTO T_Proyecto (
      Pro_Nombre,
      FK_P_Cod,
      Pro_Estado,
      FK_Em_Cod,
      EPro_Fecha_Inicio_Edicion,
      Pro_Fecha_Fin_Edicion,
      Pro_Enlace,
      Pro_Notas,
      Pro_Revision_Multimedia,
      Pro_Revision_Edicion
    ) VALUES (
      v_nombre,
      p_pedido_id,
      v_estado_id,
      p_responsable_id,
      v_fecha_inicio,
      v_fecha_fin,
      NULLIF(TRIM(p_enlace), ''),
      NULLIF(TRIM(p_notas), ''),
      NULL,
      NULL
    );

    SET v_proyecto_id = LAST_INSERT_ID();

    INSERT INTO T_ProyectoDia (FK_Pro_Cod, PD_Fecha)
    SELECT v_proyecto_id, pe.PE_Fecha
    FROM T_PedidoEvento pe
    WHERE pe.FK_P_Cod = p_pedido_id
    GROUP BY pe.PE_Fecha;

    SET @pdb_orden := 0;
    SET @pdb_fecha := NULL;

    INSERT INTO T_ProyectoDiaBloque (FK_PD_Cod, PDB_Hora, PDB_Ubicacion, PDB_Direccion, PDB_Notas, PDB_Orden)
    SELECT
      x.FK_PD_Cod,
      x.PE_Hora,
      x.PE_Ubicacion,
      x.PE_Direccion,
      x.PE_Notas,
      x.PDB_Orden
    FROM (
      SELECT
        pd.PK_PD_Cod AS FK_PD_Cod,
        pe.PE_Fecha,
        pe.PE_Hora,
        pe.PE_Ubicacion,
        pe.PE_Direccion,
        pe.PE_Notas,
        (@pdb_orden := IF(@pdb_fecha = pe.PE_Fecha, @pdb_orden + 1, 1)) AS PDB_Orden,
        (@pdb_fecha := pe.PE_Fecha) AS _set_fecha
      FROM T_PedidoEvento pe
      JOIN T_ProyectoDia pd
        ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = pe.PE_Fecha
      WHERE pe.FK_P_Cod = p_pedido_id
      ORDER BY pe.PE_Fecha, pe.PE_Hora, pe.PK_PE_Cod
    ) x;

    INSERT IGNORE INTO T_ProyectoDiaServicio (FK_PD_Cod, FK_PS_Cod)
    SELECT
      pd.PK_PD_Cod,
      psf.FK_PedServ_Cod
    FROM T_PedidoServicioFecha psf
    JOIN T_ProyectoDia pd
      ON pd.FK_Pro_Cod = v_proyecto_id AND pd.PD_Fecha = psf.PSF_Fecha
    WHERE psf.FK_P_Cod = p_pedido_id;

  COMMIT;

  SELECT v_proyecto_id AS proyectoId;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_disponibilidad
DROP PROCEDURE IF EXISTS `sp_proyecto_disponibilidad`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_disponibilidad"(
  IN p_fecha_inicio DATE,
  IN p_fecha_fin    DATE,
  IN p_proyecto_id  INT,
  IN p_tipo_equipo  INT,
  IN p_cargo_id     INT
)
BEGIN
  IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaInicio y fechaFin son requeridos';
  END IF;
  IF p_fecha_fin < p_fecha_inicio THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fechaFin no puede ser menor a fechaInicio';
  END IF;

  /* Empleados operativos y activos */
  SELECT
    em.PK_Em_Cod           AS empleadoId,
    u.PK_U_Cod             AS usuarioId,
    u.U_Nombre             AS nombre,
    u.U_Apellido           AS apellido,
    te.PK_Tipo_Emp_Cod     AS cargoId,
    te.TiEm_Cargo          AS cargo,
    em.FK_Estado_Emp_Cod   AS estadoId,
    ee.EsEm_Nombre         AS estado,
    te.TiEm_OperativoCampo AS operativoCampo,
    IF(conf.conflictos IS NULL, 1, 0)                 AS disponible,
    COALESCE(conf.conflictos, JSON_ARRAY())           AS conflictos
  FROM T_Empleados em
  JOIN T_Usuario u            ON u.PK_U_Cod         = em.FK_U_Cod
  JOIN T_Tipo_Empleado te     ON te.PK_Tipo_Emp_Cod = em.FK_Tipo_Emp_Cod
  LEFT JOIN T_Estado_Empleado ee ON ee.PK_Estado_Emp_Cod = em.FK_Estado_Emp_Cod
  LEFT JOIN (
    SELECT
      emp_conf.empleadoId,
      JSON_ARRAYAGG(emp_conf.conflicto) AS conflictos
    FROM (
      SELECT
        pde.FK_Em_Cod AS empleadoId,
        JSON_OBJECT('proyectoId', pd.FK_Pro_Cod, 'fecha', pd.PD_Fecha) AS conflicto
      FROM T_ProyectoDiaEmpleado pde
      JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
      WHERE pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)

      UNION ALL

      SELECT
        pdi.FK_Em_Cod AS empleadoId,
        JSON_OBJECT('proyectoId', pd2.FK_Pro_Cod, 'fecha', pd2.PD_Fecha) AS conflicto
      FROM T_ProyectoDiaIncidencia pdi
      JOIN T_ProyectoDia pd2 ON pd2.PK_PD_Cod = pdi.FK_PD_Cod
      WHERE pdi.FK_Em_Cod IS NOT NULL
        AND pd2.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        AND (p_proyecto_id IS NULL OR pd2.FK_Pro_Cod <> p_proyecto_id)
    ) emp_conf
    GROUP BY emp_conf.empleadoId
  ) conf ON conf.empleadoId = em.PK_Em_Cod
  WHERE te.TiEm_OperativoCampo = 1
    AND em.FK_Estado_Emp_Cod = 1
    AND (p_cargo_id IS NULL OR te.PK_Tipo_Emp_Cod = p_cargo_id)
  ORDER BY disponible DESC, te.TiEm_Cargo, u.U_Nombre, u.U_Apellido;

  /* Equipos */
  SELECT
    eq.PK_Eq_Cod     AS idEquipo,
    eq.Eq_Fecha_Ingreso AS fechaIngreso,
    eq.Eq_Serie      AS serie,
    mo.PK_IMo_Cod    AS idModelo,
    mo.NMo_Nombre    AS nombreModelo,
    ma.PK_IMa_Cod    AS idMarca,
    ma.NMa_Nombre    AS nombreMarca,
    teq.PK_TE_Cod    AS idTipoEquipo,
    teq.TE_Nombre    AS nombreTipoEquipo,
    eq.FK_EE_Cod     AS idEstado,
    eeq.EE_Nombre    AS nombreEstado,
    IF(confEq.conflictos IS NULL, 1, 0)       AS disponible,
    COALESCE(confEq.conflictos, JSON_ARRAY()) AS conflictos
  FROM T_Equipo eq
  JOIN T_Modelo mo       ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Marca  ma       ON ma.PK_IMa_Cod = mo.FK_IMa_Cod
  JOIN T_Tipo_Equipo teq ON teq.PK_TE_Cod = mo.FK_TE_Cod
  JOIN T_Estado_Equipo eeq ON eeq.PK_EE_Cod = eq.FK_EE_Cod
  LEFT JOIN (
    SELECT
      eq_conf.equipoId,
      JSON_ARRAYAGG(eq_conf.conflicto) AS conflictos
    FROM (
      SELECT
        pdq.FK_Eq_Cod AS equipoId,
        JSON_OBJECT('proyectoId', pd.FK_Pro_Cod, 'fecha', pd.PD_Fecha) AS conflicto
      FROM T_ProyectoDiaEquipo pdq
      JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
      WHERE pd.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        AND (p_proyecto_id IS NULL OR pd.FK_Pro_Cod <> p_proyecto_id)

      UNION ALL

      SELECT
        pdi.FK_Eq_Cod AS equipoId,
        JSON_OBJECT('proyectoId', pd2.FK_Pro_Cod, 'fecha', pd2.PD_Fecha) AS conflicto
      FROM T_ProyectoDiaIncidencia pdi
      JOIN T_ProyectoDia pd2 ON pd2.PK_PD_Cod = pdi.FK_PD_Cod
      WHERE pdi.FK_Eq_Cod IS NOT NULL
        AND pd2.PD_Fecha BETWEEN p_fecha_inicio AND p_fecha_fin
        AND (p_proyecto_id IS NULL OR pd2.FK_Pro_Cod <> p_proyecto_id)
    ) eq_conf
    GROUP BY eq_conf.equipoId
  ) confEq ON confEq.equipoId = eq.PK_Eq_Cod
  WHERE eeq.EE_Nombre = 'Disponible'
    AND (p_tipo_equipo IS NULL OR teq.PK_TE_Cod = p_tipo_equipo)
  ORDER BY disponible DESC, teq.TE_Nombre, mo.NMo_Nombre, eq.PK_Eq_Cod;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_eliminar
DROP PROCEDURE IF EXISTS `sp_proyecto_eliminar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_eliminar"(IN p_id INT)
BEGIN
  DELETE FROM T_Proyecto WHERE PK_Pro_Cod = p_id;
  SELECT ROW_COUNT() AS rowsAffected;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_listar
DROP PROCEDURE IF EXISTS `sp_proyecto_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_listar"()
BEGIN
  SELECT
    pr.PK_Pro_Cod               AS proyectoId,
    pr.Pro_Nombre               AS proyectoNombre,
    pr.FK_P_Cod                 AS pedidoId,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion    AS fechaFinEdicion,
    pr.Pro_Pre_Entrega_Enlace   AS preEntregaEnlace,
    pr.Pro_Pre_Entrega_Tipo     AS preEntregaTipo,
    pr.Pro_Pre_Entrega_Feedback AS preEntregaFeedback,
    pr.Pro_Pre_Entrega_Fecha    AS preEntregaFecha,
    pr.Pro_Respaldo_Ubicacion   AS respaldoUbicacion,
    pr.Pro_Respaldo_Notas       AS respaldoNotas,
    pr.Pro_Entrega_Final_Enlace AS entregaFinalEnlace,
    pr.Pro_Entrega_Final_Fecha  AS entregaFinalFecha,
    pr.Pro_Estado               AS estadoId,
    ep.EPro_Nombre              AS estadoNombre,
    pr.FK_Em_Cod                AS responsableId,
    pr.Pro_Notas                AS notas,
    pr.Pro_Enlace               AS enlace,
    pr.created_at               AS createdAt,
    pr.updated_at               AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  ORDER BY pr.PK_Pro_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_proyecto_obtener
DROP PROCEDURE IF EXISTS `sp_proyecto_obtener`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_proyecto_obtener"(IN p_id INT)
BEGIN
  -- 1) Proyecto (cabecera)
  SELECT
    pr.PK_Pro_Cod               AS proyectoId,
    pr.Pro_Nombre               AS proyectoNombre,
    pr.FK_P_Cod                 AS pedidoId,
    pr.Pro_Estado               AS estadoId,
    ep.EPro_Nombre              AS estadoNombre,
    pr.FK_Em_Cod                AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pr.EPro_Fecha_Inicio_Edicion AS fechaInicioEdicion,
    pr.Pro_Fecha_Fin_Edicion    AS fechaFinEdicion,
    pr.Pro_Pre_Entrega_Enlace   AS preEntregaEnlace,
    pr.Pro_Pre_Entrega_Tipo     AS preEntregaTipo,
    pr.Pro_Pre_Entrega_Feedback AS preEntregaFeedback,
    pr.Pro_Pre_Entrega_Fecha    AS preEntregaFecha,
    pr.Pro_Respaldo_Ubicacion   AS respaldoUbicacion,
    pr.Pro_Respaldo_Notas       AS respaldoNotas,
    pr.Pro_Entrega_Final_Enlace AS entregaFinalEnlace,
    pr.Pro_Entrega_Final_Fecha  AS entregaFinalFecha,
    pr.Pro_Enlace               AS enlace,
    pr.Pro_Notas                AS notas,
    pr.created_at               AS createdAt,
    pr.updated_at               AS updatedAt
  FROM T_Proyecto pr
  LEFT JOIN T_Estado_Proyecto ep ON ep.PK_EPro_Cod = pr.Pro_Estado
  LEFT JOIN T_Empleados em       ON em.PK_Em_Cod   = pr.FK_Em_Cod
  LEFT JOIN T_Usuario u          ON u.PK_U_Cod     = em.FK_U_Cod
  WHERE pr.PK_Pro_Cod = p_id;

  -- 2) Dias del proyecto (con estado)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.FK_Pro_Cod AS proyectoId,
    pd.PD_Fecha AS fecha,
    pd.FK_EPD_Cod AS estadoDiaId,
    epd.EPD_Nombre AS estadoDiaNombre
  FROM T_ProyectoDia pd
  LEFT JOIN T_Estado_Proyecto_Dia epd ON epd.PK_EPD_Cod = pd.FK_EPD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pd.PK_PD_Cod;

  -- 3) Bloques (locaciones/horas) por dia
  SELECT
    pdb.PK_PDB_Cod AS bloqueId,
    pdb.FK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdb.PDB_Hora AS hora,
    pdb.PDB_Ubicacion AS ubicacion,
    pdb.PDB_Direccion AS direccion,
    pdb.PDB_Notas AS notas,
    pdb.PDB_Orden AS orden
  FROM T_ProyectoDiaBloque pdb
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdb.FK_PD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdb.PDB_Orden, pdb.PK_PDB_Cod;

  -- 4) Servicios por dia
  SELECT
    pds.PK_PDS_Cod AS id,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ps.PK_PS_Cod AS pedidoServicioId,
    ps.FK_ExS_Cod AS eventoServicioId,
    ps.PS_Nombre AS nombre,
    ps.PS_Descripcion AS descripcion,
    ps.PS_Moneda AS moneda,
    ps.PS_PrecioUnit AS precioUnit,
    ps.PS_Cantidad AS cantidad,
    ps.PS_Descuento AS descuento,
    ps.PS_Recargo AS recargo,
    ps.PS_Subtotal AS subtotal
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pds.PK_PDS_Cod;

  -- 5) Empleados por dia
  SELECT
    pde.PK_PDE_Cod AS asignacionId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pde.FK_Em_Cod AS empleadoId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS empleadoNombre,
    pde.PDE_Notas AS notas
  FROM T_ProyectoDiaEmpleado pde
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pde.FK_PD_Cod
  JOIN T_Empleados em ON em.PK_Em_Cod = pde.FK_Em_Cod
  JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pde.PK_PDE_Cod;

  -- 6) Equipos por dia
  SELECT
    pdq.PK_PDQ_Cod AS asignacionId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdq.FK_Eq_Cod AS equipoId,
    eq.Eq_Serie AS equipoSerie,
    mo.NMo_Nombre AS modelo,
    te.TE_Nombre AS tipoEquipo,
    eq.FK_EE_Cod AS estadoEquipoId,
    pdq.FK_Em_Cod AS responsableId,
    CONCAT(u.U_Nombre, ' ', u.U_Apellido) AS responsableNombre,
    pdq.PDQ_Notas AS notas,
    pdq.PDQ_Devuelto AS devuelto,
    pdq.PDQ_Fecha_Devolucion AS fechaDevolucion,
    pdq.PDQ_Estado_Devolucion AS estadoDevolucion,
    pdq.PDQ_Notas_Devolucion AS notasDevolucion,
    pdq.PDQ_Usuario_Devolucion AS usuarioDevolucion
  FROM T_ProyectoDiaEquipo pdq
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdq.FK_PD_Cod
  JOIN T_Equipo eq ON eq.PK_Eq_Cod = pdq.FK_Eq_Cod
  JOIN T_Modelo mo ON mo.PK_IMo_Cod = eq.FK_IMo_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = mo.FK_TE_Cod
  LEFT JOIN T_Empleados em ON em.PK_Em_Cod = pdq.FK_Em_Cod
  LEFT JOIN T_Usuario u ON u.PK_U_Cod = em.FK_U_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdq.PK_PDQ_Cod;

  -- 7) Requerimientos de personal por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    ess.Staff_Rol AS rol,
    SUM(ess.Staff_Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioStaff ess ON ess.FK_ExS_Cod = exs.PK_ExS_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, ess.Staff_Rol
  ORDER BY pd.PD_Fecha, ess.Staff_Rol;

  -- 8) Requerimientos de equipo por dia (segun servicios del dia)
  SELECT
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    te.PK_TE_Cod AS tipoEquipoId,
    te.TE_Nombre AS tipoEquipoNombre,
    SUM(ese.Cantidad) AS cantidad
  FROM T_ProyectoDia pd
  JOIN T_ProyectoDiaServicio pds ON pds.FK_PD_Cod = pd.PK_PD_Cod
  JOIN T_PedidoServicio ps ON ps.PK_PS_Cod = pds.FK_PS_Cod
  JOIN T_EventoServicio exs ON exs.PK_ExS_Cod = ps.FK_ExS_Cod
  JOIN T_EventoServicioEquipo ese ON ese.FK_ExS_Cod = exs.PK_ExS_Cod
  JOIN T_Tipo_Equipo te ON te.PK_TE_Cod = ese.FK_TE_Cod
  WHERE pd.FK_Pro_Cod = p_id
  GROUP BY pd.PK_PD_Cod, pd.PD_Fecha, te.PK_TE_Cod, te.TE_Nombre
  ORDER BY pd.PD_Fecha, te.TE_Nombre;

  -- 9) Incidencias por dia
  SELECT
    pdi.PK_PDI_Cod AS incidenciaId,
    pd.PK_PD_Cod AS diaId,
    pd.PD_Fecha AS fecha,
    pdi.PDI_Tipo AS tipo,
    pdi.PDI_Descripcion AS descripcion,
    pdi.PDI_FechaHora_Evento AS fechaHoraEvento,
    pdi.FK_U_Cod AS usuarioId,
    pdi.FK_Eq_Cod AS equipoId,
    pdi.FK_Eq_Reemplazo_Cod AS equipoReemplazoId,
    pdi.FK_Em_Cod AS empleadoId,
    pdi.FK_Em_Reemplazo_Cod AS empleadoReemplazoId,
    pdi.created_at AS createdAt
  FROM T_ProyectoDiaIncidencia pdi
  JOIN T_ProyectoDia pd ON pd.PK_PD_Cod = pdi.FK_PD_Cod
  WHERE pd.FK_Pro_Cod = p_id
  ORDER BY pd.PD_Fecha, pdi.PK_PDI_Cod;
END;;
DELIMITER ;

-- Procedure: sp_servicio_listar
DROP PROCEDURE IF EXISTS `sp_servicio_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_servicio_listar"()
BEGIN
  /* Ajusta los nombres de columnas si difieren en tu DB */
  SELECT 
    s.PK_S_Cod   AS id,
    s.S_Nombre   AS nombre
  FROM T_Servicios s
  ORDER BY s.S_Nombre;
END;;
DELIMITER ;

-- Procedure: sp_voucher_crear
DROP PROCEDURE IF EXISTS `sp_voucher_crear`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_crear"(
  IN p_monto         DECIMAL(10,2),
  IN p_metodoPago    INT,
  IN p_estadoVoucher INT,
  IN p_imagen        LONGBLOB,
  IN p_idPedido      INT,
  IN p_fecha         DATETIME,
  IN p_mime          VARCHAR(100),
  IN p_nombre        VARCHAR(255),
  IN p_size          INT
)
BEGIN
  INSERT INTO T_Voucher(
    Pa_Monto_Depositado,
    FK_MP_Cod,
    FK_EV_Cod,
    Pa_Imagen_Voucher,
    FK_P_Cod,
    Pa_Fecha,
    Pa_Imagen_Mime,
    Pa_Imagen_NombreOriginal,
    Pa_Imagen_Size
  )
  VALUES (
    p_monto,
    p_metodoPago,
    p_estadoVoucher,
    p_imagen,
    p_idPedido,
    p_fecha,
    p_mime,
    p_nombre,
    p_size
  );

  SELECT LAST_INSERT_ID() AS idVoucher;
END;;
DELIMITER ;

-- Procedure: sp_voucher_estado_listar
DROP PROCEDURE IF EXISTS `sp_voucher_estado_listar`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_estado_listar"()
BEGIN
  SELECT
    v.PK_Pa_Cod   AS idVoucher,
    ev.PK_EV_Cod  AS idEstado,
    ev.EV_Nombre  AS nombre
  FROM T_Voucher v
  INNER JOIN T_Estado_voucher ev
          ON ev.PK_EV_Cod = v.FK_EV_Cod
  ORDER BY v.PK_Pa_Cod ASC;
END;;
DELIMITER ;

-- Procedure: sp_voucher_listar_por_pedido
DROP PROCEDURE IF EXISTS `sp_voucher_listar_por_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_por_pedido"(IN p_idPedido INT)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS idVoucher,
    v.FK_P_Cod             AS idPedido,
    v.Pa_Monto_Depositado  AS monto,
    v.FK_MP_Cod            AS idMetodoPago,
    mp.MP_Nombre           AS metodoPago,
    v.FK_EV_Cod            AS idEstado,
    ev.EV_Nombre           AS estado,
    v.Pa_Imagen_Voucher    AS imagen
  FROM T_Voucher v
  LEFT JOIN T_Metodo_Pago     mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher  ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = p_idPedido
  ORDER BY v.PK_Pa_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_voucher_listar_por_pedido_detalle
DROP PROCEDURE IF EXISTS `sp_voucher_listar_por_pedido_detalle`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_por_pedido_detalle"(
  IN pPedidoId INT,
  IN p_fecha_hora DATETIME
)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS Codigo,
    IFNULL(v.Pa_Fecha, DATE(COALESCE(p_fecha_hora, NOW()))) AS Fecha,
    v.Pa_Monto_Depositado  AS Monto,
    mp.MP_Nombre           AS MetodoPago,
    v.Pa_Imagen_Voucher    AS Link
  FROM T_Voucher v
  JOIN T_Metodo_Pago mp    ON mp.PK_MP_Cod = v.FK_MP_Cod
  JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = pPedidoId
  ORDER BY v.PK_Pa_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_voucher_listar_ultimos_por_estado
DROP PROCEDURE IF EXISTS `sp_voucher_listar_ultimos_por_estado`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_listar_ultimos_por_estado"(IN p_idEstado INT)
BEGIN
  /* último voucher por pedido */
  WITH ult AS (
    SELECT
      v.FK_P_Cod              AS idPedido,
      MAX(v.PK_Pa_Cod)        AS idVoucherUlt
    FROM T_Voucher v
    GROUP BY v.FK_P_Cod
  )
  SELECT
    p.PK_P_Cod               AS idPedido,
    v.PK_Pa_Cod              AS idVoucher,
    v.Pa_Monto_Depositado    AS monto,
    v.FK_MP_Cod              AS idMetodoPago,
    mp.MP_Nombre             AS metodoPago,
    v.FK_EV_Cod              AS idEstado,
    ev.EV_Nombre             AS estado
  FROM ult
  JOIN T_Voucher v           ON v.PK_Pa_Cod = ult.idVoucherUlt
  JOIN T_Pedido  p           ON p.PK_P_Cod  = ult.idPedido
  LEFT JOIN T_Metodo_Pago mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_EV_Cod = p_idEstado
  ORDER BY p.PK_P_Cod DESC;
END;;
DELIMITER ;

-- Procedure: sp_voucher_obtener_por_pedido
DROP PROCEDURE IF EXISTS `sp_voucher_obtener_por_pedido`;
DELIMITER ;;
CREATE DEFINER="avnadmin"@"%" PROCEDURE "sp_voucher_obtener_por_pedido"(IN p_idPedido INT)
BEGIN
  SELECT
    v.PK_Pa_Cod            AS idVoucher,
    v.FK_P_Cod             AS idPedido,
    v.Pa_Monto_Depositado  AS monto,
    v.FK_MP_Cod            AS idMetodoPago,
    mp.MP_Nombre           AS metodoPago,
    v.FK_EV_Cod            AS idEstado,
    ev.EV_Nombre           AS estado,
    v.Pa_Imagen_Voucher    AS imagen
  FROM T_Voucher v
  LEFT JOIN T_Metodo_Pago     mp ON mp.PK_MP_Cod = v.FK_MP_Cod
  LEFT JOIN T_Estado_voucher  ev ON ev.PK_EV_Cod = v.FK_EV_Cod
  WHERE v.FK_P_Cod = p_idPedido
    AND v.PK_Pa_Cod = (
      SELECT MAX(v2.PK_Pa_Cod) FROM T_Voucher v2 WHERE v2.FK_P_Cod = p_idPedido
    );
END;;
DELIMITER ;
