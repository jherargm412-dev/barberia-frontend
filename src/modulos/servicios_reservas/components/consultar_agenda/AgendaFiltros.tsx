import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { useState, type FormEvent } from 'react';
import { ESTADOS_AGENDA, MENSAJES_AGENDA } from '../../constants/consultar_agenda';
import type { BarberoAgenda, EstadoAgenda, FiltrosAgenda, VistaAgenda } from '../../types/consultar_agenda';
import { esFechaValida, hoy, sumarDias } from '../../utils/consultar_agenda/agendaFormato';

interface Props {
  /** Filtros con los que se hizo la última consulta. */
  valores: FiltrosAgenda;
  barberos: BarberoAgenda[];
  /** Solo Recepcionista y Administrador eligen barbero. */
  puedeFiltrarBarbero: boolean;
  onBuscar: (filtros: FiltrosAgenda) => void;
}

/**
 * Vista (día o semana), fecha con flechas y "Hoy", estado y barbero. La vista, las flechas y "Hoy"
 * consultan al instante; el resto, con "Buscar". Con una fecha inválida no se consulta nada (5a).
 */
export default function AgendaFiltros({ valores, barberos, puedeFiltrarBarbero, onBuscar }: Props) {
  const [fecha, setFecha] = useState(valores.fecha);
  const [vista, setVista] = useState<VistaAgenda>(valores.vista);
  const [estado, setEstado] = useState<EstadoAgenda | ''>(valores.estado);
  const [barberoId, setBarberoId] = useState<number | ''>(valores.barberoId);
  const [errorFecha, setErrorFecha] = useState('');

  const semana = vista === 'SEMANA';
  const paso = semana ? 7 : 1;
  const base = esFechaValida(fecha) ? fecha : valores.fecha;

  function armar(f: string, v: VistaAgenda): FiltrosAgenda {
    return { fecha: f, vista: v, estado, barberoId: puedeFiltrarBarbero ? barberoId : '' };
  }

  /** Flechas y "Hoy": cambian la fecha y consultan de inmediato. */
  function irAFecha(nueva: string) {
    setFecha(nueva);
    setErrorFecha('');
    onBuscar(armar(nueva, vista));
  }

  function cambiarVista(nueva: VistaAgenda) {
    setVista(nueva);
    setFecha(base);
    setErrorFecha('');
    onBuscar(armar(base, nueva));
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    if (!esFechaValida(fecha)) {
      setErrorFecha(MENSAJES_AGENDA.FECHA_INVALIDA);
      return;
    }
    setErrorFecha('');
    onBuscar(armar(fecha, vista));
  }

  return (
    <Stack component="form" onSubmit={buscar} spacing={2}>
      {/* En celular: la vista arriba y la navegación de fechas completa debajo; en pantallas anchas, en una fila. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={vista}
          onChange={(_, nueva: VistaAgenda | null) => nueva && cambiarVista(nueva)}
          aria-label="Vista de la agenda"
        >
          <ToggleButton value="DIA" aria-label="Vista diaria">
            <ViewDayIcon fontSize="small" sx={{ mr: 0.5 }} /> Día
          </ToggleButton>
          <ToggleButton value="SEMANA" aria-label="Vista semanal">
            <ViewWeekIcon fontSize="small" sx={{ mr: 0.5 }} /> Semana
          </ToggleButton>
        </ToggleButtonGroup>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Tooltip title={semana ? 'Semana anterior' : 'Día anterior'}>
            <IconButton aria-label={semana ? 'Semana anterior' : 'Día anterior'} onClick={() => irAFecha(sumarDias(base, -paso))}>
              <ChevronLeftIcon />
            </IconButton>
          </Tooltip>
          <TextField
            type="date"
            label="Fecha"
            size="small"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            error={!!errorFecha}
            helperText={errorFecha || ' '}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: { xs: 150, sm: 'auto' } }}
          />
          <Tooltip title={semana ? 'Semana siguiente' : 'Día siguiente'}>
            <IconButton aria-label={semana ? 'Semana siguiente' : 'Día siguiente'} onClick={() => irAFecha(sumarDias(base, paso))}>
              <ChevronRightIcon />
            </IconButton>
          </Tooltip>
          <Button size="small" onClick={() => irAFecha(hoy())} disabled={fecha === hoy()}>
            Hoy
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
        {puedeFiltrarBarbero && (
          <TextField
            select
            label="Barbero"
            size="small"
            value={barberoId === '' ? '' : String(barberoId)}
            onChange={(e) => setBarberoId(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {barberos.map((b) => (
              <MenuItem key={b.idEmpleado} value={String(b.idEmpleado)}>
                {b.nombre}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          select
          label="Estado"
          size="small"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoAgenda | '')}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS_AGENDA.map((e) => (
            <MenuItem key={e.valor} value={e.valor}>
              {e.etiqueta}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" startIcon={<SearchIcon />} sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
          Buscar
        </Button>
      </Stack>
    </Stack>
  );
}
