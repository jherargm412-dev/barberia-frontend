import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import Table from '../../../../shared/components/ResponsiveTable';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarCajasCerradas, listarMovimientos } from '../../api/gestionar_caja/cajaApi';
import type { Caja, MovimientoCaja } from '../../types/gestionar_caja';
import { fecha, hoyBolivia, moneda, resultadoArqueo } from '../../utils/gestionar_caja/formato';

/** CU21: historial de cajas cerradas con su arqueo; cada una se abre con sus movimientos para revisar o imprimir. */
export default function CajaHistorialPage() {
  const navigate = useNavigate();
  const [escritos, setEscritos] = useState({ desde: hoyBolivia(-30), hasta: hoyBolivia() });
  const [filtros, setFiltros] = useState(escritos);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState<Caja | null>(null);

  useEffect(() => {
    let vigente = true;
    listarCajasCerradas(filtros.desde, filtros.hasta)
      .then((lista) => {
        if (!vigente) return;
        setCajas(lista);
        setError('');
      })
      .catch((err) => {
        if (!vigente) return;
        setCajas([]); // no dejar a la vista los resultados de la búsqueda anterior
        setError(obtenerError(err).mensaje);
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setFiltros({ ...escritos });
  }

  return (
    <>
      <PageHeader
        title="Historial de cajas"
        description="Cajas cerradas con su arqueo: lo esperado, lo contado y la diferencia."
        action={
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/caja')}>
            Volver a la caja
          </Button>
        }
      />

      <Paper component="form" onSubmit={buscar} noValidate sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          type="date"
          label="Abiertas desde"
          value={escritos.desde}
          onChange={(e) => setEscritos({ ...escritos, desde: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          label="Hasta"
          value={escritos.hasta}
          onChange={(e) => setEscritos({ ...escritos, hasta: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Buscar
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {cargando && <LinearProgress />}

      <TableContainer component={Paper}>
        <Table
          columns={['N.º', 'Apertura', 'Cierre', 'Inicial', 'Esperado', 'Contado', 'Resultado', 'Cerró']}
          sx={{ minWidth: 800 }}
        >
          <TableHead>
            <TableRow>
              <TableCell>N.º</TableCell>
              <TableCell>Apertura</TableCell>
              <TableCell>Cierre</TableCell>
              <TableCell align="right">Inicial</TableCell>
              <TableCell align="right">Esperado</TableCell>
              <TableCell align="right">Contado</TableCell>
              <TableCell>Resultado</TableCell>
              <TableCell>Cerró</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!cargando && cajas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No hay cajas cerradas en esas fechas
                </TableCell>
              </TableRow>
            )}
            {cajas.map((c) => {
              const resultado = resultadoArqueo(c.diferencia);
              return (
                <TableRow key={c.idCaja} hover sx={{ cursor: 'pointer' }} onClick={() => setDetalle(c)}>
                  <TableCell>{c.idCaja}</TableCell>
                  <TableCell>{fecha(c.fechaApertura)}</TableCell>
                  <TableCell>{c.fechaCierre ? fecha(c.fechaCierre) : '—'}</TableCell>
                  <TableCell align="right">{moneda(c.montoInicial)}</TableCell>
                  <TableCell align="right">{moneda(c.saldoEsperado)}</TableCell>
                  <TableCell align="right">{c.efectivoContado === null ? '—' : moneda(c.efectivoContado)}</TableCell>
                  <TableCell>
                    <Chip size="small" color={resultado.color} variant="outlined" label={resultado.texto} />
                  </TableCell>
                  <TableCell>{c.responsableCierre ?? '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {detalle && <DetalleCaja key={detalle.idCaja} caja={detalle} onCerrar={() => setDetalle(null)} />}
    </>
  );
}

/** Reporte de cuadre de una caja cerrada, con todos sus movimientos; se puede imprimir. */
function DetalleCaja({ caja, onCerrar }: { caja: Caja; onCerrar: () => void }) {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[] | null>(null);
  const [error, setError] = useState('');
  const resultado = resultadoArqueo(caja.diferencia);

  useEffect(() => {
    let vigente = true;
    listarMovimientos(caja.idCaja)
      .then((lista) => vigente && setMovimientos(lista))
      .catch((err) => vigente && setError(obtenerError(err).mensaje));
    return () => {
      vigente = false;
    };
  }, [caja.idCaja]);

  const fila = (etiqueta: string, valor: string) => (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2">{valor}</Typography>
    </Stack>
  );

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="md">
      <DialogTitle>Caja N.º {caja.idCaja}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {fila('Apertura', `${fecha(caja.fechaApertura)} · ${caja.responsableApertura}`)}
          {fila('Cierre', `${caja.fechaCierre ? fecha(caja.fechaCierre) : '—'} · ${caja.responsableCierre ?? '—'}`)}
          {fila('Monto inicial', moneda(caja.montoInicial))}
          {fila('Ingresos en efectivo', moneda(caja.ingresosEfectivo))}
          {fila('Ingresos por QR (no van al cajón)', moneda(caja.ingresosQr))}
          {fila('Egresos en efectivo', moneda(caja.egresosEfectivo))}
          {fila('Efectivo esperado', moneda(caja.saldoEsperado))}
          {fila('Efectivo contado', caja.efectivoContado === null ? '—' : moneda(caja.efectivoContado))}
          <Box sx={{ alignSelf: 'flex-end' }}>
            <Chip color={resultado.color} label={resultado.texto} />
          </Box>
          {caja.observacionCierre && fila('Observación', caja.observacionCierre)}
        </Stack>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Movimientos
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {!movimientos && !error && <LinearProgress />}
        {movimientos && (
          <TableContainer component={Paper} variant="outlined">
            <Table columns={['Fecha', 'Tipo', 'Concepto', 'Método', 'Monto', 'Responsable']} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Concepto</TableCell>
                  <TableCell>Método</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Responsable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Sin movimientos
                    </TableCell>
                  </TableRow>
                )}
                {movimientos.map((m) => (
                  <TableRow key={m.idMovimientoCaja}>
                    <TableCell>{fecha(m.fecha)}</TableCell>
                    <TableCell>{m.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}</TableCell>
                    <TableCell>{m.concepto}</TableCell>
                    <TableCell>{m.medioPago}</TableCell>
                    <TableCell align="right">{moneda(m.monto)}</TableCell>
                    <TableCell>{m.responsable}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button startIcon={<PrintIcon />} onClick={() => window.print()}>
          Imprimir
        </Button>
        <Button variant="contained" onClick={onCerrar}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
