import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import type { FormEvent } from 'react';

/** Lo que escribe el usuario (texto; vacío = sin filtro). Igual para servicios y productos. */
export interface ValoresFiltroCatalogo {
  q: string;
  precioMin: string;
  precioMax: string;
}

interface Props {
  valores: ValoresFiltroCatalogo;
  onCambiar: (valores: ValoresFiltroCatalogo) => void;
  onBuscar: () => void;
  /** Solo se muestra "Limpiar" si hay filtros aplicados. */
  onLimpiar?: () => void;
  /** Ej. "Buscar servicio". */
  etiquetaBusqueda: string;
}

/** Barra de búsqueda y rango de precio del catálogo público (CU13 y CU23, paso 2). */
export default function FiltrosCatalogoPublico({ valores, onCambiar, onBuscar, onLimpiar, etiquetaBusqueda }: Props) {
  function enviar(e: FormEvent) {
    e.preventDefault();
    onBuscar();
  }

  const precio = { min: 0 };
  return (
    <Paper component="form" onSubmit={enviar} noValidate role="search"
      sx={{ p: { xs: 2, md: 2.5 }, borderRadius: '20px', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
      <TextField
        label={etiquetaBusqueda}
        placeholder="Nombre o descripción"
        value={valores.q}
        onChange={(e) => onCambiar({ ...valores, q: e.target.value })}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
        sx={{ flex: '1 1 280px' }}
      />
      <TextField
        label="Precio desde (Bs)"
        type="number"
        value={valores.precioMin}
        onChange={(e) => onCambiar({ ...valores, precioMin: e.target.value })}
        slotProps={{ htmlInput: precio }}
        sx={{ flex: { xs: '1 1 130px', sm: '0 1 170px' } }}
      />
      <TextField
        label="Hasta (Bs)"
        type="number"
        value={valores.precioMax}
        onChange={(e) => onCambiar({ ...valores, precioMax: e.target.value })}
        slotProps={{ htmlInput: precio }}
        sx={{ flex: { xs: '1 1 130px', sm: '0 1 170px' } }}
      />
      <Box sx={{ display: 'flex', gap: 1, flex: { xs: '1 1 100%', md: '0 0 auto' } }}>
        <Button type="submit" variant="contained" size="large" startIcon={<SearchIcon />} sx={{ borderRadius: 999, px: 3.5, flex: { xs: 1, md: 'none' } }}>
          Buscar
        </Button>
        {onLimpiar && <Button size="large" onClick={onLimpiar}>Limpiar</Button>}
      </Box>
    </Paper>
  );
}
