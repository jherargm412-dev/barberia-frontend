import { useEffect, useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PaymentIcon from '@mui/icons-material/PaymentsOutlined';
import CalculateIcon from '@mui/icons-material/CalculateOutlined';

import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { obtenerCajaActual } from '../../../ventas_caja';
import { listarEmpleados } from '../../api/gestionar_barberos/empleadosApi';
import { calcularLiquidacion, pagarLiquidacion } from '../../api/liquidar_comisiones/liquidacionApi';
import type { LiquidacionResponse } from '../../types/liquidar_comisiones';

export default function LiquidacionPage() {
  const [empleados, setEmpleados] = useState<{ idEmpleado: number, nombre: string }[]>([]);
  const [cajaId, setCajaId] = useState<number | null>(null);
  
  const [empleadoId, setEmpleadoId] = useState<number | ''>('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  const [calculo, setCalculo] = useState<LiquidacionResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    let vigente = true;

    // Solo los comisionistas activos tienen comisiones; el pago sale de la caja abierta (CU21).
    const peticionEmpleados = listarEmpleados({
      q: '', rol: '', estado: 'ACTIVO', tipoContrato: 'COMISIONISTA', page: 0, size: 100,
    });
    const peticionCaja = obtenerCajaActual();

    Promise.all([peticionEmpleados, peticionCaja])
      .then(([pagina, cajaActual]) => {
        if (vigente) {
          setEmpleados(pagina.contenido.map((e) => ({ idEmpleado: e.idEmpleado, nombre: e.nombre })));
          setCajaId(cajaActual?.estado === 'ABIERTA' ? cajaActual.idCaja : null);
        }
      })
      .catch((err: unknown) => {
        if (vigente) {
          setError(obtenerError(err).mensaje);
        }
      });

    return () => { vigente = false; };
  }, []);

  async function handleCalcular(e: FormEvent) {
    e.preventDefault();
    if (!empleadoId || !fechaInicio || !fechaFin) {
      setError('Seleccione un barbero y el rango de fechas.');
      return;
    }
    setCargando(true);
    setError('');
    setExito('');
    setCalculo(null);
    
    try {
      const data = await calcularLiquidacion(Number(empleadoId), { fechaInicio, fechaFin });
      setCalculo(data);
      if (data.totalPagar === 0) {
        setError('El barbero no tiene comisiones pendientes en este periodo.');
      }
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setCargando(false);
    }
  }

  async function handlePagar() {
    if (!calculo || !empleadoId) return;
    if (!cajaId) {
      setError('Debe abrir una caja (CU21) antes de pagar comisiones.');
      return;
    }
    if (!window.confirm(`¿Confirmar pago de Bs. ${calculo.totalPagar.toFixed(2)} a ${calculo.nombreEmpleado}?`)) return;

    setGuardando(true);
    try {
      await pagarLiquidacion(Number(empleadoId), cajaId, { fechaInicio, fechaFin });
      setExito('¡Liquidación registrada exitosamente en la caja!');
      setCalculo(null);
      setEmpleadoId('');
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHeader 
        title="Liquidación de Comisiones" 
        description="Calcule y pague las comisiones pendientes del personal (CU18)." 
      />
      
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setExito('')}>{exito}</Alert>}
      {!cajaId && <Alert severity="warning" sx={{ mb: 2 }}>No hay una caja abierta. El pago será bloqueado.</Alert>}

      <Paper component="form" onSubmit={handleCalcular} sx={{ p: 3, mb: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            label="Barbero"
            fullWidth
            value={empleadoId}
            onChange={(e) => setEmpleadoId(Number(e.target.value))}
            required
          >
            {empleados.map((emp) => (
              <MenuItem key={emp.idEmpleado} value={emp.idEmpleado}>{emp.nombre}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Desde"
            type="date"
            fullWidth
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />

          <TextField
            label="Hasta"
            type="date"
            fullWidth
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
          />

          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            startIcon={<CalculateIcon />}
            disabled={cargando}
            sx={{ minWidth: 200, height: 56 }}
          >
            {cargando ? 'Calculando...' : 'Calcular'}
          </Button>
        </Stack>
      </Paper>

      {cargando && <LinearProgress sx={{ mb: 2 }} />}

      {calculo && calculo.totalPagar > 0 && (
        <Paper sx={{ p: 3, borderRadius: 3, border: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Resumen para: {calculo.nombreEmpleado}
          </Typography>
          
          <Table size="small" sx={{ mb: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Concepto</TableCell>
                <TableCell align="right">Comisión</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {calculo.desglose.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Alert severity={item.tipo === 'SERVICIO' ? 'info' : 'success'} sx={{ py: 0, px: 1, display: 'inline-flex' }}>
                      {item.tipo}
                    </Alert>
                  </TableCell>
                  <TableCell>{item.concepto}</TableCell>
                  <TableCell align="right">Bs. {item.monto.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Servicios: Bs. {calculo.totalServicios.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">Total Productos: Bs. {calculo.totalProductos.toFixed(2)}</Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>Total a Pagar: Bs. {calculo.totalPagar.toFixed(2)}</Typography>
            </Box>
            
            <Button 
              variant="contained" 
              color="success" 
              size="large"
              startIcon={<PaymentIcon />}
              onClick={handlePagar}
              disabled={guardando || !cajaId}
            >
              {guardando ? 'Procesando...' : 'Confirmar Pago'}
            </Button>
          </Stack>
        </Paper>
      )}
    </>
  );
}