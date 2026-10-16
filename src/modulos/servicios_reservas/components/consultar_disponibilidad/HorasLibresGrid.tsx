import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { HoraLibre, HorarioDisponible } from '../../types/consultar_disponibilidad';

interface Props {
  horas: (HoraLibre | HorarioDisponible)[];
  /** Horas del barbero que ya tienen una cita: se muestran en rojo y no se pueden elegir. */
  ocupadas?: HoraLibre[];
  /** horaInicio de la hora elegida, para resaltarla. */
  seleccionada?: string;
  onSeleccionar?: (hora: HoraLibre | HorarioDisponible, elemento: HTMLElement) => void;
  textoVacio?: string;
}

/**
 * CU10 paso 3: grilla de horas para elegir con un clic. Las libres se pueden elegir (si traen barberos, muestra
 * cuántos); las ocupadas salen en rojo, en su lugar del día, para ver de un vistazo cómo está la agenda.
 */
export default function HorasLibresGrid({
  horas,
  ocupadas = [],
  seleccionada,
  onSeleccionar,
  textoVacio = 'No hay horas libres',
}: Props) {
  if (horas.length === 0 && ocupadas.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {textoVacio}
      </Typography>
    );
  }
  // Libres y ocupadas juntas, en orden de hora ("HH:mm" se ordena bien como texto).
  const todas = [
    ...horas.map((h) => ({ hora: h, ocupada: false })),
    ...ocupadas.map((h) => ({ hora: h as HoraLibre | HorarioDisponible, ocupada: true })),
  ].sort((a, b) => a.hora.horaInicio.localeCompare(b.hora.horaInicio));

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {todas.map(({ hora: h, ocupada }) => {
          if (ocupada) {
            return (
              <Tooltip key={`o-${h.horaInicio}`} title={`${h.horaInicio}–${h.horaFin}: ocupado`}>
                <Chip
                  label={h.horaInicio}
                  color="error"
                  variant="outlined"
                  sx={{ minWidth: 72, fontVariantNumeric: 'tabular-nums', textDecoration: 'line-through', opacity: 0.8 }}
                />
              </Tooltip>
            );
          }
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
      {horas.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {textoVacio}
        </Typography>
      )}
      {ocupadas.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          En rojo: horas ya ocupadas por otra cita.
        </Typography>
      )}
    </Box>
  );
}
