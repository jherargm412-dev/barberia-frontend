import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { ESTADOS_AGENDA } from '../../constants/consultar_agenda';
import type { CitaAgenda, EstadoAgenda } from '../../types/consultar_agenda';

interface Props {
  citas: CitaAgenda[];
  /** Recepción y Administrador: una columna por barbero. El barbero ve solo su columna. */
  agrupar: boolean;
  onSeleccionar: (idReserva: number) => void;
}

interface Columna {
  clave: string;
  titulo: string;
  citas: CitaAgenda[];
}

/** Alto de una hora en la grilla. */
const PX_HORA = 104;
const ANCHO_HORAS = 64;

const minutos = (hora: string) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
};

const iniciales = (nombre: string) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Columnas en el orden en que llegan (el backend ya ordena por barbero y hora). */
function columnas(citas: CitaAgenda[], agrupar: boolean): Columna[] {
  if (!agrupar) return [{ clave: 'todas', titulo: 'Mis citas', citas }];
  const cols: Columna[] = [];
  for (const cita of citas) {
    const clave = String(cita.barbero?.idEmpleado ?? 'sin');
    const col = cols.find((c) => c.clave === clave);
    if (col) col.citas.push(cita);
    else cols.push({ clave, titulo: cita.barbero?.nombre ?? 'Sin asignar', citas: [cita] });
  }
  return cols;
}

/** Color del tema para cada estado (el mismo que usan los chips de estado). */
function useColorEstado() {
  const theme = useTheme();
  return (estado: EstadoAgenda) => {
    const color = ESTADOS_AGENDA.find((e) => e.valor === estado)?.color ?? 'default';
    return color === 'default' ? theme.palette.text.secondary : theme.palette[color].main;
  };
}

/**
 * Vista diaria (CU16) como línea de tiempo: una columna por barbero y cada cita como un bloque del alto de su
 * duración, con el color de su estado. Un clic abre el detalle. En pantallas angostas la grilla se desplaza.
 */
export default function AgendaLineaTiempo({ citas, agrupar, onSeleccionar }: Props) {
  const colorEstado = useColorEstado();
  const cols = columnas(citas, agrupar);

  // Rango visible: de 08:00 a 18:00 como mínimo, ampliado si alguna cita queda fuera.
  const desde = Math.min(8, ...citas.map((c) => Math.floor(minutos(c.horaInicio) / 60)));
  const hasta = Math.max(18, ...citas.map((c) => Math.ceil(minutos(c.horaFin) / 60)));
  const horas = Array.from({ length: hasta - desde }, (_, i) => desde + i);
  const alto = (hasta - desde) * PX_HORA;
  const top = (hora: string) => ((minutos(hora) - desde * 60) / 60) * PX_HORA;

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', overflowX: 'auto' }}>
      <Box sx={{ minWidth: ANCHO_HORAS + cols.length * 220, display: 'grid',
        gridTemplateColumns: `${ANCHO_HORAS}px repeat(${cols.length}, minmax(0, 1fr))` }}>
        {/* Cabecera: un barbero por columna */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
        {cols.map((col) => (
          <Box key={col.clave} sx={{ height: 64, display: 'flex', alignItems: 'center', gap: 1.25, px: 2, borderBottom: 1,
            borderLeft: 1, borderColor: 'divider', minWidth: 0 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'action.selected', color: 'primary.main', fontSize: 12,
              fontWeight: 600, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {iniciales(col.titulo)}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{col.titulo}</Typography>
              <Typography variant="caption" color="text.secondary">
                {col.citas.length} {col.citas.length === 1 ? 'cita' : 'citas'}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Horas */}
        <Box sx={{ position: 'relative', height: alto }} aria-hidden>
          {horas.map((h, i) => (
            <Typography key={h} variant="caption" color="text.secondary"
              sx={{ position: 'absolute', top: i * PX_HORA + 4, right: 10, fontVariantNumeric: 'tabular-nums' }}>
              {String(h).padStart(2, '0')}:00
            </Typography>
          ))}
        </Box>

        {/* Columnas con sus citas */}
        {cols.map((col) => (
          <Box key={col.clave} component="ul" aria-label={`Citas de ${col.titulo}`}
            sx={(t) => ({ position: 'relative', height: alto, m: 0, p: 0, listStyle: 'none', borderLeft: 1, borderColor: 'divider',
              backgroundImage: `repeating-linear-gradient(to bottom, ${(t.vars ?? t).palette.divider} 0, ${(t.vars ?? t).palette.divider} 1px, transparent 1px, transparent ${PX_HORA}px)` })}>
            {col.citas.map((cita) => {
              const color = colorEstado(cita.estado);
              const etiqueta = ESTADOS_AGENDA.find((e) => e.valor === cita.estado)?.etiqueta ?? cita.estado;
              const y = top(cita.horaInicio);
              const h = Math.max(top(cita.horaFin) - y, 44);
              return (
                <Box component="li" key={cita.idReserva} sx={{ position: 'absolute', left: 8, right: 8, top: y + 2, height: h - 4 }}>
                  <ButtonBase onClick={() => onSeleccionar(cita.idReserva)}
                    aria-label={`${cita.horaInicio.slice(0, 5)}, ${cita.cliente.nombre}, ${cita.servicio.nombre}, ${etiqueta}`}
                    sx={{ width: '100%', height: '100%', borderRadius: '10px', px: 1.25, py: 0.6, gap: 0.1, display: 'flex', flexDirection: 'column',
                      alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', overflow: 'hidden',
                      bgcolor: alpha(color, 0.12), borderLeft: `3px solid ${color}`,
                      transition: 'background-color 150ms ease-out',
                      '&:hover': { bgcolor: alpha(color, 0.2) },
                      '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 } }}>
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 600, color, whiteSpace: 'nowrap' }}>
                      {cita.horaInicio.slice(0, 5)} · {etiqueta}
                    </Typography>
                    <Typography component="span" noWrap sx={{ fontSize: 14, fontWeight: 600, maxWidth: '100%',
                      textDecoration: cita.estado === 'CANCELADA' ? 'line-through' : 'none' }}>
                      {cita.cliente.nombre}
                    </Typography>
                    <Typography component="span" noWrap color="text.secondary" sx={{ fontSize: 12.5, maxWidth: '100%' }}>
                      {cita.servicio.nombre}
                    </Typography>
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
