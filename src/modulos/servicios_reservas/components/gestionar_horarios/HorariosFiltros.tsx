// Los filtros se apilan en móvil y comparten la superficie del sistema.
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ESTADOS_HORARIO } from '../../constants/gestionar_horarios';
import type { EstadoHorario, FiltrosHorarios } from '../../types/gestionar_horarios';

interface Props {
  onBuscar: (filtros: FiltrosHorarios) => void;
}

/** Búsqueda por nombre del barbero y filtro por estado del horario. Busca al presionar "Buscar" o Enter. */
export default function HorariosFiltros({ onBuscar }: Props) {
  const [filtros, setFiltros] = useState<FiltrosHorarios>({ q: '', estadoHorario: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onBuscar({ ...filtros, q: filtros.q.trim() });
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2, p: { xs: 2, sm: 2.5 }, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 3 }}>
      <TextField
        label="Buscar barbero"
        value={filtros.q}
        onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        select
        label="Horario"
        value={filtros.estadoHorario}
        onChange={(e) => setFiltros({ ...filtros, estadoHorario: e.target.value as EstadoHorario | '' })}
        size="small"
        sx={{ minWidth: 180 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS_HORARIO.map((e) => (
          <MenuItem key={e.valor} value={e.valor}>
            {e.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
        Buscar
      </Button>
    </Stack>
  );
}
