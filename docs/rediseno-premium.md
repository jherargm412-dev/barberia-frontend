# Rediseño Premium — HOUSE of CUT

Fecha: 15 de octubre de 2026. Alcance: frontend existente sobre feature/CU21-caja, con cambios locales previos conservados.

## Resultado
Tema global de MUI con modo oscuro inicial, preferencia persistente y modo claro conservado. Paleta oscura: fondo #0B0B0D, navegación #141416, paneles #1C1C1F, elevación #252529 y dorado #C9A45C. El modo claro utiliza un dorado más oscuro para mantener contraste sobre blanco. Inter se usa si el dispositivo la tiene instalada; Segoe UI y Arial son alternativas locales sin dependencia externa.

Sidebar de 280 px, elementos compactos, subniveles indentados, indicador lateral dorado, iconos uniformes, grupos que siguen la ruta actual y Drawer móvil con cierre explícito. Se conservan nombres, orden, rutas y permisos. Navbar de 72 px con identidad, rol, cambio de tema y salida.

Inicio muestra cuatro indicadores, próximas citas de hoy y accesos permitidos. Los módulos comparten superficies, tipografía, tablas, campos, diálogos y estados interactivos mediante el tema. Se ajustaron explícitamente citas, agenda, horarios, caja, perfil y estados vacíos de listados.

## Fuente de los indicadores
- Se reutiliza listarAgenda, sin cambiar su endpoint ni su implementación.
- Citas programadas: cantidad de reservas registradas para el día, incluidos sus distintos estados.
- Atendidos: clientes únicos con al menos una cita ATENDIDA en el día.
- Pendientes: citas con estado PENDIENTE del día.
- Ingresos: Datos no disponibles. La API actual no proporciona un total diario consolidado; el saldo o ingresos de una caja abierta no son equivalentes a los ingresos del día.
- Próximas: hasta cinco reservas de hoy PENDIENTE o CONFIRMADA, desde la hora actual, ordenadas por hora e identificador.
- Un barbero solo ve el alcance de su agenda permitido por la API. Sin permiso no se consulta la agenda. Un error o fuente inexistente se muestra como información no disponible, nunca como un cero.
- Fecha y hora: America/La_Paz. El reloj se actualiza cada minuto y vuelve a consultar al cambiar el día.
- Carga con Skeleton, errores con reintento y estados vacíos informativos. El botón Actualizar vuelve a consultar la agenda; no se añade sondeo de red continuo.

## Componentes nuevos
- EmptyState: presentación común para ausencia de resultados.
- MetricCard: indicador con carga y ausencia explícita de datos.
- resumenInicio.ts: funciones de fecha y resumen comprobables sin React.

## Dependencias
Ninguna. Se mantienen React, TypeScript, Vite, Material UI, Emotion, React Router y Axios. No se incorporan Tailwind, shadcn, fuentes remotas ni bibliotecas de animación.

## Verificación ejecutada
- npm run build: correcto, incluye TypeScript.
- npm run lint: correcto.
- git diff --check: correcto.
- Diez aserciones de resumenInicio: límites de fecha en Bolivia, medianoche, ausencia de datos, ceros reales, clientes únicos, estados, fecha de jornada, orden y límite de próximas citas.
- Renderizado React del layout con MemoryRouter y contexto de sesión: navegación, ancho, ruta seleccionada, todos los grupos y visibilidad de agenda propia y restricciones por permisos.
- API local autenticada de agenda: HTTP 200 y lista vacía real.
- Frontend local: HTTP 200.
- Revisión de código de hover, foco, pulsación, carga, vacío, transiciones de 150 ms y preferencia de movimiento reducido. El cambio de tema mantiene disableTransitionOnChange.

## Pendientes y límites
- Not verified: recorrido visual en navegador, escritorio, tablet y móvil; no hay navegador conectado disponible en esta sesión.
- Not verified: reproducción de animaciones al 10%, interacción por teclado real y persistencia visual del tema después de recargar.
- Not verified: operaciones reales de guardar, editar, cancelar, abrir/cerrar caja y formularios en todos los roles. Se preservó su lógica, pero no se ejecutaron transacciones para este rediseño.
- Not verified: indicadores con citas reales de varios estados en la base local; el cálculo se comprobó con casos de prueba aislados, sin insertar datos ficticios.
- Vite conserva advertencia de tamaño: paquete principal aproximado de 866 kB (265 kB gzip).
- El rediseño está local; no se hizo commit, push ni despliegue.
- No se editaron backend, base de datos, endpoints, autenticación, permisos, rutas ni reglas de negocio.

## Revisión better-ui
Principio: superficies, iconografía y estados consistentes.

| Severity | Location | Before | After | Why |
| --- | --- | --- | --- | --- |
| MEDIUM | src/app/theme.ts:4 | Neutros sin identidad de marca y estilos incompletos | Tokens de marca y personalización global | Superficies y estados consistentes facilitan leer y operar todos los módulos |
| MEDIUM | src/shared/layouts/MainLayout.tsx:35 | Menú estrecho y grupos que solo se abrían desde el propio menú | Ancho 280, indicador y sincronización con la ruta | Jerarquía visual y selección accesible |
| MEDIUM | src/shared/pages/InicioPage.tsx:24 | Bienvenida sin información operativa | Indicadores reales, carga, error y ausencia de datos | El estado no depende de animaciones ni de cifras inventadas |
| LOW | src/shared/components/EmptyState.tsx:8 | Mensajes vacíos aislados | Presentación reutilizable | Consistencia entre los listados |

Approve: revisión de código y verificaciones indicadas; esta aprobación no cubre los estados visuales o interacciones marcados Not verified.

## Archivos modificados en esta fase
- src/app/App.tsx
- src/app/theme.ts
- src/modulos/gestion_clientes/pages/gestionar_clientes/ClientesListPage.tsx
- src/modulos/gestion_empleados/components/gestionar_barberos/EmpleadosTabla.tsx
- src/modulos/seguridad_usuarios/components/consultar_bitacora/BitacoraTabla.tsx
- src/modulos/seguridad_usuarios/components/gestionar_roles_permisos/RolesTabla.tsx
- src/modulos/seguridad_usuarios/components/gestionar_usuarios/UsuariosTabla.tsx
- src/modulos/seguridad_usuarios/pages/configurar_perfil/PerfilPage.tsx
- src/modulos/seguridad_usuarios/pages/iniciar_sesion/LoginPage.tsx
- src/modulos/servicios_reservas/components/consultar_agenda/AgendaFiltros.tsx
- src/modulos/servicios_reservas/components/consultar_agenda/CitaTarjeta.tsx
- src/modulos/servicios_reservas/components/gestionar_catalogo_servicios/ServiciosTabla.tsx
- src/modulos/servicios_reservas/components/gestionar_citas/CitaForm.tsx
- src/modulos/servicios_reservas/components/gestionar_citas/CitasFiltros.tsx
- src/modulos/servicios_reservas/components/gestionar_citas/CitasTabla.tsx
- src/modulos/servicios_reservas/components/gestionar_horarios/BarberosHorarioTabla.tsx
- src/modulos/servicios_reservas/components/gestionar_horarios/HorarioSemanalForm.tsx
- src/modulos/servicios_reservas/components/gestionar_horarios/HorariosFiltros.tsx
- src/modulos/servicios_reservas/pages/consultar_agenda/AgendaPage.tsx
- src/modulos/servicios_reservas/pages/gestionar_citas/CitaCrearPage.tsx
- src/modulos/servicios_reservas/pages/gestionar_citas/CitasListPage.tsx
- src/modulos/servicios_reservas/pages/gestionar_horarios/HorarioDetallePage.tsx
- src/modulos/servicios_reservas/pages/gestionar_horarios/HorarioEditarPage.tsx
- src/modulos/servicios_reservas/pages/gestionar_horarios/HorariosListPage.tsx
- src/modulos/ventas_caja/pages/gestionar_caja/CajaPage.tsx
- src/shared/components/PersonIdentity.tsx
- src/shared/layouts/MainLayout.tsx
- src/shared/pages/InicioPage.tsx

## Archivos nuevos en esta fase
- src/shared/components/EmptyState.tsx
- src/shared/components/MetricCard.tsx
- src/shared/utils/resumenInicio.ts

## Corrección de tablas en móvil
Se añadió src/shared/components/ResponsiveTable.tsx y se aplicó a Clientes, Empleados, Usuarios, Roles, Bitácora, Citas, Barberos/Horarios, Calendario semanal, Excepciones, Citas afectadas, Formulario semanal, Movimientos de caja y Próximas citas de Inicio.

Por debajo de 600 px cada fila se presenta como ficha con etiquetas y todos sus campos. Desde 600 px se conserva la tabla. No hay listas duplicadas de controles: son los mismos elementos React con sus eventos, permisos y paginación originales. Los fragmentos de campos y celdas agrupadas con colSpan conservan las etiquetas correctas. Los encabezados se mantienen para tecnologías de asistencia. Servicios conserva sus tarjetas móviles específicas.

Verificado: TypeScript/build, ESLint, diff --check y renderizado React de campos, fragmentos, colSpan, controles, acciones y vacío. Not verified: inspección visual e interacción táctil/teclado en navegador real, no disponible en esta sesión.

Approve: alcance de código y renderizado descrito; revisión visual pendiente.
