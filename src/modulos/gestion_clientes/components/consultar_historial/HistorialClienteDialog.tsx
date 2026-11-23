import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { EstadoCitaChip, formatearFecha } from '../../../servicios_reservas';
import { consultarHistorialCliente } from '../../api/consultar_historial/historialApi';
import type { Cliente, HistorialCliente } from '../../types/gestionar_clientes';

interface Props {
  cliente: Cliente;
  onCerrar: () => void;
}

/** CU07 Consultar historial del cliente: sus citas, de la más reciente a la más antigua. */
export default function HistorialClienteDialog({ cliente, onCerrar }: Props) {
  const [historial, setHistorial] = useState<HistorialCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    consultarHistorialCliente(cliente.idCliente)
      .then((datos) => { if (vigente) setHistorial(datos); })
      .catch((err) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [cliente.idCliente]);

  return (
    <Dialog open onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle>Historial de {cliente.nombre}</DialogTitle>
      <DialogContent dividers>
        {cargando && <LinearProgress />}
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
                    <TableCell>{formatearFecha(cita.fecha)}</TableCell>
                    <TableCell>{cita.horaInicio}</TableCell>
                    <TableCell>{cita.servicio}</TableCell>
                    <TableCell>{cita.barbero}</TableCell>
                    <TableCell><EstadoCitaChip estado={cita.estado} /></TableCell>
                    <TableCell>
                      {cita.anticipoPagado ? `Pagado (Bs ${cita.montoAnticipo.toFixed(2)})` : 'No pagado'}
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
