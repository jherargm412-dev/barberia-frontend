import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { useState, type FormEvent } from 'react';
import { ESTADOS_AGENDA, MENSAJES_AGENDA } from '../../constants/consultar_agenda';
import type { BarberoAgenda, EstadoAgenda, FiltrosAgenda } from '../../types/consultar_agenda';
import { esFechaValida, hoy, sumarDias } from '../../utils/consultar_agenda/agendaFormato';

interface Props {
  /** Filtros con los que se hizo la última consulta. */
  valores: FiltrosAgenda;
  barberos: BarberoAgenda[];
  /** Solo Recepcionista y Administrador eligen barbero. */
  puedeFiltrarBarbero: boolean;
  onBuscar: (filtros: FiltrosAgenda) => void;
}

/** Fecha (con flechas y "Hoy"), estado y barbero. Con una fecha inválida no se consulta nada. */
export default function AgendaFiltros({ valores, barberos, puedeFiltrarBarbero, onBuscar }: Props) {
  const [fecha, setFecha] = useState(valores.fecha);
  const [estado, setEstado] = useState<EstadoAgenda | ''>(valores.estado);
  const [barberoId, setBarberoId] = useState<number | ''>(valores.barberoId);
  const [errorFecha, setErrorFecha] = useState('');

  function filtrosActuales(f: string): FiltrosAgenda {
    return { fecha: f, estado, barberoId: puedeFiltrarBarbero ? barberoId : '' };
  }

  /** Flechas y "Hoy": cambian el día y consultan de inmediato. */
  function irAFecha(nueva: string) {
    setFecha(nueva);
    setErrorFecha('');
    onBuscar(filtrosActuales(nueva));
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    if (!esFechaValida(fecha)) {
      setErrorFecha(MENSAJES_AGENDA.FECHA_INVALIDA);
      return;
    }
    setErrorFecha('');
    onBuscar(filtrosActuales(fecha));
  }

  const base = esFechaValida(fecha) ? fecha : valores.fecha;

  return (
    <Stack component="form" onSubmit={buscar} spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <Tooltip title="Día anterior">
          <IconButton aria-label="Día anterior" onClick={() => irAFecha(sumarDias(base, -1))}>
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
        />
        <Tooltip title="Día siguiente">
          <IconButton aria-label="Día siguiente" onClick={() => irAFecha(sumarDias(base, 1))}>
            <ChevronRightIcon />
          </IconButton>
        </Tooltip>
        <Button size="small" onClick={() => irAFecha(hoy())} disabled={fecha === hoy()}>
          Hoy
        </Button>
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
