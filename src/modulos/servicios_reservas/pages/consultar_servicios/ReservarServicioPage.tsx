import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { rutaParaReservar } from '../../utils/consultar_servicios/reservar';

/**
 * CU13 paso 3 después del login: quien eligió "Reservar" sin sesión vuelve aquí ya autenticado y se lo envía a
 * CU12 o CU11 según su rol. Si no puede agendar, vuelve al catálogo.
 */
export default function ReservarServicioPage() {
  const { tienePermiso } = useAuth();
  const idServicio = Number(useSearchParams()[0].get('servicio'));
  const destino = idServicio ? rutaParaReservar(idServicio, tienePermiso) : null;
  return <Navigate to={destino ?? '/catalogo'} replace />;
}
