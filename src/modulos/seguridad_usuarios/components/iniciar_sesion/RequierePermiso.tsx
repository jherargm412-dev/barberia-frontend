import Alert from '@mui/material/Alert';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

interface Props {
  permiso: string;
  /** Texto propio del caso de uso (ej. CU05 2a); si no se indica, el genérico. */
  mensaje?: string;
}

/** Deja pasar solo si el usuario tiene el permiso indicado (ej: USUARIO_GESTIONAR). */
export default function RequierePermiso({ permiso, mensaje = 'No tienes permiso para acceder a esta sección.' }: Props) {
  const { tienePermiso } = useAuth();

  if (!tienePermiso(permiso)) {
    return <Alert severity="error">{mensaje}</Alert>;
  }

  return <Outlet />;
}
