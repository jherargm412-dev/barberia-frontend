import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { HoraLibre, HorarioDisponible } from '../../types/consultar_disponibilidad';

interface Props {
  horas: (HoraLibre | HorarioDisponible)[];
  /** horaInicio de la hora elegida, para resaltarla. */
  seleccionada?: string;
  onSeleccionar?: (hora: HoraLibre | HorarioDisponible, elemento: HTMLElement) => void;
  textoVacio?: string;
}

/** CU10 paso 3: grilla de horas libres para elegir con un clic. Si la hora trae barberos, muestra cuántos. */
export default function HorasLibresGrid({ horas, seleccionada, onSeleccionar, textoVacio = 'No hay horas libres' }: Props) {
  if (horas.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {textoVacio}
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {horas.map((h) => {
        const barberos = 'barberos' in h ? h.barberos : null;
        const etiqueta = barberos && barberos.length > 1 ? `${h.horaInicio} · ${barberos.length}` : h.horaInicio;
        const ayuda = barberos
          ? `${h.horaInicio}–${h.horaFin}: ${barberos.map((b) => b.nombre).join(', ')}`
          : `${h.horaInicio}–${h.horaFin}`;
        const elegida = seleccionada === h.horaInicio;
        return (
          <Tooltip key={h.horaInicio} title={ayuda}>
            <Chip
              label={etiqueta}
              color={elegida ? 'primary' : 'default'}
              variant={elegida ? 'filled' : 'outlined'}
              onClick={onSeleccionar ? (e) => onSeleccionar(h, e.currentTarget) : undefined}
              sx={{ minWidth: 72, fontVariantNumeric: 'tabular-nums' }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}
