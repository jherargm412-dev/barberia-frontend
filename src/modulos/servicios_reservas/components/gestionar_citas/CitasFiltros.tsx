// La superficie común distingue los filtros del listado sin alterar su comportamiento.
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
import { ESTADOS_CITA } from '../../constants/gestionar_citas';
import type { BarberoDisponible, EstadoCita, FiltrosCitas } from '../../types/gestionar_citas';
import { hoy, sumarDias } from '../../utils/gestionar_citas/citaForm';

interface Props {
  filtros: FiltrosCitas;
  barberos: BarberoDisponible[];
  /** Fecha, barbero y estado se aplican al instante; el texto al presionar "Buscar" o Enter. */
  onCambiar: (cambios: Partial<FiltrosCitas>) => void;
}

/** Día de la agenda (con flechas para moverse), barbero, estado y búsqueda por cliente. */
export default function CitasFiltros({ filtros, barberos, onCambiar }: Props) {
  const [q, setQ] = useState(filtros.q);

  function buscar(e: FormEvent) {
    e.preventDefault();
    onCambiar({ q: q.trim() });
  }

  return (
    <Stack component="form" onSubmit={buscar} spacing={2} sx={{ mb: 2, p: { xs: 2, sm: 2.5 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 3 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <Tooltip title="Día anterior">
          <IconButton onClick={() => onCambiar({ fecha: sumarDias(filtros.fecha || hoy(), -1) })}>
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
        <TextField
          type="date"
          label="Fecha"
          size="small"
          value={filtros.fecha}
          onChange={(e) => onCambiar({ fecha: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Tooltip title="Día siguiente">
          <IconButton onClick={() => onCambiar({ fecha: sumarDias(filtros.fecha || hoy(), 1) })}>
            <ChevronRightIcon />
          </IconButton>
        </Tooltip>
        <Button size="small" onClick={() => onCambiar({ fecha: hoy() })} disabled={filtros.fecha === hoy()}>
          Hoy
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label="Barbero"
          size="small"
          value={filtros.empleadoId === '' ? '' : String(filtros.empleadoId)}
          onChange={(e) => onCambiar({ empleadoId: e.target.value === '' ? '' : Number(e.target.value) })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {barberos.map((b) => (
            <MenuItem key={b.idEmpleado} value={String(b.idEmpleado)}>
              {b.nombre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          size="small"
          value={filtros.estado}
          onChange={(e) => onCambiar({ estado: e.target.value as EstadoCita | '' })}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS_CITA.map((e) => (
            <MenuItem key={e.valor} value={e.valor}>
              {e.etiqueta}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Cliente (nombre o teléfono)"
          size="small"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
          Buscar
        </Button>
      </Stack>
    </Stack>
  );
}
