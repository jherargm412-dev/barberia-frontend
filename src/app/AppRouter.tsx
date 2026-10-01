import { Route, Routes } from 'react-router-dom';
import {
  BitacoraListPage,
  LoginPage,
  MENSAJES_BITACORA,
  PerfilPage,
  PERMISOS_BITACORA,
  PERMISOS_PERFIL,
  PERMISOS_ROLES,
  PERMISOS_USUARIOS,
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
  PERMISOS_SERVICIOS,
  ServicioCrearPage,
  ServicioEditarPage,
  ServiciosListPage,
} from '../modulos/servicios_reservas';
import {
  EmpleadoCrearPage,
  EmpleadoEditarPage,
  EmpleadosListPage,
  PERMISOS_EMPLEADOS,
} from '../modulos/gestion_empleados';
import MainLayout from '../shared/layouts/MainLayout';
import { ClienteCrearPage, ClienteDetallePage, ClienteEditarPage, ClientesListPage, PERMISOS_CLIENTES } from '../modulos/gestion_clientes';
import InicioPage from '../shared/pages/InicioPage';
import NoEncontradoPage from '../shared/pages/NoEncontradoPage';

/** Todas las rutas de la app en un solo lugar. */
export default function AppRouter() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas: requieren sesión y usan el layout con menú */}
      <Route element={<RutaProtegida />}>
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
        </Route>
      </Route>

      <Route path="*" element={<NoEncontradoPage />} />
    </Routes>
  );
}
