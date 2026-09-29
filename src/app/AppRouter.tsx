import { Route, Routes } from 'react-router-dom';
import {
  BitacoraListPage,
  LoginPage,
  MENSAJES_BITACORA,
  PERMISOS_BITACORA,
  PERMISOS_USUARIOS,
  RequierePermiso,
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
import MainLayout from '../shared/layouts/MainLayout';
import { ClienteCrearPage, ClienteDetallePage, ClienteEditarPage, ClientesListPage, PERMISOS_CLIENTES } from '../modulos/gestion_clientes';
import { BarberoCrearPage, BarberoEditarPage, BarberosListPage, PERMISOS_BARBEROS } from '../modulos/gestion_empleados';
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

          {/* CU16 Gestionar Barberos: USUARIO_GESTIONAR (igual que CU01) */}
          <Route element={<RequierePermiso permiso={PERMISOS_BARBEROS.GESTIONAR} />}>
            <Route path="/barberos" element={<BarberosListPage />} />
            <Route path="/barberos/:id/editar" element={<BarberoEditarPage />} />

            {/* Registrar asigna el rol Barbero: además requiere ROL_ASIGNAR */}
            <Route element={<RequierePermiso permiso={PERMISOS_BARBEROS.ASIGNAR_ROL} />}>
              <Route path="/barberos/nuevo" element={<BarberoCrearPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NoEncontradoPage />} />
    </Routes>
  );
}
