import { Route, Routes } from 'react-router-dom';
import {
  LoginPage,
  PERMISOS_USUARIOS,
  RequierePermiso,
  RutaProtegida,
  UsuarioCrearPage,
  UsuarioDetallePage,
  UsuarioEditarPage,
  UsuariosListPage,
} from '../modulos/seguridad_usuarios';
import MainLayout from '../shared/layouts/MainLayout';
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
        </Route>
      </Route>

      <Route path="*" element={<NoEncontradoPage />} />
    </Routes>
  );
}
