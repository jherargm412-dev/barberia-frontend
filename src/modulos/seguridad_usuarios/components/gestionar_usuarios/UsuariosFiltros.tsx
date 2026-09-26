import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ESTADOS } from '../../constants/gestionar_usuarios';
import type { EstadoUsuario, RolResumen } from '../../types/gestionar_usuarios';

interface Props {
  roles: RolResumen[];
  onBuscar: (filtros: { q: string; estado: EstadoUsuario | ''; rol: string }) => void;
}

/** Barra de búsqueda: texto libre + estado + rol. Busca al presionar "Buscar" o Enter. */
export default function UsuariosFiltros({ roles, onBuscar }: Props) {
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState<EstadoUsuario | ''>('');
  const [rol, setRol] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onBuscar({ q: q.trim(), estado, rol });
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
        label="Buscar por nombre o correo"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        select
        label="Estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value as EstadoUsuario | '')}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS.map((e) => (
          <MenuItem key={e.valor} value={e.valor}>
            {e.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Rol"
        value={rol}
        onChange={(e) => setRol(e.target.value)}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {roles.map((r) => (
          <MenuItem key={r.idRol} value={r.nombre}>
            {r.nombre}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
        Buscar
      </Button>
    </Stack>
  );
}
