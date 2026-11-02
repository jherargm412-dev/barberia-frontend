// API pública del módulo servicios_reservas (backend: modulos.servicios_reservas).
// El resto de la app importa SOLO desde aquí. Estructura: ver ../README.md

// CU08 Gestionar Catálogo de Servicios
export { default as ServiciosListPage } from './pages/gestionar_catalogo_servicios/ServiciosListPage';
export { default as ServicioCrearPage } from './pages/gestionar_catalogo_servicios/ServicioCrearPage';
export { default as ServicioEditarPage } from './pages/gestionar_catalogo_servicios/ServicioEditarPage';
export { PERMISOS as PERMISOS_SERVICIOS } from './constants/gestionar_catalogo_servicios';
// Para reservas y ventas: servicios habilitados (sin porcentaje de comisión).
export { listarServiciosHabilitados } from './api/gestionar_catalogo_servicios/serviciosApi';
export type { ServicioResumen } from './types/gestionar_catalogo_servicios';

// CU11 Gestionar Cita (Recepcionista)
export { default as CitasListPage } from './pages/gestionar_citas/CitasListPage';
export { default as CitaCrearPage } from './pages/gestionar_citas/CitaCrearPage';
export { PERMISOS as PERMISOS_CITAS } from './constants/gestionar_citas';
export { listarBarberos } from './api/gestionar_citas/citasApi';
export type { BarberoDisponible } from './types/gestionar_citas';

// CU10 Consultar Disponibilidad
export { default as DisponibilidadPage } from './pages/consultar_disponibilidad/DisponibilidadPage';
export { PERMISOS as PERMISOS_DISPONIBILIDAD } from './constants/consultar_disponibilidad';
// Para CU12 (Solicitar Cita): la misma consulta y la grilla de horas libres.
export { consultarDisponibilidad } from './api/consultar_disponibilidad/disponibilidadApi';
export { default as HorasLibresGrid } from './components/consultar_disponibilidad/HorasLibresGrid';
export type { Disponibilidad, HoraLibre, HorarioDisponible } from './types/consultar_disponibilidad';

// CU09 Gestionar Horarios de Disponibilidad
export { default as HorariosListPage } from './pages/gestionar_horarios/HorariosListPage';
export { default as HorarioDetallePage } from './pages/gestionar_horarios/HorarioDetallePage';
export { default as HorarioEditarPage } from './pages/gestionar_horarios/HorarioEditarPage';
export { PERMISOS as PERMISOS_HORARIOS, MENSAJES as MENSAJES_HORARIOS } from './constants/gestionar_horarios';

// CU16 Consultar Agenda de Citas (Barbero, Recepcionista, Administrador)
export { default as AgendaPage } from './pages/consultar_agenda/AgendaPage';
export { PERMISOS_AGENDA } from './constants/consultar_agenda';

// CU13 Consultar Servicios (catálogo público, sin sesión)
export { default as ConsultarServiciosPage } from './pages/consultar_servicios/ConsultarServiciosPage';
export { default as PortadaPage } from './pages/consultar_servicios/PortadaPage';
export { default as ReservarServicioPage } from './pages/consultar_servicios/ReservarServicioPage';


// CU12 Solicitar Cita (Cliente)
export { default as SolicitarCitaPage } from './pages/solicitar_cita/SolicitarCitaPage';
export { default as MisCitasPage } from './pages/solicitar_cita/MisCitasPage';
export { default as ReservaInvitadoPage } from './pages/solicitar_cita/ReservaInvitadoPage';
export { default as CitaInvitadoPage } from './pages/solicitar_cita/CitaInvitadoPage';
export { PERMISOS_SOLICITUD } from './constants/solicitar_cita';

// CU14 Registrar Pago de Anticipo (flujo web del Cliente)
export { default as PagoAnticipoPage } from './pages/registrar_pago_anticipo/PagoAnticipoPage';
export { PERMISOS_ANTICIPO } from './constants/registrar_pago_anticipo';