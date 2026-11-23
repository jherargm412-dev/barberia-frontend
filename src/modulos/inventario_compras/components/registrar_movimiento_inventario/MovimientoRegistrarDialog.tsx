import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, LinearProgress,
  MenuItem, Stack, TextField, Typography } from '@mui/material';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { opcionesMovimiento, registrarMovimiento } from '../../api/registrar_movimiento_inventario/movimientosApi';
import { MAX_CANTIDAD_MOVIMIENTO, MAX_MOTIVO } from '../../constants/registrar_movimiento_inventario';
import { moneda } from '../../constants/registrar_compras';
import type { OpcionesMovimiento, ProductoOpcion, RespuestaMovimiento, TipoMovimiento } from '../../types/registrar_movimiento_inventario';

interface Props {
  abierto: boolean;
  /** Producto ya elegido (ej. desde la fila de la tabla); opcional. */
  productoInicial?: number;
  onCerrar: () => void;
  onRegistrado: (respuesta: RespuestaMovimiento) => void;
}

type Campo = 'productoId' | 'tipo' | 'cantidad' | 'costoUnitario' | 'motivo';
type Errores = Partial<Record<Campo, string>>;

const MENSAJE_CAMPOS_VACIOS = 'Ingrese los campos obligatorios';

/**
 * CU26 paso 1 y 2: carga productos y tipos permitidos, muestra "Stock actual → Stock después" en vivo y registra.
 * La página lo vuelve a montar (key) cada vez que se abre, así empieza vacío.
 */
export default function MovimientoRegistrarDialog({ abierto, productoInicial, onCerrar, onRegistrado }: Props) {
  const [opciones, setOpciones] = useState<OpcionesMovimiento | null>(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [productoId, setProductoId] = useState<number | null>(productoInicial ?? null);
  const [tipo, setTipo] = useState<TipoMovimiento | ''>('');
  const [cantidad, setCantidad] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [motivo, setMotivo] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;
    opcionesMovimiento()
      .then((r) => {
        if (!vigente) return;
        setOpciones(r);
        // La Recepcionista solo tiene un tipo: se elige solo.
        if (r.tipos.length === 1) setTipo(r.tipos[0].valor);
      })
      .catch((err) => { if (vigente) setErrorCarga(obtenerError(err).mensaje); });
    return () => { vigente = false; };
  }, []);

  const tipoElegido = opciones?.tipos.find((t) => t.valor === tipo) ?? null;
  // El consumo interno solo admite insumos.
  const productos = useMemo(
    () => (opciones?.productos ?? []).filter((p) => !tipoElegido?.soloInsumos || p.tipo === 'INSUMO'),
    [opciones, tipoElegido],
  );
  const producto: ProductoOpcion | null = productos.find((p) => p.idProducto === productoId) ?? null;

  const cantidadValida = /^\d{1,6}$/.test(cantidad.trim()) && Number(cantidad) > 0;
  const stockNuevo = producto && tipoElegido && cantidadValida
    ? producto.stockActual + (tipoElegido.suma ? 1 : -1) * Number(cantidad)
    : null;
  const costoValido = /^\d{1,8}([.,]\d{1,2})?$/.test(costoUnitario.trim());
  const costoNumero = costoValido ? Number(costoUnitario.trim().replace(',', '.')) : null;
  // Valorización: la entrada usa el costo indicado; el resto, el costo promedio actual.
  const costoTotal = producto && cantidadValida
    ? (tipoElegido?.pideCosto ? (costoNumero ?? 0) : producto.costoPromedio) * Number(cantidad)
    : null;

  function limpiar(campo: Campo) {
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function cambiarTipo(valor: TipoMovimiento) {
    setTipo(valor);
    limpiar('tipo');
    // Si el producto elegido no es un insumo y el nuevo tipo es consumo interno, se quita.
    const nuevo = opciones?.tipos.find((t) => t.valor === valor);
    const actual = opciones?.productos.find((p) => p.idProducto === productoId);
    if (nuevo?.soloInsumos && actual && actual.tipo !== 'INSUMO') setProductoId(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorGeneral('');

    // Mismas reglas que MovimientoInventarioService.validar.
    const nuevos: Errores = {};
    let vacios = false;
    if (!productoId) { nuevos.productoId = 'Obligatorio'; vacios = true; }
    if (!tipoElegido) { nuevos.tipo = 'Obligatorio'; vacios = true; }
    if (!cantidad.trim()) { nuevos.cantidad = 'Obligatorio'; vacios = true; }
    else if (!cantidadValida) nuevos.cantidad = 'Debe ser un número entero mayor a 0';
    else if (Number(cantidad) > MAX_CANTIDAD_MOVIMIENTO) nuevos.cantidad = `Máximo ${MAX_CANTIDAD_MOVIMIENTO.toLocaleString('es-BO')}`;
    else if (stockNuevo !== null && stockNuevo < 0) nuevos.cantidad = `Supera el stock actual (máximo ${producto?.stockActual})`;
    if (tipoElegido?.pideCosto) {
      if (!costoUnitario.trim()) { nuevos.costoUnitario = 'Obligatorio (puede ser 0)'; vacios = true; }
      else if (!costoValido) nuevos.costoUnitario = 'Monto no negativo con máximo 2 decimales';
    }
    if (tipoElegido?.pideMotivo && !motivo.trim()) { nuevos.motivo = 'Indique el motivo'; vacios = true; }
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) {
      setErrorGeneral(vacios ? MENSAJE_CAMPOS_VACIOS : 'Revise los datos ingresados');
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await registrarMovimiento({
        productoId: productoId as number,
        tipo: tipo as TipoMovimiento,
        cantidad: Number(cantidad),
        costoUnitario: tipoElegido?.pideCosto ? costoNumero : null,
        motivo: motivo.trim() || null,
      });
      onRegistrado(respuesta);
    } catch (err) {
      // Ej. "La cantidad supera el stock actual (3)" si otro usuario movió el stock mientras tanto.
      const { mensaje, campos } = obtenerError(err);
      setErrorGeneral(mensaje);
      setErrores(campos as Errores);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onClose={enviando ? undefined : onCerrar} fullWidth maxWidth="sm" aria-labelledby="movimiento-titulo">
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle id="movimiento-titulo">Registrar movimiento de inventario</DialogTitle>
        <DialogContent>
          {!opciones && !errorCarga && <LinearProgress aria-label="Cargando opciones" />}
          {errorCarga && <Alert severity="error">{errorCarga}</Alert>}
          {opciones && <Stack spacing={2} sx={{ pt: 1 }}>
            {errorGeneral && <Alert severity="error">{errorGeneral}</Alert>}

            <TextField select label="Tipo de movimiento" required value={tipo} disabled={opciones.tipos.length === 1}
              onChange={(e) => cambiarTipo(e.target.value as TipoMovimiento)}
              error={!!errores.tipo} helperText={errores.tipo ?? (tipoElegido?.soloInsumos ? 'Solo insumos usados en los servicios.' : ' ')}>
              {opciones.tipos.map((t) => <MenuItem key={t.valor} value={t.valor}>{t.etiqueta} ({t.suma ? 'suma' : 'resta'})</MenuItem>)}
            </TextField>

            <Autocomplete
              options={productos}
              value={producto}
              onChange={(_, valor) => { setProductoId(valor?.idProducto ?? null); limpiar('productoId'); }}
              getOptionLabel={(p) => p.nombre}
              isOptionEqualToValue={(a, b) => a.idProducto === b.idProducto}
              noOptionsText={tipoElegido?.soloInsumos ? 'No hay insumos activos' : 'No hay productos activos'}
              renderOption={(props, p) => {
                const { key, ...resto } = props as typeof props & { key: string };
                return <li key={key} {...resto}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                    <span>{p.nombre}{p.tipo === 'INSUMO' ? ' (insumo)' : ''}</span>
                    <Typography variant="body2" color={p.stockActual <= p.stockMinimo ? 'warning.main' : 'text.secondary'}>
                      Stock {p.stockActual}
                    </Typography>
                  </Box>
                </li>;
              }}
              renderInput={(params) => <TextField {...params} label="Producto" required
                error={!!errores.productoId} helperText={errores.productoId ?? ' '} />}
            />

            <TextField label="Cantidad" required value={cantidad}
              onChange={(e) => { setCantidad(e.target.value); limpiar('cantidad'); }}
              error={!!errores.cantidad || (stockNuevo !== null && stockNuevo < 0)}
              helperText={errores.cantidad ?? (stockNuevo !== null && stockNuevo < 0 ? `Supera el stock actual (máximo ${producto?.stockActual})` : ' ')}
              slotProps={{ htmlInput: { inputMode: 'numeric' } }} />

            {tipoElegido?.pideCosto && <TextField label="Costo unitario" required value={costoUnitario}
              onChange={(e) => { setCostoUnitario(e.target.value); limpiar('costoUnitario'); }}
              error={!!errores.costoUnitario}
              helperText={errores.costoUnitario ?? 'Use 0 para una muestra o bonificación sin costo. Recalcula el costo promedio.'}
              slotProps={{ htmlInput: { inputMode: 'decimal' }, input: { startAdornment: <InputAdornment position="start">Bs</InputAdornment> } }} />}

            <TextField label="Motivo" required={!!tipoElegido?.pideMotivo} multiline minRows={2} value={motivo}
              onChange={(e) => { setMotivo(e.target.value); limpiar('motivo'); }}
              error={!!errores.motivo}
              helperText={errores.motivo ?? `${motivo.length}/${MAX_MOTIVO}${tipoElegido && !tipoElegido.pideMotivo ? ' (opcional)' : ''}`}
              slotProps={{ htmlInput: { maxLength: MAX_MOTIVO } }} />

            {producto && <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }} aria-live="polite">
              <Typography>
                Stock actual: <strong>{producto.stockActual}</strong>
                {stockNuevo !== null && <> → Stock después: <Box component="strong" sx={{
                  color: stockNuevo < 0 ? 'error.main' : stockNuevo <= producto.stockMinimo ? 'warning.main' : undefined,
                }}>{stockNuevo}</Box></>}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mínimo: {producto.stockMinimo} · Costo promedio: {moneda(producto.costoPromedio)}
                {costoTotal !== null && ` · Valor del movimiento: ${moneda(costoTotal)}`}
              </Typography>
              {stockNuevo !== null && stockNuevo >= 0 && stockNuevo <= producto.stockMinimo &&
                <Typography variant="body2" color="warning.main">Quedará en stock bajo.</Typography>}
            </Box>}
          </Stack>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={enviando}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={enviando} disabled={!opciones}>Registrar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
