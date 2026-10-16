import { Route, Routes } from 'react-router-dom';
import {
  ActivarCuentaPage,
  BitacoraListPage,
  LoginPage,
  MENSAJES_BITACORA,
  PerfilPage,
  PERMISOS_BITACORA,
  PERMISOS_PERFIL,
  PERMISOS_ROLES,
  PERMISOS_USUARIOS,
  RecuperarContrasenaPage,
  RequierePermiso,
  RolCrearPage,
  RolEditarPage,
  RolesListPage,
  RutaProtegida,
  UsuarioCrearPage,
  UsuarioDetallePage,
  UsuarioEditarPage,
  UsuariosListPage,
} from '../modulos/seguridad_usuarios';
import {
  AgendaPage,
  CitaCrearPage,
  CitasListPage,
  ConsultarServiciosPage,
  PERMISOS_CITAS,
  DisponibilidadPage,
  PERMISOS_DISPONIBILIDAD,
  HorarioDetallePage,
  HorarioEditarPage,
  HorariosListPage,
  MENSAJES_HORARIOS,
  PERMISOS_HORARIOS,
  PERMISOS_SERVICIOS,
  ServicioCrearPage,
  ServicioEditarPage,
  ServiciosListPage,
  PERMISOS_SOLICITUD,
  SolicitarCitaPage,
  PortadaPage,
  ReservarServicioPage,
  ReservaInvitadoPage,
  CitaInvitadoPage,
  MisCitasPage,
  PagoAnticipoPage,
  PERMISOS_ANTICIPO,
} from '../modulos/servicios_reservas';
import {
  EmpleadoCrearPage,
  EmpleadoEditarPage,
  EmpleadosListPage,
  PERMISOS_EMPLEADOS,
} from '../modulos/gestion_empleados';
import MainLayout from '../shared/layouts/MainLayout';
import { ClienteCrearPage, ClienteDetallePage, ClienteEditarPage, ClientesListPage, PERMISOS_CLIENTES } from '../modulos/gestion_clientes';
import { CajaHistorialPage, CajaPage, PERMISOS_CAJA } from '../modulos/ventas_caja';
import InicioPage from '../shared/pages/InicioPage';
import NoEncontradoPage from '../shared/pages/NoEncontradoPage';

/** Todas las rutas de la app en un solo lugar. */
export default function AppRouter() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecuperarContrasenaPage />} />
      <Route path="/activar" element={<ActivarCuentaPage />} />
      {/* CU13 Consultar Servicios: catálogo público, se abre desde el login sin iniciar sesión. */}
      <Route path="/catalogo" element={<ConsultarServiciosPage />} />
      {/* CU12 + CU14 sin cuenta: reservar con nombre y teléfono, y "Mi cita" (enlace secreto) para ver y pagar. */}
      <Route path="/reservar-sin-cuenta" element={<ReservaInvitadoPage />} />
      <Route path="/mi-cita/:codigo" element={<CitaInvitadoPage />} />

      {/* Privadas: requieren sesión y usan el layout con menú. Sin sesión, "/" muestra la portada pública. */}
      <Route element={<RutaProtegida portada={<PortadaPage />} />}>
        {/* CU13 paso 3: tras el login, "Reservar" envía a CU12 (cliente) o CU11 (recepción). */}
        <Route path="/reservar" element={<ReservarServicioPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<InicioPage />} />
          {/* CU06: cada ruta exige el permiso de la operación que presenta. */}
          <Route element={<RequierePermiso permiso={PERMISOS_CLIENTES.CONSULTAR} />}>
            <Route path="/clientes" element={<ClientesListPage />} />
            <Route path="/clientes/:id" element={<ClienteDetallePage />} />
          </Route>
          <Route element={<RequierePermiso permiso={PERMISOS_CLIENTES.CREAR} />}>
            <Route path="/clientes/nuevo" element={<ClienteCrearPage />} />
          </Route>
          <Route element={<RequierePermiso permiso={PERMISOS_CLIENTES.EDITAR} />}>
            <Route path="/clientes/:id/editar" element={<ClienteEditarPage />} />
          </Route>

          {/* Gestión de usuarios: requiere el permiso USUARIO_GESTIONAR */}
          <Route element={<RequierePermiso permiso={PERMISOS_USUARIOS.GESTIONAR} />}>
            <Route path="/usuarios" element={<UsuariosListPage />} />
            <Route path="/usuarios/:id" element={<UsuarioDetallePage />} />

            {/* Crear y editar además requieren ROL_ASIGNAR */}
            <Route element={<RequierePermiso permiso={PERMISOS_USUARIOS.ASIGNAR_ROL} />}>
              <Route path="/usuarios/nuevo" element={<UsuarioCrearPage />} />
              <Route path="/usuarios/:id/editar" element={<UsuarioEditarPage />} />
            </Route>
          </Route>

          {/* CU17 Barberos y empleados: USUARIO_GESTIONAR; registrar además ROL_ASIGNAR (asigna un rol). */}
          <Route element={<RequierePermiso permiso={PERMISOS_EMPLEADOS.GESTIONAR} />}>
            <Route path="/empleados" element={<EmpleadosListPage />} />
            <Route path="/empleados/:id/editar" element={<EmpleadoEditarPage />} />
            <Route element={<RequierePermiso permiso={PERMISOS_EMPLEADOS.REGISTRAR} />}>
              <Route path="/empleados/nuevo" element={<EmpleadoCrearPage />} />
            </Route>
          </Route>

          {/* CU03 Roles y permisos: solo el Administrador (ROL_ASIGNAR). */}
          <Route element={<RequierePermiso permiso={PERMISOS_ROLES.GESTIONAR} />}>
            <Route path="/roles" element={<RolesListPage />} />
            <Route path="/roles/nuevo" element={<RolCrearPage />} />
            <Route path="/roles/:id/editar" element={<RolEditarPage />} />
          </Route>

          {/* CU04 Mi perfil: cualquier usuario con PERFIL_EDITAR (todos los roles en la semilla). */}
          <Route element={<RequierePermiso permiso={PERMISOS_PERFIL.EDITAR} />}>
            <Route path="/perfil" element={<PerfilPage />} />
          </Route>

          {/* CU05 Consultar Bitácora: solo el Administrador (BITACORA_CONSULTAR). Solo lectura. */}
          <Route
            element={<RequierePermiso permiso={PERMISOS_BITACORA.CONSULTAR} mensaje={MENSAJES_BITACORA.SIN_PERMISO} />}
          >
            <Route path="/bitacora" element={<BitacoraListPage />} />
          </Route>

          {/* CU08 Catálogo de servicios: requiere el permiso SERVICIO_GESTIONAR */}
          <Route element={<RequierePermiso permiso={PERMISOS_SERVICIOS.GESTIONAR} />}>
            <Route path="/servicios" element={<ServiciosListPage />} />
            <Route path="/servicios/nuevo" element={<ServicioCrearPage />} />
            <Route path="/servicios/:id/editar" element={<ServicioEditarPage />} />
          </Route>

          {/* CU11 Gestionar Cita: la agenda exige AGENDA_CONSULTAR y agendar, RESERVA_CREAR. */}
          <Route element={<RequierePermiso permiso={PERMISOS_CITAS.AGENDA} />}>
            <Route path="/citas" element={<CitasListPage />} />
          </Route>
          <Route element={<RequierePermiso permiso={PERMISOS_CITAS.CREAR} />}>
            <Route path="/citas/nueva" element={<CitaCrearPage />} />
          </Route>
          
          {/* CU12 Solicitar Cita: solo el cliente (RESERVA_SOLICITAR, migración V14). */}
          <Route element={<RequierePermiso permiso={PERMISOS_SOLICITUD.SOLICITAR} />}>
            <Route path="/solicitar-cita" element={<SolicitarCitaPage />} />
            <Route path="/mis-citas" element={<MisCitasPage />} />
          </Route>

          {/* CU10 Consultar Disponibilidad: para quien agenda (RESERVA_CREAR). */}
          <Route element={<RequierePermiso permiso={PERMISOS_DISPONIBILIDAD.CONSULTAR} />}>
            <Route path="/disponibilidad" element={<DisponibilidadPage />} />
          </Route>

          {/* CU09 Horarios de disponibilidad: USUARIO_GESTIONAR (igual que CU17), con el mensaje de 2a. */}
          <Route
            element={<RequierePermiso permiso={PERMISOS_HORARIOS.GESTIONAR} mensaje={MENSAJES_HORARIOS.SIN_PERMISO} />}
          >
            <Route path="/horarios" element={<HorariosListPage />} />
            <Route path="/horarios/:id" element={<HorarioDetallePage />} />
            <Route path="/horarios/:id/editar" element={<HorarioEditarPage />} />
          </Route>

          {/* CU21 exige consulta para abrir la pantalla; la API valida cada acción. */}
          <Route element={<RequierePermiso permiso={PERMISOS_CAJA.CONSULTAR} />}>
            <Route path="/caja" element={<CajaPage />} />
            <Route path="/caja/historial" element={<CajaHistorialPage />} />
          </Route>

          {/* CU14 Pago web del anticipo: solo el cliente (ANTICIPO_PAGAR_PROPIO, migración V15). */}
          <Route element={<RequierePermiso permiso={PERMISOS_ANTICIPO.PAGAR_PROPIO} />}>
            <Route path="/pagar-anticipo/:id" element={<PagoAnticipoPage />} />
          </Route>

          {/* CU16 Consultar Agenda: AGENDA_CONSULTAR o AGENDA_CONSULTAR_PROPIA; la página valida y muestra el mensaje 2a. */}
          <Route path="/agenda" element={<AgendaPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NoEncontradoPage />} />
    </Routes>
  );
}
