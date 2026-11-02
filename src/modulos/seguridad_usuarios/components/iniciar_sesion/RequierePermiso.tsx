import Alert from '@mui/material/Alert';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/iniciar_sesion/useAuth';

interface Props {
  /** Con una lista basta con tener uno de los permisos. */
  permiso: string | string[];
  /** Texto propio del caso de uso (ej. CU05 2a); si no se indica, el genérico. */
  mensaje?: string;
}

/** Deja pasar solo si el usuario tiene el permiso indicado (ej: USUARIO_GESTIONAR) o alguno de la lista. */
export default function RequierePermiso({ permiso, mensaje = 'No tienes permiso para acceder a esta sección.' }: Props) {
  const { tienePermiso } = useAuth();

  const permisos = Array.isArray(permiso) ? permiso : [permiso];
  if (!permisos.some(tienePermiso)) {
    return <Alert severity="error">{mensaje}</Alert>;
  }

  return <Outlet />;
}
