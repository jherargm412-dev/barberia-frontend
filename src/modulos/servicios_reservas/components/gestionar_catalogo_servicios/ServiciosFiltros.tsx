import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ESTADOS_SERVICIO } from '../../constants/gestionar_catalogo_servicios';
import type { EstadoServicio } from '../../types/gestionar_catalogo_servicios';

interface Props {
  onBuscar: (filtros: { q: string; estado: EstadoServicio | '' }) => void;
}

/** Barra de búsqueda: nombre + estado. Busca al presionar "Buscar" o Enter. */
export default function ServiciosFiltros({ onBuscar }: Props) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoServicio | ''>('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onBuscar({ q: q.trim(), estado });
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      useFlexGap
      sx={{ mb: 2, flexWrap: 'wrap' }}
    >
      <TextField
        label="Buscar por nombre"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        select
        label="Estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value as EstadoServicio | '')}
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS_SERVICIO.map((e) => (
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
