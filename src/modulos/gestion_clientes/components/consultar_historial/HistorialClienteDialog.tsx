import { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { consultarHistorialCliente } from '../../api/consultar_historial/historialApi';
import type { HistorialCliente } from '../../types/gestionar_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';

interface Props {
  abierto: boolean;
  clienteId: number | null;
  nombreCliente: string;
  onCerrar: () => void;
}

export default function HistorialClienteDialog({ abierto, clienteId, nombreCliente, onCerrar }: Props) {
  const [historial, setHistorial] = useState<HistorialCliente[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

    useEffect(() => {
    if (!abierto || !clienteId) return;

    let activo = true;

    async function cargarHistorial() {
      setCargando(true);
      setError('');
      try {
        const datos = await consultarHistorialCliente(clienteId!);
        if (activo) setHistorial(datos);
      } catch (err) {
        if (activo) setError(obtenerError(err).mensaje);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarHistorial();

    return () => {
      activo = false;
    };
  }, [abierto, clienteId]);

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Historial de {nombreCliente}</DialogTitle>
      <DialogContent dividers>
        {cargando && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!cargando && !error && historial.length === 0 && (
          <Alert severity="info">Este cliente aún no tiene citas registradas.</Alert>
        )}
        {!cargando && !error && historial.length > 0 && (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Servicio</TableCell>
                  <TableCell>Barbero</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Anticipo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map((cita) => (
                  <TableRow key={cita.idReserva}>
                    <TableCell>{cita.fecha}</TableCell>
                    <TableCell>{cita.horaInicio}</TableCell>
                    <TableCell>{cita.servicio}</TableCell>
                    <TableCell>{cita.barbero}</TableCell>
                    <TableCell>
                      <Chip size="small" label={cita.estado} color={cita.estado === 'ATENDIDA' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      {cita.anticipoPagado ? `Pagado (${cita.montoAnticipo} Bs)` : 'No pagado'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}