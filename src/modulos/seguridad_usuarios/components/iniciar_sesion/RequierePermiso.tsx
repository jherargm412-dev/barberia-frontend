import Alert from '@mui/material/Alert';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

/** Deja pasar solo si el usuario tiene el permiso indicado (ej: USUARIO_GESTIONAR). */
export default function RequierePermiso({ permiso }: { permiso: string }) {
  const { tienePermiso } = useAuth();

  if (!tienePermiso(permiso)) {
    return <Alert severity="error">No tienes permiso para acceder a esta sección.</Alert>;
  }

  return <Outlet />;
}
