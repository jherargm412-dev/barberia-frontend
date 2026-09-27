import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ReactNode } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { consultarRegistroBitacora } from '../../api/consultar_bitacora/bitacoraApi';
import { MENSAJES_BITACORA } from '../../constants/consultar_bitacora';
import type { BitacoraDetalle } from '../../types/consultar_bitacora';
import { formatearDatos, formatearFechaHora } from '../../utils/consultar_bitacora/formatoBitacora';

interface Props {
  /** Registro a mostrar; null = diálogo cerrado. */
  idBitacora: number | null;
  onCerrar: () => void;
}

/** Una fila "Etiqueta: valor" del detalle. */
function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography color="text.secondary" sx={{ width: 140, flexShrink: 0 }}>
        {etiqueta}
      </Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

/** Datos anteriores o nuevos: JSON con sangría, o "Sin datos" si no hay (10a). */
function Datos({ datos }: { datos: Record<string, unknown> | null }) {
  if (!datos) {
    return <Typography color="text.secondary">{MENSAJES_BITACORA.SIN_DATOS}</Typography>;
  }
  return (
    <Box
      component="pre"
      sx={{ m: 0, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: 13, overflowX: 'auto' }}
    >
      {formatearDatos(datos)}
    </Box>
  );
}

/** CU05 paso 10: información completa del registro, incluidos datos anteriores, nuevos e IP. */
export default function BitacoraDetalleDialog({ idBitacora, onCerrar }: Props) {
  const [registro, setRegistro] = useState<BitacoraDetalle | null>(null);
  // El error se guarda junto con el id que lo produjo.
  const [error, setError] = useState<{ id: number; mensaje: string } | null>(null);

  useEffect(() => {
    if (idBitacora === null) return;
    consultarRegistroBitacora(idBitacora)
      .then((detalle) => {
        setRegistro(detalle);
        setError(null);
      })
      .catch((err) => setError({ id: idBitacora, mensaje: obtenerError(err).mensaje }));
  }, [idBitacora]);

  // Solo se muestra lo que corresponde al registro elegido; si aún es el anterior, está cargando.
  const actual = registro?.idBitacora === idBitacora ? registro : null;
  const mensajeError = error?.id === idBitacora ? error.mensaje : '';

  return (
    <Dialog open={idBitacora !== null} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Detalle del registro</DialogTitle>
      <DialogContent dividers>
        {mensajeError && <Alert severity="error">{mensajeError}</Alert>}
        {!mensajeError && !actual && <CircularProgress />}
        {actual && (
          <Stack spacing={1.5}>
            <Dato etiqueta="Fecha y hora">{formatearFechaHora(actual.fechaHora)}</Dato>
            <Dato etiqueta="Usuario">
              {actual.usuario.nombre} ({actual.usuario.correo})
            </Dato>
            <Dato etiqueta="Acción">{actual.accion}</Dato>
            <Dato etiqueta="Detalle">{actual.detalle || '—'}</Dato>
            <Dato etiqueta="Tabla afectada">{actual.tablaAfectada}</Dato>
            <Dato etiqueta="IP de origen">{actual.ipOrigen || MENSAJES_BITACORA.SIN_DATOS}</Dato>
            <Dato etiqueta="Datos anteriores">
              <Datos datos={actual.datosAnteriores} />
            </Dato>
            <Dato etiqueta="Datos nuevos">
              <Datos datos={actual.datosNuevos} />
            </Dato>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
