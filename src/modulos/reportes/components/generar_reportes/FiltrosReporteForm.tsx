import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import {
  ETIQUETAS_FILTRO, OPCIONES_FIJAS, PERIODOS, type ClaveFiltro, type DefinicionReporte,
} from '../../constants/generar_reportes';
import type { FiltrosReporte, OpcionesReporte } from '../../types/generar_reportes';
import { filtrosIniciales, hoyBolivia, limpiarPeriodo, validarPeriodo } from '../../utils/generar_reportes/reporteFormato';

interface Props {
  definicion: DefinicionReporte;
  /** Filtros con los que arranca el formulario (los de la URL). */
  valoresIniciales: FiltrosReporte;
  opciones: OpcionesReporte | null;
  /** Errores por campo que devolvió el backend la última vez. */
  erroresServidor: Record<string, string>;
  /** Recibe los filtros ya validados y sin campos vacíos. */
  onGenerar: (filtros: FiltrosReporte) => void;
}

/** Ancho de los campos: dos o tres por fila en escritorio, uno por fila en celular. */
const CAMPO = { flex: '1 1 220px', maxWidth: { sm: 340 } };

/**
 * Paso 1 "Filtros": el periodo (común a todos los reportes) y los filtros propios del reporte elegido.
 * Los accesos rápidos Hoy / Esta semana / Este mes llenan el periodo de un clic.
 * Guarda lo que se va escribiendo en su propio estado; la página le pone una "key" con los filtros de la URL,
 * así cuando la URL cambia (otro reporte, botón "atrás") React lo crea de nuevo con esos valores.
 */
export default function FiltrosReporteForm({ definicion, valoresIniciales, opciones, erroresServidor, onGenerar }: Props) {
  const [valores, setValores] = useState<FiltrosReporte>(valoresIniciales);
  const [errores, setErrores] = useState<Record<string, string>>(erroresServidor);
  const cambiar = (campo: string, valor: string) => setValores({ ...valores, [campo]: valor });
  const hoy = hoyBolivia();
  const rapidos = [
    { etiqueta: 'Hoy', periodo: 'DIARIO' },
    { etiqueta: 'Esta semana', periodo: 'SEMANAL' },
    { etiqueta: 'Este mes', periodo: 'MENSUAL' },
  ];

  function enviar(e: FormEvent) {
    e.preventDefault();
    const erroresPeriodo = validarPeriodo(valores);
    setErrores(erroresPeriodo);
    if (Object.keys(erroresPeriodo).length > 0) return;
    onGenerar(Object.fromEntries(Object.entries(limpiarPeriodo(valores)).filter(([, v]) => v !== '')));
  }

  function limpiar() {
    setValores(filtrosIniciales());
    setErrores({});
  }

  /** Opciones de un selector: las fijas o las que vienen del backend (barberos, ítems, usuarios), con "Todos". */
  function opcionesDe(clave: ClaveFiltro) {
    const fijas = OPCIONES_FIJAS[clave];
    if (fijas) return fijas;
    const lista = clave === 'empleadoId' ? opciones?.barberos : clave === 'productoId' ? opciones?.productos : opciones?.usuarios;
    return [{ valor: '', etiqueta: 'Todos' }, ...(lista ?? []).map((o) => ({ valor: String(o.id), etiqueta: o.nombre }))];
  }

  function campo(clave: ClaveFiltro) {
    const valor = valores[clave] ?? '';
    if (clave === 'soloStockBajo' || clave === 'soloConDiferencia') {
      return (
        <FormControlLabel key={clave} sx={{ flex: '1 1 260px' }} label={ETIQUETAS_FILTRO[clave]}
          control={<Checkbox checked={valor === 'true'} onChange={(e) => cambiar(clave, e.target.checked ? 'true' : '')} />} />
      );
    }
    if (clave === 'minVisitas' || clave === 'diasInactividad') {
      return (
        <TextField key={clave} type="number" label={ETIQUETAS_FILTRO[clave]} value={valor} sx={CAMPO}
          placeholder={clave === 'minVisitas' ? '1' : '30'} error={Boolean(errores[clave])}
          helperText={errores[clave] ?? (clave === 'diasInactividad' ? 'Para la lista de clientes inactivos' : ' ')}
          onChange={(e) => cambiar(clave, e.target.value)}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: 1, max: clave === 'minVisitas' ? 1000 : 365 } }} />
      );
    }
    return (
      <TextField key={clave} select label={ETIQUETAS_FILTRO[clave]} value={valor} sx={CAMPO}
        error={Boolean(errores[clave])} helperText={errores[clave] ?? ' '} onChange={(e) => cambiar(clave, e.target.value)}>
        {opcionesDe(clave).map((o) => <MenuItem key={o.valor} value={o.valor}>{o.etiqueta}</MenuItem>)}
      </TextField>
    );
  }

  return (
    <Box component="form" noValidate onSubmit={enviar}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1, mb: 2.5 }}>
        <Typography variant="body2" color="text.secondary">Rápido:</Typography>
        {rapidos.map((r) => (
          <Chip key={r.periodo} label={r.etiqueta}
            color={valores.periodo === r.periodo && valores.fecha === hoy ? 'primary' : 'default'}
            variant={valores.periodo === r.periodo && valores.fecha === hoy ? 'filled' : 'outlined'}
            onClick={() => setValores({ ...valores, periodo: r.periodo, fecha: hoy })} />
        ))}
      </Stack>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 1 }}>
        <TextField select label="Periodo" value={valores.periodo ?? 'MENSUAL'} sx={CAMPO} helperText=" "
          onChange={(e) => setValores({ ...valores, periodo: e.target.value, fecha: valores.fecha || hoy })}>
          {PERIODOS.map((p) => <MenuItem key={p.valor} value={p.valor}>{p.etiqueta}</MenuItem>)}
        </TextField>

        {valores.periodo === 'RANGO' ? (
          <>
            <TextField type="date" label="Desde" value={valores.desde ?? ''} sx={CAMPO} required
              error={Boolean(errores.desde)} helperText={errores.desde ?? 'Hasta un año de rango'}
              onChange={(e) => cambiar('desde', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField type="date" label="Hasta" value={valores.hasta ?? ''} sx={CAMPO} required
              error={Boolean(errores.hasta)} helperText={errores.hasta ?? ' '}
              onChange={(e) => cambiar('hasta', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          </>
        ) : valores.periodo === 'MENSUAL' ? (
          // El campo "month" maneja "2026-11"; al backend se le manda el día 1 de ese mes.
          <TextField type="month" label="Mes" value={(valores.fecha ?? '').slice(0, 7)} sx={CAMPO}
            error={Boolean(errores.fecha)} helperText={errores.fecha ?? ' '}
            onChange={(e) => cambiar('fecha', e.target.value ? `${e.target.value}-01` : '')}
            slotProps={{ inputLabel: { shrink: true } }} />
        ) : (
          <TextField type="date" label={valores.periodo === 'SEMANAL' ? 'Cualquier día de la semana' : 'Día'}
            value={valores.fecha ?? ''} sx={CAMPO} error={Boolean(errores.fecha)}
            helperText={errores.fecha ?? (valores.periodo === 'SEMANAL' ? 'Se toma de lunes a domingo' : ' ')}
            onChange={(e) => cambiar('fecha', e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        )}

        {definicion.filtros.map(campo)}
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1 }}>
        <Button type="submit" variant="contained" startIcon={<FilterAltIcon />}>Generar</Button>
        <Button onClick={limpiar}>Limpiar filtros</Button>
      </Stack>
    </Box>
  );
}
