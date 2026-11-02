import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import PaymentIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { listarBarberos, type BarberoDisponible } from '../../../servicios_reservas';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import {
  calcularSaldoVenta, cargarFormularioVenta, obtenerCitaParaCobro, obtenerStripeVenta, registrarVenta,
} from '../../api/registrar_venta/ventasApi';
import ClienteVentaSelector from '../../components/registrar_venta/ClienteVentaSelector';
import ComprobanteVentaDialog from '../../components/registrar_venta/ComprobanteVentaDialog';
import CobroStripeDialog from '../../components/gestionar_pasarela_pago/CobroStripeDialog';
import { MENSAJE_SIN_CAJA } from '../../constants/registrar_venta';
import type { EstadoStripe } from '../../types/gestionar_pasarela_pago';
import type {
  CalculoSaldoVenta, CitaParaCobro, ClienteVenta, ComprobanteVenta, MetodoPagoVenta, OpcionesFormularioVenta,
} from '../../types/registrar_venta';
import {
  formatearCentavos, construirDatosVenta, construirRequestVenta, dineroCentavos,
  type LineaPagoFormulario, type LineaProductoFormulario, type LineaServicioFormulario,
} from '../../utils/registrar_venta/ventaForm';
import { moneda } from '../../utils/gestionar_caja/formato';

type OrigenVenta = 'DIRECTA' | 'CITA';
type MetodoElegido = string;

const IMPORTE = /^\d{1,8}(?:\.\d{1,2})?$/;
const vaciaServicio = (clave: number): LineaServicioFormulario => ({ clave, servicioId: '', empleadoId: '' });
const vacioProducto = (clave: number): LineaProductoFormulario => ({
  clave, productoId: '', cantidad: '1', descripcion: '',
});
const vacioPago = (clave: number, metodoPagoId: number | ''): LineaPagoFormulario => ({
  clave, metodoPagoId, monto: '',
});

export default function RegistrarVentaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tienePermiso } = useAuth();
  const puedeCobrarTarjeta = tienePermiso('PASARELA_PAGO_COBRAR');
  const estado = location.state as { reservaId?: number } | null;
  const reservaInicial = estado?.reservaId !== undefined && Number.isInteger(estado.reservaId)
    ? estado.reservaId : undefined;
  const siguienteClave = useRef(0);
  const nuevaClave = () => ++siguienteClave.current;

  const [origen, setOrigen] = useState<OrigenVenta>(reservaInicial ? 'CITA' : 'DIRECTA');
  const [reservaId, setReservaId] = useState<number | undefined>(reservaInicial);
  const [cita, setCita] = useState<CitaParaCobro | null>(null);
  const [cliente, setCliente] = useState<ClienteVenta | null>(null);
  const [opciones, setOpciones] = useState<OpcionesFormularioVenta | null>(null);
  const [stripe, setStripe] = useState<EstadoStripe | null>(null);
  const [errorStripe, setErrorStripe] = useState('');
  const [cargando, setCargando] = useState(true);
  const [cargandoCita, setCargandoCita] = useState(Boolean(reservaInicial));
  const [servicios, setServicios] = useState<LineaServicioFormulario[]>([]);
  const [productos, setProductos] = useState<LineaProductoFormulario[]>([]);
  const [barberos, setBarberos] = useState<Record<number, BarberoDisponible[]>>({});
  const [modoPago, setModoPago] = useState<MetodoElegido>('');
  const [pagos, setPagos] = useState<LineaPagoFormulario[]>([]);
  const [calculo, setCalculo] = useState<CalculoSaldoVenta | null>(null);
  const [cargandoCalculo, setCargandoCalculo] = useState(false);
  const [error, setError] = useState('');
  const [errorCliente, setErrorCliente] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);
  const [indiceTarjeta, setIndiceTarjeta] = useState<number | null>(null);
  const [comprobante, setComprobante] = useState<ComprobanteVenta | null>(null);

  useEffect(() => {
    let vigente = true;
    const consultaStripe = puedeCobrarTarjeta ? obtenerStripeVenta().catch((err: unknown) => {
      if (vigente) setErrorStripe(obtenerError(err).mensaje);
      return null;
    }) : Promise.resolve(null);
    Promise.all([cargarFormularioVenta(), consultaStripe])
      .then(([formulario, estadoStripe]) => {
        if (vigente) { setOpciones(formulario); setStripe(estadoStripe); }
      })
      .catch((err: unknown) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [puedeCobrarTarjeta]);

  useEffect(() => {
    if (!reservaId || origen !== 'CITA') return;
    let vigente = true;
    obtenerCitaParaCobro(reservaId)
      .then((datos) => {
        if (!vigente) return;
        setCita(datos);
        setCliente(datos.cliente);
        setServicios([{
          clave: nuevaClave(), servicioId: datos.servicioId, empleadoId: datos.empleadoId ?? '',
        }]);
        setError('');
        setErrores({});
        setCalculo(null);
      })
      .catch((err: unknown) => { if (vigente) setError(obtenerError(err).mensaje); })
      .finally(() => { if (vigente) setCargandoCita(false); });
    return () => { vigente = false; };
  }, [origen, reservaId]);

  const serviciosElegidos = useMemo(
    () => [...new Set(servicios.map((linea) => Number(linea.servicioId)).filter(Boolean))],
    [servicios],
  );
  useEffect(() => {
    let vigente = true;
    Promise.all(serviciosElegidos.map(async (idServicio) => [idServicio, await listarBarberos(idServicio)] as const))
      .then((filas) => {
        if (vigente) setBarberos(Object.fromEntries(filas));
      })
      .catch((err: unknown) => { if (vigente) setError(obtenerError(err).mensaje); });
    return () => { vigente = false; };
  }, [serviciosElegidos]);

  const notificarErrorCliente = useCallback((mensaje: string) => setErrorCliente(mensaje), []);
  const saldoCentavos = calculo ? dineroCentavos(calculo.saldoCobrar) : null;
  const totalPagadoCentavos = pagos.reduce((suma, pago) => {
    if (!IMPORTE.test(pago.monto)) return suma;
    return suma + dineroCentavos(Number(pago.monto));
  }, 0);
  const pagosTarjeta = pagos.some((pago) => Boolean(pago.paymentIntentId));
  const bloqueadaPorPago = pagosTarjeta;
  const metodosPago = (opciones?.metodosPago ?? []).filter((metodo) =>
    metodo.proveedor !== 'STRIPE' || puedeCobrarTarjeta);
  const stripeId = metodosPago.find((metodo) => metodo.proveedor === 'STRIPE')?.id;
  const modoMixto = modoPago === 'MIXTO';
  const metodoSimple = metodosPago.find((metodo) => String(metodo.id) === modoPago);

  function invalidarCalculo() {
    setCalculo(null);
    setPagos((actuales) => actuales.map((pago) => pago.paymentIntentId ? pago : { ...pago, monto: '' }));
  }

  function cambiarOrigen(nuevo: OrigenVenta) {
    if (bloqueadaPorPago) return;
    setOrigen(nuevo);
    setError('');
    setReservaId(undefined);
    setCita(null);
    setCliente(null);
    setServicios([]);
    setProductos([]);
    setPagos([]);
    setModoPago('');
    setCalculo(null);
    setErrores({});
  }

  function actualizarServicio(clave: number, cambios: Partial<LineaServicioFormulario>) {
    if (bloqueadaPorPago) return;
    setServicios((lineas) => lineas.map((linea) => linea.clave === clave ? { ...linea, ...cambios } : linea));
    setErrores({});
    invalidarCalculo();
  }

  function actualizarProducto(clave: number, cambios: Partial<LineaProductoFormulario>) {
    if (bloqueadaPorPago) return;
    setProductos((lineas) => lineas.map((linea) => linea.clave === clave ? { ...linea, ...cambios } : linea));
    setErrores({});
    invalidarCalculo();
  }

  function cambiarMetodoPago(valor: string) {
    setModoPago(valor);
    setErrores({});
    setError('');
    if (!valor || saldoCentavos === null || saldoCentavos === 0) {
      setPagos([]);
      return;
    }
    if (valor === 'MIXTO') {
      const efectivo = metodosPago.find((metodo) => metodo.nombre.trim().toUpperCase() === 'EFECTIVO');
      const qr = metodosPago.find((metodo) => metodo.nombre.trim().toUpperCase() === 'QR');
      const candidatosIniciales = efectivo && qr ? [efectivo, qr] : metodosPago.slice(0, 2);
      const metodosIniciales = candidatosIniciales.slice(0, Math.min(candidatosIniciales.length, saldoCentavos));
      const importeBase = Math.floor(saldoCentavos / metodosIniciales.length);
      let centavosRestantes = saldoCentavos;
      setPagos(metodosIniciales.map((metodo, indice) => {
        const importe = indice === metodosIniciales.length - 1
          ? centavosRestantes : importeBase;
        centavosRestantes -= importe;
        return {
          clave: nuevaClave(),
          metodoPagoId: metodo.id,
          monto: formatearCentavos(importe),
        };
      }));
    } else {
      setPagos([{
        clave: nuevaClave(), metodoPagoId: Number(valor), monto: formatearCentavos(saldoCentavos),
      }]);
    }
  }

  function cambiarMetodoLinea(clave: number, valor: string) {
    setPagos((actuales) => actuales.map((pago) => pago.clave === clave
      ? { ...pago, metodoPagoId: valor ? Number(valor) : '', monto: '', paymentIntentId: undefined }
      : pago));
  }

  function cambiarMontoPago(clave: number, monto: string) {
    setPagos((actuales) => actuales.map((pago) => pago.clave === clave
      ? { ...pago, monto, paymentIntentId: undefined } : pago));
  }

  function agregarPago() {
    const disponibles = metodosPago.filter((metodo) => !pagos.some((pago) => pago.metodoPagoId === metodo.id));
    if (disponibles.length) setPagos([...pagos, vacioPago(nuevaClave(), '')]);
  }

  async function calcular(evento?: FormEvent) {
    evento?.preventDefault();
    const v = validarLineas();
    setErrores(v);
    setError('');
    if (Object.keys(v).length || !cliente) {
      if (!cliente) setErrores((actuales) => ({ ...actuales, clienteId: 'Seleccione un cliente' }));
      return null;
    }
    setCargandoCalculo(true);
    try {
      const resultado = await calcularSaldoVenta(construirDatosVenta(
        cliente.idCliente, reservaId, servicios, productos,
      ));
      setCalculo(resultado);
      if (modoPago && resultado.saldoCobrar > 0) {
        const centavos = dineroCentavos(resultado.saldoCobrar);
        setPagos((actuales) => actuales.map((pago) => pago.paymentIntentId ? pago
          : { ...pago, monto: modoMixto ? pago.monto : formatearCentavos(centavos) }));
      } else if (resultado.saldoCobrar === 0) {
        setModoPago('');
        setPagos([]);
      }
      return resultado;
    } catch (err) {
      setError(obtenerError(err).mensaje);
      return null;
    } finally {
      setCargandoCalculo(false);
    }
  }

  function validarLineas() {
    const v: Record<string, string> = {};
    if (!servicios.length && !productos.length) {
      v.detalles = 'Agregue al menos un servicio o producto';
    }
    servicios.forEach((linea, indice) => {
      if (!linea.servicioId) v[`servicios[${indice}]`] = 'Seleccione un servicio';
      if (!linea.empleadoId) v[`servicios[${indice}].empleadoId`] = 'Seleccione el barbero';
    });
    productos.forEach((linea, indice) => {
      if (!linea.productoId) v[`productos[${indice}]`] = 'Seleccione un producto';
      if (!/^[1-9]\d{0,5}$/.test(linea.cantidad) || Number(linea.cantidad) > 100_000) {
        v[`productos[${indice}].cantidad`] = 'Ingrese una cantidad válida';
      }
    });
    return v;
  }

  async function cobrarTarjeta(indice: number) {
    const vigente = calculo ?? await calcular();
    if (!vigente) return;
    const pago = pagos[indice];
    if (!pago || !pago.metodoPagoId) {
      setError('Seleccione el método de pago con tarjeta');
      return;
    }
    if (!stripe?.disponible || stripe.idCajaAbierta === null) {
      setError('El cobro con tarjeta no está disponible o no hay una caja abierta');
      return;
    }
    const importe = modoMixto ? Number(pago.monto) : vigente.saldoCobrar;
    if (!Number.isFinite(importe) || importe <= 0) {
      setError('Ingrese el importe que se cobrará con tarjeta');
      return;
    }
    setPagos((actuales) => actuales.map((linea, indicePago) => indicePago === indice
      ? { ...linea, monto: importe.toFixed(2) } : linea));
    setIndiceTarjeta(indice);
  }

  function validarPagos(saldoACobrarCentavos: number, pagosValidar = pagos): string | null {
    if (saldoACobrarCentavos === 0) return pagosValidar.length ? 'No se requiere un método de pago cuando el saldo es cero.' : null;
    if (!pagosValidar.length) return 'Seleccione un método de pago.';
    if (pagosValidar.some((pago) => !pago.metodoPagoId || !IMPORTE.test(pago.monto) || Number(pago.monto) <= 0)) {
      return 'Seleccione un método e importe válido para cada pago.';
    }
    if (new Set(pagosValidar.map((pago) => pago.metodoPagoId)).size !== pagosValidar.length) {
      return 'No repita un método de pago.';
    }
    const pagadoCentavos = pagosValidar.reduce((suma, pago) => suma + dineroCentavos(Number(pago.monto)), 0);
    if (pagadoCentavos !== saldoACobrarCentavos) {
      return 'La suma de los pagos debe ser exactamente igual al saldo a cobrar.';
    }
    if (pagosValidar.some((pago) => pago.metodoPagoId === stripeId && !pago.paymentIntentId)) {
      return 'Complete el cobro con tarjeta antes de registrar la venta.';
    }
    return null;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    if (guardando || bloqueadaPorPago && !calculo) return;
    setError('');
    const v = validarLineas();
    const clienteActual = cliente;
    if (!clienteActual) {
      v.clienteId = 'Seleccione un cliente';
      setErrores(v);
      return;
    }
    setErrores(v);
    if (Object.keys(v).length) return;
    const saldoActual = await calcular();
    if (!saldoActual) return;
    const pagosActuales = saldoActual.saldoCobrar === 0 ? [] : pagos;
    const errorPago = validarPagos(dineroCentavos(saldoActual.saldoCobrar), pagosActuales);
    if (errorPago) { setError(errorPago); return; }
    if (!opciones?.cajaAbierta) { setError(MENSAJE_SIN_CAJA); return; }

    setGuardando(true);
    try {
      const respuesta = await registrarVenta(construirRequestVenta(
        clienteActual.idCliente, reservaId, servicios, productos, pagosActuales,
      ));
      setComprobante(respuesta);
    } catch (err) {
      const resultado = obtenerError(err);
      setError(resultado.mensaje);
      setErrores(resultado.campos);
    } finally {
      setGuardando(false);
    }
  }

  function candidatosMetodoPago(pago: LineaPagoFormulario): MetodoPagoVenta[] {
    return metodosPago.filter((metodo) => metodo.id === pago.metodoPagoId
      || !pagos.some((otro) => otro.clave !== pago.clave && otro.metodoPagoId === metodo.id));
  }

  const totalLineasServicio = servicios.reduce((suma, linea) => {
    const precio = opciones?.servicios.find((servicio) => servicio.id === linea.servicioId)?.precio ?? 0;
    return suma + dineroCentavos(precio);
  }, 0);
  const totalLineasProducto = productos.reduce((suma, linea) => {
    const producto = opciones?.productos.find((opcion) => opcion.id === linea.productoId);
    return suma + dineroCentavos(producto?.precioVenta ?? 0) * (Number(linea.cantidad) || 0);
  }, 0);
  const estimado = (totalLineasServicio + totalLineasProducto) / 100;

  if (cargando) return <><PageHeader title="Registrar venta" /><LinearProgress /></>;
  if (!opciones) return <>
    <PageHeader title="Registrar venta" />
    <Alert severity="error" action={<Button onClick={() => navigate('/citas')}>Volver</Button>}>
      {error || 'No se pudieron cargar las opciones de venta.'}
    </Alert>
  </>;

  const metodoNombre = (id: number | '') => metodosPago.find((metodo) => metodo.id === id)?.nombre ?? '';

  return <>
    <PageHeader title="Registrar venta"
      description="Cobre los servicios y productos consumidos. Los importes se validan con los precios vigentes del sistema." />
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
    {errorStripe && <Alert severity="warning" sx={{ mb: 2 }}>
      No se pudo consultar la disponibilidad de Stripe: {errorStripe}
    </Alert>}
    {!opciones.cajaAbierta && <Alert severity="warning" sx={{ mb: 2 }}
      action={<Button color="inherit" size="small" onClick={() => navigate('/caja')}>Ir a caja</Button>}>
      {MENSAJE_SIN_CAJA}
    </Alert>}
    {stripe && !stripe.disponible && <Alert severity="info" sx={{ mb: 2 }}>
      El pago con tarjeta no está disponible. Puede elegir efectivo, QR o pago mixto con los métodos activos.
    </Alert>}
    {!puedeCobrarTarjeta && opciones.metodosPago.some((metodo) => metodo.proveedor === 'STRIPE')
      && <Alert severity="info" sx={{ mb: 2 }}>
        Su usuario no tiene permiso para cobrar con tarjeta; se muestran solo los demás métodos activos.
      </Alert>}

    <Paper component="form" onSubmit={enviar} noValidate
      sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3, border: 1, borderColor: 'divider', boxShadow: 2 }}>
      <Stack spacing={3}>
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Origen de la venta</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button variant={origen === 'DIRECTA' ? 'contained' : 'outlined'}
              disabled={bloqueadaPorPago} onClick={() => cambiarOrigen('DIRECTA')}>Venta directa</Button>
            <Button variant={origen === 'CITA' ? 'contained' : 'outlined'}
              disabled={bloqueadaPorPago} onClick={() => {
                if (reservaId) cambiarOrigen('CITA');
                else {
                  setOrigen('CITA');
                  setError('Inicie el cobro desde la cita en la agenda para cargar sus datos.');
                }
              }}>Venta de una cita</Button>
          </Stack>
          {origen === 'CITA' && (
            <Stack spacing={1} sx={{ mt: 2 }}>
              {cargandoCita && <LinearProgress />}
              {!reservaId && <Alert severity="info">
                Abra la agenda y use el botón «Cobrar» de la cita pendiente o confirmada.
              </Alert>}
              {cita && <Alert severity="info">
                Cita #{cita.idReserva} · {cita.fecha} {cita.horaInicio} · {cita.servicioNombre} ·
                {' '}anticipo pagado {moneda(cita.anticipoPagado)}.
              </Alert>}
            </Stack>
          )}
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Cliente</Typography>
          <ClienteVentaSelector cliente={cliente} deshabilitado={origen === 'CITA' || bloqueadaPorPago}
            error={errores.clienteId} onCambiar={(nuevo) => {
              setCliente(nuevo);
              setErrorCliente('');
              setErrores((actuales) => ({ ...actuales, clienteId: '' }));
              invalidarCalculo();
            }} onError={notificarErrorCliente} />
        </Box>
        {errorCliente && <Alert severity="error" onClose={() => setErrorCliente('')}>{errorCliente}</Alert>}

        <Divider />
        <Box sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Servicios y barberos</Typography>
            <Button startIcon={<AddIcon />} disabled={bloqueadaPorPago}
              onClick={() => { setServicios([...servicios, vaciaServicio(nuevaClave())]); invalidarCalculo(); }}>
              Agregar servicio
            </Button>
          </Stack>
          {errores.detalles && <Alert severity="error" sx={{ mb: 1 }}>{errores.detalles}</Alert>}
          <Stack spacing={1.5}>
            {servicios.map((linea, indice) => {
              const servicioReservado = cita && indice === 0;
              const empleadosDisponibles = barberos[Number(linea.servicioId)] ?? [];
              const servicio = opciones.servicios.find((opcion) => opcion.id === linea.servicioId);
              return <Stack key={linea.clave} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'flex-start' } }}>
                <TextField select label="Servicio" required fullWidth disabled={bloqueadaPorPago || !!servicioReservado}
                  value={linea.servicioId}
                  error={!!errores[`servicios[${indice}]`]} helperText={errores[`servicios[${indice}]`] ?? (servicio ? `Precio ${moneda(servicio.precio)}` : '')}
                  onChange={(e) => actualizarServicio(linea.clave, { servicioId: Number(e.target.value), empleadoId: '' })}>
                  {opciones.servicios.map((opcion) => <MenuItem key={opcion.id} value={opcion.id}>{opcion.nombre} · {moneda(opcion.precio)}</MenuItem>)}
                </TextField>
                <TextField select label="Barbero" required fullWidth disabled={bloqueadaPorPago || !linea.servicioId || !!(servicioReservado && cita?.empleadoId)}
                  value={linea.empleadoId}
                  error={!!errores[`servicios[${indice}].empleadoId`]}
                  helperText={errores[`servicios[${indice}].empleadoId`] ?? (servicioReservado && cita?.barberoNombre ? `Cita: ${cita.barberoNombre}` : '')}
                  onChange={(e) => actualizarServicio(linea.clave, { empleadoId: Number(e.target.value) })}>
                  {empleadosDisponibles.map((empleado) => <MenuItem key={empleado.idEmpleado} value={empleado.idEmpleado}>{empleado.nombre}</MenuItem>)}
                </TextField>
                {!servicioReservado && <Button color="error" aria-label="Quitar servicio" disabled={bloqueadaPorPago}
                  onClick={() => { setServicios(servicios.filter((actual) => actual.clave !== linea.clave)); invalidarCalculo(); }}>
                  <DeleteIcon />
                </Button>}
              </Stack>;
            })}
            {servicios.length === 0 && <Typography color="text.secondary">Agregue un servicio o venda solo productos.</Typography>}
          </Stack>
        </Box>

        <Divider />
        <Box sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Productos</Typography>
            <Button startIcon={<AddIcon />} disabled={bloqueadaPorPago}
              onClick={() => { setProductos([...productos, vacioProducto(nuevaClave())]); invalidarCalculo(); }}>
              Agregar producto
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {productos.map((linea, indice) => {
              const producto = opciones.productos.find((opcion) => opcion.id === linea.productoId);
              return <Stack key={linea.clave} direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'flex-start' } }}>
                <TextField select label="Producto" required fullWidth disabled={bloqueadaPorPago}
                  value={linea.productoId} error={!!errores[`productos[${indice}]`]}
                  helperText={errores[`productos[${indice}]`] ?? (producto
                    ? `${moneda(producto.precioVenta)} · stock ${producto.stockActual}` : '')}
                  onChange={(e) => actualizarProducto(linea.clave, { productoId: Number(e.target.value) })}>
                  {opciones.productos.map((opcion) => <MenuItem key={opcion.id} value={opcion.id}>
                    {opcion.nombre} · {moneda(opcion.precioVenta)} · stock {opcion.stockActual}
                  </MenuItem>)}
                </TextField>
                <TextField label="Cantidad" type="number" required sx={{ minWidth: 130 }} disabled={bloqueadaPorPago}
                  value={linea.cantidad} error={!!errores[`productos[${indice}].cantidad`]}
                  helperText={errores[`productos[${indice}].cantidad`] ?? ''}
                  slotProps={{ htmlInput: { min: 1, max: producto?.stockActual ?? 100000, step: 1 } }}
                  onChange={(e) => actualizarProducto(linea.clave, { cantidad: e.target.value })} />
                <TextField label="Descripción (opcional)" sx={{ minWidth: 180 }} disabled={bloqueadaPorPago}
                  value={linea.descripcion} slotProps={{ htmlInput: { maxLength: 150 } }}
                  onChange={(e) => actualizarProducto(linea.clave, { descripcion: e.target.value })} />
                <Button color="error" aria-label="Quitar producto" disabled={bloqueadaPorPago}
                  onClick={() => { setProductos(productos.filter((actual) => actual.clave !== linea.clave)); invalidarCalculo(); }}>
                  <DeleteIcon />
                </Button>
              </Stack>;
            })}
            {productos.length === 0 && <Typography color="text.secondary">No se agregaron productos.</Typography>}
          </Stack>
        </Box>

        <Divider />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Estimado de líneas: {moneda(estimado)}</Typography>
            {calculo && <>
              <Typography>Subtotal: {moneda(calculo.subTotal)}</Typography>
              {calculo.anticipoAplicado > 0 && <Typography>Anticipo aplicado: −{moneda(calculo.anticipoAplicado)}</Typography>}
              <Typography variant="h6">Saldo a cobrar: {moneda(calculo.saldoCobrar)}</Typography>
            </>}
          </Box>
          <Button variant="outlined" disabled={cargandoCalculo || bloqueadaPorPago}
            onClick={() => void calcular()}>
            {cargandoCalculo ? 'Calculando…' : 'Calcular saldo'}
          </Button>
        </Stack>

        {calculo && calculo.saldoCobrar > 0 && <Box sx={{ p: { xs: 1.5, sm: 2 }, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Método de pago</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Elija cómo desea recibir {moneda(calculo.saldoCobrar)}.
          </Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(170px, 1fr))' }, gap: 1 }}>
              {metodosPago.map((metodo) => {
                const seleccionado = modoPago === String(metodo.id);
                const Icono = metodo.proveedor === 'STRIPE' ? CreditCardOutlinedIcon
                  : metodo.nombre.trim().toUpperCase() === 'QR' ? QrCode2OutlinedIcon : AccountBalanceWalletOutlinedIcon;
                const detalle = metodo.proveedor === 'STRIPE' ? 'Tarjeta bancaria'
                  : metodo.nombre.trim().toUpperCase() === 'QR' ? 'Transferencia QR' : 'Pago en caja';
                return <Button key={metodo.id} variant={seleccionado ? 'contained' : 'outlined'}
                  aria-pressed={seleccionado} disabled={bloqueadaPorPago}
                  onClick={() => cambiarMetodoPago(String(metodo.id))}
                  sx={{ minHeight: 76, justifyContent: 'flex-start', textAlign: 'left', px: 2 }}>
                  <Icono sx={{ mr: 1.5, fontSize: 28 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{metodo.nombre}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>{detalle}</Typography>
                  </Box>
                </Button>;
              })}
              {metodosPago.length > 1 && <Button variant={modoMixto ? 'contained' : 'outlined'}
                aria-pressed={modoMixto} disabled={bloqueadaPorPago}
                onClick={() => cambiarMetodoPago('MIXTO')}
                sx={{ minHeight: 76, justifyContent: 'flex-start', textAlign: 'left', px: 2 }}>
                <SwapHorizOutlinedIcon sx={{ mr: 1.5, fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {metodosPago.some((metodo) => metodo.nombre.trim().toUpperCase() === 'EFECTIVO')
                      && metodosPago.some((metodo) => metodo.nombre.trim().toUpperCase() === 'QR')
                      ? 'Efectivo + QR' : 'Pago mixto'}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>Dividir el saldo</Typography>
                </Box>
              </Button>}
            </Box>
            {modoPago && <Alert severity="info">
              {modoMixto ? 'Distribuya el saldo entre los métodos seleccionados; la suma debe coincidir exactamente.'
                : `${metodoNombre(Number(modoPago))}: debe cubrir el saldo completo de ${moneda(calculo.saldoCobrar)}.`}
            </Alert>}
            {modoMixto && <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Distribución del pago</Typography>}
            {modoMixto ? pagos.map((pago, indice) => {
              const metodo = metodosPago.find((opcion) => opcion.id === pago.metodoPagoId);
              const esTarjeta = metodo?.proveedor === 'STRIPE';
              const Icono = metodo?.proveedor === 'STRIPE' ? CreditCardOutlinedIcon
                : metodo?.nombre.trim().toUpperCase() === 'QR' ? QrCode2OutlinedIcon : AccountBalanceWalletOutlinedIcon;
              return <Paper key={pago.clave} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: { sm: 150 } }}>
                    <Icono color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {metodo?.nombre ?? 'Método de pago'}
                    </Typography>
                  </Stack>
                  <TextField select label="Método" required fullWidth value={pago.metodoPagoId}
                    disabled={bloqueadaPorPago || Boolean(pago.paymentIntentId)}
                    onChange={(e) => cambiarMetodoLinea(pago.clave, e.target.value)}>
                    <MenuItem value="" disabled>Seleccione</MenuItem>
                    {candidatosMetodoPago(pago).map((opcion) => <MenuItem key={opcion.id} value={opcion.id}>{opcion.nombre}</MenuItem>)}
                  </TextField>
                  <TextField label={`Importe (${metodo?.moneda ?? 'BOB'})`} type="number" required fullWidth
                    value={pago.monto} disabled={bloqueadaPorPago || Boolean(pago.paymentIntentId)}
                    slotProps={{ htmlInput: { min: '0.01', step: '0.01' } }}
                    onChange={(e) => cambiarMontoPago(pago.clave, e.target.value)} />
                  {esTarjeta && (pago.paymentIntentId
                    ? <Alert severity="success">Tarjeta cobrada y registrada</Alert>
                    : <Button variant="outlined" startIcon={<PaymentIcon />} disabled={indiceTarjeta !== null}
                      onClick={() => void cobrarTarjeta(indice)}>Cobrar tarjeta</Button>)}
                  <Button color="error" aria-label={`Quitar pago ${metodo?.nombre ?? ''}`} disabled={bloqueadaPorPago || pagos.length <= 1}
                    onClick={() => setPagos(pagos.filter((actual) => actual.clave !== pago.clave))}><DeleteIcon /></Button>
                </Stack>
              </Paper>;
            }) : metodoSimple && pagos[0] && <Stack spacing={1}>
              <Typography>{metodoSimple.nombre}: {moneda(calculo.saldoCobrar)}</Typography>
              {metodoSimple.proveedor === 'STRIPE' && (
                pagos[0].paymentIntentId
                  ? <Alert severity="success">Cobro con tarjeta confirmado.</Alert>
                  : <Button variant="outlined" startIcon={<PaymentIcon />} disabled={indiceTarjeta !== null}
                    onClick={() => void cobrarTarjeta(0)}>Cobrar {moneda(calculo.saldoCobrar)} con tarjeta</Button>
              )}
            </Stack>}
            {modoMixto && <Button startIcon={<AddIcon />} disabled={bloqueadaPorPago
              || pagos.length >= metodosPago.length} onClick={agregarPago} sx={{ alignSelf: 'flex-start' }}>
              Agregar método de pago
            </Button>}
            {modoMixto && <Typography color={saldoCentavos === totalPagadoCentavos ? 'success.main' : 'error.main'}>
              Total distribuido: {moneda(totalPagadoCentavos / 100)} / {moneda(calculo.saldoCobrar)}
              {saldoCentavos !== null && saldoCentavos !== totalPagadoCentavos
                ? ` · Diferencia: ${moneda(Math.abs(saldoCentavos - totalPagadoCentavos) / 100)}` : ''}
            </Typography>}
          </Stack>
        </Box>}

        {calculo?.saldoCobrar === 0 && <Alert severity="success">
          El anticipo cubre el total; no se necesita registrar otro método de pago.
        </Alert>}

        {bloqueadaPorPago && <Alert severity="warning">
          El cobro con tarjeta ya se realizó. Mantenga los importes y detalles de esta venta sin cambios y reintente el registro si ocurre un error.
        </Alert>}
        <Divider />
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/citas')} disabled={guardando || bloqueadaPorPago}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={guardando || cargandoCalculo || !opciones.cajaAbierta}
            loading={guardando}>
            Registrar venta
          </Button>
        </Stack>
      </Stack>
    </Paper>

    {indiceTarjeta !== null && stripe && pagos[indiceTarjeta] && (
      <CobroStripeDialog
        pasarela={stripe}
        concepto={`Venta CU20${reservaId ? ` · Cita #${reservaId}` : ''}`}
        monto={Number(pagos[indiceTarjeta].monto)}
        onCerrar={() => setIndiceTarjeta(null)}
        onCobrado={(cobro) => {
          setPagos((actuales) => actuales.map((pago, indice) => indice === indiceTarjeta
            ? { ...pago, monto: cobro.monto.toFixed(2), paymentIntentId: cobro.referencia } : pago));
          setIndiceTarjeta(null);
        }}
      />
    )}
    {comprobante && <ComprobanteVentaDialog comprobante={comprobante} onCerrar={() => {
      setComprobante(null);
      navigate('/citas', { state: { mensaje: `Venta #${comprobante.idNotaVenta} registrada correctamente.` } });
    }} />}
  </>;
}
