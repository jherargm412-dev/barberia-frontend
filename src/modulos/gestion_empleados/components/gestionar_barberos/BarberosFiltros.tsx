import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ESTADOS_BARBERO } from '../../constants/gestionar_barberos';
import type { EstadoBarbero } from '../../types/gestionar_barberos';

interface Props {
  onBuscar: (filtros: { q: string; estado: EstadoBarbero | '' }) => void;
}

/** Barra de búsqueda: texto (nombre, correo o teléfono) + estado. Busca al presionar "Buscar" o Enter. */
export default function BarberosFiltros({ onBuscar }: Props) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoBarbero | ''>('');

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
      sx={{ mb: 2 }}
    >
      <TextField
        label="Buscar por nombre, correo o teléfono"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        select
        label="Estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value as EstadoBarbero | '')}
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS_BARBERO.map((e) => (
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
