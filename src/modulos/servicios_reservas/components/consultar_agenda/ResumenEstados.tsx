import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { ESTADOS_AGENDA } from '../../constants/consultar_agenda';
import type { EstadoAgenda } from '../../types/consultar_agenda';

interface Props {
  /** Cantidad de citas por estado de la consulta sin filtro de estado. */
  conteo: Partial<Record<EstadoAgenda, number>>;
  total: number;
  /** Estado filtrado ('' = todos). */
  activo: EstadoAgenda | '';
  onElegir: (estado: EstadoAgenda | '') => void;
}

/** Chips con la cantidad de citas por estado; también sirven para filtrar la agenda o el listado. */
export default function ResumenEstados({ conteo, total, activo, onElegir }: Props) {
  return (
    <Box role="group" aria-label="Filtrar por estado" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      <Chip label={`Todas · ${total}`} onClick={() => onElegir('')} color={activo === '' ? 'primary' : 'default'}
        variant={activo === '' ? 'filled' : 'outlined'} aria-pressed={activo === ''} />
      {ESTADOS_AGENDA.map((e) => (
        <Chip key={e.valor} label={`${e.etiqueta} · ${conteo[e.valor] ?? 0}`} onClick={() => onElegir(e.valor)}
          color={activo === e.valor ? e.color : 'default'} variant={activo === e.valor ? 'filled' : 'outlined'}
          aria-pressed={activo === e.valor} />
      ))}
    </Box>
  );
}
