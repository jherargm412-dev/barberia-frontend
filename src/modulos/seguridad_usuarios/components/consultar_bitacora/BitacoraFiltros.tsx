import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState, type FormEvent } from 'react';
import { FILTROS_VACIOS, MENSAJES_BITACORA } from '../../constants/consultar_bitacora';
import type { FiltrosBitacora, OpcionesFiltroBitacora } from '../../types/consultar_bitacora';
import type { UsuarioResumen } from '../../types/gestionar_usuarios';

interface Props {
  opciones: OpcionesFiltroBitacora;
  usuarios: UsuarioResumen[];
  onBuscar: (filtros: FiltrosBitacora) => void;
}

/** CU05 pasos 4–6: rango de fechas, usuario, acción y tabla. Busca al presionar "Buscar". */
export default function BitacoraFiltros({ opciones, usuarios, onBuscar }: Props) {
  const [filtros, setFiltros] = useState<FiltrosBitacora>(FILTROS_VACIOS);
  const [errorFechas, setErrorFechas] = useState('');

  function cambiar(nuevos: Partial<FiltrosBitacora>) {
    setFiltros({ ...filtros, ...nuevos });
    setErrorFechas('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // 6a: "AAAA-MM-DD" se puede comparar como texto. El backend también lo valida.
    if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta) {
      setErrorFechas(MENSAJES_BITACORA.RANGO_INVALIDO);
      return;
    }
    onBuscar(filtros);
  }

  function limpiar() {
    setFiltros(FILTROS_VACIOS);
    setErrorFechas('');
    onBuscar(FILTROS_VACIOS);
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2} sx={{ mb: 2 }}>
      {/* Los filtros se acomodan al espacio del contenido, incluso con el menú lateral abierto. */}
      <Stack direction={{ xs: 'column', md: 'row' }} useFlexGap spacing={2} sx={{ flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="Desde"
          value={filtros.fechaDesde}
          onChange={(e) => cambiar({ fechaDesde: e.target.value })}
          error={Boolean(errorFechas)}
          helperText={errorFechas}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          label="Hasta"
          value={filtros.fechaHasta}
          onChange={(e) => cambiar({ fechaHasta: e.target.value })}
          error={Boolean(errorFechas)}
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          select
          label="Usuario"
          value={filtros.usuarioId}
          onChange={(e) => cambiar({ usuarioId: e.target.value === '' ? '' : Number(e.target.value) })}
          size="small"
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {usuarios.map((u) => (
            <MenuItem key={u.idUsuario} value={u.idUsuario}>
              {u.nombre} ({u.correo})
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Acción"
          value={filtros.accion}
          onChange={(e) => cambiar({ accion: e.target.value })}
          size="small"
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {opciones.acciones.map((a) => (
            <MenuItem key={a} value={a}>
              {a}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Tabla afectada"
          value={filtros.tablaAfectada}
          onChange={(e) => cambiar({ tablaAfectada: e.target.value })}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todas</MenuItem>
          {opciones.tablas.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Stack direction="row" spacing={2}>
        <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>
          Buscar
        </Button>
        <Button onClick={limpiar}>Limpiar filtros</Button>
      </Stack>
    </Stack>
  );
}
