import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { BarraPublica } from '../../../servicios_reservas';
import { listarCatalogoProductos } from '../../api/consultar_catalogo_productos/catalogoProductosApi';
import ProductoCard from '../../components/consultar_catalogo_productos/ProductoCard';
import type { FiltrosCatalogoProductos, ProductoCatalogo } from '../../types/consultar_catalogo_productos';

const SIN_FILTROS: FiltrosCatalogoProductos = { q: '', precioMin: '', precioMax: '' };

/**
 * CU23: Consultar Catálogo de Productos. Vista pública (con o sin sesión) de los productos de venta activos:
 * 1) tarjetas con nombre, descripción, precio y disponibilidad; 2) búsqueda por texto y rango de precio.
 */
export default function ConsultarProductosPage() {
  const navigate = useNavigate();

  // Lo que se escribe en el formulario y lo último que se consultó (se aplica con "Buscar").
  const [escritos, setEscritos] = useState<FiltrosCatalogoProductos>(SIN_FILTROS);
  const [filtros, setFiltros] = useState<FiltrosCatalogoProductos>(SIN_FILTROS);
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogoProductos(filtros)
      .then((data) => vigente && setProductos(data))
      .catch((err) => {
        if (!vigente) return;
        // Un filtro inválido (p. ej. mínimo mayor que el máximo) trae su campo; si no, error de conexión.
        const { mensaje, campos } = obtenerError(err);
        setError(
          Object.keys(campos).length > 0 ? mensaje : 'No se pudo cargar el catálogo de productos. Intente nuevamente.',
        );
        setProductos([]);
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');
    setFiltros({ ...escritos });
  }

  function limpiar() {
    setEscritos(SIN_FILTROS);
    setCargando(true);
    setError('');
    setFiltros(SIN_FILTROS);
  }

  const hayFiltros = filtros.q.trim() !== '' || filtros.precioMin !== '' || filtros.precioMax !== '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <BarraPublica />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            Volver al inicio
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', flex: 1 }}>
            Nuestros Productos
          </Typography>
          <Button onClick={() => navigate('/catalogo')}>Ver servicios</Button>
        </Box>

        {/* Paso 2: búsqueda por texto y rango de precio */}
        <Paper
          component="form"
          onSubmit={buscar}
          noValidate
          sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
        >
          <TextField
            label="Buscar producto"
            placeholder="Nombre o descripción"
            value={escritos.q}
            onChange={(e) => setEscritos({ ...escritos, q: e.target.value })}
            sx={{ flex: '1 1 240px' }}
          />
          <TextField
            label="Precio mínimo (Bs)"
            type="number"
            value={escritos.precioMin}
            onChange={(e) => setEscritos({ ...escritos, precioMin: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: { xs: '100%', sm: 170 } }}
          />
          <TextField
            label="Precio máximo (Bs)"
            type="number"
            value={escritos.precioMax}
            onChange={(e) => setEscritos({ ...escritos, precioMax: e.target.value })}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: { xs: '100%', sm: 170 } }}
          />
          <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
            Buscar
          </Button>
          {hayFiltros && <Button onClick={limpiar}>Limpiar filtros</Button>}
        </Paper>

        {cargando && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!cargando && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!cargando && !error && productos.length === 0 && (
          <Alert severity="info">
            {hayFiltros ? 'Ningún producto coincide con la búsqueda.' : 'No hay productos disponibles por el momento.'}
          </Alert>
        )}

        {!cargando && !error && productos.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {productos.map((producto) => (
              <ProductoCard key={producto.idProducto} producto={producto} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
