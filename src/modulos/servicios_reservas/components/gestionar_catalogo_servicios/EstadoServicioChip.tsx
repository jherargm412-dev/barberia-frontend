import Chip from '@mui/material/Chip';
import { ESTADOS_SERVICIO } from '../../constants/gestionar_catalogo_servicios';
import type { EstadoServicio } from '../../types/gestionar_catalogo_servicios';

const COLORES = {
  HABILITADO: 'success',
  INHABILITADO: 'default',
} as const;

export default function EstadoServicioChip({ estado }: { estado: EstadoServicio }) {
  const etiqueta = ESTADOS_SERVICIO.find((e) => e.valor === estado)?.etiqueta ?? estado;
  return <Chip label={etiqueta} color={COLORES[estado]} size="small" />;
}
