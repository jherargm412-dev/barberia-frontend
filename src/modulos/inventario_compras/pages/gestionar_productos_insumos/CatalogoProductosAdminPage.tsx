import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import StoreIcon from '@mui/icons-material/StoreOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../../../shared/components/EmptyState';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { listarProductos } from '../../api/gestionar_productos_insumos/productosApi';
import CatalogoProductoDialog from '../../components/gestionar_productos_insumos/CatalogoProductoDialog';
import ImagenProductoPreview from '../../components/gestionar_productos_insumos/ImagenProductoPreview';
import { PERMISOS } from '../../constants/gestionar_productos_insumos';
import type { Producto, RespuestaProducto } from '../../types/gestionar_productos_insumos';
import { formatearMonto } from '../../utils/gestionar_productos_insumos/productoForm';

type Filtro = 'todos' | 'visibles' | 'ocultos';

/** Lo que ve el público (CU23): producto activo y marcado para mostrarse. */
function esVisible(p: Producto) {
  return p.activo && p.enCatalogo;
}

/** Por qué un producto no se ve en el catálogo público (null = sí se ve). */
function motivoOculto(p: Producto) {
  if (!p.activo) return 'Deshabilitado';
  if (!p.enCatalogo) return 'Oculto en catálogo';
  return null;
}

/**
 * CU22, vista "Catálogo de productos": solo los productos de venta, como tarjetas con su imagen,
 * para revisar de un vistazo qué ve el público (CU23) y gestionar imagen y visibilidad.
 * Con solo PRODUCTO_CONSULTAR (Recepcionista) es de solo lectura.
 */
export default function CatalogoProductosAdminPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const puedeGestionar = tienePermiso(PERMISOS.GESTIONAR);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [texto, setTexto] = useState('');
  const [gestionando, setGestionando] = useState<Producto | null>(null);

  useEffect(() => {
    listarProductos()
      .then((lista) => setProductos(lista.filter((p) => p.tipo === 'VENTA')))
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, []);

  const visibles = productos.filter(esVisible).length;
  const mostrados = useMemo(() => {
    const busqueda = texto.trim().toLowerCase();
    return productos
      .filter((p) => filtro === 'todos' || (filtro === 'visibles') === esVisible(p))
      .filter((p) => !busqueda || p.nombre.toLowerCase().includes(busqueda));
  }, [productos, filtro, texto]);

  function actualizado({ producto }: RespuestaProducto) {
    setProductos((lista) => lista.map((p) => (p.idProducto === producto.idProducto ? producto : p)));
  }

  return (
    <>
      <PageHeader
        title="Catálogo de productos"
        description="Productos de venta tal como se muestran en la página pública. Gestiona su imagen y si aparecen o no."
        action={
          <Button variant="outlined" startIcon={<OpenInNewIcon />} href="/catalogo/productos" target="_blank" rel="noopener">
            Ver catálogo público
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {cargando && <LinearProgress sx={{ mb: 2 }} />}

      {!cargando && !error && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, alignItems: { sm: 'center' } }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={filtro}
            onChange={(_, valor: Filtro | null) => valor && setFiltro(valor)}
            aria-label="Filtrar por visibilidad"
          >
            <ToggleButton value="todos">Todos ({productos.length})</ToggleButton>
            <ToggleButton value="visibles">Visibles ({visibles})</ToggleButton>
            <ToggleButton value="ocultos">No visibles ({productos.length - visibles})</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            size="small"
            label="Buscar por nombre"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            sx={{ flex: 1, maxWidth: { sm: 320 } }}
          />
        </Stack>
      )}

      {!cargando && !error && mostrados.length === 0 && (
        <EmptyState
          icon={<StoreIcon />}
          title={productos.length === 0 ? 'No hay productos de venta' : 'Ningún producto coincide'}
          description={
            productos.length === 0
              ? 'Registra un ítem de tipo «Producto» en Productos e insumos para que aparezca aquí.'
              : 'Prueba con otro filtro o nombre.'
          }
        />
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {mostrados.map((p) => {
          const motivo = motivoOculto(p);
          return (
            <Card key={p.idProducto} variant="outlined" sx={{ display: 'flex', flexDirection: 'column', opacity: motivo ? 0.75 : 1 }}>
              <Box sx={{ p: 1 }}>
                <ImagenProductoPreview idProducto={p.idProducto} version={p.imagenVersion} nombre={p.nombre} alto={160} />
              </Box>
              <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{p.nombre}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, overflowWrap: 'anywhere' }}>
                  {p.descripcion?.trim() || 'Sin descripción'}
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>{formatearMonto(p.precioVenta)}</Typography>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={motivo ?? 'Visible'} color={motivo ? 'default' : 'success'} variant={motivo ? 'outlined' : 'filled'} />
                  <Chip size="small" variant="outlined" label={p.stockActual > 0 ? `Stock: ${p.stockActual}` : 'Agotado'} color={p.stockActual > 0 ? 'default' : 'warning'} />
                </Stack>
              </CardContent>
              {puedeGestionar && (
                <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                  <Button size="small" variant="contained" startIcon={<StorefrontIcon />} onClick={() => setGestionando(p)}>
                    Imagen y visibilidad
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => navigate(`/productos/${p.idProducto}/editar`)}>
                    Editar
                  </Button>
                </CardActions>
              )}
            </Card>
          );
        })}
      </Box>

      <CatalogoProductoDialog
        key={gestionando?.idProducto ?? 'cerrado'}
        producto={gestionando}
        onCerrar={() => setGestionando(null)}
        onActualizado={actualizado}
      />
    </>
  );
}
