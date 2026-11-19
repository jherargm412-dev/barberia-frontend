import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import type { DiaHorario } from '../../types/gestionar_horarios';
import { etiquetaDia, hhmm } from '../../utils/gestionar_horarios/horarioForm';

/** Rango del eje: de 07:00 a 22:00 como mínimo, ampliado si un día empieza antes o termina después. */
const DESDE = 7;
const HASTA = 22;

const horas = (hora: string | null) => {
  if (!hora) return 0;
  const [h, m] = hora.split(':').map(Number);
  return h + (m || 0) / 60;
};

/** Total de horas de la semana, p. ej. "40 h" o "37,5 h". */
function horasSemanales(dias: DiaHorario[]) {
  const total = dias.filter((d) => d.trabaja).reduce((s, d) => s + Math.max(0, horas(d.horaSalida) - horas(d.horaEntrada)), 0);
  return `${total.toLocaleString('es-BO', { maximumFractionDigits: 1 })} h`;
}

/** Paso 8 y 4g: la semana del barbero (solo lectura) como barras sobre las horas del día. */
export default function CalendarioSemanal({ dias }: { dias: DiaHorario[] }) {
  const theme = useTheme();
  const trabajados = dias.filter((d) => d.trabaja);
  const desde = Math.min(DESDE, ...trabajados.map((d) => Math.floor(horas(d.horaEntrada))));
  const hasta = Math.max(HASTA, ...trabajados.map((d) => Math.ceil(horas(d.horaSalida))));
  const pct = (h: number) => ((h - desde) / (hasta - desde)) * 100;
  const marcas = Array.from({ length: Math.floor((hasta - desde) / 3) + 1 }, (_, i) => desde + i * 3);
  const dorado = theme.palette.primary.main;

  return (
    <Paper sx={{ p: { xs: 2, sm: 2.5 }, overflowX: 'auto' }}>
      <Box sx={{ minWidth: 560, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)' }} aria-hidden>
          <span />
          <Box sx={{ position: 'relative', height: 18 }}>
            {marcas.map((h) => (
              <Typography key={h} variant="caption" color="text.secondary"
                sx={{ position: 'absolute', left: `${pct(h)}%`, transform: h === desde ? 'none' : 'translateX(-50%)', fontVariantNumeric: 'tabular-nums' }}>
                {String(h).padStart(2, '0')}:00
              </Typography>
            ))}
          </Box>
        </Box>
        {dias.map((d) => {
          const ini = horas(d.horaEntrada);
          const fin = horas(d.horaSalida);
          return (
            <Box key={d.diaSemana} sx={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr)', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: d.trabaja ? 'text.primary' : 'text.secondary' }}>
                {etiquetaDia(d.diaSemana)}
              </Typography>
              <Box sx={(t) => ({ position: 'relative', height: 38, borderRadius: 2, bgcolor: 'action.hover',
                backgroundImage: `repeating-linear-gradient(to right, ${(t.vars ?? t).palette.divider} 0, ${(t.vars ?? t).palette.divider} 1px, transparent 1px, transparent ${100 / (hasta - desde) * 3}%)` })}>
                {d.trabaja ? (
                  <Box aria-label={`${etiquetaDia(d.diaSemana)}: de ${hhmm(d.horaEntrada)} a ${hhmm(d.horaSalida)}`} role="img"
                    sx={{ position: 'absolute', top: 5, bottom: 5, left: `${pct(ini)}%`, width: `${pct(fin) - pct(ini)}%`, borderRadius: 1.5,
                      bgcolor: alpha(dorado, 0.22), border: `1px solid ${dorado}`, display: 'flex', alignItems: 'center', px: 1.25,
                      overflow: 'hidden', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
                    <Typography component="span" sx={{ fontSize: 12.5, fontWeight: 600 }}>
                      {hhmm(d.horaEntrada)} – {hhmm(d.horaSalida)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography component="span" variant="body2" color="text.secondary"
                    sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', pl: 1.5 }}>
                    No trabaja
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5 }}>
          Total semanal: <Box component="strong" sx={{ color: 'text.primary' }}>{horasSemanales(dias)}</Box>
          {' '}· {trabajados.length} {trabajados.length === 1 ? 'día' : 'días'} de trabajo
        </Typography>
      </Box>
    </Paper>
  );
}
