import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

/** Deja pasar solo si hay sesión. Si no, redirige al login. */
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth();
  const ubicacion = useLocation();

  if (cargando) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    // Guardamos a dónde quería ir, para volver ahí después del login.
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />;
  }

  return <Outlet />;
}
