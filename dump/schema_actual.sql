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

CREATE TABLE "T_Contrato" (
  "PK_Cont_Cod" int NOT NULL AUTO_INCREMENT,
  "Cont_Link" varchar(255) DEFAULT NULL,
  "FK_P_Cod" int NOT NULL,
  PRIMARY KEY ("PK_Cont_Cod"),
  KEY "FK_T_Contrato_T_Pedido" ("FK_P_Cod"),
  CONSTRAINT "FK_T_Contrato_T_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

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

CREATE TABLE "T_Estado_Cliente" (
  "PK_ECli_Cod" int NOT NULL AUTO_INCREMENT,
  "ECli_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ECli_Cod")
);

CREATE TABLE "T_Estado_Cotizacion" (
  "PK_ECot_Cod" int NOT NULL AUTO_INCREMENT,
  "ECot_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ECot_Cod")
);

CREATE TABLE "T_Estado_Empleado" (
  "PK_Estado_Emp_Cod" tinyint unsigned NOT NULL,
  "EsEm_Nombre" varchar(20) NOT NULL,
  PRIMARY KEY ("PK_Estado_Emp_Cod"),
  UNIQUE KEY "EsEm_Nombre" ("EsEm_Nombre")
);

CREATE TABLE "T_Estado_Equipo" (
  "PK_EE_Cod" int NOT NULL AUTO_INCREMENT,
  "EE_Nombre" varchar(40) NOT NULL,
  PRIMARY KEY ("PK_EE_Cod"),
  UNIQUE KEY "uq_estado_nombre" ("EE_Nombre")
);

CREATE TABLE "T_Estado_Pago" (
  "PK_ESP_Cod" int NOT NULL AUTO_INCREMENT,
  "ESP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_ESP_Cod")
);

CREATE TABLE "T_Estado_Pedido" (
  "PK_EP_Cod" int NOT NULL AUTO_INCREMENT,
  "EP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_EP_Cod")
);

CREATE TABLE "T_Estado_Proyecto" (
  "PK_EPro_Cod" tinyint unsigned NOT NULL AUTO_INCREMENT,
  "EPro_Nombre" varchar(30) NOT NULL,
  "EPro_Orden" tinyint unsigned NOT NULL DEFAULT '1',
  "Activo" tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_EPro_Cod"),
  UNIQUE KEY "uq_estado_proyecto_nombre" ("EPro_Nombre")
);

CREATE TABLE "T_Estado_voucher" (
  "PK_EV_Cod" int NOT NULL AUTO_INCREMENT,
  "EV_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_EV_Cod")
);

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

CREATE TABLE "T_EventoServicioCategoria" (
  "PK_ESC_Cod" int NOT NULL AUTO_INCREMENT,
  "ESC_Nombre" varchar(60) NOT NULL,
  "ESC_Tipo" enum('PAQUETE','ADDON') NOT NULL DEFAULT 'PAQUETE',
  "ESC_Activo" tinyint(1) NOT NULL DEFAULT '1',
  "ESC_Fecha_Creacion" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_ESC_Cod"),
  UNIQUE KEY "ESC_Nombre" ("ESC_Nombre")
);

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

CREATE TABLE "T_EventoServicioEstado" (
  "PK_ESE_Cod" int NOT NULL AUTO_INCREMENT,
  "ESE_Nombre" varchar(25) NOT NULL,
  PRIMARY KEY ("PK_ESE_Cod")
);

CREATE TABLE "T_EventoServicioStaff" (
  "PK_ExS_Staff_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_ExS_Cod" int NOT NULL,
  "Staff_Rol" varchar(40) NOT NULL,
  "Staff_Cantidad" smallint unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY ("PK_ExS_Staff_Cod"),
  KEY "fk_exs_staff_exs" ("FK_ExS_Cod"),
  CONSTRAINT "fk_exs_staff_exs" FOREIGN KEY ("FK_ExS_Cod") REFERENCES "T_EventoServicio" ("PK_ExS_Cod") ON DELETE CASCADE
);

CREATE TABLE "T_Eventos" (
  "PK_E_Cod" int NOT NULL AUTO_INCREMENT,
  "E_Nombre" varchar(25) NOT NULL,
  "E_IconUrl" varchar(500) DEFAULT NULL,
  "E_MostrarPortafolio" tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY ("PK_E_Cod"),
  UNIQUE KEY "uq_eventos_nombre" ("E_Nombre")
);

CREATE TABLE "T_Lead" (
  "PK_Lead_Cod" int NOT NULL AUTO_INCREMENT,
  "Lead_Nombre" varchar(80) NOT NULL,
  "Lead_Celular" varchar(30) DEFAULT NULL,
  "Lead_Origen" varchar(40) DEFAULT NULL,
  "Lead_Fecha_Crea" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_Lead_Cod")
);

CREATE TABLE "T_Marca" (
  "PK_IMa_Cod" int NOT NULL AUTO_INCREMENT,
  "NMa_Nombre" varchar(100) NOT NULL,
  PRIMARY KEY ("PK_IMa_Cod"),
  UNIQUE KEY "uq_marca_nombre" ("NMa_Nombre")
);

CREATE TABLE "T_Metodo_Pago" (
  "PK_MP_Cod" int NOT NULL AUTO_INCREMENT,
  "MP_Nombre" varchar(25) DEFAULT NULL,
  PRIMARY KEY ("PK_MP_Cod")
);

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
  PRIMARY KEY ("PK_Pro_Cod"),
  UNIQUE KEY "ux_proyecto_pedido" ("FK_P_Cod"),
  KEY "fk_proyecto_responsable" ("FK_Em_Cod"),
  KEY "fk_proyecto_estado" ("Pro_Estado"),
  CONSTRAINT "fk_proyecto_estado" FOREIGN KEY ("Pro_Estado") REFERENCES "T_Estado_Proyecto" ("PK_EPro_Cod"),
  CONSTRAINT "fk_proyecto_responsable" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "FK_T_Proyecto_T_Pedido" FOREIGN KEY ("FK_P_Cod") REFERENCES "T_Pedido" ("PK_P_Cod")
);

CREATE TABLE "T_ProyectoDia" (
  "PK_PD_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_Pro_Cod" int NOT NULL,
  "PD_Fecha" date NOT NULL,
  "PD_Hora" time DEFAULT NULL,
  "PD_Ubicacion" varchar(100) DEFAULT NULL,
  "PD_Direccion" varchar(150) DEFAULT NULL,
  "PD_Notas" varchar(255) DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PD_Cod"),
  UNIQUE KEY "uq_proyecto_dia" ("FK_Pro_Cod","PD_Fecha"),
  KEY "ix_proyecto_dia_fecha" ("PD_Fecha"),
  CONSTRAINT "fk_proyecto_dia_proyecto" FOREIGN KEY ("FK_Pro_Cod") REFERENCES "T_Proyecto" ("PK_Pro_Cod")
);

CREATE TABLE "T_ProyectoDiaEmpleado" (
  "PK_PDE_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "FK_Em_Cod" int NOT NULL,
  "PDE_Estado" varchar(20) NOT NULL DEFAULT 'Confirmado',
  "PDE_Notas" varchar(255) DEFAULT NULL,
  "created_at" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("PK_PDE_Cod"),
  UNIQUE KEY "uq_pd_empleado" ("FK_PD_Cod","FK_Em_Cod"),
  KEY "ix_pde_empleado" ("FK_Em_Cod"),
  CONSTRAINT "fk_pde_empleado" FOREIGN KEY ("FK_Em_Cod") REFERENCES "T_Empleados" ("PK_Em_Cod"),
  CONSTRAINT "fk_pde_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE
);

CREATE TABLE "T_ProyectoDiaEquipo" (
  "PK_PDQ_Cod" int NOT NULL AUTO_INCREMENT,
  "FK_PD_Cod" int NOT NULL,
  "FK_Eq_Cod" int NOT NULL,
  "PDQ_Estado" varchar(20) NOT NULL DEFAULT 'Confirmado',
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
  CONSTRAINT "fk_pdq_equipo" FOREIGN KEY ("FK_Eq_Cod") REFERENCES "T_Equipo" ("PK_Eq_Cod"),
  CONSTRAINT "fk_pdq_pd" FOREIGN KEY ("FK_PD_Cod") REFERENCES "T_ProyectoDia" ("PK_PD_Cod") ON DELETE CASCADE,
  CONSTRAINT "fk_pdq_usuario_devolucion" FOREIGN KEY ("PDQ_Usuario_Devolucion") REFERENCES "T_Usuario" ("PK_U_Cod")
);

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

CREATE TABLE "T_Servicios" (
  "PK_S_Cod" int NOT NULL AUTO_INCREMENT,
  "S_Nombre" varchar(25) NOT NULL,
  PRIMARY KEY ("PK_S_Cod"),
  UNIQUE KEY "uq_servicios_nombre" ("S_Nombre")
);

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

CREATE TABLE "T_Tipo_Empleado" (
  "PK_Tipo_Emp_Cod" int NOT NULL AUTO_INCREMENT,
  "TiEm_Cargo" varchar(25) DEFAULT NULL,
  "TiEm_PermiteLogin" tinyint(1) NOT NULL DEFAULT '0',
  "TiEm_OperativoCampo" tinyint(1) DEFAULT '0',
  PRIMARY KEY ("PK_Tipo_Emp_Cod")
);

CREATE TABLE "T_Tipo_Equipo" (
  "PK_TE_Cod" int NOT NULL AUTO_INCREMENT,
  "TE_Nombre" varchar(60) NOT NULL,
  PRIMARY KEY ("PK_TE_Cod"),
  UNIQUE KEY "uq_tipo_nombre" ("TE_Nombre")
);

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

