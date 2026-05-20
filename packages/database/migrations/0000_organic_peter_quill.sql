CREATE TABLE `animales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`nombre` text(100) DEFAULT '',
	`fecha_nacimiento` integer,
	`fecha_compra` integer,
	`sexo_key` integer DEFAULT 0,
	`tipo_ingreso_id` integer DEFAULT 0,
	`madre_id` integer,
	`codigo_madre` text DEFAULT '',
	`ind_transferencia_embriones` integer DEFAULT 0,
	`codigo_donadora` text DEFAULT '',
	`tipo_padre_key` integer DEFAULT 0,
	`padre_id` integer,
	`codigo_padre` text DEFAULT '',
	`codigo_pajuela` text DEFAULT '',
	`config_razas_id` integer,
	`potrero_id` integer,
	`precio_compra` real DEFAULT 0,
	`peso_compra` real DEFAULT 0,
	`codigo_rfid` text DEFAULT '',
	`codigo_arete` text DEFAULT '',
	`codigo_qr` text DEFAULT '',
	`salud_animal_key` integer DEFAULT 0,
	`estado_animal_key` integer DEFAULT 0,
	`ind_descartado` integer DEFAULT 0,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`madre_id`) REFERENCES `animales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`padre_id`) REFERENCES `animales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_animales_predio_activo` ON `animales` (`predio_id`,`activo`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_animales_predio_codigo` ON `animales` (`predio_id`,`codigo`);--> statement-breakpoint
CREATE TABLE `animales_imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`animal_id` integer NOT NULL,
	`imagen_id` integer NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`animal_id`) REFERENCES `animales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`imagen_id`) REFERENCES `imagenes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_animales_imagenes` ON `animales_imagenes` (`animal_id`,`imagen_id`);--> statement-breakpoint
CREATE TABLE `causas_muerte` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_calidad_animal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_colores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(50) NOT NULL,
	`codigo` text(20),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_condiciones_corporales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`valor_min` integer DEFAULT 1,
	`valor_max` integer DEFAULT 5,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_key_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`opcion` text(50) NOT NULL,
	`key` text(100) NOT NULL,
	`value` text,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_config_key_values` ON `config_key_values` (`opcion`,`key`);--> statement-breakpoint
CREATE TABLE `config_parametros_predio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(50) NOT NULL,
	`valor` text,
	`descripcion` text,
	`created_at` integer,
	`updated_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_parametros_predio_codigo` ON `config_parametros_predio` (`predio_id`,`codigo`);--> statement-breakpoint
CREATE TABLE `config_rangos_edades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`rango1` integer NOT NULL,
	`rango2` integer NOT NULL,
	`sexo` integer DEFAULT 0,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_razas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`origen` text(100),
	`tipo_produccion` text(50),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `config_tipos_explotacion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `diagnosticos_veterinarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`categoria` text(50),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `grupos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `hierros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`ruta` text NOT NULL,
	`nombre_original` text(255),
	`mime_type` text(50),
	`tamano_bytes` integer,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `lotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`tipo` text(50) DEFAULT 'producción',
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lugares_compras` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`tipo` text(50),
	`ubicacion` text,
	`contacto` text,
	`telefono` text(20),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `lugares_ventas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`tipo` text(50),
	`ubicacion` text,
	`contacto` text,
	`telefono` text(20),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `motivos_ventas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `notificaciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`usuario_id` integer,
	`tipo` text(50) NOT NULL,
	`titulo` text(200) NOT NULL,
	`mensaje` text NOT NULL,
	`entidad_tipo` text(50),
	`entidad_id` integer,
	`leida` integer DEFAULT 0,
	`fecha_evento` integer,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notificaciones_preferencias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`tipo` text(50) NOT NULL,
	`canal_inapp` integer DEFAULT 1,
	`canal_email` integer DEFAULT 1,
	`canal_push` integer DEFAULT 0,
	`dias_anticipacion` integer DEFAULT 7,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_notificaciones_preferencias` ON `notificaciones_preferencias` (`usuario_id`,`tipo`);--> statement-breakpoint
CREATE TABLE `notificaciones_push_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`token` text(500) NOT NULL,
	`plataforma` text(20) NOT NULL,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_notificaciones_push_tokens` ON `notificaciones_push_tokens` (`usuario_id`,`token`);--> statement-breakpoint
CREATE TABLE `potreros` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`nombre` text(100) NOT NULL,
	`area_hectareas` real DEFAULT 0,
	`tipo_pasto` text(100),
	`capacidad_maxima` integer DEFAULT 0,
	`estado` text(20) DEFAULT 'activo',
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_potreros_predio_codigo` ON `potreros` (`predio_id`,`codigo`);--> statement-breakpoint
CREATE TABLE `predios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`codigo` text(20) NOT NULL,
	`nombre` text(100) NOT NULL,
	`departamento` text(100),
	`municipio` text(100),
	`vereda` text(100),
	`area_hectareas` real DEFAULT 0,
	`capacidad_maxima` integer DEFAULT 0,
	`tipo_explotacion_id` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`nombre` text(100) NOT NULL,
	`descripcion` text,
	`tipo_producto` text(50),
	`categoria` text(100),
	`presentacion` text(50),
	`unidad_medida` text(20),
	`precio_unitario` real DEFAULT 0,
	`stock_minimo` real DEFAULT 0,
	`stock_actual` real DEFAULT 0,
	`fecha_vencimiento` integer,
	`laboratorio` text(100),
	`registro_invima` text(50),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_productos_predio_codigo` ON `productos` (`predio_id`,`codigo`);--> statement-breakpoint
CREATE TABLE `productos_imagenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`imagen_id` integer NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_productos_imagenes` ON `productos_imagenes` (`producto_id`,`imagen_id`);--> statement-breakpoint
CREATE TABLE `propietarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`nombre` text(100) NOT NULL,
	`tipo_documento` text(20),
	`numero_documento` text(50),
	`telefono` text(20),
	`email` text(100),
	`direccion` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reportes_exportaciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text(50) NOT NULL,
	`formato` text(10) NOT NULL,
	`estado` text(20) DEFAULT 'pendiente' NOT NULL,
	`ruta_archivo` text,
	`parametros` text,
	`predio_id` integer NOT NULL,
	`usuario_id` integer NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `idx_reportes_exportaciones_predio_activo` ON `reportes_exportaciones` (`predio_id`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_reportes_exportaciones_usuario_activo` ON `reportes_exportaciones` (`usuario_id`,`activo`);--> statement-breakpoint
CREATE INDEX `idx_reportes_exportaciones_estado` ON `reportes_exportaciones` (`estado`);--> statement-breakpoint
CREATE TABLE `roles_permisos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`rol_id` integer NOT NULL,
	`permiso_id` integer NOT NULL,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`rol_id`) REFERENCES `usuarios_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permiso_id`) REFERENCES `usuarios_permisos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_roles_permisos` ON `roles_permisos` (`rol_id`,`permiso_id`);--> statement-breakpoint
CREATE TABLE `sectores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`nombre` text(100) NOT NULL,
	`area_hectareas` real DEFAULT 0,
	`tipo_pasto` text(100),
	`capacidad_maxima` integer DEFAULT 0,
	`estado` text(20) DEFAULT 'activo',
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_sectores_predio_codigo` ON `sectores` (`predio_id`,`codigo`);--> statement-breakpoint
CREATE TABLE `servicios_inseminacion_animales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inseminacion_grupal_id` integer NOT NULL,
	`animal_id` integer NOT NULL,
	`veterinario_id` integer,
	`fecha` integer NOT NULL,
	`tipo_inseminacion_key` integer DEFAULT 0,
	`codigo_pajuela` text DEFAULT '',
	`diagnostico_id` integer,
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`inseminacion_grupal_id`) REFERENCES `servicios_inseminacion_grupal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `servicios_inseminacion_grupal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`fecha` integer NOT NULL,
	`veterinarios_id` integer,
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `servicios_palpaciones_animales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`palpacion_grupal_id` integer NOT NULL,
	`animal_id` integer NOT NULL,
	`veterinario_id` integer,
	`diagnostico_id` integer,
	`condicion_corporal_id` integer,
	`fecha` integer NOT NULL,
	`dias_gestacion` integer,
	`fecha_parto` integer,
	`comentarios` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`palpacion_grupal_id`) REFERENCES `servicios_palpaciones_grupal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `servicios_palpaciones_grupal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`fecha` integer NOT NULL,
	`veterinarios_id` integer,
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `servicios_partos_animales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`animal_id` integer NOT NULL,
	`fecha` integer NOT NULL,
	`macho` integer DEFAULT 0,
	`hembra` integer DEFAULT 0,
	`muertos` integer DEFAULT 0,
	`peso` real,
	`tipo_parto_key` integer DEFAULT 0,
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `servicios_partos_crias` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`parto_id` integer NOT NULL,
	`cria_id` integer,
	`sexo_key` integer DEFAULT 0,
	`peso_nacimiento` real,
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`parto_id`) REFERENCES `servicios_partos_animales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `servicios_veterinarios_animales` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`servicio_grupal_id` integer NOT NULL,
	`animal_id` integer NOT NULL,
	`veterinario_id` integer,
	`diagnostico_id` integer,
	`fecha` integer NOT NULL,
	`tipo_diagnostico_key` integer DEFAULT 0,
	`tratamiento` text,
	`medicamentos` text,
	`dosis` text,
	`comentarios` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`servicio_grupal_id`) REFERENCES `servicios_veterinarios_grupal`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `servicios_veterinarios_grupal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`codigo` text(20) NOT NULL,
	`fecha` integer NOT NULL,
	`veterinarios_id` integer,
	`tipo_servicio` text(100),
	`observaciones` text,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `servicios_veterinarios_productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`servicio_animal_id` integer NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad` real DEFAULT 1,
	`unidad` text(20),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`servicio_animal_id`) REFERENCES `servicios_veterinarios_animales`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(100) NOT NULL,
	`email` text(100) NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE TABLE `usuarios_autenticacion_dos_factores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`metodo` text(20) DEFAULT 'email' NOT NULL,
	`codigo` text(10),
	`fecha_expiracion` integer,
	`intentos_fallidos` integer DEFAULT 0,
	`habilitado` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_autenticacion_dos_factores_usuario_id_unique` ON `usuarios_autenticacion_dos_factores` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `usuarios_contrasena` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`contrasena_hash` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_contrasena_usuario_id_unique` ON `usuarios_contrasena` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `usuarios_historial_contrasenas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`contrasena_hash` text NOT NULL,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuarios_login` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`refresh_token` text,
	`exitoso` integer DEFAULT 0,
	`ip` text(45),
	`user_agent` text,
	`fecha_expiracion` integer,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuarios_permisos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modulo` text(50) NOT NULL,
	`accion` text(50) NOT NULL,
	`nombre` text(100) NOT NULL,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usuarios_predios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`predio_id` integer NOT NULL,
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `usuarios_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text(50) NOT NULL,
	`descripcion` text,
	`es_sistema` integer DEFAULT 0,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usuarios_roles_asignacion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`usuario_id` integer NOT NULL,
	`rol_id` integer NOT NULL,
	`created_at` integer,
	`activo` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`rol_id`) REFERENCES `usuarios_roles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_usuarios_roles` ON `usuarios_roles_asignacion` (`usuario_id`,`rol_id`);--> statement-breakpoint
CREATE TABLE `veterinarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`predio_id` integer NOT NULL,
	`nombre` text(100) NOT NULL,
	`telefono` text(20),
	`email` text(100),
	`direccion` text,
	`numero_registro` text(50),
	`especialidad` text(100),
	`activo` integer DEFAULT 1 NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`predio_id`) REFERENCES `predios`(`id`) ON UPDATE no action ON DELETE no action
);
