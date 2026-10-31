import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Alert, Autocomplete, Box, Button, Divider, IconButton, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { opcionesCompra, registrarCompra } from '../../api/registrar_compras/comprasApi';
import { hoyBolivia, moneda } from '../../constants/registrar_compras';
import type { OpcionesCompra } from '../../types/registrar_compras';

type Producto = OpcionesCompra['productos'][number];

interface Linea {
  clave: number;
  producto: Producto | null;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
}

let siguienteClave = 1;
const lineaVacia = (): Linea => ({ clave: siguienteClave++, producto: null, cantidad: '1', precioUnitario: '', descuento: '' });
const IMPORTE = /^\d{1,8}(\.\d{1,2})?$/;

function subTotal(l: Linea) {
  const valor = Number(l.cantidad || 0) * Number(l.precioUnitario || 0) - Number(l.descuento || 0);
  return Number.isFinite(valor) ? Math.round(valor * 100) / 100 : 0;
}

/** CU25: el administrador registra la mercadería recibida de un proveedor; el stock se suma al guardar. */
export default function CompraRegistrarPage() {
  const navigate = useNavigate();
  const [opciones, setOpciones] = useState<OpcionesCompra | null>(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [cabecera, setCabecera] = useState({ proveedorId: '', metodoPagoId: '', nroFact: '', fecha: hoyBolivia() });
  const [lineas, setLineas] = useState<Linea[]>([lineaVacia()]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    opcionesCompra()
      .then((r) => { if (vigente) setOpciones(r); })
      .catch((err) => { if (vigente) setErrorCarga(obtenerError(err).mensaje); });
    return () => { vigente = false; };
  }, []);

  const total = lineas.reduce((suma, l) => suma + subTotal(l), 0);
  const metodo = opciones?.metodosPago.find((m) => String(m.idMetodoPago) === cabecera.metodoPagoId);
  const elegidos = new Set(lineas.map((l) => l.producto?.idProducto));

  function cambiarLinea(clave: number, cambios: Partial<Linea>) {
    setLineas((prev) => prev.map((l) => (l.clave === clave ? { ...l, ...cambios } : l)));
  }

  function validar() {
    const v: Record<string, string> = {};
    if (!cabecera.proveedorId) v.proveedorId = 'Seleccione el proveedor';
    if (!cabecera.metodoPagoId) v.metodoPagoId = 'Seleccione el método de pago';
    if (cabecera.fecha > hoyBolivia()) v.fecha = 'No puede ser una fecha futura';
    lineas.forEach((l, i) => {
      if (!l.producto) v[`detalles[${i}]`] = 'Seleccione el producto';
      if (!/^[1-9]\d{0,5}$/.test(l.cantidad) || Number(l.cantidad) > 100_000) v[`detalles[${i}].cantidad`] = 'Entre 1 y 100000';
      if (!IMPORTE.test(l.precioUnitario)) v[`detalles[${i}].precioUnitario`] = 'Importe no válido';
      if (l.descuento && !IMPORTE.test(l.descuento)) v[`detalles[${i}].descuento`] = 'Importe no válido';
      else if (subTotal(l) < 0) v[`detalles[${i}].descuento`] = 'Supera cantidad x precio';
    });
    if (!Object.keys(v).length && total <= 0) v.detalles = 'El total de la compra debe ser mayor a 0';
    return v;
  }

  async function enviar(event: FormEvent) {
    event.preventDefault();
    const validacion = validar();
    setErrores(validacion);
    setError('');
    if (Object.keys(validacion).length) return;
    setGuardando(true);
    try {
      const r = await registrarCompra({
        proveedorId: Number(cabecera.proveedorId),
        metodoPagoId: Number(cabecera.metodoPagoId),
        nroFact: cabecera.nroFact,
        fecha: cabecera.fecha,
        detalles: lineas.map((l) => ({
          productoId: l.producto!.idProducto,
          cantidad: Number(l.cantidad),
          precioUnitario: Number(l.precioUnitario),
          descuento: Number(l.descuento || 0),
        })),
      });
      navigate('/compras', { state: { mensaje: `${r.mensaje} (#${r.compra.idNotaCompra} por ${moneda(r.compra.subTotal)})` } });
    } catch (err) {
      const resultado = obtenerError(err);
      setError(resultado.mensaje);
      setErrores(resultado.campos);
    } finally {
      setGuardando(false);
    }
  }

  if (errorCarga) {
    return <>
      <PageHeader title="Registrar compra" />
      <Alert severity="error" action={<Button onClick={() => navigate('/compras')}>Volver</Button>}>{errorCarga}</Alert>
    </>;
  }
  if (!opciones) return <><PageHeader title="Registrar compra" /><LinearProgress /></>;

  const sinDatos = opciones.proveedores.length === 0 || opciones.productos.length === 0;
  const errorLinea = (i: number, campo?: string) => errores[campo ? `detalles[${i}].${campo}` : `detalles[${i}]`];

  return <>
    <PageHeader title="Registrar compra" description="Mercadería recibida de un proveedor. Al guardar, las cantidades se suman al stock." />
    {sinDatos && <Alert severity="warning" sx={{ mb: 2 }}>
      Para registrar una compra necesita al menos un proveedor activo y un producto o insumo activo.
    </Alert>}
    <Paper component="form" onSubmit={enviar} noValidate sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={2.5}>
        {error && <Alert severity="error">{error}</Alert>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select required fullWidth label="Proveedor" value={cabecera.proveedorId} disabled={guardando}
            error={!!errores.proveedorId} helperText={errores.proveedorId}
            onChange={(e) => { setCabecera({ ...cabecera, proveedorId: e.target.value }); setErrores({ ...errores, proveedorId: '' }); }}>
            {opciones.proveedores.map((p) => <MenuItem key={p.idProveedor} value={String(p.idProveedor)}>{p.empresa} — NIT {p.nit}</MenuItem>)}
          </TextField>
          <TextField select required label="Método de pago" value={cabecera.metodoPagoId} disabled={guardando} sx={{ minWidth: 200 }}
            error={!!errores.metodoPagoId} helperText={errores.metodoPagoId}
            onChange={(e) => { setCabecera({ ...cabecera, metodoPagoId: e.target.value }); setErrores({ ...errores, metodoPagoId: '' }); }}>
            {opciones.metodosPago.map((m) => <MenuItem key={m.idMetodoPago} value={String(m.idMetodoPago)}>{m.nombre}</MenuItem>)}
          </TextField>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="N.º de factura o nota" value={cabecera.nroFact} disabled={guardando} fullWidth
            slotProps={{ htmlInput: { maxLength: 30 } }} error={!!errores.nroFact} helperText={errores.nroFact ?? 'Opcional'}
            onChange={(e) => { setCabecera({ ...cabecera, nroFact: e.target.value }); setErrores({ ...errores, nroFact: '' }); }} />
          <TextField type="date" required label="Fecha de compra" value={cabecera.fecha} disabled={guardando} sx={{ minWidth: 200 }}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hoyBolivia() } }}
            error={!!errores.fecha} helperText={errores.fecha}
            onChange={(e) => { setCabecera({ ...cabecera, fecha: e.target.value }); setErrores({ ...errores, fecha: '' }); }} />
        </Stack>
        {metodo?.afectaCaja && <Alert severity="info">
          El pago en efectivo se registrará como egreso en la caja abierta. Si no hay una caja abierta, la compra no se podrá guardar.
        </Alert>}

        <Divider />
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Productos comprados</Typography>
        {errores.detalles && <Alert severity="error">{errores.detalles}</Alert>}
        {lineas.map((l, i) => <Stack key={l.clave} direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'flex-start' } }}>
          <Autocomplete sx={{ flex: 3, minWidth: 220 }} options={opciones.productos} value={l.producto} disabled={guardando}
            getOptionLabel={(p) => `${p.nombre}${p.tipo === 'INSUMO' ? ' (insumo)' : ''}`}
            getOptionDisabled={(p) => elegidos.has(p.idProducto) && p.idProducto !== l.producto?.idProducto}
            isOptionEqualToValue={(a, b) => a.idProducto === b.idProducto}
            onChange={(_, p) => {
              cambiarLinea(l.clave, { producto: p, precioUnitario: p && !l.precioUnitario ? p.costo.toFixed(2) : l.precioUnitario });
              setErrores({ ...errores, [`detalles[${i}]`]: '' });
            }}
            renderInput={(params) => <TextField {...params} required label="Producto o insumo" error={!!errorLinea(i)}
              helperText={errorLinea(i) ?? (l.producto ? `Stock actual: ${l.producto.stockActual}` : undefined)} />} />
          <TextField label="Cantidad" required value={l.cantidad} disabled={guardando} sx={{ flex: 1, minWidth: 100 }}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }} error={!!errorLinea(i, 'cantidad')} helperText={errorLinea(i, 'cantidad')}
            onChange={(e) => { cambiarLinea(l.clave, { cantidad: e.target.value }); setErrores({ ...errores, [`detalles[${i}].cantidad`]: '' }); }} />
          <TextField label="Precio unitario (Bs)" required value={l.precioUnitario} disabled={guardando} sx={{ flex: 1.3, minWidth: 130 }}
            slotProps={{ htmlInput: { inputMode: 'decimal' } }} error={!!errorLinea(i, 'precioUnitario')} helperText={errorLinea(i, 'precioUnitario')}
            onChange={(e) => { cambiarLinea(l.clave, { precioUnitario: e.target.value }); setErrores({ ...errores, [`detalles[${i}].precioUnitario`]: '' }); }} />
          <TextField label="Descuento (Bs)" value={l.descuento} disabled={guardando} sx={{ flex: 1.2, minWidth: 120 }}
            slotProps={{ htmlInput: { inputMode: 'decimal' } }} error={!!errorLinea(i, 'descuento')} helperText={errorLinea(i, 'descuento')}
            onChange={(e) => { cambiarLinea(l.clave, { descuento: e.target.value }); setErrores({ ...errores, [`detalles[${i}].descuento`]: '' }); }} />
          <Box sx={{ flex: 1, minWidth: 110, pt: { md: 2 }, textAlign: { md: 'right' } }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { md: 'none' } }}>Subtotal</Typography>
            <Typography sx={{ fontWeight: 600 }}>{moneda(subTotal(l))}</Typography>
          </Box>
          <IconButton aria-label={`Quitar línea ${i + 1}`} disabled={guardando || lineas.length === 1}
            onClick={() => { setLineas((prev) => prev.filter((x) => x.clave !== l.clave)); setErrores({}); }} sx={{ alignSelf: { xs: 'flex-end', md: 'center' } }}>
            <DeleteIcon />
          </IconButton>
        </Stack>)}
        <Box>
          <Button startIcon={<AddIcon />} onClick={() => setLineas((prev) => [...prev, lineaVacia()])}
            disabled={guardando || lineas.length >= opciones.productos.length}>Agregar producto</Button>
        </Box>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Total</Typography>
          <Typography variant="h6">{moneda(total)}</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={guardando} disabled={sinDatos}>Registrar compra</Button>
          <Button onClick={() => navigate('/compras')} disabled={guardando}>Cancelar</Button>
        </Stack>
      </Stack>
    </Paper>
  </>;
}
