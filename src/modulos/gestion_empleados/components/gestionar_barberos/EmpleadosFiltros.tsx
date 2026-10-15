import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { ESTADOS_EMPLEADO, TIPOS_CONTRATO } from '../../constants/gestionar_barberos';
import type { EstadoUsuario, FiltrosEmpleados, TipoContrato } from '../../types/gestionar_barberos';

type Filtros = Pick<FiltrosEmpleados, 'q' | 'rol' | 'estado' | 'tipoContrato'>;

interface Props {
  /** Filtros con los que arranca la pantalla (por defecto: solo barberos). */
  iniciales: Filtros;
  onBuscar: (filtros: Filtros) => void;
}

const ROLES_FILTRO = ['Barbero', 'Recepcionista', 'Administrador'];

/** Barra de búsqueda: texto libre + rol + estado + tipo de contrato. Busca al presionar "Buscar" o Enter. */
export default function EmpleadosFiltros({ iniciales, onBuscar }: Props) {
  const [filtros, setFiltros] = useState<Filtros>(iniciales);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onBuscar({ ...filtros, q: filtros.q.trim() });
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <TextField
        label="Buscar por nombre, correo, teléfono o especialidad"
        value={filtros.q}
        onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
        size="small"
        sx={{ flex: 1 }}
      />
      <TextField
        select
        label="Rol"
        value={filtros.rol}
        onChange={(e) => setFiltros({ ...filtros, rol: e.target.value })}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ROLES_FILTRO.map((r) => (
          <MenuItem key={r} value={r}>
            {r}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Estado"
        value={filtros.estado}
        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value as EstadoUsuario | '' })}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {ESTADOS_EMPLEADO.map((e) => (
          <MenuItem key={e.valor} value={e.valor}>
            {e.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Contrato"
        value={filtros.tipoContrato}
        onChange={(e) => setFiltros({ ...filtros, tipoContrato: e.target.value as TipoContrato | '' })}
        size="small"
        sx={{ minWidth: 150 }}
      >
        <MenuItem value="">Todos</MenuItem>
        {TIPOS_CONTRATO.map((t) => (
          <MenuItem key={t.valor} value={t.valor}>
            {t.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
        Buscar
      </Button>
    </Stack>
  );
}
